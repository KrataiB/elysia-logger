import { Elysia } from 'elysia'

const app = new Elysia()
    .get('/', () => 'Hello World')
    .listen(3002)

console.log(`Baseline server running at ${app.server?.hostname}:${app.server?.port}`)
