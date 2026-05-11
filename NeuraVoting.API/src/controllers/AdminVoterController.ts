import { Request, Response } from 'express';
import { AdminVoterService } from '../services/AdminVoterService';

const adminVoterService = new AdminVoterService();

export class AdminVoterController {
    static async getPending(req: Request, res: Response) {
        try {
            const pendingVoters = await adminVoterService.getPendingVoters();
            return res.status(200).json({ data: pendingVoters });
        } catch (error: any) {
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }

    static async verify(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id, 10);
            const { status } = req.body;

            if (isNaN(userId)) return res.status(400).json({ error: 'Invalid User ID.' });
            if (status !== 'Verified' && status !== 'Rejected') {
                return res.status(400).json({ error: 'Status must be Verified or Rejected.' });
            }

            const updatedVoter = await adminVoterService.updateVoterVerificationStatus(userId, status);
            return res.status(200).json({ message: `Voter status updated to ${status}`, data: updatedVoter });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
