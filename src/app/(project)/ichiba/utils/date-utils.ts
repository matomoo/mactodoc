export const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const getYears = (startYear = 2000) => {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push({ value: year, label: year.toString() });
  }

  return years;
};

export const formatDateRange = (startMonth: number, startYear: number, endMonth: number, endYear: number): string => {
  const startMonthName = months.find((m) => m.value === startMonth)?.label || "";
  const endMonthName = months.find((m) => m.value === endMonth)?.label || "";

  return `${startMonthName} ${startYear} - ${endMonthName} ${endYear}`;
};

export const isValidDateRange = (startMonth: number, startYear: number, endMonth: number, endYear: number): boolean => {
  if (startYear > endYear) return false;
  if (startYear === endYear && startMonth > endMonth) return false;
  return true;
};

/**
 * Check if a date falls within the specified month/year range
 */
export const isDateInRange = (
  dateString: string,
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number,
): boolean => {
  const date = new Date(dateString);
  const dateMonth = date.getMonth() + 1; // JavaScript months are 0-indexed
  const dateYear = date.getFullYear();

  // Convert dates to comparable numeric values (YYYYMM format)
  const dateValue = dateYear * 100 + dateMonth;
  const startValue = startYear * 100 + startMonth;
  const endValue = endYear * 100 + endMonth;

  return dateValue >= startValue && dateValue <= endValue;
};

/**
 * Filter transactions by date range
 */
export const filterTransactionsByDateRange = <T extends { date: string }>(
  transactions: T[],
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number,
): T[] => {
  return transactions.filter((transaction) =>
    isDateInRange(transaction.date, startMonth, startYear, endMonth, endYear),
  );
};

/**
 * Get all unique months from transactions for year selection validation
 */
export const getAvailableMonthsFromTransactions = (transactions: Array<{ date: string }>) => {
  const monthSet = new Set<number>();
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    monthSet.add(date.getMonth() + 1);
  });
  return Array.from(monthSet).sort((a, b) => a - b);
};

/**
 * Get all unique years from transactions
 */
export const getAvailableYearsFromTransactions = (transactions: Array<{ date: string }>) => {
  const yearSet = new Set<number>();
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    yearSet.add(date.getFullYear());
  });
  return Array.from(yearSet).sort((a, b) => b - a); // Descending order
};
