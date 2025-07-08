
import React from 'react';
import Layout from '@/components/layout/Layout';
import OSINTDashboard from '@/components/osint/OSINTDashboard';

const OSINTPage: React.FC = () => {
  return (
    <Layout>
      <OSINTDashboard />
    </Layout>
  );
};

export default OSINTPage;
