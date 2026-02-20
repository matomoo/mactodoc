import { ProfilesTable } from "../../component/profiles/ProfilesTable";

export default async function CustomersPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Profiles</h1>
          <p className="text-muted-foreground">Kelola data app profiles</p>
        </div>
      </div>
      <ProfilesTable />
    </div>
  );
}
