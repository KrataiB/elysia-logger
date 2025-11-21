/**
 * Elysia Logger Plugin
 * @author KrataiB
 * @description A high-performance, NestJS-style logger for ElysiaJS
 */

import { Elysia } from 'elysia'
import pc from 'picocolors'
import { Logger } from './logger'
import type { LoggerOptions, RequestDetails } from './types'

export { Logger } from './logger'
export type { LoggerOptions, RequestDetails } from './types'

export const logger = (options: LoggerOptions = { transport: 'console', autoLogging: true }) => (app: Elysia) => {
    const log = new Logger(options)

    return app
        .decorate('log', log)
        .derive(() => {
            return {
                _start: Date.now()
            }
        })
        .onRequest((ctx) => {
            if (options.autoLogging !== false && options.logRequestStart !== false) {
                log.log(`${ctx.request.method} ${new URL(ctx.request.url).pathname}`, 'Router')
            }
        })
        .onAfterHandle((ctx) => {
            if (options.autoLogging !== false && ctx._start) {
                const duration = Date.now() - ctx._start
                const url = new URL(ctx.request.url)
                const pathname = url.pathname
                const baseMessage = `${ctx.request.method} ${pathname} ${pc.yellow(`+${duration}ms`)}`
                
                let detailsString = ''
                if (options.logDetails) {
                    const details: RequestDetails = {}
                    
                    // Log query params
                    if (url.search) {
                        details.query = Object.fromEntries(url.searchParams)
                    }
                    
                    // Log path params
                    if (ctx.params && Object.keys(ctx.params).length > 0) {
                        details.params = ctx.params
                    }
                    
                    // Log body
                    if (ctx.body !== undefined && ctx.body !== null) {
                        details.body = ctx.body
                    }
                    
                    if (Object.keys(details).length > 0) {
                        detailsString = ` ${JSON.stringify(details)}`
                    }
                }
                
                log.log(baseMessage + detailsString, 'Router')
            }
        })
        .onError(({ error, request }) => {
             const err = error as Error
             const message = err.message || 'Unknown error'
             const stack = err.stack
             log.error(`${request.method} ${new URL(request.url).pathname} - ${message}`, stack, 'Exception')
        })
        .onStart((app) => {
            const server = app.server
            if (!server) return

            const address = `${server.hostname}:${server.port}`
            const protocol = app.server?.development ? 'http' : 'https'
            
            log.log(`🦊 Elysia is running at ${protocol}://${address}`, 'Elysia')

            if (app.routes.length > 0) {
                log.log(`Routes:`, 'Elysia')
                for (const route of app.routes) {
                    log.log(`${route.method} ${route.path}`, 'Router')
                }
            }
        })
}
