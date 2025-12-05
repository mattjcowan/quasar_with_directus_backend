<template>
  <q-page class="auth-page">
    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="logo-text">Your App</div>
      </div>

      <!-- Title -->
      <h1 class="auth-title">Sign In</h1>
      <p class="auth-subtitle">
        New Here?
        <router-link to="/auth/sign-up">Create an Account</router-link>
      </p>

      <!-- Error message -->
      <div v-if="error" class="auth-message error">
        {{ error }}
      </div>

      <!-- Login form -->
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

        <q-input
          v-model="password"
          placeholder="Password"
          :type="showPassword ? 'text' : 'password'"
          outlined
          :rules="[val => !!val || 'Password is required']"
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

        <div class="auth-helper-row">
          <q-checkbox
            v-model="rememberMe"
            label="Remember me"
            dense
            class="auth-checkbox"
          />
          <router-link to="/auth/forgot-password" class="auth-link">
            Forgot Password?
          </router-link>
        </div>

        <q-btn
          type="submit"
          label="Sign In"
          class="full-width auth-btn auth-btn-primary"
          unelevated
          :loading="authStore.loading"
        />
      </q-form>

      <!-- Social login divider -->
      <div class="auth-divider">
        <span>Or sign in with</span>
      </div>

      <!-- Social buttons -->
      <div class="row q-gutter-sm">
        <q-btn
          class="col social-btn"
          unelevated
          @click="socialLogin('google')"
        >
          <q-icon name="img:https://www.google.com/favicon.ico" size="18px" class="q-mr-sm" />
          Google
        </q-btn>
        <q-btn
          class="col social-btn"
          unelevated
          @click="socialLogin('apple')"
        >
          <q-icon name="mdi-apple" size="20px" class="q-mr-sm" />
          Apple
        </q-btn>
      </div>

      <!-- Footer -->
      <div class="auth-footer">
        <router-link to="/terms">Terms</router-link>
        <router-link to="/privacy">Privacy</router-link>
        <router-link to="/contact">Contact</router-link>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const error = ref('');

async function onSubmit() {
  error.value = '';

  const result = await authStore.login(email.value, password.value, rememberMe.value);

  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Welcome back!',
      icon: 'check_circle',
    });

    // Redirect to intended page or home
    const redirect = route.query.redirect as string || '/';
    await router.push(redirect);
  } else {
    error.value = result.error || 'Invalid email or password';
  }
}

function socialLogin(provider: string) {
  $q.notify({
    type: 'info',
    message: `${provider} login coming soon`,
    icon: 'info',
  });
}
</script>
