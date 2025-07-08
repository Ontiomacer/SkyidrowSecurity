
import React from 'react';
import Layout from '@/components/layout/Layout';
import ThreatMapDashboard from '@/components/threat/ThreatMapDashboard';

const ThreatMapPage: React.FC = () => {
  return (
    <Layout>
      <ThreatMapDashboard />
    </Layout>
  );
};

export default ThreatMapPage;
