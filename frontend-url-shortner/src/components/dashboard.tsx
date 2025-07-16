'use client';
import { useDashboard } from '@/common/hooks/url/useDashboard';

export default function Dashboard() {
  const { stats, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          Failed to load dashboard data: {error.message}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-purple-600 text-xl">🔗</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total URLs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUrls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-green-600 text-xl">👁️</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVisits}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Avg. Visits/URL</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUrls > 0 ? Math.round(stats.totalVisits / stats.totalUrls) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Performing URLs</h2>
        </div>
        
        {stats.topUrls.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No URLs created yet. Create your first short URL to see analytics here.
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {stats.topUrls.map((url, index) => (
                <div key={url.slug} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">/{url.slug}</p>
                      <p className="text-sm text-gray-500 truncate max-w-md">{url.originalUrl}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{url.visits} visits</p>
                    <p className="text-sm text-gray-500">
                      Created {new Date(url.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}