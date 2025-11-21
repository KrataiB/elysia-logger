import { Elysia } from 'elysia'
import { logger } from '../src/index'

const app = new Elysia()
    .use(logger())
    .get('/', () => 'Hello Elysia')
    .get('/error', () => {
        throw new Error('This is an error')
    })
    .post('/data', ({ body, log }) => {
        log.log('Received data', 'Example')
        return body
    })
    .listen(3000)
