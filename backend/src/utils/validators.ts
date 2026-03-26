/**
 * Validators - Input validation utilities
 */

export class Validators {
  /**
   * Validate Stellar public key format
   */
  static isValidPublicKey(key: string): boolean {
    // Stellar public keys are 56 characters and start with G
    return /^G[A-Z0-9]{55}$/.test(key);
  }

  /**
   * Validate M-Pesa phone number format
   * Accepts: 07XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
   */
  static isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^(\+?254|0)?7\d{8}$/.test(cleaned);
  }

  /**
   * Normalize phone number to 254 format
   */
  static normalizePhone(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.slice(1);
    }
    if (cleaned.startsWith('+254')) {
      return cleaned.slice(1);
    }
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
    if (cleaned.startsWith('7')) {
      return '254' + cleaned;
    }
    return cleaned;
  }

  /**
   * Validate payment amount
   */
  static isValidAmount(amount: number): { valid: boolean; error?: string } {
    if (amount < 10) {
      return { valid: false, error: 'Minimum amount is 10 KES' };
    }
    if (amount > 150000) {
      return { valid: false, error: 'Maximum amount is 150,000 KES' };
    }
    if (!Number.isInteger(amount)) {
      return { valid: false, error: 'Amount must be a whole number' };
    }
    return { valid: true };
  }

  /**
   * Validate verification code format
   */
  static isValidCode(code: string): boolean {
    return /^[A-Z0-9]{6,10}$/.test(code.toUpperCase());
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}