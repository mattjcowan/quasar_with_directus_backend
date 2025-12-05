import type { Request, Response } from 'express';
import { directusFetch } from '../lib/directus';
import {
  hasSessionCookie,
  clearSessionCookie,
  clearRememberMeCookie,
  getRememberMeValue,
  createRememberMeCookie,
  makeSessionCookie,
  REMEMBER_ME_PERSISTENT,
} from '../lib/auth-config';

// POST /api/auth/refresh
export const POST = async (req: Request, res: Response) => {
  const cookies = req.headers.cookie;

  if (!hasSessionCookie(cookies)) {
    res.status(401).json({ error: 'No session available' });
    return;
  }

  // Refresh session with Directus
  const result = await directusFetch('/auth/refresh', {
    method: 'POST',
    body: {
      mode: 'session',
    },
    cookies,
  });

  if (result.error) {
    // If session is invalid (401), clear stale cookies
    if (result.status === 401) {
      res.setHeader('Set-Cookie', [
        clearSessionCookie(),
        clearRememberMeCookie(),
      ]);
    }
    res.status(result.status).json({ error: result.error });
    return;
  }

  // Check remember-me preference
  // If missing (Directus admin login), default to session-only (value '1')
  const rememberMeValue = getRememberMeValue(cookies);
  const isPersistent = rememberMeValue === REMEMBER_ME_PERSISTENT;

  // Forward new session cookie from Directus
  if (result.cookies && result.cookies.length > 0) {
    let responseCookies: string[] = result.cookies;

    // If not persistent, convert to session cookies (no Max-Age)
    if (!isPersistent) {
      responseCookies = responseCookies.map(makeSessionCookie);
    }

    // If no remember-me cookie existed, create one with session-only value
    if (rememberMeValue === null) {
      responseCookies.push(createRememberMeCookie(false));
    }

    res.setHeader('Set-Cookie', responseCookies);
  }

  res.json({
    success: true,
  });
};
