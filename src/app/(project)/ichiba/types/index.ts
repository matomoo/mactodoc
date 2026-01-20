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

export interface OrderWithDetails extends Order {
  customer: Customer;
  order_tests: (OrderTest & { test_type: TestType })[];
}
