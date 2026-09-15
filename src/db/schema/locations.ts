import { foreignKey, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { projects } from "./projects";

export const locations = sqliteTable(
  "locations",
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
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "locations_project_id_projects_id_fk",
    }).onDelete("cascade"),
  ],
);
