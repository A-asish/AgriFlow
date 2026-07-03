// src/features/admin/dashboard/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Users, Wallet, Sprout, Beef, Clock, Download, ArrowUpRight, Crown, UserCheck, RefreshCw, UserPlus, UserMinus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import adminService from '../../services/admin.api';
import StatCard from '../../components/StatCard';
import { formatCompactCurrency, formatCompactNumber, formatCurrency } from '../../utils/helpers';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    total_farmers: 0,
    total_admins: 0,
    total_users: 0,
    active_farmers: 0,
    pending_farmers: 0,
    inactive_farmers: 0,
    total_revenue_month: 0,
    total_revenue_all: 0,
    total_crops: 0,
    active_crops: 0,
    total_livestock: 0,
    active_livestock: 0,
    pending_approvals: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);
  const [cropData, setCropData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);

  // Colors for charts
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4', '#84cc16', '#ec4899'];

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [farmersRes, adminsRes, statsRes, trendRes, cropDistRes, revenueRes, activitiesRes] = await Promise.all([
        adminService.listFarmers({ page: 1, page_size: 100 }),
        adminService.listAdmins(),
        adminService.getStats(),
        adminService.getFarmerTrend(),
        adminService.getCropDistribution(),
        adminService.getRevenueTrend(),
        adminService.getRecentActivities()
      ]);

      const farmers = farmersRes.data?.farmers || [];
      const admins = adminsRes.data?.admins || [];
      
      const activeFarmers = farmers.filter(f => f.status === 'Active' || f.is_active === true).length;
      const pendingFarmers = farmers.filter(f => f.status === 'Pending' || (f.is_email_verified === false && f.is_active === true)).length;
      const inactiveFarmers = farmers.filter(f => f.status === 'Inactive' || f.is_active === false).length;
      
      setDashboardData({
        total_farmers: farmers.length,
        total_admins: admins.length,
        total_users: farmers.length + admins.length,
        active_farmers: activeFarmers,
        pending_farmers: pendingFarmers,
        inactive_farmers: inactiveFarmers,
        total_revenue_month: statsRes?.data?.total_revenue_month || 0,
        total_revenue_all: statsRes?.data?.total_revenue_all || 0,
        total_crops: statsRes?.data?.total_crops || 0,
        active_crops: statsRes?.data?.active_crops || 0,
        total_livestock: statsRes?.data?.total_livestock || 0,
        active_livestock: statsRes?.data?.active_livestock || 0,
        pending_approvals: statsRes?.data?.pending_approvals || 0
      });

      setTrendData(Array.isArray(trendRes?.data) ? trendRes.data : []);
      setCropData(Array.isArray(cropDistRes?.data) ? cropDistRes.data : cropDistRes?.data?.distribution || []);
      setRevenueData(Array.isArray(revenueRes?.data) ? revenueRes.data : []);
      setActivities(Array.isArray(activitiesRes?.data) ? activitiesRes.data : activitiesRes?.data?.activities || []);
      
      const userGrowth = generateUserGrowthData(farmers, admins);
      setUserGrowthData(userGrowth);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateUserGrowthData = (farmers, admins) => {
    const last6Months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      const farmersCount = farmers.filter(f => {
        const joinDate = new Date(f.date_joined);
        return joinDate.getMonth() === month.getMonth() && joinDate.getFullYear() === month.getFullYear();
      }).length;
      
      const adminsCount = admins.filter(a => {
        const joinDate = new Date(a.date_joined);
        return joinDate.getMonth() === month.getMonth() && joinDate.getFullYear() === month.getFullYear();
      }).length;
      
      last6Months.push({
        month: monthName,
        farmers: farmersCount,
        admins: adminsCount,
        total: farmersCount + adminsCount
      });
    }
    
    return last6Months;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Updated stat cards - 5 cards only
  const statCards = [
    {
      title: 'Total Users',
      value: dashboardData.total_users,
      icon: Users,
      color: 'bg-blue-500',
      trend: 'up',
      trendValue: 8.2,
      subtitle: `${dashboardData.total_farmers} Farmers, ${dashboardData.total_admins} Admins`,
      isCurrency: false
    },
    {
      title: 'Crops Planted',
      value: dashboardData.total_crops,
      icon: Sprout,
      color: 'bg-amber-500',
      trend: 'up',
      trendValue: 8.1,
      subtitle: `${dashboardData.active_crops} currently active`,
      isCurrency: false
    },
    {
      title: 'Livestock',
      value: dashboardData.total_livestock,
      icon: Beef,
      color: 'bg-purple-500',
      trend: 'up',
      trendValue: 3.5,
      subtitle: `${dashboardData.active_livestock} active animals`,
      isCurrency: false
    },
    {
      title: 'Total Revenue',
      value: dashboardData.total_revenue_month,
      icon: Wallet,
      color: 'bg-emerald-500',
      trend: 'up',
      trendValue: 12.5,
      subtitle: 'This month',
      isCurrency: true
    },
    {
      title: 'Pending Approvals',
      value: dashboardData.pending_approvals,
      icon: Clock,
      color: 'bg-rose-500',
      trend: 'down',
      trendValue: 2.1,
      subtitle: 'Needs review',
      isCurrency: false
    }
  ];

  const userDistribution = [
    { name: 'Farmers', value: dashboardData.total_farmers, color: '#10b981' },
    { name: 'Admins', value: dashboardData.total_admins, color: '#8b5cf6' }
  ];

  const farmerStatusData = [
    { name: 'Active', value: dashboardData.active_farmers, color: '#10b981' },
    { name: 'Pending', value: dashboardData.pending_farmers, color: '#f59e0b' },
    { name: 'Inactive', value: dashboardData.inactive_farmers, color: '#f43f5e' }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Executive Summary</h1>
            <p className="text-slate-500 font-medium">Monitoring platform performance and agricultural output.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchDashboardData} className="rounded-xl font-bold gap-2">
              <RefreshCw className="w-4 h-4"/> Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid - 5 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((stat, index) => (
            <StatCard 
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
              trendValue={stat.trendValue}
              subtitle={stat.subtitle}
              isCurrency={stat.isCurrency}
            />
          ))}
        </div>

        {/* User Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">👥 Total Farmers</p>
                <p className="text-xl font-bold text-gray-900">{formatCompactNumber(dashboardData.total_farmers)}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-[10px] text-green-600">Active: {formatCompactNumber(dashboardData.active_farmers)}</span>
                  <span className="text-[10px] text-yellow-600">Pending: {formatCompactNumber(dashboardData.pending_farmers)}</span>
                  <span className="text-[10px] text-red-600">Inactive: {formatCompactNumber(dashboardData.inactive_farmers)}</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">👑 Administrators</p>
                <p className="text-xl font-bold text-gray-900">{formatCompactNumber(dashboardData.total_admins)}</p>
                <p className="text-[10px] text-gray-400 mt-1">Platform administrators</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">📊 Total Revenue (All Time)</p>
                <p className="text-xl font-bold text-gray-900">{formatCompactCurrency(dashboardData.total_revenue_all)}</p>
                <p className="text-[10px] text-gray-400 mt-1">Since platform launch</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-4 sm:p-6 border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-lg font-bold text-slate-800">User Growth Trend</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-600">Farmers</Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-600">Admins</Badge>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}/>
                  <Tooltip 
                    formatter={(value) => formatCompactNumber(value)}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="farmers" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Farmers" />
                  <Area type="monotone" dataKey="admins" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Admins" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">User Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={userDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color}/>
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCompactNumber(value)} contentStyle={{ borderRadius: '16px', border: 'none' }}/>
                  <Legend verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {userDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}/>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold">{formatCompactNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 sm:p-6 border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Crop Stages Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={cropData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" nameKey="name">
                    {cropData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCompactNumber(value)} contentStyle={{ borderRadius: '16px', border: 'none' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {cropData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}/>
                    <span className="text-sm text-gray-600">{item.name || 'Unknown'}</span>
                  </div>
                  <span className="text-sm font-bold">{formatCompactNumber(item.value || 0)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Farmer Account Status</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={farmerStatusData} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {farmerStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color}/>
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCompactNumber(value)} contentStyle={{ borderRadius: '16px', border: 'none' }}/>
                  <Legend verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {farmerStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}/>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold">{formatCompactNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Monthly Revenue Trend</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }}/>
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }}/>
                  <Tooltip formatter={(value) => formatCompactCurrency(value)} contentStyle={{ borderRadius: '16px', border: 'none' }}/>
                  <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <ArrowUpRight className="w-4 h-4"/>
                <span className="text-xs font-bold uppercase tracking-wider">Revenue Insight</span>
              </div>
              <p className="text-xs text-emerald-700">
                Revenue increased by 12.5% this month compared to last month.
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Activities Section */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-4 sm:p-6 border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Recent Activities</h3>
              <Button variant="link" className="text-emerald-600 font-bold p-0 h-auto">View All</Button>
            </div>
            <div className="space-y-4">
              {activities.slice(0, 8).map((act, idx) => (
                <div key={act.id || idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    act.type === 'farmer_registration' ? "bg-blue-100 text-blue-600" :
                    act.type === 'crop_added' ? "bg-amber-100 text-amber-600" :
                    act.type === 'transaction' ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-purple-600"
                  )}>
                    {act.type === 'farmer_registration' ? <Users className="w-5 h-5"/> :
                     act.type === 'crop_added' ? <Sprout className="w-5 h-5"/> :
                     act.type === 'transaction' ? <Wallet className="w-5 h-5"/> : <Beef className="w-5 h-5"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <h4 className="font-bold text-slate-800 truncate">{act.title}</h4>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">{act.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">User: {act.user_name || 'System'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No recent activities found
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;