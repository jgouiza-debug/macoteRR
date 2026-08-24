import { LayoutDashboard, ListChecks, User, Wallet } from "lucide-react";
import type { ComponentType } from "react";
import type { TranslationKey } from "@/lib/i18n/dictionary";

export type NavItem = {
  href: string;
  labelKey: TranslationKey;
  icon: ComponentType<{ className?: string }>;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/programs", labelKey: "nav.programs", icon: ListChecks },
  { href: "/bursaries", labelKey: "nav.bursaries", icon: Wallet },
  { href: "/profile", labelKey: "nav.profile", icon: User },
];
