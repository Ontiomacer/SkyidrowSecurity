
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { generateMockReport, downloadReport, ReportData } from '@/services/ReportService';
import { Loader2, FileText, Download, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface ReportBotProps {
  sourceType?: 'simulation' | 'hunt' | 'alert';
  sourceName?: string;
  onClose?: () => void;
}

const ReportBot: React.FC<ReportBotProps> = ({ 
  sourceType = 'simulation', 
  sourceName = 'Security Event',
  onClose 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<ReportData | null>(null);
  const [activeTab, setActiveTab] = useState('report');
  const [email, setEmail] = useState('');

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 200);
    
    try {
      const reportData = await generateMockReport(sourceType, sourceName);
      setReport(reportData);
      setProgress(100);
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast({
        title: "Report generation failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = () => {
    if (report) {
      downloadReport(report);
    }
  };

  const handleSendEmail = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the report to.",
        variant: "destructive",
      });
      return;
    }
    
    if (report) {
      toast({
        title: "Report Sent",
        description: `Report has been sent to ${email}`,
      });
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 shadow-lg">
      <CardHeader className="bg-gray-700 rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-white">
            ReportBot AI
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              ✕
            </Button>
          )}
        </div>
        <CardDescription className="text-gray-400">
          AI-Powered Security Report Generator
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {!report ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-300">
              <p>ReportBot will analyze {sourceName} data and generate a comprehensive security report including:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Detailed findings summary</li>
                <li>MITRE ATT&CK mapping</li>
                <li>Affected systems analysis</li>
                <li>Remediation recommendations</li>
                <li>Compliance impact assessment</li>
              </ul>
            </div>
            
            {isGenerating ? (
              <div className="space-y-4">
                <div className="text-center text-sm text-gray-400">
                  Generating your report... {progress}%
                </div>
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-gray-500">
                  {progress < 30 && "Collecting log data..."}
                  {progress >= 30 && progress < 60 && "Analyzing patterns..."}
                  {progress >= 60 && progress < 90 && "Generating recommendations..."}
                  {progress >= 90 && "Finalizing report..."}
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleGenerateReport} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            )}
          </div>
        ) : (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="report">Report</TabsTrigger>
                <TabsTrigger value="share">Share</TabsTrigger>
              </TabsList>
              
              <TabsContent value="report" className="mt-4">
                <div className="max-h-60 overflow-y-auto p-2 space-y-4">
                  <div>
                    <h3 className="font-semibold text-white">{report.title}</h3>
                    <p className="text-xs text-gray-400">Generated on: {report.timestamp.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">Summary</h4>
                    <p className="text-sm text-gray-400">{report.summary}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">Key Findings</h4>
                    <ul className="text-sm text-gray-400 mt-1 space-y-2">
                      {report.findings.map(finding => (
                        <li key={finding.id} className="border-l-2 pl-2 border-blue-500">
                          <span className={`text-xs font-medium rounded px-1 mr-1
                            ${finding.severity === 'Critical' ? 'bg-red-900 text-red-200' : 
                              finding.severity === 'High' ? 'bg-orange-900 text-orange-200' :
                              finding.severity === 'Medium' ? 'bg-yellow-900 text-yellow-200' : 
                              'bg-green-900 text-green-200'}`}>
                            {finding.severity}
                          </span>
                          <span className="font-medium">{finding.title}</span>
                          <p className="text-xs text-gray-500 mt-1">{finding.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">MITRE ATT&CK Tactics</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {report.mitreTactics.map(tactic => (
                        <span key={tactic} className="bg-gray-700 text-xs rounded px-2 py-1">
                          {tactic}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">Risk Assessment</h4>
                    <div className="mt-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Score: {report.riskScore}/100</span>
                        <span className={`
                          ${report.riskScore > 75 ? 'text-red-400' : 
                            report.riskScore > 50 ? 'text-yellow-400' : 
                            'text-green-400'}
                        `}>
                          {report.riskScore > 75 ? 'High Risk' : 
                            report.riskScore > 50 ? 'Medium Risk' : 
                            'Low Risk'}
                        </span>
                      </div>
                      <Progress 
                        value={report.riskScore} 
                        className="h-2" 
                        indicatorClassName={
                          report.riskScore > 75 ? "bg-red-500" : 
                          report.riskScore > 50 ? "bg-yellow-500" : 
                          "bg-green-500"
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleDownloadReport} 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Full Report
                </Button>
              </TabsContent>
              
              <TabsContent value="share" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Email Report</label>
                    <div className="flex gap-2">
                      <Input 
                        type="email" 
                        placeholder="Enter email address" 
                        className="bg-gray-700 border-gray-600"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button 
                        onClick={handleSendEmail}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Compliance Tags</label>
                    <div className="p-2 bg-gray-700 rounded text-xs">
                      {report.complianceTags.map((tag, index) => (
                        <div key={index} className="mb-2 last:mb-0">
                          <div className="flex justify-between">
                            <span className="font-medium text-blue-300">{tag.standard}</span>
                            <span className="text-gray-400">{tag.control}</span>
                          </div>
                          <p className="text-gray-400 mt-1">{tag.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-700 rounded-b-lg text-xs text-gray-400 justify-center">
        Powered by Skyidrow AI • Analysis based on {sourceType} data
      </CardFooter>
    </Card>
  );
};

export default ReportBot;
