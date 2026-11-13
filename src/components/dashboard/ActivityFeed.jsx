import { Surface } from '../common/ui';

export default function ActivityFeed({ activities = [], title = 'Recent coordination activity' }) {
  return (
    <Surface className="p-5 sm:p-6">
      <div className="pb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-0.5 text-xs text-muted">
          Chronological audit trail across demonstration hospital desks, donors, and administrators
        </p>
      </div>

      <div className="divide-y divide-border/50 border-t border-border/50">
        {activities.slice(0, 8).map((item) => (
          <div key={item.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm">
            <div className="min-w-0">
              <span className="font-semibold text-foreground">{item.actor}</span>
              <span className="mx-1.5 text-subtle">·</span>
              <span className="text-xs font-medium text-primary">{item.role}</span>
              <p className="mt-0.5 text-sm text-muted">{item.summary}</p>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-subtle">{item.timestamp}</span>
          </div>
        ))}
      </div>
    </Surface>
  );
}
