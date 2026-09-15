export type WorldRule = {
  id: string;
  projectId: string;
  rule: string;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type WorldRuleInput = {
  rule: string;
  locked?: boolean;
};

export type WorldRuleUpdateInput = {
  rule: string;
};

export type WorldRuleValidationErrors = Partial<Record<keyof WorldRuleInput, string>>;

export class WorldRuleValidationError extends Error {
  readonly errors: WorldRuleValidationErrors;

  constructor(errors: WorldRuleValidationErrors) {
    super("World rule input is invalid.");
    this.name = "WorldRuleValidationError";
    this.errors = errors;
  }
}

export class WorldRuleNotFoundError extends Error {
  readonly projectId: string;
  readonly ruleId: string;

  constructor(projectId: string, ruleId: string) {
    super(`World rule with id \"${ruleId}\" was not found in project \"${projectId}\".`);
    this.name = "WorldRuleNotFoundError";
    this.projectId = projectId;
    this.ruleId = ruleId;
  }
}

export type WorldRuleIntegrityCode = "project_not_found" | "locked";

export class WorldRuleIntegrityError extends Error {
  readonly code: WorldRuleIntegrityCode;

  constructor(code: WorldRuleIntegrityCode, message: string) {
    super(message);
    this.name = "WorldRuleIntegrityError";
    this.code = code;
  }
}
