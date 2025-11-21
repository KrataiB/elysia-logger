import { describe, it, expect, spyOn, beforeEach, afterEach } from 'bun:test'
import { Elysia, t } from 'elysia'
import { logger, HttpError } from '../src/index'
import { existsSync, unlinkSync } from 'fs'

describe('Logger Plugin', () => {
    let bunWriteSpy: any

    beforeEach(() => {
        // @ts-ignore
        bunWriteSpy = spyOn(Bun, 'write')
    })

    afterEach(() => {
        bunWriteSpy?.mockRestore()
        
        // Clean up test log file
        if (existsSync('./test.log')) {
            unlinkSync('./test.log')
        }
    })

    it('should log requests', async () => {
        const app = new Elysia()
            .use(logger())
            .get('/', () => 'Hello World')

        await app.handle(new Request('http://localhost/'))

        expect(bunWriteSpy).toHaveBeenCalled()
        const calls = bunWriteSpy.mock.calls
        const routerLog = calls.find((call: any) => call[1].includes('Router'))
        expect(routerLog).toBeDefined()
        if (routerLog) {
            expect(routerLog[1]).toContain('GET /')
        }
    })

    it('should log errors', async () => {
        const app = new Elysia()
            .use(logger())
            .get('/error', () => { throw new Error('Test Error') })

        await app.handle(new Request('http://localhost/error'))

        expect(bunWriteSpy).toHaveBeenCalled()
        const calls = bunWriteSpy.mock.calls
        const errorLog = calls.find((call: any) => call[1].includes('Exception'))
        expect(errorLog).toBeDefined()
        if (errorLog) {
            expect(errorLog[1]).toContain('Test Error')
        }
    })

    it('should handle validation errors', async () => {
        const app = new Elysia()
            .use(logger())
            .post('/user', ({ body }) => body, {
                body: t.Object({
                    email: t.String(),
                    age: t.Number({ minimum: 0 })
                })
            })

        const response = await app.handle(
            new Request('http://localhost/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test', age: -5 })
            })
        )

        const data = await response.json()
        
        // Should return clean validation error response
        expect(data).toHaveProperty('error')
        expect(data.error).toBe('Validation failed')
        expect(data).toHaveProperty('details')
        
        // Should log validation warning
        expect(bunWriteSpy).toHaveBeenCalled()
        const calls = bunWriteSpy.mock.calls
        const validationLog = calls.find((call: any) => call[1].includes('ValidationError'))
        expect(validationLog).toBeDefined()
    })

    it('should log request details when enabled', async () => {
        const app = new Elysia()
            .use(logger({ logDetails: true }))
            .get('/user/:id', ({ params }) => params)

        await app.handle(new Request('http://localhost/user/123?name=John'))

        const calls = bunWriteSpy.mock.calls
        const detailLog = calls.find((call: any) => 
            call[1].includes('params') || call[1].includes('query')
        )
        expect(detailLog).toBeDefined()
    })

    it('should not log request start when disabled', async () => {
        const app = new Elysia()
            .use(logger({ logRequestStart: false }))
            .get('/', () => 'Hello')

        await app.handle(new Request('http://localhost/'))

        const calls = bunWriteSpy.mock.calls
        // Should only have one log (completion), not two (start + completion)
        const routerLogs = calls.filter((call: any) => call[1].includes('Router'))
        expect(routerLogs.length).toBe(1)
        // Should include duration (either μs or ms)
        expect(routerLogs[0][1]).toMatch(/\+\d+(μs|ms)/)
    })

    it('should disable auto-logging when configured', async () => {
        const app = new Elysia()
            .use(logger({ autoLogging: false }))
            .get('/', () => 'Hello')

        await app.handle(new Request('http://localhost/'))

        // Should not log requests automatically
        const calls = bunWriteSpy.mock.calls
        const routerLogs = calls.filter((call: any) => call[1].includes('Router'))
        expect(routerLogs.length).toBe(0)
    })

    it('should support custom formatter', async () => {
        const app = new Elysia()
            .use(logger({
                formatter: (level, message, context) => `CUSTOM: [${level}] ${message}`
            }))
            .get('/', () => 'Hello')

        await app.handle(new Request('http://localhost/'))

        const calls = bunWriteSpy.mock.calls
        const customLog = calls.find((call: any) => call[1].includes('CUSTOM:'))
        expect(customLog).toBeDefined()
    })

    it('should log to file when configured', async () => {
        const logFile = './test.log'
        
        const app = new Elysia()
            .use(logger({ file: logFile }))
            .get('/', () => 'Hello')

        await app.handle(new Request('http://localhost/'))
        
        // Wait a bit for file write
        await new Promise(resolve => setTimeout(resolve, 100))

        // File should be created
        expect(existsSync(logFile)).toBe(true)
    })
})
