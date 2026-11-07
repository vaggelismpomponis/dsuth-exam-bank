/**
 * Utility for user-friendly error formatting across production and development environments.
 *
 * In DEVELOPMENT: returns the raw, real error message (e.g. Postgres RLS violations, DB constraint errors)
 * to facilitate rapid debugging.
 * In PRODUCTION: protects users from technical jargon, stack traces, and database leakages by returning
 * friendly, localized Greek messages.
 */

const TECHNICAL_PATTERNS = [
  /row-level security/i,
  /\brls\b/i,
  /violates/i,
  /policy/i,
  /permission denied/i,
  /foreign key/i,
  /unique constraint/i,
  /duplicate key/i,
  /\bcolumn\b/i,
  /\brelation\b/i,
  /\btable\b/i,
  /syntax error/i,
  /pgrst/i,
  /database/i,
  /postgres/i,
  /supabase/i,
  /internal server/i,
  /status code/i,
  /exception/i,
  /stack trace/i,
  /typeerror/i,
  /referenceerror/i,
  /null value/i,
  /undefined/i,
  /jwt/i,
  /\btoken\b/i,
  /oauth/i,
  /failed to fetch/i,
  /networkerror/i,
  /abort/i,
];

/**
 * Checks whether an error message contains technical jargon, DB keywords, or English leak text.
 */
export const isTechnicalError = (message = '') => {
  if (!message || typeof message !== 'string') return true;
  const trimmed = message.trim();
  if (!trimmed) return true;

  // Pattern checks
  for (const pattern of TECHNICAL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  // If the message contains no Greek characters and has significant length, it's likely an untranslated English system message
  const hasGreek = /[\u0370-\u03FF]/.test(trimmed);
  if (!hasGreek && trimmed.length > 3) {
    return true;
  }

  return false;
};

/**
 * Translates known technical/auth errors to friendly Greek text.
 */
export const mapKnownErrorToGreek = (rawMessage = '') => {
  if (!rawMessage || typeof rawMessage !== 'string') return null;
  const msg = rawMessage.toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Λανθασμένο email ή κωδικός πρόσβασης.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Το email σας δεν έχει επιβεβαιωθεί ακόμη. Ελέγξτε τα εισερχόμενά σας (και τον φάκελο Ανεπιθύμητα).';
  }
  if (msg.includes('user already registered') || msg.includes('already exists') || msg.includes('duplicate key')) {
    return 'Υπάρχει ήδη λογαριασμός με αυτό το email. Δοκιμάστε να συνδεθείτε.';
  }
  if (msg.includes('password should be at least') || msg.includes('weak password')) {
    return 'Ο κωδικός πρόσβασης πρέπει να πληροί τις προδιαγραφές ασφαλείας.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Πάρα πολλές προσπάθειες. Παρακαλώ περιμένετε μερικά λεπτά και δοκιμάστε ξανά.';
  }
  if (msg.includes('user not found')) {
    return 'Δεν βρέθηκε λογαριασμός με αυτό το email.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Σφάλμα σύνδεσης με τον διακομιστή. Ελέγξτε τη σύνδεσή σας στο διαδίκτυο.';
  }
  if (msg.includes('validation') || msg.includes('turnstile')) {
    return 'Η επαλήθευση ασφαλείας απέτυχε. Παρακαλώ δοκιμάστε ξανά.';
  }
  if (msg.includes('jwt') || msg.includes('token expired') || msg.includes('session expired')) {
    return 'Η συνεδρία σας έχει λήξει. Παρακαλούμε συνδεθείτε ξανά.';
  }

  return null;
};

/**
 * Formats an error for display to users.
 *
 * @param {any} error - The caught error object, string, or Supabase error.
 * @param {string} defaultFallback - Fallback friendly message in Greek.
 * @param {object} [options] - Optional configurations (e.g. forceDev for testing).
 * @returns {string} The error message appropriate for the active environment.
 */
export const getFriendlyErrorMessage = (
  error,
  defaultFallback = 'Παρουσιάστηκε ένα σφάλμα. Παρακαλούμε δοκιμάστε ξανά αργότερα.',
  options = {}
) => {
  const isDevEnv = options.forceDev !== undefined ? options.forceDev : Boolean(import.meta?.env?.DEV);

  const rawMessage = error?.message || (typeof error === 'string' ? error : '') || '';

  // In development, always prioritize the real raw error message
  if (isDevEnv) {
    if (rawMessage.trim()) {
      return rawMessage;
    }
    return defaultFallback;
  }

  // In production:
  // 1. Check if it matches a known mapped error
  const mapped = mapKnownErrorToGreek(rawMessage);
  if (mapped) {
    return mapped;
  }

  // 2. If it's a technical message or English leak, protect the user with the fallback
  if (isTechnicalError(rawMessage)) {
    return defaultFallback;
  }

  // 3. Otherwise, it is already a safe, custom Greek message
  return rawMessage || defaultFallback;
};
