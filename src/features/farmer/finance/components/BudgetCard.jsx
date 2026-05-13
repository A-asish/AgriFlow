import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Target, Edit2, Trash2, AlertCircle, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
export function BudgetCard({ budget, transactions = [], onEdit, onDelete }) {
    const { t } = useLanguage();
    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount) || amount === 0) {
            return `${t('common.rs') || '₹'} 0`;
        }
        const roundedAmount = Math.round(amount);
        const formattedAmount = roundedAmount.toLocaleString('en-IN');
        return `${t('common.rs') || '₹'} ${formattedAmount}`;
    };
    // Calculate actual income and expense from transactions for this budget period
    const calculateActuals = () => {
        if (!transactions.length) {
            return { actualIncome: 0, actualExpense: 0 };
        }
        const filtered = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const transactionYear = transactionDate.getFullYear();
            // Check year match
            if (transactionYear !== Number(budget.year))
                return false;
            // If monthly budget, check month match
            if (budget.month !== null && budget.month !== undefined) {
                const transactionMonth = transactionDate.getMonth() + 1;
                return transactionMonth === Number(budget.month);
            }
            // Annual budget - only year check
            return true;
        });
        const actualIncome = filtered
            .filter(t => t.type === 'income' || t.transaction_type?.includes('income'))
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        const actualExpense = filtered
            .filter(t => t.type === 'expense' || t.transaction_type?.includes('expense'))
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        return { actualIncome, actualExpense };
    };
    const { actualIncome, actualExpense } = calculateActuals();
    const plannedExpense = parseFloat(budget.planned_expense) || 0;
    const plannedIncome = parseFloat(budget.planned_income) || 0;
    const expenseProgress = plannedExpense > 0 ? (actualExpense / plannedExpense) * 100 : 0;
    const incomeProgress = plannedIncome > 0 ? (actualIncome / plannedIncome) * 100 : 0;
    const isOverBudget = expenseProgress > 100;
    const monthName = budget.month
        ? new Date(0, budget.month - 1).toLocaleString('default', { month: 'long' })
        : t('finance.annual') || 'Annual';
    const remainingBudget = plannedExpense - actualExpense;
    const remainingIncome = plannedIncome - actualIncome;
    const getStatusBgColor = () => {
        if (isOverBudget)
            return 'bg-red-100 text-red-600';
        if (expenseProgress > 80)
            return 'bg-yellow-100 text-yellow-600';
        return 'bg-emerald-100 text-emerald-600';
    };
    const getStatusText = () => {
        if (isOverBudget)
            return t('finance.overBudget') || 'Over Budget';
        if (expenseProgress > 80)
            return t('finance.nearLimit') || 'Near Limit';
        return t('finance.onTrack') || 'On Track';
    };
    const getProgressBarColor = () => {
        if (isOverBudget)
            return 'bg-red-500';
        if (expenseProgress > 80)
            return 'bg-yellow-500';
        return 'bg-emerald-500';
    };
    return (<Card className="border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Header with gradient */}
      <CardHeader className={`pb-2 bg-gradient-to-r ${isOverBudget ? 'from-red-50 to-transparent' : 'from-emerald-50 to-transparent'}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-600"/>
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                {budget.month ? `${monthName} ${budget.year}` : monthName}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3 text-muted-foreground"/>
                <span className="text-xs text-muted-foreground">
                  {budget.month ? t('finance.monthlyBudget') || 'Monthly Budget' : t('finance.annualBudget') || 'Annual Budget'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-emerald-100" onClick={() => onEdit(budget)}>
              <Edit2 className="w-3.5 h-3.5 text-emerald-600"/>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-red-100" onClick={() => onDelete(budget.id)}>
              <Trash2 className="w-3.5 h-3.5 text-red-500"/>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Status Badge */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground">{t('finance.budgetStatus') || 'Budget Status'}</span>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusBgColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Expense Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <TrendingDown className="w-3 h-3"/> {t('finance.totalExpense') || 'Expense'}
            </span>
            <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-foreground'}`}>
              {formatCurrency(actualExpense)} / {formatCurrency(plannedExpense)}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${getProgressBarColor()}`} style={{ width: `${Math.min(expenseProgress, 100)}%` }}/>
          </div>
          {isOverBudget && (<div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3"/>
              <span>{t('finance.overBudgetBy') || 'Over budget by'} {formatCurrency(actualExpense - plannedExpense)}</span>
            </div>)}
          {remainingBudget > 0 && !isOverBudget && (<div className="flex items-center gap-1 text-xs text-emerald-600">
              <span>✓ {t('finance.remainingBudget') || 'Remaining budget'}: {formatCurrency(remainingBudget)}</span>
            </div>)}
        </div>

        {/* Income Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3"/> {t('finance.totalIncome') || 'Income'}
            </span>
            <span className="font-bold text-emerald-600">
              {formatCurrency(actualIncome)} / {formatCurrency(plannedIncome)}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all bg-emerald-500" style={{ width: `${Math.min(incomeProgress, 100)}%` }}/>
          </div>
          {remainingIncome > 0 && (<div className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="w-3 h-3"/>
              <span>{t('finance.incomeTargetRemaining') || 'Income target'}: {formatCurrency(remainingIncome)} {t('finance.remaining') || 'remaining'}</span>
            </div>)}
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-emerald-50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
              {t('finance.plannedSavings') || 'Planned Savings'}
            </p>
            <p className="font-bold text-emerald-600 text-sm">
              {formatCurrency(plannedIncome - plannedExpense)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
              {t('finance.actualSavings') || 'Actual Savings'}
            </p>
            <p className={`font-bold text-sm ${(actualIncome - actualExpense) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(actualIncome - actualExpense)}
            </p>
          </div>
        </div>

        {/* Note about actuals calculation */}
        <div className="text-center pt-1">
          <p className="text-[9px] text-gray-400">
            Actual amounts calculated from your transactions
          </p>
        </div>
      </CardContent>
    </Card>);
}
