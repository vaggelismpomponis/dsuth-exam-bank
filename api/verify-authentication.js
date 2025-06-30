import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, credential, expectedChallenge } = req.body;
  if (!userId || !credential || !expectedChallenge) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Find credential in Supabase
  const { data: creds, error: credsError } = await supabase.from('webauthn_credentials').select('*').eq('user_id', userId);
  if (credsError || !creds || creds.length === 0) {
    return res.status(404).json({ error: 'No credentials found for user' });
  }

  // Find the matching credential
  const credId = Buffer.from(credential.rawId, 'base64').toString('base64');
  const cred = creds.find(c => c.credential_id === credId);
  if (!cred) {
    return res.status(404).json({ error: 'Credential not found' });
  }

  const rpID = process.env.RP_ID || 'localhost';
  const origin = `https://${rpID}`;

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(cred.credential_id, 'base64'),
        credentialPublicKey: Buffer.from(cred.public_key, 'base64'),
        counter: cred.counter,
        transports: cred.transports || undefined,
      },
    });
  } catch (e) {
    return res.status(400).json({ error: 'Verification failed', details: e.message });
  }

  const { verified, authenticationInfo } = verification;
  if (!verified || !authenticationInfo) {
    return res.status(400).json({ error: 'Authentication not verified' });
  }

  // Update counter in DB
  await supabase.from('webauthn_credentials').update({ counter: authenticationInfo.newCounter }).eq('credential_id', cred.credential_id);

  return res.status(200).json({ success: true, userId });
} 