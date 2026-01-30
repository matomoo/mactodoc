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
