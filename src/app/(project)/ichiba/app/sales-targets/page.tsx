import { SalesTargetsTable } from "../../components/sales-targets/SalesTargetsTable";

export default async function SalesTargetsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Master Data SalesTargets</h1>
        <p className="text-muted-foreground">Kelola data sales targets</p>
      </div>
      <SalesTargetsTable />
    </div>
  );
}
