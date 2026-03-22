import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, AlertTriangle, Fuel, CircleDollarSign, UtensilsCrossed, Trash2 } from 'lucide-react';
import FloatingActionButton from './FloatingActionButton';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type GastoTipo = 'COMBUSTIBLE' | 'PEAJE' | 'VIATICO' | 'OTRO';
type LoteStatus = 'ENVIADO' | 'APROBADO' | 'DEVUELTO';

interface Gasto {
  id: string;
  tipo: GastoTipo;
  monto: number;
  descripcion: string;
  fecha: string;
  hasPhoto: boolean;
}

interface Lote {
  id: string;
  status: LoteStatus;
  periodo: string;
  total: number;
  gastoCount: number;
  motivoDevolucion?: string;
}

const tipoConfig: Record<GastoTipo, { bg: string; text: string; label: string; icon: typeof Fuel }> = {
  COMBUSTIBLE: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Combustible', icon: Fuel },
  PEAJE: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Peaje', icon: CircleDollarSign },
  VIATICO: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Viático', icon: UtensilsCrossed },
  OTRO: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Otro', icon: CircleDollarSign },
};

const loteStatusConfig: Record<LoteStatus, { bg: string; text: string; label: string }> = {
  ENVIADO: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'En revisión' },
  APROBADO: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprobado' },
  DEVUELTO: { bg: 'bg-red-100', text: 'text-red-700', label: 'Devuelto' },
};

const mockLotes: Lote[] = [
  { id: 'LOT-001', status: 'APROBADO', periodo: '15/03 — 19/03', total: 520, gastoCount: 5 },
];

const initialBorradores: Gasto[] = [
  { id: 'G-001', tipo: 'COMBUSTIBLE', monto: 180.00, descripcion: 'Carga de combustible', fecha: 'Hoy', hasPhoto: true },
  { id: 'G-002', tipo: 'PEAJE', monto: 12.50, descripcion: 'Peaje Panamericana Norte', fecha: 'Hoy', hasPhoto: false },
  { id: 'G-003', tipo: 'VIATICO', monto: 45.00, descripcion: 'Almuerzo en ruta', fecha: 'Hoy', hasPhoto: false },
];

