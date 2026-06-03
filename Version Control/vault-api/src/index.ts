import { serve } from "@hono/node-server";
import { Hono, type Context } from "hono";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { fromHono } from "chanfana";
import { GetVaultById } from "./routes/vault/GetVaultById.js";

const app = new Hono();

export type Env = {};
export type AppContext = Context<{ Bindings: Env }>;

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const openapi = fromHono(app);

openapi.get("/org/:orgId/vaults/:vaultId", GetVaultById);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
