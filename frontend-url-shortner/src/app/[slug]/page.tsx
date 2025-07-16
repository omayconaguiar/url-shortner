'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RedirectPageProps {
  params: {
    slug: string;
  };
}

export default function RedirectPage({ params }: RedirectPageProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simply redirect to the backend URL - let the backend handle the redirect
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/${params.slug}`;
  }, [params.slug]);

  // This will only show if there's a JavaScript error or the redirect fails
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting...</h2>
        <p className="text-gray-600 mb-4">Taking you to your destination</p>
        <p className="text-sm text-gray-500">
          If you're not redirected, <a 
            href={`${process.env.NEXT_PUBLIC_API_URL}/${params.slug}`}
            className="text-purple-600 underline"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  );
}