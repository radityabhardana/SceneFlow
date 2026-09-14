import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { projects } from "@/db/schema";

import { normalizeProjectInput, validateProjectInput } from "./validation";
import { ProjectNotFoundError, ProjectValidationError } from "./types";
import type { Project, ProjectInput } from "./types";

function toProject(row: typeof projects.$inferSelect): Project {
  return {
    id: row.id,
    title: row.title,
    premise: row.premise,
    genre: row.genre,
    tone: row.tone,
    aspectRatio: row.aspectRatio,
    visualStyle: row.visualStyle,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function checkedInput(input: ProjectInput): ProjectInput {
  const errors = validateProjectInput(input);
  if (Object.keys(errors).length > 0) {
    throw new ProjectValidationError(errors);
  }

  return normalizeProjectInput(input);
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const normalizedInput = checkedInput(input);
  const now = new Date();
  const row = {
    id: randomUUID(),
    ...normalizedInput,
    createdAt: now,
    updatedAt: now,
  };

  getDatabase().insert(projects).values(row).run();
  return toProject(row);
}

export async function listProjects(): Promise<Project[]> {
  const rows = getDatabase().select().from(projects).orderBy(desc(projects.createdAt)).all();
  return rows.map(toProject);
}

export async function getProject(id: string): Promise<Project | null> {
  const row = getDatabase().select().from(projects).where(eq(projects.id, id)).get();
  return row ? toProject(row) : null;
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const normalizedInput = checkedInput(input);
  const existing = getDatabase().select().from(projects).where(eq(projects.id, id)).get();
  if (!existing) {
    throw new ProjectNotFoundError(id);
  }

  const updatedAt = new Date(Math.max(Date.now(), existing.updatedAt.getTime() + 1));
  getDatabase().update(projects).set({ ...normalizedInput, updatedAt }).where(eq(projects.id, id)).run();

  const updated = getDatabase().select().from(projects).where(eq(projects.id, id)).get();
  if (!updated) {
    throw new ProjectNotFoundError(id);
  }

  return toProject(updated);
}

export { validateProjectInput } from "./validation";
export { ProjectNotFoundError, ProjectValidationError } from "./types";
export type { AspectRatio, Project, ProjectInput, ProjectValidationErrors } from "./types";
