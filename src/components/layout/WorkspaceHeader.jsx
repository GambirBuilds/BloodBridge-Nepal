import { Menu } from 'lucide-react';
import { getInitials } from '../../utils/formatters';

export default function WorkspaceHeader({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  user,
  onOpenMobileSidebar,
}) {
  return (
    <header className="border-b border-border/70 bg-surface px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Open workspace menu"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-border text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted sm:text-sm">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {secondaryAction}
          {primaryAction}
          {user && (
            <div className="hidden items-center gap-2.5 border-l border-border/60 pl-3 sm:flex">
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-foreground"
              >
                {getInitials(user.name)}
              </span>
              <div className="min-w-0 text-xs">
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-subtle">{user.district} · Demo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
