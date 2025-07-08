
import React from 'react';
import { TerminalConnection } from '@/utils/terminalCommands';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertCircle } from 'lucide-react';

interface TerminalConnectionsProps {
  connections: TerminalConnection[];
  activeConnection: TerminalConnection | null;
  onSelectConnection: (connection: TerminalConnection) => void;
}

const TerminalConnections: React.FC<TerminalConnectionsProps> = ({
  connections,
  activeConnection,
  onSelectConnection
}) => {
  if (connections.length === 0) {
    return (
      <div className="h-full p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-md">
        <div className="text-gray-300 font-semibold mb-2">Connection Status</div>
        <div className="bg-gray-900 rounded-md p-4 border border-gray-700">
          <div className="text-gray-300 text-center py-2">No active connections</div>
          <div className="text-gray-500 text-xs text-center">Type 'connect [host]' or 'ssh user@host' to establish a connection</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-md">
      <div className="bg-gray-700 p-2 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-200">Active Connections</h3>
        <Badge variant="outline" className="text-xs bg-blue-900 text-blue-100">
          {connections.length} {connections.length === 1 ? 'connection' : 'connections'}
        </Badge>
      </div>
      <div className="max-h-full overflow-y-auto">
        {connections.map(connection => (
          <div 
            key={connection.id}
            className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors ${
              activeConnection?.id === connection.id ? 'bg-gray-700' : ''
            }`}
            onClick={() => onSelectConnection(connection)}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-mono text-gray-300">
                {connection.username ? `${connection.username}@${connection.host}` : connection.host}
                {connection.port && connection.port !== 22 && `:${connection.port}`}
              </div>
              <Badge 
                className={`text-xs ${
                  connection.status === 'connected' ? 'bg-green-700 text-green-100' : 
                  connection.status === 'connecting' ? 'bg-yellow-700 text-yellow-100' : 'bg-red-700 text-red-100'
                }`}
              >
                {connection.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                {connection.type === 'ssh' && connection.encrypted && (
                  <Shield className="h-3 w-3 text-green-500" />
                )}
                {connection.type === 'agent' && (
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                )}
                <span>{connection.type.toUpperCase()}</span>
              </div>
              {connection.lastConnected && (
                <div className="text-xs text-gray-500">
                  {connection.lastConnected.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TerminalConnections;
