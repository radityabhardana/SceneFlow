export const characterStatuses = ["active", "inactive", "missing", "removed"] as const;
export type CharacterStatus = (typeof characterStatuses)[number];

export type Character = {
  id: string;
  projectId: string;
  name: string;
  role: string;
  visualDescription: string;
  personality: string[];
  voiceStyle: string;
  lockedTraits: string[];
  status: CharacterStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CharacterInput = {
  name: string;
  role: string;
  visualDescription: string;
  personality: string[];
  voiceStyle: string;
  lockedTraits: string[];
  status?: CharacterStatus;
};

export type CharacterUpdateInput = Omit<CharacterInput, "status">;
export type CharacterValidationErrors = Partial<Record<keyof CharacterInput, string>>;

export class CharacterValidationError extends Error {
  readonly errors: CharacterValidationErrors;

  constructor(errors: CharacterValidationErrors) {
    super("Character input is invalid.");
    this.name = "CharacterValidationError";
    this.errors = errors;
  }
}

export class CharacterNotFoundError extends Error {
  readonly projectId: string;
  readonly characterId: string;

  constructor(projectId: string, characterId: string) {
    super(`Character with id \"${characterId}\" was not found in project \"${projectId}\".`);
    this.name = "CharacterNotFoundError";
    this.projectId = projectId;
    this.characterId = characterId;
  }
}

export type CharacterIntegrityCode = "project_not_found" | "invalid_stored_traits";

export class CharacterIntegrityError extends Error {
  readonly code: CharacterIntegrityCode;

  constructor(code: CharacterIntegrityCode, message: string) {
    super(message);
    this.name = "CharacterIntegrityError";
    this.code = code;
  }
}
