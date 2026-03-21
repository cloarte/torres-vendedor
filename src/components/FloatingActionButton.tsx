import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  label?: string;
}

const FloatingActionButton = ({ onClick, label }: FABProps) => (
  <button
    onClick={onClick}
    aria-label={label || 'Nuevo'}
    className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-transform duration-150 hover:shadow-xl active:scale-95 z-30"
  >
    <Plus className="w-6 h-6" />
  </button>
);

export default FloatingActionButton;
