import { useState } from 'react';
import { Tag, Plus, Minus, ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { mockClients, Order } from '@/data/mockData';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface SpecialProduct {
  id: string;
  name: string;
  lote: string;
  vence: string;
  diasRest: string;
  condicion: 'PRÓXIMO_VENCER' | 'DEFECTO_ESTÉTICO';
  disponible: number;
  precioEspecial: number;
  estado: 'DISPONIBLE' | 'RESERVADO' | 'AGOTADO';
}

const mockSpecialProducts: SpecialProduct[] = [
  { id: 'SP-001', name: 'Panetón Clásico 900g', lote: 'L-2026-011', vence: '21/03', diasRest: '1 día', condicion: 'PRÓXIMO_VENCER', disponible: 45, precioEspecial: 12.00, estado: 'DISPONIBLE' },
  { id: 'SP-002', name: 'Keke Marmoleado 400g', lote: 'KEK-MAR-400', vence: '25/04', diasRest: '36 días', condicion: 'DEFECTO_ESTÉTICO', disponible: 60, precioEspecial: 5.50, estado: 'DISPONIBLE' },
  { id: 'SP-003', name: 'Pan de Molde Integral', lote: 'L-2026-011', vence: '21/03', diasRest: '1 día', condicion: 'PRÓXIMO_VENCER', disponible: 30, precioEspecial: 4.00, estado: 'RESERVADO' },
  { id: 'SP-004', name: 'Empanada Pollo x12', lote: 'L-2026-009', vence: '25/04', diasRest: '36 días', condicion: 'DEFECTO_ESTÉTICO', disponible: 20, precioEspecial: 8.00, estado: 'AGOTADO' },
];

type FlowStep = 'list' | 'select-client' | 'add-products' | 'confirm';

interface OrderLine {
  product: SpecialProduct;
  quantity: number;
}

const CondicionBadge = ({ condicion }: { condicion: string }) => {
  if (condicion === 'PRÓXIMO_VENCER') {
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px]">Próximo a vencer</Badge>;
  }
  return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-[10px]">Defecto estético</Badge>;
};

const EstadoBadge = ({ estado }: { estado: string }) => {
  if (estado === 'RESERVADO') return <Badge variant="outline" className="text-slate-400 border-slate-300 text-[10px]">Reservado</Badge>;
  if (estado === 'AGOTADO') return <Badge variant="outline" className="text-slate-400 border-slate-300 text-[10px]">Agotado</Badge>;
  return null;
};

