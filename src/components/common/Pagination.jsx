import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-5">
      <p className="text-sm tabular-nums text-muted">
        Showing <span className="font-medium text-foreground">{startItem}</span>–
        <span className="font-medium text-foreground">{endItem}</span> of{' '}
        <span className="font-medium text-foreground">{totalItems}</span> records
      </p>

      <div className="flex flex-wrap items-center gap-1.5" role="navigation" aria-label="Pagination">
        <Button
          tone="quiet"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`min-h-9 min-w-9 rounded-control px-3 text-sm font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              page === currentPage
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-surface text-foreground hover:bg-background'
            }`}
          >
            {page}
          </button>
        ))}

        <Button
          tone="quiet"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
