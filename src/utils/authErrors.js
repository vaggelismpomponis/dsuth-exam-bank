import { getFriendlyErrorMessage, mapKnownErrorToGreek } from './errorUtils';

/**
 * Translates Supabase auth error messages to user-friendly Greek descriptions.
 * In development, returns the real error if unmapped; in production, returns a safe generic Greek fallback.
 */
export const getGreekAuthError = (errorMessage = '', defaultFallback = 'Παρουσιάστηκε σφάλμα κατά την ταυτοποίηση.') => {
  if (!errorMessage) return '';

  const rawMessage = typeof errorMessage === 'string' ? errorMessage : (errorMessage?.message || '');
  const mapped = mapKnownErrorToGreek(rawMessage);
  if (mapped) {
    return mapped;
  }

  return getFriendlyErrorMessage(errorMessage, defaultFallback);
};

export { getFriendlyErrorMessage };
