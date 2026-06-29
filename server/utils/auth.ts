import crypto from 'node:crypto'

const SALT_LENGTH = 32
const KEY_LENGTH = 64
const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1
} as const

/**
 * Hash a password using scrypt with a random salt.
 * Returns "salt:hash" hex-encoded string.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH)
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS)
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`
}

/**
 * Verify a password against a "salt:hash" string.
 */
export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = Buffer.from(saltHex, 'hex')
  const expectedHash = Buffer.from(hashHex, 'hex')
  const actualHash = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS)
  // Constant-time comparison
  if (actualHash.length !== expectedHash.length) return false
  return crypto.timingSafeEqual(actualHash, expectedHash)
}

/**
 * Generate a cryptographically secure random token.
 */
export function generateToken(): string {
  return crypto.randomBytes(48).toString('hex')
}

/** Generate a short invite token (easier to copy/paste) */
export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex')
}
