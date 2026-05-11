import { Request, Response } from 'express';
import { VoterDashboardService } from '../services/VoterDashboardService';

const dashboardService = new VoterDashboardService();

export class VoterDashboardController {
    /**
     * Retrieves the single payload for the Voter Dashboard
     * containing Profile, Pending Elections, and Participated Elections.
     */
    static async getDashboard(req: Request, res: Response) {
        try {
            // Extracted from JWT token via requireAuth middleware
            const userId = req.user?.userId;
            
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized: Missing User Context.' });
            }

            const payload = await dashboardService.getDashboardData(userId);
            
            return res.status(200).json({ data: payload });
        } catch (error: any) {
            return res.status(500).json({ error: 'Internal Server Error while aggregating dashboard data.', details: error.message });
        }
    }
}
