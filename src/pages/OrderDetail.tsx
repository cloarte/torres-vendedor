import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CloudOff, Truck, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { mockOrders, type Order, type OrderStatus } from '@/data/mockData';
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

const paymentMethodLabels: Record<string, string> = {
  EFECTIVO: '💵 Efectivo',
  TRANSFERENCIA: '🏦 Transf.',
  YAPE: '📱 Yape',
  CHEQUE: '📄 Cheque',
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const order = mockOrders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center">
        <p className="text-muted-foreground text-sm">Pedido no encontrado</p>
        <button onClick={() => navigate('/')} className="mt-4 text-primary text-sm font-medium">
          Volver
        </button>
      </div>
    );
  }

  const st = statusConfig[order.status];

  const productsToShow = order.deliveredProducts || order.products;
  const subtotalWithoutIGV = productsToShow.reduce(
    (sum, item) => sum + item.product.priceWithoutIGV * item.quantity, 0
  );
  const totalWithIGV = productsToShow.reduce(
    (sum, item) => sum + item.product.priceWithIGV * item.quantity, 0
  );
  const igv = totalWithIGV - subtotalWithoutIGV;

  const handleCancel = () => {
    order.status = 'CANCELADO';
    toast.success('Pedido cancelado');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-12 bg-primary flex items-center px-4 flex-shrink-0 gap-3">
        <button onClick={() => navigate('/')} className="text-primary-foreground active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-primary-foreground font-semibold text-base flex-1 text-center">
          Pedido #{order.id.split('-').pop()}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
          {st.label}
        </span>
      </header>

      {/* Offline banner */}
      {order.isOffline && (
        <div className="bg-amber-50 border-b border-amber-200 py-1 px-4 flex items-center gap-2">
          <CloudOff className="w-3 h-3 text-amber-700" />
          <span className="text-xs text-amber-700">Pendiente de sincronización</span>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-28">
        {/* Order Summary Card */}
        <div className="bg-card rounded-xl p-4 shadow-sm mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-base font-semibold text-foreground">{order.client}</span>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {order.canal}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Entrega: {order.fechaEntrega}</span>
            <span className="text-xs text-muted-foreground">Creado por: {order.creadoPor}</span>
          </div>
          <div className="mt-2">
            <span className="text-sm font-medium text-foreground">Total: S/ {order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Product List */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-foreground mb-2">Productos</h3>
          <div className="bg-card rounded-xl shadow-sm overflow-hidden">
            {productsToShow.map((item, i) => (
              <div
                key={item.product.id}
                className={`px-4 py-2 flex items-center justify-between ${
                  i < productsToShow.length - 1 ? 'border-b border-border' : ''
                }`}
              >
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
        </div>

        {/* Total Breakdown */}
        <div className="bg-muted rounded-xl p-3 mt-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal s/IGV</span>
            <span>S/ {subtotalWithoutIGV.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>IGV (18%)</span>
            <span>S/ {igv.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-foreground mt-1">
            <span>TOTAL c/IGV</span>
            <span>S/ {totalWithIGV.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-amber-50 rounded-lg p-3 mt-2">
            <p className="text-sm text-muted-foreground italic">📝 {order.notes}</p>
          </div>
        )}

        {/* Entregado read-only info */}
        {order.status === 'ENTREGADO' && (
          <div className="bg-emerald-50 rounded-xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-foreground">Entrega registrada</span>
            </div>
            {order.payments && order.payments.length > 0 && (
              <div className="space-y-1">
                {order.payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium text-muted-foreground">
                      {paymentMethodLabels[p.method] || p.method}
                    </span>
                    <span className="text-foreground font-medium">S/ {p.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Action Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-30">
        {order.status === 'LISTO_DESPACHO' && (
          <button
            onClick={() => navigate(`/pedidos/${order.id}/entregar`)}
            className="w-full h-14 bg-primary text-primary-foreground rounded-xl text-base font-semibold active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
          >
            <Truck className="w-5 h-5" />
            Registrar Entrega
          </button>
        )}
        {order.status === 'PENDIENTE' && (
          <button
            onClick={() => setShowCancelDialog(true)}
            className="w-full h-12 border border-red-200 text-red-600 rounded-xl text-sm font-medium active:scale-[0.97] transition-transform"
          >
            Cancelar pedido
          </button>
        )}
      </div>

      {/* Cancel Dialog */}
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
    </div>
  );
};

export default OrderDetail;
