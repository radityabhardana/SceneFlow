import type { LocationInput, LocationValidationErrors } from "./types";

export async function validateLocationInput(input: LocationInput): Promise<LocationValidationErrors> {
  const errors: LocationValidationErrors = {};
  const candidate: Partial<Record<keyof LocationInput, unknown>> = typeof input === "object" && input !== null ? input : {};

  for (const field of ["name", "description"] as const) {
    const value = candidate[field];
    if (typeof value !== "string") {
      errors[field] = `${field} is required.`;
    } else if (value.trim().length === 0) {
      errors[field] = `${field} must not be empty.`;
    }
  }

  if (candidate.visualLock !== undefined && candidate.visualLock !== null && typeof candidate.visualLock !== "string") {
    errors.visualLock = "visualLock must be a string or null.";
  }

  return errors;
}

export function normalizeLocationInput(input: LocationInput): LocationInput {
  const visualLock = input.visualLock?.trim() || null;
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    visualLock,
  };
}
