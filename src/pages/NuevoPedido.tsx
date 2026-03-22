import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Info, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { mockClients, mockProducts, SOBRESTOCK_CLIENT, type Client, type Product } from '@/data/mockData';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

const NuevoPedido = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSobrestock = searchParams.get('sobrestock') === '1';
  const { selectedCanal, isOnline } = useApp();
  const isTradicional = selectedCanal?.type === 'tradicional';

  const [step, setStep] = useState<1 | 2 | 3>(isSobrestock ? 2 : 1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    isSobrestock ? SOBRESTOCK_CLIENT : null
  );
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    isTradicional ? addDays(new Date(), 1) : undefined
  );
  const [clientSearch, setClientSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');

  // Filter clients by canal
  const filteredClients = useMemo(() => {
    const canalClients = isTradicional
      ? mockClients.filter((c) => c.rutaId === selectedCanal?.ruta)
      : mockClients.filter((c) => c.canal === selectedCanal?.name);

    if (!clientSearch.trim()) return canalClients;
    const q = clientSearch.toLowerCase();
    return canalClients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
    );
  }, [clientSearch, isTradicional, selectedCanal]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return mockProducts;
    const q = productSearch.toLowerCase();
    return mockProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [productSearch]);

  // Cart helpers
  const cartTotal = cart.reduce((sum, item) => sum + item.product.priceWithIGV * item.quantity, 0);
  const cartTotalWithoutIGV = cart.reduce((sum, item) => sum + item.product.priceWithoutIGV * item.quantity, 0);
  const cartIGV = cartTotal - cartTotalWithoutIGV;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const getQuantity = (productId: string) => cart.find((i) => i.product.id === productId)?.quantity || 0;

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    if (isTradicional) {
      setStep(2);
    }
  };

  const handleConfirm = () => {
    if (isOnline) {
      toast.success('Pedido creado exitosamente');
    } else {
      toast('Pedido guardado localmente. Se enviará cuando recuperes conexión.', {
        icon: '📱',
        style: { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' },
      });
    }
    navigate('/');
  };

  const canalBadge = selectedCanal ? (
    <span
      className={cn(
        'text-[10px] px-2 py-0.5 rounded-full font-medium',
        selectedCanal.type === 'tradicional'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-blue-100 text-blue-700'
      )}
    >
      {selectedCanal.name}
    </span>
  ) : null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-12 bg-primary flex items-center px-4 flex-shrink-0 gap-3">
        <button
          onClick={() => {
            if (step === 1 || (step === 2 && isSobrestock)) navigate('/');
            else if (step === 2) setStep(1);
            else setStep(2);
          }}
          className="text-primary-foreground active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-primary-foreground font-semibold text-base flex-1 text-center">
          {isSobrestock ? `Sobrestock Ruta ${selectedCanal?.ruta || ''}` : 'Nuevo Pedido'}
        </span>
        {canalBadge}
      </header>

      {/* Step 1: Select Client */}
      {step === 1 && (
        <div className="flex-1 overflow-y-auto p-4">
          {isTradicional && (
            <div className="bg-blue-50 text-blue-700 text-xs rounded-lg p-2.5 mb-4 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Fecha de entrega calculada automáticamente según tu ruta.</span>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Client list */}
          <div className="space-y-2">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleSelectClient(client)}
                className="w-full bg-card rounded-xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
              >
                <p className="text-sm font-semibold text-foreground">{client.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{client.address}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Último pedido: hace {client.lastOrderDaysAgo} días
                </p>
              </button>
            ))}
            {filteredClients.length === 0 && (
              <p className="text-center py-8 text-sm text-muted-foreground">
                No se encontraron clientes.
              </p>
            )}
          </div>

          {/* Date picker for non-traditional */}
          {!isTradicional && selectedClient && (
            <div className="mt-4 bg-card rounded-xl p-4 shadow-sm">
              <p className="text-sm font-medium text-foreground mb-2">Fecha de entrega *</p>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      'w-full h-11 px-3 rounded-xl border border-border bg-background text-left text-sm flex items-center justify-between',
                      !deliveryDate && 'text-muted-foreground'
                    )}
                  >
                    {deliveryDate ? format(deliveryDate, "dd 'de' MMMM, yyyy", { locale: es }) : 'Seleccionar fecha'}
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={(date) => {
                      setDeliveryDate(date);
                    }}
                    disabled={(date) => date <= new Date()}
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-[10px] text-muted-foreground mt-2">
                Hora de corte: 6:00 PM. Pedidos deben crearse el día anterior.
              </p>
              {deliveryDate && (
                <button
                  onClick={() => setStep(2)}
                  className="mt-3 w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-medium active:scale-[0.98] transition-transform"
                >
                  Continuar
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Add Products */}
      {step === 2 && (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Client info bar */}
          <div className="px-4 py-2.5 bg-card border-b border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedClient?.name}</p>
              <p className="text-[10px] text-muted-foreground">
                Entrega: {deliveryDate ? format(deliveryDate, "dd/MM/yyyy") : 'Según ruta'}
              </p>
            </div>
            {canalBadge}
          </div>

          {isSobrestock && (
            <div className="mx-4 mt-3 bg-amber-50 text-amber-800 text-xs rounded-lg p-2.5 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>El sobrestock es stock extra para vender directamente en ruta. Rosnelli puede aprobarlo, modificarlo o rechazarlo.</span>
            </div>
          )}

          {/* Product search */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar producto por nombre o SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Product list */}
          <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-2">
            {filteredProducts.map((product) => {
              const qty = getQuantity(product.id);
              return (
                <div key={product.id} className="bg-card rounded-xl p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground">{product.sku}</p>
                      <p className="text-sm font-medium text-foreground leading-tight">{product.name}</p>
                      <p className="text-xs font-semibold text-foreground mt-1">
                        S/{product.priceWithIGV.toFixed(2)}
                        <span className="text-[10px] text-muted-foreground font-normal ml-1">c/IGV</span>
                      </p>
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-11 h-11 rounded-xl border border-border bg-card flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <Minus className="w-4 h-4 text-foreground" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-foreground tabular-nums">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky cart bar */}
          {cart.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 flex items-center justify-between z-30 safe-bottom">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">
                  <span className="font-bold">{cartCount}</span> productos | <span className="font-bold">S/{cartTotal.toFixed(2)}</span>
                </span>
              </div>
              <button
                onClick={() => setStep(3)}
                className="h-10 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-medium active:scale-95 transition-transform"
              >
                Ver pedido →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm Order */}
      {step === 3 && (
        <div className="flex-1 overflow-y-auto p-4 pb-8">
          {/* Summary card */}
          <div className="bg-card rounded-xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedClient?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedCanal?.name} · Entrega: {deliveryDate ? format(deliveryDate, "dd/MM/yyyy") : 'Según ruta'}
                </p>
              </div>
              {canalBadge}
            </div>

            {/* Product lines */}
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.product.name}</p>
                    <p className="text-[10px] text-muted-foreground">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-foreground tabular-nums">
                    S/{(item.product.priceWithIGV * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal s/IGV</span>
                <span className="tabular-nums">S/{cartTotalWithoutIGV.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>IGV (18%)</span>
                <span className="tabular-nums">S/{cartIGV.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground pt-1">
                <span>TOTAL c/IGV</span>
                <span className="tabular-nums">S/{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card rounded-xl shadow-sm p-4 mb-6">
            <label className="text-sm font-medium text-foreground block mb-2">Notas adicionales</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Entregar en la mañana"
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={handleConfirm}
              className="w-full h-12 bg-primary text-primary-foreground rounded-xl text-sm font-semibold active:scale-[0.97] transition-transform"
            >
              Confirmar pedido
            </button>
            <button
              onClick={() => setStep(2)}
              className="w-full h-12 border border-border bg-card text-foreground rounded-xl text-sm font-medium active:scale-[0.97] transition-transform"
            >
              Editar productos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NuevoPedido;
