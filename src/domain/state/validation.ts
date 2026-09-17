import type {
  CharacterStateInput,
  CharacterStateValidationErrors,
  ObjectStateInput,
  ObjectStateValidationErrors,
} from "./types";

function validateNullableText(value: unknown, field: string, errors: Record<string, string>): void {
  if (value !== undefined && value !== null && typeof value !== "string") {
    errors[field] = `${field} must be a string or null.`;
  }
}

export async function validateCharacterStateInput(input: CharacterStateInput): Promise<CharacterStateValidationErrors> {
  const errors: CharacterStateValidationErrors = {};
  const candidate: Partial<Record<keyof CharacterStateInput, unknown>> = typeof input === "object" && input !== null ? input : {};
  validateNullableText(candidate.locationId, "locationId", errors);
  validateNullableText(candidate.emotion, "emotion", errors);
  validateNullableText(candidate.condition, "condition", errors);
  return errors;
}

export async function validateObjectStateInput(input: ObjectStateInput): Promise<ObjectStateValidationErrors> {
  const errors: ObjectStateValidationErrors = {};
  const candidate: Partial<Record<keyof ObjectStateInput, unknown>> = typeof input === "object" && input !== null ? input : {};
  validateNullableText(candidate.holderCharacterId, "holderCharacterId", errors);
  validateNullableText(candidate.locationId, "locationId", errors);
  validateNullableText(candidate.condition, "condition", errors);
  if (typeof candidate.holderCharacterId === "string" && typeof candidate.locationId === "string" && candidate.holderCharacterId.trim() && candidate.locationId.trim()) {
    errors.locationId = "holderCharacterId and locationId cannot both be set.";
  }
  return errors;
}

function normalizeNullable(value: string | null | undefined): string | null | undefined {
  return value === undefined ? undefined : value?.trim() || null;
}

export function normalizeCharacterStateInput(input: CharacterStateInput): CharacterStateInput {
  return {
    locationId: normalizeNullable(input.locationId),
    emotion: normalizeNullable(input.emotion),
    condition: normalizeNullable(input.condition),
  };
}

export function normalizeObjectStateInput(input: ObjectStateInput): ObjectStateInput {
  return {
    holderCharacterId: normalizeNullable(input.holderCharacterId),
    locationId: normalizeNullable(input.locationId),
    condition: normalizeNullable(input.condition),
  };
}
