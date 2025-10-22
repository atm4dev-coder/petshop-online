# Guia de Desenvolvimento - PetShop Online

## Visão Geral

Este documento fornece orientações para desenvolvedores que desejam adicionar novas funcionalidades ou melhorar o PetShop Online.

---

## Arquitetura da Aplicação

### Frontend (React + Tailwind CSS)

O frontend é construído com React 19 e utiliza componentes do shadcn/ui para uma interface consistente.

**Estrutura de diretórios:**

```
client/src/
├── pages/           # Componentes de página (Home, Cart, Checkout, Payment)
├── components/      # Componentes reutilizáveis
├── lib/             # Utilitários e configurações
├── contexts/        # React Contexts para estado global
├── hooks/           # Custom hooks
├── App.tsx          # Roteamento principal
└── main.tsx         # Ponto de entrada
```

### Backend (Express + tRPC)

O backend utiliza tRPC para criar uma API type-safe com Express.

**Estrutura de procedimentos:**

```typescript
// server/routers.ts
export const appRouter = router({
  products: router({
    getAll: publicProcedure.query(...),
    getBySlug: publicProcedure.input(...).query(...),
  }),
  cart: router({
    getItems: protectedProcedure.query(...),
    addItem: protectedProcedure.input(...).mutation(...),
  }),
  orders: router({
    create: protectedProcedure.input(...).mutation(...),
  }),
});
```

### Banco de Dados (Drizzle ORM)

O banco de dados é gerenciado com Drizzle ORM, que fornece type-safety para queries.

**Tabelas principais:**
- `users` - Usuários autenticados
- `categories` - Categorias de produtos
- `products` - Produtos do catálogo
- `cartItems` - Itens no carrinho
- `orders` - Pedidos realizados
- `orderItems` - Itens de cada pedido
- `payments` - Registros de pagamento
- `reviews` - Avaliações de produtos

---

## Adicionando Novas Funcionalidades

### 1. Adicionar um Novo Endpoint tRPC

**Passo 1:** Criar a função de banco de dados em `server/db.ts`

```typescript
export async function getProductsByPriceRange(minPrice: number, maxPrice: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(products).where(
    and(
      gte(products.price, minPrice),
      lte(products.price, maxPrice)
    )
  );
}
```

**Passo 2:** Adicionar o procedimento em `server/routers.ts`

```typescript
products: router({
  // ... procedimentos existentes
  
  getByPriceRange: publicProcedure
    .input(z.object({ 
      minPrice: z.number(), 
      maxPrice: z.number() 
    }))
    .query(async ({ input }) => {
      const products = await getProductsByPriceRange(
        input.minPrice * 100, // converter para centavos
        input.maxPrice * 100
      );
      return products.map(p => ({
        ...p,
        price: p.price / 100,
      }));
    }),
}),
```

**Passo 3:** Usar no frontend

```typescript
const { data: products } = trpc.products.getByPriceRange.useQuery({
  minPrice: 10,
  maxPrice: 100,
});
```

### 2. Adicionar uma Nova Página

**Passo 1:** Criar o componente em `client/src/pages/NovaPage.tsx`

```typescript
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function NovaPage() {
  const { data, isLoading } = trpc.sua.rota.useQuery();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Título da Página</h1>
      {/* Conteúdo aqui */}
    </div>
  );
}
```

**Passo 2:** Registrar a rota em `client/src/App.tsx`

```typescript
import NovaPage from "@/pages/NovaPage";

function Router() {
  return (
    <Switch>
      {/* ... rotas existentes */}
      <Route path="/nova-pagina" component={NovaPage} />
    </Switch>
  );
}
```

### 3. Adicionar uma Nova Tabela ao Banco de Dados

**Passo 1:** Definir a tabela em `drizzle/schema.ts`

```typescript
export const wishlists = mysqlTable("wishlists", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull(),
  productId: int("productId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userIdx: index("userIdx").on(table.userId),
}));

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;
```

**Passo 2:** Executar migração

```bash
pnpm db:push
```

**Passo 3:** Adicionar funções em `server/db.ts`

```typescript
export async function addToWishlist(userId: string, productId: number) {
  const db = await getDb();
  if (!db) return null;
  
  return db.insert(wishlists).values({ userId, productId });
}

export async function getWishlist(userId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(wishlists).where(eq(wishlists.userId, userId));
}
```

---

## Melhorias Recomendadas

### 1. Sistema de Avaliações Completo

Atualmente, as avaliações são armazenadas mas não têm interface completa. Implemente:

- Formulário de avaliação após compra
- Exibição de avaliações na página do produto
- Filtro por rating
- Resposta do vendedor a avaliações

### 2. Sistema de Wishlist

Adicione funcionalidade para usuários salvarem produtos favoritos:

- Botão "Adicionar à Lista de Desejos"
- Página de lista de desejos
- Compartilhamento de lista com outros usuários

### 3. Busca e Filtros Avançados

Melhore a descoberta de produtos:

- Busca por texto em nome e descrição
- Filtros por preço, categoria, rating
- Ordenação por relevância, preço, popularidade

### 4. Recomendações Personalizadas

Implemente sistema de recomendações:

- Produtos visualizados recentemente
- Produtos frequentemente comprados juntos
- Recomendações baseadas em histórico

### 5. Cupons e Promoções

