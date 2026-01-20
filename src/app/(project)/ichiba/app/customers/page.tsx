// biome-ignore assist/source/organizeImports: <none>
import { customersService } from "../../lib/services/customers";
import CustomersTable from "../../components/customers/CustomersTable";

export default async function CustomersPage() {
  const customers = await customersService.getAll();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Customers</h1>
          <p className="text-muted-foreground">Kelola data customer laboratorium</p>
        </div>
      </div>
      <CustomersTable data={customers} />
    </div>
  );
}
