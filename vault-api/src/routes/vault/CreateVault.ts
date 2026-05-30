import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { prismaClient } from "../../db/client.js";
import type { AppContext } from "../../index.js";

export class CreateVault extends OpenAPIRoute {
  schema = {
    operationId: "CreateVault",
    request: {
      params: z.object({
        orgId: z.uuidv7(),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string().min(1).max(100),
              adminUserId: z.uuidv7(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const prisma = prismaClient(c);

    const vault = await prisma.vault.create({
      data: {
        name: data.body.name,
        userVaults: {
          create: {
            userId: data.body.adminUserId,
            wrappedKey: "",
            permCanCreateItems: true,
            permCanRemoveUserFromVault: true,
            permCanAddUserFromVault: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return c.json({ success: true, result: { vault } }, 201);
  }
}
