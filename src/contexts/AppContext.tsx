import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, mockOrders } from '@/data/mockData';

export type CanalType = 'tradicional' | 'moderno' | 'corporativo' | 'directa';

interface Canal {
  id: string;
  type: CanalType;
  name: string;
  description: string;
  ruta?: string;
  clientCount?: number;
}

interface AppState {
  selectedCanal: Canal | null;
  vendorName: string;
  isOnline: boolean;
  offlineQueue: any[];
  orders: Order[];
}

interface AppContextType extends AppState {
  selectCanal: (canal: Canal) => void;
  clearCanal: () => void;
  addOrder: (order: Order) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCanal, setSelectedCanal] = useState<Canal | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const addOrder = (order: Order) => setOrders((prev) => [order, ...prev]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedCanal,
        vendorName: 'Juan López',
        isOnline,
        offlineQueue,
        orders,
        selectCanal: setSelectedCanal,
        clearCanal: () => setSelectedCanal(null),
        addOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
