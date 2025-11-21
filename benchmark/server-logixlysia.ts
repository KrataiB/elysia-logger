import { Elysia } from 'elysia'
import logixlysia from 'logixlysia'

const app = new Elysia()
    .use(logixlysia())
    .get('/', () => 'Hello World')
    .listen(3001)

console.log(`Logixlysia server running at ${app.server?.hostname}:${app.server?.port}`)
