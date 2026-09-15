import { randomUUID } from "node:crypto";
import { and, desc, eq, or } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { characterRelationships, characters, projects } from "@/db/schema";

import {
  CharacterRelationshipIntegrityError,
  CharacterRelationshipNotFoundError,
  CharacterRelationshipValidationError,
} from "./types";
import type {
  CharacterRelationship,
  CharacterRelationshipInput,
  CharacterRelationshipUpdateInput,
} from "./types";
import {
  normalizeCharacterRelationshipInput,
  normalizeCharacterRelationshipUpdateInput,
  validateCharacterRelationshipInput,
} from "./validation";

function toRelationship(row: typeof characterRelationships.$inferSelect): CharacterRelationship {
  return {
    id: row.id,
    projectId: row.projectId,
    fromCharacterId: row.fromCharacterId,
    toCharacterId: row.toCharacterId,
    type: row.type,
    description: row.description,
    strength: row.strength,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function ensureProject(projectId: string): void {
  const project = getDatabase().select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).get();
  if (!project) {
    throw new CharacterRelationshipIntegrityError("project_not_found", `Project with id \"${projectId}\" was not found.`);
  }
}

function ensureEndpoint(projectId: string, characterId: string): void {
  const character = getDatabase().select({ id: characters.id, status: characters.status }).from(characters).where(and(eq(characters.projectId, projectId), eq(characters.id, characterId))).get();
  if (!character) {
    throw new CharacterRelationshipIntegrityError("character_not_found", `Character with id \"${characterId}\" was not found in this project.`, characterId);
  }
  if (character.status === "removed") {
    throw new CharacterRelationshipIntegrityError("removed_character", `Removed character \"${characterId}\" cannot be a relationship endpoint.`, characterId);
  }
}

function getExisting(projectId: string, relationshipId: string): typeof characterRelationships.$inferSelect {
  const row = getDatabase().select().from(characterRelationships).where(and(eq(characterRelationships.projectId, projectId), eq(characterRelationships.id, relationshipId))).get();
  if (!row) {
    throw new CharacterRelationshipNotFoundError(projectId, relationshipId);
  }
  return row;
}

function nextTimestamp(previous: Date): Date {
  return new Date(Math.max(Date.now(), previous.getTime() + 1));
}

async function checkedInput(input: CharacterRelationshipInput | CharacterRelationshipUpdateInput): Promise<void> {
  const errors = await validateCharacterRelationshipInput(input);
  if (Object.keys(errors).length > 0) {
    throw new CharacterRelationshipValidationError(errors);
  }
}

export async function listRelationshipsByProject(projectId: string): Promise<CharacterRelationship[]> {
  const rows = getDatabase().select().from(characterRelationships).where(eq(characterRelationships.projectId, projectId)).orderBy(desc(characterRelationships.createdAt)).all();
  return rows.map(toRelationship);
}

export async function listRelationshipsInvolvingCharacter(projectId: string, characterId: string): Promise<CharacterRelationship[]> {
  const rows = getDatabase()
    .select()
    .from(characterRelationships)
    .where(and(eq(characterRelationships.projectId, projectId), or(eq(characterRelationships.fromCharacterId, characterId), eq(characterRelationships.toCharacterId, characterId))))
    .orderBy(desc(characterRelationships.createdAt))
    .all();
  return rows.map(toRelationship);
}

export async function createRelationship(projectId: string, input: CharacterRelationshipInput): Promise<CharacterRelationship> {
  ensureProject(projectId);
  await checkedInput(input);
  const normalized = normalizeCharacterRelationshipInput(input);
  ensureEndpoint(projectId, normalized.fromCharacterId);
  ensureEndpoint(projectId, normalized.toCharacterId);
  const now = new Date();
  const row = {
    id: randomUUID(),
    projectId,
    fromCharacterId: normalized.fromCharacterId,
    toCharacterId: normalized.toCharacterId,
    type: normalized.type,
    description: normalized.description,
    strength: normalized.strength ?? null,
    createdAt: now,
    updatedAt: now,
  };
  getDatabase().insert(characterRelationships).values(row).run();
  return toRelationship(row);
}

export async function updateRelationship(projectId: string, relationshipId: string, input: CharacterRelationshipUpdateInput): Promise<CharacterRelationship> {
  const existing = getExisting(projectId, relationshipId);
  await checkedInput(input);
  const normalized = normalizeCharacterRelationshipUpdateInput(input);
  const updatedAt = nextTimestamp(existing.updatedAt);
  const values = { type: normalized.type, description: normalized.description, strength: normalized.strength ?? null, updatedAt };
  getDatabase().update(characterRelationships).set(values).where(and(eq(characterRelationships.projectId, projectId), eq(characterRelationships.id, relationshipId))).run();
  return toRelationship({ ...existing, ...values });
}

export async function deleteRelationship(projectId: string, relationshipId: string): Promise<void> {
  getExisting(projectId, relationshipId);
  getDatabase().delete(characterRelationships).where(and(eq(characterRelationships.projectId, projectId), eq(characterRelationships.id, relationshipId))).run();
}

export { CharacterRelationshipIntegrityError, CharacterRelationshipNotFoundError, CharacterRelationshipValidationError } from "./types";
export { validateCharacterRelationshipInput } from "./validation";
