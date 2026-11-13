import { useMemo, useState } from 'react';

export function usePagination(items = [], pageSize = 6) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    currentPage: safePage,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    setCurrentPage,
    resetPage: () => setCurrentPage(1),
  };
}
