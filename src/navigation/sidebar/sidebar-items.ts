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
    ],
  },
  {
    id: 2,
    label: "Dashboard",
    items: [
      // {
      //   title: "Profiles",
      //   url: "/nura/app/profiles",
      //   icon: Fingerprint,
      // },
      {
        title: "4G",
        url: "#",
        icon: Fingerprint,
        subItems: [
          {
            title: "Site Level Daily",
            url: "/tinfra/displays/dashboard/4g/site/daily",
          },
          // {
          //   title: "Site NOP Daily",
          //   url: "/tinfra/displays/dashboard/4g/nop/daily",
          // },
        ],
      },
    ],
  },
];
