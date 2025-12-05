import { Role } from './../node_modules/@directus/types/dist/users.d';
import { defineHook } from '@directus/extensions-sdk';
import type { RegisterFunctions, HookExtensionContext, User } from '@directus/types';

// See: 
// - https://directus.io/docs/guides/extensions/api-extensions/hooks#filter-events
// - https://directus.io/docs/guides/extensions/api-extensions/hooks#action-events
// - https://directus.io/docs/guides/extensions/api-extensions/hooks#init-events

// UUID of the "User" role created by migration 001-create-roles.js
const DEFAULT_USER_ROLE_ID = 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a';

// Consistent UUIDs for reproducibility across deployments
const ROLES = [
  {
    id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    name: "Employee",
    icon: "badge",
    description: "Internal employees with extended access",
    app_access: true,
    admin_access: false,
  },
  {
    id: "b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e",
    name: "Partner",
    icon: "handshake",
    description: "External partners with limited access",
    app_access: false,
    admin_access: false,
  },
  {
    id: "c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f",
    name: "Customer",
    icon: "shopping_cart",
    description: "Customers with basic access",
    app_access: false,
    admin_access: false,
  },
  {
    id: "d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a",
    name: "User",
    icon: "account_circle",
    description: "Default role for new user registrations",
    app_access: false,
    admin_access: false,
  },
];

export default defineHook((register: RegisterFunctions, context: HookExtensionContext) => {

  const { action } = register;
  const { services, logger, getSchema } = context;
  const { RolesService } = services;

  action('server.start', async (_meta, actionContext) => {
    const { database } = actionContext;

    // Query for an admin user in the directus_users table
    // const adminUser: {
    //   id: string;
    //   email: string;
    //   role: string;
    // } = await database('directus_users')
    //   .where('email', 'admin@example.com')
    //   .first();

    // Get the current database schema
    const schema = actionContext.schema?.collections ?
      actionContext.schema : await getSchema();

    // ---------------------------------------------------------
    // Create missing roles on system initialization
    const rolesService = new RolesService({ 
      schema, 
      knex: database,
      accountability: null,
      // nested: []
    });

    for (const role of ROLES) {
      const existing = await rolesService.readMany([role.id]);
      if (!existing || existing.length === 0) {
        await rolesService.createOne(role);
        logger.info(`Created missing role: ${role.name} (${role.id})`);
      }
    }
    
    // Manipulate tables directly (alternative approach)
    
    // const existingRoles = await database('directus_roles').select('id');
    // const existingRoleIds = existingRoles.map((role) => role.id);
    // for (const role of ROLES) {
    //   if (!existingRoleIds.includes(role.id)) {
    //     await database('directus_roles').insert(role);
    //     logger.info(`Created missing role: ${role.name} (${role.id})`);
    //   }
    // }

    // for (const role of ROLES) {
    //   const existing = await database('directus_roles').where('id', role.id).first();
    //   if (!existing) {
    //     await database('directus_roles').insert(role);
    //     console.log(`Created missing role: ${role.name} (${role.id})`);
    //   }
    // }

  });

  // Assign default role to newly created users (public registration)
  register.filter('users.create', (input: { role?: string; email?: string }) => {
    // Only assign role if none is specified (public registration)
    if (!input.role) {
      input.role = DEFAULT_USER_ROLE_ID;
      console.log(`Assigned default role to new user: ${input.email}`);
    }
    return input;
  });
});
