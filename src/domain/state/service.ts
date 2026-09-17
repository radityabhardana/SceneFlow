import { and, desc, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { characterStates, characters, locations, objectStates, projects, storyObjects } from "@/db/schema";

import {
  CharacterStateIntegrityError,
  CharacterStateValidationError,
  ObjectStateIntegrityError,
  ObjectStateValidationError,
} from "./types";
import type { CharacterState, CharacterStateInput, ObjectState, ObjectStateInput } from "./types";
import {
  normalizeCharacterStateInput,
  normalizeObjectStateInput,
  validateCharacterStateInput,
  validateObjectStateInput,
} from "./validation";

function toCharacterState(row: typeof characterStates.$inferSelect): CharacterState {
  return { ...row };
}

function toObjectState(row: typeof objectStates.$inferSelect): ObjectState {
  return { ...row };
}

function nextTimestamp(previous?: Date): Date {
  return new Date(Math.max(Date.now(), (previous?.getTime() ?? 0) + 1));
}

async function checkedCharacterInput(input: CharacterStateInput): Promise<CharacterStateInput> {
  const errors = await validateCharacterStateInput(input);
  if (Object.keys(errors).length > 0) throw new CharacterStateValidationError(errors);
  return normalizeCharacterStateInput(input);
}

async function checkedObjectInput(input: ObjectStateInput): Promise<ObjectStateInput> {
  const errors = await validateObjectStateInput(input);
  if (Object.keys(errors).length > 0) throw new ObjectStateValidationError(errors);
  return normalizeObjectStateInput(input);
}

export async function getCharacterState(projectId: string, characterId: string): Promise<CharacterState | null> {
  const row = getDatabase().select().from(characterStates).where(and(eq(characterStates.projectId, projectId), eq(characterStates.characterId, characterId))).get();
  return row ? toCharacterState(row) : null;
}

export async function listCharacterStates(projectId: string): Promise<CharacterState[]> {
  return getDatabase().select().from(characterStates).where(eq(characterStates.projectId, projectId)).orderBy(desc(characterStates.updatedAt)).all().map(toCharacterState);
}

export async function setCharacterState(projectId: string, characterId: string, input: CharacterStateInput): Promise<CharacterState> {
  const normalized = await checkedCharacterInput(input);
  return getDatabase().transaction((tx) => {
    if (!tx.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).get()) {
      throw new CharacterStateIntegrityError("project_not_found", `Project with id \"${projectId}\" was not found.`);
    }
    const character = tx.select({ id: characters.id, status: characters.status }).from(characters).where(and(eq(characters.projectId, projectId), eq(characters.id, characterId))).get();
    if (!character) throw new CharacterStateIntegrityError("character_not_found", `Character with id \"${characterId}\" was not found in this project.`);
    if (character.status === "removed") throw new CharacterStateIntegrityError("removed_character", "Removed characters cannot receive new state mutations.");
    if (normalized.locationId !== undefined && normalized.locationId !== null && !tx.select({ id: locations.id }).from(locations).where(and(eq(locations.projectId, projectId), eq(locations.id, normalized.locationId))).get()) {
      throw new CharacterStateIntegrityError("location_not_found", `Location with id \"${normalized.locationId}\" was not found in this project.`);
    }
    const existing = tx.select().from(characterStates).where(and(eq(characterStates.projectId, projectId), eq(characterStates.characterId, characterId))).get();
    const row = {
      projectId,
      characterId,
      locationId: normalized.locationId === undefined ? existing?.locationId ?? null : normalized.locationId,
      emotion: normalized.emotion === undefined ? existing?.emotion ?? null : normalized.emotion,
      condition: normalized.condition === undefined ? existing?.condition ?? null : normalized.condition,
      updatedAt: nextTimestamp(existing?.updatedAt),
    };
    tx.insert(characterStates).values(row).onConflictDoUpdate({ target: [characterStates.projectId, characterStates.characterId], set: row }).run();
    return toCharacterState(row);
  });
}

