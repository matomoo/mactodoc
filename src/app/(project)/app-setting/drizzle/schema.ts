// biome-ignore assist/source/organizeImports: <none>
import {
  pgTable,
  foreignKey,
  unique,
  pgPolicy,
  check,
  uuid,
  timestamp,
  text,
  index,
  jsonb,
  date,
  varchar,
  numeric,
  integer,
  boolean,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const rolesEnum = pgEnum("roles_enum", ["Admin", "User"]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid().primaryKey().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    username: text(),
    fullName: text("full_name"),
    avatarUrl: text("avatar_url"),
    website: text(),
    roles: rolesEnum().default("User").notNull(),
  },
  (table) => [
    unique("profiles_username_key").on(table.username),
    pgPolicy("Public profiles are viewable by everyone.", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
    pgPolicy("Users can insert their own profile.", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can update own profile.", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    check("username_length", sql`char_length(username) >= 3`),
  ],
);

export const userActivities = pgTable(
  "user_activities",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id"),
    action: text().notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    details: jsonb().default({}),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_user_activities_action").using("btree", table.action.asc().nullsLast().op("text_ops")),
    index("idx_user_activities_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
    index("idx_user_activities_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "user_activities_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "user_activities_user_id_fkey1",
    }),
    pgPolicy("for-public", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    customerId: uuid("customer_id"),
    tanggal: date().default(sql`CURRENT_DATE`).notNull(),
    marketing: varchar({ length: 100 }),
    notes: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "orders_customer_id_fkey",
    }).onDelete("cascade"),
    pgPolicy("Allow service role full access", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const testTypes = pgTable(
  "test_types",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
  },
  (table) => [
    unique("test_types_name_key").on(table.name),
    pgPolicy("for-public", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    contactPerson: varchar("contact_person", { length: 255 }),
    phone: varchar({ length: 50 }),
    email: varchar({ length: 255 }),
    address: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    jenis: varchar(),
    wilayah: varchar(),
    bpjs: varchar(),
    kerjasama: varchar(),
  },
  (table) => [
    pgPolicy("Allow public read access", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const salesTargets = pgTable(
  "sales_targets",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    targetAmount: numeric("target_amount").default("0"),
    targetUnit: varchar("target_unit", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    profilesId: uuid("profiles_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.profilesId],
      foreignColumns: [profiles.id],
      name: "sales_targets_profiles_id_fkey",
    }),
    unique("sales_targets_profiles_id_key").on(table.profilesId),
    pgPolicy("for_publiic", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const visits = pgTable(
  "visits",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    customerId: uuid("customer_id"),
    tanggal: date().default(sql`CURRENT_DATE`).notNull(),
    salesId: uuid("sales_id").defaultRandom(),
    notes: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "visits_customer_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.salesId],
      foreignColumns: [profiles.id],
      name: "visits_sales_id_fkey",
    }),
    pgPolicy("for_public", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const medicalDevices = pgTable(
  "medical_devices",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    merk: varchar(),
    type: varchar(),
    series: varchar(),
    testTypesId: uuid("test_types_id").defaultRandom(),
  },
  (table) => [
    foreignKey({
      columns: [table.testTypesId],
      foreignColumns: [testTypes.id],
      name: "medical_devices_test_types_id_fkey",
    }).onDelete("cascade"),
    unique("medical_devices_name_key").on(table.name),
    pgPolicy("for_public", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const salesTransactions = pgTable(
  "sales_transactions",
  {
    customer: text().notNull(),
    productName: text("product_name").notNull(),
    date: date().notNull(),
    salesperson: text(),
    quantity: integer().default(0).notNull(),
    salesAmount: numeric("sales_amount", { precision: 15, scale: 2 }).default("0").notNull(),
    category: text(),
    region: text(),
    type: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    id: uuid().defaultRandom().primaryKey().notNull(),
    nomorInvoice: text("nomor_invoice"),
    poNumber: text("po_number"),
    paymentStatus: text("payment_status").default("Belum Lunas").notNull(),
  },
  (table) => [
    index("idx_sales_transactions_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
    index("idx_sales_transactions_category_date").using(
      "btree",
      table.category.asc().nullsLast().op("date_ops"),
      table.date.asc().nullsLast().op("date_ops"),
    ),
    index("idx_sales_transactions_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("idx_sales_transactions_customer").using("btree", table.customer.asc().nullsLast().op("text_ops")),
    index("idx_sales_transactions_customer_date").using(
      "btree",
      table.customer.asc().nullsLast().op("date_ops"),
      table.date.asc().nullsLast().op("text_ops"),
    ),
    index("idx_sales_transactions_customer_region_date").using(
      "btree",
      table.customer.asc().nullsLast().op("text_ops"),
      table.region.asc().nullsLast().op("date_ops"),
      table.date.asc().nullsLast().op("date_ops"),
    ),
    index("idx_sales_transactions_date").using("btree", table.date.asc().nullsLast().op("date_ops")),
    index("idx_sales_transactions_date_region").using(
      "btree",
      table.date.asc().nullsLast().op("text_ops"),
      table.region.asc().nullsLast().op("text_ops"),
    ),
    index("idx_sales_transactions_date_sales_amount").using(
      "btree",
      table.date.asc().nullsLast().op("numeric_ops"),
      table.salesAmount.desc().nullsFirst().op("date_ops"),
    ),
    index("idx_sales_transactions_date_type").using(
      "btree",
      table.date.asc().nullsLast().op("date_ops"),
      table.type.asc().nullsLast().op("text_ops"),
    ),
    index("idx_sales_transactions_id").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
    index("idx_sales_transactions_product_date").using(
      "btree",
      table.productName.asc().nullsLast().op("date_ops"),
      table.date.asc().nullsLast().op("text_ops"),
    ),
    index("idx_sales_transactions_product_name").using("btree", table.productName.asc().nullsLast().op("text_ops")),
    index("idx_sales_transactions_quantity").using("btree", table.quantity.desc().nullsFirst().op("int4_ops")),
    index("idx_sales_transactions_region").using("btree", table.region.asc().nullsLast().op("text_ops")),
    index("idx_sales_transactions_region_category").using(
      "btree",
      table.region.asc().nullsLast().op("text_ops"),
      table.category.asc().nullsLast().op("text_ops"),
    ),
    index("idx_sales_transactions_region_date_category").using(
      "btree",
      table.region.asc().nullsLast().op("text_ops"),
      table.date.asc().nullsLast().op("text_ops"),
      table.category.asc().nullsLast().op("date_ops"),
    ),
    index("idx_sales_transactions_sales_amount").using(
      "btree",
      table.salesAmount.desc().nullsFirst().op("numeric_ops"),
    ),
    index("idx_sales_transactions_salesperson").using("btree", table.salesperson.asc().nullsLast().op("text_ops")),
    index("idx_sales_transactions_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
    index("idx_sales_transactions_type_date").using(
      "btree",
      table.type.asc().nullsLast().op("date_ops"),
      table.date.asc().nullsLast().op("text_ops"),
    ),
    unique("sales_transactions_customer_product_date_key").on(table.customer, table.productName, table.date),
    pgPolicy("for-public", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const catalogs = pgTable(
  "catalogs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    category: varchar({ length: 100 }).notNull(),
    description: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    imageUrl: text("image_url"),
    externalStoreUrl: text("external_store_url"),
    brochureUrl: text("brochure_url"),
    isActive: boolean("is_active").default(true),
    featured: boolean().default(false),
    tags: text().array().default([""]),
  },
  (table) => [
    index("idx_catalog_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
    index("idx_catalog_title").using("btree", table.title.asc().nullsLast().op("text_ops")),
    index("idx_catalogs_featured").using("btree", table.featured.asc().nullsLast().op("bool_ops")),
    index("idx_catalogs_is_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
    index("idx_catalogs_tags").using("gin", table.tags.asc().nullsLast().op("array_ops")),
    pgPolicy("for-public", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const orderTests = pgTable(
  "order_tests",
  {
    orderId: uuid("order_id").notNull(),
    testTypeId: uuid("test_type_id").notNull(),
    result: text(),
    status: varchar({ length: 50 }).default("pending"),
  },
  (table) => [
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: "order_tests_order_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.testTypeId],
      foreignColumns: [testTypes.id],
      name: "order_tests_test_type_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.orderId, table.testTypeId],
      name: "order_tests_pkey",
    }),
    pgPolicy("for_public", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const customerMedicalDevices = pgTable(
  "customer__medical_devices",
  {
    customerId: uuid("customer_id").notNull(),
    medicalDevicesId: uuid("medical_devices_id").notNull(),
    contract: text(),
    status: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "customer__medical_devices_customer_id_fkey",
    }),
    foreignKey({
      columns: [table.medicalDevicesId],
      foreignColumns: [medicalDevices.id],
      name: "customer__medical_devices_medical_devices_id_fkey1",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.customerId, table.medicalDevicesId],
      name: "customer__medical_devices_pkey",
    }),
  ],
);

export const visitMedicals = pgTable(
  "visit_medicals",
  {
    visitId: uuid("visit_id").notNull(),
    medicalDevicesId: uuid("medical_devices_id").notNull(),
    result: text(),
    status: varchar({ length: 50 }).default("pending"),
  },
  (table) => [
    foreignKey({
      columns: [table.medicalDevicesId],
      foreignColumns: [medicalDevices.id],
      name: "visit_medicals_medical_devices_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.visitId],
      foreignColumns: [visits.id],
      name: "visit_medicals_visit_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.visitId, table.medicalDevicesId],
      name: "visit_medical_devices_pkey",
    }),
    pgPolicy("for_public", {
      as: "permissive",
      for: "all",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);
