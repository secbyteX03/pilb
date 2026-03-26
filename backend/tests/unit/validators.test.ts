import { Validators } from '../../src/utils/validators';

describe('Validators', () => {
  describe('isValidPublicKey', () => {
    it('should return true for valid Stellar public key', () => {
      // Sample valid public key (starts with G, 56 chars)
      expect(Validators.isValidPublicKey('GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')).toBe(true);
    });

    it('should return false for invalid public key', () => {
      expect(Validators.isValidPublicKey('invalid')).toBe(false);
      expect(Validators.isValidPublicKey('SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should return true for valid phone numbers', () => {
      expect(Validators.isValidPhone('0712345678')).toBe(true);
      expect(Validators.isValidPhone('+254712345678')).toBe(true);
      expect(Validators.isValidPhone('254712345678')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(Validators.isValidPhone('123456')).toBe(false);
      expect(Validators.isValidPhone('abcdefghij')).toBe(false);
    });
  });

  describe('normalizePhone', () => {
    it('should normalize phone to 254 format', () => {
      expect(Validators.normalizePhone('0712345678')).toBe('254712345678');
      expect(Validators.normalizePhone('+254712345678')).toBe('254712345678');
      expect(Validators.normalizePhone('254712345678')).toBe('254712345678');
    });
  });

  describe('isValidAmount', () => {
    it('should return valid for correct amounts', () => {
      expect(Validators.isValidAmount(100).valid).toBe(true);
      expect(Validators.isValidAmount(10).valid).toBe(true);
    });

    it('should return invalid for too small amounts', () => {
      expect(Validators.isValidAmount(5).valid).toBe(false);
      expect(Validators.isValidAmount(5).error).toBe('Minimum amount is 10 KES');
    });

    it('should return invalid for too large amounts', () => {
      expect(Validators.isValidAmount(200000).valid).toBe(false);
      expect(Validators.isValidAmount(200000).error).toBe('Maximum amount is 150,000 KES');
    });

    it('should return invalid for non-integer amounts', () => {
      expect(Validators.isValidAmount(10.5).valid).toBe(false);
      expect(Validators.isValidAmount(10.5).error).toBe('Amount must be a whole number');
    });
  });

  describe('isValidCode', () => {
    it('should return true for valid codes', () => {
      expect(Validators.isValidCode('ABC123')).toBe(true);
      expect(Validators.isValidCode('X9K2L1Q')).toBe(true);
    });

    it('should return false for invalid codes', () => {
      expect(Validators.isValidCode('abc')).toBe(false);
      expect(Validators.isValidCode('123')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should trim and remove dangerous characters', () => {
      expect(Validators.sanitizeString('  test  ')).toBe('test');
      expect(Validators.sanitizeString('<script>alert()</script>')).toBe('scriptalert()/script');
    });
  });
});