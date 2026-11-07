import { describe, it, expect } from 'vitest';
import { getFriendlyErrorMessage, isTechnicalError, mapKnownErrorToGreek } from './errorUtils';
import { getGreekAuthError } from './authErrors';

describe('errorUtils', () => {
  describe('isTechnicalError', () => {
    it('detects Postgres RLS violation messages as technical', () => {
      expect(isTechnicalError('new row violates row-level security policy for table "profiles"')).toBe(true);
      expect(isTechnicalError('violates foreign key constraint')).toBe(true);
      expect(isTechnicalError('duplicate key value violates unique constraint')).toBe(true);
    });

    it('detects raw English system errors as technical', () => {
      expect(isTechnicalError('Internal server error')).toBe(true);
      expect(isTechnicalError('Failed to fetch')).toBe(true);
      expect(isTechnicalError('TypeError: Cannot read properties of undefined')).toBe(true);
    });

    it('identifies clean Greek user messages as non-technical', () => {
      expect(isTechnicalError('Παρακαλώ συμπληρώστε τόσο το όνομα όσο και το επώνυμο.')).toBe(false);
      expect(isTechnicalError('Το αρχείο είναι πολύ μεγάλο.')).toBe(false);
    });
  });

  describe('mapKnownErrorToGreek', () => {
    it('maps known auth errors to Greek', () => {
      expect(mapKnownErrorToGreek('Invalid login credentials')).toBe('Λανθασμένο email ή κωδικός πρόσβασης.');
      expect(mapKnownErrorToGreek('Email not confirmed')).toBe(
        'Το email σας δεν έχει επιβεβαιωθεί ακόμη. Ελέγξτε τα εισερχόμενά σας (και τον φάκελο Ανεπιθύμητα).'
      );
      expect(mapKnownErrorToGreek('User already registered')).toBe(
        'Υπάρχει ήδη λογαριασμός με αυτό το email. Δοκιμάστε να συνδεθείτε.'
      );
    });
  });

  describe('getFriendlyErrorMessage', () => {
    const rlsError = new Error('new row violates row-level security policy for table "profiles"');

    it('returns the real technical error in DEVELOPMENT mode', () => {
      const result = getFriendlyErrorMessage(rlsError, 'Σφάλμα αποθήκευσης.', { forceDev: true });
      expect(result).toBe('new row violates row-level security policy for table "profiles"');
    });

    it('returns the friendly generic message in PRODUCTION mode for technical errors', () => {
      const result = getFriendlyErrorMessage(rlsError, 'Σφάλμα κατά την αποθήκευση των στοιχείων σας.', {
        forceDev: false,
      });
      expect(result).toBe('Σφάλμα κατά την αποθήκευση των στοιχείων σας.');
    });

    it('preserves clean Greek messages even in PRODUCTION mode', () => {
      const greekMsg = 'Παρακαλώ συμπληρώστε τόσο το όνομα όσο και το επώνυμο.';
      const result = getFriendlyErrorMessage(greekMsg, 'Άγνωστο σφάλμα.', { forceDev: false });
      expect(result).toBe(greekMsg);
    });

    it('translates known auth errors in PRODUCTION mode', () => {
      const result = getFriendlyErrorMessage('invalid login credentials', 'Σφάλμα σύνδεσης.', { forceDev: false });
      expect(result).toBe('Λανθασμένο email ή κωδικός πρόσβασης.');
    });
  });

  describe('getGreekAuthError', () => {
    it('returns translated Greek text for known errors', () => {
      expect(getGreekAuthError('invalid_grant')).toBe('Λανθασμένο email ή κωδικός πρόσβασης.');
    });

    it('falls back to friendly message in production for unknown technical error', () => {
      // In tests where forceDev is not passed, it evaluates import.meta.env.DEV.
      // But passing an Error with getFriendlyErrorMessage behaves as expected.
      const result = getFriendlyErrorMessage('database connection timeout', 'Παρουσιάστηκε σφάλμα σύνδεσης.', {
        forceDev: false,
      });
      expect(result).toBe('Παρουσιάστηκε σφάλμα σύνδεσης.');
    });
  });
});

