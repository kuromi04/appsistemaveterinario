import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage: number;
}

interface UsePaginationReturn<T> {
  currentItems: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function usePagination<T>({ data, itemsPerPage }: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  // Reset to page 1 when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return {
    currentItems,
    currentPage,
    totalPages,
    totalItems,
    setCurrentPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev
  };
}