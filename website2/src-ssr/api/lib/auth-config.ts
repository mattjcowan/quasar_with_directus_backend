/**
 * Auth configuration from environment variables
 *
 * Uses getters to read environment variables at access time (runtime),
 * not at module load time. This ensures Docker runtime env vars are used.
 */

export const authConfig = {
  // Session cookie name (managed by Directus)
  get sessionCookieName() {
    return process.env.SESSION_COOKIE_NAME || 'web_session';
  },

  // Website remember-me cookie name
  get rememberMeCookieName() {
    return `${this.sessionCookieName}_x`;
  },

  // Cookie security
  get cookieSecure() {
    return process.env.AUTH_COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  },
  get cookieSameSite() {
    return process.env.AUTH_COOKIE_SAME_SITE || 'Lax';
  },

  // Session TTL (parsed from Directus format like "7d", "24h")
  get sessionTTLSeconds() {
    const ttl = process.env.SESSION_COOKIE_TTL || '7d';
    return parseDuration(ttl);
  },

  // URLs
  get directusUrl() {
    return process.env.DIRECTUS_URL;
  },
  get ssrApiUrl() {
    return process.env.SSR_API_URL;
  },
};

/**
 * Parse Directus duration format (e.g., "7d", "24h", "15m") to seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match || match.length < 3) {
    // Default to 7 days if invalid format
    return 7 * 24 * 60 * 60;
  }

  const value = parseInt(match[1]!, 10);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60;
    case 'h':
      return value * 60 * 60;
    case 'm':
      return value * 60;
    case 's':
      return value;
    default:
      return 7 * 24 * 60 * 60;
  }
}

/**
 * Build cookie options string
 */
export function getCookieOptions(httpOnly = true): string {
  const options = [
    'Path=/',
    httpOnly ? 'HttpOnly' : '',
    authConfig.cookieSecure ? 'Secure' : '',
    `SameSite=${authConfig.cookieSameSite}`,
  ].filter(Boolean);

  return options.join('; ');
}

/**
 * Check if session cookie exists in cookie header
 */
export function hasSessionCookie(cookieHeader: string | undefined): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.includes(`${authConfig.sessionCookieName}=`);
}

/**
 * Check if remember-me cookie exists in cookie header
 */
export function hasRememberMeCookie(cookieHeader: string | undefined): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.includes(`${authConfig.rememberMeCookieName}=`);
}

/**
 * Remember-me cookie values
 * 1 = session only (no Max-Age, expires on browser close)
 * 2 = persistent (keeps Max-Age from Directus)
 */
export const REMEMBER_ME_SESSION = '1';
export const REMEMBER_ME_PERSISTENT = '2';

/**
 * Create remember-me cookie
 * @param persistent - If true, cookie persists across browser restarts
 */
export function createRememberMeCookie(persistent: boolean): string {
  const cookieOptions = getCookieOptions(false); // Not HttpOnly so JS can read it

  if (persistent) {
    // Persistent cookie with Max-Age (30 days)
    const thirtyDays = 30 * 24 * 60 * 60;
    return `${authConfig.rememberMeCookieName}=${REMEMBER_ME_PERSISTENT}; ${cookieOptions}; Max-Age=${thirtyDays}`;
  } else {
    // Session cookie (no Max-Age) - deleted when browser closes
    return `${authConfig.rememberMeCookieName}=${REMEMBER_ME_SESSION}; ${cookieOptions}`;
  }
}

/**
 * Get remember-me cookie value from cookie header
 * @returns '1' for session, '2' for persistent, null if not found
 */
export function getRememberMeValue(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`${authConfig.rememberMeCookieName}=([12])`));
  return match ? match[1]! : null;
}

/**
 * Modify auth cookie to be a session cookie (remove Max-Age and Expires)
 * @param cookieString - The Set-Cookie string from Directus
 * @returns Modified cookie string without Max-Age or Expires
 */
export function makeSessionCookie(cookieString: string): string {
  // Remove Max-Age and Expires attributes to make it a session cookie
  return cookieString
    .replace(/;\s*Max-Age=\d+/gi, '')
    .replace(/;\s*Expires=[^;]+/gi, '');
}

/**
 * Create Set-Cookie header to clear remember-me cookie
 */
export function clearRememberMeCookie(): string {
  return `${authConfig.rememberMeCookieName}=; Path=/; Max-Age=0`;
}

/**
 * Create Set-Cookie header to clear session cookie
 */
export function clearSessionCookie(): string {
  return `${authConfig.sessionCookieName}=; Path=/; HttpOnly; Max-Age=0`;
}
