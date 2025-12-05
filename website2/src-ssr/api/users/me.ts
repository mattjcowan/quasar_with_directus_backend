import type { Request, Response } from 'express';
import { directusFetch } from '../lib/directus';
import { hasSessionCookie, clearSessionCookie, clearRememberMeCookie } from '../lib/auth-config';

interface DirectusUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  location: string | null;
  title: string | null;
  description: string | null;
}

// GET /api/users/me - Get current authenticated user
export const GET = async (req: Request, res: Response) => {
  const cookies = req.headers.cookie;

  if (!hasSessionCookie(cookies)) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Forward session cookie to Directus
  const result = await directusFetch<DirectusUser>('/users/me', {
    method: 'GET',
    cookies,
  });

  if (result.error) {
    // If session is invalid (401 or 403 permission error), clear stale cookies
    const isAuthError = result.status === 401 ||
      (result.status === 403 && result.error.includes('directus_users'));

    if (isAuthError) {
      res.setHeader('Set-Cookie', [
        clearSessionCookie(),
        clearRememberMeCookie(),
      ]);
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.json({
    user: {
      id: result.data?.id,
      email: result.data?.email,
      first_name: result.data?.first_name,
      last_name: result.data?.last_name,
      avatar: result.data?.avatar,
      location: result.data?.location,
      title: result.data?.title,
      description: result.data?.description,
    },
  });
};

// PATCH /api/users/me - Update current user profile
export const PATCH = async (req: Request, res: Response) => {
  const cookies = req.headers.cookie;

  if (!hasSessionCookie(cookies)) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { first_name, last_name, location, title, description } = req.body;

  // Forward session cookie to Directus
  const result = await directusFetch<DirectusUser>('/users/me', {
    method: 'PATCH',
    body: {
      first_name,
      last_name,
      location,
      title,
      description,
    },
    cookies,
  });

  if (result.error) {
    // If session is invalid (401 or 403 permission error), clear stale cookies
    const isAuthError = result.status === 401 ||
      (result.status === 403 && result.error.includes('directus_users'));

    if (isAuthError) {
      res.setHeader('Set-Cookie', [
        clearSessionCookie(),
        clearRememberMeCookie(),
      ]);
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.json({
    success: true,
    user: {
      id: result.data?.id,
      email: result.data?.email,
      first_name: result.data?.first_name,
      last_name: result.data?.last_name,
      avatar: result.data?.avatar,
      location: result.data?.location,
      title: result.data?.title,
      description: result.data?.description,
    },
  });
};
