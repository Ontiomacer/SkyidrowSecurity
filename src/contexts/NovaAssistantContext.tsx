import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type AssistantContextType = {
  isOpen: boolean;
  isMinimized: boolean;
  toggleOpen: () => void;
  toggleMinimize: () => void;
  openAssistant: (initialMessage?: string) => void;
  closeAssistant: () => void;
};

const NovaAssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const NovaAssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | undefined>();

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  const openAssistant = useCallback((message?: string) => {
    setInitialMessage(message);
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
    setInitialMessage(undefined);
  }, []);

  return (
    <NovaAssistantContext.Provider
      value={{
        isOpen,
        isMinimized,
        toggleOpen,
        toggleMinimize,
        openAssistant,
        closeAssistant,
      }}
    >
      {children}
      {isOpen && (
        <NovaAssistant 
          onMinimize={toggleMinimize}
          onClose={closeAssistant}
          initialMessage={initialMessage}
        />
      )}
    </NovaAssistantContext.Provider>
  );
};

export const useNovaAssistant = (): AssistantContextType => {
  const context = useContext(NovaAssistantContext);
  if (context === undefined) {
    throw new Error('useNovaAssistant must be used within a NovaAssistantProvider');
  }
  return context;
};
