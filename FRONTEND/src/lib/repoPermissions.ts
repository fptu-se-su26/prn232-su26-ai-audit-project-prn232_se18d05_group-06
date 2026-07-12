/**
 * repoPermissions.ts
 *
 * Simple utility for managing repository access permissions based on email addresses.
 * This is a lightweight in‑memory whitelist for demonstration purposes.
 */

// Initialise whitelist with the requested email and common admin addresses.
const authorizedEmails = new Set<string>([
  'dauboquay@gmail.com',
  'admin@smartlogai.com',
  'admin@smartlogai.vn',
]);

function isAdminRole(role?: string | null): boolean {
  const normalizedRole = role?.trim().toLowerCase();
  return normalizedRole === 'admin' || normalizedRole === 'administrator' || normalizedRole === 'role_admin';
}

/** Check if an e‑mail is authorized */
export function isUserAuthorized(email: string, role?: string | null): boolean {
  const normalizedEmail = email?.trim().toLowerCase() ?? '';
  if (!normalizedEmail) {
    return true;
  }

  return authorizedEmails.has(normalizedEmail) || isAdminRole(role);
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
