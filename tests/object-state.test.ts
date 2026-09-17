import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { closeDatabase, getDatabase } from "@/db/client";
import { characterStates, characters, locations, objectStates, projects, storyObjects } from "@/db/schema";
import { createCharacter, deleteCharacter } from "@/domain/character";
import { deleteLocation } from "@/domain/location";
import { createProject } from "@/domain/project";
import { ObjectStateValidationError, clearCharacterState, clearObjectState, getCharacterState, getObjectState, listCharacterStates, listObjectStates, setCharacterState, setObjectState } from "@/domain/state";
import { createLocation } from "@/domain/location";
import { StoryObjectValidationError, createStoryObject, deleteStoryObject, getStoryObject, listStoryObjects, updateStoryObject } from "@/domain/object";
import type { CharacterInput } from "@/domain/character";

const characterInput: CharacterInput = {
  name: "Nara",
  role: "Operator",
  visualDescription: "Navy jacket",
  personality: ["curious"],
  voiceStyle: "Measured",
  lockedTraits: ["silver locket"],
};

async function project(title: string): Promise<string> {
  return (await createProject({ title, premise: `${title} premise`, genre: "Drama", tone: "Tense", aspectRatio: "16:9", visualStyle: "Naturalistic" })).id;
}

describe("story objects", () => {
  it("creates, reads, lists, updates, deletes, normalizes, and isolates objects", async () => {
    const projectId = await project("Objects");
    const otherProjectId = await project("Other objects");
    const object = await createStoryObject(projectId, { name: "  Red key  ", description: "  Opens the back room.  ", visualLock: "   " });
    await createStoryObject(otherProjectId, { name: "Other key", description: "Other description" });

    expect(object).toMatchObject({ name: "Red key", description: "Opens the back room.", visualLock: null });
    expect(await getStoryObject(projectId, object.id)).toMatchObject({ id: object.id });
    expect(await getStoryObject(otherProjectId, object.id)).toBeNull();
    expect(await listStoryObjects(projectId)).toHaveLength(1);
    expect(await listStoryObjects(otherProjectId)).toHaveLength(1);

    const updated = await updateStoryObject(projectId, object.id, { name: "  Brass key ", description: "  Opens the vault.  ", visualLock: "  Brass teeth  " });
    expect(updated).toMatchObject({ name: "Brass key", description: "Opens the vault.", visualLock: "Brass teeth" });
    await deleteStoryObject(projectId, object.id);
    expect(await getStoryObject(projectId, object.id)).toBeNull();
  });

  it("rejects whitespace required fields and deletion while state exists", async () => {
    const projectId = await project("Object validation");
    await expect(createStoryObject(projectId, { name: " ", description: "valid" })).rejects.toBeInstanceOf(StoryObjectValidationError);
    await expect(createStoryObject(projectId, { name: "valid", description: "\t\n" })).rejects.toBeInstanceOf(StoryObjectValidationError);
    const object = await createStoryObject(projectId, { name: "Tracked", description: "Has state" });
    await setObjectState(projectId, object.id, { condition: "  intact  " });
    await expect(deleteStoryObject(projectId, object.id)).rejects.toMatchObject({ code: "object_in_use" });
    await clearObjectState(projectId, object.id);
    await deleteStoryObject(projectId, object.id);
  });
});

describe("character current state", () => {
  it("is lazy, upserts, normalizes, clears, isolates, and persists across reopen", async () => {
    const projectId = await project("Character state");
    const otherProjectId = await project("Other character state");
    const character = await createCharacter(projectId, characterInput);
    const location = await createLocation(projectId, { name: "Tower", description: "Hilltop tower" });
    const otherLocation = await createLocation(otherProjectId, { name: "Other", description: "Other location" });

    expect(await getCharacterState(projectId, character.id)).toBeNull();
    expect(await listCharacterStates(projectId)).toEqual([]);
    const state = await setCharacterState(projectId, character.id, { locationId: ` ${location.id} `, emotion: "   ", condition: "  Tired  " });
    expect(state).toMatchObject({ locationId: location.id, emotion: null, condition: "Tired" });
    const updated = await setCharacterState(projectId, character.id, { emotion: "  Alert  " });
    expect(updated).toMatchObject({ locationId: location.id, emotion: "Alert", condition: "Tired" });
    await expect(setCharacterState(projectId, character.id, { locationId: otherLocation.id })).rejects.toMatchObject({ code: "location_not_found" });

    closeDatabase();
    expect(await getCharacterState(projectId, character.id)).toMatchObject({ characterId: character.id, condition: "Tired" });
    await clearCharacterState(projectId, character.id);
    expect(await getCharacterState(projectId, character.id)).toBeNull();
    expect(await listCharacterStates(projectId)).toEqual([]);
  });

  it("keeps removed character state readable but blocks new mutations", async () => {
    const projectId = await project("Removed character state");
    const character = await createCharacter(projectId, characterInput);
    await setCharacterState(projectId, character.id, { emotion: "Calm" });
    await deleteCharacter(projectId, character.id);
    expect(await getCharacterState(projectId, character.id)).toMatchObject({ emotion: "Calm" });
    await expect(setCharacterState(projectId, character.id, { emotion: "New" })).rejects.toMatchObject({ code: "removed_character" });
    await expect(clearCharacterState(projectId, character.id)).rejects.toMatchObject({ code: "removed_character" });
  });
});

