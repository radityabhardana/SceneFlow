import { aspectRatios } from "@/db/schema";

import type { ProjectInput, ProjectValidationErrors } from "./types";

const inputFields: readonly (keyof ProjectInput)[] = [
  "title",
  "premise",
  "genre",
  "tone",
  "aspectRatio",
  "visualStyle",
];

export async function validateProjectInput(input: ProjectInput): Promise<ProjectValidationErrors> {
  const errors: ProjectValidationErrors = {};
  const candidate: Partial<Record<keyof ProjectInput, unknown>> =
    typeof input === "object" && input !== null ? input : {};

  for (const field of inputFields) {
    const value = candidate[field];

    if (typeof value !== "string") {
      errors[field] = `${field} is required.`;
      continue;
    }

    if (field === "title" && value.trim().length === 0) {
      errors.title = "title must not be empty.";
    }
  }

  if (typeof candidate.aspectRatio === "string" && !aspectRatios.includes(candidate.aspectRatio as (typeof aspectRatios)[number])) {
    errors.aspectRatio = `aspectRatio must be one of: ${aspectRatios.join(", ")}.`;
  }

  return errors;
}

export function normalizeProjectInput(input: ProjectInput): ProjectInput {
  return {
    title: input.title.trim(),
    premise: input.premise.trim(),
    genre: input.genre.trim(),
    tone: input.tone.trim(),
    aspectRatio: input.aspectRatio,
    visualStyle: input.visualStyle.trim(),
  };
}
