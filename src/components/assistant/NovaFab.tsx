import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useNovaAssistant } from '@/hooks/useNovaAssistant';

export const NovaFab = () => {
  const { toggleOpen, isOpen } = useNovaAssistant();

  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button 
        onClick={toggleOpen}
        className="rounded-full h-14 w-14 p-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 group"
        aria-label="Open Nova Assistant"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1">
            <div className="relative">
              <div className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></div>
              <div className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></div>
            </div>
          </div>
        </div>
      </Button>
    </div>
  );
};

export default NovaFab;
