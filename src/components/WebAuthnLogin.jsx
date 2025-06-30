import React, { useState, useEffect, useRef } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { supabase } from '../supabaseClient';
import { Button, Alert, CircularProgress } from '@mui/material';

export default function WebAuthnLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasCredential, setHasCredential] = useState(false);
  const autoTriggered = useRef(false);

  // Εμφανίζεται μόνο αν υποστηρίζεται από τη συσκευή
  if (typeof window !== 'undefined' && !window.PublicKeyCredential) return null;

  // Ελέγχει αν υπάρχει credential για το email (μόλις συμπληρωθεί)
  useEffect(() => {
    if (email && !autoTriggered.current) {
      setLoading(true);
      fetch('/api/generate-authentication-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
        .then(res => res.json())
        .then(({ options, userId }) => {
          if (options && userId) {
            setHasCredential(true);
            // Αυτόματο trigger WebAuthn login
            autoTriggered.current = true;
            handleWebAuthnLogin(options, userId);
          } else {
            setHasCredential(false);
          }
        })
        .catch(() => setHasCredential(false))
        .finally(() => setLoading(false));
    }
  }, [email]);

  const handleWebAuthnLogin = async (options, userId) => {
    setError('');
    setLoading(true);
    try {
      // 2. Ξεκίνα το authentication με το browser
      const asseResp = await startAuthentication(options);
      // 3. Στείλε το αποτέλεσμα στο backend για verify
      const res2 = await fetch('/api/verify-authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          credential: asseResp,
          expectedChallenge: options.challenge,
        }),
      });
      const { success, error: err2 } = await res2.json();
      if (!success) throw new Error(err2 || 'Αποτυχία ταυτοποίησης.');
      if (onLogin) onLogin(userId);
    } catch (e) {
      setError(e.message || 'Σφάλμα WebAuthn login');
    }
    setLoading(false);
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Ζήτα options από το backend
    const res1 = await fetch('/api/generate-authentication-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const { options, userId, error: err1 } = await res1.json();
    if (err1 || !options) {
      setError(err1 || 'Δεν βρέθηκαν credentials.');
      setLoading(false);
      return;
    }
    await handleWebAuthnLogin(options, userId);
  };

  return (
    <form onSubmit={handleManualLogin} style={{ marginTop: 16 }}>
      <div>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            autoTriggered.current = false; // reset auto-trigger if email changes
          }}
          style={{ padding: 8, fontSize: 16, borderRadius: 4, border: '1px solid #ccc', width: 220 }}
        />
      </div>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 2, fontWeight: 700 }}
      >
        {loading ? <CircularProgress size={22} /> : 'Είσοδος με Δακτυλικό/FaceID'}
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </form>
  );
} 