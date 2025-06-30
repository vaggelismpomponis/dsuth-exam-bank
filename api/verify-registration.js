import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, credential, email, expectedChallenge } = req.body;
  if (!userId || !credential || !email || !expectedChallenge) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const rpID = process.env.RP_ID || 'localhost';
  const origin = `https://${rpID}`;

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (e) {
    return res.status(400).json({ error: 'Verification failed', details: e.message });
  }

  const { verified, registrationInfo } = verification;
  if (!verified || !registrationInfo) {
    return res.status(400).json({ error: 'Registration not verified' });
  }

  // Save credential to Supabase
  const { credentialPublicKey, credentialID, counter, credentialDeviceType, credentialBackedUp, transports } = registrationInfo;
  const { error } = await supabase.from('webauthn_credentials').insert({
    user_id: userId,
    credential_id: Buffer.from(credentialID).toString('base64'),
    public_key: Buffer.from(credentialPublicKey).toString('base64'),
    counter,
    transports,
  });
  if (error) {
    return res.status(500).json({ error: 'Failed to save credential', details: error.message });
  }

  return res.status(200).json({ success: true });
} 