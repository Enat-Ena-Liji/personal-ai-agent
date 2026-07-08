"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Clock, Users, Calendar, AlertCircle, Award, BarChart3, PieChart } from "lucide-react";

interface AnalyticsData {
  totalMeetings: number;
  averageDuration: number;
  meetingTypes: Record<string, number>;
  peakHours: { hour: number; count: number }[];
  productivityScore: number;
  recommendations: string[];
  trends: {
    weekly: number;
    monthly: number;
    quarterly: number;
  };
}

export function CalendarAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch real analytics data from the API
      const response = await fetch("/api/calendar/analytics?days=30");
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.error || "Failed to load analytics");
        // Use fallback data
        setAnalytics(getFallbackAnalytics());
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setError("Failed to load analytics data");
      setAnalytics(getFallbackAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackAnalytics = (): AnalyticsData => {
    return {
      totalMeetings: 12,
      averageDuration: 45,
      meetingTypes: {
        'Sync': 4,
        'Review': 3,
        'Client': 2,
        'Planning': 2,
        'General': 1,
      },
      peakHours: [
        { hour: 9, count: 2 },
        { hour: 10, count: 3 },
        { hour: 11, count: 1 },
        { hour: 14, count: 2 },
        { hour: 15, count: 3 },
        { hour: 16, count: 1 },
      ],
      productivityScore: 78,
      recommendations: [
        "Consider consolidating meetings to reduce context switching",
        "Try to keep meetings under 1 hour for better productivity",
        "Schedule more meetings in the morning when energy is highest",
      ],
      trends: {
        weekly: 3.2,
        monthly: 12,
        quarterly: 36,
      },
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h4 className="font-semibold text-red-800">Unable to Load Analytics</h4>
        <p className="text-sm text-red-600 mt-1">{error || "No data available"}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Calendar className="w-5 h-5 text-blue-500" />}
          title="Total Meetings"
          value={analytics.totalMeetings}
          subtitle="Last 30 days"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-green-500" />}
          title="Avg Duration"
          value={`${analytics.averageDuration} min`}
          subtitle="Per meeting"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
          title="Productivity Score"
          value={`${analytics.productivityScore}%`}
          subtitle="Based on efficiency"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-orange-500" />}
          title="Meeting Types"
          value={Object.keys(analytics.meetingTypes).length}
          subtitle="Different categories"
        />
      </div>

      {/* Meeting Types Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Meeting Distribution</h4>
        <div className="space-y-3">
          {Object.entries(analytics.meetingTypes).map(([type, count]) => {
            const percentage = (count / analytics.totalMeetings) * 100;
            return (
              <div key={type} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24">{type}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">Weekly Average</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {analytics.trends.weekly.toFixed(1)}
          </p>
          <p className="text-xs text-gray-400">meetings/week</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">Monthly Total</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {analytics.trends.monthly}
          </p>
          <p className="text-xs text-gray-400">meetings/month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">Quarterly Projection</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {analytics.trends.quarterly}
          </p>
          <p className="text-xs text-gray-400">meetings/quarter</p>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Peak Meeting Hours</h4>
        <div className="flex items-end gap-1 h-40">
          {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
            const peak = analytics.peakHours.find(p => p.hour === hour);
            const count = peak?.count || 0;
            const maxCount = Math.max(...analytics.peakHours.map(p => p.count), 1);
            const height = (count / maxCount) * 100;
            
            return (
              <div key={hour} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t transition-all duration-500 ${
                    count > 0 ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500 mt-1">
                  {hour}:00
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-center gap-4 text-xs text-gray-500">
          <span>Peak hours: 9 AM - 11 AM, 2 PM - 4 PM</span>
        </div>
      </div>

      {/* Recommendations */}
      {analytics.recommendations.length > 0 && (
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
  );
}

function StatCard({ icon, title, value, subtitle }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}