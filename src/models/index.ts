import sequelize from "../configs/sequelize.config.js";
import Address from "./address.model.js";
import { Cart, CartItem } from "./cart.model.js";
import { Category, ProductCategory } from "./category.model.js";
import Coupon from "./coupon.model.js";
import FailedJob from "./failedJob.model.js";
import GoldPrice from "./goldPrice.model.js";
import Inventory from "./inventory.model.js";
import { Order, OrderItem } from "./order.model.js";
import Payment from "./payment.model.js";
import { Product, ProductDiscount, ProductImage, ProductPricing, ProductVariant } from "./product.model.js";
import { ReturnItem, ReturnRequest } from "./return.model.js";
import Review from "./review.model.js";
import { Role, UserRole } from "./role.model.js";
import Setting from "./setting.model.js";
import User from "./user.model.js";
import Wishlist from "./wishlist.model.js";

export default async function initializeDatabase() {
    // ---------- Sync ----------
    // USER
    await User.sync({alter : true})
    await Role.sync({alter : true})
    await UserRole.sync({alter : true})
    await Address.sync({alter : true})
    // PRODUCT & CATEGORY
    await Product.sync({alter : true})
    await Category.sync({alter : true})
    await ProductCategory.sync({alter : true})
    // VARIANT $ PRICE
    await ProductVariant.sync({alter : true})
    await ProductImage.sync({alter : true})
    await ProductPricing.sync({alter : true})
    await ProductDiscount.sync({alter : true})
    await GoldPrice.sync({alter : true})
    await Inventory.sync({alter : true})
    await Wishlist.sync({alter : true})
    await Review.sync({alter : true})
    // CART & ORDER
    await Coupon.sync({alter : true})
    await Cart.sync({alter : true})
    await CartItem.sync({alter : true})
    await Order.sync({alter : true})
    await OrderItem.sync({alter : true})
    // RETURN
    await ReturnRequest.sync({alter : true})
    await ReturnItem.sync({alter : true})
    // PAYMENT
    await Payment.sync({alter : true})
    // GENERAL SITE SETTING
    await Setting.sync({alter : true})
    await FailedJob.sync({alter : true})

    // ---------- Associations ----------
    associations()
    // ---------- SEEDER ---------
    await seedDatabase()
}

