import * as crypto from 'crypto';

export interface BlockData {
    blockIndex: number;
    timestamp: Date | string;
    voterId: string;
    candidateId: number;
    previousHash: string;
}

export class HashUtility {
    /**
     * Pure function that generates a SHA-256 hash for a given block's data.
     * It ensures the inputs are consistently serialized before hashing.
     */
    static generateBlockHash(data: BlockData): string {
        // Normalize the timestamp to a strict ISO string format to ensure mathematical consistency
        const timestampStr = data.timestamp instanceof Date 
            ? data.timestamp.toISOString() 
            : new Date(data.timestamp).toISOString();

        // Serialize consistently by concatenating values with a delimiter '|'
        // This ensures JSON key ordering or formatting doesn't alter the final hash
        const serializedData = `${data.blockIndex}|${timestampStr}|${data.voterId}|${data.candidateId}|${data.previousHash}`;

        // Generate and return the SHA-256 hash in hexadecimal format
        return crypto
            .createHash('sha256')
            .update(serializedData)
            .digest('hex');
    }

    /**
     * Generates a secure, anonymized SHA-256 hash for a voter.
     * This is used to map a user to a vote without exposing their identity.
     */
    static generateVoterHash(userId: number, electionId: number, systemSecret: string): string {
        const serializedData = `${userId}|${electionId}|${systemSecret}`;
        
        return crypto
            .createHash('sha256')
            .update(serializedData)
            .digest('hex');
    }
}
