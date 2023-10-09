import { FastifyRequest, FastifyReply } from "fastify";
import { CreateApplicationBody } from "./applications.schemas";
import { createApplication, getApplications } from "./applications.services";
import { createRole } from "../roles/roles.services";
import {
  ALL_PERMISSIONS,
  SYSTEM_ROLES,
  USER_ROLE,
} from "../../config/permissions";

export async function createApplicationHandler(
  request: FastifyRequest<{
    Body: CreateApplicationBody;
  }>,
  reply: FastifyReply
) {
  const { name } = request.body;

  const application = await createApplication({
    name,
  });

  const superAdminRolePromise = createRole({
    applicationId: application.id,
    name: SYSTEM_ROLES.SUPER_ADMIN,
    permissions: ALL_PERMISSIONS as unknown as Array<string>,
  });

  const applicationUserRolePromise = createRole({
    applicationId: application.id,
    name: SYSTEM_ROLES.APPLICATION_USER,
    permissions: USER_ROLE as unknown as Array<string>,
  });

  const [superAdminRole, applicationUserRole] = await Promise.allSettled([
    superAdminRolePromise,
    applicationUserRolePromise,
  ]);

  if (superAdminRole.status === "rejected") {
    throw new Error("Failed to create super admin role");
  }

  if (applicationUserRole.status === "rejected") {
    throw new Error("Failed to create application user role");
  }

  return {
    application,
    superAdminRole: superAdminRole.value,
    applicationUserRole: applicationUserRole.value,
  };
}

export async function getApplicationsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  return getApplications();
}
