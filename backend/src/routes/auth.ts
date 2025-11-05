import { Router } from 'express';
import { generateWalletToken } from '../utils/auth';
import { verifyWalletSignature } from '../utils/auth';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * POST /api/auth/wallet
 * Authenticate with wallet signature
 */
router.post('/wallet', strictRateLimiter, async (req, res, next) => {
  try {
    const { walletAddress, message, signature } = req.body;

    if (!walletAddress || !message || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature (placeholder - implement actual verification)
    const isValid = await verifyWalletSignature(walletAddress, message, signature);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Generate JWT token
    const token = await generateWalletToken(walletAddress);

    res.json({
      token,
      walletAddress,
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };

