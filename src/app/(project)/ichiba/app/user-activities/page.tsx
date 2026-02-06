import { UserActivitiesTable } from "../../components/user-activities/UserActivitiesTable";

export default async function UserActivitiesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Master Data UserActivities</h1>
        <p className="text-muted-foreground">Kelola data User Activities</p>
      </div>
      <UserActivitiesTable />
    </div>
  );
}
