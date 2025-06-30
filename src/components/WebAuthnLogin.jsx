import React, { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { Button, Alert, CircularProgress } from '@mui/material';

const API_BASE = "https://dsuth-api.vercel.app/api";

export default function WebAuthnLogin({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Εμφανίζεται μόνο αν υποστηρίζεται από τη συσκευή
  if (typeof window !== 'undefined' && !window.PublicKeyCredential) return null;

  const handleBiometricLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Ζήτα options από το backend ΧΩΡΙΣ email (discoverable credentials)
      const res1 = await fetch(`${API_BASE}/generate-authentication-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const { options, userId, error: err1 } = await res1.json();
      if (err1 || !options) {
        setError(err1 || 'Δεν βρέθηκαν credentials.');
        setLoading(false);
        return;
      }
      // Ξεκίνα το authentication με το browser
      const asseResp = await startAuthentication(options);
      // Στείλε το αποτέλεσμα στο backend για verify
      const res2 = await fetch(`${API_BASE}/verify-authentication`, {
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

  return (
    <div style={{ marginTop: 16 }}>
      <Button
        onClick={handleBiometricLogin}
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 2, fontWeight: 700 }}
      >
        {loading ? <CircularProgress size={22} /> : 'ΕΙΣΟΔΟΣ ΜΕ ΔΑΚΤΥΛΙΚΟ/FACEID'}
      </Button>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </div>
  );
} 