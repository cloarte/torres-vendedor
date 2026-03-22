import { useState } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
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

const PerfilTab = () => {
  const { vendorName, selectedCanal, clearCanal, offlineQueue } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const initials = vendorName.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const pendingCount = offlineQueue.length;

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success('Sincronización completada');
    }, 1500);
  };

  return (
    <div className="pb-16 flex flex-col items-center">
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mt-2 mb-3">
        <span className="text-primary-foreground text-2xl font-bold">{initials}</span>
      </div>

      <h2 className="text-xl font-semibold text-foreground">{vendorName}</h2>

      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
          VENDEDOR
        </span>
        {selectedCanal && (
          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
            {selectedCanal.name}
          </span>
        )}
      </div>

      {/* Change canal */}
      <button
        onClick={clearCanal}
        className="mt-5 w-full h-11 border border-border rounded-xl text-sm font-medium text-foreground active:scale-[0.97] transition-transform"
      >
        Cambiar canal
      </button>

      {/* Settings */}
      <div className="w-full mt-6 bg-card rounded-xl shadow-sm divide-y divide-border">
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-foreground">Notificaciones</span>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-foreground">Sincronización manual</span>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="text-xs font-medium text-primary active:scale-95 transition-transform disabled:opacity-50"
          >
            {syncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              'Sincronizar'
            )}
          </button>
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm text-foreground">Versión de la app</span>
          <span className="text-xs text-muted-foreground">v1.0.0</span>
        </div>
      </div>

      {/* Sync status */}
      {pendingCount > 0 && (
        <div className="w-full mt-4 bg-amber-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CloudOff className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {pendingCount} elementos pendientes de sincronización
            </span>
          </div>
          <button
            onClick={handleSync}
            className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-medium active:scale-95 transition-transform"
          >
            Sincronizar ahora
          </button>
          <p className="text-[10px] text-amber-600 mt-2">
            La sincronización es automática al recuperar conexión
          </p>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={() => setShowLogout(true)}
        className="mt-8 text-sm text-red-600 font-medium active:scale-95 transition-transform"
      >
        Cerrar sesión
      </button>

      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent className="max-w-[340px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Los cambios sin sincronizar se perderán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                clearCanal();
                toast.success('Sesión cerrada');
              }}
            >
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PerfilTab;
