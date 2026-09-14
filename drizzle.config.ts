import { mkdirSync } from "node:fs";
import path from "node:path";

import { defineConfig } from "drizzle-kit";

const databasePath = process.env.SCENEFLOW_DATABASE_PATH ?? "./data/sceneflow.db";
mkdirSync(path.dirname(path.resolve(databasePath)), { recursive: true });

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url: databasePath,
  },
});
