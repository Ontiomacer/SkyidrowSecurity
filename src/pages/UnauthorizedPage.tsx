
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <p className="text-lg mb-4">
            You don't have permission to access this page.
          </p>
          
          {currentUser && (
            <p className="text-sm text-gray-400 mb-6">
              Logged in as: <span className="font-bold">{currentUser.username}</span> ({currentUser.role})
            </p>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </Button>
            
            <Button
              variant="outline"
              onClick={logout}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
