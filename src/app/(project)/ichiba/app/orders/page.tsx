import { OrdersTable } from "../../components/orders/OrdersTable";

export default async function OrdersPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Order Laboratorium</h1>
        <p className="text-muted-foreground">Kelola order tes laboratorium</p>
      </div>
      <OrdersTable />
    </div>
  );
}
