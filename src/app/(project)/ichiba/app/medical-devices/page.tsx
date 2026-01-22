import { MedicalDevicesTable } from "../../components/medical-devices/MedicalDevicesTable";

export default async function OrdersPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Master Data Medical Devices</h1>
        <p className="text-muted-foreground">Kelola data medical devices</p>
      </div>
      <MedicalDevicesTable />
    </div>
  );
}
