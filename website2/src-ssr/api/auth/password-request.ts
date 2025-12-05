import type { Request, Response } from 'express';
import { directusFetch } from '../lib/directus';

interface PasswordRequestBody {
  email: string;
}

// POST /api/auth/password/request
export const POST = async (req: Request, res: Response) => {
  const { email } = req.body as PasswordRequestBody;

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  // Get the host from the request to build the reset URL
  const protocol = req.headers['x-forwarded-proto'] as string || 'http';
  const host = req.headers['x-forwarded-host'] as string || req.headers.host as string;
  const resetUrl = `${protocol}://${host}/auth/reset-password`;

  const result = await directusFetch('/auth/password/request', {
    method: 'POST',
    body: {
      email,
      reset_url: resetUrl,
    },
  });

  if (result.error) {
    // Don't reveal if email exists or not for security
    // Always return success to prevent email enumeration
    console.warn('Password reset request error:', result.error);
  }

  // Always return success to prevent email enumeration attacks
  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
};
