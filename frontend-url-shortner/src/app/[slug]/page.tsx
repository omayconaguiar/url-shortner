'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RedirectPageProps {
  params: {
    slug: string;
  };
}

export default function RedirectPage({ params }: RedirectPageProps) {
  const [showNotFound, setShowNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${params.slug}`);

        if (response.ok) {
          // Success - URL exists, do the redirect
          window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/${params.slug}`;
        } else if (response.status === 404) {
          // Get the JSON response to check if it matches our expected format
          const errorData = await response.json();
          
          if (errorData.statusCode === 404 && 
              errorData.message === 'URL not found' && 
              errorData.error === 'Not Found') {
            // This is our expected 404 response - show beautiful page
            setLoading(false);
            setShowNotFound(true);
          } else {
            // Different 404 format - also show not found
            setLoading(false);
            setShowNotFound(true);
          }
        } else {
          // Other status codes - treat as not found
          setLoading(false);
          setShowNotFound(true);
        }
      } catch (error) {
        console.error('Network error:', error);
        setLoading(false);
        setShowNotFound(true);
      }
    };

    checkAndRedirect();
  }, [params.slug]);

  if (showNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="text-center max-w-lg mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fadeIn">
            <div className="text-8xl mb-4 animate-bounce">🔗💔</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Oops! Link Not Found
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The short URL 
              <span className="inline-block mx-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg font-mono text-sm font-semibold">
                /{params.slug}
              </span>
              could not be found or may have expired.
            </p>
            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🔗 Create New Short URL
              </Link>
              <button
                onClick={() => window.history.back()}
                className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
              >
                ← Go Back
              </button>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Powered by <span className="font-semibold text-purple-600">Short.ly</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting...</h2>
          <p className="text-gray-600 mb-4">Checking if link exists...</p>
          <div className="flex items-center justify-center space-x-1 text-gray-400">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}