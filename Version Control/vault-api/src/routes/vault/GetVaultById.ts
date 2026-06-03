import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { prismaClient } from "../../db/client.js";
import type { AppContext } from "../../index.js";

export class GetVaultById extends OpenAPIRoute {
  schema = {
    operationId: "GetVaultById",
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

    const vault = await prisma.vault.findUnique({
      where: {
        id: data.params.vaultId,
      },
    });

    return c.json({
      success: true,
      result: {
        vault: vault,
      },
    });
  }
}
