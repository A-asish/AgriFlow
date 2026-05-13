import { Card } from '@/shared/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export function MonthlyTrendChart({ data }) {
    const { t } = useLanguage();
    const formatCurrency = (value) => {
        if (!value || isNaN(value) || value === 0)
            return `${t('common.rs')} 0`;
        const roundedAmount = Math.round(value);
        const formattedAmount = roundedAmount.toLocaleString('en-IN');
        return `${t('common.rs')} ${formattedAmount}`;
    };
    return (<Card className="p-6">
      <h3 className="text-lg font-bold mb-4">{t('finance.monthlyTrend')}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="month_name"/>
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)}/>
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" name={t('finance.income')}/>
            <Line type="monotone" dataKey="expense" stroke="#ef4444" name={t('finance.expense')}/>
            <Line type="monotone" dataKey="profit" stroke="#3b82f6" name={t('finance.netProfit')}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>);
}
