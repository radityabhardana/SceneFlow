import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { characters, projects } from "@/db/schema";

import {
  CharacterIntegrityError,
  CharacterNotFoundError,
  CharacterValidationError,
} from "./types";
import type { Character, CharacterInput, CharacterStatus, CharacterUpdateInput } from "./types";
import { normalizeCharacterInput, validateCharacterInput } from "./validation";

function parseStringArray(value: string, field: "personality" | "lockedTraits"): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    throw new CharacterIntegrityError("invalid_stored_traits", `${field} contains invalid stored JSON.`);
  }
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    throw new CharacterIntegrityError("invalid_stored_traits", `${field} contains invalid stored values.`);
  }
  return parsed.map((item) => item.trim());
}

function toCharacter(row: typeof characters.$inferSelect): Character {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    role: row.role,
    visualDescription: row.visualDescription,
    personality: parseStringArray(row.personality, "personality"),
    voiceStyle: row.voiceStyle,
    lockedTraits: parseStringArray(row.lockedTraits, "lockedTraits"),
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function ensureProject(projectId: string): void {
  const project = getDatabase().select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).get();
  if (!project) {
    throw new CharacterIntegrityError("project_not_found", `Project with id \"${projectId}\" was not found.`);
  }
}

function getExisting(projectId: string, characterId: string): typeof characters.$inferSelect {
  const row = getDatabase().select().from(characters).where(and(eq(characters.projectId, projectId), eq(characters.id, characterId))).get();
  if (!row) {
    throw new CharacterNotFoundError(projectId, characterId);
  }
  return row;
}

function nextTimestamp(previous: Date): Date {
  return new Date(Math.max(Date.now(), previous.getTime() + 1));
}

async function checkedInput(input: CharacterInput): Promise<CharacterInput> {
  const errors = await validateCharacterInput(input);
  if (Object.keys(errors).length > 0) {
    throw new CharacterValidationError(errors);
  }
  return normalizeCharacterInput(input);
}

export async function listCharacters(projectId: string): Promise<Character[]> {
  const rows = getDatabase().select().from(characters).where(eq(characters.projectId, projectId)).orderBy(desc(characters.createdAt)).all();
  return rows.map(toCharacter);
}

export async function createCharacter(projectId: string, input: CharacterInput): Promise<Character> {
  ensureProject(projectId);
  const normalized = await checkedInput(input);
  const now = new Date();
  const row = {
    id: randomUUID(),
    projectId,
    name: normalized.name,
    role: normalized.role,
    visualDescription: normalized.visualDescription,
    personality: JSON.stringify(normalized.personality),
    voiceStyle: normalized.voiceStyle,
    lockedTraits: JSON.stringify(normalized.lockedTraits),
    status: normalized.status ?? "active",
    createdAt: now,
    updatedAt: now,
  };
  getDatabase().insert(characters).values(row).run();
  return toCharacter(row);
}

export async function getCharacter(projectId: string, characterId: string): Promise<Character | null> {
  const row = getDatabase().select().from(characters).where(and(eq(characters.projectId, projectId), eq(characters.id, characterId))).get();
  return row ? toCharacter(row) : null;
}

export async function updateCharacter(projectId: string, characterId: string, input: CharacterUpdateInput): Promise<Character> {
  const existing = getExisting(projectId, characterId);
  const normalized = await checkedInput({ ...input, status: existing.status });
  const updatedAt = nextTimestamp(existing.updatedAt);
  const values = {
    name: normalized.name,
    role: normalized.role,
    visualDescription: normalized.visualDescription,
    personality: JSON.stringify(normalized.personality),
    voiceStyle: normalized.voiceStyle,
    lockedTraits: JSON.stringify(normalized.lockedTraits),
    updatedAt,
  };
  getDatabase().update(characters).set(values).where(and(eq(characters.projectId, projectId), eq(characters.id, characterId))).run();
  return toCharacter({ ...existing, ...values });
}

export async function setCharacterStatus(projectId: string, characterId: string, status: CharacterStatus): Promise<Character> {
  const existing = getExisting(projectId, characterId);
  const errors = await validateCharacterInput({
    name: existing.name,
    role: existing.role,
    visualDescription: existing.visualDescription,
    personality: parseStringArray(existing.personality, "personality"),
    voiceStyle: existing.voiceStyle,
    lockedTraits: parseStringArray(existing.lockedTraits, "lockedTraits"),
    status,
  });
  if (errors.status) {
    throw new CharacterValidationError({ status: errors.status });
  }
  const updatedAt = nextTimestamp(existing.updatedAt);
  getDatabase().update(characters).set({ status, updatedAt }).where(and(eq(characters.projectId, projectId), eq(characters.id, characterId))).run();
  return toCharacter({ ...existing, status, updatedAt });
}

export async function deleteCharacter(projectId: string, characterId: string): Promise<Character> {
  return setCharacterStatus(projectId, characterId, "removed");
}

export { CharacterIntegrityError, CharacterNotFoundError, CharacterValidationError } from "./types";
export { validateCharacterInput } from "./validation";
