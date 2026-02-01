// utils/sales-utils.ts

import type {
  CustomerSalesSummary,
  RegionSalesSummary,
  SalespersonSalesSummary,
  SalesTransaction,
  TypeSummary,
} from "../types";

export function summarizeSalesByCustomer(transactions: SalesTransaction[]): CustomerSalesSummary[] {
  const customerMap = new Map<string, CustomerSalesSummary>();

  transactions.forEach((transaction) => {
    const existing = customerMap.get(transaction.customer);

    if (existing) {
      existing.total_sales += transaction.sales_amount;
      existing.transaction_count += 1;
      if (!existing.salespersons.includes(transaction.salesperson)) {
        existing.salespersons.push(transaction.salesperson);
      }
    } else {
      customerMap.set(transaction.customer, {
        customer: transaction.customer,
        total_sales: transaction.sales_amount,
        transaction_count: 1,
        region: transaction.region,
        salespersons: [transaction.salesperson],
      });
    }
  });

  // Convert to array and sort by total sales (descending)
  return Array.from(customerMap.values()).sort((a, b) => b.total_sales - a.total_sales);
}

export function summarizeSalesByRegion(transactions: SalesTransaction[]): RegionSalesSummary[] {
  const regionMap = new Map<string, RegionSalesSummary>();

  transactions.forEach((transaction) => {
    const existing = regionMap.get(transaction.region);

    if (existing) {
      existing.total_sales += transaction.sales_amount;
      existing.transaction_count += 1;
      if (!existing.salespersons.includes(transaction.salesperson)) {
        existing.salespersons.push(transaction.salesperson);
      }
    } else {
      regionMap.set(transaction.region, {
        region: transaction.region,
        total_sales: transaction.sales_amount,
        transaction_count: 1,
        salespersons: [transaction.salesperson],
      });
    }
  });

  return Array.from(regionMap.values()).sort((a, b) => b.total_sales - a.total_sales);
}

export function summarizeSalesBySalesperson(transactions: SalesTransaction[]): SalespersonSalesSummary[] {
  const salespersonMap = new Map<string, SalespersonSalesSummary>();

  transactions.forEach((transaction) => {
    const existing = salespersonMap.get(transaction.salesperson);

    if (existing) {
      existing.total_sales += transaction.sales_amount;
      existing.transaction_count += 1;
    } else {
      salespersonMap.set(transaction.salesperson, {
        salesperson: transaction.salesperson,
        total_sales: transaction.sales_amount,
        transaction_count: 1,
      });
    }
  });

  return Array.from(salespersonMap.values()).sort((a, b) => b.total_sales - a.total_sales);
}

export function summarizeSalesByType(transactions: SalesTransaction[]): TypeSummary[] {
  const typeMap = new Map<string, TypeSummary>();

  transactions.forEach((transaction) => {
    const existing = typeMap.get(transaction.type);

    if (existing) {
      existing.total_sales += transaction.sales_amount;
      existing.transaction_count += 1;
    } else {
      typeMap.set(transaction.type, {
        type: transaction.type,
        total_sales: transaction.sales_amount,
        transaction_count: 1,
      });
    }
  });

  return Array.from(typeMap.values()).sort((a, b) => b.total_sales - a.total_sales);
}

// Format currency helper
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
