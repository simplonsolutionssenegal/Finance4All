"use client";

import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  Bell,
  Settings,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    id: "institutions",
    label: "Institutions partenaires",
    icon: Building2,
    badge: "32",
    href: "/institutions",
  },
  {
    id: "formations",
    label: "Cours & Formations",
    icon: BookOpen,
    href: "/formations",
  },
  {
    id: "users",
    label: "Utilisateurs",
    icon: Users,
    href: "/users",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    badge: "10",
    href: "/notifications",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold text-center">
          + Dashboard
        </div>
      </div>

      <div className="px-6 mb-6">
        <p className="text-sm font-medium text-gray-600 mb-4">Menu</p>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start h-10 px-3 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/api/placeholder/40/40" alt="Profile" />
            <AvatarFallback className="bg-teal-500 text-white">J</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Jaafar</p>
            <p className="text-xs text-gray-500">dgueye.ext@simplon.co</p>
          </div>
        </div>

        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
          <LogOut className="w-4 h-4 mr-3" />
          Log out
        </Button>
      </div>
    </aside>
  );
}