import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { prismaClient } from "../../db/client.js";
import { UserRole } from "../../generated/prisma/enums.js";
import type { AppContext } from "../../index.js";

export class PostRegister extends OpenAPIRoute {
  schema = {
    operationId: "PostRegister",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: z.string().email(),
              passHash: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { email, passHash } = data.body;

    const prisma = prismaClient(c);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return c.json({ confirm: false, error: "Email already registered" }, 409);
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: passHash,
        role: UserRole.ORG_USER,
        orgId: undefined,
      },
    });

    return c.json({ confirm: true, id: user.id }, 201);
  }
}
