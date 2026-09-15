import type {
  CharacterRelationshipInput,
  CharacterRelationshipUpdateInput,
  CharacterRelationshipValidationErrors,
} from "./types";

function validateText(value: unknown, field: "fromCharacterId" | "toCharacterId" | "type" | "description", errors: CharacterRelationshipValidationErrors): void {
  if (typeof value !== "string") {
    errors[field] = `${field} is required.`;
  } else if (value.trim().length === 0) {
    errors[field] = `${field} must not be empty.`;
  }
}

function validateStrength(value: unknown, errors: CharacterRelationshipValidationErrors): void {
  if (value !== undefined && value !== null && (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 100)) {
    errors.strength = "strength must be null or an integer from 0 to 100.";
  }
}

export async function validateCharacterRelationshipInput(
  input: CharacterRelationshipInput | CharacterRelationshipUpdateInput,
): Promise<CharacterRelationshipValidationErrors> {
  const errors: CharacterRelationshipValidationErrors = {};
  const candidate: Partial<Record<keyof CharacterRelationshipInput, unknown>> = typeof input === "object" && input !== null ? input : {};

  if ("fromCharacterId" in candidate) validateText(candidate.fromCharacterId, "fromCharacterId", errors);
  if ("toCharacterId" in candidate) validateText(candidate.toCharacterId, "toCharacterId", errors);
  validateText(candidate.type, "type", errors);
  validateText(candidate.description, "description", errors);
  validateStrength(candidate.strength, errors);

  if (typeof candidate.fromCharacterId === "string" && typeof candidate.toCharacterId === "string" && candidate.fromCharacterId.trim() === candidate.toCharacterId.trim()) {
    errors.toCharacterId = "fromCharacterId and toCharacterId must identify different characters.";
  }

  return errors;
}

export function normalizeCharacterRelationshipInput(input: CharacterRelationshipInput): CharacterRelationshipInput {
  return {
    fromCharacterId: input.fromCharacterId.trim(),
    toCharacterId: input.toCharacterId.trim(),
    type: input.type.trim(),
    description: input.description.trim(),
    strength: input.strength ?? null,
  };
}

export function normalizeCharacterRelationshipUpdateInput(input: CharacterRelationshipUpdateInput): CharacterRelationshipUpdateInput {
  return {
    type: input.type.trim(),
    description: input.description.trim(),
    strength: input.strength ?? null,
  };
}
