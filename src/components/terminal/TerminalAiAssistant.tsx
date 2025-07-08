
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AiSuggestion } from '@/utils/terminalCommands';
import { Search, Zap, ZapOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TerminalAiAssistantProps {
  onSuggestionSelect: (command: string) => void;
  suggestions: AiSuggestion[];
  aiEnabled?: boolean;
  onToggleAi?: () => void;
}

const TerminalAiAssistant: React.FC<TerminalAiAssistantProps> = ({
  onSuggestionSelect,
  suggestions,
  aiEnabled = true,
  onToggleAi
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredSuggestions = searchTerm 
    ? suggestions.filter(s => 
        s.command.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : suggestions;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-md overflow-hidden shadow-lg">
      <div 
        className="bg-gray-700 p-2 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-200">AI Assistant</h3>
          <Badge variant="outline" className={aiEnabled ? "bg-blue-900 text-blue-200 border-blue-700" : "bg-gray-700 text-gray-400 border-gray-600"}>
            {aiEnabled ? "Active" : "Disabled"}
          </Badge>
        </div>
        <span className="text-xs text-gray-400">{isExpanded ? 'Hide' : 'Show'}</span>
      </div>
      
      {isExpanded && (
        <div className="p-2 space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search commands..."
              className="w-full pl-8 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded text-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <div key={index} className="bg-gray-700 p-1.5 rounded hover:bg-gray-600 transition-colors">
                  <div 
                    className="cursor-pointer" 
                    onClick={() => onSuggestionSelect(suggestion.command)}
                  >
                    <div className="text-sm font-mono text-blue-400">{suggestion.command}</div>
                    <div className="text-xs text-gray-400">{suggestion.description}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-3 text-sm text-gray-500">
                No matching commands found
              </div>
            )}
          </div>
          
          <div className="pt-1 border-t border-gray-700 flex flex-col space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs bg-blue-900 hover:bg-blue-800 border-blue-700"
              onClick={() => onSuggestionSelect('ai-assist')}
            >
              Show All AI Commands
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={`w-full text-xs ${
                aiEnabled ? 'bg-red-900 hover:bg-red-800 border-red-700' : 'bg-green-900 hover:bg-green-800 border-green-700'
              }`}
              onClick={onToggleAi}
            >
              {aiEnabled ? (
                <>
                  <ZapOff className="mr-1 h-3.5 w-3.5" />
                  Disable AI Assistant
                </>
              ) : (
                <>
                  <Zap className="mr-1 h-3.5 w-3.5" />
                  Enable AI Assistant
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalAiAssistant;
