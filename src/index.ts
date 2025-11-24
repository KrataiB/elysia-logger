/**
 * Elysia Logger Plugin
 * @author KrataiB
 * @description A high-performance, NestJS-style logger for ElysiaJS
 */

import { Elysia } from "elysia";
import pc from "picocolors";
import { Logger } from "./logger";
import { HttpError } from "./http-error";
import type { LoggerOptions, RequestDetails } from "./types";

export { Logger } from "./logger";
export { HttpError } from "./http-error";
export type { LoggerOptions, RequestDetails } from "./types";

/**
 * Get pathname from request URL using fast string manipulation
 * @param url - Full URL string
 * @returns Pathname portion of the URL
 */
const getPathname = (url: string): string => {
  const queryIndex = url.indexOf("?");
  const pathEnd = queryIndex === -1 ? url.length : queryIndex;
  const protocolEnd = url.indexOf("://");
  if (protocolEnd === -1) return url;
  const pathStart = url.indexOf("/", protocolEnd + 3);
  if (pathStart === -1) return "/";
  return url.substring(pathStart, pathEnd);
};

/**
 * Build request details object from context
 * @param ctx - Elysia context object
 * @param url - Parsed URL object
 * @returns Request details including query, params, and body if available
 */
const buildRequestDetails = (
  ctx: { params?: Record<string, string>; body?: unknown },
  url: URL
): RequestDetails => {
  const details: RequestDetails = {};

  if (url.search) {
    details.query = Object.fromEntries(url.searchParams);
  }

  if (ctx.params && Object.keys(ctx.params).length > 0) {
    details.params = ctx.params;
  }

  if (ctx.body !== undefined && ctx.body !== null) {
    details.body = ctx.body;
  }

  return details;
};

/**
 * Format validation errors into a readable string
 * @param errors - Array of validation error objects
 * @returns Formatted error string with field names and descriptions
 */
const formatValidationErrors = (
  errors: Array<{ path: string; summary?: string; message: string }>
): string => {
  return errors
    .map((e) => `${e.path.replace("/", "")}: ${e.summary || e.message}`)
    .join(", ");
};

/**
 * Build validation error response object
 * @param errors - Array of validation error objects
 * @returns Structured error response with details
 */
const buildValidationResponse = (
  errors: Array<{
    path: string;
    summary?: string;
    message: string;
    value: unknown;
  }>
) => {
  const errorCount = errors.length;
  return {
    error: "Validation failed",
    message: `Request validation failed with ${errorCount} error${
      errorCount > 1 ? "s" : ""
    }`,
    details: errors.map((e) => ({
      field: e.path.replace("/", ""),
      message: e.summary || e.message,
      value: e.value,
    })),
  };
};

/**
 * Parse error object from stringified JSON if needed
 * @param err - Error object that might contain stringified JSON
 * @returns Parsed error object or original error
 */
const parseErrorObject = (err: { message?: string }): unknown => {
  if (typeof err.message === "string" && err.message.startsWith("{")) {
    try {
      return JSON.parse(err.message);
    } catch {
      return err;
    }
  }
  return err;
};

/**
 * Create an Elysia logger plugin
 * @param options - Logger configuration options
 * @returns Elysia plugin function
 * @example
 * ```typescript
 * const app = new Elysia()
 *   .use(logger())
 *   .get('/', () => 'Hello')
 * ```
 */
