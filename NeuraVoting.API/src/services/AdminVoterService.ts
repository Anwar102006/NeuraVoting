import { AppDataSource } from '../config/database';
import { User } from '../models/User';

export class AdminVoterService {
    private userRepository = AppDataSource.getRepository(User);

    /**
     * View all voters requiring KYC approval
     */
    async getPendingVoters(): Promise<User[]> {
        return await this.userRepository.find({
            where: { 
                role: 'Voter',
                verificationStatus: 'Pending Verification' 
            },
            select: ['userId', 'username', 'email', 'firstName', 'lastName', 'governmentId', 'verificationStatus', 'createdAt'] // Exclude passwordHash
        });
    }

    /**
     * Approves or rejects a voter's KYC status
     */
    async updateVoterVerificationStatus(userId: number, status: 'Verified' | 'Rejected'): Promise<User> {
        const user = await this.userRepository.findOne({ where: { userId, role: 'Voter' } });
        if (!user) throw new Error('Voter not found');

        user.verificationStatus = status;
        const updatedUser = await this.userRepository.save(user);
        
        const { passwordHash: _, ...safeUser } = updatedUser;
        return safeUser as User;
    }
}
