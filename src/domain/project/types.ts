import { aspectRatios } from "@/db/schema";

/** The supported canvas formats are intentionally fixed for deterministic prompt output. */
export type AspectRatio = (typeof aspectRatios)[number];

export type Project = {
  id: string;
  title: string;
  premise: string;
  genre: string;
  tone: string;
  aspectRatio: AspectRatio;
  visualStyle: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectInput = {
  title: string;
  premise: string;
  genre: string;
  tone: string;
  aspectRatio: AspectRatio;
  visualStyle: string;
};

export type ProjectValidationErrors = Partial<Record<keyof ProjectInput, string>>;

export class ProjectValidationError extends Error {
  readonly errors: ProjectValidationErrors;

  constructor(errors: ProjectValidationErrors) {
    super("Project input is invalid.");
    this.name = "ProjectValidationError";
    this.errors = errors;
  }
}

export class ProjectNotFoundError extends Error {
  readonly projectId: string;

  constructor(projectId: string) {
    super(`Project with id \"${projectId}\" was not found.`);
    this.name = "ProjectNotFoundError";
    this.projectId = projectId;
  }
}
