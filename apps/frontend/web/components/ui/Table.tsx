import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const tableVariants = cva(
  'w-full border-collapse',
  {
    variants: {
      variant: {
        default: 'border border-slate-200',
        minimal: 'border-0',
        striped: 'border border-slate-200',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const tableHeaderVariants = cva(
  'text-left font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-slate-50 border-b border-slate-200 text-slate-900',
        minimal: 'border-b border-slate-200 text-slate-700',
        dark: 'bg-slate-900 text-white border-b border-slate-700',
      },
      size: {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const tableCellVariants = cva(
  'text-left',
  {
    variants: {
      variant: {
        default: 'border-b border-slate-200 text-slate-900',
        minimal: 'border-b border-slate-100 text-slate-900',
        striped: 'border-b border-slate-200 text-slate-900',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const tableRowVariants = cva(
  'transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'hover:bg-slate-50',
        minimal: 'hover:bg-slate-50',
        striped: 'even:bg-slate-50 hover:bg-slate-100',
      },
      clickable: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      clickable: false,
    },
  }
);

export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  children?: React.ReactNode;
}

export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode;
}

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children?: React.ReactNode;
}

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement>,
    VariantProps<typeof tableRowVariants> {
  children?: React.ReactNode;
}

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof tableHeaderVariants> {
  children?: React.ReactNode;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof tableCellVariants> {
  children?: React.ReactNode;
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div className="relative overflow-x-auto">
        <table
          ref={ref}
          className={tableVariants({ variant, size, className })}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead ref={ref} className={className} {...props}>
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody ref={ref} className={className} {...props}>
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, variant, clickable, children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={tableRowVariants({ variant, clickable, className })}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, variant, size, sortable, sortDirection, onSort, children, ...props }, ref) => {
    const SortIcon = () => {
      if (!sortable) return null;
      
      return (
        <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sortDirection === 'asc' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          )}
          {sortDirection === 'desc' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          )}
          {!sortDirection && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          )}
        </svg>
      );
    };

    return (
      <th
        ref={ref}
        className={`${tableHeaderVariants({ variant, size, className })} ${
          sortable ? 'cursor-pointer select-none hover:bg-slate-100' : ''
        }`}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div className="flex items-center">
          {children}
          <SortIcon />
        </div>
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={tableCellVariants({ variant, size, className })}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

// Table Container for better responsive handling
export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  maxHeight?: string;
}

const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  ({ className, maxHeight, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative overflow-auto border border-slate-200 rounded-lg ${className || ''}`}
        style={{ maxHeight }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TableContainer.displayName = 'TableContainer';

// Pagination Component for Tables
export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-slate-700">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-700">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-1 text-sm text-slate-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-1 text-sm border rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Empty State Component for Tables
export interface TableEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-4">{description}</p>
      {action}
    </div>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableContainer,
  TablePagination,
  TableEmptyState,
  tableVariants,
  tableHeaderVariants,
  tableCellVariants,
  tableRowVariants,
};