/**
 * Directus API client for server-to-server communication
 */

import { authConfig } from './auth-config';

const DIRECTUS_URL = authConfig.directusUrl;

interface DirectusResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  cookies?: string;
  token?: string;
}

/**
 * Make a request to the Directus API
 */
export async function directusFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<{ data?: T; error?: string; status: number; cookies?: string[] }> {
  const { method = 'GET', body, headers = {}, cookies, token } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (cookies) {
    requestHeaders['Cookie'] = cookies;
  }

  try {
    const response = await fetch(`${DIRECTUS_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : null,
      referrer: '',
    });

    // Extract set-cookie headers for forwarding to client
    const setCookies = response.headers.getSetCookie?.() || [];

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        return {
          error: `Request failed with status ${response.status}`,
          status: response.status,
          cookies: setCookies
        };
      }
      return { data: undefined as T, status: response.status, cookies: setCookies };
    }

    const result = await response.json() as DirectusResponse<T>;

    if (!response.ok || result.errors) {
      const errorMessage = result.errors?.[0]?.message || `Request failed with status ${response.status}`;
      return { error: errorMessage, status: response.status, cookies: setCookies };
    }

    return result.data !== undefined
      ? { data: result.data, status: response.status, cookies: setCookies }
      : { status: response.status, cookies: setCookies };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: message, status: 500 };
  }
}

/**
 * Forward cookies from Directus response to Express response
 */
export function forwardCookies(
  setCookies: string[] | undefined,
  res: { setHeader: (name: string, value: string | string[]) => void }
): void {
  if (setCookies && setCookies.length > 0) {
    res.setHeader('Set-Cookie', setCookies);
  }
}
