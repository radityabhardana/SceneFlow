import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { objectStates, projects, storyObjects } from "@/db/schema";

import { StoryObjectIntegrityError, StoryObjectNotFoundError, StoryObjectValidationError } from "./types";
import type { StoryObject, StoryObjectInput } from "./types";
import { normalizeStoryObjectInput, validateStoryObjectInput } from "./validation";

function toStoryObject(row: typeof storyObjects.$inferSelect): StoryObject {
  return { ...row };
}

function ensureProject(projectId: string): void {
  if (!getDatabase().select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).get()) {
    throw new StoryObjectIntegrityError("project_not_found", projectId, `Project with id \"${projectId}\" was not found.`);
  }
}

function getExisting(projectId: string, objectId: string): typeof storyObjects.$inferSelect {
  const row = getDatabase().select().from(storyObjects).where(and(eq(storyObjects.projectId, projectId), eq(storyObjects.id, objectId))).get();
  if (!row) throw new StoryObjectNotFoundError(projectId, objectId);
  return row;
}

function nextTimestamp(previous: Date): Date {
  return new Date(Math.max(Date.now(), previous.getTime() + 1));
}

async function checkedInput(input: StoryObjectInput): Promise<StoryObjectInput> {
  const errors = await validateStoryObjectInput(input);
  if (Object.keys(errors).length > 0) throw new StoryObjectValidationError(errors);
  return normalizeStoryObjectInput(input);
}

export async function listStoryObjects(projectId: string): Promise<StoryObject[]> {
  return getDatabase().select().from(storyObjects).where(eq(storyObjects.projectId, projectId)).orderBy(desc(storyObjects.createdAt)).all().map(toStoryObject);
}

export async function getStoryObject(projectId: string, objectId: string): Promise<StoryObject | null> {
  const row = getDatabase().select().from(storyObjects).where(and(eq(storyObjects.projectId, projectId), eq(storyObjects.id, objectId))).get();
  return row ? toStoryObject(row) : null;
}

export async function createStoryObject(projectId: string, input: StoryObjectInput): Promise<StoryObject> {
  ensureProject(projectId);
  const normalized = await checkedInput(input);
  const now = new Date();
  const row = {
    id: randomUUID(),
    projectId,
    name: normalized.name,
    description: normalized.description,
    visualLock: normalized.visualLock ?? null,
    createdAt: now,
    updatedAt: now,
  };
  getDatabase().insert(storyObjects).values(row).run();
  return toStoryObject(row);
}

export async function updateStoryObject(projectId: string, objectId: string, input: StoryObjectInput): Promise<StoryObject> {
  const existing = getExisting(projectId, objectId);
  const normalized = await checkedInput(input);
  const updatedAt = nextTimestamp(existing.updatedAt);
  const values = { ...normalized, updatedAt };
  getDatabase().update(storyObjects).set(values).where(and(eq(storyObjects.projectId, projectId), eq(storyObjects.id, objectId))).run();
  return toStoryObject({ ...existing, ...values });
}

export async function deleteStoryObject(projectId: string, objectId: string): Promise<void> {
  getExisting(projectId, objectId);
  if (getDatabase().select({ objectId: objectStates.objectId }).from(objectStates).where(and(eq(objectStates.projectId, projectId), eq(objectStates.objectId, objectId))).get()) {
    throw new StoryObjectIntegrityError("object_in_use", projectId, "Story object cannot be deleted while object state exists.", objectId);
  }
  getDatabase().delete(storyObjects).where(and(eq(storyObjects.projectId, projectId), eq(storyObjects.id, objectId))).run();
}

export { StoryObjectIntegrityError, StoryObjectNotFoundError, StoryObjectValidationError } from "./types";
export { validateStoryObjectInput } from "./validation";
