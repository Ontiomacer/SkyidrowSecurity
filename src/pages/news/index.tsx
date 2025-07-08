import React from 'react';
import { Outlet } from 'react-router-dom';

const NewsIndex: React.FC = () => {
  // Render nested routes for /news
  return <Outlet />;
};

export default NewsIndex;