export async function clearCharacterState(projectId: string, characterId: string): Promise<void> {
  getDatabase().transaction((tx) => {
    if (!tx.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).get()) {
      throw new CharacterStateIntegrityError("project_not_found", `Project with id \"${projectId}\" was not found.`);
    }
    const character = tx.select({ status: characters.status }).from(characters).where(and(eq(characters.projectId, projectId), eq(characters.id, characterId))).get();
    if (!character) throw new CharacterStateIntegrityError("character_not_found", `Character with id \"${characterId}\" was not found in this project.`);
    if (character.status === "removed") throw new CharacterStateIntegrityError("removed_character", "Removed characters cannot receive new state mutations.");
    tx.delete(characterStates).where(and(eq(characterStates.projectId, projectId), eq(characterStates.characterId, characterId))).run();
  });
}

export async function getObjectState(projectId: string, objectId: string): Promise<ObjectState | null> {
  const row = getDatabase().select().from(objectStates).where(and(eq(objectStates.projectId, projectId), eq(objectStates.objectId, objectId))).get();
  return row ? toObjectState(row) : null;
}

export async function listObjectStates(projectId: string): Promise<ObjectState[]> {
  return getDatabase().select().from(objectStates).where(eq(objectStates.projectId, projectId)).orderBy(desc(objectStates.updatedAt)).all().map(toObjectState);
}

export async function setObjectState(projectId: string, objectId: string, input: ObjectStateInput): Promise<ObjectState> {
  const normalized = await checkedObjectInput(input);
  return getDatabase().transaction((tx) => {
    if (!tx.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).get()) {
      throw new ObjectStateIntegrityError("project_not_found", `Project with id \"${projectId}\" was not found.`);
    }
    if (!tx.select({ id: storyObjects.id }).from(storyObjects).where(and(eq(storyObjects.projectId, projectId), eq(storyObjects.id, objectId))).get()) {
      throw new ObjectStateIntegrityError("object_not_found", `Story object with id \"${objectId}\" was not found in this project.`);
    }
    const existing = tx.select().from(objectStates).where(and(eq(objectStates.projectId, projectId), eq(objectStates.objectId, objectId))).get();
    const holderCharacterId = normalized.holderCharacterId === undefined ? existing?.holderCharacterId ?? null : normalized.holderCharacterId;
    const locationId = normalized.locationId === undefined ? existing?.locationId ?? null : normalized.locationId;
    const condition = normalized.condition === undefined ? existing?.condition ?? null : normalized.condition;
    if (holderCharacterId !== null && locationId !== null) throw new ObjectStateValidationError({ locationId: "holderCharacterId and locationId cannot both be set." });
    if (holderCharacterId !== null) {
      const holder = tx.select({ status: characters.status }).from(characters).where(and(eq(characters.projectId, projectId), eq(characters.id, holderCharacterId))).get();
      if (!holder) throw new ObjectStateIntegrityError("character_not_found", `Character with id \"${holderCharacterId}\" was not found in this project.`);
      if (holder.status === "removed" && existing?.holderCharacterId !== holderCharacterId) throw new ObjectStateIntegrityError("removed_character", "Removed characters cannot become new object holders.");
    }
    if (locationId !== null && !tx.select({ id: locations.id }).from(locations).where(and(eq(locations.projectId, projectId), eq(locations.id, locationId))).get()) {
      throw new ObjectStateIntegrityError("location_not_found", `Location with id \"${locationId}\" was not found in this project.`);
    }
    const row = { projectId, objectId, holderCharacterId, locationId, condition, updatedAt: nextTimestamp(existing?.updatedAt) };
    tx.insert(objectStates).values(row).onConflictDoUpdate({ target: [objectStates.projectId, objectStates.objectId], set: row }).run();
    return toObjectState(row);
  });
}

export async function clearObjectState(projectId: string, objectId: string): Promise<void> {
  getDatabase().transaction((tx) => {
    if (!tx.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).get()) throw new ObjectStateIntegrityError("project_not_found", `Project with id \"${projectId}\" was not found.`);
    if (!tx.select({ id: storyObjects.id }).from(storyObjects).where(and(eq(storyObjects.projectId, projectId), eq(storyObjects.id, objectId))).get()) throw new ObjectStateIntegrityError("object_not_found", `Story object with id \"${objectId}\" was not found in this project.`);
    tx.delete(objectStates).where(and(eq(objectStates.projectId, projectId), eq(objectStates.objectId, objectId))).run();
  });
}

export { CharacterStateIntegrityError, CharacterStateValidationError, ObjectStateIntegrityError, ObjectStateValidationError } from "./types";
export { validateCharacterStateInput, validateObjectStateInput } from "./validation";
