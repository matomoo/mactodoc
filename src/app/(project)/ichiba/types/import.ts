export interface ExcelData {
  Pelanggan: string;
  "Nama Barang": string;
  Tanggal: string;
  "Nama Default Penjual Pelang": string;
  Kuantitas: number;
  Penjualan: number;
  Category: string;
  Wilayah: string;
  Type: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  insertedCount?: number;
  error?: string;
}

export type ColumnMapping = {
  [key in keyof ExcelData]: string;
};
