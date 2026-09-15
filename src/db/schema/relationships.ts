import { sql } from "drizzle-orm";
import { check, foreignKey, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { characters } from "./characters";
import { projects } from "./projects";

export const characterRelationships = sqliteTable(
  "character_relationships",
  {
    id: text("id").primaryKey().notNull(),
    projectId: text("project_id").notNull(),
    fromCharacterId: text("from_character_id").notNull(),
    toCharacterId: text("to_character_id").notNull(),
    type: text("type").notNull(),
    description: text("description").notNull(),
    strength: integer("strength"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "character_relationships_project_id_projects_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.projectId, table.fromCharacterId],
      foreignColumns: [characters.projectId, characters.id],
      name: "character_relationships_from_character_fk",
    }).onDelete("no action"),
    foreignKey({
      columns: [table.projectId, table.toCharacterId],
      foreignColumns: [characters.projectId, characters.id],
      name: "character_relationships_to_character_fk",
    }).onDelete("no action"),
    check("character_relationships_no_self_check", sql`${table.fromCharacterId} <> ${table.toCharacterId}`),
    check("character_relationships_strength_check", sql`${table.strength} IS NULL OR (${table.strength} >= 0 AND ${table.strength} <= 100 AND ${table.strength} = CAST(${table.strength} AS INTEGER))`),
  ],
);
