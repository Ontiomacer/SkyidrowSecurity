import { useCallback } from 'react';
import { useNovaAssistant as useNovaAssistantContext } from '@/contexts/NovaAssistantContext';

export const useNovaAssistant = () => {
  const { 
    isOpen, 
    isMinimized, 
    toggleOpen, 
    toggleMinimize, 
    openAssistant, 
    closeAssistant 
  } = useNovaAssistantContext();

  // Show a notification in the assistant
  const showNotification = useCallback((message: string, options: {
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
    actions?: { label: string; onClick: () => void }[];
  } = {}) => {
    // This would be implemented to show a notification in the assistant UI
    console.log(`[Nova Assistant] ${message}`, options);
    
    // For now, we'll just open the assistant with the message
    openAssistant(message);
  }, [openAssistant]);

  // Start a guided workflow
  const startWorkflow = useCallback((workflowName: string, initialData?: any) => {
    console.log(`[Nova Assistant] Starting workflow: ${workflowName}`, initialData);
    openAssistant(`Let's get started with the ${workflowName} workflow.`);
  }, [openAssistant]);

  // Quick actions
  const quickActions = {
    startScan: (target?: string) => {
      const message = target 
        ? `Starting a security scan for ${target}...` 
        : 'Starting a new security scan...';
      openAssistant(message);
      // Here you would trigger the actual scan
    },
    showApiKeys: () => {
      openAssistant('Here are your API keys:');
      // Here you would navigate to the API keys section
    },
    showReports: () => {
      openAssistant('Here are your recent reports:');
      // Here you would navigate to the reports section
    },
  };

  return {
    // State
    isOpen,
    isMinimized,
    
    // Actions
    toggleOpen,
    toggleMinimize,
    openAssistant,
    closeAssistant,
    showNotification,
    startWorkflow,
    
    // Quick actions
    quickActions,
    
    // Shortcuts
    show: openAssistant,
    hide: closeAssistant,
  };
};

export default useNovaAssistant;
