import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { RegisterUserDto } from '../dtos/RegisterUserDto';
import * as bcrypt from 'bcryptjs';

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    /**
     * Registers a new user with KYC verification (Government ID)
     */
    async registerWithKyc(dto: RegisterUserDto): Promise<Omit<User, 'passwordHash'>> {
        // 1. Check if username or email is already taken
        const existingUser = await this.userRepository.findOne({
            where: [
                { username: dto.username }, 
                { email: dto.email }
            ]
        });

        if (existingUser) {
            throw new Error('Username or email is already registered.');
        }

        // 2. Validate Government ID format (Example: 8-12 alphanumeric characters)
        const govIdRegex = /^[A-Z0-9]{8,12}$/i;
        if (!govIdRegex.test(dto.governmentId)) {
            throw new Error('Invalid Government ID format. Must be 8 to 12 alphanumeric characters.');
        }

        // 3. Check if Government ID has already been registered
        const existingGovId = await this.userRepository.findOne({
            where: { governmentId: dto.governmentId }
        });

        if (existingGovId) {
            throw new Error('This Government ID is already registered in the system.');
        }

        // 4. Secure the password
        const hashedPassword = await bcrypt.hash(dto.passwordHash, 10);

        // 5. Create the new user
        // The entity defaults role to 'Voter' (if omitted) or we enforce it here, 
        // and verificationStatus defaults to 'Pending Verification'.
        const newUser = this.userRepository.create({
            username: dto.username,
            email: dto.email,
            passwordHash: hashedPassword,
            firstName: dto.firstName,
            lastName: dto.lastName,
            governmentId: dto.governmentId,
            role: 'Voter', 
            verificationStatus: 'Pending Verification',
            isActive: true
        });

        const savedUser = await this.userRepository.save(newUser);

        // 6. Return without exposing the password hash
        const { passwordHash: _, ...safeUser } = savedUser;
        return safeUser;
    }
}
