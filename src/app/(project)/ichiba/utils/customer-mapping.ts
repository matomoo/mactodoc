// utils/customerMappings.ts
export const jenisMapping: Record<string, string> = {
  klinik: "Klinik",
  rs: "RS (Rumah Sakit)",
  rsud: "RSUD",
};

export const bpjsMapping: Record<string, string> = {
  ya: "Ya",
  tidak: "Tidak",
};

export const kerjasamaMapping: Record<string, string> = {
  ya: "Ya",
  belum: "Belum",
};

// Helper function to get display name
export const getDisplayName = (value: string, mapping: Record<string, string>): string => {
  return value ? mapping[value] || value : "-";
};
