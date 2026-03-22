import { useState } from 'react';
import { Camera, X, CloudOff } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type GastoTipo = 'COMBUSTIBLE' | 'PEAJE' | 'DESCARGA' | 'VIATICO' | 'OTRO';

export interface NuevoGastoData {
  id: string;
  tipo: GastoTipo;
  monto: number;
  descripcion: string;
  fecha: string;
  hasPhoto: boolean;
  syncPending?: boolean;
}

const tipoOptions: { value: GastoTipo; label: string }[] = [
  { value: 'COMBUSTIBLE', label: 'Combustible' },
  { value: 'PEAJE', label: 'Peaje' },
  { value: 'DESCARGA', label: 'Descarga' },
  { value: 'VIATICO', label: 'Viático' },
  { value: 'OTRO', label: 'Otro' },
];

const photoRecommendedTypes: GastoTipo[] = ['COMBUSTIBLE', 'PEAJE'];

interface NuevoGastoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (gasto: NuevoGastoData) => void;
}

const NuevoGastoSheet = ({ open, onOpenChange, onSave }: NuevoGastoSheetProps) => {
  const { isOnline } = useApp();

  const [tipo, setTipo] = useState<GastoTipo>('COMBUSTIBLE');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState<Date>(new Date());
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const isDescRequired = tipo === 'OTRO';
  const showPhotoHint = photoRecommendedTypes.includes(tipo);
  const montoNum = parseFloat(monto) || 0;
  const isValid = montoNum > 0 && (!isDescRequired || descripcion.trim().length > 0);

  const resetForm = () => {
    setTipo('COMBUSTIBLE');
    setMonto('');
    setDescripcion('');
    setFecha(new Date());
    setHasPhoto(false);
    setPhotoPreview(null);
  };

  const handleSave = () => {
    if (!isValid) return;

    const gasto: NuevoGastoData = {
      id: `G-${Date.now()}`,
      tipo,
      monto: montoNum,
      descripcion: descripcion.trim() || tipoOptions.find((t) => t.value === tipo)?.label || '',
      fecha: format(fecha, 'dd/MM/yyyy'),
      hasPhoto,
      syncPending: !isOnline,
    };

    onSave(gasto);

    if (isOnline) {
      toast.success('Gasto registrado');
    } else {
      toast('Gasto guardado localmente. Se enviará al recuperar señal.', {
        icon: '📱',
        style: { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' },
      });
    }

    resetForm();
    onOpenChange(false);
  };

  const handlePhotoAttach = () => {
    // Simulate photo attachment
    setHasPhoto(true);
    setPhotoPreview('/placeholder.svg');
  };

  return (
    <Sheet open={open} onOpenChange={(val) => { if (!val) resetForm(); onOpenChange(val); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-3">
          <SheetTitle className="text-base">Registrar Gasto</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 pb-4">
          {/* 1. Tipo de gasto */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Tipo de gasto <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {tipoOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTipo(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-150 active:scale-95',
                    tipo === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Monto */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Monto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground font-medium">
                S/
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                className="w-full h-14 pl-14 pr-4 rounded-xl border border-border bg-card text-2xl font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 tabular-nums"
              />
            </div>
          </div>

          {/* 3. Descripción */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Descripción {isDescRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Combustible en Estación Pecsa km 42"
              className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* 4. Foto */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Foto del comprobante
            </label>
            {!hasPhoto ? (
              <>
                <button
                  type="button"
                  onClick={handlePhotoAttach}
                  className="w-full h-11 border border-border rounded-xl flex items-center justify-center gap-2 text-sm text-muted-foreground active:scale-[0.98] transition-transform"
                >
                  <Camera className="w-4 h-4" />
                  Adjuntar foto
                </button>
                {showPhotoHint && (
                  <p className="text-xs text-amber-600 mt-1.5">📷 Recomendado para este tipo de gasto</p>
                )}
              </>
            ) : (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                <img src={photoPreview || ''} alt="Comprobante" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setHasPhoto(false); setPhotoPreview(null); }}
                  className="absolute top-1 right-1 w-6 h-6 bg-foreground/70 text-background rounded-full flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 5. Fecha */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Fecha del gasto</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full h-11 px-3 rounded-xl border border-border bg-card text-left text-sm flex items-center justify-between text-foreground">
                  {format(fecha, "dd 'de' MMMM, yyyy", { locale: es })}
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={(d) => d && setFecha(d)}
                  disabled={(d) => d > new Date()}
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Offline indicator */}
          {!isOnline && (
            <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-2.5">
              <CloudOff className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-600">
                Sin conexión — el gasto se guardará localmente y se enviará al recuperar señal.
              </p>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={cn(
              'w-full h-12 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]',
              isValid
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            Guardar gasto
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NuevoGastoSheet;
