-- Inserir categorias
INSERT INTO categories (name, slug, description, icon, image) VALUES
('Alimentos', 'alimentos', 'Rações e alimentos para cães e gatos', '🍖', '/images/products/food.jpg'),
('Brinquedos', 'brinquedos', 'Brinquedos e acessórios para diversão', '🎾', '/images/products/toys.jpg'),
('Acessórios', 'acessorios', 'Coleiras, coletes e acessórios', '🎀', '/images/products/accessories.jpg'),
('Higiene', 'higiene', 'Produtos de higiene e limpeza', '🧼', '/images/products/hygiene.jpg'),
('Camas', 'camas', 'Camas e almofadas confortáveis', '🛏️', '/images/products/beds.jpg');

-- Inserir produtos para cães
INSERT INTO products (categoryId, name, slug, description, longDescription, price, originalPrice, image, stock, sku, isActive, rating, reviewCount) VALUES
(1, 'Ração Premium para Cães Adultos', 'racao-premium-caes', 'Ração completa e equilibrada', 'Ração premium com ingredientes naturais, rica em proteínas e vitaminas. Ideal para cães adultos de todas as raças.', 8999, 9999, '/images/products/dog-food-1.jpg', 50, 'SKU-001', true, 450, 12),
(1, 'Ração Light para Cães', 'racao-light-caes', 'Ração com baixo teor de gordura', 'Ração especialmente formulada para cães com sobrepeso. Com menos calorias e mais fibras para manter a saúde.', 7999, 8999, '/images/products/dog-food-2.jpg', 35, 'SKU-002', true, 420, 8),
(2, 'Bola de Borracha para Cães', 'bola-borracha-caes', 'Brinquedo resistente e divertido', 'Bola de borracha resistente, perfeita para jogos de busca. Segura e durável para cães de todas as idades.', 2999, null, '/images/products/dog-toy-1.jpg', 100, 'SKU-003', true, 480, 25),
(2, 'Corda de Brinquedo para Cães', 'corda-brinquedo-caes', 'Brinquedo de corda para puxar', 'Corda de algodão resistente, ótima para brincadeiras e limpeza dos dentes. Segura para cães de pequeno e médio porte.', 1999, null, '/images/products/dog-toy-2.jpg', 75, 'SKU-004', true, 440, 15),
(3, 'Coleira Ajustável para Cães', 'coleira-ajustavel-caes', 'Coleira confortável e segura', 'Coleira de nylon ajustável com fivela de segurança. Disponível em várias cores e tamanhos para cães pequenos e médios.', 3999, 4999, '/images/products/dog-collar.jpg', 60, 'SKU-005', true, 460, 18),
(3, 'Guia de Passeio Premium', 'guia-passeio-premium', 'Guia resistente e confortável', 'Guia de passeio feita em material resistente com alça ergonômica. Ideal para passeios seguros e confortáveis.', 4999, 5999, '/images/products/dog-leash.jpg', 45, 'SKU-006', true, 470, 20),
(4, 'Shampoo para Cães', 'shampoo-caes', 'Shampoo neutro e seguro', 'Shampoo neutro especialmente formulado para cães. Limpa profundamente sem irritar a pele e deixa o pelo macio.', 2499, null, '/images/products/dog-shampoo.jpg', 80, 'SKU-007', true, 430, 10),
(5, 'Cama Confortável para Cães', 'cama-confortavel-caes', 'Cama acolchoada e macia', 'Cama acolchoada com espuma de alta densidade. Oferece conforto e suporte para o descanso do seu cão.', 14999, 17999, '/images/products/dog-bed.jpg', 25, 'SKU-008', true, 490, 22);

-- Inserir produtos para gatos
INSERT INTO products (categoryId, name, slug, description, longDescription, price, originalPrice, image, stock, sku, isActive, rating, reviewCount) VALUES
(1, 'Ração Premium para Gatos Adultos', 'racao-premium-gatos', 'Ração completa para gatos', 'Ração premium com ingredientes selecionados. Formulada para atender às necessidades nutricionais dos gatos adultos.', 7999, 8999, '/images/products/cat-food-1.jpg', 55, 'SKU-009', true, 460, 14),
(1, 'Ração Úmida para Gatos', 'racao-umida-gatos', 'Alimento úmido em lata', 'Ração úmida em lata com sabor irresistível. Ideal para gatos que preferem alimentos mais úmidos e saborosos.', 3999, null, '/images/products/cat-food-2.jpg', 70, 'SKU-010', true, 450, 11),
(2, 'Brinquedo de Pena para Gatos', 'brinquedo-pena-gatos', 'Brinquedo interativo com penas', 'Brinquedo com penas naturais que estimula o instinto de caça. Perfeito para manter seu gato ativo e saudável.', 1999, null, '/images/products/cat-toy-1.jpg', 90, 'SKU-011', true, 470, 16),
(2, 'Bola de Espuma para Gatos', 'bola-espuma-gatos', 'Brinquedo leve e seguro', 'Bola de espuma leve e segura. Ideal para gatos pequenos e filhotes. Estimula o exercício e a diversão.', 1499, null, '/images/products/cat-toy-2.jpg', 85, 'SKU-012', true, 440, 9),
(3, 'Coleira com Guizo para Gatos', 'coleira-guizo-gatos', 'Coleira segura com guizo', 'Coleira ajustável com guizo e fivela de segurança. Permite que você localize seu gato facilmente.', 2499, 2999, '/images/products/cat-collar.jpg', 65, 'SKU-013', true, 450, 12),
(4, 'Shampoo para Gatos', 'shampoo-gatos', 'Shampoo suave para gatos', 'Shampoo suave e neutro especialmente formulado para gatos. Limpa sem irritar a pele sensível.', 2999, null, '/images/products/cat-shampoo.jpg', 60, 'SKU-014', true, 460, 8),
(5, 'Cama Macia para Gatos', 'cama-macia-gatos', 'Cama aconchegante para gatos', 'Cama aconchegante e macia. Oferece o conforto perfeito para o descanso e sono do seu gato.', 9999, 11999, '/images/products/cat-bed.jpg', 40, 'SKU-015', true, 480, 19);

