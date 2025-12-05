import type { Request, Response } from 'express';
import { directusFetch } from '../lib/directus';
import { clearRememberMeCookie, clearSessionCookie } from '../lib/auth-config';

// POST /api/auth/logout
export const POST = async (req: Request, res: Response) => {
  const cookies = req.headers.cookie;

  if (cookies) {
    // Invalidate the session in Directus
    const result = await directusFetch('/auth/logout', {
      method: 'POST',
      body: {
        mode: 'session',
      },
      cookies,
    });

    if (result.error) {
      console.warn('Logout error:', result.error);
    }
  }

  // Clear both cookies explicitly
  res.setHeader('Set-Cookie', [
    clearSessionCookie(),
    clearRememberMeCookie(),
  ]);

  res.json({ success: true });
};
