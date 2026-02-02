export interface Customer {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  tanggal: string;
  marketing: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}
export interface Visit {
  id: string;
  customer_id: string;
  tanggal: string;
  sales_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  sales?: Profiles;
}

export interface SalesTransaction {
  customer: string;
  product_name: string;
  date: string;
  salesperson: string;
  quantity: number | 0;
  sales_amount: number | 0;
  category: string | null;
  region: string;
  type: string;
}

export interface CustomerSalesSummary {
  customer: string;
  total_sales: number;
  transaction_count: number;
  region: string;
  salespersons: string[];
}

export interface RegionSalesSummary {
  region: string;
  total_sales: number;
  transaction_count: number;
  salespersons: string[];
}

export interface SalespersonSalesSummary {
  salesperson: string;
  total_sales: number;
  transaction_count: number;
}

export interface TypeSummary {
  type: string;
  total_sales: number;
  transaction_count: number;
}

export interface TestType {
  id: string;
  name: string;
  description: string | null;
}

export interface OrderTest {
  order_id: string;
  test_type_id: string;
  result: string | null;
  status: string;
  test_type?: TestType;
}
export interface VisitMedicalDevice {
  visit_id: string;
  medical_device_id: string;
  result: string | null;
  status: string;
  medical_device?: MedicalDevices;
}

export interface OrderWithDetails extends Order {
  customer: Customer;
  order_tests: (OrderTest & { test_type: TestType })[];
}
export interface VisitWithDetails extends Visit {
  customer: Customer;
  visit_medical_devices: (VisitMedicalDevice & {
    medical_device: MedicalDevices;
  })[];
}

export interface MedicalDevices {
  id: string;
  name: string;
  description: string | null;
}

export interface Profiles {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  roles: string | null;
  updated_at: string;
}

export interface Catalog {
  id: string;
  title: string;
  category: string | null;
  image_url: string | null;
  external_store_url: string | null;
  brochure_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}
