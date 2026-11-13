import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Droplet, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/ui';

const TOP_NAV_LINKS = [
  { to: '/find-donors', label: 'Find Donors' },
  { to: '/blood-requests', label: 'Blood Requests' },
  { to: '/hospitals', label: 'Hospitals & Blood Banks' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About Us' },
];

const MOBILE_SECONDARY_LINKS = [
  { to: '/become-a-donor', label: 'Become a Donor' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/register', label: 'Register Account' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, isAuthenticated, getDashboardPathForRole } = useAuth();
  const navigate = useNavigate();

  const workspacePath = currentUser ? getDashboardPathForRole(currentUser.role) : '/login';

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex shrink-0 items-center gap-2.5 text-lg font-bold tracking-tight text-foreground"
        >
          <Droplet className="h-5 w-5 shrink-0 fill-primary text-primary" />
          <span>BLOODBRIDGE</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-6 md:flex"
        >
          {TOP_NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 text-sm font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted hover:text-foreground'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button
              tone="quiet"
              size="sm"
              onClick={() => navigate(workspacePath)}
            >
              <LayoutDashboard className="h-4 w-4" />
              {currentUser.roleLabel} Workspace
            </Button>
          ) : (
            <Link
              to="/login"
              className="whitespace-nowrap shrink-0 px-2 text-sm font-medium text-muted hover:text-foreground"
            >
              Sign in
            </Link>
          )}

          <Button size="sm" onClick={() => navigate('/become-a-donor')}>
            Become a Donor
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-border text-foreground md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/70 bg-surface px-4 py-4 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col divide-y divide-border/40">
            {[...TOP_NAV_LINKS, ...MOBILE_SECONDARY_LINKS].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `py-3 text-sm font-medium ${
                    isActive ? 'text-primary' : 'text-foreground'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 flex flex-wrap gap-2.5 border-t border-border/50 pt-4">
            <Button
              tone="quiet"
              className="flex-1"
              onClick={() => {
                setMobileOpen(false);
                navigate(workspacePath);
              }}
            >
              {isAuthenticated ? 'Open Workspace' : 'Sign in (Demo Roles)'}
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setMobileOpen(false);
                navigate('/become-a-donor');
              }}
            >
              Become a Donor
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
