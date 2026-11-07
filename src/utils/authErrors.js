/**
 * Translates Supabase auth error messages to user-friendly Greek descriptions.
 */
export const getGreekAuthError = (errorMessage = '') => {
  if (!errorMessage) return '';

  const msg = String(errorMessage).toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Λανθασμένο email ή κωδικός πρόσβασης.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Το email σας δεν έχει επιβεβαιωθεί ακόμη. Ελέγξτε τα εισερχόμενά σας (και τον φάκελο Ανεπιθύμητα).';
  }
  if (msg.includes('user already registered') || msg.includes('already exists')) {
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
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Σφάλμα σύνδεσης με τον διακομιστή. Ελέγξτε τη σύνδεσή σας.';
  }
  if (msg.includes('validation') || msg.includes('turnstile')) {
    return 'Η επαλήθευση ασφαλείας απέτυχε. Παρακαλώ δοκιμάστε ξανά.';
  }

  return errorMessage;
};

