import { ChevronRight, Store, Building2, ShoppingBag, Truck } from 'lucide-react';
import { useApp, CanalType } from '@/contexts/AppContext';

const canals = [
  {
    id: 'trad-1',
    type: 'tradicional' as CanalType,
    name: 'Tradicional',
    description: 'Clientes de tu ruta asignada',
    ruta: 'LIM-01',
    clientCount: 12,
    icon: Store,
    colorClasses: 'bg-amber-50 border-l-4 border-amber-400',
  },
  {
    id: 'mod-1',
    type: 'moderno' as CanalType,
    name: 'Moderno',
    description: 'Todos los clientes del canal',
    icon: ShoppingBag,
    colorClasses: 'bg-blue-50 border-l-4 border-blue-400',
  },
];

const CanalSelection = () => {
  const { vendorName, selectCanal } = useApp();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buen día';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <h1 className="text-primary-foreground font-bold text-2xl tracking-tight">Torres SGV</h1>
          <p className="text-slate-400 text-sm mt-1">
            {getGreeting()}, {vendorName}
          </p>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-primary-foreground text-xl font-semibold leading-tight">
            ¿En qué canal trabajas hoy?
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Esta selección determina qué clientes verás.
          </p>
        </div>

        {/* Canal Cards */}
        <div className="space-y-3">
          {canals.map((canal, i) => {
            const Icon = canal.icon;
            return (
              <button
                key={canal.id}
                onClick={() =>
                  selectCanal({
                    id: canal.id,
                    type: canal.type,
                    name: canal.name,
                    description: canal.description,
                    ruta: canal.ruta,
                    clientCount: canal.clientCount,
                  })
                }
                className={`w-full ${canal.colorClasses} rounded-xl p-4 shadow-md flex items-center gap-4 text-left transition-all duration-200 hover:shadow-lg active:scale-[0.97]`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex-shrink-0">
                  <Icon className="w-6 h-6 text-slate-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{canal.name}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{canal.description}</p>
                  {canal.ruta && (
                    <span className="inline-block mt-1.5 text-[10px] bg-amber-200/60 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                      Ruta {canal.ruta} · {canal.clientCount} clientes
                    </span>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CanalSelection;
