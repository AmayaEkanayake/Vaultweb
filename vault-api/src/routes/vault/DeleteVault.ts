import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { prismaClient } from "../../db/client.js";
import type { AppContext } from "../../index.js";

export class DeleteVault extends OpenAPIRoute {
  schema = {
    operationId: "DeleteVault",
    request: {
      params: z.object({
        orgId: z.uuidv7(),
        vaultId: z.uuidv7(),
      }),
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

    await prisma.vault.delete({ where: { id: data.params.vaultId } });

    return c.json({ success: true });
  }
}
