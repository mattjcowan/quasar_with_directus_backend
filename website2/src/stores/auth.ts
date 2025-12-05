import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  location: string | null;
  title: string | null;
  description: string | null;
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  user?: T;
  message?: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const initialized = ref(false);

  // Getters
  const fullName = computed(() => {
    if (!user.value) return '';
    const parts = [user.value.first_name, user.value.last_name].filter(Boolean);
    return parts.join(' ');
  });

  const initials = computed(() => {
    if (!user.value) return '';
    if (user.value.first_name || user.value.last_name) {
      const firstInitial = user.value.first_name?.[0] || '';
      const lastInitial = user.value.last_name?.[0] || '';
      return (firstInitial + lastInitial).toUpperCase();
    }
    if (user.value.email?.[0]) {
      return user.value.email[0].toUpperCase();
    }
    return '';
  });

  // Actions
  async function initialize() {
    if (initialized.value) return;

    try {
      await fetchUser();
      // Check if session needs refresh after fetching user
      await checkAndRefresh();
    } catch {
      // User not authenticated, that's fine
    } finally {
      initialized.value = true;
    }
  }

  async function checkAndRefresh() {
    // Always refresh if authenticated to ensure cookie matches remember-me preference
    // This handles cases where user visited Directus directly and got a different cookie
    if (!isAuthenticated.value) return;

    await refreshSession();
  }

  async function login(
    email: string,
    password: string,
    rememberMe = false
  ): Promise<{ success: boolean; error?: string }> {
    loading.value = true;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include',
      });

      const data = await response.json() as ApiResponse;

      if (!response.ok || data.error) {
        return { success: false, error: data.error || 'Login failed' };
      }

      // Fetch user data after successful login
      try {
        await fetchUser();
      } catch (fetchError) {
        console.error('Failed to fetch user after login:', fetchError);
        // Still return success since login worked, user will be fetched on next page load
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: message };
    } finally {
      loading.value = false;
    }
  }

  async function register(data: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<{ success: boolean; error?: string }> {
    loading.value = true;

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json() as ApiResponse<User>;

      if (!response.ok || result.error) {
        return { success: false, error: result.error || 'Registration failed' };
      }

      // User is auto-logged in after registration
      if (result.user) {
        user.value = result.user;
        isAuthenticated.value = true;
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: message };
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      clearState();
    }
  }

  function clearState(): void {
    user.value = null;
    isAuthenticated.value = false;
  }

  async function fetchUser(): Promise<void> {
    const response = await fetch('/api/users/me', {
      credentials: 'include',
    });

    if (!response.ok) {
      user.value = null;
      isAuthenticated.value = false;
      throw new Error('Not authenticated');
    }

    const data = await response.json() as ApiResponse<User>;

    if (data.user) {
      user.value = data.user;
      isAuthenticated.value = true;
    }
  }

  async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    loading.value = true;

    try {
      const response = await fetch('/api/auth/password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json() as ApiResponse;

      // Always return success to prevent email enumeration
      return { success: true, error: data?.error };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      return { success: false, error: message };
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(token: string, password: string): Promise<{ success: boolean; error?: string }> {
    loading.value = true;

    try {
      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json() as ApiResponse;

      if (!response.ok || data.error) {
        return { success: false, error: data.error || 'Password reset failed' };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      return { success: false, error: message };
    } finally {
      loading.value = false;
    }
  }

  async function refreshSession(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch {
      user.value = null;
      isAuthenticated.value = false;
      return false;
    }
  }

  async function updateProfile(data: Partial<User>): Promise<{ success: boolean; error?: string }> {
    loading.value = true;

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json() as ApiResponse<User>;

      if (!response.ok || result.error) {
        return { success: false, error: result.error || 'Update failed' };
      }

      if (result.user) {
        user.value = result.user;
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      return { success: false, error: message };
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    loading,
    initialized,

    // Getters
    fullName,
    initials,

    // Actions
    initialize,
    checkAndRefresh,
    login,
    register,
    logout,
    clearState,
    fetchUser,
    requestPasswordReset,
    resetPassword,
    refreshSession,
    updateProfile,
  };
});
