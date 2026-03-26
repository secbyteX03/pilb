import crypto from 'crypto';
import { env } from '../../config/environment';

/**
 * AES Encryption - Encrypts sensitive data (M-Pesa numbers, sender info)
 */
export class AESEncryption {
  private static key: Buffer;

  // Initialize key from environment
  private static getKey(): Buffer {
    if (!this.key) {
      const key = env.ENCRYPTION_KEY || 'default-encryption-key-change-me';
      this.key = crypto.createHash('sha256').update(key).digest();
    }
    return this.key;
  }

  /**
   * Encrypt sensitive data
   * @param text - Plain text to encrypt
   * @returns - IV:encrypted_text (hex format)
   */
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.getKey(), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt encrypted data
   * @param encryptedText - Encrypted text (IV:encrypted format)
   * @returns - Decrypted plain text
   */
  static decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.getKey(), iv);
    
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash sensitive data (one-way, for storage)
   * @param text - Text to hash
   * @returns - SHA-256 hash (hex)
   */
  static hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}