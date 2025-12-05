import type { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import express, { Router as createRouter } from 'express';

// Import all API route handlers
import * as health from './health';
import * as users from './users/index';
import * as usersById from './users/[id]';
import * as usersMe from './users/me';

// Auth routes
import * as authLogin from './auth/login';
import * as authLogout from './auth/logout';
import * as authRefresh from './auth/refresh';
import * as authPasswordRequest from './auth/password-request';
import * as authPasswordReset from './auth/password-reset';

export type ApiHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export interface ApiModule {
  GET?: ApiHandler;
  POST?: ApiHandler;
  PUT?: ApiHandler;
  PATCH?: ApiHandler;
  DELETE?: ApiHandler;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

// Route registry - add new routes here
const routes: Array<{ path: string; module: ApiModule }> = [
  { path: '/health', module: health },

  // Auth routes
  { path: '/auth/login', module: authLogin },
  { path: '/auth/logout', module: authLogout },
  { path: '/auth/refresh', module: authRefresh },
  { path: '/auth/password/request', module: authPasswordRequest },
  { path: '/auth/password/reset', module: authPasswordReset },

  // User routes
  { path: '/users', module: users },
  { path: '/users/me', module: usersMe },
  { path: '/users/:id', module: usersById },
];

/**
 * Wrap async handlers to catch errors
 */
function asyncHandler(fn: ApiHandler): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create the API router with all registered routes
 */
export function createApiRouter(): Router {
  const router = createRouter();

  // Add JSON body parser for API routes
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));

  // Register all routes
  for (const { path, module } of routes) {
    for (const method of HTTP_METHODS) {
      const handler = module[method];
      if (handler) {
        const expressMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
        router[expressMethod](path, asyncHandler(handler));
        console.log(`  ${method} /api${path}`);
      }
    }
  }

  return router;
}
