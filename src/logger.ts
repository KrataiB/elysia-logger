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

    /**
     * Creates a new Logger instance
     * @param options - Logger configuration options
     */
    constructor(options: LoggerOptions = {}) {
        this.options = options
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

        const timestamp = new Date().toLocaleString()
        const pid = process.pid
        const ctx = context || this.options.context || 'Elysia'
        
        // NestJS-style color mapping
        const colorMap: Record<string, (text: string) => string> = {
            error: pc.red,      // Red = Danger/Critical
            warn: pc.yellow,    // Yellow = Warning/Caution
            info: pc.green,     // Green = Success/Normal
            debug: pc.magenta,  // Magenta = Debug info
            verbose: pc.cyan    // Cyan = Detailed info
        }
        const levelColor = colorMap[level] || pc.green

        // Dim color for metadata (timestamp, pid, context)
        const dim = (text: string) => pc.dim(text)
        
        return `${pc.green('[Elysia]')} ${dim(pid.toString())}  - ${dim(timestamp)}   ${levelColor(level.toUpperCase())} ${pc.yellow(`[${ctx}]`)} ${message}`
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

    private logToPino(level: string, message: string, context?: string, trace?: string): void {
        if (this.options.file || this.options.transport === 'json') {
            const payload = { level, message: this.stripAnsi(message), context: context || this.options.context }
            if (trace) Object.assign(payload, { trace })
            
            switch (level) {
                case 'info':
                    this.pino.info(payload)
                    break
                case 'error':
                    this.pino.error(payload)
                    break
                case 'warn':
                    this.pino.warn(payload)
                    break
                case 'debug':
                    this.pino.debug(payload)
                    break
                case 'verbose':
                    this.pino.trace(payload)
                    break
            }
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
            this.pino.info({ msg: this.stripAnsi(formatted) })
        } else {
            console.log(formatted)
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
            this.pino.error({ msg: this.stripAnsi(formatted), trace })
        } else {
            console.error(formatted)
            if (trace) {
                console.error(trace)
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
            this.pino.warn({ msg: this.stripAnsi(formatted) })
        } else {
            console.warn(formatted)
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
            this.pino.debug({ msg: this.stripAnsi(formatted) })
        } else {
            console.debug(formatted)
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
            this.pino.trace({ msg: this.stripAnsi(formatted) })
        } else {
            console.log(formatted)
        }
    }
}
