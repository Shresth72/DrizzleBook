import fastify from "fastify";
import guard from "fastify-guard";
import { logger } from "./logger";
import jwt from "jsonwebtoken";
import { applicationRoutes } from "../modules/applications/applications.routes";
import { usersRoutes } from "../modules/users/users.routes";
import { roleRoutes } from "../modules/roles/roles.routes";

type User = {
  id: string;
  applicationId: string;
  scopes: string[];
};

declare module "fastify" {
  interface FastifyRequest {
    user: User;
  }
}

export async function buildServer() {
  const server = fastify({
    logger: logger,
  });

  server.decorateRequest("user", null);

  server.addHook("onRequest", async (request, reply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return;
    }

    try {
      const token = authHeader.replace("Bearer ", "");
      const decoded = jwt.verify(token, "secret") as User;

      request.user = decoded;
    } catch (error) {
      reply.status(401).send({ message: "RIP BOZO" });
    }
  });

  //register plugins
  server.register(guard, {
    requestProperty: "user",
    scopeProperty: "scopes",

    errorHandler: (error, request, reply) => {
      reply.status(403).send({ message: "RIP BOZO" });
    },
  });

  //register routes
  server.register(applicationRoutes, { prefix: "/api/applications" });
  server.register(usersRoutes, { prefix: "/api/users" });
  server.register(roleRoutes, { prefix: "/api/roles" });

  return server;
}
