import { AppDataSource } from '../config/database';
import { Vote } from '../models/Vote';
import { HashUtility, BlockData } from '../utils/HashUtility';

export interface VerificationResult {
    isValid: boolean;
    totalBlocks: number;
    errorBlockIndex?: number;
    errorMessage?: string;
}

export class LedgerService {
    private voteRepository = AppDataSource.getRepository(Vote);

    /**
     * Iterates through the entire blockchain for a specific election
     * and strictly verifies its cryptographic integrity.
     */
    async verifyElectionLedger(electionId: number): Promise<VerificationResult> {
        // 1. Pull all votes for the election, sequentially ordered by blockIndex
        const ledger = await this.voteRepository.find({
            where: { electionId },
            order: { blockIndex: 'ASC' }
        });

        if (ledger.length === 0) {
            return {
                isValid: true,
                totalBlocks: 0,
                errorMessage: 'No votes cast in this election yet.'
            };
        }

        // Genesis previousHash expectation
        let expectedPreviousHash = '0'.repeat(64); 

        // 2. Iterate through the chain sequentially
        for (let i = 0; i < ledger.length; i++) {
            const currentBlock = ledger[i];

            // 4. Verify chain linkage: ensure the block's previousHash matches the preceding block's currentHash
            if (currentBlock.previousHash !== expectedPreviousHash) {
                return {
                    isValid: false,
                    totalBlocks: ledger.length,
                    errorBlockIndex: currentBlock.blockIndex,
                    errorMessage: `Chain broken! Block ${currentBlock.blockIndex}'s previous hash does not match the preceding block.`
                };
            }

            // 3. Recalculate the current block's hash using the exact same pure utility function
            const blockData: BlockData = {
                blockIndex: currentBlock.blockIndex,
                timestamp: currentBlock.timestamp,
                voterId: currentBlock.voterId,
                candidateId: currentBlock.candidateId,
                previousHash: currentBlock.previousHash
            };

            const recalculatedHash = HashUtility.generateBlockHash(blockData);

            // Compare recalculated hash against the stored hash
            if (recalculatedHash !== currentBlock.currentHash) {
                return {
                    isValid: false,
                    totalBlocks: ledger.length,
                    errorBlockIndex: currentBlock.blockIndex,
                    errorMessage: `Data Tampering Detected! Block ${currentBlock.blockIndex}'s payload was modified post-insertion.`
                };
            }

            // Update pointer for the next iteration
            expectedPreviousHash = currentBlock.currentHash;
        }

        // 5. If it reaches here without returning, the entire chain is cryptographically intact
        return {
            isValid: true,
            totalBlocks: ledger.length
        };
    }
}
