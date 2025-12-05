import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'stores/auth';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Navigation guards
  Router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore(store);

    // Initialize auth if not done yet
    if (!authStore.initialized) {
      await authStore.initialize();
    }

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const isGuestOnly = to.matched.some(record => record.meta.guest);

    if (requiresAuth && !authStore.isAuthenticated) {
      // Redirect to login with return URL
      next({
        name: 'sign-in',
        query: { redirect: to.fullPath },
      });
    } else if (isGuestOnly && authStore.isAuthenticated) {
      // Redirect authenticated users away from auth pages
      next({ path: '/' });
    } else {
      next();
    }
  });

  return Router;
});
