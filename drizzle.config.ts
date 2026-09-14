import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url: process.env.SCENEFLOW_DATABASE_PATH ?? "./data/sceneflow.db",
  },
});
