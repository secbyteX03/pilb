import crypto from 'crypto';

/**
 * Code Generator - Generates secure verification codes and hashes
 */
export class CodeGenerator {
  /**
   * Generate a random alphanumeric code
   * Example: "X9K2L1Q"
   */
  static generateCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Generate random salt for hashing
   */
  static generateSalt(length: number = 16): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash code + salt using SHA-256
   * This hash goes on Stellar blockchain as memo
   */
  static hashCode(code: string, salt: string): string {
    return crypto
      .createHash('sha256')
      .update(code + salt)
      .digest('hex');
  }

  /**
   * Verify that a code matches its hash
   */
  static verifyCode(code: string, salt: string, hash: string): boolean {
    const computedHash = this.hashCode(code, salt);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(hash)
    );
  }
}