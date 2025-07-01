import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { AddExpense } from "./_components/addExpense";
import { Addreservation } from "../reservation/_components/Add";

// Filter input component for columns

export function DataTable({ columns, data, amountColumn = "amount" }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  // Calculate total amount from filtered data
  const totalAmount = table.getFilteredRowModel().rows.reduce((sum, row) => {
    const amount = parseFloat(row.original[amountColumn]) || 0;
    return sum + amount;
  }, 0);

  // Function to export data as CSV
  const pathname = usePathname();
  const exportToCSV = () => {
    // Get filtered data
    const filteredData = table.getFilteredRowModel().rows.map(row => row.original);
    
    // Convert to CSV format
    const headers = columns
      .filter(col => col.id !== "actions" && col.accessorKey)
      .map(col => col.header || col.accessorKey);
    
    const dataRows = filteredData.map(item =>
      columns
        .filter(col => col.id !== "actions" && col.accessorKey)
        .map(col => item[col.accessorKey])
    );
    
    const csv = [
      headers.join(','),
      ...dataRows.map(row => row.join(','))
    ].join('\n');

    
    
    // Create and download CSV file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    if (typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${pathname.replace('/', '')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

 

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        {/* Global search input */}
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          {
            pathname === "/expenses" && ( <AddExpense/>)
          }
          {
            pathname === "/reservation" && (<Addreservation/>)
          }
        {/* Export button */}
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        </div>
      </div>
      
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div>
                        <div className="flex items-center justify-between">
                          {/* Column header with conditional sort functionality */}
                          {header.column.getCanSort() ? (
                            <Button
                              variant="ghost"
                              onClick={() => header.column.toggleSorting()}
                              className="cursor-pointer select-none"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          ) : (
                            <div className="font-medium">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </div>
                          )}
                          
                        </div>
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {/* Footer with total calculation */}
          <TableFooter>
            {
              pathname === "/dashboard/expenses" && (
                <TableRow>
                <TableCell colSpan={columns.findIndex(col => col.accessorKey === amountColumn)}>
                  <div className="text-right font-medium">Total:</div>
                </TableCell>
                <TableCell className="font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(totalAmount)}
                </TableCell>
                <TableCell colSpan={columns.length - columns.findIndex(col => col.accessorKey === amountColumn) - 1}></TableCell>
              </TableRow>
              ) 
            }
          </TableFooter>
        </Table>
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} entries
        </div>
      </div>
    </div>
  );
}