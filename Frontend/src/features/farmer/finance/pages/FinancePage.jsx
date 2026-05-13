import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Plus, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { financeService } from '@/features/farmer/finance/services/finance.api';
import { toast } from 'sonner';
import { SummaryCards } from '../components/SummaryCards';
import { FiltersBar } from '../components/FiltersBar';
import { MonthlyTrendChart } from '../components/MonthlyTrendChart';
import { IncomeExpenseBarChart } from '../components/IncomeExpenseBarChart';
import { PieChartsSection } from '../components/PieChartsSection';
import { BudgetCard } from '../components/BudgetCard';
import { TransactionsList } from '../components/TransactionsList';
import { BudgetFormModal } from '../components/BudgetFormModel';
const FinancePage = () => {
    const { t } = useLanguage();
    const { isAuthenticated, loading: authLoading } = useAuth();
    // State
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [budgetsLoading, setBudgetsLoading] = useState(true);
    const [showBudgetForm, setShowBudgetForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState('');
    const [filterType, setFilterType] = useState('');
    // Budget form state
    const [budgetForm, setBudgetForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        planned_income: '',
        planned_expense: '',
    });
    // Fetch summary data
    const fetchSummary = useCallback(async () => {
        try {
            const params = {};
            if (selectedYear)
                params.year = selectedYear;
            if (selectedMonth && selectedMonth !== '')
                params.month = selectedMonth;
            if (filterType && filterType !== '')
                params.type = filterType;
            const res = await financeService.getSummary(params);
            setSummary(res.data);
        }
        catch (error) {
            console.error('Error fetching summary:', error);
        }
    }, [selectedYear, selectedMonth, filterType]);
    // Fetch transactions
    const fetchTransactions = useCallback(async () => {
        try {
            const params = { page_size: 500 }; // Get more transactions
            if (selectedYear)
                params.year = selectedYear;
            if (selectedMonth && selectedMonth !== '')
                params.month = selectedMonth;
            if (filterType && filterType !== '')
                params.type = filterType;
            const res = await financeService.listTransactions(params);
            const transactionsData = res.data?.results || res.data || [];
            setTransactions(transactionsData);
            console.log('Fetched transactions:', transactionsData.length);
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }, [selectedYear, selectedMonth, filterType]);
    // Fetch budgets
    const fetchBudgets = useCallback(async () => {
        try {
            setBudgetsLoading(true);
            const res = await financeService.listBudgets();
            const budgetsData = res.data?.results || res.data || [];
            setBudgets(budgetsData);
            console.log('Fetched budgets:', budgetsData.length);
        }
        catch (error) {
            console.error("Error fetching budgets:", error);
        }
        finally {
            setBudgetsLoading(false);
        }
    }, []);
    // Load all data
    const loadAllData = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchSummary(), fetchTransactions(), fetchBudgets()]);
        setLoading(false);
    }, [fetchSummary, fetchTransactions, fetchBudgets]);
    useEffect(() => {
        if (isAuthenticated) {
            loadAllData();
        }
    }, [isAuthenticated, selectedYear, selectedMonth, filterType, loadAllData]);
    const handleRefresh = () => {
        loadAllData();
        toast.success('Data refreshed');
    };
    const handleCreateBudget = async () => {
        if (!budgetForm.planned_income || !budgetForm.planned_expense) {
            toast.error('Please enter both planned income and expense');
            return;
        }
        try {
            if (editingBudget) {
                await financeService.updateBudget(editingBudget.id, {
                    ...budgetForm,
                    planned_income: parseFloat(budgetForm.planned_income),
                    planned_expense: parseFloat(budgetForm.planned_expense),
                });
                toast.success('Budget updated successfully');
            }
            else {
                await financeService.createBudget({
                    ...budgetForm,
                    planned_income: parseFloat(budgetForm.planned_income),
                    planned_expense: parseFloat(budgetForm.planned_expense),
                });
                toast.success('Budget created successfully');
            }
            await fetchBudgets();
            setShowBudgetForm(false);
            setEditingBudget(null);
            setBudgetForm({
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                planned_income: '',
                planned_expense: '',
            });
        }
        catch (error) {
            console.error('Error saving budget:', error.response?.data || error);
            const errorData = error.response?.data;
            const errorMsg = errorData?.error || errorData?.detail || (typeof errorData === 'object' ? JSON.stringify(errorData) : 'Failed to save budget');
            toast.error(errorMsg);
        }
    };
    const handleBudgetFormChange = (field, value) => {
        setBudgetForm(prev => ({ ...prev, [field]: value }));
    };
    const handleEditBudget = (budget) => {
        setEditingBudget(budget);
        setBudgetForm({
            month: budget.month !== null ? budget.month : null,
            year: budget.year,
            planned_income: String(budget.planned_income),
            planned_expense: String(budget.planned_expense),
        });
        setShowBudgetForm(true);
    };
    const handleDeleteBudget = async (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                await financeService.deleteBudget(id);
                toast.success('Budget deleted successfully');
                await fetchBudgets();
            }
            catch (error) {
                console.error('Error deleting budget:', error);
                toast.error('Failed to delete budget');
            }
        }
    };
    if (authLoading || loading) {
        return (<MainLayout title={t('finance.title')} subtitle={t('finance.subtitle')}>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl"/>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-2xl"/>
            <Skeleton className="h-40 rounded-2xl"/>
            <Skeleton className="h-40 rounded-2xl"/>
          </div>
        </div>
      </MainLayout>);
    }
    if (!isAuthenticated) {
        return (<MainLayout title={t('finance.title')} subtitle={t('finance.subtitle')}>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Please login to view finance data</p>
        </div>
      </MainLayout>);
    }
    const monthlyData = summary?.monthly_trend || [];
    const incomeBreakdown = summary?.income_breakdown || [];
    const expenseBreakdown = summary?.expense_breakdown || [];
    return (<MainLayout title={t('finance.title')} subtitle={t('finance.subtitle')}>
      <div className="space-y-6">
        <FiltersBar selectedYear={selectedYear} selectedMonth={selectedMonth} filterType={filterType} onYearChange={setSelectedYear} onMonthChange={setSelectedMonth} onTypeChange={setFilterType} onRefresh={handleRefresh} onSetBudget={() => setShowBudgetForm(true)}/>

        <SummaryCards totalIncome={summary?.total_income || 0} totalExpense={summary?.total_expense || 0} netBalance={summary?.net_balance || 0} incomeTrend={summary?.income_trend} expenseTrend={summary?.expense_trend} balanceTrend={summary?.balance_trend}/>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md bg-slate-100 rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="budgets" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Budgets
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MonthlyTrendChart data={monthlyData}/>
            <IncomeExpenseBarChart data={monthlyData}/>
            <PieChartsSection incomeData={incomeBreakdown} expenseData={expenseBreakdown} totalIncome={summary?.total_income || 0} totalExpense={summary?.total_expense || 0}/>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setShowBudgetForm(true)} className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4"/> Create Budget
              </Button>
            </div>

            {budgetsLoading ? (<div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"/>
              </div>) : budgets.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => (<BudgetCard key={budget.id} budget={budget} transactions={transactions} onEdit={handleEditBudget} onDelete={handleDeleteBudget}/>))}
              </div>) : (<div className="text-center py-20 bg-slate-50 rounded-2xl">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-10 h-10 text-slate-400"/>
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Budgets Yet</h3>
                <p className="text-slate-500 mb-6">Create your first budget to start tracking your financial goals</p>
                <Button onClick={() => setShowBudgetForm(true)} className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2"/> Create Budget
                </Button>
              </div>)}
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsList transactions={transactions}/>
          </TabsContent>
        </Tabs>
      </div>

      <BudgetFormModal isOpen={showBudgetForm} editingBudget={editingBudget} budgetForm={budgetForm} existingBudgets={budgets} onClose={() => {
            setShowBudgetForm(false);
            setEditingBudget(null);
        }} onSubmit={handleCreateBudget} onFormChange={handleBudgetFormChange}/>
    </MainLayout>);
};
export default FinancePage;
