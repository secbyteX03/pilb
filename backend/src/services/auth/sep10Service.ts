import StellarSDK from '@stellar/stellar-sdk';
import { getStellarClient } from '../stellar/stellarClient';
import { logger } from '../../utils/logger';
import { env } from '../../config/environment';

export interface ChallengeResponse {
  transaction: string;
  networkPassphrase: string;
  expiresAt: string;
}

export interface AuthResponse {
  token: string;
  publicKey: string;
}

/**
 * SEP-10 Authentication Service
 * 
 * Implements Stellar's SEP-10 standard for web authentication
 * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md
 */
export class AuthService {
  private challengeTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate a challenge transaction for a client
   * The client signs this with their Stellar key
   */
  async generateChallenge(publicKey: string): Promise<ChallengeResponse> {
    const stellarClient = getStellarClient();
    const server = stellarClient.getServer();

    logger.info(`🔐 Generating SEP-10 challenge for: ${publicKey.slice(0, 12)}...`);

    try {
      // Validate the public key format
      try {
        StellarSDK.Keypair.fromPublicKey(publicKey);
      } catch {
        throw new Error('Invalid Stellar public key');
      }

      // Load the service account to build the challenge
      const serviceAccount = await server.loadAccount(stellarClient.getPublicKey());

      // Get current base fee
      const baseFee = await server.fetchBaseFee();

      // Build the challenge transaction
      // This is a simple challenge - in production you'd add more fields
      const transaction = new StellarSDK.TransactionBuilder(serviceAccount, {
        fee: baseFee,
        networkPassphrase: stellarClient.getNetworkPassphrase(),
        timebounds: {
          minTime: Math.floor(Date.now() / 1000),
          maxTime: Math.floor((Date.now() + this.challengeTimeout) / 1000),
        },
      })
        .addOperation(
          StellarSDK.Operation.manageData({
            name: 'web_auth_domain',
            value: new URL(env.API_URL).hostname,
          })
        )
        .build();

      // Return the transaction as base64 and expiration time
      const expiresAt = new Date(Date.now() + this.challengeTimeout).toISOString();

      logger.info(`✅ Challenge generated, expires: ${expiresAt}`);

      return {
        transaction: transaction.toXDR(),
        networkPassphrase: stellarClient.getNetworkPassphrase(),
        expiresAt,
      };
    } catch (error) {
      logger.error('❌ Failed to generate challenge:', error);
      throw error;
    }
  }

  /**
   * Verify a signed challenge and issue a JWT
   */
  async authenticate(publicKey: string, signedTransaction: string): Promise<AuthResponse> {
    const stellarClient = getStellarClient();

    logger.info(`🔐 Authenticating user: ${publicKey.slice(0, 12)}...`);

    try {
      // Parse the signed transaction
      const transaction = StellarSDK.Transaction.fromXDR(signedTransaction, stellarClient.getNetworkPassphrase());

      // Verify the transaction source is the claimed public key
      if (transaction.source !== publicKey) {
        throw new Error('Transaction source does not match the claimed public key');
      }

      // Verify the transaction was signed by the client
      const clientKeypair = StellarSDK.Keypair.fromPublicKey(publicKey);
      const hasValidSignature = transaction.signatures.some((sig: any) => {
        try {
          return transaction.verify(clientKeypair.publicKey(), sig);
        } catch {
          return false;
        }
      });

      if (!hasValidSignature) {
        throw new Error('Invalid transaction signature');
      }

      // Verify timebounds
      const now = Math.floor(Date.now() / 1000);
      if (transaction.timeBounds) {
        if (now > transaction.timeBounds.maxTime) {
          throw new Error('Challenge transaction has expired');
        }
        if (now < transaction.timeBounds.minTime) {
          throw new Error('Challenge transaction is not yet valid');
        }
      }

      // In production, generate a proper JWT token here
      // For now, we create a simple token
      const token = this.generateToken(publicKey);

      logger.info(`✅ User authenticated successfully`);

      return {
        token,
        publicKey,
      };
    } catch (error) {
      logger.error('❌ Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Generate a simple authentication token
   * In production, use a proper JWT library
   */
  private generateToken(publicKey: string): string {
    const payload = {
      publicKey,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      iat: Date.now(),
    };
    
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Verify an authentication token
   */
  verifyToken(token: string): { publicKey: string } | null {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (payload.exp < Date.now()) {
        return null; // Token expired
      }

      return { publicKey: payload.publicKey };
    } catch {
      return null; // Invalid token
    }
  }
}

// Singleton
let authService: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authService) {
    authService = new AuthService();
  }
  return authService;
}