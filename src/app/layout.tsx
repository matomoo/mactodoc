import type { ReactNode } from "react";

import { Geist, Inter, Roboto } from "next/font/google";

import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_CONFIG } from "@/config/app-config";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { ThemeBootScript } from "@/scripts/theme-boot";
import { AuthProvider } from "@/stores/auth-provider";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";

import "./globals.css";

import { cn } from "@/lib/utils";

import { Providers } from "./providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { theme_mode, theme_preset, content_layout, navbar_style, sidebar_variant, sidebar_collapsible } =
    PREFERENCE_DEFAULTS;
  return (
    <html
      lang="en"
      className={cn(theme_mode, "font-sans", geist.variable)}
      data-theme-preset={theme_preset}
      data-content-layout={content_layout}
      data-navbar-style={navbar_style}
      data-sidebar-variant={sidebar_variant}
      data-sidebar-collapsible={sidebar_collapsible}
      suppressHydrationWarning
    >
      <head>
        {/* Applies theme and layout preferences on load to avoid flicker and unnecessary server rerenders. */}
        <ThemeBootScript />
      </head>
      <body className={`${inter.className} ${roboto.variable} min-h-screen antialiased`}>
        <AuthProvider>
          <PreferencesStoreProvider
            themeMode={theme_mode}
            themePreset={theme_preset}
            contentLayout={content_layout}
            navbarStyle={navbar_style}
          >
            <TooltipProvider>
              <Providers>{children}</Providers>
            </TooltipProvider>
            <Toaster />
          </PreferencesStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