const GastosTab = () => {
  const navigate = useNavigate();
  const [borradores, setBorradores] = useState<Gasto[]>(initialBorradores);
  const [selectedGasto, setSelectedGasto] = useState<Gasto | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const totalBorrador = borradores.reduce((sum, g) => sum + g.monto, 0);
  const hasDevuelto = mockLotes.some((l) => l.status === 'DEVUELTO');

  const handleDelete = (id: string) => {
    setBorradores((prev) => prev.filter((g) => g.id !== id));
    setSwipedId(null);
    toast.success('Gasto eliminado');
  };

  return (
    <div className="pb-16">
      {/* Status Card */}
      <div className="bg-card rounded-xl p-4 shadow-sm mb-5 animate-fade-in-up">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Período actual</span>
          <span className="text-xs text-muted-foreground">17/03 — 22/03</span>
        </div>
        <p className="text-2xl font-bold text-foreground mt-1">
          S/ {totalBorrador.toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {borradores.length} gastos registrados
        </p>

        {hasDevuelto && (
          <div className="mt-3 bg-amber-50 rounded-lg p-2.5 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-amber-800 font-medium">Tienes un lote devuelto. Corrígelo y reenvía.</p>
              <button className="text-xs text-amber-700 font-semibold mt-1 active:scale-95 transition-transform">
                Ver lote devuelto →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lotes Section */}
      {mockLotes.length > 0 && (
        <div className="mb-5 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <h2 className="text-sm font-semibold text-foreground mb-2">Lotes enviados</h2>
          <div className="space-y-2">
            {mockLotes.map((lote) => {
              const st = loteStatusConfig[lote.status];
              return (
                <div key={lote.id} className="bg-card rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{lote.periodo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">S/{lote.total.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">{lote.gastoCount} gastos</span>
                  </div>
                  {lote.status === 'APROBADO' && (
                    <p className="text-[10px] text-green-600 mt-1.5">Aprobado — se descontará en liquidación</p>
                  )}
                  {lote.status === 'DEVUELTO' && (
                    <div className="mt-2">
                      <p className="text-[10px] text-red-600 mb-2 truncate">
                        Devuelto: {lote.motivoDevolucion || 'Sin motivo especificado'}
                      </p>
                      <div className="flex gap-2">
                        <button className="flex-1 h-8 border border-red-200 text-red-600 rounded-lg text-xs font-medium active:scale-95 transition-transform">
                          Corregir gastos
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="flex-1 h-8 bg-primary text-primary-foreground rounded-lg text-xs font-medium active:scale-95 transition-transform">
                              Reenviar lote
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[340px] rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-base">¿Reenviar lote?</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm">
                                El lote será enviado nuevamente a aprobación.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="rounded-xl bg-primary"
                                onClick={() => toast.success('Lote reenviado')}
                              >
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Borrador Section */}
      <div className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">Gastos en borrador</h2>
          {borradores.length > 0 && (
            <button
              onClick={() => toast.info('Enviar a aprobación — próximamente')}
              className="text-xs font-semibold text-primary active:scale-95 transition-transform"
            >
              Enviar a aprobación →
            </button>
          )}
        </div>

        <div className="space-y-2">
          {borradores.map((gasto) => {
            const tipo = tipoConfig[gasto.tipo];
            const TipoIcon = tipo.icon;
            const isSwiped = swipedId === gasto.id;

            return (
              <div key={gasto.id} className="relative overflow-hidden rounded-xl">
                {/* Delete action behind */}
                <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center rounded-r-xl">
                  <button
                    onClick={() => handleDelete(gasto.id)}
                    className="flex flex-col items-center gap-0.5 text-white"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="text-[10px]">Borrar</span>
                  </button>
                </div>

                {/* Card */}
                <div
                  className={`bg-card p-4 shadow-sm relative z-10 transition-transform duration-200 cursor-pointer active:scale-[0.98] ${
                    isSwiped ? '-translate-x-20' : 'translate-x-0'
                  }`}
                  onClick={() => {
                    if (isSwiped) {
                      setSwipedId(null);
                    } else {
                      setSelectedGasto(gasto);
                    }
                  }}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    (e.currentTarget as any)._startX = touch.clientX;
                  }}
                  onTouchEnd={(e) => {
                    const touch = e.changedTouches[0];
                    const startX = (e.currentTarget as any)._startX;
                    if (startX && startX - touch.clientX > 60) {
                      setSwipedId(gasto.id);
                    } else if (touch.clientX - startX > 30) {
                      setSwipedId(null);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <TipoIcon className={`w-3.5 h-3.5 ${tipo.text}`} />
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tipo.bg} ${tipo.text}`}>
                        {tipo.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground tabular-nums">
                      S/{gasto.monto.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{gasto.descripcion}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{gasto.fecha}</span>
                    {gasto.hasPhoto && <Camera className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                </div>
              </div>
            );
          })}

          {borradores.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No tienes gastos en borrador.
            </div>
          )}
        </div>
      </div>

      <FloatingActionButton
        onClick={() => toast.info('Nuevo gasto — próximamente')}
        label="Nuevo Gasto"
      />

      {/* Gasto Detail Sheet */}
      <Sheet open={!!selectedGasto} onOpenChange={(open) => !open && setSelectedGasto(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
          {selectedGasto && (() => {
            const tipo = tipoConfig[selectedGasto.tipo];
            return (
              <>
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-base">Detalle de gasto</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 pb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tipo</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${tipo.bg} ${tipo.text}`}>
                      {tipo.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monto</span>
                    <span className="text-sm font-bold text-foreground">S/{selectedGasto.monto.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Descripción</span>
                    <span className="text-sm text-foreground text-right max-w-[200px]">{selectedGasto.descripcion}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fecha</span>
                    <span className="text-sm text-foreground">{selectedGasto.fecha}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Foto adjunta</span>
                    <span className="text-sm text-foreground">{selectedGasto.hasPhoto ? 'Sí' : 'No'}</span>
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

export default GastosTab;
