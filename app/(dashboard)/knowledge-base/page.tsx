'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Edit2, Trash2, Plus, X, BookOpen, Search } from 'lucide-react';

interface KbEntry {
  id: string;
  clientId: string;
  propertyId: string | null;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
  };
  property?: {
    id: string;
    name: string;
    address: string | null;
  };
}

interface Property {
  id: string;
  name: string;
  address: string | null;
}

export default function KnowledgeBasePage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<KbEntry[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KbEntry | null>(null);

  useEffect(() => {
    // Get clientId from URL or localStorage
    const params = new URLSearchParams(window.location.search);
    const urlClientId = params.get('clientId');
    const storedClientId = localStorage.getItem('currentClientId');
    const id = urlClientId || storedClientId || '';

    if (id) {
      setClientId(id);
      localStorage.setItem('currentClientId', id);
      fetchEntries(id);
      fetchProperties(id);
    }
  }, []);

  const fetchEntries = async (cId: string, pId?: string) => {
    setLoading(true);
    try {
      let url = `/api/knowledge-base?clientId=${cId}`;
      if (pId && pId !== 'all') {
        url += `&propertyId=${pId}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        setEntries(data.results);
      }
    } catch (error) {
      console.error('Error fetching KB entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch knowledge base entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async (cId: string) => {
    try {
      const res = await fetch(`/api/properties-list?clientId=${cId}`);
      const data = await res.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handlePropertyChange = (pId: string) => {
    setSelectedProperty(pId);
    if (clientId) {
      fetchEntries(clientId, pId === 'all' ? undefined : pId);
    }
  };

  const handleSave = async (formData: {
    title: string;
    content: string;
    propertyId: string;
    tags: string[];
  }) => {
    try {
      if (editingEntry) {
        // Update
        const res = await fetch('/api/knowledge-base', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entryId: editingEntry.id,
            title: formData.title,
            content: formData.content,
            tags: formData.tags,
          }),
        });

        const data = await res.json();
        if (data.ok) {
          toast({
            title: 'Success',
            description: 'Knowledge base entry updated',
          });
          setShowForm(false);
          setEditingEntry(null);
          fetchEntries(clientId, selectedProperty === 'all' ? undefined : selectedProperty);
        }
      } else {
        // Create
        const res = await fetch('/api/knowledge-base', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            propertyId: formData.propertyId === 'all' ? null : formData.propertyId,
            title: formData.title,
            content: formData.content,
            tags: formData.tags,
          }),
        });

        const data = await res.json();
        if (data.ok) {
          toast({
            title: 'Success',
            description: 'Knowledge base entry created',
          });
          setShowForm(false);
          fetchEntries(clientId, selectedProperty === 'all' ? undefined : selectedProperty);
        }
      }
    } catch (error) {
      console.error('Error saving KB entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save knowledge base entry',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const res = await fetch(`/api/knowledge-base?entryId=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.ok) {
        toast({
          title: 'Success',
          description: 'Knowledge base entry deleted',
        });
        fetchEntries(clientId, selectedProperty === 'all' ? undefined : selectedProperty);
      }
    } catch (error) {
      console.error('Error deleting KB entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete knowledge base entry',
        variant: 'destructive',
      });
    }
  };

  const filteredEntries = entries.filter((entry) =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group entries by tags
  const tagGroups = filteredEntries.reduce((acc, entry) => {
    entry.tags.forEach((tag) => {
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(entry);
    });
    return acc;
  }, {} as Record<string, KbEntry[]>);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-gray-600">
          Store property information for AI-powered responses
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Property Filter:</label>
          <select
            value={selectedProperty}
            onChange={(e) => handlePropertyChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="all">All Properties</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Search:</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entries..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-end">
          <Button onClick={() => {
            setEditingEntry(null);
            setShowForm(true);
          }} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingEntry ? 'Edit Entry' : 'New Entry'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setEditingEntry(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <KbEntryForm
            entry={editingEntry}
            properties={properties}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingEntry(null);
            }}
          />
        </Card>
      )}

      {/* Entries List */}
      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Loading knowledge base...</p>
        </Card>
      ) : filteredEntries.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">
            No knowledge base entries yet. Create one to get started!
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(tagGroups).map(([tag, tagEntries]) => (
            <div key={tag}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">{tag}</Badge>
                <span className="text-gray-400 text-sm">
                  ({tagEntries.length} entr{tagEntries.length !== 1 ? 'ies' : 'y'})
                </span>
              </h3>
              <div className="space-y-2">
                {tagEntries.map((entry) => (
                  <KbEntryCard
                    key={entry.id}
                    entry={entry}
                    onEdit={(e) => {
                      setEditingEntry(e);
                      setShowForm(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface KbEntryFormProps {
  entry: KbEntry | null;
  properties: Property[];
  onSave: (data: {
    title: string;
    content: string;
    propertyId: string;
    tags: string[];
  }) => void;
  onCancel: () => void;
}

function KbEntryForm({ entry, properties, onSave, onCancel }: KbEntryFormProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [propertyId, setPropertyId] = useState(entry?.propertyId || 'all');
  const [tagsInput, setTagsInput] = useState(entry?.tags.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({ title, content, propertyId, tags });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., WiFi Information"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Property</label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          disabled={!!entry}
          className="w-full p-2 border rounded disabled:bg-gray-100"
        >
          <option value="all">All Properties (Client-Wide)</option>
          {properties.map((prop) => (
            <option key={prop.id} value={prop.id}>
              {prop.name}
            </option>
          ))}
        </select>
        {entry && (
          <p className="text-xs text-gray-500 mt-1">Property cannot be changed after creation</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Content *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="WiFi Network: GuestNet&#10;Password: welcome123&#10;Speed: 100 Mbps"
          required
          rows={6}
          className="w-full p-3 border rounded font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tags (comma-separated) *</label>
        <Input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="wifi, parking, amenities"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Use tags like: wifi, parking, checkin, checkout, amenities, rules
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">
          {entry ? 'Update Entry' : 'Create Entry'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface KbEntryCardProps {
  entry: KbEntry;
  onEdit: (entry: KbEntry) => void;
  onDelete: (id: string) => void;
}

function KbEntryCard({ entry, onEdit, onDelete }: KbEntryCardProps) {
  return (
    <Card className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{entry.title}</h3>
            {entry.property && (
              <Badge variant="outline">📍 {entry.property.name}</Badge>
            )}
            {!entry.property && (
              <Badge variant="outline">📍 All Properties</Badge>
            )}
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3 font-mono bg-gray-50 p-3 rounded">
            {entry.content}
          </p>
          <div className="flex gap-2 flex-wrap">
            {entry.tags.map((tag) => (
              <Badge key={tag} className="bg-blue-100 text-blue-800">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Updated {new Date(entry.updatedAt).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(entry)}
            title="Edit entry"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(entry.id)}
            title="Delete entry"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
