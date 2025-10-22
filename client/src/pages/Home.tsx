import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: products, isLoading: productsLoading } = trpc.products.getAll.useQuery();
  const { data: categories } = trpc.categories.getAll.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  const filteredProducts = selectedCategory
    ? products?.filter(p => p.categoryId === selectedCategory)
    : products;

  const toggleWishlist = (productId: number) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-amber-900">{APP_TITLE}</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/cart" className="flex items-center gap-2 text-amber-900 hover:text-amber-700">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-medium">Carrinho</span>
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{user?.name}</span>
                <Link href="/account" className="text-amber-900 hover:text-amber-700 text-sm font-medium">
                  Minha Conta
                </Link>
              </div>
            ) : (
              <a href={getLoginUrl()} className="text-amber-900 hover:text-amber-700 text-sm font-medium">
                Entrar
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-400 to-orange-400 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Bem-vindo ao PetShop Online</h2>
          <p className="text-xl mb-8 text-amber-50">
            Tudo que seu cão ou gato precisa em um único lugar
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary">
              Explorar Produtos
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-semibold mb-4 text-amber-900">Categorias</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              Todos
            </Button>
            {categories?.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id)}
                className="rounded-full"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-8 text-amber-900">
            {selectedCategory ? "Produtos da Categoria" : "Nossos Produtos"}
          </h3>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <Link key={product.id} href={`/product/${product.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden bg-gray-100 h-48">
                        <img
                          src={product.image || "/images/products/placeholder.jpg"}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              wishlist.has(product.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-amber-900 mb-2 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Rating */}
                        {product.rating > 0 && (
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(product.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">
                              ({product.reviewCount})
                            </span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-2xl font-bold text-amber-900">
                            R$ {product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              R$ {product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Stock */}
                        <p className="text-xs text-gray-600 mb-4">
                          {product.stock > 0 ? (
                            <span className="text-green-600 font-medium">Em estoque</span>
                          ) : (
                            <span className="text-red-600 font-medium">Fora de estoque</span>
                          )}
                        </p>

                        <Button
                          className="w-full bg-amber-500 hover:bg-amber-600"
                          disabled={product.stock === 0}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Adicionar ao Carrinho
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-900 text-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Sobre Nós</h4>
              <p className="text-amber-100 text-sm">
                Sua loja online confiável para produtos de qualidade para cães e gatos.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Categorias</h4>
              <ul className="text-amber-100 text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Alimentos</a></li>
                <li><a href="#" className="hover:text-white">Brinquedos</a></li>
                <li><a href="#" className="hover:text-white">Acessórios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Atendimento</h4>
              <ul className="text-amber-100 text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Suporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Políticas</h4>
              <ul className="text-amber-100 text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos</a></li>
                <li><a href="#" className="hover:text-white">Devoluções</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-amber-800 pt-8 text-center text-amber-100 text-sm">
            <p>&copy; 2024 PetShop Online. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

