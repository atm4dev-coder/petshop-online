import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";

export default function Payment() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/payment/:orderId");
  const { isAuthenticated } = useAuth();
  const orderId = params?.orderId ? parseInt(params.orderId) : null;

  const { data: order, isLoading } = trpc.orders.getById.useQuery(
    { orderId: orderId || 0 },
    { enabled: isAuthenticated && !!orderId }
  );

  const [copied, setCopied] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando informações do pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Pedido não encontrado</h1>
            <Button onClick={() => setLocation("/")} className="bg-amber-500 hover:bg-amber-600">
              Voltar para Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentConfirmation = async () => {
    setProcessingPayment(true);
    // Simular processamento de pagamento
    setTimeout(() => {
      setProcessingPayment(false);
      setLocation(`/order-confirmation/${order.id}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => setLocation("/checkout")}
          className="mb-6 text-amber-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Checkout
        </Button>

        <h1 className="text-3xl font-bold mb-8 text-amber-900">Pagamento do Pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">Informações do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Número do Pedido:</span>
                  <span className="font-semibold text-amber-900">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Total:</span>
                  <span className="text-2xl font-bold text-amber-900">
                    R$ {order.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método de Pagamento:</span>
                  <span className="font-semibold text-amber-900">
                    {order.paymentMethod === "pix"
                      ? "PIX"
                      : order.paymentMethod === "credit_card"
                      ? "Cartão de Crédito"
                      : "Boleto Bancário"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* PIX Payment */}
            {order.paymentMethod === "pix" && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded text-white flex items-center justify-center text-sm font-bold">
                      PIX
                    </div>
                    Pagamento via PIX
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white rounded-lg p-6 border-2 border-dashed border-green-300">
                    <p className="text-sm text-gray-600 mb-4">
                      Escaneie o código QR abaixo com seu banco ou aplicativo de pagamento:
                    </p>

                    {/* QR Code Placeholder */}
                    <div className="flex justify-center mb-6">
                      <div className="w-48 h-48 bg-white border-2 border-green-600 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-gray-600 text-sm mb-2">QR Code PIX</p>
                          <p className="text-xs text-gray-500">
                            (Integração com gateway de pagamento)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-gray-700 mb-2 block">
                          Ou copie a chave PIX:
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value="00020126580014br.gov.bcb.pix..."
                            readOnly
                            className="bg-gray-100 text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard("00020126580014br.gov.bcb.pix...")}
                            className="flex-shrink-0"
                          >
                            {copied ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
                        <p className="font-semibold mb-1">Instruções:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                          <li>Abra seu banco ou app de pagamento</li>
                          <li>Selecione PIX e escaneie o QR code</li>
                          <li>Confirme o valor: R$ {order.total.toFixed(2)}</li>
                          <li>Finalize a transação</li>
                        </ol>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-900">
                        <p>
                          ⏱️ <strong>Importante:</strong> O PIX expira em 10 minutos. Após este
                          período, você precisará gerar um novo código.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={processingPayment}
                    onClick={handlePaymentConfirmation}
                  >
                    {processingPayment ? "Processando..." : "Já Realizei o Pagamento"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Credit Card Payment */}
            {order.paymentMethod === "credit_card" && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">Pagamento com Cartão de Crédito</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white rounded-lg p-6 space-y-4">
                    <div>
                      <Label htmlFor="cardName">Nome do Titular</Label>
                      <Input
                        id="cardName"
                        placeholder="Como aparece no cartão"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Validade</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/AA"
                          maxLength={5}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCVV">CVV</Label>
                        <Input
                          id="cardCVV"
                          placeholder="000"
                          maxLength={4}
                          type="password"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="installments">Parcelamento</Label>
                      <select
                        id="installments"
                        className="w-full mt-2 px-3 py-2 border rounded-md"
                      >
                        <option value="1">À vista - R$ {order.total.toFixed(2)}</option>
                        <option value="2">
                          2x - R$ {(order.total / 2).toFixed(2)}
                        </option>
                        <option value="3">
                          3x - R$ {(order.total / 3).toFixed(2)}
                        </option>
                        <option value="6">
                          6x - R$ {(order.total / 6).toFixed(2)}
                        </option>
                        <option value="12">
                          12x - R$ {(order.total / 12).toFixed(2)}
                        </option>
                      </select>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-900 flex gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>
                        Seus dados de cartão são processados com segurança. Nunca compartilhamos
                        informações completas do cartão.
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={processingPayment}
                    onClick={handlePaymentConfirmation}
                  >
                    {processingPayment ? "Processando..." : "Confirmar Pagamento"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Boleto Payment */}
            {order.paymentMethod === "boleto" && (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-purple-900">Pagamento por Boleto Bancário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white rounded-lg p-6 border-2 border-dashed border-purple-300">
                    <p className="text-sm text-gray-600 mb-4">
                      Seu boleto foi gerado. Você pode:
                    </p>

                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded p-4">
                        <p className="text-xs text-gray-600 mb-2">Código de Barras:</p>
                        <p className="font-mono text-sm font-bold text-center mb-3">
                          12345.67890 12345.678901 12345.678901 1 12345678901234
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            copyToClipboard(
                              "12345.67890 12345.678901 12345.678901 1 12345678901234"
                            )
                          }
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Código
                            </>
                          )}
                        </Button>
                      </div>

                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Baixar Boleto (PDF)
                      </Button>

                      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
                        <p className="font-semibold mb-1">Informações Importantes:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Vencimento: 3 dias úteis</li>
                          <li>Valor: R$ {order.total.toFixed(2)}</li>
                          <li>Pague em qualquer banco ou lotérica</li>
                          <li>Seu pedido será processado após confirmação do pagamento</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={processingPayment}
                    onClick={handlePaymentConfirmation}
                  >
                    {processingPayment ? "Processando..." : "Já Realizei o Pagamento"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-amber-900">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.productName}</span>
                      <span className="font-medium">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>R$ {order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frete</span>
                    <span>R$ {order.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold text-amber-900">Total</span>
                    <span className="text-2xl font-bold text-amber-900">
                      R$ {order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 rounded p-3 text-xs text-amber-900 space-y-2">
                  <p>✓ Compra 100% segura</p>
                  <p>✓ Dados criptografados</p>
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

