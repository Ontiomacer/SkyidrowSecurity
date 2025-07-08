
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const SplunkAppOverview = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ThreatHunter Pro: Real-Time Cyber Threat Intelligence Platform</CardTitle>
          <CardDescription>A comprehensive Splunk app for advanced threat detection and response</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Project Description</h3>
            <p>
              ThreatHunter Pro is a comprehensive Splunk app designed to transform raw security data into actionable threat intelligence. 
              It focuses on early detection of sophisticated threats by combining real-time log analysis, automated correlation, 
              external threat feed integration, and guided threat hunting workflows.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Architecture Overview</h3>
            <div className="space-y-2">
              <div>
                <h4 className="font-medium">1. Data Ingestion Layer</h4>
                <ul className="list-disc pl-5">
                  <li>Real-time ingestion from firewalls, IDS/IPS, EDR solutions, DNS servers, and proxy logs</li>
                  <li>Support for syslog, HTTP Event Collector, Splunk forwarders, and API-based collection</li>
                  <li>Automatic parsing and field extraction for common security products</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">2. Analytics Layer</h4>
                <ul className="list-disc pl-5">
                  <li>Real-time correlation engine using custom SPL</li>
                  <li>Behavior baselining and anomaly detection</li>
                  <li>Machine learning models for detecting subtle patterns</li>
                  <li>Threat hunting query libraries</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">3. Intelligence Layer</h4>
                <ul className="list-disc pl-5">
                  <li>Integration with MISP, VirusTotal, AbuseIPDB, AlienVault OTX</li>
                  <li>Automated IOC extraction and enrichment</li>
                  <li>Temporal correlation of IOCs across data sources</li>
                  <li>Risk scoring system based on threat context</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">4. Visualization & Response Layer</h4>
                <ul className="list-disc pl-5">
                  <li>Role-based dashboards (analyst, hunter, manager)</li>
                  <li>Interactive threat investigation workflow</li>
                  <li>Automated response playbooks</li>
                  <li>Compliance reporting automation</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Key Features</h3>
            <ul className="list-disc pl-5">
              <li><span className="font-medium">Adaptive Baselining:</span> Automatically establishes normal behavior baselines for network, user, and system activities to detect subtle anomalies.</li>
              <li><span className="font-medium">Campaign Correlation:</span> Links disparate events across time and systems into cohesive attack campaigns using graph analysis.</li>
              <li><span className="font-medium">Guided Hunting Workflows:</span> Pre-built hunting paths based on MITRE ATT&CK tactics and techniques with incremental refinement.</li>
              <li><span className="font-medium">IOC Lifecycle Management:</span> Tracks the evolution of indicators from first detection through validation, enrichment, and eventual retirement.</li>
              <li><span className="font-medium">Compliance Evidence Generation:</span> Automated creation of evidence packages for regulatory requirements (NIST, ISO, PCI-DSS, HIPAA).</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
