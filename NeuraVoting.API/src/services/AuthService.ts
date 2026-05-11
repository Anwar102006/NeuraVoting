import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);
    private jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_neuravoting';

    async registerUser(userData: Partial<User>): Promise<Omit<User, 'passwordHash'>> {
        const { username, email, passwordHash, role, firstName, lastName } = userData;

        const existingUser = await this.userRepository.findOne({
            where: [
                { username: username }, 
                { email: email }
            ]
        });

        if (existingUser) {
            throw new Error('Username or email already exists');
        }

        const hashedPassword = await bcrypt.hash(passwordHash!, 10);
        
        const user = this.userRepository.create({
            username,
            email,
            passwordHash: hashedPassword,
            role,
            firstName,
            lastName
        });

        const savedUser = await this.userRepository.save(user);
        
        // Exclude the password hash from the returned object
        const { passwordHash: _, ...userWithoutPassword } = savedUser;
        return userWithoutPassword;
    }

    async login(username: string, password: string): Promise<{ token: string, user: Omit<User, 'passwordHash'> }> {
        const user = await this.userRepository.findOne({ where: { username } });

        if (!user || !user.isActive) {
            throw new Error('Invalid credentials or inactive account');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token containing the user's ID and Role
        const token = jwt.sign(
            { userId: user.userId, role: user.role },
            this.jwtSecret,
            { expiresIn: '1d' }
        );

        const { passwordHash: _, ...userWithoutPassword } = user;
        
        return { token, user: userWithoutPassword };
    }
}
