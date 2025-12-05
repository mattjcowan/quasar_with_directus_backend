<template>
  <q-page class="auth-page">
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="logo-text">Your App</div>
      </div>

      <!-- Icon -->
      <div class="auth-icon">
        <div class="icon-circle info">
          <q-icon name="email" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="auth-title text-center">Check your Email</h1>
      <p class="auth-subtitle text-center">
        We sent a password reset link to<br>
        <strong>{{ email }}</strong>
      </p>

      <!-- Actions -->
      <div class="text-center q-mb-md">
        <p class="text-body2 text-grey-6 q-mb-sm">
          Didn't receive the email?
        </p>
        <q-btn
          label="Click to resend"
          flat
          class="auth-link"
          :loading="loading"
          @click="resendEmail"
        />
      </div>

      <q-btn
        label="Back to Sign In"
        class="full-width auth-btn auth-btn-light"
        unelevated
        to="/auth/sign-in"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';

const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const email = computed(() => route.query.email as string || 'your email');

async function resendEmail() {
  if (!route.query.email) {
    $q.notify({
      type: 'negative',
      message: 'Email address not found',
    });
    return;
  }

  loading.value = true;

  try {
    await authStore.requestPasswordReset(route.query.email as string);
    $q.notify({
      type: 'positive',
      message: 'Reset email sent!',
      icon: 'check_circle',
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to resend email',
    });
  } finally {
    loading.value = false;
  }
}
</script>
