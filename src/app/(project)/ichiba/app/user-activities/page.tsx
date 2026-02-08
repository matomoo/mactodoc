"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useAuthStore } from "@/stores/auth-store";
import { UserActivitiesTable } from "../../components/user-activities/UserActivitiesTable";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function UserActivitiesPage() {
  const { user } = useAuthStore();
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== "Admin") {
    return <div>You are not authorized to view this page</div>;
  }

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