describe("object current state", () => {
  it("supports holder/location transfers, null location, conditions, isolation, and reopen persistence", async () => {
    const projectId = await project("Object state");
    const otherProjectId = await project("Other object state");
    const object = await createStoryObject(projectId, { name: "Key", description: "A key" });
    const otherObject = await createStoryObject(otherProjectId, { name: "Other key", description: "Other key" });
    const character = await createCharacter(projectId, characterInput);
    const otherCharacter = await createCharacter(otherProjectId, { ...characterInput, name: "Other" });
    const location = await createLocation(projectId, { name: "Tower", description: "A tower" });
    const otherLocation = await createLocation(otherProjectId, { name: "Other tower", description: "Other tower" });

    expect(await getObjectState(projectId, object.id)).toBeNull();
    expect(await listObjectStates(otherProjectId)).toEqual([]);
    const held = await setObjectState(projectId, object.id, { holderCharacterId: character.id, condition: "  carried  " });
    expect(held).toMatchObject({ holderCharacterId: character.id, locationId: null, condition: "carried" });
    const placed = await setObjectState(projectId, object.id, { holderCharacterId: null, locationId: location.id });
    expect(placed).toMatchObject({ holderCharacterId: null, locationId: location.id, condition: "carried" });
    await expect(setObjectState(projectId, object.id, { holderCharacterId: character.id, locationId: location.id })).rejects.toBeInstanceOf(ObjectStateValidationError);
    await setObjectState(projectId, object.id, { locationId: null });
    await expect(setObjectState(projectId, otherObject.id, { condition: "wrong project" })).rejects.toMatchObject({ code: "object_not_found" });
    await expect(setObjectState(projectId, object.id, { holderCharacterId: otherCharacter.id })).rejects.toMatchObject({ code: "character_not_found" });
    await expect(setObjectState(projectId, object.id, { locationId: otherLocation.id })).rejects.toMatchObject({ code: "location_not_found" });

    closeDatabase();
    expect(await getObjectState(projectId, object.id)).toMatchObject({ locationId: null, condition: "carried" });
    await clearObjectState(projectId, object.id);
    expect(await getObjectState(projectId, object.id)).toBeNull();
    expect(await listObjectStates(projectId)).toEqual([]);
  });

  it("enforces the SQLite holder/location check and preserves removed holder references", async () => {
    const projectId = await project("Object holder removal");
    const object = await createStoryObject(projectId, { name: "Locket", description: "A locket" });
    const directCheckObject = await createStoryObject(projectId, { name: "Direct check object", description: "A direct check object" });
    const character = await createCharacter(projectId, characterInput);
    const newRemovedHolder = await createCharacter(projectId, { ...characterInput, name: "New removed holder" });
    const location = await createLocation(projectId, { name: "Room", description: "A room" });
    await setObjectState(projectId, object.id, { holderCharacterId: character.id });
    await deleteCharacter(projectId, character.id);
    await deleteCharacter(projectId, newRemovedHolder.id);
    const preserved = await setObjectState(projectId, object.id, { condition: "Still held" });
    expect(preserved.holderCharacterId).toBe(character.id);
    await expect(setObjectState(projectId, object.id, { holderCharacterId: newRemovedHolder.id })).rejects.toMatchObject({ code: "removed_character" });

    expect(() => getDatabase().insert(objectStates).values({ projectId, objectId: directCheckObject.id, holderCharacterId: character.id, locationId: location.id, condition: null, updatedAt: new Date() }).run()).toThrow();
    await expect(setObjectState(projectId, object.id, { holderCharacterId: character.id, locationId: location.id })).rejects.toBeInstanceOf(ObjectStateValidationError);
  });
});

describe("state deletion integrity", () => {
  it("preflights location deletion for both state tables", async () => {
    const projectId = await project("Location state references");
    const character = await createCharacter(projectId, characterInput);
    const firstLocation = await createLocation(projectId, { name: "First", description: "First location" });
    const firstObject = await createStoryObject(projectId, { name: "First object", description: "First object" });
    await setCharacterState(projectId, character.id, { locationId: firstLocation.id });
    await expect(deleteLocation(projectId, firstLocation.id)).rejects.toMatchObject({ code: "location_in_use", locationId: firstLocation.id });
    await clearCharacterState(projectId, character.id);

    const secondLocation = await createLocation(projectId, { name: "Second", description: "Second location" });
    await setObjectState(projectId, firstObject.id, { locationId: secondLocation.id });
    await expect(deleteLocation(projectId, secondLocation.id)).rejects.toMatchObject({ code: "location_in_use", locationId: secondLocation.id });
  });

  it("cascades all new state and object rows when the project is deleted", async () => {
    const projectId = await project("Project cascade");
    const character = await createCharacter(projectId, characterInput);
    const location = await createLocation(projectId, { name: "Cascade location", description: "Cascade location" });
    const object = await createStoryObject(projectId, { name: "Cascade object", description: "Cascade object" });
    await setCharacterState(projectId, character.id, { locationId: location.id });
    await setObjectState(projectId, object.id, { condition: "Present" });

    getDatabase().delete(projects).where(eq(projects.id, projectId)).run();
    expect(getDatabase().select().from(storyObjects).where(eq(storyObjects.projectId, projectId)).all()).toEqual([]);
    expect(getDatabase().select().from(characterStates).where(eq(characterStates.projectId, projectId)).all()).toEqual([]);
    expect(getDatabase().select().from(objectStates).where(eq(objectStates.projectId, projectId)).all()).toEqual([]);
  });
});
