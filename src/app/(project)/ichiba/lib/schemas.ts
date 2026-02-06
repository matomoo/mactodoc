import { z } from "zod";

// nama kolom disini harus sesuai dengan nama properti di database
export const customerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
});

export const profileSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  full_name: z.string().optional(),
  avatar_url: z.string().optional(),
  website: z.string().optional(),
  roles: z.string().optional(),
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
  sales_id: z.string().min(1, "Sales wajib dipilih"),
  notes: z.string().optional(),
  medical_devices: z.array(z.string()).min(1, "Pilih minimal satu medical device"),
});

export const medicalDeviceSchema = z.object({
  name: z.string().min(1, "Nama Medical Device wajib diisi"),
  description: z.string().optional(),
  merk: z.string().optional(),
  type: z.string().optional(),
  series: z.string().optional(),
  test_types_id: z.string().min(1, "Test Type wajib diisi"),
});

export const catalogSchema = z.object({
  title: z.string().min(1, "Title wajib diisi"),
  category: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().optional(),
  external_store_url: z.string().optional(),
  brochure_url: z.string().optional(),
});

export const testTypeSchema = z.object({
  name: z.string().min(1, "Nama Test Type wajib diisi"),
  description: z.string().optional(),
});

export const userActivitiesSchema = z.object({
  user_id: z.string().min(1, "UserId wajib diisi"),
  action: z.string().min(1, "Action wajib diisi"),
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
  details: z.string().optional(),
});

export const salesTargetSchema = z.object({
  profiles_id: z.string().min(1, "Sales wajib dipilih"),
  target_amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "Target amount must be positive"),
  ),
  target_unit: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type VisitFormData = z.infer<typeof visitSchema>;
export type MedicalDeviceFormData = z.infer<typeof medicalDeviceSchema>;
export type CatalogFormData = z.infer<typeof catalogSchema>;
export type TestTypeFormData = z.infer<typeof testTypeSchema>;
export type SalesTargetFormData = z.infer<typeof salesTargetSchema>;
export type UserActivitiesFormData = z.infer<typeof userActivitiesSchema>;
