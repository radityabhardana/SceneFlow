export type CharacterRelationship = {
  id: string;
  projectId: string;
  fromCharacterId: string;
  toCharacterId: string;
  type: string;
  description: string;
  strength: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CharacterRelationshipInput = {
  fromCharacterId: string;
  toCharacterId: string;
  type: string;
  description: string;
  strength?: number | null;
};

export type CharacterRelationshipUpdateInput = {
  type: string;
  description: string;
  strength?: number | null;
};

export type CharacterRelationshipValidationErrors = Partial<Record<keyof CharacterRelationshipInput, string>>;

export class CharacterRelationshipValidationError extends Error {
  readonly errors: CharacterRelationshipValidationErrors;

  constructor(errors: CharacterRelationshipValidationErrors) {
    super("Character relationship input is invalid.");
    this.name = "CharacterRelationshipValidationError";
    this.errors = errors;
  }
}

export class CharacterRelationshipNotFoundError extends Error {
  readonly projectId: string;
  readonly relationshipId: string;

  constructor(projectId: string, relationshipId: string) {
    super(`Character relationship with id \"${relationshipId}\" was not found in project \"${projectId}\".`);
    this.name = "CharacterRelationshipNotFoundError";
    this.projectId = projectId;
    this.relationshipId = relationshipId;
  }
}

export type CharacterRelationshipIntegrityCode =
  | "project_not_found"
  | "character_not_found"
  | "removed_character";

export class CharacterRelationshipIntegrityError extends Error {
  readonly code: CharacterRelationshipIntegrityCode;
  readonly characterId?: string;

  constructor(code: CharacterRelationshipIntegrityCode, message: string, characterId?: string) {
    super(message);
    this.name = "CharacterRelationshipIntegrityError";
    this.code = code;
    this.characterId = characterId;
  }
}
