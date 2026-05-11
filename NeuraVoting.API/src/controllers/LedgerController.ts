import { Request, Response } from 'express';
import { LedgerService } from '../services/LedgerService';

const ledgerService = new LedgerService();

export class LedgerController {
    /**
     * Admin endpoint to trigger a full cryptographic verification of an election's ledger.
     */
    static async verifyLedger(req: Request, res: Response) {
        try {
            const electionId = parseInt(req.params.electionId, 10);

            if (isNaN(electionId)) {
                return res.status(400).json({ error: 'Valid Election ID is required as a route parameter.' });
            }

            const result = await ledgerService.verifyElectionLedger(electionId);

            if (result.isValid) {
                return res.status(200).json({
                    message: 'Ledger Integrity Verified. No tampering detected.',
                    data: result
                });
            } else {
                // Return a 409 Conflict to signal a compromised state
                return res.status(409).json({
                    error: 'CRITICAL SECURITY ALERT: Ledger Tampering Detected!',
                    data: result
                });
            }
        } catch (error: any) {
            return res.status(500).json({ error: 'Internal Server Error during verification.', details: error.message });
        }
    }
}
