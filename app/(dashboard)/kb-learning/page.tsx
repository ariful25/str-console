'use client';

import { useEffect, useState } from 'react';
import { useKBLearning } from '@/lib/hooks/useKBLearning';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Book, Search, TrendingUp } from 'lucide-react';

export default function KBLearningPage() {
  const { results, stats, loading, error, search, fetchStats } = useKBLearning();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<(typeof results)[0] | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchStats();
    }
  }, [mounted, fetchStats]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await search(searchQuery);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">KB Learning & Search</h1>
        <p className="text-gray-600 mt-2">Advanced knowledge base search and analytics</p>
      </div>

      {error && (
        <Card className="mb-6 p-4 bg-red-50 border border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-3xl font-bold mt-2">{stats.totalEntries}</p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Book size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Added Recent</p>
                <p className="text-3xl font-bold mt-2">{stats.recentEntries}</p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <TrendingUp size={24} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search Form */}
      <Card className="p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Knowledge Base
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Search by title, content, or tag..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <Search size={18} />
                Search
              </button>
            </div>
          </div>
        </form>
      </Card>

      {/* Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Results */}
        <div className="lg:col-span-2">
          {loading ? (
            <Card className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Searching...</p>
            </Card>
          ) : results.length === 0 ? (
            <Card className="p-8 text-center bg-gray-50">
              <Search size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">
                {searchQuery ? 'No results found' : 'Search to get started'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map(entry => (
                <Card
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`p-4 cursor-pointer hover:shadow-md transition ${
                    selectedEntry?.id === entry.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <h3 className="font-semibold text-lg text-blue-600 hover:underline">
                    {entry.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{entry.preview}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {entry.tags.length > 0 ? entry.tags.slice(0, 2).join(', ') : 'No tags'}
                    </span>
                    <span>Sources {entry.sourcesCount}</span>
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-1">
          {selectedEntry ? (
            <Card className="p-6 sticky top-4">
              <h2 className="text-lg font-bold mb-4">{selectedEntry.title}</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Tags</p>
                  <p className="mt-1 text-sm">
                    {selectedEntry.tags.length > 0 ? selectedEntry.tags.join(', ') : 'No tags'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Sources</p>
                  <p className="mt-1 text-sm font-semibold text-blue-600">
                    {selectedEntry.sourcesCount}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Created</p>
                  <p className="mt-1 text-sm">
                    {new Date(selectedEntry.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2">
                    Content Preview
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-6">{selectedEntry.content}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center bg-gray-50">
              <Book size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">Select an entry to view details</p>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
}
