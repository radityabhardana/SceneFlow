import { characterStatuses } from "./types";
import type { CharacterInput, CharacterValidationErrors } from "./types";

const requiredTextFields: readonly (keyof CharacterInput)[] = [
  "name",
  "role",
  "visualDescription",
  "voiceStyle",
];

function validateStringArray(value: unknown, field: "personality" | "lockedTraits", errors: CharacterValidationErrors): void {
  if (!Array.isArray(value)) {
    errors[field] = `${field} must be an array of strings.`;
    return;
  }

  if (value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    errors[field] = `${field} must contain only non-empty strings.`;
  }
}

export async function validateCharacterInput(input: CharacterInput): Promise<CharacterValidationErrors> {
  const errors: CharacterValidationErrors = {};
  const candidate: Partial<Record<keyof CharacterInput, unknown>> = typeof input === "object" && input !== null ? input : {};

  for (const field of requiredTextFields) {
    const value = candidate[field];
    if (typeof value !== "string") {
      errors[field] = `${field} is required.`;
    } else if (value.trim().length === 0) {
      errors[field] = `${field} must not be empty.`;
    }
  }

  validateStringArray(candidate.personality, "personality", errors);
  validateStringArray(candidate.lockedTraits, "lockedTraits", errors);

  if (candidate.status !== undefined && (typeof candidate.status !== "string" || !characterStatuses.includes(candidate.status as (typeof characterStatuses)[number]))) {
    errors.status = `status must be one of: ${characterStatuses.join(", ")}.`;
  }

  return errors;
}

function normalizeStringArray(value: string[]): string[] {
  return [...new Set(value.map((item) => item.trim()))];
}

export function normalizeCharacterInput(input: CharacterInput): CharacterInput {
  return {
    name: input.name.trim(),
    role: input.role.trim(),
    visualDescription: input.visualDescription.trim(),
    personality: normalizeStringArray(input.personality),
    voiceStyle: input.voiceStyle.trim(),
    lockedTraits: normalizeStringArray(input.lockedTraits),
    ...(input.status === undefined ? {} : { status: input.status }),
  };
}
