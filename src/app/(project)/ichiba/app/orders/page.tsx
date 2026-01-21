import { OrdersTable } from "../../components/orders/OrdersTable";
import { ordersService } from "../../lib/services/orders";

export default async function OrdersPage() {
  const orders = await ordersService.getAll();
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Order Laboratorium</h1>
        <p className="text-muted-foreground">Kelola order tes laboratorium</p>
      </div>
      <OrdersTable data={orders} />
    </div>
  );
}
