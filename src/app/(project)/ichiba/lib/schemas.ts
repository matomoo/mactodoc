import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
});

export const orderSchema = z.object({
  customer_id: z.string().min(1, "Customer wajib dipilih"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  marketing: z.string().optional(),
  notes: z.string().optional(),
  test_types: z.array(z.string()).min(1, "Pilih minimal satu jenis tes"),
});

export const visitSchema = z.object({
  customer_id: z.string().min(1, "Customer wajib dipilih"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  marketing: z.string().optional(),
  notes: z.string().optional(),
  medical_devices: z.array(z.string()).min(1, "Pilih minimal satu medical device"),
});

export const medicalDeviceSchema = z.object({
  name: z.string().min(1, "Nama Medical Device wajib diisi"),
  description: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type VisitFormData = z.infer<typeof visitSchema>;
export type MedicalDeviceFormData = z.infer<typeof medicalDeviceSchema>;
