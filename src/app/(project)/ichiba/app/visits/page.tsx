import { VisitsTable } from "../../components/visits/VisitsTable";

export default async function VisitsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Visits</h1>
        <p className="text-muted-foreground">Kelola visit to customer</p>
      </div>
      <VisitsTable />
    </div>
  );
}
