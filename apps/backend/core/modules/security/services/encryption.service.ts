import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits

  constructor(private readonly configService: ConfigService) {}

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  encrypt(text: string, key?: string): { encrypted: string; iv: string; tag: string } {
    try {
      const encryptionKey = key ? Buffer.from(key, 'hex') : this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, encryptionKey);
      cipher.setAAD(Buffer.from('CounselFlow-Attorney-Client-Privilege', 'utf8'));

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
      };
    } catch (error) {
      this.logger.error('Encryption failed:', error.message);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt sensitive data using AES-256-GCM
   */
  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, key?: string): string {
    try {
      const encryptionKey = key ? Buffer.from(key, 'hex') : this.getEncryptionKey();
      const decipher = crypto.createDecipher(this.algorithm, encryptionKey);
      
      decipher.setAAD(Buffer.from('CounselFlow-Attorney-Client-Privilege', 'utf8'));
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed:', error.message);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Generate a secure encryption key
   */
  generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Hash sensitive data for comparison
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create HMAC for data integrity verification
   */
  createHMAC(data: string, secret?: string): string {
    const hmacSecret = secret || this.getHMACSecret();
    return crypto.createHmac('sha256', hmacSecret).update(data).digest('hex');
  }

  /**
   * Verify HMAC for data integrity
   */
  verifyHMAC(data: string, hmac: string, secret?: string): boolean {
    const expectedHMAC = this.createHMAC(data, secret);
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHMAC));
  }

  /**
   * Encrypt attorney-client privileged communications
   */
  encryptPrivileged(content: string, attorneyId: string, clientId: string): any {
    const privilegeKey = this.generatePrivilegeKey(attorneyId, clientId);
    const encryptedData = this.encrypt(content, privilegeKey);
    
    return {
      ...encryptedData,
      privilegeProtected: true,
      attorneyId,
      clientId,
      timestamp: new Date(),
    };
  }

  /**
   * Decrypt attorney-client privileged communications
   */
  decryptPrivileged(encryptedData: any, requestingUserId: string): string {
    // Verify user has privilege to access this content
    if (requestingUserId !== encryptedData.attorneyId && requestingUserId !== encryptedData.clientId) {
      throw new Error('Access denied: Attorney-client privilege violation');
    }

    const privilegeKey = this.generatePrivilegeKey(encryptedData.attorneyId, encryptedData.clientId);
    return this.decrypt(encryptedData, privilegeKey);
  }

  private getEncryptionKey(): Buffer {
    const key = this.configService.get('ENCRYPTION_KEY');
    if (!key) {
      throw new Error('Encryption key not configured');
    }
    return Buffer.from(key, 'hex');
  }

  private getHMACSecret(): string {
    const secret = this.configService.get('HMAC_SECRET');
    if (!secret) {
      throw new Error('HMAC secret not configured');
    }
    return secret;
  }

  private generatePrivilegeKey(attorneyId: string, clientId: string): string {
    const baseKey = this.getEncryptionKey();
    const privilegeData = `${attorneyId}:${clientId}:attorney-client-privilege`;
    return crypto.createHmac('sha256', baseKey).update(privilegeData).digest('hex');
  }
}