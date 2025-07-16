"use client";

import { useContext, useState } from "react";
import { UserContext } from "@/common/context/userContext";
import { useAuth } from "@/common/hooks/useAuth";

interface NavbarProps {
  currentView: 'home' | 'dashboard' | 'urls';
  onViewChange: (view: 'home' | 'dashboard' | 'urls') => void;
  onSignInClick?: () => void;
}

export default function Navbar({ currentView, onViewChange, onSignInClick }: NavbarProps) {
  const { user, loading } = useContext(UserContext);
  const { logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const initial = !loading && user?.name ? user.name.charAt(0).toUpperCase() : "";
  const fullName = user?.name ?? "";
  
  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    onViewChange('home');
  };
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => onViewChange('home')}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🔗</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Short.ly</h1>
          </button>

          {isAuthenticated && (
            <div className="flex space-x-6">
              <button
                onClick={() => onViewChange('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'home'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => onViewChange('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onViewChange('urls')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'urls'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My URLs
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="h-10 w-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold hover:bg-purple-600 transition-colors"
              >
                {initial}
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{fullName}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
            onClick={() => onViewChange('dashboard')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Sign In
          </button>
          
          )}
        </div>
      </div>
      
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
}