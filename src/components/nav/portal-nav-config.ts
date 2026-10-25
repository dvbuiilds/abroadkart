import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  FileStack,
  CheckSquare,
  Receipt,
  Wallet,
  BarChart3,
} from "lucide-react";

export type PortalNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const CONSULTANT_NAV_ITEMS: PortalNavItem[] = [
  { title: "Dashboard", href: "/consultant/dashboard", icon: LayoutDashboard },
  { title: "Students", href: "/consultant/students", icon: Users },
  { title: "Applications", href: "/consultant/applications", icon: FileText },
  { title: "Loans", href: "/consultant/loans", icon: CreditCard },
  { title: "Documents", href: "/consultant/documents", icon: FileStack },
  { title: "Tasks", href: "/consultant/tasks", icon: CheckSquare },
];

export const FULFILMENT_NAV_ITEMS: PortalNavItem[] = [
  { title: "Dashboard", href: "/fulfilment/dashboard", icon: LayoutDashboard },
  { title: "Loans", href: "/fulfilment/loans", icon: CreditCard },
  { title: "Documents", href: "/fulfilment/documents", icon: FileStack },
  {
    title: "Reimbursements",
    href: "/fulfilment/reimbursements",
    icon: Receipt,
  },
  { title: "Cards", href: "/fulfilment/cards", icon: Wallet },
  { title: "Analytics", href: "/fulfilment/analytics", icon: BarChart3 },
];
