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
    public status: number

    /**
     * Creates a new HttpError
     * @param {number} status - HTTP status code
     * @param {string} message - Error message
     */
    constructor(status: number, message: string) {
        super(message)
        this.status = status
        Object.setPrototypeOf(this, new.target.prototype)
    }

    /**
     * Convert error to a JSON-representable object
     * @returns {{ status: number; message: string }}
     */
    toJSON() {
        return {
            status: this.status,
            message: this.message
        }
    }
}

/**
 * Creates a BadRequestError (400)
 * @param {string} [message='Bad Request']
 * @returns {HttpError}
 */
HttpError.BadRequest = (message: string = 'Bad Request'): HttpError => new HttpError(400, message)

/**
 * Creates an UnauthorizedError (401)
 * @param {string} [message='Unauthorized']
 * @returns {HttpError}
 */
HttpError.Unauthorized = (message: string = 'Unauthorized'): HttpError => new HttpError(401, message)

/**
 * Creates a ForbiddenError (403)
 * @param {string} [message='Forbidden']
 * @returns {HttpError}
 */
HttpError.Forbidden = (message: string = 'Forbidden'): HttpError => new HttpError(403, message)

/**
 * Creates a NotFoundError (404)
 * @param {string} [message='Not Found']
 * @returns {HttpError}
 */
HttpError.NotFound = (message: string = 'Not Found'): HttpError => new HttpError(404, message)

/**
 * Creates a MethodNotAllowedError (405)
 * @param {string} [message='Method Not Allowed']
 * @returns {HttpError}
 */
HttpError.MethodNotAllowed = (message: string = 'Method Not Allowed'): HttpError => new HttpError(405, message)

/**
 * Creates a ConflictError (409)
 * @param {string} [message='Conflict']
 * @returns {HttpError}
 */
HttpError.Conflict = (message: string = 'Conflict'): HttpError => new HttpError(409, message)

/**
 * Creates a PreconditionFailedError (412)
 * @param {string} [message='Precondition Failed']
 * @returns {HttpError}
 */
HttpError.PreconditionFailed = (message: string = 'Precondition Failed'): HttpError => new HttpError(412, message)

/**
 * Creates an UnprocessableEntityError (422)
 * @param {string} [message='Unprocessable Entity']
 * @returns {HttpError}
 */
HttpError.UnprocessableEntity = (message: string = 'Unprocessable Entity'): HttpError => new HttpError(422, message)

/**
 * Creates a TooManyRequestsError (429)
 * @param {string} [message='Too Many Requests']
 * @returns {HttpError}
 */
HttpError.TooManyRequests = (message: string = 'Too Many Requests'): HttpError => new HttpError(429, message)

/**
 * Creates an InternalServerError (500)
 * @param {string} [message='Internal Server Error']
 * @returns {HttpError}
 */
HttpError.InternalServerError = (message: string = 'Internal Server Error'): HttpError => new HttpError(500, message)
