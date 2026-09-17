import type { StoryObjectInput, StoryObjectValidationErrors } from "./types";

export async function validateStoryObjectInput(input: StoryObjectInput): Promise<StoryObjectValidationErrors> {
  const errors: StoryObjectValidationErrors = {};
  const candidate: Partial<Record<keyof StoryObjectInput, unknown>> = typeof input === "object" && input !== null ? input : {};
  for (const field of ["name", "description"] as const) {
    const value = candidate[field];
    if (typeof value !== "string") errors[field] = `${field} is required.`;
    else if (value.trim().length === 0) errors[field] = `${field} must not be empty.`;
  }
  if (candidate.visualLock !== undefined && candidate.visualLock !== null && typeof candidate.visualLock !== "string") {
    errors.visualLock = "visualLock must be a string or null.";
  }
  return errors;
}

export function normalizeStoryObjectInput(input: StoryObjectInput): StoryObjectInput {
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    visualLock: input.visualLock?.trim() || null,
  };
}
