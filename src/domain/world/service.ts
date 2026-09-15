import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { projects, worldRules } from "@/db/schema";

import {
  WorldRuleIntegrityError,
  WorldRuleNotFoundError,
  WorldRuleValidationError,
} from "./types";
import type { WorldRule, WorldRuleInput, WorldRuleUpdateInput } from "./types";
import { normalizeWorldRuleInput, normalizeWorldRuleUpdateInput, validateWorldRuleInput } from "./validation";

function toWorldRule(row: typeof worldRules.$inferSelect): WorldRule {
  return {
    id: row.id,
    projectId: row.projectId,
    rule: row.rule,
    locked: row.locked,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function ensureProject(projectId: string): void {
  const project = getDatabase().select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).get();
  if (!project) {
    throw new WorldRuleIntegrityError("project_not_found", `Project with id \"${projectId}\" was not found.`);
  }
}

function getExisting(projectId: string, ruleId: string): typeof worldRules.$inferSelect {
  const row = getDatabase().select().from(worldRules).where(and(eq(worldRules.projectId, projectId), eq(worldRules.id, ruleId))).get();
  if (!row) {
    throw new WorldRuleNotFoundError(projectId, ruleId);
  }
  return row;
}

function nextTimestamp(previous: Date): Date {
  return new Date(Math.max(Date.now(), previous.getTime() + 1));
}

async function checkedInput(input: WorldRuleInput | WorldRuleUpdateInput): Promise<void> {
  const errors = await validateWorldRuleInput(input);
  if (Object.keys(errors).length > 0) {
    throw new WorldRuleValidationError(errors);
  }
}

export async function listWorldRules(projectId: string): Promise<WorldRule[]> {
  const rows = getDatabase().select().from(worldRules).where(eq(worldRules.projectId, projectId)).orderBy(desc(worldRules.createdAt)).all();
  return rows.map(toWorldRule);
}

export async function createWorldRule(projectId: string, input: WorldRuleInput): Promise<WorldRule> {
  ensureProject(projectId);
  await checkedInput(input);
  const normalized = normalizeWorldRuleInput(input);
  const now = new Date();
  const row = {
    id: randomUUID(),
    projectId,
    rule: normalized.rule,
    locked: normalized.locked ?? false,
    createdAt: now,
    updatedAt: now,
  };
  getDatabase().insert(worldRules).values(row).run();
  return toWorldRule(row);
}

export async function updateWorldRule(projectId: string, ruleId: string, input: WorldRuleUpdateInput): Promise<WorldRule> {
  const existing = getExisting(projectId, ruleId);
  if (existing.locked) {
    throw new WorldRuleIntegrityError("locked", "Locked world rules must be explicitly unlocked before editing.");
  }
  await checkedInput(input);
  const normalized = normalizeWorldRuleUpdateInput(input);
  const updatedAt = nextTimestamp(existing.updatedAt);
  getDatabase().update(worldRules).set({ rule: normalized.rule, updatedAt }).where(and(eq(worldRules.projectId, projectId), eq(worldRules.id, ruleId))).run();
  return toWorldRule({ ...existing, rule: normalized.rule, updatedAt });
}

export async function deleteWorldRule(projectId: string, ruleId: string): Promise<void> {
  const existing = getExisting(projectId, ruleId);
  if (existing.locked) {
    throw new WorldRuleIntegrityError("locked", "Locked world rules must be explicitly unlocked before deletion.");
  }
  getDatabase().delete(worldRules).where(and(eq(worldRules.projectId, projectId), eq(worldRules.id, ruleId))).run();
}

export async function setWorldRuleLocked(projectId: string, ruleId: string, locked: boolean): Promise<WorldRule> {
  if (typeof locked !== "boolean") {
    throw new WorldRuleValidationError({ locked: "locked must be a boolean." });
  }
  const existing = getExisting(projectId, ruleId);
  const updatedAt = nextTimestamp(existing.updatedAt);
  getDatabase().update(worldRules).set({ locked, updatedAt }).where(and(eq(worldRules.projectId, projectId), eq(worldRules.id, ruleId))).run();
  return toWorldRule({ ...existing, locked, updatedAt });
}

export { WorldRuleIntegrityError, WorldRuleNotFoundError, WorldRuleValidationError } from "./types";
export { validateWorldRuleInput } from "./validation";
