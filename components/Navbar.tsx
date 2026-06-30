import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Home, Calendar, Bell, Settings } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Agent
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            <Home className="w-5 h-5" />
          </Link>
          <Link href="/briefing" className="text-gray-600 hover:text-gray-900">
            <Calendar className="w-5 h-5" />
          </Link>
          <Link href="/alerts" className="text-gray-600 hover:text-gray-900">
            <Bell className="w-5 h-5" />
          </Link>
          <Link href="/settings" className="text-gray-600 hover:text-gray-900">
            <Settings className="w-5 h-5" />
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
}