import { Elysia } from 'elysia'
import { logger } from '../src/index'

const app = new Elysia()
    .use(logger({
        level: 'info'
    }))
    .get('/', () => 'Hello World')
    .listen(3000)

console.log(`Elysia logger server running at ${app.server?.hostname}:${app.server?.port}`)
