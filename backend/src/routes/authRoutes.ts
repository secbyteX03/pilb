import { Router } from 'express';
import { getChallenge, signChallenge } from '../controllers/authController';

const router = Router();

// GET /api/auth/challenge - Get SEP-10 challenge
router.get('/challenge', getChallenge);

// POST /api/auth/authenticate - Sign and verify SEP-10 challenge
router.post('/authenticate', signChallenge);

export default router;