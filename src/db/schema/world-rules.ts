import { sql } from "drizzle-orm";
import { check, foreignKey, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { projects } from "./projects";

export const worldRules = sqliteTable(
  "world_rules",
  {
    id: text("id").primaryKey().notNull(),
    projectId: text("project_id").notNull(),
    rule: text("rule").notNull(),
    locked: integer("locked", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "world_rules_project_id_projects_id_fk",
    }).onDelete("cascade"),
    check("world_rules_locked_check", sql`${table.locked} IN (0, 1)`),
  ],
);
