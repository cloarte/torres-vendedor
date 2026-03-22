import { useState, useMemo } from 'react';
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type GastoTipo = 'COMBUSTIBLE' | 'PEAJE' | 'DESCARGA' | 'VIATICO' | 'OTRO';

interface Gasto {
  id: string;
  tipo: GastoTipo;
  monto: number;
  descripcion: string;
  fecha: string;
  hasPhoto: boolean;
  syncPending?: boolean;
}

const tipoBadge: Record<GastoTipo, { bg: string; text: string; label: string }> = {
  COMBUSTIBLE: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Combustible' },
  PEAJE: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Peaje' },
  DESCARGA: { bg: 'bg-sky-100', text: 'text-sky-700', label: 'Descarga' },
  VIATICO: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Viático' },
  OTRO: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Otro' },
};

interface EnviarLoteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borradores: Gasto[];
  onSend: (sentIds: string[], loteTotal: number) => void;
}

const EnviarLoteSheet = ({ open, onOpenChange, borradores, onSend }: EnviarLoteSheetProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(borradores.map((g) => g.id)));
  const [showConfirm, setShowConfirm] = useState(false);

  // Reset selections when sheet opens
  const handleOpenChange = (val: boolean) => {
    if (val) {
      setSelectedIds(new Set(borradores.map((g) => g.id)));
    }
    onOpenChange(val);
  };

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedGastos = useMemo(
    () => borradores.filter((g) => selectedIds.has(g.id)),
    [borradores, selectedIds]
  );

  const total = selectedGastos.reduce((sum, g) => sum + g.monto, 0);
  const hasExcluded = selectedIds.size < borradores.length;
  const periodo = borradores.length > 0
    ? `${borradores[borradores.length - 1].fecha} — ${borradores[0].fecha}`
    : '';

  const handleConfirmSend = () => {
    setShowConfirm(false);
    onSend(Array.from(selectedIds), total);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] flex flex-col">
          <SheetHeader className="pb-3 flex-shrink-0">
            <SheetTitle className="text-base">Enviar gastos a aprobación</SheetTitle>
          </SheetHeader>

          {/* Summary */}
          <div className="bg-secondary rounded-xl p-4 mb-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Gastos a incluir</span>
              <span className="text-sm font-semibold text-foreground">{selectedIds.size}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Total del lote</span>
              <span className="text-sm font-bold text-foreground tabular-nums">S/{total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Período</span>
              <span className="text-xs text-muted-foreground">{periodo}</span>
            </div>
          </div>

          {/* Gastos list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 mb-4">
            {borradores.map((gasto) => {
              const t = tipoBadge[gasto.tipo];
              const checked = selectedIds.has(gasto.id);
              return (
                <div
                  key={gasto.id}
                  className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => toggleId(gasto.id)}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleId(gasto.id)}
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.bg} ${t.text}`}>
                        {t.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-foreground tabular-nums">S/{gasto.monto.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">{gasto.fecha}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info box */}
          {hasExcluded && (
            <div className="bg-amber-50 rounded-lg p-2.5 flex items-start gap-2 mb-4 flex-shrink-0">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Los gastos no incluidos permanecerán en BORRADOR para el siguiente lote.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 flex-shrink-0 pb-2">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl text-sm font-medium text-muted-foreground active:scale-[0.97] transition-transform"
            >
              ← Cancelar
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={selectedIds.size === 0}
              className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl text-sm font-semibold active:scale-[0.97] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar lote
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-[340px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">¿Enviar S/{total.toFixed(2)} a aprobación?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              El Aprobador revisará tu lote. No podrás modificar estos gastos hasta que sean aprobados o devueltos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl bg-primary" onClick={handleConfirmSend}>
              Enviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EnviarLoteSheet;
