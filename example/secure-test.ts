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

console.log(`🧪 Test server at http://localhost:3003`)
console.log('\nTest with:')
console.log('curl -X POST http://localhost:3003/login -H "Content-Type: application/json" -d \'{"username":"john","password":"secret123","token":"abc123"}\'')
console.log('curl "http://localhost:3003/user/5?apiKey=sensitive&name=John"')
