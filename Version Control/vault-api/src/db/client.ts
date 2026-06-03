import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import type { AppContext } from "../index.js";
import { PrismaClient } from "../generated/prisma/client.js";

export function prismaClient(c: AppContext) {
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  return prisma;
}
