import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if the current path matches the link
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the system."
    });
    navigate('/login');
  };
  
  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* SVG Shield Logo */}
          <span className="inline-block h-12 w-12">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12">
              <defs>
                <linearGradient id="shieldGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563eb" />
                  <stop offset="1" stopColor="#1e40af" />
                </linearGradient>
              </defs>
              <path d="M32 4L8 14v18c0 15.464 11.2 24.8 24 28 12.8-3.2 24-12.536 24-28V14L32 4z" fill="url(#shieldGradient)" stroke="#3b82f6" strokeWidth="2"/>
              <text x="32" y="42" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#fff" fontFamily="Segoe UI, Arial, sans-serif">S</text>
            </svg>
          </span>
          <span className="text-3xl font-extrabold text-blue-400 leading-tight" style={{fontFamily: 'Segoe UI, Arial, sans-serif'}}>Skyidrow Security<br/>Intelligence</span>
        </div>
        
        <div className="flex items-center gap-6">
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link 
                  to="/" 
                  className={isActive('/') ? "text-blue-400 border-b-2 border-blue-400 pb-1" : "text-gray-300 hover:text-blue-400 transition-colors"}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/osint" 
                  className={isActive('/osint') ? "text-blue-400 border-b-2 border-blue-400 pb-1" : "text-gray-300 hover:text-blue-400 transition-colors"}
                >
                  OSINT
                </Link>
              </li>
              <li>
                <Link 
                  to="/threat-map" 
                  className={isActive('/threat-map') ? "text-blue-400 border-b-2 border-blue-400 pb-1" : "text-gray-300 hover:text-blue-400 transition-colors"}
                >
                  Threat Map
                </Link>
              </li>
              <li>
                <Link 
                  to="/threat-intelligence" 
                  className={isActive('/threat-intelligence') ? "text-blue-400 border-b-2 border-blue-400 pb-1" : "text-gray-300 hover:text-blue-400 transition-colors"}
                >
                  Threat Intel
                </Link>
              </li>
              <li>
                <Link 
                  to="/simulations" 
                  className={isActive('/simulations') ? "text-blue-400 border-b-2 border-blue-400 pb-1" : "text-gray-300 hover:text-blue-400 transition-colors"}
                >
                  Simulations
                </Link>
              </li>
              <li>
                <Link 
                  to="/splunk" 
                  className={isActive('/splunk') ? "text-blue-400 border-b-2 border-blue-400 pb-1" : "text-gray-300 hover:text-blue-400 transition-colors"}
                >
                  Splunk
                </Link>
              </li>
              <li>
                <Link 
                  to="/news" 
                  className={isActive('/news') ? "text-blue-400 border-b-2 border-blue-400 pb-1" : "text-gray-300 hover:text-blue-400 transition-colors"}
                >
                  NEWS
                </Link>
              </li>
              {currentUser?.role === 'admin' && (
                <li>
                  <Link 
                    to="/settings" 
                    className={isActive('/settings') ? "text-blue-400 border-b-2 border-blue-400 pb-1" : "text-gray-300 hover:text-blue-400 transition-colors"}
                  >
                    Settings
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400 flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>
                {currentUser?.username} ({currentUser?.role})
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
