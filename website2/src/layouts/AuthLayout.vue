<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Minimal layout for auth pages - no header/drawer
</script>

<style lang="scss">
// Color palette
$primary: #1b84ff;
$primary-hover: #0d6efd;
$gray-100: #f9f9f9;
$gray-200: #f1f1f4;
$gray-300: #dbdfe9;
$gray-400: #b5b5c3;
$gray-500: #99a1b7;
$gray-600: #78829d;
$gray-700: #4b5675;
$gray-800: #252f4a;
$gray-900: #071437;

// Auth page styles
.auth-page {
  min-height: 100vh;
  background: $gray-100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 460px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  padding: 40px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Logo
.auth-logo {
  text-align: center;
  margin-bottom: 32px;

  img {
    height: 40px;
  }

  .logo-text {
    font-size: 24px;
    font-weight: 700;
    color: $gray-900;
  }
}

// Typography
.auth-title {
  font-size: 24px;
  font-weight: 600;
  color: $gray-900;
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 14px;
  color: $gray-600;
  margin-bottom: 24px;

  a {
    color: $primary;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: $primary-hover;
    }
  }
}

// Form elements
.auth-form {
  .q-field {
    margin-bottom: 16px;
  }

  .q-field__control {
    height: 44px;
    border-radius: 8px;
  }

  .q-field--outlined .q-field__control {
    &::before {
      border-color: $gray-300;
    }

    &:hover::before {
      border-color: $gray-400;
    }
  }

  .q-field--focused .q-field__control {
    &::before {
      border-color: $primary !important;
    }

    &::after {
      box-shadow: 0 0 0 3px rgba($primary, 0.1);
      border-radius: 8px;
    }
  }

  .q-field__label {
    font-size: 14px;
    font-weight: 500;
    color: $gray-700;
  }

  .q-input__inner {
    font-size: 14px;
  }
}

// Buttons
.auth-btn {
  height: 44px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  text-transform: none;
  letter-spacing: 0;

  &.q-btn--standard {
    box-shadow: none;
  }
}

.auth-btn-primary {
  background: $primary !important;

  &:hover {
    background: $primary-hover !important;
  }
}

.auth-btn-light {
  background: $gray-200 !important;
  color: $gray-700 !important;

  &:hover {
    background: $gray-300 !important;
  }
}

// Social buttons
.social-btn {
  height: 44px;
  border-radius: 8px;
  background: $gray-100;
  border: 1px solid $gray-300;
  font-weight: 500;
  font-size: 14px;
  text-transform: none;
  color: $gray-700;

  &:hover {
    background: $gray-200;
    border-color: $gray-400;
  }

  img {
    width: 18px;
    height: 18px;
    margin-right: 8px;
  }
}

// Links
.auth-link {
  color: $primary;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    color: $primary-hover;
  }
}

.auth-link-muted {
  color: $gray-500;
  font-weight: 400;

  &:hover {
    color: $gray-700;
  }
}

// Divider with text
.auth-divider {
  display: flex;
  align-items: center;
  margin: 24px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: $gray-300;
  }

  span {
    padding: 0 16px;
    font-size: 13px;
    color: $gray-500;
  }
}

// Checkbox styling
.auth-checkbox {
  .q-checkbox__label {
    font-size: 14px;
    color: $gray-700;
  }
}

// Helper text row (forgot password, etc)
.auth-helper-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

// Error/success messages
.auth-message {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;

  &.error {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  &.success {
    background: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
  }
}

// Icon container for success/info pages
.auth-icon {
  text-align: center;
  margin-bottom: 24px;

  .icon-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &.success {
      background: #dcfce7;
      color: #16a34a;
    }

    &.info {
      background: #dbeafe;
      color: #2563eb;
    }

    .q-icon {
      font-size: 32px;
    }
  }
}

// Password requirements list
.password-requirements {
  margin-top: 8px;
  padding-left: 0;
  list-style: none;

  li {
    font-size: 12px;
    color: $gray-500;
    padding: 4px 0;
    display: flex;
    align-items: center;

    .q-icon {
      margin-right: 8px;
      font-size: 14px;
    }

    &.valid {
      color: #16a34a;
    }

    &.invalid {
      color: $gray-500;
    }
  }
}

// Footer links
.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
  color: $gray-500;

  a {
    color: $gray-600;
    text-decoration: none;
    margin: 0 8px;

    &:hover {
      color: $gray-800;
    }
  }
}
</style>
