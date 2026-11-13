import { CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { Surface } from './ui';

export default function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2.5"
    >
      {toasts.map((toast) => (
        <Surface
          key={toast.id}
          role="status"
          className="pointer-events-auto flex items-start justify-between gap-3 p-4 shadow-float"
        >
          <div className="flex min-w-0 items-start gap-2.5">
            {toast.tone === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            ) : (
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-muted">{toast.description}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="rounded-control p-1 text-subtle hover:bg-background hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </Surface>
      ))}
    </div>
  );
}
