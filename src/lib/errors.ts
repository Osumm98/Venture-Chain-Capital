// =============================================================================
// VCC — Structured Error Classes
// =============================================================================
// Domain-specific error types for clean error handling across the platform.
// No empty catch blocks — every error path is explicit.
// =============================================================================

/**
 * Base error for all VCC domain errors.
 * Carries an HTTP-mappable status code and a machine-readable error code.
 */
export class VccError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = "VccError";
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Validation failed on input data */
export class ValidationError extends VccError {
  readonly fieldErrors: Record<string, string[]>;

  constructor(message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

/** Resource not found */
export class NotFoundError extends VccError {
  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/** Insufficient permissions */
export class ForbiddenError extends VccError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

/** Authentication failure */
export class UnauthorizedError extends VccError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

/** Business logic constraint violated */
export class BusinessRuleError extends VccError {
  constructor(message: string) {
    super(message, 422, "BUSINESS_RULE_VIOLATION");
    this.name = "BusinessRuleError";
  }
}

/** Financial calculation integrity failure — critical */
export class FinancialIntegrityError extends VccError {
  constructor(message: string) {
    super(message, 500, "FINANCIAL_INTEGRITY_ERROR");
    this.name = "FinancialIntegrityError";
  }
}

/** Duplicate resource conflict */
export class ConflictError extends VccError {
  constructor(resource: string, identifier: string) {
    super(`${resource} already exists: ${identifier}`, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}
