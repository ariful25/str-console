'use client';

import { useEffect, useState } from 'react';
import { useMetadata, TAG_CATEGORIES, DEFAULT_COLORS } from '@/lib/hooks/useMetadata';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, Plus, X } from 'lucide-react';

export default function MetadataPage() {
  const { tags, loading, error, fetchTags, createTag } = useMetadata();
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: DEFAULT_COLORS[0],
    category: 'general',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchTags();
    }
  }, [mounted, fetchTags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTag(formData.name, formData.color, formData.category);
      setFormData({
        name: '',
        color: DEFAULT_COLORS[0],
        category: 'general',
      });
      setShowForm(false);
      await fetchTags();
    } catch (err) {
      // Error handled by hook
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metadata Management</h1>
          <p className="text-gray-600 mt-2">Organize messages with tags and categories</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          New Tag
        </Button>
      </div>

      {error && (
        <Card className="mb-6 p-4 bg-red-50 border border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {/* Create Tag Form */}
      {showForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tag Name</label>
              <Input
                type="text"
                placeholder="e.g., Urgent, Billing Issue"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {TAG_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {DEFAULT_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-black' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Create Tag
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tags Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading tags...</p>
        </div>
      ) : tags.length === 0 ? (
        <Card className="p-12 text-center bg-gray-50">
          <Tag size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No tags yet. Create one to get started!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map(tag => (
              <Card key={tag.name} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <h3 className="font-semibold text-lg">{tag.name}</h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Used {tag.count} times</p>
                      {tag.category && (
                        <p className="text-xs bg-gray-100 inline-block px-2 py-1 rounded">
                          {tag.category}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
