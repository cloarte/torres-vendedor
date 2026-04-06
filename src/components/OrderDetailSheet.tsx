import { useState, useMemo } from 'react';
import { ChevronLeft, Truck, CheckCircle, CloudOff, Minus, Plus, Trash2, Camera, X, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import {
  type Order, type OrderStatus, type Product, type PaymentMethod,
  mockSobrestock, type SobrestockItem,
} from '@/data/mockData';
import {
  Sheet, SheetContent,
} from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusConfig: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDIENTE: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
  CONFIRMADO: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmado' },
  LISTO_DESPACHO: { bg: 'bg-green-100', text: 'text-green-700', label: 'Listo despacho' },
  ENTREGADO: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Entregado' },
  CANCELADO: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
  RECHAZADO: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazado' },
};

const paymentLabels: Record<string, string> = {
  EFECTIVO: '💵 Efectivo',
  YAPE: '📱 Yape',
  DEPOSITO: '🏦 Depósito',
  TRANSFERENCIA: '🏦 Transf.',
  CHEQUE: '📄 Cheque',
};

interface DeliveryItem {
  product: Product;
  originalQty: number;
  qty: number;
  isFromSobrestock?: boolean;
}

interface PaymentRow {
  method: PaymentMethod;
  amount: string;
  reference: string;
  photoUrl?: string;
}

const SOBRESTOCK_TOTAL = 8;

const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'EFECTIVO', label: '💵 Efectivo' },
  { value: 'YAPE', label: '📱 Yape' },
  { value: 'DEPOSITO', label: '🏦 Depósito' },
];

interface OrderDetailSheetProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: () => void;
}

type SheetView = 'detail' | 'step1' | 'step2';

