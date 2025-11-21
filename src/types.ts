/**
 * Type Definitions
 * @author KrataiB
 * @description TypeScript interfaces for logger configuration
 */

import type pino from 'pino'

export interface LoggerOptions {
    /**
     * Context for the logger
     * @default 'Elysia'
     */
    context?: string
    /**
     * Enable/disable logging
     * @default true
     */
    enabled?: boolean
    /**
     * Log level
     * @default 'info'
     */
    level?: pino.Level
    /**
     * Transport type
     * @default 'console'
     */
    transport?: 'console' | 'json'
    /**
     * Custom formatter function
     */
    formatter?: (level: string, message: string, context?: string) => string
    /**
     * Auto-log requests
     * @default true
     */
    autoLogging?: boolean
    /**
     * Output file path
     */
    file?: string
    /**
     * Log request start
     * @default true
     */
    logRequestStart?: boolean
    /**
     * Log request details (params, query, body)
     * @default false
     */
    logDetails?: boolean
    /**
     * Log request ID (first 8 characters of UUID)
     * @default true
     */
    logRequestId?: boolean
}

export interface RequestDetails {
    query?: Record<string, string>
    params?: Record<string, string>
    body?: unknown
}
