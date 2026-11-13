import { Component, forwardRef, useEffect, useId, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, X } from 'lucide-react';

export function Surface({ inset = false, className = '', children, ...props }) {
  return (
    <div
      className={`min-w-0 rounded-card text-foreground ${
        inset
          ? 'border border-border/70 bg-background'
          : 'border border-border/70 bg-surface shadow-surface'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

const buttonTones = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-deep',
  deep: 'bg-primary-deep text-primary-foreground hover:brightness-95',
  quiet: 'border border-border bg-surface text-foreground hover:bg-background',
  ghost: 'bg-transparent text-muted hover:bg-background hover:text-foreground',
  danger: 'border border-danger/40 bg-surface text-danger hover:bg-primary-tint',
  success: 'bg-success text-white hover:brightness-95',
};

const buttonSizes = {
  md: 'min-h-11 px-4 py-2 text-sm',
  sm: 'min-h-9 px-3 py-1.5 text-sm',
  lg: 'min-h-12 px-5 py-2.5 text-base',
};

export function Button({
  tone = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium transition-colors active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${
        buttonTones[tone] || buttonTones.primary
      } ${buttonSizes[size] || buttonSizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export const Field = forwardRef(function Field(
  { label, hint, error, required = false, className = '', id: propId, ...inputProps },
  ref
) {
  const autoId = useId();
  const fieldId = propId || autoId;

  return (
    <div className={`min-w-0 space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-primary">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={`min-h-11 w-full rounded-control border bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary disabled:bg-background disabled:text-muted ${
          error ? 'border-danger' : 'border-border'
        }`}
        {...inputProps}
      />
      {hint && !error && <p className="text-xs text-subtle">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

export const SelectField = forwardRef(function SelectField(
  { label, hint, error, required = false, options = [], placeholder, className = '', id: propId, ...selectProps },
  ref
) {
  const autoId = useId();
  const fieldId = propId || autoId;

  return (
    <div className={`min-w-0 space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-primary">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={`min-h-11 w-full rounded-control border bg-surface px-3.5 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary disabled:bg-background disabled:text-muted ${
          error ? 'border-danger' : 'border-border'
        }`}
        {...selectProps}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {hint && !error && <p className="text-xs text-subtle">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

export const TextareaField = forwardRef(function TextareaField(
  { label, hint, error, required = false, rows = 3, className = '', id: propId, ...textareaProps },
  ref
) {
  const autoId = useId();
  const fieldId = propId || autoId;

  return (
    <div className={`min-w-0 space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-primary">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-control border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary ${
          error ? 'border-danger' : 'border-border'
        }`}
        {...textareaProps}
      />
      {hint && !error && <p className="text-xs text-subtle">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

export function Switch({ checked, onChange, label, description, disabled = false }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-foreground">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 ${
          checked ? 'bg-primary' : 'bg-border'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

const STATUS_STYLES = {
  Verified: { dot: 'bg-success', text: 'text-success' },
  Fulfilled: { dot: 'bg-success', text: 'text-success' },
  Active: { dot: 'bg-success', text: 'text-success' },
  'Available Now': { dot: 'bg-success', text: 'text-success' },
  'Donor Coordination': { dot: 'bg-primary', text: 'text-primary' },
  'Weekends & Evenings': { dot: 'bg-foreground', text: 'text-foreground' },
  'Emergency Only': { dot: 'bg-warning', text: 'text-warning' },
  Pending: { dot: 'bg-warning', text: 'text-warning' },
  'Pending Verification': { dot: 'bg-warning', text: 'text-warning' },
  'Under Verification': { dot: 'bg-warning', text: 'text-warning' },
  'Temporarily Paused': { dot: 'bg-subtle', text: 'text-subtle' },
  Cancelled: { dot: 'bg-subtle', text: 'text-subtle' },
  Suspended: { dot: 'bg-danger', text: 'text-danger' },
  Rejected: { dot: 'bg-danger', text: 'text-danger' },
};

export function StatusText({ status, className = '' }) {
  const style = STATUS_STYLES[status] || { dot: 'bg-subtle', text: 'text-muted' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${style.text} ${className}`}>
      <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

export function BloodGroupMark({ group, size = 'md' }) {
  const sizes = {
    sm: 'text-sm font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-2xl font-bold',
  };
  return (
    <span className={`tabular-nums tracking-tight text-primary ${sizes[size] || sizes.md}`}>
      {group}
    </span>
  );
}

export function SmartImage({ src, alt, fallbackTitle = 'BLOODBRIDGE Nepal', className = '' }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackTitle}
        className={`flex items-end bg-gradient-to-br from-background via-primary-tint to-surface p-6 ${className}`}
      >
        <span className="text-sm font-medium text-muted">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="py-12 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button tone="quiet" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Keep as is',
  tone = 'danger',
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <Surface className="w-full max-w-md p-6 shadow-float">
        <div className="flex items-start justify-between gap-3">
          <h3 id="confirm-dialog-title" className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-control p-1 text-subtle hover:bg-background hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2.5 border-t border-border/50 pt-4">
          <Button tone="quiet" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            tone={tone === 'danger' ? 'primary' : 'success'}
            autoFocus
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </Surface>
    </div>
  );
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering issue occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-background p-6">
          <Surface role="alert" className="max-w-lg p-8">
            <div className="flex items-center gap-2.5 text-danger">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h1 className="text-lg font-semibold text-foreground">
                Unable to display this view
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted">{this.state.errorMessage}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4" />
                Reload application
              </Button>
              <Button
                tone="quiet"
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Return to home
              </Button>
            </div>
          </Surface>
        </div>
      );
    }
    return this.props.children;
  }
}

export function StatusNotice({ tone = 'info', children }) {
  const isSuccess = tone === 'success';
  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 rounded-control border px-4 py-3 text-sm ${
        isSuccess
          ? 'border-success/30 bg-surface text-foreground'
          : 'border-border/80 bg-surface text-muted'
      }`}
    >
      {isSuccess && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
