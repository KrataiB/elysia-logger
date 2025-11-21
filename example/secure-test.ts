import { Elysia } from 'elysia'
import { logger } from '../src/index'

const app = new Elysia()
    .use(logger({
        logDetails: true
    }))
    .post('/login', ({ body }) => {
        return { success: true }
    })
    .get('/user/:id', ({ params, query }) => {
        return { user: params.id }
    })
    .listen(3003)

