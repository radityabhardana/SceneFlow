import { foreignKey, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { characters } from "./characters";
import { locations } from "./locations";
import { projects } from "./projects";

export const characterStates = sqliteTable(
  "character_states",
  {
    projectId: text("project_id").notNull(),
    characterId: text("character_id").notNull(),
    locationId: text("location_id"),
    emotion: text("emotion"),
    condition: text("condition"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.characterId] }),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "character_states_project_id_projects_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.projectId, table.characterId],
      foreignColumns: [characters.projectId, characters.id],
      name: "character_states_character_fk",
    }).onDelete("no action"),
    foreignKey({
      columns: [table.projectId, table.locationId],
      foreignColumns: [locations.projectId, locations.id],
      name: "character_states_location_fk",
    }).onDelete("no action"),
  ],
);
