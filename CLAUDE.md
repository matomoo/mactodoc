# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Macto Dashboard is a Next.js 16 (App Router) application for telecom network performance monitoring. It displays site-level performance data from Supabase/PostgreSQL databases with charting, filtering, and aggregate views.

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run Biome linter
npm run format       # Format with Biome
npm run check        # Type-check with Biome
npm run check:fix    # Auto-fix linting issues
```

## Tech Stack

- **Framework**: Next.js 16, App Router, TypeScript
- **Styling**: Tailwind CSS v4, Shadcn UI
- **State**: Zustand (persisted filter stores)
- **Data Fetching**: TanStack Query v5
- **Tables**: TanStack Table v8
- **Charts**: Chart.js, Recharts
- **Validation**: Zod
- **Linting**: Biome (no ESLint/Prettier)

## Architecture

### Route Groups
- `(auth)` — Login/register pages
- `(external)` — Public landing page
- `(main)` — Dashboard layout with sidebar
- `(project)` — Tinfra monitoring views

### Core Pattern: Filter Store
All filter state (date range, NOP, Kabupaten, siteId, viewBy) lives in `useFilterStore` (Zustand with localStorage persistence). Components read from the store and call setters. API routes receive filter params via URL search params.

```typescript
// src/stores/filterStore.ts
const { nop, kabupaten, siteId, dateStart, dateEnd, viewBy } = useFilterStore();
```

### API Routes
API routes live in `src/app/(project)/tinfra/api/` and query PostgreSQL via Drizzle ORM. Common patterns:

- `/tinfra/api/meas-db-ti-sul/aggregate/[metric]` — Aggregate KPI data
- `/tinfra/api/meas-db-ti-sul/ref-query-dynamic` — Reference data (NOP, Kabupaten lists)

Filter parameters are passed as URL search params and used in SQL WHERE clauses.

### Data Hooks
Hooks in `src/app/(project)/tinfra/_hooks/` handle data fetching and transformation:

- `agg-use-data-filtering-[feature].ts` — Filter data by cell/sector/band
- `agg-use-data-management-[feature].ts` — Fetch and aggregate raw data
- `agg-use-summary-metrics-[feature].ts` — KPI summary calculations

### Sidebar Navigation
Defined in `src/navigation/sidebar/sidebar-items.ts`. Nav items map to route URLs under `/tinfra/displays/`.

### Mdoc Module Pattern (CRUD Standard)

For creating CRUD pages and APIs in the `/mdoc` module, use these files as reference:

#### API Routes
File: `src/app/(project)/mdoc/api/v1/sqac-tracker/[id]/route.ts`

```typescript
// Main route: GET all + POST create
// [id] route: PUT update + DELETE (uses path params)

import { db_conn_v1 } from "@/app/(project)/tinfra/_drizzle/db_mdoc";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// [id] route must use path params, not query params:
// export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
// }

// Use result.rows for Drizzle raw queries (not result[0])
```

Query params pattern:
- `GET /api/resource` — Get all
- `POST /api/resource` — Create
- `PUT /api/resource/[id]` — Update by path param (NOT query param)
- `DELETE /api/resource/[id]` — Delete by path param

#### CRUD Page
File: `src/app/(project)/mdoc/displays/sqac-tracker/page.tsx`

```typescript
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
```

Key patterns:
- TanStack Query `useQuery` for fetch, `useMutation` for create/update/delete
- `queryClient.invalidateQueries` to refetch after mutations
- `sonner` toast for notifications (`toast.success()`, `toast.error()`)
- Dialog component for create/edit forms
- `split("T")[0]` to format date strings from API

## Code Style

- Biome handles formatting and linting (120 char line width)
- `assist/source/organizeImports` runs on save (React imports first, then package imports)
- `use client` directive on all interactive components
- Database types auto-generated from Supabase: `npx supabase gen types typescript --project-id [id] > src/types/database.ts`