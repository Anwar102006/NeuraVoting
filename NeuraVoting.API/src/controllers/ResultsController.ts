import { Request, Response } from 'express';
import { ResultsService } from '../services/ResultsService';

const resultsService = new ResultsService();

export class ResultsController {
    /**
     * Endpoint for Voters to view the winner of a completed election.
     * Enforces anonymity and strict result mapping.
     */
    static async viewWinner(req: Request, res: Response) {
        try {
            const electionId = parseInt(req.params.electionId, 10);
            
            if (isNaN(electionId)) {
                return res.status(400).json({ error: 'Valid Election ID is required as a route parameter.' });
            }

            // The service inherently blocks access to non-completed elections
            const payload = await resultsService.getElectionWinner(electionId);
            
            return res.status(200).json({ data: payload });
        } catch (error: any) {
            // Differentiate between 403 Forbidden (not completed) and 404 (not found)
            if (error.message.includes('Access Denied')) {
                return res.status(403).json({ error: error.message });
            } else if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Internal Server Error while tallying results.' });
        }
    }
}
