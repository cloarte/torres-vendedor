import { useState } from 'react';
import FloatingActionButton from './FloatingActionButton';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type OrderStatus = 'PENDIENTE' | 'CONFIRMADO' | 'LISTO_DESPACHO' | 'CANCELADO';

interface Order {
  id: string;
  client: string;
  canal: string;
  fechaEntrega: string;
  total: number;
  status: OrderStatus;
}

const mockOrders: Order[] = [
  { id: 'PED-2026-0050', client: 'Bodega San Martín', canal: 'Tradicional', fechaEntrega: 'Hoy', total: 480, status: 'PENDIENTE' },
  { id: 'PED-2026-0049', client: 'Minimarket El Sol', canal: 'Tradicional', fechaEntrega: 'Hoy', total: 720, status: 'CONFIRMADO' },
  { id: 'PED-2026-0048', client: 'Bodega La Cruz', canal: 'Tradicional', fechaEntrega: 'Mañana', total: 350, status: 'PENDIENTE' },
  { id: 'PED-2026-0045', client: 'Bodega Norte', canal: 'Tradicional', fechaEntrega: 'Ayer', total: 290, status: 'LISTO_DESPACHO' },
];

const statusConfig: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDIENTE: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
  CONFIRMADO: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmado' },
  LISTO_DESPACHO: { bg: 'bg-green-100', text: 'text-green-700', label: 'Listo despacho' },
  CANCELADO: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
};

const filters: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'Confirmado', value: 'CONFIRMADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
];

const summaryCards = [
  { label: 'Mis pedidos hoy', value: 5 },
  { label: 'Pendientes confirmación', value: 2, dot: 'bg-amber-400' },
  { label: 'Confirmados', value: 3, dot: 'bg-green-500' },
];

const PedidosTab = () => {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { selectedCanal } = useApp();

  const filtered = activeFilter === 'ALL'
    ? mockOrders
    : mockOrders.filter((o) => o.status === activeFilter);

  return (
    <div className="pb-16">
      {/* Summary Cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 mb-5">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className="min-w-[130px] bg-card rounded-xl shadow-sm p-3 flex-shrink-0 animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {card.dot && <span className={`w-2 h-2 rounded-full ${card.dot}`} />}
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Section header + filters */}
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground mb-2">Mis pedidos</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-150 active:scale-95 ${
                activeFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order Cards */}
      <div className="space-y-2">
        {filtered.map((order, i) => {
          const st = statusConfig[order.status];
          return (
            <div
              key={order.id}
              className="bg-card rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform duration-100 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${(i + 3) * 60}ms` }}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{order.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
                  {st.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{order.client}</span>
                <span className="text-sm font-medium text-foreground">
                  S/{order.total.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                  {order.canal}
                </span>
                <span className="text-xs text-muted-foreground">{order.fechaEntrega}</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No hay pedidos con este filtro.
          </div>
        )}
      </div>

      {/* Sobrestock button for Tradicional */}
      {selectedCanal?.type === 'tradicional' && (
        <button
          onClick={() => toast.info('Solicitar sobrestock — próximamente')}
          className="mt-4 w-full border border-border rounded-xl py-2.5 text-xs text-muted-foreground font-medium active:scale-[0.98] transition-transform"
        >
          + Solicitar Sobrestock de Ruta
        </button>
      )}

      <FloatingActionButton
        onClick={() => toast.info('Nuevo pedido — próximamente')}
        label="Nuevo Pedido"
      />

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
          {selectedOrder && (() => {
            const st = statusConfig[selectedOrder.status];
            return (
              <>
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-base">{selectedOrder.id}</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 pb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estado</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cliente</span>
                    <span className="text-sm font-semibold text-foreground">{selectedOrder.client}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Canal</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">{selectedOrder.canal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fecha entrega</span>
                    <span className="text-sm text-foreground">{selectedOrder.fechaEntrega}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-foreground">S/{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PedidosTab;
