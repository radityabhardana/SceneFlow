import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { mkdirSync } from "node:fs";
import path from "node:path";

import * as schema from "./schema";

export type AppDatabase = ReturnType<typeof drizzle<typeof schema>>;

let sqliteDatabase: Database.Database | undefined;
let appDatabase: AppDatabase | undefined;
let initializedPath: string | undefined;

export function getDatabasePath(): string {
  return process.env.SCENEFLOW_DATABASE_PATH ?? path.join(process.cwd(), "data", "sceneflow.db");
}

export function getDatabase(): AppDatabase {
  const databasePath = path.resolve(getDatabasePath());

  if (appDatabase && initializedPath === databasePath) {
    return appDatabase;
  }

  closeDatabase();
  mkdirSync(path.dirname(databasePath), { recursive: true });
  sqliteDatabase = new Database(databasePath);
  sqliteDatabase.pragma("foreign_keys = ON");
  appDatabase = drizzle(sqliteDatabase, { schema });
  migrate(appDatabase, { migrationsFolder: path.join(process.cwd(), "src", "db", "migrations") });
  initializedPath = databasePath;

  return appDatabase;
}

export function closeDatabase(): void {
  sqliteDatabase?.close();
  sqliteDatabase = undefined;
  appDatabase = undefined;
  initializedPath = undefined;
}