export const logger =
  (options: LoggerOptions = { transport: "console", autoLogging: true }) =>
  (app: Elysia) => {
    const log = new Logger(options);

    return app
      .decorate("log", log)
      .derive(({ request }) => {
        return {
          _start: process.hrtime.bigint(),
          _requestId:
            options.logRequestId === true ? crypto.randomUUID() : undefined,
        };
      })
      .onRequest(
        (ctx: {
          request: Request;
          store: { pathname?: string };
          _requestId?: string;
        }) => {
          if (
            options.autoLogging !== false &&
            options.logRequestStart !== false
          ) {
            const requestInfo = ctx._requestId
              ? `[${ctx._requestId.slice(0, 8)}] `
              : "";
            const pathname = getPathname(ctx.request.url);
            ctx.store.pathname = pathname;
            log.log(
              `${requestInfo}${ctx.request.method} ${pathname}`,
              options.context || "Router"
            );
          }
        }
      )
      .onAfterHandle(
        (ctx: {
          request: Request;
          store: { pathname?: string };
          _start?: bigint;
          _requestId?: string;
          params?: Record<string, string>;
          body?: unknown;
        }) => {
          if (options.autoLogging === false || !ctx._start) return;

          // Calculate duration in microseconds for better precision
          const durationNs = process.hrtime.bigint() - ctx._start;
          const durationMs = Number(durationNs) / 1_000_000;
          const duration =
            durationMs < 1
              ? `${(durationMs * 1000).toFixed(0)}μs`
              : `${durationMs.toFixed(2)}ms`;

          const requestInfo = ctx._requestId
            ? `[${ctx._requestId.slice(0, 8)}] `
            : "";

          const pathname = ctx.store.pathname || getPathname(ctx.request.url);
          const baseMessage =
            requestInfo +
            ctx.request.method +
            " " +
            pathname +
            " " +
            pc.yellow("+" + duration);

          // Lazy evaluation: only build details if needed
          let detailsString = "";
          if (options.logDetails) {
            // Only parse URL object if we really need query params
            const url = new URL(ctx.request.url);
            const details = buildRequestDetails(ctx, url);
            if (Object.keys(details).length > 0) {
              detailsString = ` ${JSON.stringify(details)}`;
            }
          }

          log.log(baseMessage + detailsString, options.context || "Router");
        }
      )
      .onError(({ code, error, request, set, store }) => {
        const err = error as Error & {
          message?: string;
          name?: string;
          stack?: string;
          type?: string;
          errors?: Array<{
            path: string;
            summary?: string;
            message: string;
            value: unknown;
          }>;
        };
        const pathname =
          (store as { pathname?: string }).pathname || getPathname(request.url);

        if (code === "VALIDATION") {
          const errorObj = parseErrorObject(err) as {
            type?: string;
            errors?: Array<{
              path: string;
              summary?: string;
              message: string;
              value: unknown;
            }>;
          };

          if (
            errorObj.type === "validation" &&
            errorObj.errors &&
            Array.isArray(errorObj.errors)
          ) {
            const errors = errorObj.errors;
            const errorCount = errors.length;
            const errorSummaries = formatValidationErrors(errors);

            log.warn(
              `${
                request.method
              } ${pathname} - Validation failed (${errorCount} error${
                errorCount > 1 ? "s" : ""
              }): ${errorSummaries}`,
              "ValidationError"
            );

            set.status = 400;
            return buildValidationResponse(errors);
          }
        } else if (err instanceof HttpError) {
          log.warn(
            `${request.method} ${pathname} - ${err.message}`,
            "HttpError"
          );
          set.status = err.status;
          return err.toJSON();
        } else {
          const message =
            typeof err.message === "string" && !err.message.startsWith("{")
              ? err.message
              : err.name || "Unknown error";

          log.error(
            `${request.method} ${pathname} - ${message}`,
            err.stack,
            "Exception"
          );
        }
      })
      .onStart((app) => {
        const server = app.server;
        if (!server) return;

        const address = `${server.hostname}:${server.port}`;
        const protocol = server.development ? "http" : "https";

        log.log(
          `🦊 Elysia is running at ${protocol}://${address}`,
          options.context || "Elysia"
        );

        if (app.routes.length > 0) {
          log.log("Routes:", options.context || "Elysia");
          for (const route of app.routes) {
            log.log(
              `${route.method} ${route.path}`,
              options.context || "Router"
            );
          }
        }
      });
  };
