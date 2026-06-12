'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, Bell, Shield, Trash2, Save,
  Loader2, Check, AlertCircle, Eye, EyeOff, CreditCard,
  Cpu, Globe, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';

type Tab = 'profile' | 'security' | 'notifications' | 'billing';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'security',      label: 'Security',        icon: Shield },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
  { id: 'billing',       label: 'Plan & Billing',  icon: CreditCard },
];

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
        type === 'success'
          ? 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald'
          : 'bg-accent-rose/10 border-accent-rose/20 text-accent-rose'
      }`}
    >
      {type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Profile state
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email]                 = useState(user?.email ?? '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword]     = useState('');
  const [newPassword, setNewPassword]             = useState('');
  const [confirmPassword, setConfirmPassword]     = useState('');
  const [showCurrentPw, setShowCurrentPw]         = useState(false);
  const [showNewPw, setShowNewPw]                 = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState({
    simulationEvents: true,
    fundingRounds:    true,
    milestones:       true,
    weeklyReport:     false,
    marketingEmails:  false,
  });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) return;
    setIsSavingProfile(true);
    try {
      await api.auth.updateProfile({ fullName: fullName.trim() });
      showToast('Profile updated successfully', 'success');
    } catch {
      showToast('Failed to update profile', 'error');
    }
    setIsSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      showToast(newPassword !== confirmPassword ? 'Passwords do not match' : 'Please fill in all fields', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }
    setIsChangingPassword(true);
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      showToast('Current password is incorrect', 'error');
    }
    setIsChangingPassword(false);
  };

  const handleSaveNotifications = async () => {
    showToast('Notification preferences saved', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-0.5">Manage your account, security, and preferences</p>
      </div>

      {/* Toast */}
      <div className="mb-4 min-h-[0px]">
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <aside className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`settings-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-brand-500/15 border border-brand-500/20 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Profile Tab ─────────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-brand-400" />
                  Profile Information
                </h2>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {user ? getInitials(user.fullName) : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.fullName}</p>
                    <p className="text-xs text-white/40">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-violet/10 text-accent-violet border border-accent-violet/20">
                      <Cpu className="w-3 h-3" />
                      {user?.plan ?? 'free'} plan
                    </span>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="label" htmlFor="settings-full-name">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="settings-full-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="input-field pl-10"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="settings-email">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="settings-email"
                        type="email"
                        value={email}
                        disabled
                        className="input-field pl-10 opacity-50 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-white/30 mt-1.5">Email cannot be changed. Contact support if needed.</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    id="save-profile"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile || !fullName.trim()}
                    className="btn-primary flex items-center gap-2"
                  >
                    {isSavingProfile ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── Security Tab ────────────────────────────────────────────── */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="glass-card p-6 space-y-5">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-accent-amber" />
                    Change Password
                  </h2>

                  <div>
                    <label className="label" htmlFor="current-password">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="current-password"
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="input-field pl-10 pr-11"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="new-password">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="new-password"
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field pl-10 pr-11"
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="confirm-password">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-field pl-10"
                        placeholder="Repeat new password"
                      />
                    </div>
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-accent-rose mt-1.5">Passwords do not match</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      id="change-password"
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="btn-primary flex items-center gap-2"
                    >
                      {isChangingPassword ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</>
                      ) : (
                        <><Shield className="w-4 h-4" /> Update Password</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Active sessions info */}
                <div className="glass-card p-6">
                  <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-accent-cyan" />
                    Session Security
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">Current Session</p>
                      <p className="text-xs text-white/40">JWT access + refresh token rotation · 15-min expiry</p>
                    </div>
                    <span className="badge-positive">Active</span>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="glass-card p-6 border-accent-rose/20">
                  <h3 className="text-base font-semibold text-accent-rose mb-2 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-white/40 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    id="delete-account"
                    className="px-4 py-2 rounded-xl border border-accent-rose/30 text-accent-rose text-sm font-medium hover:bg-accent-rose/10 transition-all duration-200"
                    onClick={() => showToast('Please contact support to delete your account.', 'error')}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* ── Notifications Tab ───────────────────────────────────────── */}
            {activeTab === 'notifications' && (
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-accent-cyan" />
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, value]) => {
                    const labels: Record<keyof typeof notifications, { title: string; desc: string }> = {
                      simulationEvents: { title: 'Simulation Events',    desc: 'Real-time alerts for churn spikes, viral moments, and competitor activity' },
                      fundingRounds:    { title: 'Funding Rounds',       desc: 'Notifications when your startup raises a new funding round' },
                      milestones:       { title: 'Customer Milestones',  desc: 'Celebrate reaching 100, 1K, 10K customers and beyond' },
                      weeklyReport:     { title: 'Weekly Summary',       desc: 'Get a weekly digest of your startup\'s performance via email' },
                      marketingEmails:  { title: 'Product Updates',      desc: 'Occasional emails about new features and platform improvements' },
                    };
                    return (
                      <div key={key} className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-white">{labels[key].title}</p>
                          <p className="text-xs text-white/40 mt-0.5">{labels[key].desc}</p>
                        </div>
                        <button
                          id={`toggle-${key}`}
                          role="switch"
                          aria-checked={value}
                          onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
                          className={`relative flex-shrink-0 w-10 h-5.5 h-[22px] rounded-full transition-colors duration-200 ${
                            value ? 'bg-brand-500' : 'bg-surface-3'
                          }`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4.5 w-[18px] h-4.5 h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            value ? 'translate-x-[18px]' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button
                    id="save-notifications"
                    onClick={handleSaveNotifications}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* ── Billing Tab ─────────────────────────────────────────────── */}
            {activeTab === 'billing' && (
              <div className="space-y-4">
                {/* Current Plan */}
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-accent-emerald" />
                    Current Plan
                  </h2>
                  <div className="flex items-center justify-between p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-white capitalize">
                          {user?.plan ?? 'free'} Plan
                        </span>
                        <span className="badge-positive">Active</span>
                      </div>
                      <p className="text-sm text-white/40">All features included · Up to 5 startups</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black gradient-text">$0</span>
                      <span className="text-white/40 text-sm">/mo</span>
                    </div>
                  </div>
                </div>

                {/* Plans comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Free',       price: '$0',    features: ['3 startups', '90-day history', 'Basic analytics'], highlight: false },
                    { name: 'Pro',        price: '$19',   features: ['Unlimited startups', '1-year history', 'Advanced analytics', 'Priority support'], highlight: true },
                    { name: 'Enterprise', price: '$99',   features: ['Everything in Pro', 'Team collaboration', 'API access', 'Custom integrations'], highlight: false },
                  ].map((plan) => (
                    <div
                      key={plan.name}
                      className={`glass-card p-5 ${plan.highlight ? 'border-brand-500/40 bg-brand-500/5' : ''}`}
                    >
                      {plan.highlight && (
                        <div className="text-xs font-bold text-brand-300 mb-2 uppercase tracking-wider">Most Popular</div>
                      )}
                      <div className="text-lg font-bold text-white mb-0.5">{plan.name}</div>
                      <div className="mb-4">
                        <span className="text-2xl font-black gradient-text">{plan.price}</span>
                        <span className="text-white/40 text-sm">/mo</span>
                      </div>
                      <ul className="space-y-1.5 mb-5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                            <Check className="w-3 h-3 text-accent-emerald flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        id={`upgrade-${plan.name.toLowerCase()}`}
                        disabled={plan.name === 'Free'}
                        onClick={() => showToast('Billing coming soon — this is a portfolio demo project', 'success')}
                        className={`w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          plan.highlight
                            ? 'btn-primary'
                            : plan.name === 'Free'
                            ? 'bg-surface-2 text-white/30 cursor-default'
                            : 'btn-ghost border border-white/10'
                        }`}
                      >
                        {plan.name === 'Free' ? 'Current Plan' : `Upgrade to ${plan.name}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
