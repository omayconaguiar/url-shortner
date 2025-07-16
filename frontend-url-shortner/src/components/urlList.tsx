'use client';
import { useState } from 'react';
import { useUrls } from '@/common/hooks/url/useUrls';
import { Url } from '@/common/models/url';

interface UrlListProps {
  userOnly?: boolean;
}

export default function UrlList({ userOnly = false }: UrlListProps) {
  const { urls, loading, error, refreshUrls } = useUrls(userOnly);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const copyToClipboard = async (slug: string) => {
    try {
      const shortUrl = `http://${process.env.NEXT_PUBLIC_APP_DOMAIN}/${slug}`;
      
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shortUrl);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = shortUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Try fallback method even if clipboard API failed
      try {
        const shortUrl = `http://${process.env.NEXT_PUBLIC_APP_DOMAIN}/${slug}`;
        const textArea = document.createElement('textarea');
        textArea.value = shortUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy also failed: ', fallbackErr);
        const shortUrl = `http://${process.env.NEXT_PUBLIC_APP_DOMAIN}/${slug}`;
        alert(`Copy failed. Please copy manually: ${shortUrl}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          Failed to load URLs: {error.message}
          <button 
            onClick={refreshUrls}
            className="ml-2 text-red-700 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {userOnly ? 'My URLs' : 'All URLs'}
        </h1>
        <button 
          onClick={refreshUrls}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
      
      {urls.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">🔗</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {userOnly ? 'No URLs created yet' : 'No URLs found'}
          </h3>
          <p className="text-gray-500">
            {userOnly 
              ? 'Create your first short URL to get started' 
              : 'Be the first to create a short URL!'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="divide-y divide-gray-200">
            {urls.map((url: Url) => (
              <div key={url.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="font-medium text-purple-600">
                        /{url.slug}
                      </div>
                      {url.user && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          by {url.user.name}
                        </span>
                      )}
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {url._count.visits} visits
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm truncate">
                      {url.originalUrl}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Created {new Date(url.createdAt).toLocaleDateString()} at{' '}
                      {new Date(url.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => copyToClipboard(url.slug)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        copiedSlug === url.slug
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {copiedSlug === url.slug ? '✓ Copied!' : '📋 Copy'}
                    </button>
                    
                    <a
                      href={url.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      🔗 Visit
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}