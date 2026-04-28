import { ReactNode } from 'react';
import { ClipboardList, Receipt, BarChart2, User, WifiOff, Tag } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import StockFlotantePill from './StockFlotantePill';

export type TabId = 'pedidos' | 'gastos' | 'venta-especial' | 'datos' | 'perfil';

interface MobileLayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: ReactNode;
}

const tabs: { id: TabId; label: string; icon: typeof ClipboardList }[] = [
  { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
  { id: 'gastos', label: 'Gastos', icon: Receipt },
  { id: 'venta-especial', label: 'Vta. Esp.', icon: Tag },
  { id: 'datos', label: 'Mis Datos', icon: BarChart2 },
  { id: 'perfil', label: 'Perfil', icon: User },
];

const tabTitles: Record<TabId, string> = {
  pedidos: 'Pedidos',
  gastos: 'Gastos',
  'venta-especial': 'Venta Especial',
  datos: 'Mis Datos',
  perfil: 'Perfil',
};

const canalBadgeColors: Record<string, string> = {
  tradicional: 'bg-amber-400/20 text-amber-100',
  moderno: 'bg-blue-400/20 text-blue-100',
  corporativo: 'bg-purple-400/20 text-purple-100',
  directa: 'bg-green-400/20 text-green-100',
};

const MobileLayout = ({ activeTab, onTabChange, children }: MobileLayoutProps) => {
  const { vendorName, selectedCanal, isOnline } = useApp();

  const initials = vendorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-12 bg-primary flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-primary-foreground font-semibold text-base">
            {tabTitles[activeTab]}
          </span>
          {selectedCanal && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                canalBadgeColors[selectedCanal.type] || 'bg-white/20 text-white'
              }`}
            >
              {selectedCanal.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'pedidos' && <StockFlotantePill />}
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-semibold">{initials}</span>
          </div>
        </div>
      </header>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-50 border-b border-amber-200 py-1 px-4 flex items-center gap-2 flex-shrink-0">
          <WifiOff className="w-3 h-3 text-amber-700" />
          <span className="text-amber-700 text-xs">
            Sin conexión — los cambios se guardarán localmente
          </span>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto scrollable-content p-4">{children}</main>

      {/* Bottom Navigation */}
      <nav className="h-16 bg-card border-t border-border flex items-center justify-around flex-shrink-0 safe-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-colors duration-150 active:scale-95 ${
                isActive ? 'text-primary' : 'text-slate-400'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileLayout;
