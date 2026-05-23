import { customAlphabet, nanoid } from 'nanoid';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const codeSegment = customAlphabet(CODE_ALPHABET, 4);

/**
 * Generate a human-readable redemption code such as LOVE-AB12-XY89.
 *
 * The generation uses NanoID's secure random implementation and avoids
 * ambiguous characters such as I, O, 0 and 1.
 */
export function generateRedemptionCode(prefix = 'LOVE') {
  return `${prefix}-${codeSegment()}-${codeSegment()}`;
}

/**
 * Generate an anonymous browser/user token for non-login MVP flows.
 */
export function generateAnonymousToken() {
  return `anon_${nanoid(21)}`;
}
