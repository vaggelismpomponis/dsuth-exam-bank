import React, { useState, useEffect } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { supabase } from '../supabaseClient';
import { Button, Alert, CircularProgress } from '@mui/material';

export default function WebAuthnRegister({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasCredential, setHasCredential] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Check if user has credential
    const checkCredential = async () => {
      const { data, error } = await supabase
        .from('webauthn_credentials')
        .select('id')
        .eq('user_id', user.id);
      setHasCredential(data && data.length > 0);
    };
    checkCredential();
  }, [user, success]);

  if (!user) return null;
  if (typeof window !== 'undefined' && !window.PublicKeyCredential) return null;

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // 1. Ζήτα registration options από το backend
      const res1 = await fetch('/api/generate-registration-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      if (!res1.ok) {
        throw new Error('Σφάλμα backend: ' + res1.status);
      }
      const options = await res1.json();
      if (!options.challenge) throw new Error('Σφάλμα backend (registration options)');
      // 2. Ξεκίνα το registration με το browser
      const regResp = await startRegistration(options);
      // 3. Στείλε το αποτέλεσμα στο backend για verify
      const res2 = await fetch('/api/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          credential: regResp,
          email: user.email,
          expectedChallenge: options.challenge,
        }),
      });
      const { success: ok, error: err2 } = await res2.json();
      if (!ok) throw new Error(err2 || 'Αποτυχία καταχώρησης credential.');
      setSuccess('Επιτυχής ενεργοποίηση Fingerprint/FaceID!');
    } catch (e) {
      setError(e.message || 'Σφάλμα WebAuthn registration');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Διαγραφή όλων των credentials του χρήστη (ή μπορείς να κάνεις μόνο το πρώτο)
      const { error } = await supabase
        .from('webauthn_credentials')
        .delete()
        .eq('user_id', user.id);
      if (error) throw new Error(error.message);
      setSuccess('Απενεργοποιήθηκε το Fingerprint/FaceID!');
    } catch (e) {
      setError(e.message || 'Σφάλμα κατά την απενεργοποίηση');
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 24 }}>
      {hasCredential ? (
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          disabled={loading}
          sx={{ fontWeight: 700 }}
        >
          {loading ? <CircularProgress size={22} /> : 'Απενεργοποίηση Fingerprint/FaceID'}
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={handleRegister}
          disabled={loading}
          sx={{ fontWeight: 700 }}
        >
          {loading ? <CircularProgress size={22} /> : 'Ενεργοποίηση Fingerprint/FaceID'}
        </Button>
      )}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </div>
  );
} 