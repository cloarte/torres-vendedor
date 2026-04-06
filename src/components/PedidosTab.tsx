import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingActionButton from './FloatingActionButton';
import OrderDetailSheet from './OrderDetailSheet';
import { useApp } from '@/contexts/AppContext';
import { type Order, type OrderStatus } from '@/data/mockData';

const statusConfig: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PENDIENTE: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
  CONFIRMADO: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmado' },
  LISTO_DESPACHO: { bg: 'bg-green-100', text: 'text-green-700', label: 'Listo despacho' },
  ENTREGADO: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Entregado' },
  CANCELADO: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
  RECHAZADO: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazado' },
};

const filters: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'Listo Despacho', value: 'LISTO_DESPACHO' },
  { label: 'Confirmado', value: 'CONFIRMADO' },
  { label: 'Entregado', value: 'ENTREGADO' },
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [, setRefresh] = useState(0);
  const { selectedCanal, orders, vendorName } = useApp();
  const navigate = useNavigate();

  const filtered = (() => {
    if (activeFilter === 'ALL') return orders;
    if (activeFilter === 'LISTO_DESPACHO') {
      return orders.filter((o) => o.status === 'LISTO_DESPACHO');
    }
    return orders.filter((o) => o.status === activeFilter && o.creadoPor === vendorName);
  })();

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  };

  const handleOrderUpdated = useCallback(() => {
    setRefresh(r => r + 1);
  }, []);

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
              onClick={() => handleOrderClick(order)}
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
                {order.creadoPor !== vendorName && (
                  <span className="text-[10px] text-muted-foreground">· por {order.creadoPor}</span>
                )}
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
          onClick={() => navigate('/pedidos/nuevo?sobrestock=1')}
          className="mt-4 w-full border border-border rounded-xl py-2.5 text-xs text-muted-foreground font-medium active:scale-[0.98] transition-transform"
        >
          + Solicitar Sobrestock de Ruta
        </button>
      )}

      <FloatingActionButton
        onClick={() => navigate('/pedidos/nuevo')}
        label="Nuevo Pedido"
      />

      <OrderDetailSheet
        order={selectedOrder}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
};

export default PedidosTab;
