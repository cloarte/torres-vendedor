import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

type PeriodFilter = 'semana' | 'mes';

const weeklyData = [
  { day: 'L', amount: 1200 },
  { day: 'M', amount: 980 },
  { day: 'X', amount: 1540 },
  { day: 'J', amount: 870 },
  { day: 'V', amount: 1650 },
  { day: 'S', amount: 1380 },
  { day: 'D', amount: 800 },
];

const recentOrders = [
  { id: 'PED-2026-0050', client: 'Bodega San Martín', total: 480, status: 'PENDIENTE' as const },
  { id: 'PED-2026-0049', client: 'Minimarket El Sol', total: 720, status: 'CONFIRMADO' as const },
  { id: 'PED-2026-0048', client: 'Bodega La Cruz', total: 350, status: 'PENDIENTE' as const },
  { id: 'PED-2026-0045', client: 'Bodega Norte', total: 290, status: 'LISTO_DESPACHO' as const },
  { id: 'PED-2026-0044', client: 'Tienda Rosales', total: 415, status: 'CONFIRMADO' as const },
];

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  PENDIENTE: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
  CONFIRMADO: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmado' },
  LISTO_DESPACHO: { bg: 'bg-green-100', text: 'text-green-700', label: 'Listo' },
};

const MisDatosTab = () => {
  const [period, setPeriod] = useState<PeriodFilter>('mes');
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const tasaDevolucion = 12.4;
  const metaActual = 8420;
  const metaObjetivo = 15000;
  const metaPct = (metaActual / metaObjetivo) * 100;
  const hasDevuelto = false; // mock

  const getTasaColor = (tasa: number) => {
    if (tasa < 20) return 'text-green-600';
    if (tasa < 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const kpis = [
    { label: 'Mis ventas', value: 'S/ 8,420', sub: 'este mes' },
    { label: 'Mis pedidos', value: '18', sub: 'pedidos' },
    { label: 'Tasa devolución', value: `${tasaDevolucion}%`, sub: '< 20% ✓', valueClass: getTasaColor(tasaDevolucion) },
    { label: 'Gastos aprobados', value: 'S/ 1,240', sub: 'este mes' },
  ];

  return (
    <div className="pb-16 space-y-5">
      {/* Period toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Mi Desempeño</h2>
        <div className="flex bg-secondary rounded-full p-0.5">
          {(['semana', 'mes'] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150 active:scale-95 capitalize ${
                period === p
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-4 shadow-sm animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
            <p className={`text-xl font-bold ${kpi.valueClass || 'text-foreground'} tabular-nums`}>
              {kpi.value}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Sales Chart */}
      <div className="bg-card rounded-xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: '240ms' }}>
        <h3 className="text-xs font-semibold text-foreground mb-3">Mis ventas por día (últimos 7 días)</h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barCategoryGap="20%">
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }}
              />
              <YAxis hide />
              <Bar
                dataKey="amount"
                radius={[4, 4, 0, 0]}
                onMouseEnter={(_, index) => setActiveBar(index)}
                onMouseLeave={() => setActiveBar(null)}
              >
                {weeklyData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={activeBar === index ? 'hsl(37, 78%, 52%)' : 'hsl(213, 52%, 24%)'}
                    className="transition-colors duration-150"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <h3 className="text-xs font-semibold text-foreground mb-2">Mis últimos pedidos</h3>
        <div className="space-y-1.5">
          {recentOrders.map((order) => {
            const st = statusBadge[order.status];
            return (
              <div key={order.id} className="bg-card rounded-xl p-3 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{order.client}</p>
                  <p className="text-[10px] text-muted-foreground">{order.id}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
                    {st.label}
                  </span>
                  <span className="text-sm font-medium text-foreground tabular-nums">S/{order.total.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => toast.info('Ver todos — próximamente')}
          className="mt-2 text-xs font-semibold text-primary active:scale-95 transition-transform"
        >
          Ver todos mis pedidos →
        </button>
      </div>

      {/* Meta Section */}
      <div className="bg-card rounded-xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: '360ms' }}>
        <h3 className="text-xs font-semibold text-foreground mb-3">Mi avance vs meta</h3>
        <div className="flex items-end justify-between mb-2">
          <span className="text-lg font-bold text-foreground tabular-nums">S/ {metaActual.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">/ S/ {metaObjetivo.toLocaleString()}</span>
        </div>
        <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min(metaPct, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {metaPct.toFixed(1)}% de la meta mensual
        </p>
      </div>

      {/* Gastos Summary */}
      <div className="bg-card rounded-xl p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: '420ms' }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground">Mis gastos aprobados este mes</p>
          <span className="text-sm font-bold text-foreground tabular-nums">S/ 1,240</span>
        </div>
        <p className="text-[10px] text-muted-foreground">Se descontarán en tu próxima liquidación</p>
        {hasDevuelto && (
          <div className="mt-2 bg-amber-50 rounded-lg p-2 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <p className="text-[10px] text-amber-700 font-medium">Tienes un lote devuelto pendiente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisDatosTab;
