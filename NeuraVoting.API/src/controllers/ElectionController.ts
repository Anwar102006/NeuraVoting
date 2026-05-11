import { Request, Response } from 'express';
import { ElectionService } from '../services/ElectionService';

const electionService = new ElectionService();

export class ElectionController {
    /**
     * Add a new Election
     */
    static async create(req: Request, res: Response) {
        try {
            // Extracted from JWT via requireAuth middleware
            const adminUserId = req.user?.userId; 
            
            if (!adminUserId) {
                return res.status(401).json({ error: 'Unauthorized: Admin user ID missing.' });
            }

            const election = await electionService.createElection(req.body, adminUserId);
            return res.status(201).json({ message: 'Election created successfully', data: election });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * View all Elections
     */
    static async getAll(req: Request, res: Response) {
        try {
            const elections = await electionService.getElections();
            return res.status(200).json({ data: elections });
        } catch (error: any) {
            return res.status(500).json({ error: 'Internal server error while fetching elections.' });
        }
    }

    /**
     * View a single Election by ID
     */
    static async getById(req: Request, res: Response) {
        try {
            const electionId = parseInt(req.params.id, 10);
            if (isNaN(electionId)) return res.status(400).json({ error: 'Invalid Election ID parameter.' });

            const election = await electionService.getElectionById(electionId);
            
            if (!election) return res.status(404).json({ error: 'Election not found.' });
            
            return res.status(200).json({ data: election });
        } catch (error: any) {
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }

    /**
     * Update an existing Election
     */
    static async update(req: Request, res: Response) {
        try {
            const electionId = parseInt(req.params.id, 10);
            if (isNaN(electionId)) return res.status(400).json({ error: 'Invalid Election ID parameter.' });

            const updatedElection = await electionService.updateElection(electionId, req.body);
            return res.status(200).json({ message: 'Election updated successfully', data: updatedElection });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    /**
     * Delete an Election safely
     */
    static async delete(req: Request, res: Response) {
        try {
            const electionId = parseInt(req.params.id, 10);
            if (isNaN(electionId)) return res.status(400).json({ error: 'Invalid Election ID parameter.' });

            await electionService.deleteElection(electionId);
            return res.status(200).json({ message: 'Election deleted successfully' });
        } catch (error: any) {
            // Will return 400 if the delete is blocked due to existing votes
            return res.status(400).json({ error: error.message });
        }
    }
}
