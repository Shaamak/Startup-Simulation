'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Rocket, Settings, LogOut, Zap,
  Bell, User, ChevronRight, Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/startup/create', label: 'New Startup', icon: Rocket },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { isConnected, notifications } = useSocket();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/50">
          <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-surface flex">
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="w-64 fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/5 bg-surface-1">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base gradient-text">Startup Sim</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                className={cn(isActive ? 'sidebar-item-active' : 'sidebar-item')}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Connection status + User */}
        <div className="p-3 border-t border-white/5">
          {/* Real-time status */}
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className={cn(
              'w-1.5 h-1.5 rounded-full',
              isConnected ? 'bg-accent-emerald animate-pulse' : 'bg-white/20'
            )} />
            <span className="text-xs text-white/30">
              {isConnected ? 'Live updates active' : 'Connecting...'}
            </span>
          </div>

          {/* User profile */}
          <button
            id="sidebar-user-menu"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group"
            title="Click to sign out"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user ? getInitials(user.fullName) : '?'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium text-white truncate">{user?.fullName}</div>
              <div className="text-xs text-white/30 truncate">{user?.email}</div>
            </div>
            <LogOut className="w-3.5 h-3.5 text-white/20 group-hover:text-accent-rose transition-colors flex-shrink-0" />
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-surface-1/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Activity className="w-3.5 h-3.5" />
            <span>Simulation Platform</span>
          </div>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <div className="relative">
                <Bell className="w-4 h-4 text-white/40" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent-rose rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              </div>
            )}
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              {user ? getInitials(user.fullName) : '?'}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}
