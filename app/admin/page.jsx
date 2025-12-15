'use client';
import React, { useEffect, useState } from 'react';
import {
  Users,
  BarChart3,
  Calendar,
  TrendingUp,
  Eye,
  UserPlus,
} from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DB_TABLES } from '@/services/Constants';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInterviews: 0,
    totalCandidates: 0,
    recentSignups: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Get total users
      const { count: userCount } = await supabase
        .from(DB_TABLES.USERS)
        .select('*', { count: 'exact', head: true });

      // Get total interviews
      const { count: interviewCount } = await supabase
        .from(DB_TABLES.INTERVIEWS)
        .select('*', { count: 'exact', head: true });

      // Get total candidates (interview results)
      const { count: candidateCount } = await supabase
        .from(DB_TABLES.INTERVIEW_RESULTS)
        .select('*', { count: 'exact', head: true });

      // Get recent signups (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentSignups } = await supabase
        .from(DB_TABLES.USERS)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      setStats({
        totalUsers: userCount || 0,
        totalInterviews: interviewCount || 0,
        totalCandidates: candidateCount || 0,
        recentSignups: recentSignups || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'Registered users',
      icon: Users,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      title: 'Total Interviews',
      value: stats.totalInterviews,
      description: 'Created interviews',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      description: 'Interview participants',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Recent Signups',
      value: stats.recentSignups,
      description: 'Last 7 days',
      icon: UserPlus,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor platform activity and user management
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/users">
            <Button
              variant="outline"
              className="border-violet-200 hover:border-violet-400 hover:bg-violet-50 transition-all duration-300"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/interviews">
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Interviews
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:-translate-y-1 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div
                className={`p-2.5 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {loading ? (
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse"></div>
                ) : (
                  stat.value.toLocaleString()
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-100 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                User Management
              </span>
            </CardTitle>
            <CardDescription>
              View and manage all registered users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 relative">
            <p className="text-sm text-gray-600">
              Monitor user activity, manage accounts, and view user statistics.
            </p>
            <Link href="/admin/users">
              <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-300">
                <Eye className="w-4 h-4 mr-2" />
                View All Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Interview Analytics
              </span>
            </CardTitle>
            <CardDescription>
              Analyze interview performance and results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 relative">
            <p className="text-sm text-gray-600">
              Review completed interviews, candidate feedback, and performance
              metrics.
            </p>
            <Link href="/admin/interviews">
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25 transition-all duration-300">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
