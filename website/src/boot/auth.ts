import { boot } from 'quasar/wrappers';
import { useAuthStore } from 'stores/auth';

// Get cookie names from environment
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'web_session';
const SSR_API_URL = process.env.SSR_API_URL || 'http://localhost:3000';

export default boot(async ({ store, ssrContext }) => {
  const authStore = useAuthStore(store);

  // Initialize auth state
  // On server: will check cookies and fetch user
  // On client: will hydrate from SSR state or fetch user
  if (process.env.SERVER) {
    // Server-side: we need to forward cookies to the API
    if (ssrContext?.req?.headers?.cookie) {
      // Check if session cookie is present
      const cookies = ssrContext.req.headers.cookie;
      const hasSession = cookies.includes(SESSION_COOKIE_NAME);

      // Try to fetch user if session cookie exists
      if (hasSession) {
        try {
          // Make a server-side request to get user
          // Use internal URL since we're inside the same container
          const response = await fetch(`${SSR_API_URL}/api/users/me`, {
            headers: {
              Cookie: cookies,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              authStore.user = data.user;
              authStore.isAuthenticated = true;
            }
          }
        } catch (error) {
          console.error('SSR auth initialization error:', error);
        }
      }
    }
    authStore.initialized = true;
  } else {
    // Client-side: Initialize auth state
    // Note: Session cookie is HttpOnly, so we can't check document.cookie
    // Instead, just try to fetch the user - if it fails, we're not authenticated
    try {
      await authStore.fetchUser();
      // Check if session needs refresh
      await authStore.checkAndRefresh();
    } catch {
      // Session invalid (401) or no session - clear local state
      authStore.clearState();
    }

    authStore.initialized = true;
  }
});
