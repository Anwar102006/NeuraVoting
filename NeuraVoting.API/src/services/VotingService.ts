import { AppDataSource } from '../config/database';
import { Vote } from '../models/Vote';
import { HashUtility, BlockData } from '../utils/HashUtility';

export class VotingService {
    /**
     * Casts a vote securely and appends it to the blockchain ledger using ACID transactions
     * to prevent race conditions when multiple users vote simultaneously.
     */
    async castVote(electionId: number, candidateId: number, rawUserId: number): Promise<Vote> {
        // QueryRunner provides an isolated database connection for the transaction
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        
        // Start the transaction with SERIALIZABLE isolation level to prevent phantom reads
        // Alternatively, pessimistic write locks are used below.
        await queryRunner.startTransaction('SERIALIZABLE');

        try {
            // 1. Generate the anonymized voterId hash to protect privacy
            const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_neuravoting';
            const voterHash = HashUtility.generateVoterHash(rawUserId, electionId, secret);

            // Double check if user has already voted
            const existingVote = await queryRunner.manager.findOne(Vote, {
                where: { electionId, voterId: voterHash }
            });

            if (existingVote) {
                throw new Error('You have already cast a vote in this election.');
            }

            // 2. Fetch the last block in the chain for this election.
            // Using a 'pessimistic_write' lock forces other concurrent transactions to wait 
            // until this transaction commits before they can read/write the last block.
            // This totally eliminates race conditions for the blockIndex.
            const lastBlock = await queryRunner.manager.findOne(Vote, {
                where: { electionId },
                order: { blockIndex: 'DESC' },
                lock: { mode: 'pessimistic_write' }
            });

            // Calculate the next sequence index
            const newBlockIndex = lastBlock ? lastBlock.blockIndex + 1 : 1;
            
            // For the genesis block (first vote), previousHash is an empty 64-char zero string
            const previousHash = lastBlock ? lastBlock.currentHash : '0'.repeat(64);
            const currentTimestamp = new Date();

            // 3. Create the block payload and generate the cryptographic currentHash
            const blockData: BlockData = {
                blockIndex: newBlockIndex,
                timestamp: currentTimestamp,
                voterId: voterHash,
                candidateId: candidateId,
                previousHash: previousHash
            };

            const currentHash = HashUtility.generateBlockHash(blockData);

            // 4. Instantiate and save the new block to the database
            const newVote = queryRunner.manager.create(Vote, {
                electionId,
                blockIndex: newBlockIndex,
                voterId: voterHash,
                candidateId,
                previousHash,
                currentHash,
                timestamp: currentTimestamp
            });

            await queryRunner.manager.save(newVote);

            // Commit the transaction - lock is released here
            await queryRunner.commitTransaction();

            return newVote;
        } catch (error) {
            // Rollback immediately if anything (like a deadlock or validation) goes wrong
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Always release the connection back to the pool
            await queryRunner.release();
        }
    }
}
