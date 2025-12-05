import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // Auth routes (no header/drawer)
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: 'sign-in',
        name: 'sign-in',
        component: () => import('pages/auth/SignInPage.vue'),
        meta: { guest: true },
      },
      {
        path: 'sign-up',
        name: 'sign-up',
        component: () => import('pages/auth/SignUpPage.vue'),
        meta: { guest: true },
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('pages/auth/ForgotPasswordPage.vue'),
        meta: { guest: true },
      },
      {
        path: 'check-email',
        name: 'check-email',
        component: () => import('pages/auth/CheckEmailPage.vue'),
        meta: { guest: true },
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('pages/auth/ResetPasswordPage.vue'),
        meta: { guest: true },
      },
      {
        path: 'password-changed',
        name: 'password-changed',
        component: () => import('pages/auth/PasswordChangedPage.vue'),
        meta: { guest: true },
      },
    ],
  },

  // Main app routes (with header/drawer)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/IndexPage.vue'),
      },
      // Add more protected routes here
      // {
      //   path: 'dashboard',
      //   name: 'dashboard',
      //   component: () => import('pages/DashboardPage.vue'),
      //   meta: { requiresAuth: true },
      // },
    ],
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
