import { ProfilesTable } from "../../components/profiles/ProfilesTable";

export default async function ProfilesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Master Data Profiles</h1>
        <p className="text-muted-foreground">Kelola data profiles</p>
      </div>
      <ProfilesTable />
    </div>
  );
}
