import React, { memo, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface OptimizedTableProps {
  data: any[];
  columns: Column[];
  emptyMessage?: string;
  maxHeight?: string;
}

export const OptimizedTable = memo(({ data, columns, emptyMessage = "Nenhum dado encontrado", maxHeight = "400px" }: OptimizedTableProps) => {
  const renderedRows = useMemo(() => {
    return data.map((row, index) => (
      <TableRow key={`${row.id || index}`}>
        {columns.map((column) => (
          <TableCell key={column.key}>
            {column.render ? column.render(row[column.key], row) : row[column.key]}
          </TableCell>
        ))}
      </TableRow>
    ));
  }, [data, columns]);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ maxHeight }} className="overflow-auto border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderedRows}
        </TableBody>
      </Table>
    </div>
  );
});

OptimizedTable.displayName = 'OptimizedTable';