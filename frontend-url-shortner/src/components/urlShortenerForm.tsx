'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UrlFormData, urlSchema } from '@/common/schemas/urlSchema';
import { useCreateUrl } from '@/common/hooks/url/useCreateUrl';
import { Url } from '@/common/models/url';

interface UrlShortenerFormProps {
  onSuccess: (url: Url) => void;
}

export default function UrlShortenerForm({ onSuccess }: UrlShortenerFormProps) {
  const { createUrl, loading } = useCreateUrl();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
  });

  const onSubmit = async (data: UrlFormData) => {
    try {
      setError(null);
      
      // Remove empty customSlug to let backend auto-generate
      const submitData = {
        originalUrl: data.originalUrl,
        ...(data.customSlug && data.customSlug.trim() !== '' && { customSlug: data.customSlug.trim() })
      };
      
      const newUrl = await createUrl(submitData);
      onSuccess(newUrl);
      reset();
    } catch (err) {
      let errorMessage = 'Failed to create short URL';
      
      if (err instanceof Error) {
        if (err.message.includes('already taken')) {
          errorMessage = 'This custom slug is already taken. Please choose another one.';
        } else if (err.message.includes('invalid URL')) {
          errorMessage = 'Please enter a valid URL.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
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
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            id="originalUrl"
            type="url"
            {...register('originalUrl')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="https://example.com/very/long/url"
            disabled={loading}
          />
          {errors.originalUrl && (
            <p className="text-red-600 text-sm mt-1">{errors.originalUrl.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Slug (optional)
          </label>
          <input
            id="customSlug"
            type="text"
            {...register('customSlug')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="my-custom-link"
            disabled={loading}
          />
          {errors.customSlug && (
            <p className="text-red-600 text-sm mt-1">{errors.customSlug.message}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Leave empty for auto-generated slug
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>
    </div>
  );
}