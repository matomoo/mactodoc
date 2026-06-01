import { Fingerprint, LayoutDashboard, type LucideIcon } from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Home",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        title: "SQAC Tracker",
        url: "/mdoc/displays/sqac-tracker",
        icon: Fingerprint,
      },
    ],
  },
  {
    id: 10,
    label: "Nextjs Course",
    items: [
      {
        title: "Home",
        url: "/courses/nextjs/app/blog",
        icon: LayoutDashboard,
      },
    ],
  },
];
