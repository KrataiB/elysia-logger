# Elysia Logger

[![npm version](https://img.shields.io/npm/v/elysia-logger.svg)](https://www.npmjs.com/package/elysia-logger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance, NestJS-style logger plugin for [ElysiaJS](https://elysiajs.com/) with beautiful console output and flexible configuration.

**Author:** KrataiB

## ✨ Features

- 🎨 **NestJS-Style UI** - Beautiful, colorful console output
- ⚡ **High Performance** - Built on [pino](https://getpino.io/), one of the fastest Node.js loggers
- 📝 **Hybrid Logging** - Console (pretty) + File (JSON) simultaneously
- 🔧 **Fully Configurable** - Customize everything from log levels to formats
- 📊 **Request Details** - Log query params, path params, and request bodies
- 🎯 **Type-Safe** - Full TypeScript support with proper type inference
- 🚀 **Zero Dependencies Overhead** - Only `pino` and `picocolors`

## 📦 Installation

```bash
# Using bun (recommended)
bun add elysia-logger

# Using npm
npm install elysia-logger

# Using yarn
yarn add elysia-logger

# Using pnpm
pnpm add elysia-logger
```

## 🚀 Quick Start

```typescript
import { Elysia } from "elysia";
import { logger } from "elysia-logger";

const app = new Elysia()
  .use(logger())
  .get("/", () => "Hello World")
  .listen(3000);
```

That's it! You'll now see beautiful logs like:

```
[Elysia] 12345  - 11/21/2025, 2:00:00 PM   INFO [Elysia] 🦊 Elysia is running at http://localhost:3000
[Elysia] 12345  - 11/21/2025, 2:00:00 PM   INFO [Elysia] Routes:
[Elysia] 12345  - 11/21/2025, 2:00:00 PM   INFO [Router] GET /
[Elysia] 12345  - 11/21/2025, 2:00:05 PM   INFO [Router] GET / +2ms
```

## 📖 Configuration

### Basic Options

```typescript
import { logger } from "elysia-logger";

app.use(
  logger({
    // Transport type: 'console' (pretty) or 'json'
    transport: "console", // default

    // Enable/disable all logging
    enabled: true, // default

    // Log level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
    level: "info", // default

    // Context name for logs
    context: "MyApp", // default: 'Elysia'
  })
);
```

### File Logging

Log to a file in JSON format (perfect for production):

```typescript
app.use(
  logger({
    file: "./app.log",
  })
);
```

**Hybrid Mode** - Both console (pretty) AND file (JSON):

```typescript
app.use(
  logger({
    transport: "console", // Pretty console output
    file: "./app.log", // JSON file output
  })
);
```

### Request Logging Options

```typescript
app.use(
  logger({
    // Auto-log all requests/responses
    autoLogging: true, // default

    // Log request start (before processing)
    logRequestStart: false, // default: true

    // Log request details (params, query, body)
    logDetails: true, // default: false
  })
);
```

**Example with `logDetails: true`:**

```
[Router] POST /user/123 +5ms {"params":{"id":"123"},"body":{"name":"John","email":"john@example.com"}}
```

### Custom Formatter

Define your own log format:

```typescript
app.use(
  logger({
    formatter: (level, message, context) => {
      return `[${level.toUpperCase()}] ${context}: ${message}`;
    },
  })
);
```

## 🎯 Advanced Usage

### Using the Logger Manually

Access the logger instance via `ctx.log`:

```typescript
app.get("/custom", (ctx) => {
  ctx.log.log("This is an info message", "MyContext");
  ctx.log.error("Something went wrong!", "Error stack trace", "ErrorContext");
  ctx.log.warn("Warning message");
  ctx.log.debug("Debug info");
  ctx.log.verbose("Verbose logging");

  return "Done";
});
```

### Standalone Logger

Use the Logger class independently:

```typescript
import { Logger } from "elysia-logger";

const log = new Logger({
  transport: "console",
  level: "debug",
});

log.log("Hello from standalone logger!");
log.error("Error message", "Stack trace");
```

## 📊 Complete Example

```typescript
import { Elysia } from "elysia";
import { logger } from "elysia-logger";

const app = new Elysia()
  .use(
    logger({
      transport: "console",
      file: "./logs/app.log",
      level: "info",
      logDetails: true,
      logRequestStart: false,
    })
  )
  .get("/", () => "Hello World")
  .get("/user/:id", ({ params, log }) => {
    log.log(`Fetching user ${params.id}`, "UserController");
    return { user: params.id };
  })
  .post("/create", ({ body, log }) => {
    log.log("Creating new item", "CreateController");
    return { created: true };
  })
  .onError(({ error, log }) => {
    log.error("Unhandled error", error.stack, "GlobalError");
    return { error: error.message };
  })
  .listen(3000);

console.log("Server running on http://localhost:3000");
```

## 📝 API Reference

### `LoggerOptions`

| Option            | Type                                                           | Default     | Description                   |
| ----------------- | -------------------------------------------------------------- | ----------- | ----------------------------- |
| `transport`       | `'console' \| 'json'`                                          | `'console'` | Output format                 |
| `enabled`         | `boolean`                                                      | `true`      | Enable/disable logging        |
| `level`           | `'fatal' \| 'error' \| 'warn' \| 'info' \| 'debug' \| 'trace'` | `'info'`    | Minimum log level             |
| `context`         | `string`                                                       | `'Elysia'`  | Default context name          |
| `file`            | `string`                                                       | `undefined` | File path for JSON logs       |
| `autoLogging`     | `boolean`                                                      | `true`      | Auto-log requests/responses   |
| `logRequestStart` | `boolean`                                                      | `true`      | Log when request starts       |
| `logDetails`      | `boolean`                                                      | `false`     | Log request params/query/body |
| `formatter`       | `(level, message, context?) => string`                         | `undefined` | Custom format function        |

### `Logger` Class Methods

```typescript
class Logger {
  log(message: string, context?: string): void;
  error(message: string, trace?: string, context?: string): void;
  warn(message: string, context?: string): void;
  debug(message: string, context?: string): void;
  verbose(message: string, context?: string): void;
}
```

## 🎨 Log Levels

Logs are color-coded by level:

- 🟢 **INFO** - Green
- 🔴 **ERROR** - Red
- 🟡 **WARN** - Yellow
- 🔵 **DEBUG** - Blue
- 🔷 **VERBOSE** - Cyan

## 🔒 Production Best Practices

### Recommended Production Config

```typescript
app.use(
  logger({
    transport: "json", // Structured logs for log aggregators
    file: "./logs/app.log", // Persist to file
    level: "info", // Filter out debug/verbose
    logDetails: false, // Avoid logging sensitive data
    logRequestStart: false, // Reduce log noise
  })
);
```

### Log Rotation

For production, use a log rotation tool like [logrotate](https://linux.die.net/man/8/logrotate) or [pm2](https://pm2.keymetrics.io/docs/usage/log-management/).

## 🧪 Testing

```bash
bun test
```

## 📄 License

MIT © KrataiB

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📮 Issues

Found a bug? Have a feature request? Please [open an issue](https://github.com/yourusername/elysia-logger/issues).

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ for the Elysia community**
