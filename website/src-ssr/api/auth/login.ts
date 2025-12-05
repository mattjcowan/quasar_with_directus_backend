import type { Request, Response } from 'express';
import { directusFetch } from '../lib/directus';
import { createRememberMeCookie, makeSessionCookie } from '../lib/auth-config';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// POST /api/auth/login
export const POST = async (req: Request, res: Response) => {
  const { email, password, rememberMe = false } = req.body as LoginRequest;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  // Use session mode - Directus will set the session cookie
  const result = await directusFetch('/auth/login', {
    method: 'POST',
    body: {
      email,
      password,
      mode: 'session',
    },
  });

  if (result.error) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  // Forward Directus's session cookie and add our remember-me cookie
  let cookies: string[] = result.cookies || [];

  console.log('Login - rememberMe:', rememberMe);
  console.log('Login - original cookies:', cookies);

  // If not remember-me, convert Directus cookies to session cookies (no Max-Age)
  if (!rememberMe) {
    cookies = cookies.map(makeSessionCookie);
    console.log('Login - after makeSessionCookie:', cookies);
  }

  cookies.push(createRememberMeCookie(rememberMe));

  res.setHeader('Set-Cookie', cookies);

  res.json({
    success: true,
  });
};
