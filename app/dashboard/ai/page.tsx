"use client";

import { useUser } from "@/hooks/useUser";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Sparkles, FileText, MessageSquare, Zap, Clock, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AIDashboard() {
  const { isLoaded, isSignedIn } = useUser();
  const todayBriefing = useQuery(api.briefings.getTodayBriefing);
  const platforms = useQuery(api.platforms.getPlatforms);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to access AI features.</p>
        </div>
      </div>
    );
  }

  const connectedPlatforms = platforms?.filter(p => p.isConnected).length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-blue-600" />
          AI Agent Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {connectedPlatforms} platforms connected
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FileText className="w-5 h-5 text-blue-500" />}
          title="Today's Briefing"
          value={todayBriefing ? "Ready" : "Pending"}
          subtitle={todayBriefing ? "Click to view" : "Generate now"}
          link="/dashboard/ai/briefings"
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5 text-green-500" />}
          title="Smart Replies"
          value="12"
          subtitle="Generated this week"
          link="/dashboard/ai/smart-replies"
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-yellow-500" />}
          title="AI Credits"
          value="42"
          subtitle="15 remaining today"
          link="#"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
          title="Productivity"
          value="78%"
          subtitle="+12% this week"
          link="#"
        />
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={<FileText className="w-8 h-8 text-blue-600" />}
          title="Daily Briefings"
          description="Get AI-powered summaries of your emails and messages"
          link="/dashboard/ai/briefings"
          status={todayBriefing ? "Ready" : "Generate"}
        />
        <FeatureCard
          icon={<MessageSquare className="w-8 h-8 text-green-600" />}
          title="Smart Replies"
          description="Generate context-aware replies for emails and WhatsApp"
          link="/dashboard/ai/smart-replies"
          status="Active"
        />
        <FeatureCard
          icon={<Sparkles className="w-8 h-8 text-purple-600" />}
          title="Email Drafts"
          description="AI-powered email drafting with multiple tones"
          link="/dashboard/ai/email-drafts"
          status="New"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction
            icon={<Sparkles className="w-4 h-4" />}
            label="Generate Briefing"
            onClick={() => {}}
          />
          <QuickAction
            icon={<MessageSquare className="w-4 h-4" />}
            label="Smart Reply"
            onClick={() => {}}
          />
          <QuickAction
            icon={<FileText className="w-4 h-4" />}
            label="Draft Email"
            onClick={() => {}}
          />
          <QuickAction
            icon={<Clock className="w-4 h-4" />}
            label="Schedule Meeting"
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, link }: any) {
  return (
    <Link href={link} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({ icon, title, description, link, status }: any) {
  return (
    <Link href={link} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <div className="p-2 bg-gray-50 rounded-lg inline-block mb-3">
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {status && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            status === 'Ready' ? 'bg-green-100 text-green-700' :
            status === 'Active' ? 'bg-blue-100 text-blue-700' :
            status === 'New' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {status}
          </span>
        )}
      </div>
    </Link>
  );
}

function QuickAction({ icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}