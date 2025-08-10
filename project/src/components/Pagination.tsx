import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  hasNext,
  hasPrev
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 px-4 py-3 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Mostrando <span className="font-medium">{startItem}</span> a{' '}
        <span className="font-medium">{endItem}</span> de{' '}
        <span className="font-medium">{totalItems}</span> resultados
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          title="Primera página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          title="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex space-x-1">
          {getVisiblePages().map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                page === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          title="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          title="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;