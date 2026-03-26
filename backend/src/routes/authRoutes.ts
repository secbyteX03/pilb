import { Router } from 'express';
import { getChallenge, signChallenge, verifyToken } from '../controllers/authController';

const router = Router();

// GET /api/auth/challenge - Get SEP-10 challenge
router.get('/challenge', getChallenge);

// POST /api/auth/authenticate - Sign and verify SEP-10 challenge
router.post('/authenticate', signChallenge);

// GET /api/auth/verify - Verify token
router.get('/verify', verifyToken);

export default router;