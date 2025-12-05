<template>
  <q-page class="auth-page">
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="logo-text">Your App</div>
      </div>

      <!-- Title -->
      <h1 class="auth-title">Create New Password</h1>
      <p class="auth-subtitle">
        Your new password must be different from previous passwords
      </p>

      <!-- Error message -->
      <div v-if="error" class="auth-message error">
        {{ error }}
      </div>

      <!-- Reset form -->
      <q-form @submit="onSubmit" class="auth-form">
        <q-input
          v-model="password"
          placeholder="New Password"
          :type="showPassword ? 'text' : 'password'"
          outlined
          :rules="[
            val => !!val || 'Password is required',
            val => val.length >= 8 || 'Password must be at least 8 characters'
          ]"
        >
          <template #prepend>
            <q-icon name="lock" color="grey-6" />
          </template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              color="grey-6"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <!-- Password requirements -->
        <ul class="password-requirements">
          <li :class="password.length >= 8 ? 'valid' : 'invalid'">
            <q-icon :name="password.length >= 8 ? 'check_circle' : 'radio_button_unchecked'" />
            At least 8 characters
          </li>
          <li :class="/[A-Z]/.test(password) ? 'valid' : 'invalid'">
            <q-icon :name="/[A-Z]/.test(password) ? 'check_circle' : 'radio_button_unchecked'" />
            One uppercase letter
          </li>
          <li :class="/[0-9]/.test(password) ? 'valid' : 'invalid'">
            <q-icon :name="/[0-9]/.test(password) ? 'check_circle' : 'radio_button_unchecked'" />
            One number
          </li>
        </ul>

        <q-input
          v-model="confirmPassword"
          placeholder="Confirm Password"
          :type="showConfirmPassword ? 'text' : 'password'"
          outlined
          :rules="[
            val => !!val || 'Please confirm your password',
            val => val === password || 'Passwords do not match'
          ]"
        >
          <template #prepend>
            <q-icon name="lock" color="grey-6" />
          </template>
          <template #append>
            <q-icon
              :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              color="grey-6"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </q-input>

        <q-btn
          type="submit"
          label="Reset Password"
          class="full-width auth-btn auth-btn-primary"
          unelevated
          :loading="authStore.loading"
        />
      </q-form>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const error = ref('');
const token = ref('');

onMounted(() => {
  // Get token from URL query parameter
  token.value = route.query.token as string || '';

  if (!token.value) {
    error.value = 'Invalid or missing reset token';
  }
});

async function onSubmit() {
  error.value = '';

  if (!token.value) {
    error.value = 'Invalid or missing reset token';
    return;
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  const result = await authStore.resetPassword(token.value, password.value);

  if (result.success) {
    await router.push('/auth/password-changed');
  } else {
    error.value = result.error || 'Failed to reset password. The link may have expired.';
  }
}
</script>
