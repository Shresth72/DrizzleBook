import { FastifyRequest, FastifyReply } from "fastify";
import { CreateRoleBody } from "./roles.schema";
import { createRole } from "./roles.services";

export async function createRoleHandler(
  request: FastifyRequest<{ Body: CreateRoleBody }>,
  reply: FastifyReply
) {
  const user = request.user;
  const applicationId = user.applicationId;
  const { name, permissions } = request.body;

  const role = await createRole({
    name,
    applicationId,
    permissions,
  });

  return role;
}
