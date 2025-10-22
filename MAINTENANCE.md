# Documentação de Manutenção - PetShop Online

## Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Configuração Inicial](#configuração-inicial)
4. [Operações Comuns](#operações-comuns)
5. [Gerenciamento de Produtos](#gerenciamento-de-produtos)
6. [Gerenciamento de Pedidos](#gerenciamento-de-pedidos)
7. [Integração de Pagamentos](#integração-de-pagamentos)
8. [Backup e Recuperação](#backup-e-recuperação)
9. [Troubleshooting](#troubleshooting)
10. [Suporte e Contato](#suporte-e-contato)

---

## Visão Geral

O **PetShop Online** é um site de e-commerce completo desenvolvido com as seguintes tecnologias:

| Componente | Tecnologia | Versão |
|-----------|-----------|--------|
| Frontend | React 19 + Tailwind CSS 4 | 19.0+ |
| Backend | Express 4 + tRPC 11 | 4.0+ |
| Banco de Dados | MySQL/TiDB | 8.0+ |
| ORM | Drizzle ORM | 0.30+ |
| Autenticação | Manus OAuth | - |

O projeto está hospedado em um servidor de desenvolvimento que pode ser acessado através da URL fornecida no painel de controle.

---

## Estrutura do Projeto

```
petshop_online/
├── client/                    # Frontend (React)
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── Home.tsx      # Página inicial com catálogo
│   │   │   ├── Cart.tsx      # Carrinho de compras
│   │   │   ├── Checkout.tsx  # Processo de checkout
│   │   │   └── Payment.tsx   # Processamento de pagamento
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── lib/              # Utilitários e configurações
│   │   └── App.tsx           # Roteamento principal
│   └── public/               # Arquivos estáticos
│       └── images/products/  # Imagens de produtos
├── server/                    # Backend (Express + tRPC)
│   ├── routers.ts            # Definição de procedimentos tRPC
│   ├── db.ts                 # Funções de banco de dados
│   └── _core/                # Configurações internas
├── drizzle/                   # Schema e migrações
│   ├── schema.ts             # Definição de tabelas
│   └── migrations/           # Histórico de migrações
├── scripts/                   # Scripts utilitários
│   └── seed-data.sql         # Dados de teste
└── package.json              # Dependências do projeto
```

---

## Configuração Inicial

### Requisitos do Sistema

- Node.js 18+ ou superior
- npm ou pnpm como gerenciador de pacotes
- Acesso ao banco de dados MySQL/TiDB
- Variáveis de ambiente configuradas

### Variáveis de Ambiente

As seguintes variáveis de ambiente devem ser configuradas no painel de controle:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão do banco de dados | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Chave para assinatura de sessões | `seu-secret-aleatorio-aqui` |
| `VITE_APP_ID` | ID da aplicação OAuth | `app-id-fornecido` |
| `OAUTH_SERVER_URL` | URL do servidor OAuth | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login | `https://login.manus.im` |
| `VITE_APP_TITLE` | Título da aplicação | `PetShop Online` |
| `VITE_APP_LOGO` | URL do logo | `/logo.svg` |

### Inicializar o Projeto

```bash
# Instalar dependências
pnpm install

# Executar migrações do banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

O site estará disponível em `http://localhost:3000`.

---

## Operações Comuns

### Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

O servidor iniciará com hot-reload automático. Qualquer mudança nos arquivos será refletida imediatamente no navegador.

### Compilar para Produção

```bash
pnpm build
```

Isso criará uma versão otimizada pronta para deploy.

### Executar Testes

```bash
pnpm test
```

Execute testes unitários e de integração para validar funcionalidades.

### Verificar Tipos TypeScript

```bash
pnpm type-check
```

Valida todos os tipos TypeScript do projeto sem compilar.

---

## Gerenciamento de Produtos

### Adicionar um Novo Produto

Para adicionar um novo produto ao catálogo, você precisa:

1. **Preparar a imagem do produto** em formato JPG ou PNG
2. **Fazer upload da imagem** para `/client/public/images/products/`
3. **Inserir os dados do produto** no banco de dados

#### Via SQL Direto

```sql
INSERT INTO products (
  categoryId, name, slug, description, longDescription, 
  price, originalPrice, image, stock, sku, isActive, rating, reviewCount
) VALUES (
  1, 'Nome do Produto', 'slug-do-produto', 'Descrição curta',
  'Descrição longa detalhada do produto',
  1999, 2499, '/images/products/produto.jpg', 50, 'SKU-001', 
  true, 450, 10
);
```

**Notas importantes:**
- `price` e `originalPrice` devem estar em **centavos** (ex: 1999 = R$ 19,99)
- `rating` é armazenado em centésimos (ex: 450 = 4.5 estrelas)
- `slug` deve ser único e sem espaços
- `stock` é a quantidade disponível em estoque

### Atualizar Informações de Produto

```sql
UPDATE products 
SET name = 'Novo Nome', price = 2499, stock = 75
WHERE id = 1;
```

### Desativar um Produto

```sql
UPDATE products 
SET isActive = false 
WHERE id = 1;
```

Produtos desativados não aparecem na loja, mas os pedidos anteriores continuam visíveis.

### Gerenciar Categorias

```sql
-- Adicionar nova categoria
INSERT INTO categories (name, slug, description, icon, image) 
VALUES ('Roupas', 'roupas', 'Roupas para cães e gatos', '👕', '/images/categories/clothes.jpg');

-- Atualizar categoria
UPDATE categories 
SET description = 'Nova descrição' 
WHERE id = 1;

-- Listar todas as categorias
SELECT * FROM categories;
```

---

## Gerenciamento de Pedidos

### Visualizar Pedidos Recentes

```sql
SELECT o.*, u.name, u.email 
FROM orders o 
JOIN users u ON o.userId = u.id 
ORDER BY o.createdAt DESC 
LIMIT 20;
```

### Atualizar Status de Pedido

```sql
UPDATE orders 
SET status = 'shipped', updatedAt = NOW() 
WHERE id = 123;
```

**Status disponíveis:**
- `pending` - Aguardando pagamento
- `paid` - Pagamento confirmado
- `processing` - Em processamento
- `shipped` - Enviado
- `delivered` - Entregue
- `cancelled` - Cancelado

### Visualizar Itens de um Pedido

```sql
SELECT oi.*, p.name 
FROM orderItems oi 
JOIN products p ON oi.productId = p.id 
WHERE oi.orderId = 123;
```

### Processar Reembolso

```sql
UPDATE orders 
SET status = 'cancelled' 
WHERE id = 123;

UPDATE payments 
SET status = 'refunded' 
WHERE orderId = 123;
```

---

## Integração de Pagamentos

### Configurar Gateway de Pagamento

O site suporta três métodos de pagamento:

#### 1. PIX
- Integração com banco de dados de chaves PIX
- Geração de QR codes dinâmicos
- Confirmação automática de pagamento

**Configuração necessária:**
```env
PIX_KEY=sua-chave-pix-aqui
PIX_MERCHANT_ID=seu-id-comerciante
```

#### 2. Cartão de Crédito
- Integração com processadora de pagamentos
- Suporte a parcelamento em até 12x
- Tokenização segura de dados

**Configuração necessária:**
```env
STRIPE_API_KEY=sk_live_sua_chave_aqui
STRIPE_WEBHOOK_SECRET=whsec_sua_secret_aqui
```

#### 3. Boleto Bancário
- Geração automática de boletos
- Integração com sistema de cobrança
- Confirmação de pagamento automática

**Configuração necessária:**
```env
BOLETO_API_KEY=sua_chave_api_aqui
BOLETO_CNPJ=seu_cnpj_aqui
```

### Testar Pagamentos em Desenvolvimento

Para testar pagamentos sem processar transações reais:

```bash
# Usar modo de teste
export NODE_ENV=development
export STRIPE_TEST_MODE=true
```

Use os seguintes dados de teste:
- **Cartão:** `4242 4242 4242 4242` (qualquer data futura e CVV)
- **PIX:** Qualquer chave PIX válida (será simulada)
- **Boleto:** Será gerado automaticamente

---

## Backup e Recuperação

### Fazer Backup do Banco de Dados

```bash
# Backup completo
mysqldump -u usuario -p nome_banco > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas de produtos
mysqldump -u usuario -p nome_banco products categories > backup_produtos.sql
```

### Restaurar de um Backup

```bash
# Restaurar banco completo
mysql -u usuario -p nome_banco < backup_20240101_120000.sql

# Restaurar apenas tabelas específicas
mysql -u usuario -p nome_banco < backup_produtos.sql
```

### Backup de Imagens

```bash
# Fazer backup das imagens de produtos
tar -czf backup_images_$(date +%Y%m%d).tar.gz client/public/images/

# Restaurar imagens
tar -xzf backup_images_20240101.tar.gz
```

### Agendamento Automático de Backups

Crie um script `backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/petshop"
DATE=$(date +%Y%m%d_%H%M%S)
DB_USER="seu_usuario"
DB_NAME="petshop_online"

mkdir -p $BACKUP_DIR

# Backup do banco de dados
mysqldump -u $DB_USER -p $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Backup das imagens
tar -czf $BACKUP_DIR/images_$DATE.tar.gz client/public/images/

# Manter apenas últimos 30 dias
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup realizado com sucesso em $BACKUP_DIR"
```

Agende com cron para executar diariamente:

```bash
# Editar crontab
crontab -e

# Adicionar linha para executar diariamente às 2 AM
0 2 * * * /home/ubuntu/petshop_online/backup.sh
```

---

## Troubleshooting

### Problema: Produtos não aparecem na página inicial

**Solução:**
1. Verifique se as categorias foram criadas: `SELECT * FROM categories;`
2. Verifique se os produtos estão ativos: `SELECT * FROM products WHERE isActive = true;`
3. Verifique os logs do servidor: `pnpm dev` e procure por erros
4. Limpe o cache do navegador (Ctrl+Shift+Delete)

### Problema: Erro ao adicionar produtos ao carrinho

**Solução:**
1. Verifique se o usuário está autenticado
2. Verifique se o produto existe: `SELECT * FROM products WHERE id = X;`
3. Verifique se há estoque: `SELECT stock FROM products WHERE id = X;`
4. Verifique os logs do servidor para mensagens de erro

### Problema: Pagamento não é processado

**Solução:**
1. Verifique as credenciais do gateway de pagamento
2. Verifique se a tabela `payments` tem registros: `SELECT * FROM payments ORDER BY createdAt DESC;`
3. Verifique se o pedido foi criado: `SELECT * FROM orders ORDER BY createdAt DESC;`
4. Verifique os logs do servidor para erros de integração

### Problema: Banco de dados não conecta

**Solução:**
1. Verifique a variável `DATABASE_URL`: `echo $DATABASE_URL`
2. Teste a conexão: `mysql -u usuario -p -h host -D banco`
3. Verifique se o serviço MySQL está rodando
4. Verifique as credenciais de acesso

### Problema: Imagens de produtos não carregam

**Solução:**
1. Verifique se a imagem existe: `ls -la client/public/images/products/`
2. Verifique o caminho no banco de dados: `SELECT image FROM products WHERE id = X;`
3. Verifique se o servidor está servindo arquivos estáticos corretamente
4. Limpe o cache do navegador

---

## Suporte e Contato

Para suporte técnico ou dúvidas sobre manutenção:

- **Email:** suporte@petshop-online.com
- **Documentação:** https://docs.petshop-online.com
- **Issues:** https://github.com/seu-usuario/petshop-online/issues

### Recursos Úteis

- [Documentação do React](https://react.dev)
- [Documentação do Drizzle ORM](https://orm.drizzle.team)
- [Documentação do tRPC](https://trpc.io)
- [Documentação do Tailwind CSS](https://tailwindcss.com)

---

## Changelog

### Versão 1.0.0 (2024-10-21)
- ✅ Lançamento inicial
- ✅ Catálogo de produtos completo
- ✅ Sistema de carrinho de compras
- ✅ Integração de pagamentos (PIX, Cartão, Boleto)
- ✅ Autenticação com Manus OAuth
- ✅ Design responsivo para mobile

---

**Última atualização:** 21 de outubro de 2024  
**Versão da documentação:** 1.0.0  
**Autor:** Manus AI

