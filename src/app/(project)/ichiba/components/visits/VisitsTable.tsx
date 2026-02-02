"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { endOfDay, format, isWithinInterval, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, Eye, Loader2, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useDeleteVisit, useVisits } from "../../hooks/useVisits";
import type { Visit } from "../../types";

export function VisitsTable() {
  const router = useRouter();
  const { data: visits = [], isLoading, refetch } = useVisits();
  const { mutate: deleteVisit } = useDeleteVisit({
    onSuccess: () => {
      refetch();
    },
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDelete = (id: string) => {
    setVisitToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (visitToDelete) {
      deleteVisit(visitToDelete);
      setDeleteDialogOpen(false);
      setVisitToDelete(null);
    }
  };

  // Memoized filtered visits for better performance
  const filteredVisits = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
      return visits;
    }

    const start = startOfDay(dateRange.from);
    const end = endOfDay(dateRange.to);

    return visits.filter((visit) => {
      try {
        const visitDate = new Date(visit.tanggal);
        return isWithinInterval(visitDate, { start, end });
      } catch (error) {
        console.error("Error parsing date:", visit.tanggal, error);
        return false;
      }
    });
  }, [visits, dateRange.from, dateRange.to]);

  const columns: ColumnDef<Visit>[] = [
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: ({ row }) => {
        const date = new Date(row.getValue("tanggal"));
        return format(date, "dd MMM yyyy", { locale: id });
      },
    },
    {
      accessorFn: (row) => row.customer?.name || "Unknown",
      id: "customerName",
      header: "Customer",
      cell: ({ row }) => {
        const customerName = row.original.customer?.name || "Unknown";
        return (
          <div className="max-w-50 truncate" title={customerName}>
            {customerName}
          </div>
        );
      },
    },
    {
      accessorFn: (row) => row.customer?.contact_person || "-",
      id: "contactPerson",
      header: "Kontak",
    },
    {
      accessorFn: (row) => row.customer?.phone || "-",
      id: "phone",
      header: "Telepon",
    },
    {
      accessorFn: (row) => row.sales?.full_name || "-",
      header: "Salesperson",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const visit = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/ichiba/app/visits/${visit.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/ichiba/app/visits/edit/${visit.id}`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(visit.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredVisits,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range) {
      setDateRange(range);
      // Don't close the calendar automatically
      // Let user close it with the "Tutup" button
    }
  };

  const clearDateFilter = () => {
    setDateRange({});
    setShowCalendar(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <Input
              placeholder="Cari customer..."
              value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("customerName")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />

            {/* Inline Calendar for Date Range Selection */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex min-w-62.5 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setShowCalendar(!showCalendar)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setShowCalendar(!showCalendar);
                    }
                  }}
                  aria-label="Toggle date range calendar"
                >
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM yyyy", { locale: id })} -{" "}
                          {format(dateRange.to, "dd MMM yyyy", { locale: id })}
                        </>
                      ) : (
                        `${format(dateRange.from, "dd MMM yyyy", { locale: id })} - Pilih tanggal akhir`
                      )
                    ) : (
                      "Filter Tanggal"
                    )}
                  </span>
                </button>

                {(dateRange.from || dateRange.to) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateFilter}
                    className="h-8 w-8 p-0 shrink-0"
                    title="Clear filter"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {showCalendar && (
                <div className="absolute top-full left-0 z-50 mt-2 rounded-md border bg-white shadow-lg">
                  <CalendarComponent
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                    locale={id}
                    className="p-3"
                  />
                  <div className="flex justify-end gap-2 border-t p-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setDateRange({});
                        setShowCalendar(false);
                      }}
                      variant="outline"
                    >
                      Clear
                    </Button>
                    <Button size="sm" onClick={() => setShowCalendar(false)} variant="outline">
                      Tutup
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button onClick={() => router.push("/ichiba/app/visits/create")} className="shrink-0">
            <Calendar className="mr-2 h-4 w-4" />
            Visit Baru
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {dateRange.from && dateRange.to
                      ? "Tidak ada data visit pada rentang tanggal tersebut."
                      : "Tidak ada data visit."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-sm">
            <div>
              Menampilkan {table.getFilteredRowModel().rows.length} dari {filteredVisits.length} visit.
            </div>
            {dateRange.from && dateRange.to && (
              <div className="mt-1 text-xs">
                Filter: {format(dateRange.from, "dd MMM yyyy", { locale: id })} -{" "}
                {format(dateRange.to, "dd MMM yyyy", { locale: id })}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Visit</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus visit ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVisitToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
