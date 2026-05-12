"use client";

// biome-ignore assist/source/organizeImports: <none>
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Summary from "./_summary";
// import UnbalanceViewByTable from "./_tb_unbalance";
import { getSheetData } from "../../../_lib/googleSheets";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Page() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSprint, setSelectedSprint] = useState<string>("No Sprint");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sheetData = await getSheetData("1nWl6OVzvw2tMKyWIY-CEXFPh5F0h1FzWSRQ83vaWyXA", "647403552");
        setData(sheetData);
      } catch (error) {
        console.error("Error fetching sheet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const uniqueSprint = [...new Set(data.map((item) => item["CW1 Sprint-5"]).filter((item) => item !== "-"))].filter(
    Boolean,
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex h-32 items-center justify-center">
          <p>Loading sprint data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="font-bold text-2xl">Sprint RCI</div>
      <div className="my-4">
        <label htmlFor="sprint-select" className="font-medium text-sm">
          Select Sprint
        </label>
        <Select value={selectedSprint} onValueChange={setSelectedSprint}>
          <SelectTrigger className="w-[200px]" id="sprint-select">
            <SelectValue placeholder="Select a sprint" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="No Sprint" value="No Sprint">
              No Sprint
            </SelectItem>
            {uniqueSprint.map((sprint) => (
              <SelectItem key={sprint} value={sprint}>
                {sprint}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSprint === "No Sprint" ? (
        <div className="flex h-32 items-center justify-center rounded-lg border bg-gray-50">
          <p className="text-gray-600">Please select a sprint first</p>
        </div>
      ) : (
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="unbalance">Performance View</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <Summary data={data} selectedSprint={selectedSprint} />
          </TabsContent>

          <TabsContent value="unbalance" className="space-y-6">
            <div className="text-center text-gray-500">On progress</div>
            {/* <UnbalanceViewByTable
              unbalanceApiPath="/tinfra/api/v2/sprint/unbalance-view-table"
              data={data}
              selectedSprint={selectedSprint}
            /> */}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
