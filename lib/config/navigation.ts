import { NavSection } from '@/lib/types'

export const navigationConfig: NavSection[] = [
  {
    title: 'Core',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'Inbox', href: '/inbox', icon: 'Inbox' },
      { label: 'Approvals', href: '/approvals', icon: 'CheckCircle' },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Clients', href: '/clients', icon: 'Users' },
      { label: 'Properties', href: '/properties', icon: 'Building2' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Templates', href: '/templates', icon: 'FileText' },
      { label: 'Knowledge Base', href: '/kb', icon: 'BookOpen' },
      { label: 'KB Learning', href: '/kb-learning', icon: 'GraduationCap' },
      { label: 'Metadata', href: '/metadata', icon: 'Database' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Metrics', href: '/metrics', icon: 'BarChart3' },
      { label: 'Analytics', href: '/analytics', icon: 'TrendingUp' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Auto Rules', href: '/auto-rules', icon: 'Zap' },
      { label: 'Bulk Operations', href: '/bulk-ops', icon: 'List' },
      { label: 'Send Logs', href: '/send-logs', icon: 'Send' },
      { label: 'Audit Logs', href: '/audit-logs', icon: 'Shield' },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Users', href: '/users', icon: 'Users' },
      { label: 'Settings', href: '/settings', icon: 'Settings' },
      { label: 'Admin', href: '/admin', icon: 'Lock' },
    ],
  },
]
