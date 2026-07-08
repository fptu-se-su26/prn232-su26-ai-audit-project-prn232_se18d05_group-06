/**
 * repoPermissions.ts
 *
 * Simple utility for managing repository access permissions based on email addresses.
 * This is a lightweight in‑memory whitelist for demonstration purposes.
 */

// Initialise whitelist with the requested email
const authorizedEmails = new Set<string>(['dauboquay@gmail.com']);

/** Check if an e‑mail is authorized */
export function isUserAuthorized(email: string): boolean {
  return authorizedEmails.has(email.trim().toLowerCase());
}

/** Add a new e‑mail to the whitelist */
export function addAuthorizedUser(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (authorizedEmails.has(normalized)) return false;
  authorizedEmails.add(normalized);
  return true;
}

/** Remove an e‑mail from the whitelist */
export function removeAuthorizedUser(email: string): boolean {
  return authorizedEmails.delete(email.trim().toLowerCase());
}

/** List all authorised e‑mails (useful for UI/debug) */
export function listAuthorizedUsers(): string[] {
  return Array.from(authorizedEmails);
}
