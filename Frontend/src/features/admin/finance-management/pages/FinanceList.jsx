// src/features/admin/finance-management/pages/FinanceList.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from "@/lib/utils";
import AdminLayout from '../../components/AdminLayout';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  PieChart as PieChartIcon, 
  Search,
  RefreshCw,
  Loader2,
  Users
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import adminService from '../../services/admin.api';
import { toast } from 'sonner';

// Helper functions with compact currency
const formatCompactCurrency = (amount) => {
  if (!amount || amount === 0) return 'Rs. 0';
  const num = Number(amount);
  if (num >= 10000000) return `Rs. ${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 1000000) return `Rs. ${(num / 1000000).toFixed(1)}M`;
  if (num >= 100000) return `Rs. ${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `Rs. ${(num / 1000).toFixed(1)}K`;
  return `Rs. ${num.toLocaleString('en-IN')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN');
  } catch {
    return 'N/A';
  }
};

// Transaction Type Badge
const TransactionTypeBadge = ({ isIncome }) => {
  if (isIncome) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Income
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
      Expense
    </span>
  );
};

// Source Badge
const SourceBadge = ({ source }) => {
  if (source === 'crop') {
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">🌾 Crop</span>;
  }
  if (source === 'livestock') {
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">🐄 Livestock</span>;
  }
  return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">General</span>;
};

const FinanceList = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [farmers, setFarmers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 1
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [farmerFilter, setFarmerFilter] = useState('all');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  
  const isInitialMount = useRef(true);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899'];

  const fetchFarmers = useCallback(async () => {
    try {
      const response = await adminService.listFarmers({ page: 1, page_size: 100 });
      setFarmers(response.data.farmers || []);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  }, []);

  // Fetch dashboard data - uses the same endpoint as Dashboard
  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      // Use the same stats endpoint that Dashboard uses
      const statsResponse = await adminService.getStats();
      const dashboardStats = statsResponse.data;
      
      // For monthly breakdown, fetch filtered data
      const filteredResponse = await adminService.getFinanceDashboard({ year, month });
      const filteredData = filteredResponse.data;
      
      // Combine both for consistency
      setDashboardData({
        total_income: filteredData?.total_income || 0,
        total_expense: filteredData?.total_expense || 0,
        net_balance: filteredData?.net_balance || 0,
        income_trend: filteredData?.income_trend || 0,
        expense_trend: filteredData?.expense_trend || 0,
        balance_trend: filteredData?.balance_trend || 0,
        crop_income: filteredData?.crop_income || 0,
        crop_expense: filteredData?.crop_expense || 0,
        livestock_income: filteredData?.livestock_income || 0,
        livestock_expense: filteredData?.livestock_expense || 0,
        expense_breakdown: filteredData?.expense_breakdown || [],
        monthly_trend: filteredData?.monthly_trend || [],
        // Add monthly revenue for the period
        monthly_revenue: filteredData?.total_income || 0,
        // Add global stats
        total_revenue_all: dashboardStats?.total_revenue_all || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setDashboardLoading(false);
    }
  }, [year, month]);

  const fetchTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: pagination.page_size,
        year: year,
        month: month,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (typeFilter && typeFilter !== 'all') params.type = typeFilter;
      if (farmerFilter && farmerFilter !== 'all') params.farmer_id = farmerFilter;
      
      const response = await adminService.listFinanceTransactions(params);
      setTransactions(response.data.transactions || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        total_pages: response.data.pagination?.total_pages || 1
      }));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }, [pagination.page, pagination.page_size, year, month, searchTerm, typeFilter, farmerFilter]);

  useEffect(() => {
    fetchFarmers();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchDashboard();
      fetchTransactions();
    } else {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        fetchDashboard();
        fetchTransactions();
      }
    }
  }, [year, month]);

  useEffect(() => {
    if (!isInitialMount.current) {
      fetchTransactions();
    }
  }, [pagination.page, searchTerm, typeFilter, farmerFilter]);

  const handleRefresh = () => {
    fetchDashboard();
    fetchTransactions();
  };

  const handleExport = async () => {
    try {
      const params = {
        start_date: `${year}-01-01`,
        end_date: `${year}-12-31`
      };
      if (farmerFilter && farmerFilter !== 'all') params.farmer_id = farmerFilter;
      
      const response = await adminService.exportTransactions(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Transactions exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export transactions');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const SummaryCard = ({ title, value, trend, icon: Icon, isNegative, subtitle }) => (
    <Card className="p-4 border-slate-100 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
        <Icon className="w-20 h-20"/>
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
            <Icon className="w-5 h-5"/>
          </div>
          {trend !== undefined && trend !== null && (
            <Badge className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-0.5", 
              isNegative ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
            )}>
              {isNegative ? <ArrowDownRight className="w-2.5 h-2.5"/> : <ArrowUpRight className="w-2.5 h-2.5"/>}
              {Math.abs(trend)}%
            </Badge>
          )}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-xl font-black text-slate-800 tracking-tight">{formatCompactCurrency(value)}</h3>
        {subtitle && <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </Card>
  );

  const expenseBreakdown = dashboardData?.expense_breakdown || [];
  const monthlyTrend = dashboardData?.monthly_trend || [];

  const totalIncome = dashboardData?.total_income || 0;
  const totalExpense = dashboardData?.total_expense || 0;
  const netBalance = dashboardData?.net_balance || 0;
  const incomeTrend = dashboardData?.income_trend || 0;
  const expenseTrend = dashboardData?.expense_trend || 0;
  const balanceTrend = dashboardData?.balance_trend || 0;
  const cropIncome = dashboardData?.crop_income || 0;
  const cropExpense = dashboardData?.crop_expense || 0;
  const livestockIncome = dashboardData?.livestock_income || 0;
  const livestockExpense = dashboardData?.livestock_expense || 0;
  const monthlyRevenue = dashboardData?.monthly_revenue || totalIncome;

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];
  
  const monthOptions = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
  ];

  const farmerOptions = [
    { value: 'all', label: 'All Farmers' },
    ...farmers.map(farmer => ({ value: farmer.id.toString(), label: farmer.full_name || farmer.username }))
  ];

  if (dashboardLoading && transactionsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Financial Management</h1>
            <p className="text-sm text-slate-500">Platform-wide fiscal health monitoring.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} className="gap-2 rounded-xl h-9 text-sm">
              <RefreshCw className="w-4 h-4"/> Refresh
            </Button>
            <Button onClick={handleExport} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm">
              <Download className="w-4 h-4"/> Export
            </Button>
          </div>
        </div>

        {/* Summary Cards - Now showing monthly revenue correctly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <SummaryCard title="Total Income" value={totalIncome} trend={incomeTrend} icon={TrendingUp} />
          <SummaryCard title="Total Expense" value={totalExpense} trend={expenseTrend} icon={TrendingDown} isNegative />
          <SummaryCard title="Net Balance" value={netBalance} trend={balanceTrend} icon={Wallet} isNegative={netBalance < 0} />
          <SummaryCard title="Crop Income" value={cropIncome} icon={DollarSign} />
          <SummaryCard title="Livestock Income" value={livestockIncome} icon={DollarSign} />
          <SummaryCard title="Monthly Revenue" value={monthlyRevenue} icon={Calendar} subtitle={`${monthOptions.find(m => m.value === month)?.label} ${year}`} />
        </div>

        {/* Crops vs Livestock Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="p-3">
            <p className="text-xs text-gray-500">🌾 Crops</p>
            <div className="flex items-center gap-4 mt-1">
              <div><p className="text-[10px] text-green-600">Income</p><p className="text-sm font-bold text-green-600">{formatCompactCurrency(cropIncome)}</p></div>
              <div><p className="text-[10px] text-red-600">Expense</p><p className="text-sm font-bold text-red-600">{formatCompactCurrency(cropExpense)}</p></div>
              <div><p className="text-[10px] text-blue-600">Profit</p><p className="text-sm font-bold text-blue-600">{formatCompactCurrency(cropIncome - cropExpense)}</p></div>
            </div>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-gray-500">🐄 Livestock</p>
            <div className="flex items-center gap-4 mt-1">
              <div><p className="text-[10px] text-green-600">Income</p><p className="text-sm font-bold text-green-600">{formatCompactCurrency(livestockIncome)}</p></div>
              <div><p className="text-[10px] text-red-600">Expense</p><p className="text-sm font-bold text-red-600">{formatCompactCurrency(livestockExpense)}</p></div>
              <div><p className="text-[10px] text-blue-600">Profit</p><p className="text-sm font-bold text-blue-600">{formatCompactCurrency(livestockIncome - livestockExpense)}</p></div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4">
            <h3 className="text-sm font-bold mb-3">Expense Allocation</h3>
            <div className="h-64">
              {expenseBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseBreakdown} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="amount" nameKey="category" label={({ percentage }) => percentage > 5 ? `${percentage}%` : ''} labelLine={false}>
                      {expenseBreakdown.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]}/>))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCompactCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (<div className="flex items-center justify-center h-full text-gray-400">No data</div>)}
            </div>
          </Card>

          <Card className="lg:col-span-2 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold">Monthly Trend</h3>
              <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{yearOptions.map(y => (<SelectItem key={y} value={y.toString()}>{y}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="h-64">
              {monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="month_name" tick={{ fontSize: 10 }}/>
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}K`}/>
                    <Tooltip formatter={(v) => formatCompactCurrency(v)}/>
                    <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} name="Income" />
                    <Bar dataKey="expense" fill="#f43f5e" radius={[4,4,0,0]} name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (<div className="flex items-center justify-center h-full text-gray-400">No data</div>)}
            </div>
          </Card>
        </div>

        {/* Transactions Table */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-9 text-sm" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-28 h-9 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent>
              </Select>
              <Select value={farmerFilter} onValueChange={setFarmerFilter}><SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Farmer" /></SelectTrigger>
                <SelectContent>{farmerOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
              </Select>
              <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}><SelectTrigger className="w-28 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{monthOptions.map(m => (<SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>))}</SelectContent>
              </Select>
              <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}><SelectTrigger className="w-20 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{yearOptions.map(y => (<SelectItem key={y} value={y.toString()}>{y}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead><TableHead className="text-xs">Farmer</TableHead><TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs">Category</TableHead><TableHead className="text-xs">Source</TableHead><TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-right text-xs">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No transactions</TableCell></TableRow>
                  ) : (
                    transactions.map((tx, idx) => {
                      const isIncome = tx.transaction_type?.includes('income') || tx.is_income;
                      const source = tx.transaction_type?.includes('crop') ? 'crop' : tx.transaction_type?.includes('animal') ? 'livestock' : 'general';
                      return (
                        <TableRow key={idx}>
                          <TableCell className="text-xs">{formatDate(tx.date)}</TableCell>
                          <TableCell className="text-xs">{tx.farmer_name || 'Unknown'}</TableCell>
                          <TableCell className="text-xs">{tx.description}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs bg-slate-50">{tx.category}</Badge></TableCell>
                          <TableCell><SourceBadge source={source} /></TableCell>
                          <TableCell><TransactionTypeBadge isIncome={isIncome} /></TableCell>
                          <TableCell className="text-right"><span className={cn("text-xs font-bold", isIncome ? "text-emerald-600" : "text-rose-500")}>{isIncome ? '+' : '-'} {formatCompactCurrency(tx.amount)}</span></TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {pagination.total_pages > 1 && (
            <div className="flex justify-between items-center px-2 flex-wrap gap-2">
              <div className="text-xs text-gray-500">Showing {((pagination.page - 1) * pagination.page_size) + 1} to {Math.min(pagination.page * pagination.page_size, pagination.total)} of {pagination.total}</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="h-7 text-xs px-2">Prev</Button>
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  let pageNum = pagination.total_pages <= 5 ? i + 1 : (pagination.page <= 3 ? i + 1 : (pagination.page >= pagination.total_pages - 2 ? pagination.total_pages - 4 + i : pagination.page - 2 + i));
                  return pageNum && (<Button key={pageNum} variant={pagination.page === pageNum ? "default" : "outline"} size="sm" onClick={() => handlePageChange(pageNum)} className={`h-7 w-7 text-xs ${pagination.page === pageNum ? "bg-emerald-600" : ""}`}>{pageNum}</Button>);
                })}
                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.total_pages} className="h-7 text-xs px-2">Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default FinanceList;