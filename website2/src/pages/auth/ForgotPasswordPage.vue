<template>
  <q-page class="auth-page">
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="logo-text">Your App</div>
      </div>

      <!-- Title -->
      <h1 class="auth-title">Forgot Password?</h1>
      <p class="auth-subtitle">
        Enter your email to reset your password
      </p>

      <!-- Error message -->
      <div v-if="error" class="auth-message error">
        {{ error }}
      </div>

      <!-- Reset request form -->
      <q-form @submit="onSubmit" class="auth-form">
        <q-input
          v-model="email"
          placeholder="Email"
          type="email"
          outlined
          :rules="[
            val => !!val || 'Email is required',
            val => /.+@.+\..+/.test(val) || 'Please enter a valid email'
          ]"
        >
          <template #prepend>
            <q-icon name="email" color="grey-6" />
          </template>
        </q-input>

        <q-btn
          type="submit"
          label="Submit"
          class="full-width auth-btn auth-btn-primary q-mb-md"
          unelevated
          :loading="authStore.loading"
        />

        <div class="text-center">
          <router-link to="/auth/sign-in" class="auth-link">
            <q-icon name="arrow_back" size="xs" class="q-mr-xs" />
            Back to Sign In
          </router-link>
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const error = ref('');

async function onSubmit() {
  error.value = '';

  const result = await authStore.requestPasswordReset(email.value);

  if (result.success) {
    // Navigate to check email page with email as query param
    await router.push({
      path: '/auth/check-email',
      query: { email: email.value }
    });
  } else {
    error.value = result.error || 'Failed to send reset email';
  }
}
</script>
