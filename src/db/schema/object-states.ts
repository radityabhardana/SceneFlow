import { sql } from "drizzle-orm";
import { check, foreignKey, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { characters } from "./characters";
import { locations } from "./locations";
import { projects } from "./projects";
import { storyObjects } from "./story-objects";

export const objectStates = sqliteTable(
  "object_states",
  {
    projectId: text("project_id").notNull(),
    objectId: text("object_id").notNull(),
    holderCharacterId: text("holder_character_id"),
    locationId: text("location_id"),
    condition: text("condition"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.objectId] }),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "object_states_project_id_projects_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.projectId, table.objectId],
      foreignColumns: [storyObjects.projectId, storyObjects.id],
      name: "object_states_object_fk",
    }).onDelete("no action"),
    foreignKey({
      columns: [table.projectId, table.holderCharacterId],
      foreignColumns: [characters.projectId, characters.id],
      name: "object_states_holder_character_fk",
    }).onDelete("no action"),
    foreignKey({
      columns: [table.projectId, table.locationId],
      foreignColumns: [locations.projectId, locations.id],
      name: "object_states_location_fk",
    }).onDelete("no action"),
    check("object_states_single_holder_or_location_check", sql`${table.holderCharacterId} IS NULL OR ${table.locationId} IS NULL`),
  ],
);
