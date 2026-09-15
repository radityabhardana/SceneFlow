import { sql } from "drizzle-orm";
import { check, foreignKey, integer, primaryKey, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { projects } from "./projects";

export const characterStatuses = ["active", "inactive", "missing", "removed"] as const;

export const characters = sqliteTable(
  "characters",
  {
    id: text("id").notNull(),
    projectId: text("project_id").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    visualDescription: text("visual_description").notNull(),
    personality: text("personality").notNull(),
    voiceStyle: text("voice_style").notNull(),
    lockedTraits: text("locked_traits").notNull(),
    status: text("status", { enum: characterStatuses }).notNull().default("active"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id] }),
    unique("characters_project_id_id_unique").on(table.projectId, table.id),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "characters_project_id_projects_id_fk",
    }).onDelete("cascade"),
    check("characters_status_check", sql`${table.status} IN ('active', 'inactive', 'missing', 'removed')`),
    check("characters_personality_json_check", sql`json_valid(${table.personality}) AND json_type(${table.personality}) = 'array'`),
    check("characters_locked_traits_json_check", sql`json_valid(${table.lockedTraits}) AND json_type(${table.lockedTraits}) = 'array'`),
  ],
);
