
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { FileText, AlertTriangle, Upload, ChevronRight, ChevronLeft, X, Play } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ReportBot from '@/components/report/ReportBot';

type ThreatType = 'phishing' | 'malware' | 'insider' | 'unknown';
type SourceType = 'email' | 'endpoint' | 'server' | 'firewall' | 'other';
type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

interface FormData {
  title: string;
  threatType: ThreatType;
  source: SourceType;
  sourceDetails: string;
  artifacts: File[];
  severity: SeverityLevel;
  description: string;
  tags: string[];
}

interface CaseBuilderWizardProps {
  onClose: () => void;
}

const CaseBuilderWizard: React.FC<CaseBuilderWizardProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    threatType: 'unknown',
    source: 'email',
    sourceDetails: '',
    artifacts: [],
    severity: 'Medium',
    description: '',
    tags: [],
  });

  // Simulated progress steps for analysis
  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress with different messages
    const messages = [
      "Initializing threat analysis...",
      "Scanning for indicators of compromise...",
      "Correlating with known threat intelligence...",
      "Mapping to MITRE ATT&CK framework...",
      "Identifying affected systems and assets...",
      "Generating remediation recommendations...",
      "Calculating risk score and compliance impact...",
      "Preparing final analysis report..."
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(Math.round((currentStep / messages.length) * 100), 100);
      setAnalysisProgress(progress);
      
      toast({
        title: "Analysis in Progress",
        description: messages[currentStep - 1],
      });
      
      if (currentStep >= messages.length) {
        clearInterval(interval);
        setIsAnalyzing(false);
        setAnalysisCompleted(true);
        toast({
          title: "Analysis Complete",
          description: "Your threat case has been analyzed. View the report for detailed findings.",
        });
      }
    }, 1500);
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      simulateAnalysis();
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string, field: keyof FormData) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, artifacts: [...prev.artifacts, ...filesArray] }));
      
      toast({
        title: "Files Added",
        description: `Added ${filesArray.length} file(s) to your case.`,
      });
    }
  };

  const handleSeverityChange = (value: number[]) => {
    const severityMap: Record<number, SeverityLevel> = {
      0: 'Low',
      1: 'Medium',
      2: 'High',
      3: 'Critical'
    };
    
    setFormData(prev => ({ ...prev, severity: severityMap[value[0]] }));
  };

  // Grammarly-like AI enhancement simulation
  const enhanceDescription = () => {
    if (formData.description.length > 10) {
      // Simulate AI enhancement
      toast({
        title: "AI Enhancement",
        description: "Your description has been enhanced for clarity and technical accuracy.",
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="w-full max-w-3xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="bg-gray-700 rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold text-white">
                  {!analysisCompleted ? "New Security Case" : "Case Analysis Results"}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-gray-400">
                {!analysisCompleted 
                  ? `Step ${step} of 5: ${
                      step === 1 ? "Case Details" : 
                      step === 2 ? "Threat Source" : 
                      step === 3 ? "Evidence Collection" : 
                      step === 4 ? "Severity Assessment" : 
                      "Incident Description"
                    }`
                  : "AI-Generated Analysis and Recommendations"
                }
              </CardDescription>
              
              {!analysisCompleted && (
                <div className="mt-4 w-full bg-gray-600 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${(step / 5) * 100}%` }}
                  ></div>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="p-6">
              {isAnalyzing ? (
                <div className="space-y-6">
                  <div className="text-center text-lg text-white mb-4">
                    Analyzing Security Case
                  </div>
                  
                  <Progress value={analysisProgress} className="h-2" />
                  
                  <div className="text-center text-gray-400">
                    Please wait while our AI analyzes your security case data...
                  </div>
                  
                  <div className="flex justify-center mt-8">
                    <div className="animate-pulse flex space-x-2 items-center">
                      <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                      <div className="h-3 w-3 bg-blue-500 rounded-full delay-150"></div>
                      <div className="h-3 w-3 bg-blue-500 rounded-full delay-300"></div>
                    </div>
                  </div>
                </div>
              ) : !analysisCompleted ? (
                <div className="space-y-4">
                  {/* Step 1: Case Details */}
                  {step === 1 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="title" className="text-white">Case Title</Label>
                        <Input 
                          id="title" 
                          name="title"
                          placeholder="Provide a descriptive title for this case" 
                          value={formData.title}
                          onChange={handleInputChange}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white mb-2 block">Threat Type</Label>
                        <RadioGroup 
                          defaultValue={formData.threatType} 
                          onValueChange={(value) => handleRadioChange(value, 'threatType')}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded-md border border-gray-600">
                            <RadioGroupItem value="phishing" id="phishing" />
                            <Label htmlFor="phishing" className="text-white cursor-pointer">
                              Phishing
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded-md border border-gray-600">
                            <RadioGroupItem value="malware" id="malware" />
                            <Label htmlFor="malware" className="text-white cursor-pointer">
                              Malware
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded-md border border-gray-600">
                            <RadioGroupItem value="insider" id="insider" />
                            <Label htmlFor="insider" className="text-white cursor-pointer">
                              Insider Threat
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded-md border border-gray-600">
                            <RadioGroupItem value="unknown" id="unknown" />
                            <Label htmlFor="unknown" className="text-white cursor-pointer">
                              Unknown
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 2: Threat Source */}
                  {step === 2 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label className="text-white mb-2 block">Where was the threat first detected?</Label>
                        <RadioGroup 
                          defaultValue={formData.source} 
                          onValueChange={(value) => handleRadioChange(value, 'source')}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded-md border border-gray-600">
                            <RadioGroupItem value="email" id="email" />
                            <Label htmlFor="email" className="text-white cursor-pointer">
                              Email
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded-md border border-gray-600">
                            <RadioGroupItem value="endpoint" id="endpoint" />
                            <Label htmlFor="endpoint" className="text-white cursor-pointer">
                              Endpoint
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded-md border border-gray-600">
                            <RadioGroupItem value="server" id="server" />
                            <Label htmlFor="server" className="text-white cursor-pointer">
                              Server
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 bg-gray-700 p-3 rounded-md border border-gray-600">
                            <RadioGroupItem value="firewall" id="firewall" />
                            <Label htmlFor="firewall" className="text-white cursor-pointer">
                              Firewall Logs
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <Label htmlFor="sourceDetails" className="text-white">Additional Details</Label>
                        <Textarea 
                          id="sourceDetails" 
                          name="sourceDetails"
                          placeholder="Provide specific details about where and how the threat was detected" 
                          value={formData.sourceDetails}
                          onChange={handleInputChange}
                          className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 3: Evidence Collection */}
                  {step === 3 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="text-white">
                        <Label className="block mb-2">Upload Evidence Files</Label>
                        <div className="bg-gray-700 border border-dashed border-gray-500 rounded-lg p-6 text-center">
                          <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                          <p className="mb-2">Drag and drop files or click to browse</p>
                          <p className="text-xs text-gray-400 mb-4">Supported formats: .txt, .log, .pcap, .json, .csv, .png, .jpg</p>
                          <Input 
                            type="file" 
                            multiple
                            onChange={handleFileChange}
                            className="hidden" 
                            id="artifact-upload"
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => document.getElementById('artifact-upload')?.click()}
                          >
                            Select Files
                          </Button>
                        </div>
                      </div>
                      
                      {/* Show uploaded files */}
                      {formData.artifacts.length > 0 && (
                        <div className="bg-gray-700 p-3 rounded-md border border-gray-600">
                          <Label className="text-white mb-2 block">Uploaded Files ({formData.artifacts.length})</Label>
                          <ul className="space-y-2 max-h-[150px] overflow-y-auto">
                            {formData.artifacts.map((file, index) => (
                              <li key={index} className="flex items-center text-sm text-white">
                                <FileText className="h-4 w-4 mr-2 text-blue-400" />
                                {file.name} ({(file.size / 1024).toFixed(0)} KB)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {/* Step 4: Severity Assessment */}
                  {step === 4 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <Label className="text-white mb-2 block">Estimated Severity</Label>
                        <div className="py-4">
                          <Slider 
                            defaultValue={[formData.severity === 'Low' ? 0 : formData.severity === 'Medium' ? 1 : formData.severity === 'High' ? 2 : 3]}
                            max={3}
                            step={1}
                            onValueChange={handleSeverityChange}
                            className="mb-6"
                          />
                          
                          <div className="flex justify-between text-sm text-gray-400">
                            <div className="text-center">
                              <div className={`w-full h-2 rounded-full ${formData.severity === 'Low' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                              <span className="block mt-1">Low</span>
                            </div>
                            <div className="text-center">
                              <div className={`w-full h-2 rounded-full ${formData.severity === 'Medium' ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>
                              <span className="block mt-1">Medium</span>
                            </div>
                            <div className="text-center">
                              <div className={`w-full h-2 rounded-full ${formData.severity === 'High' ? 'bg-orange-500' : 'bg-gray-600'}`}></div>
                              <span className="block mt-1">High</span>
                            </div>
                            <div className="text-center">
                              <div className={`w-full h-2 rounded-full ${formData.severity === 'Critical' ? 'bg-red-500' : 'bg-gray-600'}`}></div>
                              <span className="block mt-1">Critical</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700 p-4 rounded-md border border-gray-600">
                        <div className="flex items-start">
                          <AlertTriangle className={`
                            h-5 w-5 mr-2 mt-1 
                            ${formData.severity === 'Low' ? 'text-green-500' : 
                            formData.severity === 'Medium' ? 'text-yellow-500' : 
                            formData.severity === 'High' ? 'text-orange-500' : 
                            'text-red-500'}
                          `} />
                          <div>
                            <h4 className="text-white font-medium">
                              {formData.severity} Severity Threat
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">
                              {formData.severity === 'Low' ? 'Minimal impact, non-sensitive data, easily contained' : 
                               formData.severity === 'Medium' ? 'Moderate impact, limited sensitive data exposure, containable' : 
                               formData.severity === 'High' ? 'Significant impact, sensitive data exposure, difficult to contain' : 
                               'Critical impact, breach of highly sensitive data, widespread effect'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 5: Incident Description */}
                  {step === 5 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="description" className="text-white">Describe the incident in your own words</Label>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost"
                            onClick={enhanceDescription}
                            className="text-xs text-blue-400"
                          >
                            AI Enhance
                          </Button>
                        </div>
                        <Textarea 
                          id="description" 
                          name="description"
                          placeholder="Provide a detailed description of the security incident, including chronology, observed behavior, and initial impact assessment" 
                          value={formData.description}
                          onChange={handleInputChange}
                          className="bg-gray-700 border-gray-600 text-white min-h-[200px]"
                        />
                      </div>
                      
                      <div className="bg-gray-700 p-3 rounded-md border border-gray-600">
                        <h4 className="text-white font-medium mb-2">Case Summary</h4>
                        <div className="text-sm text-gray-300 space-y-2">
                          <p><span className="text-gray-400">Title:</span> {formData.title || "Untitled Case"}</p>
                          <p><span className="text-gray-400">Type:</span> {formData.threatType.charAt(0).toUpperCase() + formData.threatType.slice(1)}</p>
                          <p><span className="text-gray-400">Source:</span> {formData.source.charAt(0).toUpperCase() + formData.source.slice(1)}</p>
                          <p><span className="text-gray-400">Severity:</span> {formData.severity}</p>
                          <p><span className="text-gray-400">Evidence:</span> {formData.artifacts.length} file(s) attached</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Analysis Results */}
                </div>
              ) : (
                <div className="space-y-6">
                  <ReportBot 
                    sourceType="hunt" 
                    sourceName={formData.title || "Security Incident"} 
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="bg-gray-700 p-4 rounded-b-lg flex justify-between">
              {!analysisCompleted ? (
                <>
                  <Button 
                    onClick={handlePrevious}
                    disabled={step === 1 || isAnalyzing}
                    variant="outline"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  
                  <Button 
                    onClick={handleNext}
                    disabled={isAnalyzing}
                    className={step === 5 ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {step < 5 ? (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Analyze
                        <Play className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={onClose}
                  className="mx-auto"
                  variant="outline"
                >
                  Close Report
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CaseBuilderWizard;
