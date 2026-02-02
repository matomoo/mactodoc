import { CatalogsTable } from "../../components/catalogs/CatalogsTable";

export default async function CatalogsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Master Data Catalogs</h1>
        <p className="text-muted-foreground">Kelola data catalogs</p>
      </div>
      <CatalogsTable />
    </div>
  );
}
