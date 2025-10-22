import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, decimal, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Product Categories
export const categories = mysqlTable("categories", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Products
export const products = mysqlTable("products", {
  id: int("id").primaryKey().autoincrement(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  longDescription: text("longDescription"),
  price: int("price").notNull(), // Armazenar em centavos (ex: 1999 = R$ 19,99)
  originalPrice: int("originalPrice"), // Preço original para desconto
  image: varchar("image", { length: 255 }).notNull(),
  images: text("images"), // JSON array de imagens adicionais
  stock: int("stock").notNull().default(0),
  sku: varchar("sku", { length: 100 }).unique(),
  isActive: boolean("isActive").notNull().default(true),
  rating: int("rating").default(0), // 0-5 * 100 (ex: 450 = 4.5)
  reviewCount: int("reviewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => ({
  categoryIdx: index("categoryIdx").on(table.categoryId),
  slugIdx: index("slugIdx").on(table.slug),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Shopping Cart
export const cartItems = mysqlTable("cartItems", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => ({
  userIdx: index("userIdx").on(table.userId),
  productIdx: index("productIdx").on(table.productId),
}));

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// Orders
export const orders = mysqlTable("orders", {
  id: int("id").primaryKey().autoincrement(),
  orderNumber: varchar("orderNumber", { length: 50 }).unique().notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["credit_card", "pix", "boleto"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  subtotal: int("subtotal").notNull(), // em centavos
  shippingCost: int("shippingCost").notNull().default(0),
  discount: int("discount").default(0),
  total: int("total").notNull(),
  shippingAddress: text("shippingAddress"),
  billingAddress: text("billingAddress"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => ({
  userIdx: index("userIdx").on(table.userId),
  statusIdx: index("statusIdx").on(table.status),
  orderNumberIdx: index("orderNumberIdx").on(table.orderNumber),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Order Items
export const orderItems = mysqlTable("orderItems", {
  id: int("id").primaryKey().autoincrement(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  price: int("price").notNull(), // Preço no momento da compra
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  orderIdx: index("orderIdx").on(table.orderId),
}));

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Product Reviews
export const reviews = mysqlTable("reviews", {
  id: int("id").primaryKey().autoincrement(),
  productId: int("productId").notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  rating: int("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  productIdx: index("productIdx").on(table.productId),
  userIdx: index("userIdx").on(table.userId),
}));

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// Payment Transactions
export const payments = mysqlTable("payments", {
  id: int("id").primaryKey().autoincrement(),
  orderId: int("orderId").notNull(),
  transactionId: varchar("transactionId", { length: 255 }).unique(),
  method: mysqlEnum("method", ["credit_card", "pix", "boleto"]).notNull(),
  amount: int("amount").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  paymentData: text("paymentData"), // JSON com dados do pagamento
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
}, (table) => ({
  orderIdx: index("orderIdx").on(table.orderId),
  transactionIdx: index("transactionIdx").on(table.transactionId),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
