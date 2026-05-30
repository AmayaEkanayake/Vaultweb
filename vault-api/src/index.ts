import { serve } from "@hono/node-server";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { fromHono } from "chanfana";
import { GetVaultById } from "./routes/vault/GetVaultById.js";
import { GetVaultsByOrg } from "./routes/vault/GetVaultsByOrg.js";
import { CreateVault } from "./routes/vault/CreateVault.js";
import { UpdateVault } from "./routes/vault/UpdateVault.js";
import { DeleteVault } from "./routes/vault/DeleteVault.js";
import { PostLogin } from "./routes/auth/PostLogin.js";
import { GetUserById } from "./routes/users/GetUserById.js";

const app = new Hono();

app.use(cors({ origin: "http://localhost:5173" })); // Enable CORS for requests from the frontend running on localhost:5173

export type Env = {};
export type AppContext = Context<{ Bindings: Env }>;

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const openapi = fromHono(app);

openapi.get("/org/:orgId/vaults", GetVaultsByOrg);
openapi.get("/org/:orgId/vaults/:vaultId", GetVaultById);
openapi.post("/org/:orgId/vaults", CreateVault);
openapi.patch("/org/:orgId/vaults/:vaultId", UpdateVault);
openapi.delete("/org/:orgId/vaults/:vaultId", DeleteVault);
openapi.post("/auth/login", PostLogin);
openapi.get("/users/:userId", GetUserById);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
