import { formatCount } from '../../utils/formatters';
import { Surface } from '../common/ui';

export default function StatStrip({ leadMetric, secondaryMetrics = [] }) {
  return (
    <Surface className="p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center lg:gap-0 lg:divide-x lg:divide-border/50">
        {leadMetric && (
          <div className="min-w-0 lg:col-span-4 lg:pr-6">
            <p className="text-sm font-medium text-muted">{leadMetric.label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-foreground sm:text-4xl">
              {typeof leadMetric.value === 'number'
                ? formatCount(leadMetric.value)
                : leadMetric.value}
            </p>
            {leadMetric.caption && (
              <p className="mt-1 text-xs text-subtle">{leadMetric.caption}</p>
            )}
          </div>
        )}

        <div
          className={`grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-border/50 ${
            leadMetric ? 'lg:col-span-8 lg:pl-6' : 'lg:col-span-12'
          }`}
        >
          {secondaryMetrics.map((metric, idx) => (
            <div
              key={metric.label}
              className={`min-w-0 ${idx > 0 ? 'sm:pl-5' : ''} ${
                idx < secondaryMetrics.length - 1 ? 'sm:pr-4' : ''
              }`}
            >
              <p className="text-xs font-medium text-muted">{metric.label}</p>
              <p
                className={`mt-1 text-2xl font-semibold tabular-nums ${
                  metric.highlight ? 'text-primary' : 'text-foreground'
                }`}
              >
                {typeof metric.value === 'number'
                  ? formatCount(metric.value)
                  : metric.value}
              </p>
              {metric.caption && (
                <p className="mt-0.5 text-xs text-subtle">{metric.caption}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Surface>
  );
}
