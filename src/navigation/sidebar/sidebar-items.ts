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
        title: "Summary",
        url: "/tinfra/displays/dashboard-v2/summary",
        icon: LayoutDashboard,
      },
      {
        title: "Productivity Detail",
        url: "#",
        icon: LayoutDashboard,
        subItems: [
          {
            title: "Breakdown",
            url: "/tinfra/displays/dashboard-v2/productivity-detail",
            icon: LayoutDashboard,
          },
          {
            title: "Chart",
            url: "/tinfra/displays/dashboard-v2/productivity-detail-chart",
            icon: LayoutDashboard,
          },
          {
            title: "Top N",
            url: "/tinfra/displays/dashboard-v2/productivity-detail-topn",
            icon: LayoutDashboard,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    label: "Aggregate",
    items: [
      {
        title: "Region",
        url: "/tinfra/displays/dashboard/aggregate/4g/region",
        icon: Fingerprint,
      },
      // {
      //   title: "Region - NOP",
      //   url: "/tinfra/displays/dashboard/aggregate/4g/region-nop",
      //   icon: Fingerprint,
      // },
      {
        title: "NOP",
        url: "/tinfra/displays/dashboard/aggregate/4g/nop",
        icon: Fingerprint,
      },
      // {
      //   title: "NOP - Kabupaten",
      //   url: "/tinfra/displays/dashboard/aggregate/4g/nop-kabupaten",
      //   icon: Fingerprint,
      // },
      {
        title: "Kabupaten",
        url: "/tinfra/displays/dashboard/aggregate/4g/kabupaten",
        icon: Fingerprint,
      },
      // {
      //   title: "Kabupaten - Kecamatan",
      //   url: "/tinfra/displays/dashboard/aggregate/4g/kabupaten-kecamatan",
      //   icon: Fingerprint,
      // },
      {
        title: "Kecamatan",
        url: "/tinfra/displays/dashboard/aggregate/4g/kecamatan",
        icon: Fingerprint,
      },
      // {
      //   title: "Kecamatan - Site",
      //   url: "/tinfra/displays/dashboard/aggregate/4g/kecamatan-site",
      //   icon: Fingerprint,
      // },
      {
        title: "Site",
        url: "/tinfra/displays/dashboard/aggregate/4g/site",
        icon: Fingerprint,
      },
      {
        title: "Site - Sector",
        url: "/tinfra/displays/dashboard/aggregate/4g/site-sector",
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
    label: "Sprint",
    items: [
      {
        title: "Redcov",
        url: "/tinfra/displays/dashboard-sprint/redcov",
        icon: Fingerprint,
      },
      {
        title: "Unbalance",
        url: "/tinfra/displays/dashboard-sprint/unbalance",
        icon: Fingerprint,
      },
      {
        title: "RCI",
        url: "/tinfra/displays/dashboard-sprint/rci",
        icon: Fingerprint,
      },
    ],
  },
  {
    id: 4,
    label: "Custom Cluster",
    items: [
      {
        title: "Performance",
        url: "/tinfra/displays/dashboard/4g/custom-cluster/daily",
        icon: Fingerprint,
      },
      {
        title: "Manage List",
        url: "/tinfra/displays/dashboard/4g/custom-cluster/manage-list",
        icon: Fingerprint,
      },
    ],
  },
  {
    id: 5,
    label: "5G",
    items: [
      {
        title: "Site Cell",
        url: "/tinfra/displays/dashboard/aggregate/5g/site-cell",
        icon: Fingerprint,
      },
    ],
  },
];
