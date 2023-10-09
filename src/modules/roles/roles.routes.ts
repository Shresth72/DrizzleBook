import { FastifyInstance } from "fastify";
import { PERMISSIONS } from "../../config/permissions";
import { createRoleHandler } from "./roles.controllers";
import { createRoleJsonSchema, CreateRoleBody } from "./roles.schema";

export async function roleRoutes(app: FastifyInstance) {
  app.post<{
    Body: CreateRoleBody;
  }>(
    "/",
    {
      schema: createRoleJsonSchema,
      preHandler: [app.guard.scope(PERMISSIONS["roles:write"])],
    },
    createRoleHandler
  );
}
