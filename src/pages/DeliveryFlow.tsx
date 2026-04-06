import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Search, Trash2, CheckCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import { mockOrders, mockProducts, type Product, type OrderProduct, type PaymentEntry } from '@/data/mockData';
import { useApp } from '@/contexts/AppContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'YAPE' | 'CHEQUE';

interface DeliveryItem {
  product: Product;
  originalQty: number;
  qty: number;
  isNew?: boolean;
}

interface PaymentRow {
  method: PaymentMethod;
  amount: string;
  reference: string;
}

const SOBRESTOCK_TOTAL = 8;

const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'EFECTIVO', label: '💵 Efectivo' },
  { value: 'TRANSFERENCIA', label: '🏦 Transf.' },
  { value: 'YAPE', label: '📱 Yape' },
  { value: 'CHEQUE', label: '📄 Cheque' },
];

const DeliveryFlow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isOnline } = useApp();

  const order = mockOrders.find((o) => o.id === id);

  const [step, setStep] = useState<1 | 2>(1);
  const [items, setItems] = useState<DeliveryItem[]>(() =>
    order?.products.map((p) => ({
      product: p.product,
      originalQty: p.quantity,
      qty: p.quantity,
    })) || []
  );
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [payments, setPayments] = useState<PaymentRow[]>([{ method: 'EFECTIVO', amount: '', reference: '' }]);
  const [observations, setObservations] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const filteredProducts = useMemo(() => {
    const existingIds = new Set(items.map((i) => i.product.id));
    const available = mockProducts.filter((p) => !existingIds.has(p.id));
    if (!productSearch.trim()) return available;
    const q = productSearch.toLowerCase();
    return available.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [productSearch, items]);

  if (!order) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center">
        <p className="text-muted-foreground text-sm">Pedido no encontrado</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary text-sm font-medium">Volver</button>
      </div>
    );
  }

  // Sobrestock calculations
  const sobrestockUsed = items.reduce((sum, item) => {
    const extra = item.qty - item.originalQty;
    return sum + (extra > 0 ? extra : 0) + (item.isNew ? item.qty : 0);
  }, 0);
  const sobrestockRemaining = Math.max(0, SOBRESTOCK_TOTAL - sobrestockUsed);

  // Totals
  const deliveryTotal = items.reduce((sum, item) => sum + item.product.priceWithIGV * item.qty, 0);
  const deliveryTotalWithoutIGV = items.reduce((sum, item) => sum + item.product.priceWithoutIGV * item.qty, 0);
  const adjustedCount = items.filter((item) => item.qty !== item.originalQty || item.isNew).length;
  const allZero = items.every((item) => item.qty === 0);

  // Payment totals
  const totalCobrado = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const pendiente = deliveryTotal - totalCobrado;
  const isBalanced = Math.abs(pendiente) < 0.01;

  const updateQty = (index: number, delta: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const newQty = Math.max(0, item.qty + delta);
        // Check sobrestock limit for increases
        if (delta > 0) {
          const extra = newQty - item.originalQty;
          const currentExtra = item.qty - item.originalQty;
          const additionalSobrestock = (item.isNew ? delta : Math.max(0, extra) - Math.max(0, currentExtra));
          if (additionalSobrestock > 0 && sobrestockRemaining <= 0) return item;
        }
        return { ...item, qty: newQty };
      })
    );
  };

  const addProduct = (product: Product) => {
    if (items.find((i) => i.product.id === product.id)) return;
    if (sobrestockRemaining <= 0) return;
    setItems((prev) => [...prev, { product, originalQty: 0, qty: 1, isNew: true }]);
    setShowProductSheet(false);
    setProductSearch('');
  };

  const filteredProducts = useMemo(() => {
    const existingIds = new Set(items.map((i) => i.product.id));
    const available = mockProducts.filter((p) => !existingIds.has(p.id));
    if (!productSearch.trim()) return available;
    const q = productSearch.toLowerCase();
    return available.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [productSearch, items]);

  const updatePayment = (index: number, field: keyof PaymentRow, value: string) => {
    setPayments((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addPaymentRow = () => {
    setPayments((prev) => [...prev, { method: 'EFECTIVO', amount: '', reference: '' }]);
  };

  const removePaymentRow = (index: number) => {
    if (payments.length <= 1) return;
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    order.status = 'ENTREGADO';
    order.total = deliveryTotal;
    order.deliveredProducts = items.filter((i) => i.qty > 0).map((i) => ({
      product: i.product,
      quantity: i.qty,
    }));
    order.payments = payments.map((p) => ({
      method: p.method,
      amount: parseFloat(p.amount) || 0,
      reference: p.reference || undefined,
    }));

    if (isOnline) {
      toast.success('✓ Entrega registrada correctamente');
    } else {
      toast('Entrega guardada localmente. Se sincronizará al recuperar conexión.', {
        icon: '📱',
        style: { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' },
      });
    }
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-primary flex-shrink-0">
        <div className="h-12 flex items-center px-4 gap-3">
          <button
            onClick={() => {
              if (step === 1) navigate(`/pedidos/${order.id}`);
              else setStep(1);
            }}
            className="text-primary-foreground active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-primary-foreground font-semibold text-base flex-1 text-center">
            Registrar Entrega
          </span>
          <span className="text-primary-foreground/60 text-sm truncate max-w-[100px]">{order.client}</span>
        </div>
        {/* Step indicator */}
        <div className="flex gap-2 px-4 pb-3">
          <span
            className={`px-4 py-1 rounded-full text-xs font-semibold ${
              step === 1 ? 'bg-card text-primary' : 'text-primary-foreground/40'
            }`}
          >
            1. Cantidades
          </span>
          <span
            className={`px-4 py-1 rounded-full text-xs font-semibold ${
              step === 2 ? 'bg-card text-primary' : 'text-primary-foreground/40'
            }`}
          >
            2. Cobro
          </span>
        </div>
      </header>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <main className="flex-1 overflow-y-auto p-4 pb-36">
            {/* Sobrestock info */}
            {SOBRESTOCK_TOTAL > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex items-start gap-2">
                <Package className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-amber-700">
                  📦 Sobrestock disponible: {sobrestockRemaining} unidades en ruta LIM-01
                </span>
              </div>
            )}

            <h3 className="text-sm font-semibold text-foreground mb-2">Productos a entregar</h3>

            <div className="space-y-2">
              {items.map((item, index) => {
                const diff = item.qty - item.originalQty;
                const subtotal = item.product.priceWithIGV * item.qty;
                const canIncrease = item.isNew
                  ? sobrestockRemaining > 0
                  : (diff < 0 || sobrestockRemaining > 0);

                return (
                  <div
                    key={item.product.id}
                    className={`bg-card rounded-xl p-3 shadow-sm ${item.qty === 0 ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold text-foreground ${item.qty === 0 ? 'line-through' : ''}`}>
                            {item.product.name}
                          </p>
                          {item.isNew && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                              Nuevo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                      </div>
                      <span className="text-sm font-medium text-foreground">S/ {subtotal.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Precio unit.: S/ {item.product.priceWithIGV.toFixed(2)} c/IGV
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQty(index, -1)}
                          className="w-11 h-11 rounded-full border border-border flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <Minus className="w-4 h-4 text-foreground" />
                        </button>
                        <span className="w-12 text-center text-xl font-bold text-foreground tabular-nums">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => canIncrease && updateQty(index, 1)}
                          disabled={!canIncrease}
                          className={`w-11 h-11 rounded-full border border-border flex items-center justify-center transition-transform ${
                            canIncrease ? 'active:scale-90' : 'opacity-40 cursor-not-allowed'
                          }`}
                          title={!canIncrease ? 'Sin sobrestock disponible' : undefined}
                        >
                          <Plus className="w-4 h-4 text-foreground" />
                        </button>
                      </div>
                    </div>
                    {/* Diff tags */}
                    {diff > 0 && !item.isNew && (
                      <p className="text-xs text-amber-600 mt-1">↑ +{diff} del sobrestock</p>
                    )}
                    {diff < 0 && !item.isNew && (
                      <p className="text-xs text-blue-600 mt-1">↓ −{Math.abs(diff)} unidades menos</p>
                    )}
                    {item.qty === 0 && (
                      <p className="text-xs text-red-500 mt-1">No entregado</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add product button */}
            <button
              onClick={() => setShowProductSheet(true)}
              className="mt-3 w-full h-11 border border-dashed border-border rounded-xl text-sm text-muted-foreground font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Plus className="w-4 h-4" />
              Agregar producto no incluido
            </button>
          </main>

          {/* Step 1 Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-30">
            <div className="mb-2">
              <span className="text-lg font-bold text-primary">Total a entregar: S/ {deliveryTotal.toFixed(2)}</span>
              <p className="text-xs text-muted-foreground">
                {items.filter((i) => i.qty > 0).length} productos · {adjustedCount > 0 ? `${adjustedCount} ajustados` : 'sin ajustes'}
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={allZero}
              className={`w-full h-12 bg-primary text-primary-foreground rounded-xl text-sm font-semibold active:scale-[0.97] transition-transform ${
                allZero ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Continuar →
            </button>
          </div>

          {/* Product search sheet */}
          <Sheet open={showProductSheet} onOpenChange={setShowProductSheet}>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
              <SheetHeader className="pb-3">
                <SheetTitle className="text-base">Agregar producto</SheetTitle>
              </SheetHeader>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[40vh] pb-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product)}
                    disabled={sobrestockRemaining <= 0}
                    className="w-full bg-card rounded-xl p-3 shadow-sm text-left active:scale-[0.98] transition-transform disabled:opacity-40"
                  >
                    <p className="text-[10px] text-muted-foreground">{product.sku}</p>
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs font-semibold text-foreground mt-1">
                      S/{product.priceWithIGV.toFixed(2)} <span className="text-[10px] text-muted-foreground font-normal">c/IGV</span>
                    </p>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-center py-8 text-sm text-muted-foreground">No se encontraron productos.</p>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <main className="flex-1 overflow-y-auto p-4 pb-28">
            {/* Total summary */}
            <div className="bg-muted rounded-xl p-4 mb-4">
              <p className="text-sm text-muted-foreground">Total a cobrar</p>
              <p className="text-2xl font-bold text-primary">S/ {deliveryTotal.toFixed(2)}</p>
              {deliveryTotal !== order.total && (
                <p className="text-xs text-muted-foreground mt-1">
                  Pedido original: S/ {order.total.toFixed(2)} → Ajustado: S/ {deliveryTotal.toFixed(2)}
                </p>
              )}
            </div>

            {/* Payment section */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Forma de pago</h3>
              <button onClick={addPaymentRow} className="text-primary text-sm font-medium active:scale-95 transition-transform">
                + Agregar método
              </button>
            </div>

            <div className="space-y-2 mb-3">
              {payments.map((payment, index) => (
                <div key={index} className="bg-card rounded-xl p-4 shadow-sm relative">
                  {payments.length > 1 && (
                    <button
                      onClick={() => removePaymentRow(index)}
                      className="absolute top-3 right-3 text-muted-foreground active:scale-90 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {/* Method pills */}
                  <div className="flex gap-1.5 flex-wrap mb-3 pr-6">
                    {methodOptions.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => updatePayment(index, 'method', m.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          payment.method === m.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {/* Amount input */}
                  <div className="flex items-center gap-1">
                    <span className="text-xl text-muted-foreground">S/</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={payment.amount}
                      onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                      placeholder="0.00"
                      className="flex-1 text-2xl font-bold text-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/40"
                    />
                  </div>
                  {/* Reference for transfer/cheque */}
                  {(payment.method === 'TRANSFERENCIA' || payment.method === 'CHEQUE') && (
                    <input
                      type="text"
                      value={payment.reference}
                      onChange={(e) => updatePayment(index, 'reference', e.target.value)}
                      placeholder="N° operación / referencia (ej: 987654321)"
                      className="mt-2 w-full h-10 px-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Balance row */}
            <div className="bg-muted rounded-xl p-3 mb-3">
              <div className="flex justify-between text-sm font-semibold">
                <span>Total cobrado:</span>
                <span>S/ {totalCobrado.toFixed(2)}</span>
              </div>
              {isBalanced ? (
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-600 font-medium">Monto completo ✓</span>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between text-sm text-red-600 mt-1">
                    <span>Pendiente:</span>
                    <span>S/ {pendiente.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-red-500 mt-1">El monto cobrado no cubre el total del pedido</p>
                </div>
              )}
            </div>

            {/* Observations */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Observaciones (opcional)</label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={4}
                placeholder="Ej: El cliente rechazó 2 unidades por empaque dañado"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </main>

          {/* Step 2 Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-30 flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 h-12 border border-border bg-card text-foreground rounded-xl text-sm font-medium active:scale-[0.97] transition-transform"
            >
              ← Cantidades
            </button>
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={!isBalanced}
              className={`flex-1 h-12 bg-primary text-primary-foreground rounded-xl text-sm font-semibold active:scale-[0.97] transition-transform ${
                !isBalanced ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Confirmar entrega
            </button>
          </div>

          {/* Confirm Dialog */}
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent className="rounded-2xl mx-4 max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Confirmar entrega?</AlertDialogTitle>
                <AlertDialogDescription>
                  Entrega de {items.filter((i) => i.qty > 0).length} productos a {order.client} por S/ {deliveryTotal.toFixed(2)}.
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirm}>Confirmar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};

export default DeliveryFlow;
