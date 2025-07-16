'use client';
import { useState } from 'react';
import { Url } from '@/common/models/url';

interface UrlSuccessCardProps {
  url: Url;
  onCreateNew: () => void;
}

export default function UrlSuccessCard({ url, onCreateNew }: UrlSuccessCardProps) {
  const [copied, setCopied] = useState(false);
  
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_DOMAIN}/${url.slug}`;
  const fullShortUrl = `http://${shortUrl}`;

  const copyToClipboard = async () => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullShortUrl);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = fullShortUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Try fallback method even if clipboard API failed
      try {
        const textArea = document.createElement('textarea');
        textArea.value = fullShortUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy also failed: ', fallbackErr);
        alert(`Copy failed. Please copy manually: ${fullShortUrl}`);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">🔗</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">URL Shortener</h2>
      </div>
      
      <p className="text-gray-600 mb-6">Enter the URL to shorten</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
            {url.originalUrl}
          </div>
        </div>

        <button
          onClick={onCreateNew}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
        >
          Shorten
        </button>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium mb-3">
            Success! Here's your short URL:
          </p>
          
          <div className="flex items-center space-x-2">
            <div className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-purple-600 font-medium">
              {shortUrl}
            </div>
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}