import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getCategories,
  getProductsByCategory,
  getProductBySlug,
  getProductById,
  getAllProducts,
  getProductReviews,
  createReview,
  getCartItems,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  createOrder,
  getOrdersByUser,
  getOrderById,
  createOrderItem,
  getOrderItems,
  createPayment,
  getPaymentByOrderId,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== PRODUCTS & CATEGORIES =====
  products: router({
    getAll: publicProcedure.query(async () => {
      const products = await getAllProducts();
      return products.map(p => ({
        ...p,
        price: p.price / 100, // Converter centavos para reais
        originalPrice: p.originalPrice ? p.originalPrice / 100 : null,
        rating: p.rating ? p.rating / 100 : 0,
      }));
    }),

    getByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        const products = await getProductsByCategory(input.categoryId);
        return products.map(p => ({
          ...p,
          price: p.price / 100,
          originalPrice: p.originalPrice ? p.originalPrice / 100 : null,
          rating: p.rating ? p.rating / 100 : 0,
        }));
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const product = await getProductBySlug(input.slug);
        if (!product) return null;
        return {
          ...product,
          price: product.price / 100,
          originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
          rating: product.rating ? product.rating / 100 : 0,
        };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) return null;
        return {
          ...product,
          price: product.price / 100,
          originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
          rating: product.rating ? product.rating / 100 : 0,
        };
      }),
  }),

  categories: router({
    getAll: publicProcedure.query(async () => {
      return getCategories();
    }),
  }),

  reviews: router({
    getByProduct: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return getProductReviews(input.productId);
      }),

    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createReview({
          productId: input.productId,
          userId: ctx.user.id,
          rating: input.rating,
          title: input.title,
          comment: input.comment,
          isVerified: false,
        });
      }),
  }),

  // ===== CART =====
  cart: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      const items = await getCartItems(ctx.user.id);
      // Enriquecer com dados do produto
      const enriched = await Promise.all(
        items.map(async (item) => {
          const product = await getProductById(item.productId);
          return {
            ...item,
            product: product ? {
              ...product,
              price: product.price / 100,
              originalPrice: product.originalPrice ? product.originalPrice / 100 : null,
            } : null,
          };
        })
      );
      return enriched;
    }),

    addItem: protectedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().min(1) }))
      .mutation(async ({ input, ctx }) => {
        return addToCart(ctx.user.id, input.productId, input.quantity);
      }),

    removeItem: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input }) => {
        return removeFromCart(input.cartItemId);
      }),

    updateQuantity: protectedProcedure
      .input(z.object({ cartItemId: z.number(), quantity: z.number().min(1) }))
      .mutation(async ({ input }) => {
        return updateCartItemQuantity(input.cartItemId, input.quantity);
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      return clearCart(ctx.user.id);
    }),
  }),

  // ===== ORDERS =====
  orders: router({
    create: protectedProcedure
      .input(z.object({
        paymentMethod: z.enum(["credit_card", "pix", "boleto"]),
        shippingAddress: z.string(),
        billingAddress: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Gerar número de pedido único
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Obter itens do carrinho
        const cartItems = await getCartItems(ctx.user.id);
        if (cartItems.length === 0) {
          throw new Error("Carrinho vazio");
        }

        // Calcular totais
        let subtotal = 0;
        const items = [];
        
        for (const cartItem of cartItems) {
          const product = await getProductById(cartItem.productId);
          if (!product) continue;
          
          const itemTotal = product.price * cartItem.quantity;
          subtotal += itemTotal;
          
          items.push({
            productId: cartItem.productId,
            productName: product.name,
            quantity: cartItem.quantity,
            price: product.price,
          });
        }

        const shippingCost = 1500; // R$ 15,00 fixo
        const total = subtotal + shippingCost;

        // Criar pedido
        const orderResult = await createOrder({
          orderNumber,
          userId: ctx.user.id,
          paymentMethod: input.paymentMethod as any,
          status: "pending",
          paymentStatus: "pending",
          subtotal,
          shippingCost,
          discount: 0,
          total,
          shippingAddress: input.shippingAddress,
          billingAddress: input.billingAddress,
          notes: input.notes,
        });

        // Criar itens do pedido
        const orderId = (orderResult as any).insertId || 0;
        for (const item of items) {
          await createOrderItem({
            orderId,
            ...item,
          });
        }

        // Limpar carrinho
        await clearCart(ctx.user.id);

        // Criar pagamento pendente
        await createPayment({
          orderId,
          method: input.paymentMethod as any,
          amount: total,
          status: "pending",
        });

        return {
          orderId,
          orderNumber,
          total: total / 100,
          paymentMethod: input.paymentMethod,
        };
      }),

    getByUser: protectedProcedure.query(async ({ ctx }) => {
      const orders = await getOrdersByUser(ctx.user.id);
      return orders.map(o => ({
        ...o,
        subtotal: o.subtotal / 100,
        shippingCost: o.shippingCost / 100,
        discount: (o.discount || 0) / 100,
        total: o.total / 100,
      }));
    }),

    getById: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await getOrderById(input.orderId);
        if (!order || order.userId !== ctx.user.id) {
          throw new Error("Pedido não encontrado");
        }

        const items = await getOrderItems(input.orderId);
        const payment = await getPaymentByOrderId(input.orderId);

        return {
          ...order,
          subtotal: order.subtotal / 100,
          shippingCost: order.shippingCost / 100,
          discount: (order.discount || 0) / 100,
          total: order.total / 100,
          items,
          payment,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

