import { Card } from '@/shared/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
export function SummaryCards({ totalIncome, totalExpense, netBalance, incomeTrend, expenseTrend, balanceTrend }) {
    const { t } = useLanguage();
    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount) || amount === 0) {
            return `${t('common.rs')} 0`;
        }
        const roundedAmount = Math.round(amount);
        const formattedAmount = roundedAmount.toLocaleString('en-IN');
        return `${t('common.rs')} ${formattedAmount}`;
    };
    return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="p-6 bg-linear-to-r from-emerald-500 to-emerald-600 text-white">
        <p className="text-emerald-100 text-sm font-medium">{t('finance.totalIncome')}</p>
        <p className="text-3xl font-bold mt-2">{formatCurrency(totalIncome)}</p>
        {incomeTrend !== undefined && (<p className={`text-xs mt-1 ${incomeTrend >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
            {incomeTrend >= 0 ? '↑' : '↓'} {Math.abs(incomeTrend)}% vs previous period
          </p>)}
      </Card>
      <Card className="p-6 bg-linear-to-r from-rose-500 to-rose-600 text-white">
        <p className="text-rose-100 text-sm font-medium">{t('finance.totalExpense')}</p>
        <p className="text-3xl font-bold mt-2">{formatCurrency(totalExpense)}</p>
        {expenseTrend !== undefined && (<p className={`text-xs mt-1 ${expenseTrend <= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
            {expenseTrend >= 0 ? '↑' : '↓'} {Math.abs(expenseTrend)}% vs previous period
          </p>)}
      </Card>
      <Card className="p-6 bg-linear-to-r from-blue-500 to-blue-600 text-white">
        <p className="text-blue-100 text-sm font-medium">{t('finance.netBalance')}</p>
        <p className="text-3xl font-bold mt-2">{formatCurrency(netBalance)}</p>
        {balanceTrend !== undefined && (<p className={`text-xs mt-1 ${balanceTrend >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
            {balanceTrend >= 0 ? '↑' : '↓'} {Math.abs(balanceTrend)}% vs previous period
          </p>)}
      </Card>
    </div>);
}
