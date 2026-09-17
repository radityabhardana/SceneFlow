export type StoryObject = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  visualLock: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type StoryObjectInput = {
  name: string;
  description: string;
  visualLock?: string | null;
};

export type StoryObjectValidationErrors = Partial<Record<keyof StoryObjectInput, string>>;

export class StoryObjectValidationError extends Error {
  readonly errors: StoryObjectValidationErrors;

  constructor(errors: StoryObjectValidationErrors) {
    super("Story object input is invalid.");
    this.name = "StoryObjectValidationError";
    this.errors = errors;
  }
}

export class StoryObjectNotFoundError extends Error {
  readonly projectId: string;
  readonly objectId: string;

  constructor(projectId: string, objectId: string) {
    super(`Story object with id \"${objectId}\" was not found in project \"${projectId}\".`);
    this.name = "StoryObjectNotFoundError";
    this.projectId = projectId;
    this.objectId = objectId;
  }
}

export type StoryObjectIntegrityCode = "project_not_found" | "object_in_use";

export class StoryObjectIntegrityError extends Error {
  readonly code: StoryObjectIntegrityCode;
  readonly projectId: string;
  readonly objectId?: string;

  constructor(code: StoryObjectIntegrityCode, projectId: string, message: string, objectId?: string) {
    super(message);
    this.name = "StoryObjectIntegrityError";
    this.code = code;
    this.projectId = projectId;
    this.objectId = objectId;
  }
}
