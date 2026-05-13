import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Users, Wallet, Sprout, Beef, Clock, Filter, Download, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import adminService from '../../services/admin.api';
import { useAdminData } from '../../hooks/useAdminData';
import StatCard from '../../components/StatCard';
import { formatCurrency } from '../../utils/helpers';
import { cn } from '@/lib/utils';
const Dashboard = () => {
    const { data: stats, loading: statsLoading } = useAdminData({
        fetchFn: () => adminService.getStats()
    });
    const { data: trendData } = useAdminData({
        fetchFn: () => adminService.getFarmerTrend()
    });
    const { data: cropData } = useAdminData({
        fetchFn: () => adminService.getCropDistribution()
    });
    const { data: revenueData } = useAdminData({
        fetchFn: () => adminService.getRevenueTrend()
    });
    const { data: activities } = useAdminData({
        fetchFn: () => adminService.getRecentActivities()
    });
    const cropDataArray = Array.isArray(cropData) ? cropData : cropData?.distribution || cropData?.crops || [];
    const trendDataArray = Array.isArray(trendData) ? trendData : [];
    const revenueDataArray = Array.isArray(revenueData) ? revenueData : [];
    const activitiesArray = Array.isArray(activities) ? activities : activities?.activities || [];
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#f43f5e'];
    return (<AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Executive Summary</h1>
            <p className="text-slate-500 font-medium">Monitoring platform performance and agricultural output.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl font-bold gap-2">
              <Filter className="w-4 h-4"/> Filter
            </Button>
            <Button className="rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100">
              <Download className="w-4 h-4"/> Export Data
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <StatCard title="Total Farmers" value={stats?.total_farmers || 0} icon={Users} color="bg-blue-500" trend="up" trendValue={5.2}/>
          <StatCard title="Monthly Revenue" value={formatCurrency(stats?.total_revenue_month || 0)} icon={Wallet} color="bg-emerald-500" trend="up" trendValue={12.5}/>
          <StatCard title="Crops Planted" value={stats?.total_crops || 0} icon={Sprout} color="bg-amber-500" trend="up" trendValue={8.1}/>
          <StatCard title="Livestock" value={stats?.total_livestock || 0} icon={Beef} color="bg-purple-500" trend="down" trendValue={1.5}/>
          <StatCard title="Pending Approvals" value={stats?.pending_approvals || 0} icon={Clock} color="bg-rose-500"/>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-4 sm:p-8 border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h3 className="text-lg font-bold text-slate-800">Registration Trend</h3>
              <select className="bg-slate-50 border-0 rounded-lg text-sm font-bold px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-auto">
                <option>Last 6 Months</option>
                <option>Year View</option>
              </select>
            </div>
            <div className="h-64 sm:h-80 w-full min-h-64 sm:min-h-80">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={trendDataArray}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}/>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}/>
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', strokeWidth: 2, r: 6, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4 sm:p-8 border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-8">Crop Stages</h3>
            <div className="h-64 w-full min-h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={cropDataArray} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {cropDataArray.map((_entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}/>
                  <Legend verticalAlign="bottom" align="center" iconType="circle" formatter={(value) => <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{value}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Fixed: Crop Stages Legend Section - TypeScript error resolved */}
            <div className="mt-8 space-y-4">
              {cropDataArray.map((item, index) => {
            // Ensure we have a valid key (string or number)
            const itemKey = item?.name?.toString() || item?.label?.toString() || `crop-${index}`;
            const itemName = item?.name || item?.label || 'Unknown';
            const itemValue = item?.value || 0;
            return (<div key={itemKey} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}/>
                      <span className="text-sm font-bold text-slate-500">{itemName}</span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">{itemValue} units</span>
                  </div>);
        })}
            </div>
          </Card>
        </div>

        {/* Recent Activities Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <Card className="xl:col-span-2 p-4 sm:p-8 border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-800">Recent Activities</h3>
              <Button variant="link" className="text-emerald-600 font-bold p-0 h-auto">View All</Button>
            </div>
            <div className="space-y-4 sm:space-y-6">
              {activitiesArray.map((act) => (<div key={act.id || `activity-${act.timestamp}`} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", act.type === 'farmer_registration' ? "bg-blue-100 text-blue-600" :
                act.type === 'crop_added' ? "bg-amber-100 text-amber-600" :
                    act.type === 'transaction' ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-purple-600")}>
                    {act.type === 'farmer_registration' ? <Users className="w-5 h-5"/> :
                act.type === 'crop_added' ? <Sprout className="w-5 h-5"/> :
                    act.type === 'transaction' ? <Wallet className="w-5 h-5"/> : <Beef className="w-5 h-5"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <h4 className="font-bold text-slate-800 truncate">{act.title}</h4>
                      <span className="text-[10px] text-slate-400 font-bold">{act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2">{act.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">User: {act.user_name}</span>
                    </div>
                  </div>
                </div>))}
            </div>
          </Card>

          <Card className="p-4 sm:p-8 border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-8">Revenue Analysis</h3>
            <div className="h-64 sm:h-80 w-full min-h-64 sm:min-h-80">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={revenueDataArray}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}/>
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}/>
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}/>
                  <Bar dataKey="income" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <ArrowUpRight className="w-5 h-5"/>
                <span className="text-sm font-bold uppercase tracking-wider">Target Insight</span>
              </div>
              <p className="text-sm font-semibold text-emerald-800 leading-relaxed">
                Profit margins are trending upwards due to increased high-value crop cultivation in the Terai region.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>);
};
export default Dashboard;
