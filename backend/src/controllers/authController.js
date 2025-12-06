import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { generateTokens } from '../utils/token.js';

const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    const { email, password, username, firstName, lastName } = req.validatedData;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email or username already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    // Generate tokens
    const { token, refreshToken, expiresIn } = generateTokens(user.id, user.email);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
        },
        token,
        refreshToken,
        expiresIn,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Generate tokens
    const { token, refreshToken, expiresIn } = generateTokens(user.id, user.email);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          lastLogin: new Date(),
        },
        token,
        refreshToken,
        expiresIn,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { token, refreshToken: newRefreshToken, expiresIn } = generateTokens(
      decoded.userId,
      decoded.email
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken,
        expiresIn,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
};

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
