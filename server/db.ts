import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  reviews,
  payments,
  InsertReview,
  InsertPayment,
  InsertOrder,
  InsertOrderItem,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== PRODUCT QUERIES =====

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(
    eq(products.categoryId, categoryId)
  );
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(
    eq(products.slug, slug)
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(
    eq(products.id, id)
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products);
}

// ===== CART QUERIES =====

export async function getCartItems(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cartItems).where(
    eq(cartItems.userId, userId)
  );
}

export async function addToCart(userId: string, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db.select().from(cartItems).where(
    and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))
  ).limit(1);

  if (existing.length > 0) {
    // Update quantity
    await db.update(cartItems).set({
      quantity: existing[0].quantity + quantity,
      updatedAt: new Date(),
    }).where(
      eq(cartItems.id, existing[0].id)
    );
    return existing[0];
  } else {
    // Insert new
    await db.insert(cartItems).values({
      userId,
      productId,
      quantity,
    });
    return { userId, productId, quantity, id: 0 };
  }
}

export async function removeFromCart(cartItemId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(cartItems).where(
    eq(cartItems.id, cartItemId)
  );
  return true;
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number) {
  const db = await getDb();
  if (!db) return false;
  await db.update(cartItems).set({
    quantity,
    updatedAt: new Date(),
  }).where(
    eq(cartItems.id, cartItemId)
  );
  return true;
}

export async function clearCart(userId: string) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(cartItems).where(
    eq(cartItems.userId, userId)
  );
  return true;
}

// ===== ORDER QUERIES =====

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(orders).values(order);
  return result;
}

export async function getOrdersByUser(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(
    eq(orders.userId, userId)
  );
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(
    eq(orders.id, orderId)
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(
    eq(orders.orderNumber, orderNumber)
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) return false;
  await db.update(orders).set({
    status: status as any,
    updatedAt: new Date(),
  }).where(
    eq(orders.id, orderId)
  );
  return true;
}

// ===== ORDER ITEMS QUERIES =====

export async function createOrderItem(item: InsertOrderItem) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(orderItems).values(item);
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(
    eq(orderItems.orderId, orderId)
  );
}

// ===== REVIEW QUERIES =====

export async function getProductReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(
    eq(reviews.productId, productId)
  );
}

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(reviews).values(review);
}

// ===== PAYMENT QUERIES =====

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(payments).values(payment);
}

export async function getPaymentByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(
    eq(payments.orderId, orderId)
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentStatus(paymentId: number, status: string) {
  const db = await getDb();
  if (!db) return false;
  await db.update(payments).set({
    status: status as any,
    updatedAt: new Date(),
  }).where(
    eq(payments.id, paymentId)
  );
  return true;
}

