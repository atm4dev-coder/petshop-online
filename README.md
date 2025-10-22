# PetShop Online 🐕🐈

Uma loja online completa e moderna para produtos de cães e gatos, desenvolvida com as tecnologias mais atuais.

## ✨ Características

- **Catálogo Completo** - Mais de 15 produtos para cães e gatos
- **Carrinho de Compras** - Adicione, remova e atualize quantidades facilmente
- **Checkout Seguro** - Processo de compra intuitivo e seguro
- **Múltiplos Métodos de Pagamento** - PIX, Cartão de Crédito e Boleto
- **Autenticação Segura** - Login com Manus OAuth
- **Design Responsivo** - Funciona perfeitamente em desktop, tablet e mobile
- **Avaliações de Produtos** - Usuários podem avaliar e comentar produtos
- **Sistema de Categorias** - Navegação fácil por categorias de produtos

## 🚀 Tecnologias Utilizadas

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| React | 19.0+ | Interface do usuário |
| Tailwind CSS | 4.0+ | Estilização |
| Express | 4.0+ | Servidor backend |
| tRPC | 11.0+ | API type-safe |
| Drizzle ORM | 0.30+ | Gerenciamento de banco de dados |
| MySQL | 8.0+ | Banco de dados |
| TypeScript | 5.0+ | Tipagem estática |

## 📋 Requisitos

- Node.js 18 ou superior
- npm ou pnpm como gerenciador de pacotes
- Acesso a um banco de dados MySQL/TiDB
- Variáveis de ambiente configuradas

## 🔧 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/petshop-online.git
cd petshop-online
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL=mysql://usuario:senha@localhost:3306/petshop_online
JWT_SECRET=seu-secret-aleatorio-aqui
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_TITLE=PetShop Online
VITE_APP_LOGO=/logo.svg
```

### 4. Executar migrações do banco de dados

```bash
pnpm db:push
```

### 5. Iniciar o servidor de desenvolvimento

```bash
pnpm dev
```

O site estará disponível em `http://localhost:3000`

## 📖 Uso

### Página Inicial

A página inicial exibe todos os produtos disponíveis com:
- Imagem do produto
- Nome e descrição
- Preço e preço original (com desconto)
- Avaliação (estrelas)
- Quantidade em estoque
- Botão para adicionar ao carrinho

### Filtrar por Categoria

Use os botões de categoria no topo da página para filtrar produtos por tipo:
- Alimentos
- Brinquedos
- Acessórios
- Higiene
- Camas

### Carrinho de Compras

1. Clique em "Adicionar ao Carrinho" em qualquer produto
2. Acesse o carrinho clicando no ícone de carrinho no header
3. Atualize quantidades ou remova itens conforme necessário
4. Clique em "Ir para Checkout" para prosseguir

### Processo de Checkout

1. **Endereço de Entrega** - Preencha seu endereço completo
2. **Endereço de Cobrança** - Opcionalmente diferente do de entrega
3. **Forma de Pagamento** - Escolha entre PIX, Cartão ou Boleto
4. **Observações** - Adicione notas para o vendedor (opcional)
5. **Confirmar Pedido** - Revise o resumo e confirme

### Pagamento

Dependendo do método escolhido:

**PIX:**
- Escaneie o código QR com seu banco
- Confirme o valor
- Finalize a transação

**Cartão de Crédito:**
- Preencha os dados do cartão
- Escolha o número de parcelas
- Confirme o pagamento

**Boleto:**
- Copie o código de barras
- Pague em qualquer banco ou lotérica
- Prazo de 3 dias úteis

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
petshop-online/
├── client/              # Frontend (React)
│   ├── src/
│   │   ├── pages/      # Páginas da aplicação
│   │   ├── components/ # Componentes reutilizáveis
│   │   └── lib/        # Utilitários
│   └── public/         # Arquivos estáticos
├── server/             # Backend (Express + tRPC)
│   ├── routers.ts      # Definição de APIs
│   └── db.ts           # Funções de banco de dados
├── drizzle/            # Schema e migrações
└── scripts/            # Scripts utilitários
```

### Adicionar um Novo Produto

```sql
INSERT INTO products (
  categoryId, name, slug, description, longDescription,
  price, originalPrice, image, stock, sku, isActive
) VALUES (
  1, 'Nome do Produto', 'slug-produto', 'Descrição',
  'Descrição longa', 1999, 2499, '/images/products/produto.jpg',
  50, 'SKU-001', true
);
```

### Executar Testes

```bash
pnpm test
```

### Build para Produção

```bash
pnpm build
pnpm start
```

## 📚 Documentação

- **[MAINTENANCE.md](./MAINTENANCE.md)** - Guia de manutenção e operações
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guia para desenvolvedores

## 🔐 Segurança

- Todas as transações são criptografadas
- Dados de cartão são tokenizados e nunca armazenados
- Autenticação segura com OAuth
- Validação de entrada em todos os endpoints
- Proteção contra CSRF e XSS

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários registrados |
| `categories` | Categorias de produtos |
| `products` | Catálogo de produtos |
| `cartItems` | Itens no carrinho |
| `orders` | Pedidos realizados |
| `orderItems` | Itens de cada pedido |
| `payments` | Registros de pagamento |
| `reviews` | Avaliações de produtos |

## 🐛 Troubleshooting

### Produtos não aparecem

1. Verifique se as categorias foram criadas
2. Verifique se os produtos estão ativos
3. Limpe o cache do navegador

### Erro ao fazer checkout

1. Verifique se está autenticado
2. Verifique se há itens no carrinho
3. Verifique os logs do servidor

### Problema com pagamento

1. Verifique as credenciais do gateway
2. Verifique a conexão com a internet
3. Tente novamente em alguns minutos

Para mais informações, consulte [MAINTENANCE.md](./MAINTENANCE.md#troubleshooting)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato:

- **Email:** suporte@petshop-online.com
- **Website:** https://petshop-online.com
- **Issues:** https://github.com/seu-usuario/petshop-online/issues

## 🙏 Agradecimentos

- [React](https://react.dev) - Biblioteca UI
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [tRPC](https://trpc.io) - RPC type-safe
- [Drizzle ORM](https://orm.drizzle.team) - ORM para TypeScript
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI

## 📈 Roadmap

- [ ] Sistema de recomendações personalizadas
- [ ] Wishlist de produtos
- [ ] Cupons e promoções
- [ ] Dashboard administrativo
- [ ] Rastreamento de pedidos em tempo real
- [ ] Integração com redes sociais
- [ ] App mobile nativo

---

**Desenvolvido com ❤️ por Manus AI**

Última atualização: 21 de outubro de 2024

