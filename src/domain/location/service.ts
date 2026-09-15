import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { locations, projects } from "@/db/schema";

import { LocationIntegrityError, LocationNotFoundError, LocationValidationError } from "./types";
import type { Location, LocationInput } from "./types";
import { normalizeLocationInput, validateLocationInput } from "./validation";

function toLocation(row: typeof locations.$inferSelect): Location {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    description: row.description,
    visualLock: row.visualLock,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function ensureProject(projectId: string): void {
  const project = getDatabase().select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).get();
  if (!project) {
    throw new LocationIntegrityError("project_not_found", `Project with id \"${projectId}\" was not found.`);
  }
}

function getExisting(projectId: string, locationId: string): typeof locations.$inferSelect {
  const row = getDatabase().select().from(locations).where(and(eq(locations.projectId, projectId), eq(locations.id, locationId))).get();
  if (!row) {
    throw new LocationNotFoundError(projectId, locationId);
  }
  return row;
}

function nextTimestamp(previous: Date): Date {
  return new Date(Math.max(Date.now(), previous.getTime() + 1));
}

async function checkedInput(input: LocationInput): Promise<LocationInput> {
  const errors = await validateLocationInput(input);
  if (Object.keys(errors).length > 0) {
    throw new LocationValidationError(errors);
  }
  return normalizeLocationInput(input);
}

export async function listLocations(projectId: string): Promise<Location[]> {
  const rows = getDatabase().select().from(locations).where(eq(locations.projectId, projectId)).orderBy(desc(locations.createdAt)).all();
  return rows.map(toLocation);
}

export async function createLocation(projectId: string, input: LocationInput): Promise<Location> {
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
  getDatabase().insert(locations).values(row).run();
  return toLocation(row);
}

export async function updateLocation(projectId: string, locationId: string, input: LocationInput): Promise<Location> {
  const existing = getExisting(projectId, locationId);
  const normalized = await checkedInput(input);
  const updatedAt = nextTimestamp(existing.updatedAt);
  const values = { ...normalized, updatedAt };
  getDatabase().update(locations).set(values).where(and(eq(locations.projectId, projectId), eq(locations.id, locationId))).run();
  return toLocation({ ...existing, ...values });
}

export async function deleteLocation(projectId: string, locationId: string): Promise<void> {
  getExisting(projectId, locationId);
  getDatabase().delete(locations).where(and(eq(locations.projectId, projectId), eq(locations.id, locationId))).run();
}

export { LocationIntegrityError, LocationNotFoundError, LocationValidationError } from "./types";
export { validateLocationInput } from "./validation";
