"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { Loader2, TrendingUp, Users, Clock, Calendar, Award, BarChart3, PieChart, LineChart } from "lucide-react";

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/calendar/analytics?days=30");
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
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
          <p className="text-gray-600">Please sign in to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Analytics Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {analytics ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsStatCard
              icon={<Calendar className="w-5 h-5 text-blue-500" />}
              title="Total Meetings"
              value={analytics.totalMeetings}
              subtitle="Last 30 days"
              change="+12%"
            />
            <AnalyticsStatCard
              icon={<Clock className="w-5 h-5 text-green-500" />}
              title="Avg Duration"
              value={`${analytics.averageDuration} min`}
              subtitle="Per meeting"
              change="-8%"
            />
            <AnalyticsStatCard
              icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
              title="Productivity Score"
              value={`${analytics.productivityScore}%`}
              subtitle="Efficiency rating"
              change="+5%"
            />
            <AnalyticsStatCard
              icon={<Users className="w-5 h-5 text-orange-500" />}
              title="Meeting Types"
              value={Object.keys(analytics.meetingTypes).length}
              subtitle="Categories"
              change="+2"
            />
          </div>

          {/* Meeting Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Meeting Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {Object.entries(analytics.meetingTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-24">{type}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 rounded-full h-2"
                        style={{ width: `${(count / analytics.totalMeetings) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{count}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <PieChart className="w-32 h-32 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Trends */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-sm text-gray-500">Weekly</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {analytics.trends.weekly.toFixed(1)}
              </p>
              <p className="text-xs text-gray-400">meetings/week</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-sm text-gray-500">Monthly</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {analytics.trends.monthly}
              </p>
              <p className="text-xs text-gray-400">meetings/month</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-sm text-gray-500">Quarterly</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {analytics.trends.quarterly}
              </p>
              <p className="text-xs text-gray-400">meetings/quarter</p>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Peak Meeting Hours</h3>
            <div className="flex items-end gap-1 h-40">
              {analytics.peakHours.map((hour: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t ${
                      hour.count > 0 ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    style={{
                      height: `${(hour.count / Math.max(...analytics.peakHours.map((h: any) => h.count))) * 100}%`,
                    }}
                  />
                  <span className="text-xs text-gray-500 mt-1">
                    {hour.hour}:00
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {analytics.recommendations?.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Productivity Recommendations
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-yellow-700">
                {analytics.recommendations.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Analytics Data</h3>
          <p className="text-gray-500">
            Connect your calendar and schedule some meetings to see analytics.
          </p>
        </div>
      )}
    </div>
  );
}

function AnalyticsStatCard({ icon, title, value, subtitle, change }: any) {
  const isPositive = change?.startsWith('+');
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs text-gray-400">{subtitle}</p>
        {change && (
          <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}