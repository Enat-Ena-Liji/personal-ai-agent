"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { Loader2, TrendingUp, Users, Clock, Calendar, Award, BarChart3, PieChart, LineChart, Mail, MessageSquare, Zap, Flame, Target, CheckCircle, RefreshCw, Lightbulb } from "lucide-react";

interface AnalyticsData {
  metrics: {
    emailsReceived: number;
    emailsSent: number;
    emailsReplied: number;
    responseTime: number;
    whatsappMessages: number;
    meetingsAttended: number;
    tasksCompleted: number;
    priorityHigh: number;
    priorityMedium: number;
    priorityLow: number;
    categories: {
      work: number;
      personal: number;
      social: number;
      promotional: number;
    };
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    productivityScore: number;
    focusTime: number;
    distractions: number;
  };
  weeklyProgress: { day: string; value: number }[];
  monthlyTrends: { week: string; emails: number; messages: number; meetings: number }[];
  recommendations: string[];
  streaks: {
    current: number;
    longest: number;
    lastActive: number;
  };
}

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState("30");
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const url = `/api/analytics?days=${timeRange}${refresh ? '&refresh=true' : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchAnalytics();
    }
  }, [isLoaded, isSignedIn, timeRange]);

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your communication and productivity insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {analytics ? (
        <div className="space-y-6">
          {/* Streaks */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.streaks.current} days</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Longest Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.streaks.longest} days</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Productivity Score</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.metrics.productivityScore}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsStatCard
              icon={<Mail className="w-5 h-5 text-blue-500" />}
              title="Emails Received"
              value={analytics.metrics.emailsReceived}
              subtitle={`${analytics.metrics.emailsReplied} replied`}
              change={analytics.metrics.emailsReceived > 10 ? "+12%" : "+5%"}
            />
            <AnalyticsStatCard
              icon={<MessageSquare className="w-5 h-5 text-green-500" />}
              title="WhatsApp Messages"
              value={analytics.metrics.whatsappMessages}
              subtitle="This period"
              change={analytics.metrics.whatsappMessages > 5 ? "+8%" : "0%"}
            />
            <AnalyticsStatCard
              icon={<Clock className="w-5 h-5 text-yellow-500" />}
              title="Avg Response Time"
              value={`${analytics.metrics.responseTime} min`}
              subtitle="To emails"
              change={analytics.metrics.responseTime < 60 ? "+15%" : "-5%"}
            />
            <AnalyticsStatCard
              icon={<Users className="w-5 h-5 text-purple-500" />}
              title="Meetings"
              value={analytics.metrics.meetingsAttended}
              subtitle="Attended"
              change={analytics.metrics.meetingsAttended > 2 ? "+20%" : "0%"}
            />
          </div>

          {/* Priority & Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Priority Distribution</h3>
              <div className="space-y-3">
                <PriorityBar 
                  label="High" 
                  value={analytics.metrics.priorityHigh} 
                  color="bg-red-500" 
                />
                <PriorityBar 
                  label="Medium" 
                  value={analytics.metrics.priorityMedium} 
                  color="bg-yellow-500" 
                />
                <PriorityBar 
                  label="Low" 
                  value={analytics.metrics.priorityLow} 
                  color="bg-green-500" 
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Category Distribution</h3>
              <div className="space-y-3">
                <CategoryBar 
                  label="Work" 
                  value={analytics.metrics.categories.work} 
                  color="bg-blue-500" 
                />
                <CategoryBar 
                  label="Personal" 
                  value={analytics.metrics.categories.personal} 
                  color="bg-purple-500" 
                />
                <CategoryBar 
                  label="Social" 
                  value={analytics.metrics.categories.social} 
                  color="bg-pink-500" 
                />
                <CategoryBar 
                  label="Promotional" 
                  value={analytics.metrics.categories.promotional} 
                  color="bg-orange-500" 
                />
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Weekly Activity</h3>
            <div className="flex items-end gap-3 h-40">
              {analytics.weeklyProgress.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-500"
                    style={{
                      height: `${Math.max(5, (day.value / Math.max(...analytics.weeklyProgress.map(d => d.value))) * 100)}%`
                    }}
                  />
                  <span className="text-xs text-gray-500 mt-1">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Trends</h3>
            <div className="space-y-4">
              {analytics.monthlyTrends.map((trend) => (
                <div key={trend.week} className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 w-16">{trend.week}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-xs text-gray-400 w-10">📧</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                          style={{ 
                            width: `${(trend.emails / Math.max(...analytics.monthlyTrends.map(t => t.emails), 1)) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-8">{trend.emails}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-xs text-gray-400 w-10">💬</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2 transition-all duration-500"
                          style={{ 
                            width: `${(trend.messages / Math.max(...analytics.monthlyTrends.map(t => t.messages), 1)) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-8">{trend.messages}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-xs text-gray-400 w-10">📅</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-purple-500 rounded-full h-2 transition-all duration-500"
                          style={{ 
                            width: `${(trend.meetings / Math.max(...analytics.monthlyTrends.map(t => t.meetings), 1)) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-8">{trend.meetings}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {analytics.recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI Recommendations
              </h4>
              <ul className="space-y-2">
                {analytics.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
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
            Connect your platforms and start communicating to see analytics.
          </p>
          <button
            onClick={() => fetchAnalytics(true)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Refresh Analytics
          </button>
        </div>
      )}
    </div>
  );
}

function AnalyticsStatCard({ icon, title, value, subtitle, change }: any) {
  const isPositive = change?.startsWith('+');
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs text-gray-400">{subtitle}</p>
        {change && (
          <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

function PriorityBar({ label, value, color }: any) {
  const maxValue = 100;
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
        <div 
          className={`${color} rounded-full h-2 transition-all duration-500`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}

function CategoryBar({ label, value, color }: any) {
  const maxValue = 100;
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
        <div 
          className={`${color} rounded-full h-2 transition-all duration-500`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}

function Lightbulb({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}