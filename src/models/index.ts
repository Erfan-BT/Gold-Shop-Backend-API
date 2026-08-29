import { addressSeeder } from "../seeders/address.seeder.js";
import { categorySeeder, productCategorySeeder } from "../seeders/category.seeder.js";
import { inventorySeeder } from "../seeders/inventory.seeder.js";
import { productSeeder } from "../seeders/product.seeder.js";
import { productDiscountSeeder } from "../seeders/productDiscount.seeder.js";
import { productPricingSeeder } from "../seeders/productPricing.seeder.js";
import { productVariantSeeder } from "../seeders/productVariant.seeder.js";
import { reviewSeeder } from "../seeders/review.seeder.js";
import { roleSeeder, userRoleSeeder } from "../seeders/role.seeder.js";
import { userSeeder } from "../seeders/user.seeder.js";
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
    // ---------- Associations ----------
    associations()

    // ---------- Sync ----------
    // USER
    await User.sync()
    await Role.sync()
    await UserRole.sync()
    await Address.sync()
    // PRODUCT & CATEGORY
    await Product.sync()
    await Category.sync()
    await ProductCategory.sync()
    // VARIANT $ PRICE
    await ProductVariant.sync()
    await ProductImage.sync()
    await ProductPricing.sync()
    await ProductDiscount.sync()
    await GoldPrice.sync()
    await Inventory.sync()
    await Wishlist.sync()
    await Review.sync()
    // CART & ORDER
    await Coupon.sync()
    await Cart.sync()
    await CartItem.sync()
    await Order.sync()
    await OrderItem.sync()
    // PAYMENT
    await Payment.sync()
    // RETURN
    await ReturnRequest.sync()
    await ReturnItem.sync()
    // GENERAL SITE SETTING
    await Setting.sync()
    await FailedJob.sync()

    
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
        onDelete : 'RESTRICT',
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
    // ProductVariant - ProductPricing
    ProductVariant.hasMany(ProductPricing, {
        foreignKey : 'variantId',
        as : 'prices',
        onDelete : 'CASCADE',
        onUpdate : 'CASCADE'
    })
    ProductPricing.belongsTo(ProductVariant, {
        foreignKey : 'variantId',
        as : 'variants'
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
        onDelete : 'NO ACTION',
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
        onDelete : 'RESTRICT',
        onUpdate : 'CASCADE'
    })
    Order.hasOne(Payment, {
        foreignKey : 'orderId',
        as : 'payment'
    })
    // Order - ReturnRequest - User(Admin)
    ReturnRequest.belongsTo(Order, {
        foreignKey : 'orderId',
        as : 'order',
        onDelete : 'RESTRICT',
        onUpdate : 'CASCADE'
    })
    ReturnRequest.belongsTo(User, {
        foreignKey : 'reviewedBy',
        as : 'admin',
        onDelete : 'RESTRICT',
        onUpdate : 'CASCADE'
    })
    Order.hasOne(ReturnRequest, {
        foreignKey : 'orderId',
        as : 'returnRequest'
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
        onDelete : 'RESTRICT',
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
        onDelete : 'RESTRICT',
        onUpdate : 'CASCADE'
    })
    Payment.hasMany(ReturnRequest, {
        foreignKey : 'refundId',
        as : 'refunds'
    })
}

async function seedDatabase() {
    // ROLES
    await roleSeeder()
    // USERS
    await userSeeder()
    // USER-ROLE
    await userRoleSeeder()
    // ADDRESSES
    await addressSeeder()
    // CATEGORIES
    await categorySeeder()
    // PRODUCTS
    await productSeeder()
    // PRODUCT-CATEGORY
    await productCategorySeeder()
    // PRODUCT-VARIANTS
    await productVariantSeeder()
    // PRODUCT-PRICING
    await productPricingSeeder()
    // PRODUCT-DISCOUNT
    await productDiscountSeeder()
    // INVENTORY
    await inventorySeeder()
    // REVIEW
    await reviewSeeder()
}