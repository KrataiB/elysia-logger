/**
 * Logger Class
 * @author KrataiB
 * @description Core logging implementation with pino and picocolors
 */

import pino from 'pino'
import pc from 'picocolors'
import type { LoggerOptions } from './types'

export class Logger {
    private pino: pino.Logger

    constructor(private options: LoggerOptions = {}) {
        this.pino = pino({
            level: options.level || 'info',
            enabled: options.enabled ?? true,
            transport: options.file ? {
                target: 'pino/file',
                options: { destination: options.file }
            } : undefined
        })
    }

    private formatMessage(level: string, message: string, context?: string): string {
        if (this.options.formatter) {
            return this.options.formatter(level, message, context || this.options.context)
        }

        const timestamp = new Date().toLocaleString()
        const pid = process.pid
        const ctx = context || this.options.context || 'Elysia'
        
        const colorMap: Record<string, (text: string) => string> = {
            error: pc.red,
            warn: pc.yellow,
            debug: pc.blue,
            verbose: pc.cyan,
            info: pc.green
        }
        const levelColor = colorMap[level] || pc.green

        return `${pc.green('[Elysia]')} ${pc.green(pid.toString())}  - ${timestamp}   ${levelColor(level.toUpperCase())} ${pc.yellow(`[${ctx}]`)} ${pc.green(message)}`
    }

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

    log(message: string, context?: string) {
        this.logToPino('info', message, context)
        if (this.options.transport !== 'json') {
            console.log(this.formatMessage('info', message, context))
        }
    }

    error(message: string, trace?: string, context?: string) {
        this.logToPino('error', message, context, trace)
        if (this.options.transport !== 'json') {
            console.error(this.formatMessage('error', message, context))
            if (trace) console.error(pc.red(trace))
        }
    }

    warn(message: string, context?: string) {
        this.logToPino('warn', message, context)
        if (this.options.transport !== 'json') {
            console.warn(this.formatMessage('warn', message, context))
        }
    }

    debug(message: string, context?: string) {
        this.logToPino('debug', message, context)
        if (this.options.transport !== 'json') {
            console.debug(this.formatMessage('debug', message, context))
        }
    }

    verbose(message: string, context?: string) {
        this.logToPino('verbose', message, context)
        if (this.options.transport !== 'json') {
            console.log(this.formatMessage('verbose', message, context))
        }
    }
}
