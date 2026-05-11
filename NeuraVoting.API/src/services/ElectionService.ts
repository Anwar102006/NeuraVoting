import { AppDataSource } from '../config/database';
import { Election } from '../models/Election';
import { Vote } from '../models/Vote';

export class ElectionService {
    private electionRepository = AppDataSource.getRepository(Election);
    private voteRepository = AppDataSource.getRepository(Vote);

    /**
     * Creates a new election
     */
    async createElection(data: Partial<Election>, adminUserId: number): Promise<Election> {
        const election = this.electionRepository.create({
            ...data,
            createdByUserId: adminUserId,
            // Automatically maps 'Pending' to the DB's 'Upcoming' constraint if needed
            status: data.status === 'Pending' ? 'Upcoming' : (data.status || 'Upcoming')
        });

        return await this.electionRepository.save(election);
    }

    /**
     * Fetches all elections ordered by start date
     */
    async getElections(): Promise<Election[]> {
        return await this.electionRepository.find({ order: { startDate: 'DESC' } });
    }

    /**
     * Fetches a single election by ID
     */
    async getElectionById(electionId: number): Promise<Election | null> {
        return await this.electionRepository.findOne({ where: { electionId } });
    }

    /**
     * Updates an existing election
     */
    async updateElection(electionId: number, data: Partial<Election>): Promise<Election> {
        const election = await this.getElectionById(electionId);
        if (!election) throw new Error('Election not found');

        Object.assign(election, data);
        
        // Ensure mapping aligns with DB constraints
        if (election.status === 'Pending') election.status = 'Upcoming';

        return await this.electionRepository.save(election);
    }

    /**
     * Deletes an election safely by first checking for dependencies (votes)
     */
    async deleteElection(electionId: number): Promise<void> {
        const election = await this.getElectionById(electionId);
        if (!election) throw new Error('Election not found');

        // Core Requirement: Prevent deletion of an election if votes have already been cast
        const voteCount = await this.voteRepository.count({ where: { electionId } });
        
        if (voteCount > 0) {
            throw new Error(`Cannot delete this election. ${voteCount} votes have already been cryptographically cast on the ledger.`);
        }

        await this.electionRepository.remove(election);
    }
}
