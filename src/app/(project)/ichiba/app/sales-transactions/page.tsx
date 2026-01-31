import SalesTransactionsTable from "../../components/sales-transactions/SalesTransactionsTable";

export default async function SalesTransactionsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Penjualan</h1>
          <p className="text-muted-foreground">Kelola data penjualan</p>
        </div>
      </div>
      <SalesTransactionsTable />
    </div>
  );
}
