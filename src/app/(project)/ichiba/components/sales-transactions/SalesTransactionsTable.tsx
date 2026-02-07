"use client";

import { useMemo, useState } from "react";

import { endOfDay, format, parseISO, startOfDay } from "date-fns";
import { Filter, Loader2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useSalesTransactions, useUpdateSalesTarget } from "../../hooks/useSalesTransactions";
import type { SalesTransaction } from "../../types";
import { formatCurrency } from "../../utils/sales-utils";

interface SalesTransactionsTableProps {
  data?: SalesTransaction[];
  useHook?: boolean;
}

interface GroupedInvoice {
  nomor_invoice: string;
  customer: string;
  po_number: string;
  salesperson: string;
  date: string;
  transactions: SalesTransaction[];
  totalAmount: number;
  payment_status: string;
}

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "paid", label: "Paid", color: "bg-green-500" },
  // { value: "partial", label: "Partial Payment", color: "bg-blue-500" },
  // { value: "overdue", label: "Overdue", color: "bg-red-500" },
  // { value: "cancelled", label: "Cancelled", color: "bg-gray-500" },
];

export default function SalesTransactionsCardView({ data, useHook = false }: SalesTransactionsTableProps) {
  const { data: salesTransactions = [], isLoading } = useSalesTransactions();
  const { mutate: updateSalesTransaction, isPending: isUpdating } = useUpdateSalesTarget();
  const [filterState, setFilterState] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Get unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    const salespersons = new Set<string>();
    const categories = new Set<string>();
    const regions = new Set<string>();
    const types = new Set<string>();
    const products = new Set<string>();
    const po_numbers = new Set<string>();
    const nomor_invoices = new Set<string>();

    salesTransactions.forEach((transaction) => {
      if (transaction.salesperson) salespersons.add(transaction.salesperson);
      if (transaction.category) categories.add(transaction.category);
      if (transaction.region) regions.add(transaction.region);
      if (transaction.type) types.add(transaction.type);
      if (transaction.product_name) products.add(transaction.product_name);
      if (transaction.po_number) po_numbers.add(transaction.po_number);
      if (transaction.nomor_invoice) nomor_invoices.add(transaction.nomor_invoice);
    });

    return {
      salespersons: Array.from(salespersons).sort(),
      categories: Array.from(categories).sort(),
      regions: Array.from(regions).sort(),
      types: Array.from(types).sort(),
      products: Array.from(products).sort(),
      po_numbers: Array.from(po_numbers).sort(),
      nomor_invoices: Array.from(nomor_invoices).sort(),
    };
  }, [salesTransactions]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    const filterTransaction = (transaction: SalesTransaction) => {
      if (Object.keys(filterState).length === 0) return true;

      let match = true;

      // Check customer name, PO number, and invoice number
      if (filterState.searchText) {
        const searchText = filterState.searchText.toLowerCase();
        const rowCustomer = transaction.customer || "";
        const rowPoNumber = transaction.po_number || "";
        const rowNomorInvoice = transaction.nomor_invoice || "";

        const customerMatch = rowCustomer.toLowerCase().includes(searchText);
        const poMatch = rowPoNumber.toLowerCase().includes(searchText);
        const invoiceMatch = rowNomorInvoice.toLowerCase().includes(searchText);

        match = match && (customerMatch || poMatch || invoiceMatch);
      }

      // Check salesperson
      if (filterState.salesperson && filterState.salesperson !== "Semua Sales") {
        const rowSalesperson = transaction.salesperson || "";
        match = match && rowSalesperson === filterState.salesperson;
      }

      // Check PO number (exact match for dropdown)
      if (filterState.po_number && filterState.po_number !== "Semua PO Number") {
        const rowPoNumber = transaction.po_number || "";
        match = match && rowPoNumber === filterState.po_number;
      }

      // Check invoice number (exact match for dropdown)
      if (filterState.nomor_invoice && filterState.nomor_invoice !== "Semua Nomor Invoices") {
        const rowNomorInvoice = transaction.nomor_invoice || "";
        match = match && rowNomorInvoice === filterState.nomor_invoice;
      }

      // Check payment status filter
      if (filterState.payment_status && filterState.payment_status !== "Semua Status") {
        const rowPaymentStatus = transaction.payment_status || "";
        match = match && rowPaymentStatus === filterState.payment_status;
      }

      // Check date range
      if (filterState.dateFrom || filterState.dateTo) {
        try {
          const rowDate = parseISO(transaction.date);

          if (filterState.dateFrom) {
            const startDate = startOfDay(parseISO(filterState.dateFrom));
            match = match && rowDate >= startDate;
          }
          if (filterState.dateTo) {
            const endDate = endOfDay(parseISO(filterState.dateTo));
            match = match && rowDate <= endDate;
          }
        } catch (error) {
          console.error("Error parsing date:", error);
          return false;
        }
      }

      return match;
    };

    return salesTransactions.filter(filterTransaction);
  }, [salesTransactions, filterState]);

  // Group transactions by nomor_invoice
  const groupedInvoices = useMemo(() => {
    const groups: Map<string, GroupedInvoice> = new Map();

    filteredTransactions.forEach((transaction) => {
      const invoiceKey = transaction.nomor_invoice || "UNKNOWN_INVOICE";

      if (!groups.has(invoiceKey)) {
        groups.set(invoiceKey, {
          nomor_invoice: transaction.nomor_invoice || "",
          customer: transaction.customer || "",
          po_number: transaction.po_number || "",
          salesperson: transaction.salesperson || "",
          date: transaction.date,
          transactions: [],
          totalAmount: 0,
          payment_status: transaction.payment_status || "pending",
        });
      }

      const group = groups.get(invoiceKey)!;
      group.transactions.push(transaction);
      group.totalAmount += transaction.sales_amount || 0;
    });

    // Convert to array and sort by date (newest first)
    return Array.from(groups.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredTransactions]);

  // Function to update payment status
  const handleUpdatePaymentStatus = (invoice: GroupedInvoice, newStatus: string) => {
    // Update all transactions with the same invoice number
    const transactionIds = invoice.transactions.map((t) => t.id).filter(Boolean) as string[];

    if (transactionIds.length === 0) {
      console.error("No transaction IDs found for invoice:", invoice.nomor_invoice);
      return;
    }

    // Update each transaction (in practice, you might want to update all at once)
    transactionIds.forEach((id) => {
      updateSalesTransaction({
        id,
        data: { payment_status: newStatus },
      });
    });
  };

  // Get payment status display info
  const getPaymentStatusInfo = (status: string) => {
    const option = PAYMENT_STATUS_OPTIONS.find((opt) => opt.value === status) || PAYMENT_STATUS_OPTIONS[0];
    return {
      label: option.label,
      color: option.color,
      badgeClass: `inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${option.color}`,
    };
  };

  // Pagination for grouped invoices
  const totalPages = Math.ceil(groupedInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = groupedInvoices.slice(startIndex, endIndex);

  // Clear all filters
  const clearAllFilters = () => {
    setFilterState({});
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filterState).length > 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Filter Toggle Button */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
              <X className="mr-1 h-3 w-3" />
              Clear All Filters
            </Button>
          )}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-medium text-sm">Filter Lanjutan</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 text-xs">
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Combined Search Filter - Customer, PO Number, and Invoice Number */}
              <div className="space-y-2">
                <div className="font-medium text-xs">Cari (Customer/PO/Invoice)</div>
                <Input
                  placeholder="Cari customer, nomor PO, atau nomor invoice..."
                  value={filterState.searchText || ""}
                  onChange={(event) => {
                    setFilterState((prev) => ({
                      ...prev,
                      searchText: event.target.value || undefined,
                    }));
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                  className="h-8 text-sm"
                />
              </div>

              {/* Salesperson Filter */}
              <div className="space-y-2">
                <div className="font-medium text-xs">Sales</div>
                <Select
                  value={filterState.salesperson || ""}
                  onValueChange={(value) => {
                    setFilterState((prev) => ({
                      ...prev,
                      salesperson: value === "all" ? undefined : value,
                    }));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Semua Sales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Sales</SelectItem>
                    {filterOptions.salespersons.map((salesperson) => (
                      <SelectItem key={salesperson} value={salesperson}>
                        {salesperson}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status Filter */}
              <div className="space-y-2">
                <div className="font-medium text-xs">Status Pembayaran</div>
                <Select
                  value={filterState.payment_status || ""}
                  onValueChange={(value) => {
                    setFilterState((prev) => ({
                      ...prev,
                      payment_status: value === "all" ? undefined : value,
                    }));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {PAYMENT_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <div className="font-medium text-xs">Tanggal (Range)</div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Dari"
                    type="date"
                    value={filterState.dateFrom || ""}
                    onChange={(event) => {
                      setFilterState((prev) => ({
                        ...prev,
                        dateFrom: event.target.value || undefined,
                      }));
                      setCurrentPage(1);
                    }}
                    className="h-8 text-sm"
                  />
                  <Input
                    placeholder="Sampai"
                    type="date"
                    value={filterState.dateTo || ""}
                    onChange={(event) => {
                      setFilterState((prev) => ({
                        ...prev,
                        dateTo: event.target.value || undefined,
                      }));
                      setCurrentPage(1);
                    }}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              <div className="font-medium text-sm">Filter Aktif:</div>

              {Object.entries(filterState).map(([key, value]) => {
                if (!value) return null;

                let displayValue = "";
                let displayLabel = "";

                switch (key) {
                  case "searchText":
                    displayLabel = "Pencarian";
                    displayValue = value;
                    break;
                  case "salesperson":
                    displayLabel = "Sales";
                    displayValue = value;
                    break;
                  case "payment_status": {
                    displayLabel = "Status Pembayaran";
                    const statusInfo = getPaymentStatusInfo(value);
                    displayValue = statusInfo.label;
                    break;
                  }
                  case "po_number":
                    displayLabel = "Nomor PO";
                    displayValue = value;
                    break;
                  case "nomor_invoice":
                    displayLabel = "Nomor Invoice";
                    displayValue = value;
                    break;
                  case "dateFrom":
                    displayLabel = "Tanggal Dari";
                    try {
                      displayValue = format(new Date(value), "dd MMM yyyy");
                    } catch {
                      displayValue = value;
                    }
                    break;
                  case "dateTo":
                    displayLabel = "Tanggal Sampai";
                    try {
                      displayValue = format(new Date(value), "dd MMM yyyy");
                    } catch {
                      displayValue = value;
                    }
                    break;
                  default:
                    displayLabel = key;
                    displayValue = value;
                }

                return (
                  <Badge key={key} variant="secondary" className="inline-flex items-center gap-1">
                    <span>
                      {displayLabel}: {displayValue}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterState((prev) => {
                          const newState = { ...prev };
                          delete newState[key];
                          return newState;
                        });
                        setCurrentPage(1);
                      }}
                      className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="text-muted-foreground text-sm">
        Menampilkan {groupedInvoices.length} invoice
        {` (${filteredTransactions.length} transaksi)`}
        {groupedInvoices.length !== new Set(salesTransactions.map((t) => t.nomor_invoice)).size &&
          ` (difilter dari ${new Set(salesTransactions.map((t) => t.nomor_invoice)).size} total invoice)`}
      </div>

      <div className="space-y-4">
        {paginatedInvoices.map((invoice) => {
          const statusInfo = getPaymentStatusInfo(invoice.payment_status);

          return (
            <Card key={invoice.nomor_invoice} className="overflow-hidden">
              <div className="bg-muted/50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="font-semibold">{invoice.customer || "Unknown Customer"}</div>
                    <div className="mb-2 text-muted-foreground text-sm">
                      Invoice: {invoice.nomor_invoice} • PO: {invoice.po_number}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {invoice.salesperson} • {format(new Date(invoice.date), "dd MMM yyyy")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary">{formatCurrency(invoice.totalAmount)}</div>
                      <div className={statusInfo.badgeClass}>{statusInfo.label}</div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={isUpdating}>
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ubah Status"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {PAYMENT_STATUS_OPTIONS.map((status) => (
                          <DropdownMenuItem
                            key={status.value}
                            onClick={() => handleUpdatePaymentStatus(invoice, status.value)}
                            className="flex items-center gap-2"
                          >
                            <div className={`h-2 w-2 rounded-full ${status.color}`} />
                            {status.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              {/* <CardContent className="p-4 pt-2">
                <div className="text-sm text-muted-foreground">
                  {invoice.transactions.length} item • Total invoice
                </div>
              </CardContent> */}
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Halaman {currentPage} dari {totalPages} • Menampilkan {startIndex + 1}-
                {Math.min(endIndex, groupedInvoices.length)} dari {groupedInvoices.length} invoice
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 text-xs"
                >
                  Sebelumnya
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 text-xs"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 text-xs"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
