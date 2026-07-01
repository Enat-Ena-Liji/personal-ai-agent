"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Menu, X, Search, Bell, Sparkles, Home, Calendar, Settings } from "lucide-react";
import { NotificationCenter } from "./NotificationCenter";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2.5 z-50 h-16">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
              AI Agent
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Calendar className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Home className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Search */}
          <div className="relative hidden lg:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-48 pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
          </div>

          {/* Notifications */}
          <NotificationCenter />

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName || "User"}
              </p>
              <p className="text-xs text-gray-500">Pro</p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
}