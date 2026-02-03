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
    label: "Master Data",
    items: [
      {
        title: "Customer",
        url: "/ichiba/app/customers",
        icon: Fingerprint,
      },
      {
        title: "Test Types",
        url: "/ichiba/app/test-types",
        icon: Fingerprint,
      },
      {
        title: "Medical Devices",
        url: "/ichiba/app/medical-devices",
        icon: Fingerprint,
      },
      {
        title: "Catalogs",
        url: "/ichiba/app/catalogs",
        icon: Fingerprint,
      },
    ],
  },
  {
    id: 3,
    label: "Layanan",
    items: [
      {
        title: "Visits",
        url: "/ichiba/app/visits",
        icon: Fingerprint,
      },
      {
        title: "Penjualan",
        url: "#",
        icon: Fingerprint,

        subItems: [
          {
            title: "Import",
            url: "/ichiba/app/import",
            icon: Fingerprint,
          },
          {
            title: "Laporan",
            url: "/ichiba/app/sales-transactions",
            icon: Fingerprint,
          },
        ],
      },
    ],
  },
];
