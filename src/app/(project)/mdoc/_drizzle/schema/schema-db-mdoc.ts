// biome-ignore assist/source/organizeImports: <none>
import { pgTable, index, timestamp, doublePrecision, varchar, integer, time } from "drizzle-orm/pg-core";

export const sulwCellList4Gv3 = pgTable("SulwCellList4Gv3", {
  week: varchar("Week", { length: 255 }),
  nop: varchar("NOP", { length: 255 }),
  kabupaten: varchar("KABUPATEN", { length: 255 }),
  idxSubMeEnodebCell: varchar("idx_sub_me_enodeb_cell", {
    length: 255,
  }).notNull(),
  idxSiteCell: varchar("idx_site_cell", { length: 255 }),
  idxSiteidSector: varchar("idx_siteid_sector", { length: 255 }),
  siteId: varchar("Site ID", { length: 255 }),
  subnetwork: integer("Subnetwork"),
  managedElement: integer("ManagedElement"),
  eNodeB: integer(),
  cell: integer("Cell"),
  band: varchar("BAND", { length: 255 }),
  powerCellExecuted: varchar("Power - Cell Executed", { length: 255 }),
  powerSiteLevel: varchar("Power - Site Level", { length: 255 }),
  powerSectorExecuted: varchar("Power - Sector Executed", { length: 255 }),
  remarkPower: varchar("Remark - Power", { length: 255 }),
});
