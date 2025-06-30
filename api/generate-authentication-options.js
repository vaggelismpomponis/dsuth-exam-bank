import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  // Find user by email
  const { data: userData, error: userError } = await supabase.from('auth.users').select('id').eq('email', email).single();
  if (userError || !userData) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Find credentials for user
  const { data: creds, error: credsError } = await supabase.from('webauthn_credentials').select('*').eq('user_id', userData.id);
  if (credsError || !creds || creds.length === 0) {
    return res.status(404).json({ error: 'No credentials found for user' });
  }

  // Prepare credentials for WebAuthn
  const allowCredentials = creds.map(cred => ({
    id: Buffer.from(cred.credential_id, 'base64'),
    type: 'public-key',
    transports: cred.transports || undefined,
  }));

  const rpID = process.env.RP_ID || 'localhost';

  const options = generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification: 'preferred',
    timeout: 60000,
  });

  return res.status(200).json({ options, userId: userData.id });
} 