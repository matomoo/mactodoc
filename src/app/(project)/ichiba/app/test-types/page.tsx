import { TestTypesTable } from "../../components/test-types/TestTypesTable";

export default async function TestTypesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Master Data TestTypes</h1>
        <p className="text-muted-foreground">Kelola data test types</p>
      </div>
      <TestTypesTable />
    </div>
  );
}
