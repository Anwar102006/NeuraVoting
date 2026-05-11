import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { RegisterUserDto } from '../dtos/RegisterUserDto';

const userService = new UserService();

export class RegistrationController {
    /**
     * Handles POST /register endpoint
     * Expects a JSON body matching RegisterUserDto
     */
    static async registerVoter(req: Request, res: Response) {
        try {
            const dto: RegisterUserDto = req.body;

            // Basic payload validation
            if (!dto.username || !dto.email || !dto.passwordHash || !dto.firstName || !dto.lastName || !dto.governmentId) {
                return res.status(400).json({ error: 'All fields including governmentId are required.' });
            }

            const newUser = await userService.registerWithKyc(dto);

            return res.status(201).json({
                message: 'Registration successful. Your account is pending KYC verification.',
                user: newUser
            });
        } catch (error: any) {
            // Distinguish between validation/duplicate errors (400) and server errors (500)
            return res.status(400).json({ error: error.message });
        }
    }
}