Adicione sistema de descontos:

- Códigos de cupom
- Promoções automáticas por categoria
- Descontos por volume
- Frete grátis para compras acima de X

### 6. Dashboard do Vendedor

Crie painel administrativo para:

- Visualizar vendas e receita
- Gerenciar estoque
- Responder avaliações
- Gerar relatórios

### 7. Rastreamento de Pedidos

Implemente rastreamento em tempo real:

- Integração com transportadoras
- Notificações de status
- Histórico de movimentação

---

## Padrões de Código

### Nomeação de Variáveis

Use camelCase para variáveis e funções:

```typescript
// ✅ Correto
const cartItems = [];
function addToCart() {}

// ❌ Incorreto
const cart_items = [];
function add_to_cart() {}
```

### Tipos TypeScript

Sempre defina tipos explícitos:

```typescript
// ✅ Correto
interface Product {
  id: number;
  name: string;
  price: number;
}

const product: Product = { id: 1, name: "Ração", price: 99.99 };

// ❌ Incorreto
const product = { id: 1, name: "Ração", price: 99.99 };
```

### Tratamento de Erros

Use try-catch para operações assíncronas:

```typescript
// ✅ Correto
try {
  const result = await db.insert(products).values(data);
  return result;
} catch (error) {
  console.error("Erro ao inserir produto:", error);
  throw new Error("Falha ao criar produto");
}

// ❌ Incorreto
const result = await db.insert(products).values(data);
return result;
```

### Componentes React

Use componentes funcionais com hooks:

```typescript
// ✅ Correto
export default function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);

  return (
    <Card>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <button onClick={() => setLiked(!liked)}>
        {liked ? "❤️" : "🤍"}
      </button>
    </Card>
  );
}

// ❌ Incorreto
class ProductCard extends React.Component {
  // ... código de classe
}
```

---

## Testing

### Testes Unitários

```typescript
// __tests__/db.test.ts
import { getProductById } from "../server/db";

describe("getProductById", () => {
  it("deve retornar um produto pelo ID", async () => {
    const product = await getProductById(1);
    expect(product).toBeDefined();
    expect(product?.id).toBe(1);
  });

  it("deve retornar undefined para ID inválido", async () => {
    const product = await getProductById(99999);
    expect(product).toBeUndefined();
  });
});
```

### Testes de Integração

```typescript
// __tests__/api.test.ts
import { createCaller } from "../server/routers";

describe("API de Produtos", () => {
  it("deve listar todos os produtos", async () => {
    const caller = createCaller({});
    const products = await caller.products.getAll();
    expect(Array.isArray(products)).toBe(true);
  });
});
```

---

## Performance

### Otimizações Recomendadas

1. **Lazy Loading de Imagens**
   ```typescript
   <img src={product.image} alt={product.name} loading="lazy" />
   ```

2. **Paginação de Produtos**
   ```typescript
   getAll: publicProcedure
     .input(z.object({ page: z.number(), limit: z.number() }))
     .query(async ({ input }) => {
       const offset = (input.page - 1) * input.limit;
       return db.select().from(products).limit(input.limit).offset(offset);
     }),
   ```

3. **Cache de Queries**
   ```typescript
   const { data: categories } = trpc.categories.getAll.useQuery(
     undefined,
     { staleTime: 1000 * 60 * 5 } // 5 minutos
   );
   ```

4. **Compressão de Imagens**
   Use ferramentas como ImageOptim ou TinyPNG antes de upload

---

## Segurança

### Validação de Entrada

Sempre valide dados de entrada com Zod:

```typescript
createProduct: protectedProcedure
  .input(z.object({
    name: z.string().min(3).max(255),
    price: z.number().positive(),
    categoryId: z.number().positive(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Validação automática pelo Zod
    return createProduct(input);
  }),
```

### Autenticação e Autorização

Use `protectedProcedure` para rotas que requerem autenticação:

```typescript
deleteProduct: protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx }) => {
    // ctx.user está disponível aqui
    if (ctx.user.role !== "admin") {
      throw new Error("Acesso negado");
    }
    return deleteProduct(input.id);
  }),
```

### Proteção de Dados Sensíveis

Nunca exponha dados sensíveis no frontend:

```typescript
// ❌ Incorreto - expõe dados sensíveis
const user = { id: 1, email: "user@example.com", password: "hash123" };

// ✅ Correto - filtra dados sensíveis
const { password, ...safeUser } = user;
```

---

## Deploy

### Preparar para Produção

1. **Variáveis de Ambiente**
   ```bash
   NODE_ENV=production
   DATABASE_URL=mysql://prod-user:prod-pass@prod-host:3306/prod-db
   ```

2. **Build**
   ```bash
   pnpm build
   ```

3. **Iniciar Servidor**
   ```bash
   pnpm start
   ```

### Monitoramento

Configure logs e alertas:

```typescript
import { logger } from "./logger";

app.use((err, req, res, next) => {
  logger.error("Erro não tratado:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});
```

---

## Recursos Úteis

- [Documentação React](https://react.dev)
- [Documentação tRPC](https://trpc.io/docs)
- [Documentação Drizzle ORM](https://orm.drizzle.team/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Última atualização:** 21 de outubro de 2024  
**Versão:** 1.0.0  
**Autor:** Manus AI

