import { Elysia, t } from 'elysia'
import { logger } from '../src/index'

const app = new Elysia()
    .use(logger(
        {
            
        }
    ))
    // 1. Validation Error Example
    .post('/user', ({ body }) => {
        return { created: true, user: body }
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            age: t.Number({ minimum: 0 }),
            name: t.String({ minLength: 2 })
        })
    })
    // 2. Runtime Exception (thrown error)
    .get('/error', () => {
        throw new Error('Something went wrong!')
    })
    // 3. Not Found Exception
    .get('/user/:id', ({ params, set }) => {
        const userId = params.id
        if (userId === '999') {
            set.status = 404
            return { error: 'User not found', userId }
        }
        return { id: userId, name: 'John Doe' }
    })
    // 4. Unauthorized Exception
    .get('/protected', ({ headers, set }) => {
        const token = headers.authorization
        if (!token) {
            set.status = 401
            return { error: 'Unauthorized', message: 'Missing authorization token' }
        }
        return { data: 'Protected resource' }
    })
    // 5. Database Error Simulation
    .get('/database-error', () => {
        // Simulate database connection error
        throw new Error('Database connection failed: ECONNREFUSED')
    })
    // 6. Async Error
    .get('/async-error', async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        throw new Error('Async operation failed')
    })
    .listen(4000)
