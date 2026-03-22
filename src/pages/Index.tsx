import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import CanalSelection from './CanalSelection';
import MobileLayout, { TabId } from '@/components/MobileLayout';
import PedidosTab from '@/components/PedidosTab';
import GastosTab from '@/components/GastosTab';

const PlaceholderTab = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
    {name} — próximamente
  </div>
);

const Index = () => {
  const { selectedCanal } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('pedidos');

  if (!selectedCanal) {
    return <CanalSelection />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'pedidos':
        return <PedidosTab />;
      case 'gastos':
        return <GastosTab />;
      case 'datos':
        return <PlaceholderTab name="Mis Datos" />;
      case 'perfil':
        return <PlaceholderTab name="Perfil" />;
    }
  };

  return (
    <MobileLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTab()}
    </MobileLayout>
  );
};

export default Index;
