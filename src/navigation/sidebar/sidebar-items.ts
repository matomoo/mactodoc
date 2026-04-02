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
    label: "Aggregate",
    items: [
      {
        title: "NOP",
        url: "/tinfra/displays/dashboard/aggregate/4g/nop",
        icon: Fingerprint,
      },
      {
        title: "Site",
        url: "/tinfra/displays/dashboard/aggregate/4g/site",
        icon: Fingerprint,
      },
      {
        title: "Site-Cell",
        url: "/tinfra/displays/dashboard/aggregate/4g/site-cell",
        icon: Fingerprint,
      },
    ],
  },
  {
    id: 3,
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
          {
            title: "NOP Level Daily",
            url: "/tinfra/displays/dashboard/4g/nop/daily",
          },
          {
            title: "Custom Level Daily",
            url: "/tinfra/displays/dashboard/4g/custom-cluster/daily",
          },
        ],
      },
      {
        title: "Manage",
        url: "#",
        icon: Fingerprint,
        subItems: [
          {
            title: "Custom Cluster",
            url: "/tinfra/displays/dashboard/4g/custom-cluster/manage-list",
          },
        ],
      },
    ],
  },
];
