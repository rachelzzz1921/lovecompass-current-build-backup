export const ACCESS_CODES = ["LOVE2026", "MATCH88", "HEART520", "AIWED"];

export function isValidAccessCode(code: string): boolean {
  return ACCESS_CODES.includes(code.trim().toUpperCase());
}