const ProductsTable = ({ products, onAdd }: { products: SpecialProduct[]; onAdd?: (p: SpecialProduct) => void }) => (
  <div className="overflow-x-auto -mx-4">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs px-3">Producto</TableHead>
          <TableHead className="text-xs px-2">Lote</TableHead>
          <TableHead className="text-xs px-2">Vence</TableHead>
          <TableHead className="text-xs px-2">Días</TableHead>
          <TableHead className="text-xs px-2">Condición</TableHead>
          <TableHead className="text-xs px-2 text-right">Disp.</TableHead>
          <TableHead className="text-xs px-2 text-right">Precio</TableHead>
          {onAdd && <TableHead className="text-xs px-2"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => {
          const isUnavailable = p.estado === 'AGOTADO' || p.estado === 'RESERVADO';
          const rowBorder = p.condicion === 'PRÓXIMO_VENCER' ? 'border-l-4 border-l-amber-400 bg-amber-50/50' : 'border-l-4 border-l-orange-400 bg-orange-50/50';
          return (
            <TableRow key={p.id} className={`${rowBorder} ${isUnavailable ? 'opacity-40' : ''}`}>
              <TableCell className="text-xs font-medium px-3 py-2">
                {p.name}
                {isUnavailable && <div className="mt-0.5"><EstadoBadge estado={p.estado} /></div>}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground px-2 py-2">{p.lote}</TableCell>
              <TableCell className="text-xs text-muted-foreground px-2 py-2">{p.vence}</TableCell>
              <TableCell className="text-xs text-muted-foreground px-2 py-2">{p.diasRest}</TableCell>
              <TableCell className="px-2 py-2"><CondicionBadge condicion={p.condicion} /></TableCell>
              <TableCell className="text-xs font-medium px-2 py-2 text-right">{p.disponible}u</TableCell>
              <TableCell className="text-xs font-semibold px-2 py-2 text-right">S/{p.precioEspecial.toFixed(2)}</TableCell>
              {onAdd && (
                <TableCell className="px-2 py-2">
                  {!isUnavailable && (
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onAdd(p)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);

const VentaEspecialTab = () => {
  const { vendorName, addOrder } = useApp();
  const [flowOpen, setFlowOpen] = useState(false);
  const [step, setStep] = useState<FlowStep>('select-client');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);

  const selectedClient = mockClients.find((c) => c.id === selectedClientId);

  const total = orderLines.reduce((sum, l) => sum + l.quantity * l.product.precioEspecial, 0);

  const resetFlow = () => {
    setStep('select-client');
    setSelectedClientId(null);
    setClientSearch('');
    setOrderLines([]);
    setFlowOpen(false);
  };

  const handleAddProduct = (p: SpecialProduct) => {
    if (orderLines.find((l) => l.product.id === p.id)) return;
    setOrderLines([...orderLines, { product: p, quantity: 1 }]);
  };

  const updateQty = (id: string, delta: number) => {
    setOrderLines((lines) =>
      lines.map((l) => {
        if (l.product.id !== id) return l;
        const newQty = Math.max(0, Math.min(l.product.disponible, l.quantity + delta));
        return { ...l, quantity: newQty };
      }).filter((l) => l.quantity > 0)
    );
  };

  const handleConfirm = () => {
    if (!selectedClient) return;
    const orderId = `PED-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const newOrder: Order = {
      id: orderId,
      client: selectedClient.name,
      clientId: selectedClient.id,
      canal: selectedClient.canal,
      fechaEntrega: 'Hoy',
      total,
      status: 'PENDIENTE',
      creadoPor: vendorName,
      rutaId: selectedClient.rutaId,
      origen: 'ESPECIAL',
      products: orderLines.map((l) => ({
        product: {
          id: l.product.id,
          sku: l.product.lote,
          name: l.product.name,
          priceWithIGV: l.product.precioEspecial,
          priceWithoutIGV: l.product.precioEspecial / 1.18,
          unit: 'und',
        },
        quantity: l.quantity,
      })),
    };
    addOrder(newOrder);
    toast.success('Pedido especial enviado. Rosnelli lo verá en su bandeja.');
    resetFlow();
  };

  const filteredClients = mockClients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-foreground">Venta Especial</h1>
        <p className="text-xs text-muted-foreground">Productos con descuento aprobados por Gerencia.</p>
      </div>

      <Button className="w-full h-11 mb-4 bg-[#1E3A5F] hover:bg-[#1E3A5F]/90" onClick={() => setFlowOpen(true)}>
        <Tag className="w-4 h-4 mr-2" />
        Nuevo pedido especial
      </Button>

      {/* Available products table */}
      <ProductsTable products={mockSpecialProducts} />

      {/* Create flow sheet */}
      <Sheet open={flowOpen} onOpenChange={(open) => { if (!open) resetFlow(); }}>
        <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto p-0 rounded-t-2xl">
          {/* Step 1: Select client */}
          {step === 'select-client' && (
            <div className="p-4 pb-24">
              <SheetHeader className="mb-4">
                <div className="flex items-center gap-2">
                  <button onClick={resetFlow}><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
                  <SheetTitle className="text-base">Seleccionar cliente</SheetTitle>
                </div>
              </SheetHeader>
              <StepIndicator current={1} />
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <div className="space-y-2">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedClientId(c.id);
                      setStep('add-products');
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      selectedClientId === c.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="text-sm font-medium text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.canal} · {c.address}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Add products */}
          {step === 'add-products' && (
            <div className="p-4 pb-32">
              <SheetHeader className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setStep('select-client')}><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
                    <SheetTitle className="text-base">Agregar productos</SheetTitle>
                  </div>
                  <span className="text-xs text-muted-foreground">{selectedClient?.name}</span>
                </div>
              </SheetHeader>
              <StepIndicator current={2} />

              {/* Added products */}
              {orderLines.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Productos agregados</p>
                  {orderLines.map((line) => (
                    <div key={line.product.id} className="bg-card rounded-xl p-3 mb-2 shadow-sm border border-border">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-semibold text-foreground">{line.product.name}</span>
                        <span className="text-sm font-medium text-foreground">S/{(line.quantity * line.product.precioEspecial).toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">S/{line.product.precioEspecial.toFixed(2)} c/u</div>
                      <div className="flex items-center justify-between">
                        <button onClick={() => updateQty(line.product.id, -1)} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg font-light">−</button>
                        <span className="text-lg font-bold w-12 text-center">{line.quantity}</span>
                        <button
                          onClick={() => updateQty(line.product.id, 1)}
                          disabled={line.quantity >= line.product.disponible}
                          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg font-light disabled:opacity-40"
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Available products */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Productos disponibles</p>
              <ProductsTable
                products={mockSpecialProducts.filter((p) => !orderLines.find((l) => l.product.id === p.id))}
                onAdd={handleAddProduct}
              />

              {/* Sticky bottom */}
              <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">{orderLines.length} productos</span>
                  <span className="text-lg font-bold text-[#1E3A5F]">Total: S/{total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full h-12 rounded-xl bg-[#1E3A5F] hover:bg-[#1E3A5F]/90"
                  disabled={orderLines.length === 0}
                  onClick={() => setStep('confirm')}
                >
                  Continuar →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="p-4 pb-24">
              <SheetHeader className="mb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setStep('add-products')}><ChevronLeft className="w-5 h-5 text-muted-foreground" /></button>
                  <SheetTitle className="text-base">Confirmar pedido</SheetTitle>
                </div>
              </SheetHeader>
              <StepIndicator current={3} />

              <div className="bg-card rounded-xl p-4 border border-border mb-4">
                <div className="text-sm font-semibold text-foreground mb-1">{selectedClient?.name}</div>
                <div className="text-xs text-muted-foreground">{selectedClient?.canal} · {selectedClient?.address}</div>
              </div>

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Productos</p>
              {orderLines.map((line) => (
                <div key={line.product.id} className="flex justify-between items-center py-2 border-b border-border">
                  <div>
                    <div className="text-sm font-medium text-foreground">{line.product.name}</div>
                    <div className="text-xs text-muted-foreground">{line.quantity} × S/{line.product.precioEspecial.toFixed(2)}</div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">S/{(line.quantity * line.product.precioEspecial).toFixed(2)}</span>
                </div>
              ))}

              <div className="flex justify-between items-center mt-3 mb-4">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-lg font-bold text-[#1E3A5F]">S/{total.toFixed(2)}</span>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-amber-700">📦 Este pedido será procesado por Almacén como despacho especial.</p>
              </div>

              <Button className="w-full h-12 rounded-xl bg-[#1E3A5F] hover:bg-[#1E3A5F]/90" onClick={handleConfirm}>
                Enviar pedido especial
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

const StepIndicator = ({ current }: { current: number }) => (
  <div className="flex items-center justify-center gap-2 mb-4">
    {[
      { n: 1, label: '1. Cliente' },
      { n: 2, label: '2. Productos' },
      { n: 3, label: '3. Confirmar' },
    ].map((s) => (
      <span
        key={s.n}
        className={`rounded-full px-4 py-1 text-xs font-semibold ${
          s.n === current ? 'bg-[#1E3A5F] text-white' : 'bg-slate-100 text-slate-400'
        }`}
      >
        {s.label}
      </span>
    ))}
  </div>
);

export default VentaEspecialTab;
