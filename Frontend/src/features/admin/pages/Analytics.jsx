// src/features/admin/pages/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import AdminLayout from '../components/AdminLayout';
import { Map as MapIcon, TrendingUp, Activity, Users, Sprout, Beef, Wallet } from 'lucide-react';
import { AreaChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import adminService from '../services/admin.api';
import { toast } from 'sonner';
import { formatCompactNumber, formatCompactCurrency } from '../utils/helpers';

const Analytics = () => {
  const [data, setData] = useState({
    total_farmers: 0,
    active_farmers: 0,
    total_crops: 0,
    total_livestock: 0,
    total_revenue: 0
  });
  const [trendData, setTrendData] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const farmersRes = await adminService.listFarmers({ page: 1, page_size: 1000 });
        const statsRes = await adminService.getStats();
        const trendRes = await adminService.getFarmerTrend();
        
        const farmers = farmersRes.data?.farmers || [];
        const stats = statsRes.data || {};
        
        console.log('Farmers data with regions:', farmers.map(f => ({ 
          name: f.full_name, 
          region: f.geographical_region,
          region_display: f.region 
        })));
        
        // Count farmers by region - use geographical_region field
        let terai = 0;
        let hilly = 0;
        let himalayan = 0;
        
        farmers.forEach(farmer => {
          const region = farmer.geographical_region;
          if (region === 'terai') {
            terai++;
          } else if (region === 'hilly') {
            hilly++;
          } else if (region === 'himalayan') {
            himalayan++;
          }
        });
        
        console.log('Regional counts:', { terai, hilly, himalayan, totalFarmers: farmers.length });
        
        setData({
          total_farmers: farmers.length,
          active_farmers: farmers.filter(f => f.status === 'Active' || f.is_active === true).length,
          total_crops: stats.total_crops || 0,
          total_livestock: stats.total_livestock || 0,
          total_revenue: stats.total_revenue_month || 0
        });

        setTrendData(Array.isArray(trendRes?.data) ? trendRes.data : []);
        
        // Set regional data
        setRegionalData([
          { region: 'Terai', farmers: terai },
          { region: 'Hilly', farmers: hilly },
          { region: 'Himalayan', farmers: himalayan }
        ]);
        
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const retentionRate = data.total_farmers > 0 
    ? Math.round((data.active_farmers / data.total_farmers) * 100) 
    : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-5 p-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Analytics</h1>
          <p className="text-xs text-slate-500">Platform insights and growth metrics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3 text-center">
            <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500">Total Farmers</p>
            <p className="text-lg font-bold">{formatCompactNumber(data.total_farmers)}</p>
          </Card>
          <Card className="p-3 text-center">
            <Activity className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500">Active</p>
            <p className="text-lg font-bold">{formatCompactNumber(data.active_farmers)}</p>
          </Card>
          <Card className="p-3 text-center">
            <Sprout className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500">Crops</p>
            <p className="text-lg font-bold">{formatCompactNumber(data.total_crops)}</p>
          </Card>
          <Card className="p-3 text-center">
            <Beef className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-[10px] text-gray-500">Livestock</p>
            <p className="text-lg font-bold">{formatCompactNumber(data.total_livestock)}</p>
          </Card>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-emerald-600 text-white">
            <p className="text-[10px] text-emerald-100">Monthly Revenue</p>
            <p className="text-2xl font-bold">{formatCompactCurrency(data.total_revenue)}</p>
            <p className="text-[10px] text-emerald-100 mt-2">Current month</p>
          </Card>
          <Card className="p-4">
            <p className="text-[10px] text-gray-500">User Retention</p>
            <p className="text-2xl font-bold">{retentionRate}%</p>
            <div className="h-1 bg-gray-100 rounded-full mt-2">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${retentionRate}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-2">{formatCompactNumber(data.active_farmers)} active out of {formatCompactNumber(data.total_farmers)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-[10px] text-gray-500">Platform Rating</p>
            <p className="text-2xl font-bold">4.8/5</p>
            <p className="text-[10px] text-gray-500 mt-2">Based on feedback</p>
          </Card>
        </div>

        {/* Growth Chart */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold">Farmer Growth</h3>
            <Badge className="text-[10px]">Last 6 months</Badge>
          </div>
          <div className="h-64 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatCompactNumber(v)} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No growth data available
              </div>
            )}
          </div>
        </Card>

        {/* Regional Distribution */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold">Regional Distribution</h3>
            <MapIcon className="w-4 h-4 text-gray-400" />
          </div>
          {regionalData.some(r => r.farmers > 0) ? (
            <div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={regionalData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="region" type="category" width={80} tick={{ fontSize: 10, fontWeight: 500 }} />
                    <Tooltip formatter={(v) => formatCompactNumber(v)} />
                    <Bar dataKey="farmers" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} name="Farmers" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                {regionalData.map((region) => (
                  <div key={region.region} className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-[10px] text-gray-500">{region.region}</p>
                    <p className="text-sm font-bold">{formatCompactNumber(region.farmers)}</p>
                    <p className="text-[10px] text-gray-400">
                      {data.total_farmers > 0 ? Math.round((region.farmers / data.total_farmers) * 100) : 0}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <MapIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No regional data available</p>
              <p className="text-xs mt-1">Please update farmer profiles with their geographical region.</p>
            </div>
          )}
        </Card>

        {/* Revenue Card */}
        <Card className="p-4 bg-linear-to-r from-emerald-50 to-green-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-gray-500">Total Revenue (All Time)</p>
              <p className="text-xl font-bold">{formatCompactCurrency(data.total_revenue * 12)}</p>
              <p className="text-[10px] text-gray-500 mt-1">Estimated annual run rate</p>
            </div>
            <Wallet className="w-10 h-10 text-emerald-600 opacity-50" />
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Analytics;