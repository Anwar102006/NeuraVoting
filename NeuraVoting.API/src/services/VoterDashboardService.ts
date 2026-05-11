import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Election } from '../models/Election';
import { Vote } from '../models/Vote';
import { HashUtility } from '../utils/HashUtility';
import { In } from 'typeorm';

export class VoterDashboardService {
    private userRepository = AppDataSource.getRepository(User);
    private electionRepository = AppDataSource.getRepository(Election);
    private voteRepository = AppDataSource.getRepository(Vote);

    /**
     * Aggregates profile, pending, and participated elections for a specific voter.
     */
    async getDashboardData(userId: number) {
        // 1. Fetch User Profile cleanly (excluding passwordHash)
        const user = await this.userRepository.findOne({
            where: { userId },
            select: ['userId', 'username', 'email', 'firstName', 'lastName', 'governmentId', 'verificationStatus', 'createdAt']
        });

        if (!user) throw new Error('User not found');

        const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_neuravoting';

        // 2. Fetch all Active or Upcoming elections
        const allElections = await this.electionRepository.find({
            where: [
                { status: 'Active' },
                { status: 'Upcoming' },
                { status: 'Completed' } // Including completed so users can see history
            ],
            order: { startDate: 'DESC' }
        });

        const pendingElections: Election[] = [];
        const participatedElections: Election[] = [];

        // Optimization: Pre-calculate all possible voter hashes for the fetched elections
        // This avoids making N database calls in a loop.
        const hashStrings = allElections.map(election => 
            HashUtility.generateVoterHash(userId, election.electionId, secret)
        );

        // 3. Batch query the Blockchain Ledger to see which hashes actually exist
        const userVotes = hashStrings.length > 0 ? await this.voteRepository.find({
            where: { voterId: In(hashStrings) },
            select: ['electionId', 'timestamp'] // We only need to know they participated
        }) : [];

        const votedElectionIds = new Set(userVotes.map(vote => vote.electionId));

        // Group the elections
        for (const election of allElections) {
            if (votedElectionIds.has(election.electionId)) {
                participatedElections.push(election);
            } else if (election.status !== 'Completed') {
                // We only show Active/Upcoming as pending, not Completed
                pendingElections.push(election);
            }
        }

        return {
            profile: user,
            pendingElections,
            participatedElections
        };
    }
}
