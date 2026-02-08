export type ApiResponse<T = any> = {
  ok: boolean
  results?: T
  error?: string
}

export type ThreadStatus = 'pending' | 'analyzed' | 'approved' | 'sent' | 'declined'
export type RiskLevel = 'low' | 'medium' | 'high'
export type UrgencyLevel = 'low' | 'normal' | 'high' | 'urgent'
export type SenderType = 'guest' | 'host' | 'system'

export type NavItem = {
  label: string
  href: string
  icon?: string
  badge?: number
}

export type NavSection = {
  title: string
  items: NavItem[]
}
