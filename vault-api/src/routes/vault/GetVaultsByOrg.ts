import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { prismaClient } from "../../db/client.js";
import type { AppContext } from "../../index.js";

export class GetVaultsByOrg extends OpenAPIRoute {
  schema = {
    operationId: "GetVaultsByOrg",
    request: {
      params: z.object({
        orgId: z.uuidv7(),
      }),
    },
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const prisma = prismaClient(c);

    const vaults = await prisma.vault.findMany({
      where: {
        userVaults: {
          some: {
            user: { orgId: data.params.orgId },
          },
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ success: true, result: { vaults } });
  }
}
