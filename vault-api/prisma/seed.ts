import { createHash } from "crypto";
import { PrismaClient } from "../src/generated/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../dev.db");

const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const TEST_EMAIL = "admin@vault.com";
const TEST_PASSWORD = "password123";

async function seed() {
  const passwordHash = createHash("sha256").update(TEST_PASSWORD).digest("hex");

  const org = await prisma.org.create({ data: {} });

  const user = await prisma.user.create({
    data: {
      orgId: org.id,
      email: TEST_EMAIL,
      passwordHash,
      role: "ORG_ADMIN",
    },
  });

  console.log("✓ Org created:  ", org.id);
  console.log("✓ User created: ", user.email);
  console.log("");
  console.log("Test credentials:");
  console.log("  Email:    ", TEST_EMAIL);
  console.log("  Password: ", TEST_PASSWORD);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
