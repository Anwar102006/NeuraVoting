import { Request, Response } from 'express';
import { CandidateService } from '../services/CandidateService';

const candidateService = new CandidateService();

export class CandidateController {
    static async add(req: Request, res: Response) {
        try {
            const candidate = await candidateService.addCandidate(req.body);
            return res.status(201).json({ message: 'Candidate added successfully', data: candidate });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async getByElection(req: Request, res: Response) {
        try {
            const electionId = parseInt(req.params.electionId, 10);
            if (isNaN(electionId)) return res.status(400).json({ error: 'Invalid Election ID.' });

            const candidates = await candidateService.getCandidatesByElection(electionId);
            return res.status(200).json({ data: candidates });
        } catch (error: any) {
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const candidateId = parseInt(req.params.id, 10);
            if (isNaN(candidateId)) return res.status(400).json({ error: 'Invalid Candidate ID.' });

            const updatedCandidate = await candidateService.updateCandidate(candidateId, req.body);
            return res.status(200).json({ message: 'Candidate updated successfully', data: updatedCandidate });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const candidateId = parseInt(req.params.id, 10);
            if (isNaN(candidateId)) return res.status(400).json({ error: 'Invalid Candidate ID.' });

            await candidateService.deleteCandidate(candidateId);
            return res.status(200).json({ message: 'Candidate deleted successfully' });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
