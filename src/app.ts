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
import UsersRoutes from './routes/users.routes.js'
import ProductsRoutes from './routes/product.routes.js'
import WishlistRoutes from './routes/wishlist.routes.js'
import CartRoutes from './routes/cart.routes.js'
import OrderRoutes from './routes/order.routes.js'
import PaymentRoutes from './routes/payment.routes.js'
import ReturnRoutes from './routes/return.routes.js'
import GoldPriceRoutes from './routes/goldPrice.routes.js'
import AdminRoutes from './routes/admin/admin.routes.js'
import path from 'node:path'

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

// Static
app.use('/uploads/variant-images',
    express.static(
        path.join(
            process.cwd(),
            'uploads',
            'variant-images'
        )
    )
)

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
app.use('/api/v1/cart', CartRoutes)
app.use('/api/v1/orders', OrderRoutes)
app.use('/api/v1/payments', PaymentRoutes)
app.use('/api/v1/returns', ReturnRoutes)
app.use('/api/v1/gold-prices', GoldPriceRoutes)
// Admin Route
app.use('/api/v1/admin', AdminRoutes)

// Error Handler
app.use((req : Request , res : Response, next : NextFunction) => {
    next(new NotFoundError(req.method + ' => ' + req.path))
})
app.use(errorHandler)

export default app