function associations() {
    // User - Role
    User.hasMany(UserRole , {
        foreignKey : 'userId',
        as : 'roles',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    Role.hasMany(UserRole, {
        foreignKey : 'roleId',
        as : 'users',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    UserRole.belongsTo(User, {
        foreignKey : 'userId',
        as : 'user'
    })
    UserRole.belongsTo(Role, {
        foreignKey : 'roleId',
        as : 'role'
    })
    // User - Address
    User.hasMany(Address, {
        foreignKey : 'userId',
        as : 'addresses',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    Address.belongsTo(User, {
        foreignKey : 'userId',
        as : 'user'
    })
    // Product - Category
    Product.hasMany(ProductCategory, {
        foreignKey : 'productId',
        as : 'categories',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    Category.hasMany(ProductCategory, {
        foreignKey : 'categoryId',
        as : 'products',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    ProductCategory.belongsTo(Product, {
        foreignKey : 'productId',
        as : 'product'
    })
    ProductCategory.belongsTo(Category, {
        foreignKey : 'categoryId',
        as : 'category'
    })
    // Product - ProductVariant
    Product.hasMany(ProductVariant, {
        foreignKey : 'productId',
        as : 'variants',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    ProductVariant.belongsTo(Product, {
        foreignKey : 'productId',
        as : 'product'
    })
    // ProductVariant - Image
    ProductVariant.hasMany(ProductImage, {
        foreignKey : 'variantId',
        as : 'images',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    ProductImage.belongsTo(ProductVariant, {
        foreignKey : 'variantId',
        as : 'variant'
    })
    // ProductVariant - Inventory
    ProductVariant.hasOne(Inventory, {
        foreignKey : 'variantId',
        as : 'inventory',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    Inventory.belongsTo(ProductVariant, {
        foreignKey : 'variantId',
        as : 'variant'
    })
    // ProductVariant - Review - User
    ProductVariant.hasMany(Review, {
        foreignKey : 'variantId',
        as : 'reviews',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    User.hasMany(Review, {
        foreignKey : 'userId',
        as : 'reviews',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    Review.belongsTo(ProductVariant, {
        foreignKey : 'variantId',
        as : 'variant'
    })
    Review.belongsTo(User, {
        foreignKey : 'userId',
        as : 'user'
    })
    // ProductVariant - Wishlist - User
    ProductVariant.hasMany(Wishlist, {
        foreignKey : 'variantId',
        as : 'wishlists',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    User.hasMany(Wishlist, {
        foreignKey : 'userId',
        as : 'wishlists',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    Wishlist.belongsTo(ProductVariant, {
        foreignKey : 'variantId',
        as : 'variant'
    })
    Wishlist.belongsTo(User, {
        foreignKey : 'userId',
        as : 'user'
    })
    // ProductVariant - ProductDiscount
    ProductVariant.hasMany(ProductDiscount, {
        foreignKey : 'variantId',
        as : 'discounts',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    ProductDiscount.belongsTo(ProductVariant, {
        foreignKey : 'variantId',
        as : 'variant'
    })
    // ProductVariant - ProductPricing - Category
    ProductVariant.hasMany(ProductPricing, {
        foreignKey : 'variantId',
        as : 'prices',
        onDelete : 'SET NULL',
        onUpdate : 'CASCADE'
    })
    Category.hasMany(ProductPricing, {
        foreignKey : 'categoryId',
        as : 'prices',
        onDelete : 'SET NULL',
        onUpdate : 'CASCADE'
    })
    ProductPricing.belongsTo(ProductVariant, {
        foreignKey : 'variantId',
        as : 'variants'
    })
    ProductPricing.belongsTo(Category, {
        foreignKey : 'categoryId',
        as : 'categories'
    })
    // CartItem - Cart - User
    Cart.hasMany(CartItem, {
        foreignKey : 'cartId',
        as : 'items',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    Cart.belongsTo(User, {
        foreignKey : 'userId',
        as : 'user',
    })
    CartItem.belongsTo(Cart, {
        foreignKey : 'cartId',
        as : 'cart'
    })
    User.hasOne(Cart, {
        foreignKey : 'userId',
        as : 'cart',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    // CartItem - ProductVariant
    CartItem.belongsTo(ProductVariant, {
        foreignKey : 'variantId',
        as : 'variant',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    ProductVariant.hasMany(CartItem, {
        foreignKey : 'variantId',
        as : 'cartItems'
    })
    // OrderItem - Order - Address - User
    Order.hasMany(OrderItem, {
        foreignKey : 'orderId',
        as : 'items',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    Order.belongsTo(User, {
        foreignKey : 'userId',
        as : 'user',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    Order.belongsTo(Address, {
        foreignKey : 'addressId',
        as : 'address',
        onDelete : 'NO ACTION',
        onUpdate : 'CASCADE'
    })
    OrderItem.belongsTo(Order, {
        foreignKey : 'orderId',
        as : 'order'
    })
    User.hasMany(Order, {
        foreignKey : 'userId',
        as : 'orders'
    })
    Address.hasMany(Order, {
        foreignKey : 'addressId',
        as : 'orders'
    })
    // OrderItem - ProductVariant
    OrderItem.belongsTo(ProductVariant, {
        foreignKey : 'variantId',
        as : 'variant',
        onDelete: 'RESTRICT',
        onUpdate : 'CASCADE'
    })
    ProductVariant.hasMany(OrderItem, {
        foreignKey : 'variantId',
        as : 'orderItems'
    })
    // Order - Coupon
    Order.belongsTo(Coupon,{
        foreignKey : 'couponId',
        as : 'coupon',
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
    })
    Coupon.hasMany(Order, {
        foreignKey : 'couponId',
        as : 'orders'
    })
    // Order - Payment
    Payment.belongsTo(Order, {
        foreignKey : 'orderId',
        as : 'order',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    Order.hasMany(Payment, {
        foreignKey : 'orderId',
        as : 'payments'
    })
    // Order - ReturnRequest - User(Admin)
    ReturnRequest.belongsTo(Order, {
        foreignKey : 'orderId',
        as : 'order',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    ReturnRequest.belongsTo(User, {
        foreignKey : 'reviewedBy',
        as : 'admin',
        onDelete : 'RESTRICT',
        onUpdate : 'CASCADE'
    })
    Order.hasMany(ReturnRequest, {
        foreignKey : 'orderId',
        as : 'returnRequests'
    })
    User.hasMany(ReturnRequest, {
        foreignKey : 'reviewedBy',
        as : 'reviewedRequests'
    })
    // ReturnRequests - ReturnItem
    ReturnRequest.hasMany(ReturnItem, {
        foreignKey : 'returnRequestId',
        as : 'items',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    ReturnItem.belongsTo(ReturnRequest, {
        foreignKey : 'returnRequestId',
        as : 'returnRequest'
    })
    // ReturnItem - OrderItem
    ReturnItem.belongsTo(OrderItem, {
        foreignKey : 'orderItemId',
        as : 'orderItem',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    OrderItem.hasMany(ReturnItem, {
        foreignKey : 'orderItemId',
        as : 'returnItems'
    })
    // Payment - ReturnRequest
    ReturnRequest.belongsTo(Payment, {
        foreignKey : 'refundId',
        as : 'payment',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    Payment.hasMany(ReturnRequest, {
        foreignKey : 'refundId',
        as : 'refunds'
    })
}

async function seedDatabase() {
    // ROLES
    const owner = await Role.findOrCreate({
        where : {name : 'Owner'},
        defaults : {name : 'Owner'}
    })
    const admin = await Role.findOrCreate({
        where : {name : 'Admin'},
        defaults : {name : 'Admin'}
    })
    const user = await Role.findOrCreate({
        where : {name : 'User'},
        defaults : {name : 'User'}
    })
    // USERS
    const ownerU = await User.findOrCreate({
        where : {email : 'owner@gmail.com'},
        defaults : {
            name : 'Owner',
            email : 'owner@gmail.com',
            phone : '09123456789',
            password : '$2b$12$O5kQW/PfPZDxoFiyBeILtOEFH3DtlrvAp87N4GLZbyLEs14nfys4u', // admin123
            isEmailVerified : true,
            emailVerifiedAt : sequelize.fn('NOW') as unknown as Date,
            isActive : true,  
        }
    })
    const adminU = await User.findOrCreate({
        where : {email : 'admin@gmail.com'},
        defaults : {
            name : 'Admin',
            email : 'admin@gmail.com',
            phone : '09123456789',
            password : '$2b$12$O5kQW/PfPZDxoFiyBeILtOEFH3DtlrvAp87N4GLZbyLEs14nfys4u', // admin123
            isEmailVerified : true,
            emailVerifiedAt : sequelize.fn('NOW') as unknown as Date,
            isActive : true,  
        }
    })
    const user1 = await User.findOrCreate({
        where : {email : 'user1@gmail.com'},
        defaults : {
            name : 'User1',
            email : 'user1@gmail.com',
            phone : '09123456789',
            password : '$2b$12$O5kQW/PfPZDxoFiyBeILtOEFH3DtlrvAp87N4GLZbyLEs14nfys4u', // admin123
            isEmailVerified : true,
            emailVerifiedAt : sequelize.fn('NOW') as unknown as Date,
            isActive : true,  
        }
    })
    const user2 = await User.findOrCreate({
        where : {email : 'user2@gmail.com'},
        defaults : {
            name : 'User2',
            email : 'user2@gmail.com',
            phone : '09123456789',
            password : '$2b$12$O5kQW/PfPZDxoFiyBeILtOEFH3DtlrvAp87N4GLZbyLEs14nfys4u', // admin123
            isEmailVerified : false,
            // emailVerifiedAt : sequelize.fn('NOW') as unknown as Date,
            isActive : true,  
        }
    })
    // USER-ROLE
    const ownerRole = await UserRole.findOrCreate({
        where : {userId : ownerU[0].dataValues.id},
        defaults : {
            userId : ownerU[0].dataValues.id,
            roleId : owner[0].dataValues.id
        }
    })
    const adminRole = await UserRole.findOrCreate({
        where : {userId : adminU[0].dataValues.id},
        defaults : {
            userId : adminU[0].dataValues.id,
            roleId : admin[0].dataValues.id
        }
    })
    const userRole1 = await UserRole.findOrCreate({
        where : {userId : user1[0].dataValues.id},
        defaults : {
            userId : user1[0].dataValues.id,
            roleId : user[0].dataValues.id
        }
    })
    const userRole2 = await UserRole.findOrCreate({
        where : {userId : user2[0].dataValues.id},
        defaults : {
            userId : user2[0].dataValues.id,
            roleId : user[0].dataValues.id
        }
    })

    // Category
     const [ringCategory] = await Category.findOrCreate({
        where: { slug: 'ring' },
        defaults: {
            title: 'انگشتر',
            slug: 'ring',
            parentId: null,
            isActive: true,
        }
    })

    const [necklaceCategory] = await Category.findOrCreate({
        where: { slug: 'necklace' },
        defaults: {
            title: 'گردنبند',
            slug: 'necklace',
            parentId: null,
            isActive: true,
        }
    })

    const [braceletCategory] = await Category.findOrCreate({
        where: { slug: 'bracelet' },
        defaults: {
            title: 'دستبند',
            slug: 'bracelet',
            parentId: null,
            isActive: false,
        }
    })

    const [goldRingCategory] = await Category.findOrCreate({
        where: { slug: 'gold-ring' },
        defaults: {
            title: 'انگشتر طلا',
            slug: 'gold-ring',
            parentId: ringCategory.dataValues.id,
            isActive: true,
        }
    })

    const [diamondRingCategory] = await Category.findOrCreate({
        where: { slug: 'diamond-ring' },
        defaults: {
            title: 'انگشتر الماس',
            slug: 'diamond-ring',
            parentId: ringCategory.dataValues.id,
            isActive: true,
        }
    })

    const [goldNecklaceCategory] = await Category.findOrCreate({
        where: { slug: 'gold-necklace' },
        defaults: {
            title: 'گردنبند طلا',
            slug: 'gold-necklace',
            parentId: necklaceCategory.dataValues.id,
            isActive: true,
        }
    })

    const [mensDiamondRingCategory] = await Category.findOrCreate({
        where: { slug: 'mens-diamond-ring' },
        defaults: {
            title: 'انگشتر الماس مردانه',
            slug: 'mens-diamond-ring',
            parentId: diamondRingCategory.dataValues.id,
            isActive: true,
        }
    })

    const [womensDiamondRingCategory] = await Category.findOrCreate({
        where: { slug: 'womens-diamond-ring' },
        defaults: {
            title: 'انگشتر الماس زنانه',
            slug: 'womens-diamond-ring',
            parentId: diamondRingCategory.dataValues.id,
            isActive: true,
        }
    })

    // Product
    const [product1] = await Product.findOrCreate({
        where: { slug: 'gold-ring-18k' },
        defaults: {
            title: 'انگشتر طلای ۱۸ عیار',
            slug: 'gold-ring-18k',
            description: 'انگشتر طلای ۱۸ عیار با طراحی کلاسیک و وزن ۲.۱۵ گرم. مناسب برای استفاده روزمره و هدیه.',
            isActive: true,
        }
    })

    const [product2] = await Product.findOrCreate({
        where: { slug: 'diamond-engagement-ring' },
        defaults: {
            title: 'انگشتر نامزدی الماس',
            slug: 'diamond-engagement-ring',
            description: `انگشتر نامزدی با الماس طبیعی
            ویژگی‌ها:
            • وزن طلا: ۳.۰۰ گرم
            • عیار: ۱۸
            • سنگ: الماس ۰.۵۰ قیراط
            • طراحی: مدرن و شیک
            • مناسب برای: هدیه نامزدی و سالگرد ازدواج
            • گارانتی: ۱۲ ماهه`,
            isActive: true,
        }
    })

    const [product3] = await Product.findOrCreate({
        where: { slug: 'gold-necklace-classic' },
        defaults: {
            title: 'گردنبند طلای کلاسیک',
            slug: 'gold-necklace-classic',
            description: 'گردنبند طلای ۱۸ عیار با طرح کلاسیک و ظریف. وزن ۵.۰۰ گرم.',
            isActive: false,
        }
    })

    const [product4] = await Product.findOrCreate({
        where: { slug: 'mens-diamond-ring' },
        defaults: {
            title: 'انگشتر الماس مردانه',
            slug: 'mens-diamond-ring',
            description: `<h3>انگشتر الماس مردانه</h3>
            <p>انگشتر با طراحی خاص و مدرن برای آقایان</p>
            <ul>
                <li><strong>وزن:</strong> ۴.۲۰ گرم</li>
                <li><strong>عیار:</strong> ۱۸</li>
                <li><strong>سنگ:</strong> الماس ۰.۳۰ قیراط</li>
                <li><strong>رنگ:</strong> طلای سفید</li>
            </ul>
            <p>مناسب برای: استفاده رسمی و مجالس</p>`,
            isActive: true,
        }
    })

    const [product5] = await Product.findOrCreate({
        where: { slug: 'gold-bracelet' },
        defaults: {
            title: 'دستبند طلای زنانه',
            slug: 'gold-bracelet',
            description: 'دستبند طلای ۱۸ عیار با طراحی ظریف و شیک. وزن ۲.۵۰ گرم.',
            isActive: true,
        }
    })

    const [product6] = await Product.findOrCreate({
        where: { slug: 'luxury-diamond-necklace' },
        defaults: {
            title: 'گردنبند الماس لوکس',
            slug: 'luxury-diamond-necklace',
            description: `گردنبند الماس با طراحی منحصربه‌فرد و سنگ‌های الماس با کیفیت بالا. 
            این گردنبند با استفاده از بهترین متریال‌ها ساخته شده و برای مناسبت‌های خاص و هدیه‌های ارزشمند طراحی شده است. 
            وزن طلا ۸.۵۰ گرم، عیار ۲۱، الماس ۱.۲۰ قیراط، دارای گارانتی ۲۴ ماهه و کارت تضمین اصالت. 
            طراحی مدرن و شیک، مناسب برای استفاده در جشن‌ها و مهمانی‌های رسمی.`,
            isActive: true,
        }
    })
    // PRODUCT-CATEGORY
    await ProductCategory.findOrCreate({
        where: {
            productId: product1.dataValues.id,
            categoryId: ringCategory.dataValues.id
        },
        defaults: {
            productId: product1.dataValues.id,
            categoryId: ringCategory.dataValues.id
        }
    })
    await ProductCategory.findOrCreate({
        where: {
            productId: product1.dataValues.id,
            categoryId: goldRingCategory.dataValues.id
        },
        defaults: {
            productId: product1.dataValues.id,
            categoryId: goldRingCategory.dataValues.id
        }
    })

    await ProductCategory.findOrCreate({
        where: {
            productId: product2.dataValues.id,
            categoryId: ringCategory.dataValues.id
        },
        defaults: {
            productId: product2.dataValues.id,
            categoryId: ringCategory.dataValues.id
        }
    })
    await ProductCategory.findOrCreate({
        where: {
            productId: product2.dataValues.id,
            categoryId: diamondRingCategory.dataValues.id
        },
        defaults: {
            productId: product2.dataValues.id,
            categoryId: diamondRingCategory.dataValues.id
        }
    })
    await ProductCategory.findOrCreate({
        where: {
            productId: product3.dataValues.id,
            categoryId: necklaceCategory.dataValues.id
        },
        defaults: {
            productId: product3.dataValues.id,
            categoryId: necklaceCategory.dataValues.id
        }
    })
    await ProductCategory.findOrCreate({
        where: {
            productId: product3.dataValues.id,
            categoryId: goldNecklaceCategory.dataValues.id
        },
        defaults: {
            productId: product3.dataValues.id,
            categoryId: goldNecklaceCategory.dataValues.id
        }
    })
    await ProductCategory.findOrCreate({
        where: {
            productId: product4.dataValues.id,
            categoryId: diamondRingCategory.dataValues.id
        },
        defaults: {
            productId: product4.dataValues.id,
            categoryId: diamondRingCategory.dataValues.id
        }
    })
    await ProductCategory.findOrCreate({
        where: {
            productId: product5.dataValues.id,
            categoryId: braceletCategory.dataValues.id
        },
        defaults: {
            productId: product5.dataValues.id,
            categoryId: braceletCategory.dataValues.id
        }
    })
    await ProductCategory.findOrCreate({
        where: {
            productId: product6.dataValues.id,
            categoryId: necklaceCategory.dataValues.id
        },
        defaults: {
            productId: product6.dataValues.id,
            categoryId: necklaceCategory.dataValues.id
        }
    })
    await ProductCategory.findOrCreate({
        where: {
            productId: product6.dataValues.id,
            categoryId: goldNecklaceCategory.dataValues.id
        },
        defaults: {
            productId: product6.dataValues.id,
            categoryId: goldNecklaceCategory.dataValues.id
        }
    })
}