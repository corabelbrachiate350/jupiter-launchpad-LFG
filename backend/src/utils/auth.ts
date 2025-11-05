import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface WalletAuthPayload {
  walletAddress: string;
  userId: string;
}

export interface AdminAuthPayload {
  walletAddress: string;
  adminId: string;
  role: string;
}

/**
 * Generate JWT token for wallet authentication
 */
export async function generateWalletToken(walletAddress: string): Promise<string> {
  // Get or create user
  let user = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { walletAddress },
    });
  }

  const payload: WalletAuthPayload = {
    walletAddress,
    userId: user.id,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Generate JWT token for admin authentication
 */
export async function generateAdminToken(walletAddress: string): Promise<string> {
  const admin = await prisma.admin.findUnique({
    where: { walletAddress },
  });

  if (!admin) {
    throw new Error('Admin not found');
  }

  const payload: AdminAuthPayload = {
    walletAddress,
    adminId: admin.id,
    role: admin.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Verify wallet signature (placeholder - in production, use actual wallet signature verification)
 */
export async function verifyWalletSignature(
  walletAddress: string,
  message: string,
  signature: string
): Promise<boolean> {
  // TODO: Implement actual Solana wallet signature verification
  // This is a placeholder - in production you'd use @solana/web3.js to verify signatures
  return true;
}

