
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IOCCorrelationEngine from './IOCCorrelationEngine';
import { IOCCorrelation } from './IOCCorrelation';

const EnhancedIOCCorrelation: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced IOC Correlation Platform</CardTitle>
          <CardDescription>
            Choose between AI-powered correlation engine or traditional correlation methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ai-engine" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai-engine">AI Correlation Engine</TabsTrigger>
              <TabsTrigger value="traditional">Traditional Method</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai-engine">
              <IOCCorrelationEngine />
            </TabsContent>
            
            <TabsContent value="traditional">
              <IOCCorrelation />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedIOCCorrelation;
