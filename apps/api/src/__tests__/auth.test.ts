import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

describe('Auth Utilities', () => {
  it('should hash and compare passwords correctly', async () => {
    const password = 'testPassword123!';
    const hash = await bcrypt.hash(password, 12);
    expect(hash).not.toBe(password);

    const match = await bcrypt.compare(password, hash);
    expect(match).toBe(true);

    const noMatch = await bcrypt.compare('wrongPassword', hash);
    expect(noMatch).toBe(false);
  });

  it('should sign and verify JWT tokens', () => {
    const payload = { sub: 'user-1', role: 'ADMIN', schoolId: 'school-1' };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    expect(decoded.sub).toBe('user-1');
    expect(decoded.role).toBe('ADMIN');
  });

  it('should reject expired tokens', () => {
    const payload = { sub: 'user-1', role: 'STUDENT', schoolId: 'school-1' };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '0s' });

    // Wait a tick for expiry
    expect(() => jwt.verify(token, env.JWT_SECRET)).toThrow();
  });
});
