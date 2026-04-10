import { create } from "zustand";
import { persist } from "zustand/middleware";

interface summaryState {
  // State
  dateRange2: string | null;
  filter: string | null;
  clusterFilter: string[] | null;
  siteId: string | null;
  nop: string | null;
  region: string | null;
  kabupaten: string | null;
  kecamatan: string | null;
  batch: string | null;
  weekRange: [number, number];
  yearweek: string | null;

  // Actions
  setDateRange2: (range: string | null) => void;
  setFilter: (filter: string | null) => void;
  setClusterFilter: (clusterFilter: string[] | null) => void;
  setSiteId: (siteId: string | null) => void;
  setNop: (nop: string | null) => void;
  setRegion: (region: string | null) => void;
  setKabupaten: (kabupaten: string | null) => void;
  setKecamatan: (kecamatan: string | null) => void;
  setBatch: (batch: string | null) => void;
  setWeekRange: (range: [number, number]) => void;
  setYearweek: (yearweek: string | null) => void;

  // Helper to get all params as object
  getParams: () => {
    dateRange2: string | null;
    filter: string | null;
    clusterFilter: string[] | null;
    siteId: string | null;
    nop: string | null;
    region: string | null;
    kabupaten: string | null;
    kecamatan: string | null;
    batch: string | null;
    weekRange: [number, number];
    yearweek: string | null;
  };
}

export const useSummaryStore = create<summaryState>()(
  persist(
    (set, get) => ({
      // Initial state
      dateRange2: null,
      filter: null,
      clusterFilter: null,
      siteId: null,
      nop: null,
      region: null,
      kabupaten: null,
      kecamatan: null,
      batch: null,
      weekRange: [202601, 202652], // Default to full year 2026
      yearweek: null,

      // Actions
      setDateRange2: (range) => set({ dateRange2: range }),
      setFilter: (filter) => set({ filter: filter }),
      setClusterFilter: (clusterFilter) => set({ clusterFilter: clusterFilter }),

      setSiteId: (siteId) => set({ siteId: siteId }),
      setNop: (nop) => set({ nop: nop }),
      setRegion: (region) => set({ region: region }),
      setKabupaten: (kabupaten) => set({ kabupaten: kabupaten }),
      setKecamatan: (kecamatan) => set({ kecamatan: kecamatan }),
      setBatch: (batch) => set({ batch: batch }),
      setWeekRange: (range) => set({ weekRange: range }),
      setYearweek: (yearweek) => set({ yearweek: yearweek }),

      // Helper function
      getParams: () => {
        const state = get();
        return {
          dateRange2: state.dateRange2,
          filter: state.filter,
          clusterFilter: state.clusterFilter,
          siteId: state.siteId,
          nop: state.nop,
          region: state.region,
          kabupaten: state.kabupaten,
          kecamatan: state.kecamatan,
          batch: state.batch,
          weekRange: state.weekRange,
          yearweek: state.yearweek,
        };
      },
    }),
    {
      name: "summary-storage", // name of the item in localStorage
    },
  ),
);
