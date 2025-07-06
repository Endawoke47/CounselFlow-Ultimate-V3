"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type PaginationState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Download,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSpreadsheet,
  FileText,
  Printer,
  Copy,
  MoreHorizontal,
  X
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface AdvancedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  searchKey?: keyof TData;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  enableExport?: boolean;
  enableColumnVisibility?: boolean;
  enableGlobalFilter?: boolean;
  pageSize?: number;
  title?: string;
  description?: string;
  onRowClick?: (row: TData) => void;
  onRefresh?: () => void;
  className?: string;
}

interface FilterConfig {
  accessorKey: string;
  title: string;
  options: { label: string; value: string }[];
}

interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf' | 'json';
  includeHeaders: boolean;
  selectedColumns: string[];
  fileName: string;
}

export function AdvancedDataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  searchKey,
  searchPlaceholder = "Search...",
  filters = [],
  enableExport = true,
  enableColumnVisibility = true,
  enableGlobalFilter = true,
  pageSize = 10,
  title,
  description,
  onRowClick,
  onRefresh,
  className
}: AdvancedDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeHeaders: true,
    selectedColumns: columns.map(col => col.id || ''),
    fileName: `${title || 'data'}-export`
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const totalRows = table.getFilteredRowModel().rows.length;

  // Export functionality
  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToCSV = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: any[], filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    const rowsToExport = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows;
    const exportData = rowsToExport.map(row => {
      const rowData: any = {};
      exportOptions.selectedColumns.forEach(colId => {
        const column = columns.find(col => col.id === colId);
        if (column && column.accessorKey) {
          const value = row.getValue(column.accessorKey as string);
          rowData[column.header as string || colId] = value;
        }
      });
      return rowData;
    });

    switch (exportOptions.format) {
      case 'excel':
        exportToExcel(exportData, exportOptions.fileName);
        break;
      case 'csv':
        exportToCSV(exportData, exportOptions.fileName);
        break;
      case 'json':
        exportToJSON(exportData, exportOptions.fileName);
        break;
      default:
        toast.error('Unsupported export format');
        return;
    }

    toast.success(`Data exported as ${exportOptions.format.toUpperCase()}`);
    setIsExportModalOpen(false);
  };

  const copyToClipboard = () => {
    const rowsToExport = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows;
    const exportData = rowsToExport.map(row => {
      const rowData: any = {};
      columns.forEach(column => {
        if (column.accessorKey) {
          const value = row.getValue(column.accessorKey as string);
          rowData[column.header as string || column.id || ''] = value;
        }
      });
      return rowData;
    });

    const textData = exportData.map(row => Object.values(row).join('\t')).join('\n');
    navigator.clipboard.writeText(textData);
    toast.success('Data copied to clipboard');
  };

  const getSortIcon = (isSorted: false | "asc" | "desc") => {
    if (isSorted === "asc") return <ArrowUp className="h-4 w-4" />;
    if (isSorted === "desc") return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="space-y-2">
          {title && <h2 className="text-2xl font-bold text-counselflow-dark">{title}</h2>}
          {description && <p className="text-counselflow-neutral">{description}</p>}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          {/* Global Search */}
          {enableGlobalFilter && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-counselflow-neutral" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 border-counselflow-primary/30 focus:border-counselflow-primary"
              />
            </div>
          )}

          {/* Column Filters */}
          {filters.map((filter) => (
            <Select
              key={filter.accessorKey}
              value={(table.getColumn(filter.accessorKey)?.getFilterValue() as string) ?? ""}
              onValueChange={(value) =>
                table.getColumn(filter.accessorKey)?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[150px] border-counselflow-primary/30">
                <SelectValue placeholder={filter.title} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.title}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {/* Clear Filters */}
          {(globalFilter || columnFilters.length > 0) && (
            <Button
              variant="ghost"
              onClick={() => {
                setGlobalFilter("");
                setColumnFilters([]);
                table.resetColumnFilters();
              }}
              className="px-2 lg:px-3"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Selection Info */}
          {selectedRows.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-counselflow-primary/20 text-counselflow-primary">
                {selectedRows.length} selected
              </Badge>
            </div>
          )}

          {/* Refresh */}
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} className="border-counselflow-primary/30">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

          {/* Column Visibility */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-counselflow-primary/30">
                  <Settings className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Quick Export Actions */}
          {enableExport && (
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="border-counselflow-primary/30"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-counselflow-primary/30">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-counselflow-dark">Export Data</DialogTitle>
                    <DialogDescription className="text-counselflow-neutral">
                      Configure export options for your data.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-counselflow-dark">Export Format</Label>
                      <Select
                        value={exportOptions.format}
                        onValueChange={(value: any) => 
                          setExportOptions(prev => ({ ...prev, format: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excel">
                            <div className="flex items-center space-x-2">
                              <FileSpreadsheet className="h-4 w-4 text-green-600" />
                              <span>Excel (.xlsx)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="csv">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span>CSV (.csv)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="json">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-orange-600" />
                              <span>JSON (.json)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="filename" className="text-counselflow-dark">File Name</Label>
                      <Input
                        id="filename"
                        value={exportOptions.fileName}
                        onChange={(e) => 
                          setExportOptions(prev => ({ ...prev, fileName: e.target.value }))
                        }
                        placeholder="export-data"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-counselflow-dark">Export Scope</Label>
                      <div className="text-sm text-counselflow-neutral">
                        {selectedRows.length > 0 
                          ? `${selectedRows.length} selected rows` 
                          : `All ${totalRows} filtered rows`
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsExportModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleExport}
                      className="bg-counselflow-primary hover:bg-counselflow-dark"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-counselflow-primary/20 bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-counselflow-light/20 hover:bg-counselflow-light/30">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-counselflow-dark font-semibold">
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "flex items-center space-x-2 cursor-pointer select-none hover:text-counselflow-primary"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && getSortIcon(header.column.getIsSorted())}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-counselflow-primary" />
                    <span className="text-counselflow-neutral">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`hover:bg-counselflow-light/10 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="text-counselflow-neutral">
                    No results found.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-counselflow-neutral">
          {selectedRows.length > 0 && (
            <span className="mr-4">
              {selectedRows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
            </span>
          )}
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} entries
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-counselflow-dark">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] border-counselflow-primary/30">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium text-counselflow-dark">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex border-counselflow-primary/30"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-counselflow-primary/30"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-counselflow-primary/30"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex border-counselflow-primary/30"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}