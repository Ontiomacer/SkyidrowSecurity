import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface ApiStatus {
  key: string;
  label: string;
  ok: boolean;
  status?: number;
  error?: string;
  latency: number;
  checkedAt: string;
}

export const ApiMonitor: React.FC = () => {
  const [statuses, setStatuses] = useState<ApiStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5001/api/monitor');
      if (!res.ok) throw new Error('Failed to fetch API status');
      const data = await res.json();
      setStatuses(data.statuses);
      setLastChecked(data.checkedAt);
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>API Service Monitoring</CardTitle>
        <div className="flex items-center gap-4 mt-2">
          <Button size="sm" onClick={fetchStatus} disabled={loading}>
            {loading ? 'Checking...' : 'Re-check'}
          </Button>
          {lastChecked && (
            <span className="text-xs text-muted-foreground">Last checked: {new Date(lastChecked).toLocaleTimeString()}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Latency (ms)</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.map((svc) => (
              <TableRow key={svc.key}>
                <TableCell>{svc.label}</TableCell>
                <TableCell>
                  {svc.ok ? (
                    <span className="text-green-600 font-semibold">Online</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Error</span>
                  )}
                  {svc.status && (
                    <span className="ml-2 text-xs text-muted-foreground">({svc.status})</span>
                  )}
                </TableCell>
                <TableCell>{svc.latency}</TableCell>
                <TableCell className="text-xs text-red-500">{svc.error || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ApiMonitor;
