import React, { useState, useEffect } from 'react';
import { API_KEYS as STATIC_API_KEYS } from '@/config/apiKeys';

// Utility to mask and hash API keys for display
function maskAndHashKey(key: string | undefined | null): string {
  if (!key) return '';
  // Show first 2 and last 2 chars, mask the rest, and append a short hash
  const visibleStart = key.slice(0, 2);
  const visibleEnd = key.slice(-2);
  const masked = '*'.repeat(Math.max(0, key.length - 4));
  // Simple hash: sum char codes mod 10000 (not secure, just for display)
  const hash =
    key
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 0) % 10000;
  return `${visibleStart}${masked}${visibleEnd}  [#${hash}]`;
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Copy, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ApiKey {
  id: string;
  service: string;
  name: string;
  description: string;
  lastUsed: string | null;
  createdAt: string;
  maskedKey: string;
}

// List of all services used in the project (from API_KEYS config)
const ALL_SERVICES: { key: string; label: string; description: string }[] = [
  { key: 'VIRUS_TOTAL', label: 'VirusTotal', description: 'Malware and threat intelligence' },
  { key: 'ABUSE_IPDB', label: 'AbuseIPDB', description: 'IP reputation and abuse reports' },
  { key: 'SHODAN', label: 'Shodan', description: 'Internet of Things search engine' },
  { key: 'URLSCAN', label: 'URLScan', description: 'Website scanning and analysis' },
  { key: 'IP_API', label: 'IP-API', description: 'IP geolocation service' },
  { key: 'SERP_API', label: 'SerpAPI', description: 'Search engine results API' },
  { key: 'NVD_API', label: 'NVD', description: 'National Vulnerability Database' },
  { key: 'Guardian_API_KEY', label: 'Guardian News', description: 'Guardian news API' },
];

export const ApiKeyManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newKey, setNewKey] = useState({
    service: '',
    key: '',
    name: '',
    description: ''
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editService, setEditService] = useState<string | null>(null); // Service being edited

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      console.log('Fetching API keys from:', 'https://skyidrowsecurity.onrender.com/api/keys');
      
      const response = await fetch('https://skyidrowsecurity.onrender.com/api/keys', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include cookies if needed
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });
        throw new Error(`Failed to fetch API keys: ${response.status} ${response.statusText}`);
      }
      
      // Check if response has content before parsing as JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      console.log('API Keys fetched:', data);
      
      // Ensure we're setting an array, even if the response is null/undefined
      const keys = Array.isArray(data) ? data : [];
      console.log('Setting API keys:', keys);
      setApiKeys(keys);
    } catch (error) {
      console.error('Error in fetchApiKeys:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add or update key for a service
  const handleAddOrUpdateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.service || !newKey.key) {
      toast({
        title: 'Error',
        description: 'Service and API key are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('https://skyidrowsecurity.onrender.com/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newKey),
      });

      if (!response.ok) throw new Error('Failed to add/update API key');
      const data = await response.json();
      // Replace or add the key for this service
      setApiKeys((prev) => {
        const filtered = prev.filter(k => k.service !== newKey.service);
        return [...filtered, data];
      });
      setNewKey({ service: '', key: '', name: '', description: '' });
      setIsAdding(false);
      setEditService(null);
      toast({
        title: 'Success',
        description: 'API key saved successfully',
      });
    } catch (error) {
      console.error('Error adding API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to add API key',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) return;

    try {
      const response = await fetch(`https://skyidrowsecurity.onrender.com/api/keys/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete API key');
      
      setApiKeys(apiKeys.filter(key => key.id !== id));
      
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: 'Copied to clipboard',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Key Management</h2>
          <p className="text-muted-foreground">Manage your third-party API keys for all integrated services</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service API Keys</CardTitle>
          <CardDescription>View and manage API keys for all services used in this project</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALL_SERVICES.map((svc) => {
                  const found = apiKeys.find(k => k.service === svc.key);
                  // Always show the static key from config if present, masked
                  const staticKeyRaw = STATIC_API_KEYS[svc.key as keyof typeof STATIC_API_KEYS] || null;
                  const staticKey = staticKeyRaw ? maskAndHashKey(staticKeyRaw) : null;
                  return (
                    <TableRow key={svc.key}>
                      <TableCell className="font-medium">{svc.label}</TableCell>
                      <TableCell>{svc.description}</TableCell>
                      <TableCell>
                        {found ? (
                          <div className="flex items-center space-x-2">
                            <span className="font-mono">{maskAndHashKey(found.maskedKey)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(found.maskedKey, found.id)}
                            >
                              {copiedId === found.id ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        ) : staticKey ? (
                          <span className="font-mono text-yellow-400">{staticKey}</span>
                        ) : (
                          <span className="text-muted-foreground">No key set</span>
                        )}
                      </TableCell>
                      <TableCell>{found?.name || '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditService(svc.key);
                            setIsAdding(true);
                            setNewKey({
                              service: svc.key,
                              key: '',
                              name: found?.name || '',
                              description: found?.description || svc.description
                            });
                          }}
                        >
                          {found ? 'Change' : staticKey ? 'Override' : 'Add'}
                        </Button>
                        {found && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 ml-2"
                            onClick={() => handleDeleteKey(found.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editService ? `Set API Key for ${ALL_SERVICES.find(s => s.key === editService)?.label}` : 'Add New API Key'}</CardTitle>
            <CardDescription>Enter the details for your API key</CardDescription>
          </CardHeader>
          <form onSubmit={handleAddOrUpdateKey}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Service *</Label>
                  <Input
                    id="service"
                    value={editService || newKey.service}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Production Key"
                    value={newKey.name}
                    onChange={(e) => setNewKey({...newKey, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="key">API Key *</Label>
                <Input
                  id="key"
                  type="password"
                  placeholder="Enter your API key"
                  value={newKey.key}
                  onChange={(e) => setNewKey({...newKey, key: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Add a description for this key"
                  value={newKey.description}
                  onChange={(e) => setNewKey({...newKey, description: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setEditService(null);
                  setNewKey({ service: '', key: '', name: '', description: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save API Key</Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ApiKeyManager;
