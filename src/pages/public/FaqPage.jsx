import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { EmptyState, Surface } from '../../components/common/ui';
import { PLATFORM_FAQS } from '../../data/statistics';

export default function FaqPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openId, setOpenId] = useState(PLATFORM_FAQS[0]?.id || '');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(PLATFORM_FAQS.map((f) => f.category)));
    return ['All', ...unique];
  }, []);

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLATFORM_FAQS.filter((faq) => {
      if (selectedCategory !== 'All' && faq.category !== selectedCategory) return false;
      if (q) {
        const text = `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [query, selectedCategory]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-display text-foreground">Frequently asked questions</h1>
        <p className="mt-2 text-sm text-muted">
          Answers regarding donor privacy, hospital blood request verification, clinical screening
          boundaries, and voluntary donation ethics in Nepal.
        </p>
      </div>

      <Surface className="space-y-4 p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search frequently asked questions"
            placeholder="Search questions about privacy, screening, hospitals, or fees..."
            className="min-h-11 w-full rounded-control border border-border bg-surface pr-4 pl-9 text-sm text-foreground placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-9 rounded-control border px-3 text-xs font-medium transition-colors ${
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-foreground hover:bg-background'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </Surface>

      {filteredFaqs.length === 0 ? (
        <Surface className="p-6">
          <EmptyState
            title="No FAQ entries match your search"
            description="Reset the search term or select 'All' categories to view every policy question."
            actionLabel="Show all questions"
            onAction={() => {
              setQuery('');
              setSelectedCategory('All');
            }}
          />
        </Surface>
      ) : (
        <Surface className="divide-y divide-border/60">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? '' : faq.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <div>
                    <span className="text-xs font-medium text-primary">{faq.category}</span>
                    <h2 className="mt-1 text-base font-semibold text-foreground">{faq.question}</h2>
                  </div>
                  <ChevronDown
                    className={`mt-1 h-4 w-4 shrink-0 text-muted transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
                )}
              </div>
            );
          })}
        </Surface>
      )}
    </div>
  );
}
