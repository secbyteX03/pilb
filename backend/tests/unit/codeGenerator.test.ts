import { CodeGenerator } from '../../src/services/encryption/codeGenerator';

describe('CodeGenerator', () => {
  describe('generateCode', () => {
    it('should generate code of default length 8', () => {
      const code = CodeGenerator.generateCode();
      expect(code).toHaveLength(8);
    });

    it('should generate code of specified length', () => {
      const code = CodeGenerator.generateCode(6);
      expect(code).toHaveLength(6);
    });

    it('should only contain alphanumeric characters', () => {
      const code = CodeGenerator.generateCode();
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });
  });

  describe('generateSalt', () => {
    it('should generate salt of default length 16', () => {
      const salt = CodeGenerator.generateSalt();
      expect(salt).toHaveLength(32); // hex = 16 bytes * 2
    });

    it('should generate unique salts', () => {
      const salt1 = CodeGenerator.generateSalt();
      const salt2 = CodeGenerator.generateSalt();
      expect(salt1).not.toEqual(salt2);
    });
  });

  describe('hashCode', () => {
    it('should generate consistent hash for same input', () => {
      const code = 'TEST1234';
      const salt = 'somesalt';
      const hash1 = CodeGenerator.hashCode(code, salt);
      const hash2 = CodeGenerator.hashCode(code, salt);
      expect(hash1).toEqual(hash2);
    });

    it('should generate different hash for different salts', () => {
      const code = 'TEST1234';
      const hash1 = CodeGenerator.hashCode(code, 'salt1');
      const hash2 = CodeGenerator.hashCode(code, 'salt2');
      expect(hash1).not.toEqual(hash2);
    });

    it('should return 64 character hex string', () => {
      const hash = CodeGenerator.hashCode('test', 'salt');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('verifyCode', () => {
    it('should return true for valid code', () => {
      const code = 'TEST1234';
      const salt = 'somesalt';
      const hash = CodeGenerator.hashCode(code, salt);
      expect(CodeGenerator.verifyCode(code, salt, hash)).toBe(true);
    });

    it('should return false for invalid code', () => {
      const salt = 'somesalt';
      const hash = CodeGenerator.hashCode('VALID', salt);
      expect(CodeGenerator.verifyCode('INVALID', salt, hash)).toBe(false);
    });
  });
});