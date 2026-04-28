import { Truck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface StockItem {
  name: string;
  sku: string;
  qty: number;
  price: number;
}

const stockItems: StockItem[] = [
  { name: 'Pan Integral 500g', sku: 'PAN-INT-500', qty: 12, price: 4.20 },
  { name: 'Croissant Mantequilla', sku: 'CRO-MAN-01', qty: 8, price: 3.50 },
  { name: 'Queque Vainilla', sku: 'QUE-VAI-01', qty: 10, price: 5.10 },
  { name: 'Empanada Pollo', sku: 'EMP-POL-01', qty: 17, price: 2.80 },
];

const StockFlotantePill = () => {
  const totalUnits = stockItems.reduce((s, i) => s + i.qty, 0);
  const totalValue = stockItems.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 bg-amber-500 text-white rounded-full px-3 py-1.5 text-xs font-semibold active:scale-95 transition-transform">
          <Truck className="w-4 h-4" />
          <span>Stock: {totalUnits} uds</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-72 p-0 overflow-hidden rounded-2xl shadow-xl border border-slate-100 bg-white"
      >
        <div className="bg-[#1E3A5F] px-4 py-3 flex items-center gap-2">
          <Truck className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-sm">Stock Flotante — Ruta LIM-01</span>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {stockItems.map((item) => (
            <div
              key={item.sku}
              className="px-4 py-2.5 border-b border-slate-100 last:border-0 flex items-start justify-between"
            >
              <div>
                <div className="text-sm font-medium text-slate-800">{item.name}</div>
                <div className="text-xs text-slate-400">{item.sku}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#1E3A5F]">x{item.qty}</div>
                <div className="text-xs text-slate-500">S/ {(item.qty * item.price).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total en ruta</span>
            <span className="text-sm font-bold text-[#1E3A5F]">S/ {totalValue.toFixed(2)}</span>
          </div>
          <div className="text-xs text-slate-400">
            {totalUnits} unidades · {stockItems.length} productos
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StockFlotantePill;