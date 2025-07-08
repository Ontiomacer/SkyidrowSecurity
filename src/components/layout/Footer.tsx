
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 p-4 mt-8">
      <div className="container mx-auto text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Skyidrow Security Intelligence. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
