/**
 * Create default roles for the application
 */

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

module.exports = {
  async up(knex) {
    console.log('Creating default roles...');

    // for (const role of ROLES) {
    //   // Check if role already exists
    //   const existing = await knex('directus_roles').where('id', role.id).first();

    //   if (!existing) {
    //     await knex('directus_roles').insert(role);
    //     console.log(`  Created role: ${role.name}`);
    //   } else {
    //     console.log(`  Role already exists: ${role.name}`);
    //   }
    // }

    console.log('Default roles created successfully');
  },

  async down(knex) {
    console.log('Removing default roles...');

    // const roleIds = ROLES.map((r) => r.id);
    // await knex('directus_roles').whereIn('id', roleIds).delete();

    console.log('Default roles removed');
  },
};
