/**
 * Barrel `schema` — réexporte tous les schémas Drizzle + types associés.
 *
 * Source unique pour le client DB (cf. `client.ts`) et pour les consumers
 * (apps/api, packages/shared).
 *
 * Convention d'import :
 *   import * as schema from '@ecommerce/db/schema'
 *   import { products, type Product } from '@ecommerce/db/schema'
 */

// ─── Enums ───────────────────────────────────────────────────────────────────
export {
  userRole,
  productStatus,
  orderStatus,
  paymentProvider,
  paymentStatus,
  type UserRole,
  type ProductStatus,
  type OrderStatus,
  type PaymentProvider,
  type PaymentStatus,
} from './enums.js'

// ─── Tables ──────────────────────────────────────────────────────────────────
export { users, type User, type NewUser } from './users.js'
export { addresses, addressKind, type Address, type NewAddress, type AddressKind } from './addresses.js'
export { categories, type Category, type NewCategory } from './categories.js'
export {
  products,
  type Product,
  type NewProduct,
  type ProductMetadata,
} from './products.js'
export {
  variants,
  type Variant,
  type NewVariant,
  type VariantMetadata,
} from './variants.js'
export {
  productImages,
  type ProductImage,
  type NewProductImage,
} from './product_images.js'
export { stockItems, type StockItem, type NewStockItem } from './stock_items.js'
export { carts, type Cart, type NewCart } from './carts.js'
export { cartItems, type CartItem, type NewCartItem } from './cart_items.js'
export {
  orders,
  type Order,
  type NewOrder,
  type ShippingAddressSnapshot,
} from './orders.js'
export {
  orderItems,
  type OrderItem,
  type NewOrderItem,
} from './order_items.js'
export {
  payments,
  type Payment,
  type NewPayment,
  type PaymentRawPayload,
} from './payments.js'
export { reviews, type Review, type NewReview } from './reviews.js'