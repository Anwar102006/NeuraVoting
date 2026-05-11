import { AppDataSource } from '../config/database';
import { Election } from '../models/Election';
import { Vote } from '../models/Vote';
import { Candidate } from '../models/Candidate';

export class ResultsService {
    private electionRepository = AppDataSource.getRepository(Election);
    private voteRepository = AppDataSource.getRepository(Vote);
    private candidateRepository = AppDataSource.getRepository(Candidate);

    /**
     * Tallies the blockchain ledger to determine the winner of a completed election.
     * Enforces strict anonymity rules by stripping all numeric data from the output.
     */
    async getElectionWinner(electionId: number): Promise<{ electionId: number, winnerName: string }> {
        // 1. Fetch Election and ensure its status is strictly "Completed"
        const election = await this.electionRepository.findOne({ where: { electionId } });

        if (!election) {
            throw new Error('Election not found.');
        }

        if (election.status !== 'Completed') {
            throw new Error('Access Denied: Results are strictly hidden until the election status is marked as Completed.');
        }

        // 2. Tally the votes securely by aggregating the blocks from the ledger
        // This utilizes a fast SQL GROUP BY to count votes per candidate
        const tallyResults = await this.voteRepository
            .createQueryBuilder('vote')
            .select('vote.candidateId', 'candidateId')
            .addSelect('COUNT(vote.blockIndex)', 'voteCount')
            .where('vote.electionId = :electionId', { electionId })
            .groupBy('vote.candidateId')
            .orderBy('voteCount', 'DESC')
            .getRawMany();

        if (tallyResults.length === 0) {
            return {
                electionId: election.electionId,
                winnerName: 'No Winner - No votes were cast.'
            };
        }

        // 3. The first item in the descending array is the winner
        // (In a real-world edge case, tie-breaking logic would be handled here)
        const winnerCandidateId = parseInt(tallyResults[0].candidateId, 10);

        // Fetch the winning candidate's profile to retrieve their human-readable name
        const candidate = await this.candidateRepository.findOne({
            where: { candidateId: winnerCandidateId }
        });

        const winnerName = candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown Candidate';

        // 4. Return strictly the requested mapping without any vote counts or ratios
        return {
            electionId: election.electionId,
            winnerName: winnerName
        };
    }
}
