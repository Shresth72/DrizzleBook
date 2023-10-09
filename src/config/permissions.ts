export const ALL_PERMISSIONS = [
  //users
  "users:roles:write", // ALlowed to add a role to a user
  "users:roles:delete", // Allowed to delete the roles of a user

  //roles
  "roles:write", // Allowed to create a role

  //posts
  "posts:write",
  "posts:read",
  "posts:delete",
  "posts:edit-own",
] as const;

export const PERMISSIONS = ALL_PERMISSIONS.reduce((acc, permission) => {
  acc[permission] = permission;

  return acc;
}, {} as Record<(typeof ALL_PERMISSIONS)[number], (typeof ALL_PERMISSIONS)[number]>);

export const USER_ROLE = [
  PERMISSIONS["users:roles:write"],
  PERMISSIONS["users:roles:delete"],
] as const;

export const SYSTEM_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  APPLICATION_USER: "APPLICATION_USER",
};
