import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { prismaClient } from "../../db/client.js";
import type { AppContext } from "../../index.js";

export class UpdateVault extends OpenAPIRoute {
  schema = {
    operationId: "UpdateVault",
    request: {
      params: z.object({
        orgId: z.uuidv7(),
        vaultId: z.uuidv7(),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string().min(1).max(100),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const prisma = prismaClient(c);

    const existing = await prisma.vault.findFirst({
      where: {
        id: data.params.vaultId,
        userVaults: {
          some: { user: { orgId: data.params.orgId } },
        },
      },
    });

    if (!existing) {
      return c.json({ success: false, error: "Vault not found" }, 404);
    }

    const vault = await prisma.vault.update({
      where: { id: data.params.vaultId },
      data: { name: data.body.name },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return c.json({ success: true, result: { vault } });
  }
}
