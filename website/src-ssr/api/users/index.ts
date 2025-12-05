import type { Request, Response } from 'express';
import { directusFetch } from '../lib/directus';
import { createRememberMeCookie } from '../lib/auth-config';

const ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

interface DirectusUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

// POST /api/users - Register a new user
export const POST = async (req: Request, res: Response) => {
  const { email, password, first_name, last_name } = req.body as RegisterRequest;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  // Create user via admin token (hook will assign default role)
  const result = await directusFetch<DirectusUser>('/users', {
    method: 'POST',
    body: {
      email,
      password,
      first_name: first_name || null,
      last_name: last_name || null,
    },
    token: ADMIN_TOKEN,
  });

  if (result.error) {
    // Handle common errors with user-friendly messages
    let errorMessage = result.error;
    if (result.error.includes('unique') || result.error.includes('duplicate')) {
      errorMessage = 'An account with this email already exists';
    }
    res.status(result.status).json({ error: errorMessage });
    return;
  }

  // Auto-login after successful registration using session mode
  const loginResult = await directusFetch('/auth/login', {
    method: 'POST',
    body: {
      email,
      password,
      mode: 'session',
    },
  });

  if (loginResult.error) {
    // Registration succeeded but login failed
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please sign in.',
    });
    return;
  }

  // Collect cookies to set
  const cookies: string[] = loginResult.cookies || [];

  // Add remember-me cookie (persistent by default for new registrations)
  cookies.push(createRememberMeCookie(true));

  if (cookies.length > 0) {
    res.setHeader('Set-Cookie', cookies);
  }

  // Fetch user data after login
  const userResult = await directusFetch<DirectusUser>('/users/me', {
    method: 'GET',
    cookies: cookies.join('; '),
  });

  res.status(201).json({
    success: true,
    user: userResult.data ? {
      id: userResult.data.id,
      email: userResult.data.email,
      first_name: userResult.data.first_name,
      last_name: userResult.data.last_name,
    } : null,
  });
};
