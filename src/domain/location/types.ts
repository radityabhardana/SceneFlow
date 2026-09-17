export type Location = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  visualLock: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type LocationInput = {
  name: string;
  description: string;
  visualLock?: string | null;
};

export type LocationValidationErrors = Partial<Record<keyof LocationInput, string>>;

export class LocationValidationError extends Error {
  readonly errors: LocationValidationErrors;

  constructor(errors: LocationValidationErrors) {
    super("Location input is invalid.");
    this.name = "LocationValidationError";
    this.errors = errors;
  }
}

export class LocationNotFoundError extends Error {
  readonly projectId: string;
  readonly locationId: string;

  constructor(projectId: string, locationId: string) {
    super(`Location with id \"${locationId}\" was not found in project \"${projectId}\".`);
    this.name = "LocationNotFoundError";
    this.projectId = projectId;
    this.locationId = locationId;
  }
}

export type LocationIntegrityCode = "project_not_found" | "location_in_use";

export class LocationIntegrityError extends Error {
  readonly code: LocationIntegrityCode;
  readonly locationId?: string;

  constructor(code: LocationIntegrityCode, message: string, locationId?: string) {
    super(message);
    this.name = "LocationIntegrityError";
    this.code = code;
    this.locationId = locationId;
  }
}
