import type { WorldRuleInput, WorldRuleUpdateInput, WorldRuleValidationErrors } from "./types";

function validateRuleText(value: unknown, field: "rule", errors: WorldRuleValidationErrors): void {
  if (typeof value !== "string") {
    errors[field] = `${field} is required.`;
  } else if (value.trim().length === 0) {
    errors[field] = `${field} must not be empty.`;
  }
}

export async function validateWorldRuleInput(input: WorldRuleInput | WorldRuleUpdateInput): Promise<WorldRuleValidationErrors> {
  const errors: WorldRuleValidationErrors = {};
  const candidate: Partial<Record<keyof WorldRuleInput, unknown>> = typeof input === "object" && input !== null ? input : {};
  validateRuleText(candidate.rule, "rule", errors);

  if ("locked" in candidate && candidate.locked !== undefined && typeof candidate.locked !== "boolean") {
    errors.locked = "locked must be a boolean.";
  }

  return errors;
}

export function normalizeWorldRuleInput(input: WorldRuleInput): WorldRuleInput {
  return {
    rule: input.rule.trim(),
    ...(input.locked === undefined ? {} : { locked: input.locked }),
  };
}

export function normalizeWorldRuleUpdateInput(input: WorldRuleUpdateInput): WorldRuleUpdateInput {
  return { rule: input.rule.trim() };
}
