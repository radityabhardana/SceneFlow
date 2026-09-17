import { foreignKey, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { projects } from "./projects";

export const storyObjects = sqliteTable(
  "story_objects",
  {
    id: text("id").primaryKey().notNull(),
    projectId: text("project_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    visualLock: text("visual_lock"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    unique("story_objects_project_id_id_unique").on(table.projectId, table.id),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "story_objects_project_id_projects_id_fk",
    }).onDelete("cascade"),
  ],
);