const OrderDetailSheet = ({ order, open, onOpenChange, onOrderUpdated }: OrderDetailSheetProps) => {
  const { isOnline } = useApp();
  const [view, setView] = useState<SheetView>('detail');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSobrestockSheet, setShowSobrestockSheet] = useState(false);

  // Delivery state
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([{ method: 'EFECTIVO', amount: '', reference: '' }]);
  const [observations, setObservations] = useState('');

  // Reset view when sheet opens/closes
  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setView('detail');
      setShowCancelDialog(false);
      setShowConfirmDialog(false);
    }
    onOpenChange(o);
  };

  if (!order) return null;

  const st = statusConfig[order.status];
  const productsToShow = order.deliveredProducts || order.products;
  const subtotalWithoutIGV = productsToShow.reduce((s, i) => s + i.product.priceWithoutIGV * i.quantity, 0);
  const totalWithIGV = productsToShow.reduce((s, i) => s + i.product.priceWithIGV * i.quantity, 0);
  const igv = totalWithIGV - subtotalWithoutIGV;

  // Delivery calculations
  const sobrestockUsed = items.reduce((sum, item) => {
    const extra = item.qty - item.originalQty;
    return sum + (extra > 0 ? extra : 0) + (item.isFromSobrestock ? item.qty : 0);
  }, 0);
  const sobrestockRemaining = Math.max(0, SOBRESTOCK_TOTAL - sobrestockUsed);
  const deliveryTotal = items.reduce((sum, item) => sum + item.product.priceWithIGV * item.qty, 0);
  const adjustedCount = items.filter(i => i.qty !== i.originalQty || i.isFromSobrestock).length;
  const allZero = items.length > 0 && items.every(i => i.qty === 0);
  const totalCobrado = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const pendiente = deliveryTotal - totalCobrado;
  const isBalanced = Math.abs(pendiente) < 0.01;

  // Available sobrestock items (not already in delivery list)
  const availableSobrestock = mockSobrestock.filter(
    s => !items.some(i => i.product.id === s.product.id)
  );

  const startDelivery = () => {
    setItems(order.products.map(p => ({
      product: p.product,
      originalQty: p.quantity,
      qty: p.quantity,
    })));
    setPayments([{ method: 'EFECTIVO', amount: '', reference: '' }]);
    setObservations('');
    setView('step1');
  };

  const updateQty = (index: number, delta: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const newQty = Math.max(0, item.qty + delta);
      if (delta > 0) {
        const extra = newQty - item.originalQty;
        const currentExtra = item.qty - item.originalQty;
        const additionalSobrestock = item.isFromSobrestock ? delta : Math.max(0, extra) - Math.max(0, currentExtra);
        if (additionalSobrestock > 0 && sobrestockRemaining <= 0) return item;
      }
      return { ...item, qty: newQty };
    }));
  };

  const addSobrestockProduct = (sobrestockItem: SobrestockItem) => {
    if (items.find(i => i.product.id === sobrestockItem.product.id)) return;
    if (sobrestockRemaining <= 0) return;
    setItems(prev => [...prev, { product: sobrestockItem.product, originalQty: 0, qty: 1, isFromSobrestock: true }]);
    setShowSobrestockSheet(false);
  };

  const updatePayment = (index: number, field: keyof PaymentRow, value: string) => {
    setPayments(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addPaymentRow = () => {
    setPayments(prev => [...prev, { method: 'EFECTIVO', amount: '', reference: '' }]);
  };

  const removePaymentRow = (index: number) => {
    if (payments.length <= 1) return;
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    order.status = 'CANCELADO';
    toast.success('Pedido cancelado');
    setShowCancelDialog(false);
    handleOpenChange(false);
    onOrderUpdated?.();
  };

  const handleConfirm = () => {
    order.status = 'ENTREGADO';
    order.total = deliveryTotal;
    order.deliveredProducts = items.filter(i => i.qty > 0).map(i => ({
      product: i.product,
      quantity: i.qty,
    }));
    order.payments = payments.map(p => ({
      method: p.method,
      amount: parseFloat(p.amount) || 0,
      reference: p.reference || undefined,
    }));

    if (isOnline) {
      toast.success('✓ Entrega registrada correctamente');
    } else {
      toast('Entrega guardada. Se sincronizará al recuperar conexión.', {
        icon: '📱',
        style: { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' },
      });
    }
    setShowConfirmDialog(false);
    handleOpenChange(false);
    onOrderUpdated?.();
  };

  // ─── DETAIL VIEW ───
  const renderDetail = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4 pt-1">
          <h2 className="text-base font-semibold text-foreground">Pedido #{order.id.split('-').pop()}</h2>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>{st.label}</span>
        </div>

        {/* Offline banner */}
        {order.isOffline && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg py-1.5 px-3 flex items-center gap-2 mb-3">
            <CloudOff className="w-3 h-3 text-amber-700" />
            <span className="text-xs text-amber-700">Pendiente de sincronización</span>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-card rounded-xl p-4 shadow-sm mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-base font-semibold text-foreground">{order.client}</span>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{order.canal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Entrega: {order.fechaEntrega}</span>
            <span className="text-xs text-muted-foreground">Creado por: {order.creadoPor}</span>
          </div>
          <div className="mt-2">
            <span className="text-sm font-medium text-foreground">Total: S/ {order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Products */}
        <h3 className="text-sm font-semibold text-foreground mb-2">Productos</h3>
        <div className="bg-card rounded-xl shadow-sm overflow-hidden mb-3">
          {productsToShow.map((item, i) => (
            <div key={item.product.id} className={`px-4 py-2 flex items-center justify-between ${i < productsToShow.length - 1 ? 'border-b border-border' : ''}`}>
              <div>
                <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">{item.product.sku}</p>
              </div>
              <p className="text-sm text-muted-foreground text-right">
                {item.quantity}x · S/ {item.product.priceWithIGV.toFixed(2)} = S/ {(item.product.priceWithIGV * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Total breakdown */}
        <div className="bg-muted rounded-xl p-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal s/IGV</span><span>S/ {subtotalWithoutIGV.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>IGV (18%)</span><span>S/ {igv.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-foreground mt-1">
            <span>TOTAL c/IGV</span><span>S/ {totalWithIGV.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-amber-50 rounded-lg p-3 mt-3">
            <p className="text-sm text-muted-foreground italic">📝 {order.notes}</p>
          </div>
        )}

        {/* ENTREGADO info */}
        {order.status === 'ENTREGADO' && (
          <div className="bg-emerald-50 rounded-xl p-3 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-foreground">Entrega registrada</span>
            </div>
            {order.payments && order.payments.length > 0 && (
              <div className="space-y-1">
                {order.payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium text-muted-foreground">
                      {paymentLabels[p.method] || p.method}
                    </span>
                    <span className="text-foreground font-medium">S/ {p.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {order.status === 'LISTO_DESPACHO' && (
          <button
            onClick={startDelivery}
            className="w-full h-14 mt-4 bg-[#1E3A5F] text-white rounded-xl text-base font-semibold active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
          >
            <Truck className="w-5 h-5" />
            Registrar Entrega
          </button>
        )}

        {order.status === 'PENDIENTE' && (
          <button
            onClick={() => setShowCancelDialog(true)}
            className="w-full h-12 mt-4 border border-red-200 text-red-600 rounded-xl text-sm font-medium active:scale-[0.97] transition-transform"
          >
            Cancelar pedido
          </button>
        )}
      </div>
    </div>
  );

  // ─── STEP 1: QUANTITIES ───
  const renderStep1 = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setView('detail')} className="active:scale-90 transition-transform">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-semibold text-foreground">Ajustar entrega</span>
          <span className="text-sm text-muted-foreground truncate max-w-[100px]">{order.client}</span>
        </div>
        {/* Step pills */}
        <div className="flex gap-2 justify-center">
          <span className="bg-[#1E3A5F] text-white rounded-full px-4 py-1 text-xs font-semibold">1. Productos</span>
          <span className="bg-muted text-muted-foreground rounded-full px-4 py-1 text-xs">2. Cobro</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-40">
        {/* Sobrestock banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
          {sobrestockRemaining > 0 ? (
            <span className="text-xs text-amber-700">📦 Sobrestock disponible: {sobrestockRemaining} unidades (ruta LIM-01)</span>
          ) : (
            <span className="text-xs text-muted-foreground">📦 Sin sobrestock disponible en ruta LIM-01</span>
          )}
        </div>

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Productos del pedido</p>

        <div className="space-y-2">
          {items.map((item, index) => {
            const diff = item.qty - item.originalQty;
            const subtotal = item.product.priceWithIGV * item.qty;
            const canIncrease = item.isFromSobrestock
              ? sobrestockRemaining > 0
              : (diff < 0 || sobrestockRemaining > 0);

            return (
              <div key={item.product.id} className={`bg-card rounded-xl p-3 shadow-sm ${item.qty === 0 ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between mb-0.5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-foreground ${item.qty === 0 ? 'line-through' : ''}`}>
                      {item.product.name}
                    </p>
                    {item.isFromSobrestock && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        Sobrestock
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground flex-shrink-0">S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{item.product.sku}</span>
                  <span className="text-xs text-muted-foreground">S/ {item.product.priceWithIGV.toFixed(2)} c/u</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQty(index, -1)}
                      className="w-11 h-11 rounded-full border border-border flex items-center justify-center active:scale-90 transition-transform text-xl font-light text-foreground"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-14 text-center text-xl font-bold text-foreground tabular-nums">{item.qty}</span>
                    <button
                      onClick={() => canIncrease && updateQty(index, 1)}
                      disabled={!canIncrease}
                      className={`w-11 h-11 rounded-full border border-border flex items-center justify-center transition-transform text-xl font-light text-foreground ${
                        canIncrease ? 'active:scale-90' : 'opacity-40 pointer-events-none'
                      }`}
                      title={!canIncrease ? 'Sin sobrestock' : undefined}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Tags */}
                {diff > 0 && !item.isFromSobrestock && (
                  <p className="text-xs text-amber-600 mt-1.5">↑ +{diff} del sobrestock</p>
                )}
                {diff < 0 && !item.isFromSobrestock && (
                  <p className="text-xs text-blue-500 mt-1.5">↓ −{Math.abs(diff)} unidades menos</p>
                )}
                {item.qty === 0 && (
                  <p className="text-xs text-red-400 mt-1.5">No se entregará</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Add from sobrestock */}
        {sobrestockRemaining > 0 && availableSobrestock.length > 0 && (
          <button
            onClick={() => setShowSobrestockSheet(true)}
            className="mt-3 w-full h-11 border border-dashed border-amber-300 rounded-xl text-sm text-amber-700 font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Plus className="w-4 h-4" />
            Agregar del sobrestock
          </button>
        )}
      </div>

      {/* Sticky footer */}
      <div className="flex-shrink-0 bg-card border-t border-border p-4">
        <div className="mb-2">
          <span className="text-lg font-bold text-[#1E3A5F]">Total a entregar: S/ {deliveryTotal.toFixed(2)}</span>
          <p className="text-xs text-muted-foreground">
            {items.filter(i => i.qty > 0).length} productos · {adjustedCount > 0 ? `${adjustedCount} ajustados` : 'sin ajustes'}
          </p>
        </div>
        <button
          onClick={() => setView('step2')}
          disabled={allZero}
          className={`w-full h-12 bg-primary text-primary-foreground rounded-xl text-sm font-semibold active:scale-[0.97] transition-transform ${
            allZero ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          Continuar al cobro →
        </button>
      </div>
    </div>
  );

  // ─── STEP 2: PAYMENT ───
  const renderStep2 = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setView('step1')} className="active:scale-90 transition-transform">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-base font-semibold text-foreground">Registrar cobro</span>
          <span className="text-sm text-muted-foreground truncate max-w-[100px]">{order.client}</span>
        </div>
        <div className="flex gap-2 justify-center">
          <span className="bg-muted text-muted-foreground rounded-full px-4 py-1 text-xs">1. Productos</span>
          <span className="bg-[#1E3A5F] text-white rounded-full px-4 py-1 text-xs font-semibold">2. Cobro</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-40">
        {/* Total card */}
        <div className="bg-[#1E3A5F] rounded-xl p-4 mb-4 text-white">
          <p className="text-sm opacity-80">Total a cobrar</p>
          <p className="text-3xl font-bold">S/ {deliveryTotal.toFixed(2)}</p>
          {deliveryTotal !== order.total && (
            <p className="text-xs opacity-60 mt-1">Ajustado del original S/ {order.total.toFixed(2)}</p>
          )}
        </div>

        <p className="text-sm font-semibold text-foreground mb-2">¿Cómo pagó el cliente?</p>

        {/* Payment entries */}
        <div className="space-y-3 mb-3">
          {payments.map((payment, index) => (
            <div key={index} className="bg-card rounded-xl p-4 shadow-sm relative">
              {payments.length > 1 && (
                <button onClick={() => removePaymentRow(index)} className="absolute top-3 right-3 text-muted-foreground/40 active:scale-90">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {/* Method pills */}
              <div className="flex gap-1.5 flex-wrap mb-3 pr-6">
                {methodOptions.map(m => (
                  <button
                    key={m.value}
                    onClick={() => updatePayment(index, 'method', m.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      payment.method === m.value
                        ? 'bg-[#1E3A5F] text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {/* Amount */}
              <div className="flex items-center gap-1 border-b border-border pb-2">
                <span className="text-2xl text-muted-foreground font-light">S/</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={payment.amount}
                  onChange={e => updatePayment(index, 'amount', e.target.value)}
                  placeholder="0.00"
                  className="flex-1 text-3xl font-bold text-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/30"
                />
              </div>
              {/* Photo for Yape/Deposito */}
              {(payment.method === 'YAPE' || payment.method === 'DEPOSITO') && (
                <div className="mt-3">
                  {payment.photoUrl ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">📷</div>
                      <button
                        onClick={() => updatePayment(index, 'photoUrl', '')}
                        className="text-muted-foreground active:scale-90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => updatePayment(index, 'photoUrl', 'photo_placeholder')}
                        className="w-full h-10 border border-dashed border-border rounded-xl text-sm text-muted-foreground font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                      >
                        <Camera className="w-4 h-4" />
                        Adjuntar comprobante
                      </button>
                      <p className="text-xs text-muted-foreground mt-1">Recomendado para Yape y depósitos</p>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={addPaymentRow} className="text-[#1E3A5F] text-sm font-medium mb-3 active:scale-95 transition-transform">
          + Agregar otro método de pago
        </button>

        {/* Balance tracker */}
        <div className="bg-muted rounded-xl p-4 mb-3">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Total a cobrar</span>
            <span className="font-semibold">S/ {deliveryTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Cobrado</span>
            <span className="font-semibold text-[#1E3A5F]">S/ {totalCobrado.toFixed(2)}</span>
          </div>
          <div className="border-t border-border pt-2">
            {isBalanced ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-600">Monto completo ✓</span>
                </div>
                <span className="text-sm text-emerald-600">S/ 0.00</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-red-600">Falta cobrar</span>
                <span className="text-base font-bold text-red-600">S/ {pendiente.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Observations */}
        <div>
          <label className="text-sm text-muted-foreground block mb-1.5">Observaciones (opcional)</label>
          <textarea
            value={observations}
            onChange={e => setObservations(e.target.value)}
            rows={3}
            placeholder="Ej: Cliente pagó con billetes de S/100"
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>
      </div>

      {/* Sticky footer */}
      <div className="flex-shrink-0 bg-card border-t border-border p-4">
        <button
          onClick={() => setShowConfirmDialog(true)}
          disabled={!isBalanced}
          className={`w-full h-14 bg-primary text-primary-foreground rounded-xl text-base font-semibold active:scale-[0.97] transition-transform ${
            !isBalanced ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          Confirmar entrega
        </button>
        {!isBalanced && pendiente > 0 && (
          <p className="text-xs text-red-500 text-center mt-1">Falta registrar S/ {pendiente.toFixed(2)}</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          className={`rounded-t-2xl p-0 pt-4 ${view === 'detail' ? 'max-h-[80vh]' : 'h-[90vh]'}`}
        >
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-3 flex-shrink-0" />
          <div className="h-full flex flex-col overflow-hidden">
            {view === 'detail' && renderDetail()}
            {view === 'step1' && renderStep1()}
            {view === 'step2' && renderStep2()}
          </div>
        </SheetContent>
      </Sheet>

      {/* Sobrestock product picker */}
      <Sheet open={showSobrestockSheet} onOpenChange={setShowSobrestockSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[60vh]">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground px-4 mb-3">Sobrestock disponible</h3>
          <div className="space-y-2 overflow-y-auto max-h-[40vh] px-4 pb-4">
            {availableSobrestock.map(s => (
              <div key={s.product.id} className="bg-card rounded-xl p-3 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.product.name}</p>
                  <p className="text-xs text-muted-foreground">{s.product.sku} · Disponible: {s.available} unidades</p>
                </div>
                <button
                  onClick={() => addSobrestockProduct(s)}
                  className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium active:scale-95 transition-transform"
                >
                  Agregar
                </button>
              </div>
            ))}
            {availableSobrestock.length === 0 && (
              <p className="text-center py-8 text-sm text-muted-foreground">No hay productos de sobrestock disponibles.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="rounded-2xl mx-4 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar {order.id}?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-2xl mx-4 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar entrega a {order.client}?</AlertDialogTitle>
            <AlertDialogDescription>
              S/ {deliveryTotal.toFixed(2)} cobrado · {items.filter(i => i.qty > 0).length} productos entregados. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrderDetailSheet;
