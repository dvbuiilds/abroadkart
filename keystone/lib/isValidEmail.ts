/**
 * Pragmatic email check for form input: one @, no spaces, a dot in the domain.
 * It does not try to match the full RFC 5322 grammar.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string | null | undefined): boolean {
  if (typeof value !== "string") return false;
  return EMAIL_RE.test(value.trim());
}
