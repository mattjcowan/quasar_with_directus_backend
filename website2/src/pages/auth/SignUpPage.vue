<template>
  <q-page class="auth-page">
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="logo-text">Your App</div>
      </div>

      <!-- Title -->
      <h1 class="auth-title">Sign Up</h1>
      <p class="auth-subtitle">
        Already have an account?
        <router-link to="/auth/sign-in">Sign In</router-link>
      </p>

      <!-- Error message -->
      <div v-if="error" class="auth-message error">
        {{ error }}
      </div>

      <!-- Registration form -->
      <q-form @submit="onSubmit" class="auth-form">
        <div class="row q-gutter-sm">
          <q-input
            v-model="firstName"
            placeholder="First Name"
            outlined
            class="col"
            :rules="[val => !!val || 'First name is required']"
          >
            <template #prepend>
              <q-icon name="person" color="grey-6" />
            </template>
          </q-input>

          <q-input
            v-model="lastName"
            placeholder="Last Name"
            outlined
            class="col"
            :rules="[val => !!val || 'Last name is required']"
          >
            <template #prepend>
              <q-icon name="person" color="grey-6" />
            </template>
          </q-input>
        </div>

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

        <q-input
          v-model="password"
          placeholder="Password"
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

        <q-checkbox
          v-model="agreeTerms"
          class="auth-checkbox q-mb-md"
        >
          <template #default>
            <span class="text-body2">
              I agree to the
              <router-link to="/terms" class="auth-link">Terms of Service</router-link>
              and
              <router-link to="/privacy" class="auth-link">Privacy Policy</router-link>
            </span>
          </template>
        </q-checkbox>

        <q-btn
          type="submit"
          label="Create Account"
          class="full-width auth-btn auth-btn-primary"
          unelevated
          :loading="authStore.loading"
          :disable="!agreeTerms"
        />
      </q-form>

      <!-- Social signup divider -->
      <div class="auth-divider">
        <span>Or sign up with</span>
      </div>

      <!-- Social buttons -->
      <div class="row q-gutter-sm">
        <q-btn
          class="col social-btn"
          unelevated
          @click="socialSignup('google')"
        >
          <q-icon name="img:https://www.google.com/favicon.ico" size="18px" class="q-mr-sm" />
          Google
        </q-btn>
        <q-btn
          class="col social-btn"
          unelevated
          @click="socialSignup('apple')"
        >
          <q-icon name="mdi-apple" size="20px" class="q-mr-sm" />
          Apple
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreeTerms = ref(false);
const error = ref('');

async function onSubmit() {
  error.value = '';

  // Validate password requirements
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  const result = await authStore.register({
    email: email.value,
    password: password.value,
    first_name: firstName.value,
    last_name: lastName.value,
  });

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Account created successfully!',
      icon: 'check_circle',
    });

    // Redirect to home after registration
    await router.push('/');
  } else {
    error.value = result.error || 'Registration failed. Please try again.';
  }
}

function socialSignup(provider: string) {
  $q.notify({
    type: 'info',
    message: `${provider} signup coming soon`,
    icon: 'info',
  });
}
</script>
