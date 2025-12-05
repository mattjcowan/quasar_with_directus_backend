import type { Request, Response } from 'express';
import { directusFetch } from '../lib/directus';

interface PasswordResetBody {
  token: string;
  password: string;
}

// POST /api/auth/password/reset
export const POST = async (req: Request, res: Response) => {
  const { token, password } = req.body as PasswordResetBody;

  if (!token || !password) {
    res.status(400).json({ error: 'Token and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const result = await directusFetch('/auth/password/reset', {
    method: 'POST',
    body: {
      token,
      password,
    },
  });

  if (result.error) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.json({
    success: true,
    message: 'Password has been reset successfully.',
  });
};
