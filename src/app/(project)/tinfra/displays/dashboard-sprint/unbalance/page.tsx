/** biome-ignore-all lint/suspicious/noExplicitAny: <none> */

// biome-ignore assist/source/organizeImports: <none>
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Summary from "./_summary";
import UnbalanceViewByTable from "./_tb_unbalance";
import { getSheetData } from "../../../_lib/googleSheets";

export default async function Page() {
  const data = await getSheetData("1LrmNvW_drnU6tUVGxwr_wrAySjKj6wTenxGHc0XipGk", "1000919754");

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="unbalance">Unbalance View</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Summary />
        </TabsContent>

        <TabsContent value="unbalance" className="space-y-6">
          <UnbalanceViewByTable unbalanceApiPath="/tinfra/api/v2/sprint/unbalance-view-table" data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
