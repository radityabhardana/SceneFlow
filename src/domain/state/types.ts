export type CharacterState = {
  projectId: string;
  characterId: string;
  locationId: string | null;
  emotion: string | null;
  condition: string | null;
  updatedAt: Date;
};

export type CharacterStateInput = {
  locationId?: string | null;
  emotion?: string | null;
  condition?: string | null;
};

export type ObjectState = {
  projectId: string;
  objectId: string;
  holderCharacterId: string | null;
  locationId: string | null;
  condition: string | null;
  updatedAt: Date;
};

export type ObjectStateInput = {
  holderCharacterId?: string | null;
  locationId?: string | null;
  condition?: string | null;
};

export type CharacterStateValidationErrors = Partial<Record<keyof CharacterStateInput, string>>;
export type ObjectStateValidationErrors = Partial<Record<keyof ObjectStateInput, string>>;

export class CharacterStateValidationError extends Error {
  readonly errors: CharacterStateValidationErrors;

  constructor(errors: CharacterStateValidationErrors) {
    super("Character state input is invalid.");
    this.name = "CharacterStateValidationError";
    this.errors = errors;
  }
}

export class ObjectStateValidationError extends Error {
  readonly errors: ObjectStateValidationErrors;

  constructor(errors: ObjectStateValidationErrors) {
    super("Object state input is invalid.");
    this.name = "ObjectStateValidationError";
    this.errors = errors;
  }
}

export type CharacterStateIntegrityCode = "project_not_found" | "character_not_found" | "location_not_found" | "removed_character";
export type ObjectStateIntegrityCode = "project_not_found" | "object_not_found" | "character_not_found" | "location_not_found" | "removed_character";

export class CharacterStateIntegrityError extends Error {
  readonly code: CharacterStateIntegrityCode;

  constructor(code: CharacterStateIntegrityCode, message: string) {
    super(message);
    this.name = "CharacterStateIntegrityError";
    this.code = code;
  }
}

export class ObjectStateIntegrityError extends Error {
  readonly code: ObjectStateIntegrityCode;

  constructor(code: ObjectStateIntegrityCode, message: string) {
    super(message);
    this.name = "ObjectStateIntegrityError";
    this.code = code;
  }
}
