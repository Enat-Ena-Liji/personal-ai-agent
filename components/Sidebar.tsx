"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Bell,
  Settings,
  Sparkles,
  FileText,
  BarChart3,
  Clock,
  Users,
  Zap,
  Briefcase,
  Activity,
  Star,
  HelpCircle,
  Globe
} from "lucide-react";

interface NavItem {
  icon: any;
  label: string;
  href: string;
  badge?: number;
  subItems?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: Sparkles,
    label: "AI Agent",
    href: "/dashboard/ai",
    subItems: [
      { label: "Briefings", href: "/dashboard/ai/briefings" },
      { label: "Smart Replies", href: "/dashboard/ai/smart-replies" },
      { label: "Email Drafts", href: "/dashboard/ai/email-drafts" },
    ],
  },
  {
    icon: Calendar,
    label: "Calendar",
    href: "/dashboard/calendar",
    subItems: [
      { label: "Schedule", href: "/dashboard/calendar" },
      { label: "Auto-Schedule", href: "/dashboard/calendar/schedule" },
      { label: "Meeting Prep", href: "/dashboard/calendar/prep" },
      { label: "Analytics", href: "/dashboard/calendar/analytics" },
    ],
  },
  {
    icon: Mail,
    label: "Gmail",
    href: "/dashboard/gmail",
  },
  {
    icon: MessageSquare,
    label: "WhatsApp",
    href: "/dashboard/whatsapp",
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "/dashboard/notifications",
    badge: 3,
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/dashboard/analytics",
  },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },

  // Add to navItems
{ icon: Globe, label: "Platforms", href: "/dashboard/platforms" },
  {
    icon: Settings,
    label: "Settings",
    href: "/dashboard/settings",
  },
  // Add to navItems
{ icon: FileText, label: "Email Templates", href: "/dashboard/email-templates" },
];

export default function Sidebar({ isOpen = true }) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-40">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Agent
          </span>
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            v2.0
          </span>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isSubActive = hasSubItems && item.subItems?.some(sub => pathname === sub.href);

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive || isSubActive
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive || isSubActive ? "text-blue-600" : ""}`} />
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {item.badge}
                    </span>
                  )}
                  {hasSubItems && (
                    <span className={`text-xs ${isActive || isSubActive ? "text-blue-600" : "text-gray-400"}`}>
                      ▾
                    </span>
                  )}
                </Link>
                
                {hasSubItems && (isActive || isSubActive) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems?.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          pathname === sub.href
                            ? "text-blue-700 bg-blue-50"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">AI Credits</span>
              <span className="ml-auto text-sm font-bold text-blue-600">42</span>
            </div>
            <div className="mt-2 w-full bg-white rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "70%" }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">15 remaining today</p>
          </div>
        </div>
      </div>
    </aside>
  );
}