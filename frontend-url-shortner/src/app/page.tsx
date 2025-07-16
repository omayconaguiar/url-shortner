'use client';
import { useState } from 'react';
import { useAuth } from '@/common/hooks/useAuth';
import { Url } from '@/common/models/url';
import Navbar from '@/components/navbar';
import UrlShortenerForm from '@/components/urlShortenerForm';
import UrlSuccessCard from '@/components/urlSuccessCard';
import AuthWrapper from '@/components/authWrapper';
import Dashboard from '@/components/dashboard';
import UrlList from '@/components/urlList';

type ViewType = 'home' | 'dashboard' | 'urls';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [createdUrl, setCreatedUrl] = useState<Url | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const handleUrlSuccess = (url: Url) => {
    setCreatedUrl(url);
  };

  const handleCreateNew = () => {
    setCreatedUrl(null);
  };

  const handleViewChange = (view: ViewType) => {
    if (!isAuthenticated && (view === 'dashboard' || view === 'urls')) {
      setShowAuth(true);
      return;
    }
    setCurrentView(view);
    setShowAuth(false);
    if (view === 'home') {
      setCreatedUrl(null);
    }
  };

  if (showAuth && !isAuthenticated) {
    return <AuthWrapper />;
  }

  const renderContent = () => {
    if (currentView === 'dashboard' && isAuthenticated) {
      return <Dashboard />;
    }
    
    if (currentView === 'urls' && isAuthenticated) {
      return <UrlList userOnly={true} />;
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Shorten Your URLs
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create short, memorable links in seconds. Track clicks, manage your URLs, 
              and share them anywhere with confidence.
            </p>
          </div>

          <div className="flex justify-center mb-16">
            {createdUrl ? (
              <UrlSuccessCard url={createdUrl} onCreateNew={handleCreateNew} />
            ) : (
              <UrlShortenerForm onSuccess={handleUrlSuccess} />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Generate short URLs instantly with our optimized infrastructure.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600">
                Track clicks and engagement with detailed analytics dashboard.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Slugs</h3>
              <p className="text-gray-600">
                Create branded, memorable links with custom slug names.
              </p>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Want more features?
                </h3>
                <p className="text-gray-600 mb-4">
                  Sign up for free to access analytics, manage your URLs, and more!
                </p>
                <button
                  onClick={() => setShowAuth(true)}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Sign Up Free
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar currentView={currentView} onViewChange={handleViewChange} />
      {renderContent()}
    </>
  );
}