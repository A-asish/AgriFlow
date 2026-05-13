import React from 'react';
import { cn } from "@/lib/utils";
import AdminLayout from '../../components/AdminLayout';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Wallet, PieChart as PieChartIcon, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import adminService from '../../services/admin.api';
import { useAdminData } from '../../hooks/useAdminData';
import DataTable from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
const Finance = () => {
    const { data: summary, loading: summaryLoading } = useAdminData({
        fetchFn: () => adminService.getFinancialSummary()
    });
    const { data: transactionsData, loading: transactionsLoading, setParams, refresh } = useAdminData({
        fetchFn: (p) => adminService.listFinanceTransactions(p)
    });
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6'];
    const handleSearch = (term) => {
        setParams({ search: term, page: 1 });
        refresh();
    };
    const handleFilterChange = (key, value) => {
        setParams({ [key]: value, page: 1 });
        refresh();
    };
    const SummaryCard = ({ title, value, growth, icon: Icon, isNegative }) => (<Card className="p-6 sm:p-8 border-slate-100 shadow-sm relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <Icon className="w-24 h-24"/>
       </div>
       <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                <Icon className="w-6 h-6"/>
             </div>
             {growth !== undefined && (<Badge className={cn("rounded-lg px-2 py-1 font-bold flex items-center gap-1", isNegative ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")}>
                  {isNegative ? <ArrowDownRight className="w-3 h-3"/> : <ArrowUpRight className="w-3 h-3"/>}
                  {growth}%
               </Badge>)}
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(value || 0)}</h3>
       </div>
    </Card>);
    const columns = [
        {
            header: 'Reference',
            accessor: (tx) => (<span className="font-mono text-xs font-bold text-slate-400">#TXN-{tx.id.toString().padStart(6, '0')}</span>),
        },
        {
            header: 'Context',
            accessor: (tx) => (<div>
          <p className="font-bold text-slate-700">{tx.farmer_name || 'System'}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{tx.transaction_type}</p>
        </div>),
        },
        {
            header: 'Category',
            accessor: (tx) => (<Badge variant="secondary" className="rounded-lg bg-slate-100 text-slate-600 font-bold tracking-tight">
          {tx.category || 'General'}
        </Badge>),
        },
        {
            header: 'Date',
            accessor: (tx) => (<div className="flex items-center gap-2 text-sm font-bold text-slate-500">
           <Calendar className="w-3.5 h-3.5"/>
           {formatDate(tx.date || tx.created_at || new Date().toISOString())}
        </div>),
        },
        {
            header: 'Amount',
            className: 'text-right',
            headerClassName: 'text-right',
            accessor: (tx) => (<span className={cn("font-black text-lg", tx.transaction_type === 'Credit' ? "text-emerald-600" : "text-rose-500")}>
           {tx.transaction_type === 'Credit' ? '+' : '-'} {formatCurrency(tx.amount)}
        </span>),
        },
        {
            header: 'Status',
            className: 'text-right',
            headerClassName: 'text-right',
            accessor: (tx) => <StatusBadge status={tx.status}/>,
        },
    ];
    const expenseData = [
        { name: 'Seeds', value: 45000 },
        { name: 'Fertilizers', value: 32000 },
        { name: 'Labor', value: 15000 },
        { name: 'Equipment', value: 28000 },
    ];
    return (<AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Financial Treasury</h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Platform-wide fiscal health monitoring and auditing.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none rounded-xl font-bold gap-2">
              <FileText className="w-4 h-4"/> Generate Report
            </Button>
            <Button className="flex-1 sm:flex-none rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100">
              <Download className="w-4 h-4"/> Export Ledger
            </Button>
          </div>
        </div>

        {/* Financial Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <SummaryCard title="Monthly Revenue" value={summary?.total_revenue_month} growth={12.5} icon={TrendingUp}/>
           <SummaryCard title="Operating Expenses" value={summary?.total_expenses_month || 0} growth={5.2} icon={TrendingDown} isNegative/>
           <SummaryCard title="Active Payouts" value={summary?.active_payouts || 0} icon={DollarSign}/>
           <SummaryCard title="Ecosystem Asset Value" value={summary?.total_asset_value || 0} growth={8.2} icon={Wallet}/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Card className="p-4 sm:p-8 border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-800">Expense Allocation</h3>
                <PieChartIcon className="w-5 h-5 text-slate-300"/>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {expenseData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </Card>

           <Card className="lg:col-span-2 p-4 sm:p-8 border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-800">Income Stream Velocity</h3>
                <div className="flex gap-2">
                   <Button variant="ghost" size="sm" className="text-xs font-bold bg-slate-50 border border-slate-100">Daily</Button>
                   <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-400">Weekly</Button>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
            { day: 'Mon', rev: 45000 },
            { day: 'Tue', rev: 32000 },
            { day: 'Wed', rev: 67000 },
            { day: 'Thu', rev: 89000 },
            { day: 'Fri', rev: 41000 },
            { day: 'Sat', rev: 55000 },
            { day: 'Sun', rev: 23000 },
        ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}/>
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}/>
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }}/>
                    <Bar dataKey="rev" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </Card>
        </div>

        <div className="space-y-6">
           <SearchFilter onSearch={handleSearch} placeholder="Search ledger by name or amount..." filters={[
            {
                label: 'Type',
                value: 'transaction_type',
                options: [
                    { label: 'Credit', value: 'Credit' },
                    { label: 'Debit', value: 'Debit' },
                ]
            },
            {
                label: 'Status',
                value: 'status',
                options: [
                    { label: 'Completed', value: 'completed' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Failed', value: 'failed' },
                ]
            }
        ]} onFilterChange={handleFilterChange}/>

           <DataTable columns={columns} data={transactionsData?.transactions || []} loading={transactionsLoading} emptyMessage="No financial transactions found."/>
        </div>
      </div>
    </AdminLayout>);
};
export default Finance;
