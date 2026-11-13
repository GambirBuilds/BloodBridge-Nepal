import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  Building2,
  ClipboardList,
  Droplet,
  FileCheck2,
  Globe,
  HeartHandshake,
  History,
  LogOut,
  Settings,
  ShieldCheck,
  Sliders,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePlatformData } from '../../hooks/usePlatformData';

export const ROLE_NAV_ITEMS = {
  donor: [
    { key: 'overview', label: 'Donor overview', icon: Activity },
    { key: 'requests', label: 'Incoming requests', icon: ClipboardList },
    { key: 'history', label: 'Donation history', icon: History },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'profile', label: 'Edit profile', icon: UserCheck },
    { key: 'privacy', label: 'Privacy settings', icon: ShieldCheck },
    { key: 'settings', label: 'Account settings', icon: Settings },
  ],
  requester: [
    { key: 'overview', label: 'Submitted requests', icon: ClipboardList },
    { key: 'new', label: 'Submit new request', icon: HeartHandshake },
    { key: 'track', label: 'Verification tracker', icon: FileCheck2 },
    { key: 'notifications', label: 'Notification history', icon: Bell },
  ],
  hospital: [
    { key: 'overview', label: 'Hospital profile', icon: Building2 },
    { key: 'requests', label: 'Incoming verification', icon: FileCheck2 },
    { key: 'coordination', label: 'Donor coordination', icon: HeartHandshake },
    { key: 'history', label: 'Request history', icon: History },
    { key: 'analytics', label: 'Unit stock & analytics', icon: Activity },
    { key: 'staff', label: 'Staff management', icon: Users },
  ],
  admin: [
    { key: 'overview', label: 'Platform overview', icon: Activity },
    { key: 'verifications', label: 'Verification queue', icon: FileCheck2 },
    { key: 'hospitals', label: 'Hospital management', icon: Building2 },
    { key: 'requests', label: 'Request management', icon: ClipboardList },
    { key: 'donors', label: 'Donor management', icon: HeartHandshake },
    { key: 'users', label: 'User management', icon: Users },
    { key: 'reports', label: 'Reports & analytics', icon: Sliders },
    { key: 'settings', label: 'Platform settings', icon: Settings },
  ],
};

const QUICK_ROLES = [
  { role: 'donor', label: 'Donor' },
  { role: 'requester', label: 'Requester' },
  { role: 'hospital', label: 'Hospital' },
  { role: 'admin', label: 'Admin' },
];

export default function Sidebar({
  role,
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) {
  const { currentUser, loginWithDemoRole, logout, getDashboardPathForRole } = useAuth();
  const { users, notifications } = usePlatformData();
  const navigate = useNavigate();

  const items = ROLE_NAV_ITEMS[role] || ROLE_NAV_ITEMS.donor;
  const unreadCount = notifications.filter((n) => n.targetRole === role && !n.read).length;

  const handleSwitchRole = (targetRole) => {
    loginWithDemoRole(targetRole, users);
    navigate(getDashboardPathForRole(targetRole));
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-surface text-foreground">
      <div className="min-w-0">
        <div className="flex h-16 items-center justify-between border-b border-border/70 px-5">
          <Link to="/" className="inline-flex items-center gap-2 text-base font-bold tracking-tight">
            <Droplet className="h-5 w-5 fill-primary text-primary" />
            <span>BLOODBRIDGE</span>
          </Link>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
              className="rounded-control p-1.5 text-muted hover:bg-background md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="border-b border-border/60 px-5 py-3.5">
          <p className="text-xs font-medium text-subtle">Demo workspace role</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground" title={currentUser?.name}>
            {currentUser?.name || 'Demo Account'}
          </p>
          <p className="text-xs text-muted">{currentUser?.roleLabel}</p>
        </div>

        <nav aria-label="Workspace navigation" className="space-y-1 p-3">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            const showUnread = item.key === 'notifications' && unreadCount > 0;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelectTab(item.key);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`flex min-h-10 w-full items-center justify-between gap-2.5 rounded-control px-3 py-2 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-tint text-primary'
                    : 'text-muted hover:bg-background hover:text-foreground'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </span>
                {showUnread && (
                  <span className="tabular-nums text-xs font-semibold text-primary">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="divide-y divide-border/60 border-t border-border/70 px-4 py-3">
        <div className="pb-3">
          <p className="mb-2 text-xs font-medium text-subtle">Switch demo role</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ROLES.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => handleSwitchRole(r.role)}
                className={`rounded-control border px-2.5 py-1 text-xs font-medium transition-colors ${
                  role === r.role
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-foreground hover:bg-background'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 pt-3">
          <Link
            to="/"
            className="inline-flex min-h-9 items-center gap-2 rounded-control px-2.5 text-xs font-medium text-muted hover:bg-background hover:text-foreground"
          >
            <Globe className="h-4 w-4" />
            Public website & donor search
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="inline-flex min-h-9 items-center gap-2 rounded-control px-2.5 text-left text-xs font-medium text-danger hover:bg-primary-tint"
          >
            <LogOut className="h-4 w-4" />
            Sign out of demo session
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border/70 md:block">
        <div className="sticky top-0 h-dvh min-h-0 overflow-y-auto">{navContent}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-foreground/45"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-dvh w-72 max-w-[85vw] overflow-y-auto shadow-float">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
