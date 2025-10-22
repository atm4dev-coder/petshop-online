import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Trash2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: cartItems, isLoading } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const removeItemMutation = trpc.cart.removeItem.useMutation();
  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation();
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Faça login para ver seu carrinho</h1>
            <Button onClick={() => setLocation("/")}>Voltar para Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleRemoveItem = (cartItemId: number) => {
    removeItemMutation.mutate({ cartItemId });
  };

  const handleUpdateQuantity = (cartItemId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      setQuantities(prev => ({ ...prev, [cartItemId]: newQuantity }));
      updateQuantityMutation.mutate({ cartItemId, quantity: newQuantity });
    }
  };

  const subtotal = cartItems?.reduce((sum, item) => {
    const quantity = quantities[item.id] || item.quantity;
    return sum + (item.product?.price || 0) * quantity;
  }, 0) || 0;

  const shippingCost = cartItems && cartItems.length > 0 ? 15 : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6 text-amber-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Produtos
        </Button>

        <h1 className="text-3xl font-bold mb-8 text-amber-900">Seu Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-600">Carregando carrinho...</p>
              </div>
            ) : cartItems && cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          {item.product?.image && (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-amber-900 mb-2">
                            {item.product?.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            R$ {item.product?.price.toFixed(2)}
                          </p>

                          {/* Quantity */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Quantidade:</label>
                            <Input
                              type="number"
                              min="1"
                              value={quantities[item.id] || item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                              }
                              className="w-16"
                            />
                          </div>
                        </div>

                        {/* Price and Remove */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-amber-900 mb-4">
                            R$ {(
                              (item.product?.price || 0) *
                              (quantities[item.id] || item.quantity)
                            ).toFixed(2)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600 text-lg mb-4">Seu carrinho está vazio</p>
                  <Button onClick={() => setLocation("/")} className="bg-amber-500 hover:bg-amber-600">
                    Continuar Comprando
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-amber-900">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frete</span>
                  <span className="font-medium">
                    {shippingCost > 0 ? `R$ ${shippingCost.toFixed(2)}` : "Grátis"}
                  </span>
                </div>

                <div className="border-t pt-4 flex justify-between">
                  <span className="font-semibold text-amber-900">Total</span>
                  <span className="text-2xl font-bold text-amber-900">
                    R$ {total.toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={!cartItems || cartItems.length === 0}
                  onClick={() => setLocation("/checkout")}
                >
                  Ir para Checkout
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/")}
                >
                  Continuar Comprando
                </Button>

                {/* Info */}
                <div className="bg-amber-50 rounded p-3 text-xs text-gray-600 space-y-2">
                  <p>✓ Frete grátis para compras acima de R$ 100</p>
                  <p>✓ Parcelamento em até 12x sem juros</p>
                  <p>✓ Garantia de satisfação</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

