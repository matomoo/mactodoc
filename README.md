# Next.js Admin Template with TypeScript & Shadcn UI

**Macto Dashboard** - Includes authentication layouts, page of sample project using chartjs displaying site performance.

> **View demo:** [macto-dashboard](https://macto-dashboard.vercel.app)


## Features

- Built with Next.js 16, TypeScript, Tailwind CSS v4, and Shadcn UI  
- Responsive and mobile-friendly  
- Flexible layouts (collapsible sidebar, variable content widths)  
- Ready use pages authentication flows and screens  
- Prebuilt dashboards of sample project displaying site level performance


## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4  
- **UI Components**: Shadcn UI  
- **Validation**: Zod  
- **Forms & State Management**: React Hook Form, Zustand  
- **Tables & Data Handling**: TanStack Table  
- **Tooling & DX**: Biome, Husky  

## Screens

### Available
- Default Summary Dashboard  
- Page of Sample Project - Gefr Monitoring

### Coming Soon
- Page of multi site 4g payload and 2g traffic performance
- 


### generate 

on terminal
npm install supabase --save-dev
npx supabase login
npx supabase gen types typescript --project-id uypkoybdpdvhfnmypjxc > src/types/database.ts