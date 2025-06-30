import { generateRegistrationOptions } from '@simplewebauthn/server';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get user info from request body
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing userId or email' });
    }

    // RP (Relying Party) info
    const rpName = 'DS UTH Exam Bank';
    const rpID = process.env.RP_ID || 'localhost';
    const origin = `https://${rpID}`;

    // Generate registration options
    const options = generateRegistrationOptions({
      rpName,
      rpID,
      userID: Buffer.from(userId, 'utf8'),
      userName: email,
      attestationType: 'none',
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      timeout: 60000,
    });

    // Return options to frontend
    return res.status(200).json(options);
  } catch (e) {
    console.error('Error in generate-registration-options:', e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
} 