import { describe, it, expect, spyOn } from 'bun:test'
import { Elysia } from 'elysia'
import { logger } from '../src/index'

describe('Logger Plugin', () => {
    it('should log requests', async () => {
        const app = new Elysia()
            .use(logger())
            .get('/', () => 'Hello World')

        const spy = spyOn(console, 'log')

        await app.handle(new Request('http://localhost/'))

        expect(spy).toHaveBeenCalled()
        const calls = spy.mock.calls
        // Check for router log
        const routerLog = calls.find(call => call[0].includes('Router'))
        expect(routerLog).toBeDefined()
        if (routerLog) {
            expect(routerLog[0]).toContain('GET /')
        }
        
        spy.mockRestore()
    })

    it('should log errors', async () => {
        const app = new Elysia()
            .use(logger())
            .get('/error', () => { throw new Error('Test Error') })

        const spy = spyOn(console, 'error')

        await app.handle(new Request('http://localhost/error'))

        expect(spy).toHaveBeenCalled()
        const calls = spy.mock.calls
        const errorLog = calls.find(call => call[0].includes('Exception'))
        expect(errorLog).toBeDefined()
        if (errorLog) {
            expect(errorLog[0]).toContain('Test Error')
        }

        spy.mockRestore()
    })
})
