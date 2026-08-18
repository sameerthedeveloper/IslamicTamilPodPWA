import {
  LayoutDashboard,
  Mic2,
  Users2,
  Library,
  Tags,
  AudioLines,
  ShieldCheck,
  UsersRound,
  Star,
  Settings2,
} from 'lucide-react'

// Single source of truth for admin nav — Sidebar (full list, desktop/drawer)
// and BottomNavBar (user-picked subset, mobile) both read from this.
export const NAV_ITEMS = [
  { key: 'dashboard', to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { key: 'episodes', to: '/admin/episodes', label: 'Episodes', icon: Mic2 },
  { key: 'scholars', to: '/admin/scholars', label: 'Scholars', icon: Users2 },
  { key: 'series', to: '/admin/series', label: 'Series', icon: Library },
  { key: 'topics', to: '/admin/topics', label: 'Topics', icon: Tags },
  { key: 'audio', to: '/admin/audio', label: 'Audio', icon: AudioLines },
  { key: 'rights', to: '/admin/rights', label: 'Rights', icon: ShieldCheck },
  { key: 'users', to: '/admin/users', label: 'Users', icon: UsersRound },
  { key: 'featured', to: '/admin/featured', label: 'Featured', icon: Star },
  { key: 'settings', to: '/admin/settings', label: 'Settings', icon: Settings2 },
]

export const BOTTOM_NAV_MAX = 4

export const DEFAULT_BOTTOM_NAV_KEYS = ['dashboard', 'episodes', 'scholars', 'audio']
