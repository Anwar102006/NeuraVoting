import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
    
    static async register(req: Request, res: Response) {
        try {
            const user = await authService.registerUser(req.body);
            return res.status(201).json({ message: 'User registered successfully', user });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            const result = await authService.login(username, password);
            return res.status(200).json({ message: 'Login successful', ...result });
        } catch (error: any) {
            return res.status(401).json({ error: error.message });
        }
    }
}
