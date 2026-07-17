import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
// Middlewares
import { errorHandler } from './middleware/errorHandler.js'
import { NotFoundError } from './utils/appError.js'
import { loggerMiddleware } from './middleware/logger.middleware.js'
// Routes Files
import AuthRoutes from './routes/auth.routes.js'
import UsersRoutes from './routes/users.route.js'
import ProductsRoutes from './routes/product.routes.js'
import WishlistRoutes from './routes/wishlist.routes.js'

const app = express()

app.use(compression({
    level: 6, 
    threshold: 1024,
    filter: (req, res) => {
        if (req.path.startsWith('/api/')) {
            return true
        }
        return compression.filter(req, res)
    }
}))

app.use(helmet())
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))
app.use(loggerMiddleware)

// ---------- Routes ----------
// Health
app.get('/health', (req: Request, res: Response) => {
    req.logger.info('HEALTH')
    res.json({
        success : true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    })
})

// Main Routes
app.use('/api/v1/auth', AuthRoutes)
app.use('/api/v1/users', UsersRoutes)
app.use('/api/v1/products', ProductsRoutes)
app.use('/api/v1/wishlist', WishlistRoutes)

// Error Handler
app.use((req : Request , res : Response, next : NextFunction) => {
    next(new NotFoundError(req.method + ' => ' + req.path))
})
app.use(errorHandler)

export default app