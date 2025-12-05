<template>
  <q-page class="auth-page">
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="logo-text">Your App</div>
      </div>

      <!-- Success icon -->
      <div class="auth-icon">
        <div class="icon-circle success">
          <q-icon name="check" />
        </div>
      </div>

      <!-- Title -->
      <h1 class="auth-title text-center">Password Changed</h1>
      <p class="auth-subtitle text-center">
        Your password has been successfully reset.<br>
        You can now sign in with your new password.
      </p>

      <!-- Action -->
      <q-btn
        label="Continue to Sign In"
        class="full-width auth-btn auth-btn-primary"
        unelevated
        to="/auth/sign-in"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
// No logic needed for this simple confirmation page
</script>
