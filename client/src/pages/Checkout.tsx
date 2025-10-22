import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Lock } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { data: cartItems } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const createOrderMutation = trpc.orders.create.useMutation();

  const [formData, setFormData] = useState({
    paymentMethod: "pix" as "credit_card" | "pix" | "boleto",
    shippingAddress: user?.address || "",
    billingAddress: user?.address || "",
    notes: "",
    useSameAddress: true,
  });

  const subtotal = cartItems?.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0) || 0;

  const shippingCost = cartItems && cartItems.length > 0 ? 15 : 0;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.shippingAddress.trim()) {
      alert("Por favor, preencha o endereço de entrega");
      return;
    }

    createOrderMutation.mutate(
      {
        paymentMethod: formData.paymentMethod,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.useSameAddress ? formData.shippingAddress : formData.billingAddress,
        notes: formData.notes,
      },
      {
        onSuccess: (data) => {
          // Redirecionar para página de pagamento
          setLocation(`/payment/${data.orderId}`);
        },
        onError: (error) => {
          alert(`Erro ao criar pedido: ${error.message}`);
        },
      }
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Faça login para continuar</h1>
            <Button onClick={() => setLocation("/")}>Voltar para Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
            <Button onClick={() => setLocation("/")} className="bg-amber-500 hover:bg-amber-600">
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => setLocation("/cart")}
          className="mb-6 text-amber-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Carrinho
        </Button>

        <h1 className="text-3xl font-bold mb-8 text-amber-900">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shippingAddress">Endereço Completo</Label>
                  <Textarea
                    id="shippingAddress"
                    placeholder="Rua, número, complemento, cidade, estado, CEP"
                    value={formData.shippingAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingAddress: e.target.value })
                    }
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Endereço de Cobrança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useSameAddress"
                    checked={formData.useSameAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, useSameAddress: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="useSameAddress" className="cursor-pointer">
                    Usar o mesmo endereço de entrega
                  </Label>
                </div>

                {!formData.useSameAddress && (
                  <div>
                    <Label htmlFor="billingAddress">Endereço Completo</Label>
                    <Textarea
                      id="billingAddress"
                      placeholder="Rua, número, complemento, cidade, estado, CEP"
                      value={formData.billingAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, billingAddress: e.target.value })
                      }
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      paymentMethod: value as "credit_card" | "pix" | "boleto",
                    })
                  }
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-amber-900">PIX</div>
                      <div className="text-sm text-gray-600">
                        Transferência instantânea - Receba confirmação imediata
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-amber-900">Cartão de Crédito</div>
                      <div className="text-sm text-gray-600">
                        Parcelamento em até 12x sem juros
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="boleto" id="boleto" />
                    <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                      <div className="font-semibold text-amber-900">Boleto Bancário</div>
                      <div className="text-sm text-gray-600">
                        Vencimento em 3 dias úteis
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Observações (Opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Deixe uma mensagem para o vendedor (ex: horário preferido de entrega)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">Sua compra é segura</p>
                <p>
                  Todos os dados são criptografados e sua privacidade é nossa prioridade.
                </p>
              </div>
            </div>
          </form>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-amber-900">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product?.name} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        R$ {((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frete</span>
                    <span className="font-medium">R$ {shippingCost.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-amber-900">Total</span>
                    <span className="text-2xl font-bold text-amber-900">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={createOrderMutation.isPending}
                  onClick={handleSubmit}
                >
                  {createOrderMutation.isPending ? "Processando..." : "Confirmar Pedido"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/cart")}
                >
                  Voltar para Carrinho
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

