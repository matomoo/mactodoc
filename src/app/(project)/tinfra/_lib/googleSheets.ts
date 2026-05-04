// lib/googleSheets.js
import Papa from "papaparse";

export async function getSheetData(sheetId: string, gid: string) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  const res = await fetch(url, { cache: "no-store" }); // or use next: { revalidate: 60 } for caching
  const csv = await res.text();

  const { data } = Papa.parse(csv, {
    header: true, // first row becomes object keys
    skipEmptyLines: true,
  });

  return data;
}
