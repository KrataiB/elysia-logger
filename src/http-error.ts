/**
 * HTTP Error Classes
 * @author KrataiB
 * @description Custom HTTP error classes for ElysiaJS
 */

/**
 * Base class for HTTP errors
 * @class HttpError
 * @extends Error
 */
export class HttpError extends Error {
  /**
   * HTTP status code
   * @type {number}
   */
  public status: number;

  /**
   * Error body/message
   * @type {any}
   */
  public body: any;

  /**
   * Creates a new HttpError
   * @param {number} status - HTTP status code
   * @param {any} message - Error message or body
   */
  constructor(status: number, message: any) {
    const msg = typeof message === "string" ? message : JSON.stringify(message);
    super(msg);
    this.status = status;
    this.body = message;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Convert error to a JSON-representable object
   * @returns {object}
   */
  toJSON() {
    return {
      status: this.status,
      message: this.body,
    };
  }

  /**
   * Creates a BadRequestError (400)
   * @param {any} [message='Bad Request']
   * @returns {HttpError}
   */
  static BadRequest(message: any = "Bad Request"): HttpError {
    return new HttpError(400, message);
  }

  /**
   * Creates an UnauthorizedError (401)
   * @param {any} [message='Unauthorized']
   * @returns {HttpError}
   */
  static Unauthorized(message: any = "Unauthorized"): HttpError {
    return new HttpError(401, message);
  }

  /**
   * Creates a ForbiddenError (403)
   * @param {any} [message='Forbidden']
   * @returns {HttpError}
   */
  static Forbidden(message: any = "Forbidden"): HttpError {
    return new HttpError(403, message);
  }

  /**
   * Creates a NotFoundError (404)
   * @param {any} [message='Not Found']
   * @returns {HttpError}
   */
  static NotFound(message: any = "Not Found"): HttpError {
    return new HttpError(404, message);
  }

  /**
   * Creates a MethodNotAllowedError (405)
   * @param {any} [message='Method Not Allowed']
   * @returns {HttpError}
   */
  static MethodNotAllowed(message: any = "Method Not Allowed"): HttpError {
    return new HttpError(405, message);
  }

  /**
   * Creates a ConflictError (409)
   * @param {any} [message='Conflict']
   * @returns {HttpError}
   */
  static Conflict(message: any = "Conflict"): HttpError {
    return new HttpError(409, message);
  }

  /**
   * Creates a PreconditionFailedError (412)
   * @param {any} [message='Precondition Failed']
   * @returns {HttpError}
   */
  static PreconditionFailed(message: any = "Precondition Failed"): HttpError {
    return new HttpError(412, message);
  }

  /**
   * Creates an UnprocessableEntityError (422)
   * @param {any} [message='Unprocessable Entity']
   * @returns {HttpError}
   */
  static UnprocessableEntity(message: any = "Unprocessable Entity"): HttpError {
    return new HttpError(422, message);
  }

  /**
   * Creates a TooManyRequestsError (429)
   * @param {any} [message='Too Many Requests']
   * @returns {HttpError}
   */
  static TooManyRequests(message: any = "Too Many Requests"): HttpError {
    return new HttpError(429, message);
  }

  /**
   * Creates an InternalServerError (500)
   * @param {any} [message='Internal Server Error']
   * @returns {HttpError}
   */
  static InternalServerError(
    message: any = "Internal Server Error"
  ): HttpError {
    return new HttpError(500, message);
  }
}
