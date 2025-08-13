import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  className?: string;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <table
        className={`w-full caption-bottom text-sm ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <thead
        className={`border-b ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <tbody
        className={`divide-y ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <tr
        className={`border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <th
        className={`h-12 px-4 text-left align-middle font-semibold text-gray-700 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <td
        className={`p-4 align-middle ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);