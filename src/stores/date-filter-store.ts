import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DateFilterState = {
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
  setStartMonth: (month: number) => void;
  setStartYear: (year: number) => void;
  setEndMonth: (month: number) => void;
  setEndYear: (year: number) => void;
  setDateRange: (params: { startMonth?: number; startYear?: number; endMonth?: number; endYear?: number }) => void;
  resetFilters: () => void;
};

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export const useDateFilterStore = create<DateFilterState>()(
  persist(
    (set) => ({
      startMonth: 1,
      startYear: currentYear,
      endMonth: currentMonth,
      endYear: currentYear,

      setStartMonth: (month) => set({ startMonth: month }),
      setStartYear: (year) => set({ startYear: year }),
      setEndMonth: (month) => set({ endMonth: month }),
      setEndYear: (year) => set({ endYear: year }),

      setDateRange: (params) =>
        set((state) => ({
          startMonth: params.startMonth ?? state.startMonth,
          startYear: params.startYear ?? state.startYear,
          endMonth: params.endMonth ?? state.endMonth,
          endYear: params.endYear ?? state.endYear,
        })),

      resetFilters: () =>
        set({
          startMonth: 1,
          startYear: currentYear,
          endMonth: currentMonth,
          endYear: currentYear,
        }),
    }),
    {
      name: "date-filter-storage",
    },
  ),
);
