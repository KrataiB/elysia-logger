/**
 * Logger Class
 * @author KrataiB
 * @description Core logging implementation with pino and picocolors
 */

import pino from 'pino'
import pc from 'picocolors'
import type { LoggerOptions } from './types'

/**
 * NestJS-style logger for ElysiaJS with pino backend
 * @class Logger
 */
export class Logger {
    private pino: pino.Logger
    private options: LoggerOptions
    private stream: NodeJS.WriteStream
    private static cachedTime: string = new Date().toISOString().replace('T', ' ').substring(0, 19)
    private static timer: Timer | null = null

    /**
     * Creates a new Logger instance
     * @param options - Logger configuration options
     */
    constructor(options: LoggerOptions = {}) {
        this.options = options
        this.stream = process.stdout
        this.pino = pino({
            level: options.level || 'info',
            enabled: options.enabled !== false,
            ...(options.file && {
                transport: {
                    target: 'pino/file',
                    options: { destination: options.file }
                }
            })
        })

        // Start timer if not already started
        if (!Logger.timer) {
            Logger.timer = setInterval(() => {
                Logger.cachedTime = new Date().toISOString().replace('T', ' ').substring(0, 19)
            }, 1000)
            Logger.timer.unref() // Don't prevent process exit
        }
    }

    /**
     * Format log message with NestJS-style colors and metadata
     * @param level - Log level (info, warn, error, debug, verbose)
     * @param message - Log message
     * @param context - Optional context label
     * @returns Formatted log message with colors
     */
    private formatMessage(level: string, message: string, context?: string): string {
        if (this.options.formatter) {
            return this.options.formatter(level, message, context || this.options.context)
        }

        const pid = process.pid
        const ctx = context || this.options.context || 'Elysia'
        
        // Pre-computed colors to avoid function calls
        const colors = {
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            red: '\x1b[31m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            dim: '\x1b[2m',
            reset: '\x1b[0m'
        }

        let levelColor = colors.green
        switch (level) {
            case 'error': levelColor = colors.red; break
            case 'warn': levelColor = colors.yellow; break
            case 'debug': levelColor = colors.magenta; break
            case 'verbose': levelColor = colors.cyan; break
        }
        
        return `${colors.green}[Elysia]${colors.reset} ${colors.dim}${pid}  -${colors.reset} ${colors.dim}${Logger.cachedTime}${colors.reset}   ${levelColor}${level.toUpperCase()}${colors.reset} ${colors.yellow}[${ctx}]${colors.reset} ${message}\n`
    }

    /**
     * Strip ANSI color codes from string
     * @param str - String with ANSI codes
     * @returns Clean string without color codes
     */
    private stripAnsi(str: string): string {
        // Comprehensive regex to match all ANSI escape codes
        // eslint-disable-next-line no-control-regex
        return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
    }

    /**
     * Write to stdout directly for better performance
     */
    private write(message: string): void {
        // @ts-ignore
        if (typeof Bun !== 'undefined') {
            // @ts-ignore
            Bun.write(Bun.stdout, message)
        } else {
            this.stream.write(message)
        }
    }

    /**
     * Log info level message
     * @param message - Message to log
     * @param context - Optional context label
     */
    log(message: string, context?: string): void {
        const formatted = this.formatMessage('info', message, context)
        
        if (this.options.transport === 'json' || this.options.file) {
            this.pino.info({ msg: this.stripAnsi(formatted).trim() })
        } else {
            this.write(formatted)
        }
    }

    /**
     * Log error level message with optional stack trace
     * @param message - Error message
     * @param trace - Optional stack trace
     * @param context - Optional context label
     */
    error(message: string, trace?: string, context?: string): void {
        const formatted = this.formatMessage('error', message, context)
        
        if (this.options.transport === 'json' || this.options.file) {
            this.pino.error({ msg: this.stripAnsi(formatted).trim(), trace })
        } else {
            this.write(formatted)
            if (trace) {
                this.write(`${trace}\n`)
            }
        }
    }

    /**
     * Log warning level message
     * @param message - Warning message
     * @param context - Optional context label
     */
    warn(message: string, context?: string): void {
        const formatted = this.formatMessage('warn', message, context)
        
        if (this.options.transport === 'json' || this.options.file) {
            this.pino.warn({ msg: this.stripAnsi(formatted).trim() })
        } else {
            this.write(formatted)
        }
    }

    /**
     * Log debug level message
     * @param message - Debug message
     * @param context - Optional context label
     */
    debug(message: string, context?: string): void {
        const formatted = this.formatMessage('debug', message, context)
        
        if (this.options.transport === 'json' || this.options.file) {
            this.pino.debug({ msg: this.stripAnsi(formatted).trim() })
        } else {
            this.write(formatted)
        }
    }

    /**
     * Log verbose level message
     * @param message - Verbose message
     * @param context - Optional context label
     */
    verbose(message: string, context?: string): void {
        const formatted = this.formatMessage('verbose', message, context)
        
        if (this.options.transport === 'json' || this.options.file) {
            this.pino.trace({ msg: this.stripAnsi(formatted).trim() })
        } else {
            this.write(formatted)
        }
    }
}
