import { FastifyReply, FastifyRequest } from "fastify";
import {
  AssignRoleToUserBody,
  //   AssignRoleToUserBody,
  CreateUserBody,
  LoginBody,
} from "./users.schemas";
import { SYSTEM_ROLES } from "../../config/permissions";
import { getRoleByName } from "../roles/roles.services";
import {
  assignRoleTouser,
  createUser,
  getUserByEmail,
  getUsersByApplication,
} from "./users.services";
import jwt from "jsonwebtoken";
import { P } from "pino";
import { logger } from "../../utils/logger";

export async function createUserHandler(
  request: FastifyRequest<{
    Body: CreateUserBody;
  }>,
  reply: FastifyReply
) {
  const { initialUser, ...data } = request.body;

  const roleName = initialUser
    ? SYSTEM_ROLES.SUPER_ADMIN
    : SYSTEM_ROLES.APPLICATION_USER;

  if (roleName === SYSTEM_ROLES.SUPER_ADMIN) {
    const appUsers = await getUsersByApplication(data.applicationId);

    if (appUsers.length > 0) {
      return reply.code(400).send({
        message: "Application already has super admin user",
        extensions: {
          code: "APPLICATION_ALRADY_SUPER_USER",
          applicationId: data.applicationId,
        },
      });
    }
  }

  const role = await getRoleByName({
    name: roleName,
    applicationId: data.applicationId,
  });

  if (!role) {
    return reply.code(404).send({
      message: "Role not found",
    });
  }

  try {
    const user = await createUser(data);

    // assign a role to the user

    await assignRoleTouser({
      userId: user.id,
      roleId: role.id,
      applicationId: data.applicationId,
    });

    return user;
  } catch (e) {}
}

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginBody;
  }>,
  reply: FastifyReply
) {
  const { applicationId, email, password } = request.body;

  const user = await getUserByEmail({
    applicationId,
    email,
  });

  if (!user) {
    return reply.code(400).send({
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email,
      applicationId,
      scopes: user.permissions,
    },
    "secret"
  ); // change this secret or signing method, or get fired

  return { token };
}

export async function assignRoleToUserHandler(
  request: FastifyRequest<{
    Body: AssignRoleToUserBody;
  }>,
  reply: FastifyReply
) {
  const applicationId = request.user.applicationId;
  const { userId, roleId } = request.body;

  try {
    const result = await assignRoleTouser({
      userId,
      roleId,
      applicationId,
    });
    return result;
  } catch (e) {
    logger.error(e, `Failed to assign role to user ${userId}`);
    return reply.code(400).send({
      message: "Failed to assign role to user",
    });
  }
}
