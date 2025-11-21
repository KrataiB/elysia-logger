import { Elysia } from 'elysia'
import { logger } from '../src/index'

const app = new Elysia()
    .use(logger({
        formatter: (level, message, context) => `[CUSTOM] ${level.toUpperCase()} (${context}): ${message}`
    }))
    .get('/', () => 'Hello Custom')
    .listen(3002)

console.log(`🦊 Custom App running at ${app.server?.hostname}:${app.server?.port}`)
