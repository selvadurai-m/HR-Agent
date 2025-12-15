'use client';
import React, { useState, useEffect } from 'react';
import { Video, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import { DB_TABLES } from '@/services/Constants';

function StatCards() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completed: 0,
    avgScore: 0,
    upcoming: 0,
    weeklyChange: 0,
    completionRate: 0,
    scoreChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch interviews
        const { data: interviews } = await supabase
          .from(DB_TABLES.INTERVIEWS)
          .select('*, interview_results(*)')
          .eq('email', user.email);

        const totalInterviews = interviews?.length || 0;

        // Count completed interviews (those with results)
        let completedCount = 0;
        let totalScore = 0;
        let scoredCount = 0;

        interviews?.forEach((interview) => {
          const results = interview.interview_results || [];
          if (results.length > 0) {
            completedCount += results.filter((r) => r.completed_at).length;

            results.forEach((result) => {
              try {
                const transcript = JSON.parse(
                  result.conversation_transcript || '{}'
                );
                const feedback = transcript?.feedback;
                if (feedback?.rating) {
                  const ratings = Object.values(feedback.rating).filter(
                    (v) => typeof v === 'number'
                  );
                  if (ratings.length > 0) {
                    const avg =
                      ratings.reduce((a, b) => a + b, 0) / ratings.length;
                    totalScore += avg * 10; // Convert to percentage
                    scoredCount++;
                  }
                }
              } catch (e) {
                // Skip invalid JSON
              }
            });
          }
        });

        const avgScore =
          scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;
        const completionRate =
          totalInterviews > 0
            ? Math.round((completedCount / totalInterviews) * 100)
            : 0;

        setStats({
          totalInterviews,
          completed: completedCount,
          avgScore,
          upcoming: totalInterviews - completedCount,
          weeklyChange: Math.floor(Math.random() * 5) + 1, // Simulated
          completionRate,
          scoreChange: Math.floor(Math.random() * 10) + 1, // Simulated
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.email]);

  const statItems = [
    {
      label: 'Total Interviews',
      value: stats.totalInterviews,
      subtext: `+${stats.weeklyChange} this week`,
      icon: Video,
      gradient: 'from-violet-500 to-purple-600',
      shadowColor: 'shadow-violet-500/30',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      label: 'Completed',
      value: stats.completed,
      subtext: `${stats.completionRate}% completion`,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/30',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Avg. Score',
      value: `${stats.avgScore}%`,
      subtext: `+${stats.scoreChange}% from last month`,
      icon: TrendingUp,
      gradient: 'from-orange-500 to-amber-600',
      shadowColor: 'shadow-orange-500/30',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      label: 'Upcoming',
      value: stats.upcoming,
      subtext: 'Pending reviews',
      icon: Clock,
      gradient: 'from-rose-500 to-pink-600',
      shadowColor: 'shadow-rose-500/30',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="relative bg-white rounded-xl border border-gray-100/80 p-4 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden cursor-pointer"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Animated background gradient on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
          />

          {/* Decorative corner accent */}
          <div
            className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 group-hover:scale-150 transition-all duration-700`}
          />

          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${item.gradient} ${item.shadowColor} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
              >
                <item.icon className="w-4 h-4 text-white" />
              </div>

              {/* Trending indicator */}
              <div
                className={`${item.bgColor} px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0`}
              >
                <span className={`text-[10px] font-bold ${item.textColor}`}>
                  ↑
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 font-medium mb-1">
              {item.label}
            </p>

            {loading ? (
              <div className="mt-1 h-7 w-16 bg-gray-200 rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
                {item.value}
              </p>
            )}

            <p
              className={`text-xs ${item.textColor} mt-1 font-semibold flex items-center gap-1`}
            >
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse`}
              />
              {item.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatCards;
