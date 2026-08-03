import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SqacStore {
  dateStart: string | null;
  dateEnd: string | null;
  setDateStart: (date: string | null) => void;
  setDateEnd: (date: string | null) => void;
}

export const useSqacStore = create<SqacStore>()(
  persist(
    (set) => ({
      dateStart: null,
      dateEnd: null,
      setDateStart: (date) => set({ dateStart: date }),
      setDateEnd: (date) => set({ dateEnd: date }),
    }),
    {
      name: "sqac-store",
    },
  ),
);
