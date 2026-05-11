import { AppDataSource } from '../config/database';
import { Candidate } from '../models/Candidate';
import { Vote } from '../models/Vote';
import { Election } from '../models/Election';

export class CandidateService {
    private candidateRepository = AppDataSource.getRepository(Candidate);
    private voteRepository = AppDataSource.getRepository(Vote);
    private electionRepository = AppDataSource.getRepository(Election);

    async addCandidate(data: Partial<Candidate>): Promise<Candidate> {
        // Ensure election exists
        const election = await this.electionRepository.findOne({ where: { electionId: data.electionId } });
        if (!election) throw new Error('Cannot add candidate. Target election does not exist.');

        const candidate = this.candidateRepository.create(data);
        return await this.candidateRepository.save(candidate);
    }

    async getCandidatesByElection(electionId: number): Promise<Candidate[]> {
        return await this.candidateRepository.find({ where: { electionId } });
    }

    async updateCandidate(candidateId: number, data: Partial<Candidate>): Promise<Candidate> {
        const candidate = await this.candidateRepository.findOne({ where: { candidateId } });
        if (!candidate) throw new Error('Candidate not found');

        Object.assign(candidate, data);
        return await this.candidateRepository.save(candidate);
    }

    async deleteCandidate(candidateId: number): Promise<void> {
        const candidate = await this.candidateRepository.findOne({ where: { candidateId } });
        if (!candidate) throw new Error('Candidate not found');

        // Prevent deletion if votes are linked to this candidate
        const voteCount = await this.voteRepository.count({ where: { candidateId } });
        if (voteCount > 0) {
            throw new Error('Cannot delete candidate. Votes have already been cast for them in the ledger.');
        }

        await this.candidateRepository.remove(candidate);
    }
}
