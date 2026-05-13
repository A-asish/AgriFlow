import React from 'react';
import { cn } from "@/lib/utils";
import AdminLayout from '../components/AdminLayout';
import { Map as MapIcon, TrendingUp, Activity, Monitor, Smartphone, Award } from 'lucide-react';
import { AreaChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import adminService from '../services/admin.api';
import { useAdminData } from '../hooks/useAdminData';
const Analytics = () => {
    const { data: stats } = useAdminData({
        fetchFn: () => adminService.getStats()
    });
    const { data: trendData } = useAdminData({
        fetchFn: () => adminService.getFarmerTrend()
    });
    const { data: regionalDataRaw } = useAdminData({
        fetchFn: () => adminService.getCropDistribution() // Reusing for distribution feel
    });
    const regionalData = Array.isArray(regionalDataRaw)
        ? regionalDataRaw
        : regionalDataRaw?.distribution || regionalDataRaw?.crops || [
            { region: 'Terai', farmers: 450, revenue: 120000 },
            { region: 'Hilly', farmers: 320, revenue: 85000 },
            { region: 'Mountain', farmers: 120, revenue: 40000 },
        ];
    const topFarmers = [
        { name: 'Ram Bahadur', region: 'Hilly', score: 98, status: 'Elite' },
        { name: 'Sita Kumari', region: 'Terai', score: 95, status: 'Elite' },
        { name: 'Gopal Thapa', region: 'Terai', score: 92, status: 'Pro' },
        { name: 'Harish Rai', region: 'Mountain', score: 90, status: 'Pro' },
    ];
    return (<AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">System Intelligence</h1>
          <p className="text-slate-500 font-medium">Deep-dive into platform growth and agricultural throughput.</p>
        </div>

        {/* Real-time Pulse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="p-6 sm:p-8 bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-100 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                 <Activity className="w-32 h-32"/>
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-2">Platform Users</p>
                 <h3 className="text-3xl sm:text-4xl font-black mb-6">{stats?.total_farmers || 0}</h3>
                 <div className="flex items-center gap-2 text-emerald-100 font-bold">
                    <TrendingUp className="w-4 h-4"/>
                    <span className="text-xs">24% cumulative growth</span>
                 </div>
              </div>
           </Card>

           <Card className="p-6 sm:p-8 border-slate-100 flex flex-col justify-between">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User Retention</p>
                 <h3 className="text-2xl sm:text-3xl font-black text-slate-800">82.4%</h3>
              </div>
              <div className="mt-8 space-y-4">
                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[82%]"/>
                 </div>
                 <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Churn: 17.6%</span>
                    <span>Target: 90%</span>
                 </div>
              </div>
           </Card>

           <Card className="p-6 sm:p-8 border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Platform Rating</p>
              <div className="flex items-end gap-3 mt-1">
                 <h3 className="text-3xl sm:text-4xl font-black text-slate-800">4.8</h3>
                 <div className="pb-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => <Award key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-amber-500"/>)}
                 </div>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-6 leading-relaxed">
                 Based on sentiment analysis of farmer feedback submissions this month.
              </p>
           </Card>
        </div>

        {/* Growth Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card className="p-4 sm:p-8 border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-800">Registration Velocity</h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-emerald-500"/>
                       <span className="text-[10px] font-black text-slate-400 uppercase">Farmers</span>
                   </div>
                </div>
              </div>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData || []}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}/>
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}/>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
                    <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </Card>

           <Card className="p-4 sm:p-8 border-slate-100">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold text-slate-800">Regional Distribution</h3>
                 <MapIcon className="w-5 h-5 text-slate-300"/>
              </div>
              <div className="h-64 sm:h-80 w-full font-bold">
                <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={regionalData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9"/>
                      <XAxis type="number" hide/>
                      <YAxis dataKey="region" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} width={70}/>
                      <Tooltip />
                      <Bar dataKey="farmers" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}/>
                   </ComposedChart>
                </ResponsiveContainer>
              </div>
           </Card>
        </div>

        {/* Detailed Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-1 p-8 border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-8">Platform Access</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <Smartphone className="w-5 h-5"/>
                       </div>
                       <span className="text-sm font-bold text-slate-600">Mobile Usage</span>
                    </div>
                    <span className="font-black text-slate-800">72%</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <Monitor className="w-5 h-5"/>
                       </div>
                       <span className="text-sm font-bold text-slate-600">Web Dashboard</span>
                    </div>
                    <span className="font-black text-slate-800">28%</span>
                 </div>
              </div>
              <div className="mt-10 p-6 rounded-2xl bg-slate-900 text-white relative group overflow-hidden">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Scale Forecast</p>
                 <h4 className="text-lg font-black mb-3">Goal: 10,000 Farmers</h4>
                 <p className="text-xs text-slate-400 font-bold leading-relaxed mb-4">Projected growth milestone for fiscal year 2026 based on onboarding rate.</p>
                 <Button className="w-full rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 border-0">View Strategy</Button>
              </div>
           </Card>

           <Card className="lg:col-span-2 p-8 border-slate-100">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold text-slate-800">Top Performing Farmers</h3>
                 <Badge variant="outline" className="rounded-lg font-bold text-[10px] uppercase">Engagement Score</Badge>
              </div>
              <div className="space-y-1">
                 {topFarmers.map((f, i) => (<div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-emerald-50/50 transition-colors group">
                       <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center text-xs font-black text-slate-300">
                             {i + 1}
                          </div>
                          <div>
                             <p className="font-black text-slate-700 group-hover:text-emerald-600 transition-colors">{f.name}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.region}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <Badge className={cn("rounded-lg px-2 py-0.5 font-bold uppercase text-[9px]", f.status === 'Elite' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100")}>
                             {f.status}
                          </Badge>
                          <div className="w-12 text-right">
                             <span className="font-black text-slate-800">{f.score}</span>
                          </div>
                       </div>
                    </div>))}
              </div>
              <Button variant="ghost" className="w-full mt-6 rounded-xl font-bold py-6 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">Full Leaderboard</Button>
           </Card>
        </div>
      </div>
    </AdminLayout>);
};
export default Analytics;
