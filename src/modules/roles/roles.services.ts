import { InferInsertModel, and, eq } from "drizzle-orm";
import { roles } from "../../db/schema";
import { db } from "../../db";

export async function createRole(data: InferInsertModel<typeof roles>) {
  const result = await db.insert(roles).values(data).returning();
  return result[0];
}

export async function getRoleByName({
  name,
  applicationId,
}: {
  name: string;
  applicationId: string;
}) {
  // SELECT * FROM roles
  // WHERE name = $1 AND applicationId = $2

  const result = await db
    .select()
    .from(roles)
    .where(and(eq(roles.name, name), eq(roles.applicationId, applicationId)))
    .limit(1);

  return result[0];
}
