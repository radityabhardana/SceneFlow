import { describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";

import { closeDatabase, getDatabase } from "@/db/client";
import { characterRelationships, characters, locations, projects, worldRules } from "@/db/schema";
import { createCharacter, deleteCharacter, getCharacter, listCharacters, setCharacterStatus, updateCharacter } from "@/domain/character";
import { CharacterRelationshipValidationError, createRelationship, deleteRelationship, listRelationshipsByProject, listRelationshipsInvolvingCharacter, updateRelationship } from "@/domain/relationship";
import { createLocation, deleteLocation, listLocations, updateLocation } from "@/domain/location";
import { createProject } from "@/domain/project";
import { createWorldRule, deleteWorldRule, listWorldRules, setWorldRuleLocked, updateWorldRule } from "@/domain/world";
import type { CharacterInput } from "@/domain/character";

async function createTestProject(title: string): Promise<string> {
  const project = await createProject({
    title,
    premise: `${title} premise`,
    genre: "Drama",
    tone: "Tense",
    aspectRatio: "16:9",
    visualStyle: "Naturalistic",
  });
  return project.id;
}

const characterInput: CharacterInput = {
  name: "  Nara  ",
  role: "  Radio operator  ",
  visualDescription: "  Short hair and a navy jacket  ",
  personality: [" curious ", "focused", "curious"],
  voiceStyle: "  Measured and quiet  ",
  lockedTraits: [" silver locket ", "silver locket", "scar above left brow"],
};

describe("world rules", () => {
  it("creates, updates, locks, unlocks, and deletes rules without bypassing locks", async () => {
    const projectId = await createTestProject("World rules");
    const editable = await createWorldRule(projectId, { rule: "  Electricity is unreliable.  " });

    expect(editable.rule).toBe("Electricity is unreliable.");
    const updated = await updateWorldRule(projectId, editable.id, { rule: "  Electricity fails after midnight.  " });
    expect(updated.rule).toBe("Electricity fails after midnight.");

    const locked = await setWorldRuleLocked(projectId, editable.id, true);
    expect(locked.locked).toBe(true);
    await expect(updateWorldRule(projectId, editable.id, { rule: "Cannot change." })).rejects.toMatchObject({ code: "locked" });
    await expect(deleteWorldRule(projectId, editable.id)).rejects.toMatchObject({ code: "locked" });

    closeDatabase();
    expect((await listWorldRules(projectId))[0]).toMatchObject({ id: editable.id, locked: true });

    await setWorldRuleLocked(projectId, editable.id, false);
    await deleteWorldRule(projectId, editable.id);
    expect(await listWorldRules(projectId)).toEqual([]);
  });
});

describe("characters", () => {
  it("persists normalized trait arrays, updates and lists within a project", async () => {
    const projectId = await createTestProject("Characters");
    const otherProjectId = await createTestProject("Other characters");
    const character = await createCharacter(projectId, characterInput);
    await createCharacter(otherProjectId, { ...characterInput, name: "Mika" });

    expect(character).toMatchObject({
      name: "Nara",
      personality: ["curious", "focused"],
      lockedTraits: ["silver locket", "scar above left brow"],
      status: "active",
    });
    expect(await listCharacters(projectId)).toHaveLength(1);
    expect(await listCharacters(otherProjectId)).toHaveLength(1);

    const updated = await updateCharacter(projectId, character.id, {
      ...characterInput,
      name: "  Nara Vale  ",
      personality: ["determined", "determined"],
      lockedTraits: ["silver locket"],
    });
    expect(updated).toMatchObject({ name: "Nara Vale", personality: ["determined"], lockedTraits: ["silver locket"] });

    closeDatabase();
    expect(await getCharacter(projectId, character.id)).toMatchObject({ id: character.id, name: "Nara Vale" });
  });

  it("rejects invalid statuses and maintains project isolation", async () => {
    const projectId = await createTestProject("Status");
    const otherProjectId = await createTestProject("Status isolation");
    const character = await createCharacter(projectId, characterInput);

    await expect(setCharacterStatus(projectId, character.id, "unknown" as never)).rejects.toMatchObject({
      name: "CharacterValidationError",
      errors: { status: expect.any(String) },
    });
    expect(await getCharacter(otherProjectId, character.id)).toBeNull();
  });
});

describe("character relationships", () => {
  it("creates directional relationships and prevents invalid endpoints", async () => {
    const projectId = await createTestProject("Relationships");
    const otherProjectId = await createTestProject("Relationship isolation");
    const nara = await createCharacter(projectId, characterInput);
    const rafi = await createCharacter(projectId, { ...characterInput, name: "Rafi" });
    const outsider = await createCharacter(otherProjectId, { ...characterInput, name: "Outsider" });

    const relationship = await createRelationship(projectId, {
      fromCharacterId: nara.id,
      toCharacterId: rafi.id,
      type: "  distrusts  ",
      description: "  Nara doubts Rafi's alibi.  ",
      strength: 65,
    });
    expect(relationship).toMatchObject({ type: "distrusts", description: "Nara doubts Rafi's alibi.", strength: 65 });
    expect(await listRelationshipsByProject(projectId)).toHaveLength(1);
    expect(await listRelationshipsInvolvingCharacter(projectId, rafi.id)).toHaveLength(1);

    const revised = await updateRelationship(projectId, relationship.id, { type: "trusts", description: "A fragile alliance.", strength: null });
    expect(revised).toMatchObject({ fromCharacterId: nara.id, toCharacterId: rafi.id, type: "trusts", strength: null });

    await expect(createRelationship(projectId, {
      fromCharacterId: nara.id,
      toCharacterId: outsider.id,
      type: "knows",
      description: "Invalid cross-project relationship.",
    })).rejects.toMatchObject({ code: "character_not_found", characterId: outsider.id });
    await expect(createRelationship(projectId, {
      fromCharacterId: nara.id,
      toCharacterId: nara.id,
      type: "knows",
      description: "Invalid self relationship.",
    })).rejects.toBeInstanceOf(CharacterRelationshipValidationError);
    await expect(createRelationship(projectId, {
      fromCharacterId: "missing",
      toCharacterId: rafi.id,
      type: "knows",
      description: "Invalid missing character.",
    })).rejects.toMatchObject({ code: "character_not_found", characterId: "missing" });

    await deleteCharacter(projectId, rafi.id);
    expect(await listRelationshipsByProject(projectId)).toHaveLength(1);
    await expect(createRelationship(projectId, {
      fromCharacterId: nara.id,
      toCharacterId: rafi.id,
      type: "needs",
      description: "Rejected removed endpoint.",
    })).rejects.toMatchObject({ code: "removed_character", characterId: rafi.id });

    await deleteRelationship(projectId, relationship.id);
    expect(await listRelationshipsByProject(projectId)).toEqual([]);
  });
});

describe("SQLite relationship constraints", () => {
  it("cascades every project child when a project is directly deleted", async () => {
    const projectId = await createTestProject("Cascade delete");
    const first = await createCharacter(projectId, characterInput);
    const second = await createCharacter(projectId, { ...characterInput, name: "Second" });
    await createRelationship(projectId, {
      fromCharacterId: first.id,
      toCharacterId: second.id,
      type: "knows",
      description: "Connected before project deletion.",
    });
    await createWorldRule(projectId, { rule: "The project has a canon rule." });
    await createLocation(projectId, { name: "Shared location", description: "A location in the project." });

    getDatabase().delete(projects).where(eq(projects.id, projectId)).run();

    expect(getDatabase().select().from(characters).where(eq(characters.projectId, projectId)).all()).toEqual([]);
    expect(getDatabase().select().from(characterRelationships).where(eq(characterRelationships.projectId, projectId)).all()).toEqual([]);
    expect(getDatabase().select().from(worldRules).where(eq(worldRules.projectId, projectId)).all()).toEqual([]);
    expect(getDatabase().select().from(locations).where(eq(locations.projectId, projectId)).all()).toEqual([]);
  });

  it("rejects a direct hard-delete of a character with relationships", async () => {
    const projectId = await createTestProject("Restrict character delete");
    const first = await createCharacter(projectId, characterInput);
    const second = await createCharacter(projectId, { ...characterInput, name: "Second" });
    await createRelationship(projectId, {
      fromCharacterId: first.id,
      toCharacterId: second.id,
      type: "knows",
      description: "Prevents hard deletion.",
    });

    expect(() => getDatabase().delete(characters).where(and(eq(characters.projectId, projectId), eq(characters.id, first.id))).run()).toThrow();
    expect(await listRelationshipsByProject(projectId)).toHaveLength(1);
  });
});

describe("locations", () => {
  it("creates, updates, deletes, normalizes visual locks, and isolates projects", async () => {
    const projectId = await createTestProject("Locations");
    const otherProjectId = await createTestProject("Other locations");
    const location = await createLocation(projectId, {
      name: "  Old radio tower  ",
      description: "  Windy hilltop outside town.  ",
      visualLock: "   ",
    });
    await createLocation(otherProjectId, { name: "Elsewhere", description: "Another project location." });

    expect(location).toMatchObject({ name: "Old radio tower", description: "Windy hilltop outside town.", visualLock: null });
    const updated = await updateLocation(projectId, location.id, {
      name: "  Old radio tower  ",
      description: "  Storm clouds now gather overhead.  ",
      visualLock: "  rusted antenna silhouette  ",
    });
    expect(updated).toMatchObject({ description: "Storm clouds now gather overhead.", visualLock: "rusted antenna silhouette" });
    expect(await listLocations(projectId)).toHaveLength(1);
    expect(await listLocations(otherProjectId)).toHaveLength(1);

    await deleteLocation(projectId, location.id);
    expect(await listLocations(projectId)).toEqual([]);
  });
});
