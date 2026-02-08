'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Key,
  Bell,
  Shield,
  Mail,
  Database,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your application preferences and integrations</p>
      </div>

      {/* AI Integration Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">AI Integration</h2>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">OpenAI API Key</label>
              <Badge variant={process.env.OPENAI_API_KEY ? "default" : "secondary"}>
                {process.env.OPENAI_API_KEY ? 'Configured' : 'Not Set'}
              </Badge>
            </div>
            <Input
              type="password"
              placeholder="sk-proj-..."
              defaultValue={process.env.OPENAI_API_KEY ? '••••••••••••••••' : ''}
              disabled
            />
            <p className="text-xs text-gray-500 mt-2">
              Configure in .env.local file: OPENAI_API_KEY=your-key-here
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">AI Features Status</p>
                <ul className="text-blue-800 space-y-1 ml-4 list-disc">
                  <li>Message intent classification</li>
                  <li>Risk assessment and urgency detection</li>
                  <li>AI-powered suggested replies</li>
                  <li>Knowledge base integration</li>
                </ul>
                <p className="mt-2 text-blue-700">
                  Requires a paid OpenAI account. Get started at{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    platform.openai.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Database Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Database</h2>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Connection Status</label>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
            <Input
              type="text"
              placeholder="postgresql://..."
              defaultValue="postgresql://•••••••@•••••••••/str_console"
              disabled
            />
            <p className="text-xs text-gray-500 mt-2">
              Configure in .env.local file: DATABASE_URL=your-connection-string
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <Shield className="h-4 w-4 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Database Info</p>
              <p className="text-xs">Using PostgreSQL with Prisma ORM. Automatic connection pooling and managed migrations.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Authentication Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Authentication</h2>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Clerk Integration</label>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              User authentication and session management powered by Clerk
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-1">Publishable Key</p>
              <p className="text-xs font-mono text-gray-800 truncate">
                {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '••••••••' : 'Not set'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-1">Secret Key</p>
              <p className="text-xs font-mono text-gray-800 truncate">••••••••</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Email Notifications</p>
              <p className="text-xs text-gray-600">Receive alerts for critical events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">High-Risk Message Alerts</p>
              <p className="text-xs text-gray-600">Notify when critical messages are received</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Approval Queue Reminders</p>
              <p className="text-xs text-gray-600">Daily digest of pending approvals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Email Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Email Configuration</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">SMTP Server</label>
            <Input type="text" placeholder="smtp.example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Port</label>
              <Input type="number" placeholder="587" defaultValue="587" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Security</label>
              <select className="w-full p-2 border rounded">
                <option>TLS</option>
                <option>SSL</option>
                <option>None</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">From Email</label>
            <Input type="email" placeholder="notifications@example.com" />
          </div>
          <p className="text-xs text-gray-500">
            Configure email settings to enable system notifications
          </p>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>Saving...</>
          ) : saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Environment Variables</p>
            <p>
              Most settings require changes to your <code className="px-1 py-0.5 bg-yellow-100 rounded">.env.local</code> file
              and a server restart to take effect. Update the file and run <code className="px-1 py-0.5 bg-yellow-100 rounded">npm run dev</code> again.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
