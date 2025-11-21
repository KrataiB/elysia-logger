import { Elysia } from 'elysia'
import { logger } from '../src/index'

const app = new Elysia()
    .use(logger({
        file: './app.log',
        logRequestStart: false,
        logDetails: true
    }))
    .get('/', () => 'Hello File')
    .get('/user/:id', ({ params }) => `User ${params.id}`)
    .post('/a', ({ body }) => {
        return { message: "www", received: body }
    })
    .listen(3001)

console.log(`🦊 File App running at ${app.server?.hostname}:${app.server?.port}`)
