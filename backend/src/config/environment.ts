import dotenv from 'dotenv';
import path from 'path';

// Load environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env';
dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });

export const env = {
  // App
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_URL: process.env.API_URL || 'http://localhost:3000',

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME: process.env.DB_NAME || 'pilb',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DATABASE_URL: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,

  // Stellar
  STELLAR_NETWORK: process.env.STELLAR_NETWORK || 'testnet',
  STELLAR_SERVER_URL: process.env.STELLAR_SERVER_URL || 'https://horizon-testnet.stellar.org',
  SERVICE_WALLET_ADDRESS: process.env.SERVICE_WALLET_ADDRESS || '',
  SERVICE_WALLET_SECRET: process.env.SERVICE_WALLET_SECRET || '',

  // M-Pesa
  MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || '',
  MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || '',
  MPESA_BASE_URL: process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke',
  MPESA_SHORTCODE: process.env.MPESA_SHORTCODE || '',
  MPESA_PASSKEY: process.env.MPESA_PASSKEY || '',
  MPESA_CALLBACK_URL: process.env.MPESA_CALLBACK_URL || 'http://localhost:3000/api/mpesa/callback',

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Crypto
  BITCOIN_API_KEY: process.env.BITCOIN_API_KEY || '',
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY || '',

  // Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production',
};

// Validate critical env vars in production
if (env.NODE_ENV === 'production') {
  const required = [
    'SERVICE_WALLET_ADDRESS',
    'SERVICE_WALLET_SECRET',
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET',
  ];

  for (const varName of required) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
}