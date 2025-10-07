import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import jwt from 'jsonwebtoken';
import { IUserResponse } from '../models/user.model';

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, email, password, confirmPassword } = req.body;

            // Validation
            if (!username || !email || !password || !confirmPassword) {
                res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
                return;
            }

            if (password !== confirmPassword) {
                res.status(400).json({
                    success: false,
                    message: 'Passwords do not match'
                });
                return;
            }

            if (password.length < 6) {
                res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
                return;
            }

            // Create user
            const user = await userService.create({
                username,
                email,
                password,
                roles: ['user']
            });

            // Generate tokens
            const accessToken = jwt.sign(
                {
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1h' }
            );

            const refreshToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user,
                    accessToken,
                    refreshToken
                }
            });
        } catch (error: any) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { username, password } = req.body;

            // Validation
            if (!username || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Username and password are required'
                });
                return;
            }

            // Find user by username or email
            let user = await userService.findByUsername(username);
            if (!user) {
                user = await userService.findByEmail(username);
            }

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            // Validate password
            const validUser = await userService.validatePasswordForUser(user, password);
            if (!validUser) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            // Check if user is active
            if (!validUser.isActive) {
                res.status(403).json({
                    success: false,
                    message: 'Your account has been locked. Please contact administrator.'
                });
                return;
            }

            // Update last login
            await userService.updateLastLogin(validUser._id!.toString());

            // Generate tokens
            const accessToken = jwt.sign(
                {
                    userId: validUser._id,
                    username: validUser.username,
                    email: validUser.email,
                    roles: validUser.roles
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1h' }
            );

            const refreshToken = jwt.sign(
                { userId: validUser._id },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            const userResponse = {
                _id: validUser._id!.toString(),
                username: validUser.username,
                email: validUser.email,
                roles: validUser.roles,
                groups: validUser.groups?.map(id => id.toString()) || [],
                isActive: validUser.isActive,
                createdAt: validUser.createdAt.toISOString(),
                updatedAt: validUser.updatedAt.toISOString(),
                lastLogin: validUser.lastLogin?.toISOString(),
                avatar: validUser.avatar,
                bio: validUser.bio,
                phone: validUser.phone,
                address: validUser.address
            };

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userResponse,
                    accessToken,
                    refreshToken
                }
            });
        } catch (error: any) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    static async refresh(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: 'Refresh token is required'
                });
                return;
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key') as any;

            // Get user
            const user = await userService.findById(decoded.userId);
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
                return;
            }

            // Check if user is active
            if (!user.isActive) {
                res.status(403).json({
                    success: false,
                    message: 'Your account has been locked. Please contact administrator.'
                });
                return;
            }

            // Generate new access token
            const accessToken = jwt.sign(
                {
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1h' }
            );

            // Generate new refresh token
            const newRefreshToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        roles: user.roles,
                        groups: user.groups,
                        isActive: user.isActive,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                        lastLogin: user.lastLogin,
                        avatar: user.avatar,
                        bio: user.bio,
                        phone: user.phone,
                        address: user.address
                    },
                    accessToken,
                    refreshToken: newRefreshToken
                }
            });
        } catch (error: any) {
            console.error('Refresh error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
    }

    static async logout(req: Request, res: Response): Promise<void> {
        try {
            // In a real application, you might want to blacklist the token
            // For now, we'll just return success
            res.json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error: any) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const userData = await userService.findById(user.id);
            if (!userData) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'User data retrieved successfully',
                data: userData
            });
        } catch (error: any) {
            console.error('Get current user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}