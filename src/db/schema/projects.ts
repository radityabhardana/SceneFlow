import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const aspectRatios = ["16:9", "9:16", "1:1"] as const;

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  premise: text("premise").notNull(),
  genre: text("genre").notNull(),
  tone: text("tone").notNull(),
  aspectRatio: text("aspect_ratio", { enum: aspectRatios }).notNull(),
  visualStyle: text("visual_style").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});
