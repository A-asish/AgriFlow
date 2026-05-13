import { Card } from '@/shared/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, } from 'recharts';
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec489a', '#06b6d4', '#84cc16', '#14b8a6', '#f97316', '#ef4444'];
export function PieChartsSection({ incomeData, expenseData, totalIncome, totalExpense }) {
    const { t } = useLanguage();
    const formatCurrency = (value) => {
        if (!value || isNaN(value) || value === 0)
            return `${t('common.rs')} 0`;
        const roundedAmount = Math.round(value);
        const formattedAmount = roundedAmount.toLocaleString('en-IN');
        return `${t('common.rs')} ${formattedAmount}`;
    };
    const getCategoryDisplay = (category) => {
        const categoryKeyMap = {
            // Income categories
            'crop_sale': 'finance.cropSale',
            'subsidy': 'finance.subsidy',
            'insurance': 'finance.insurance',
            'seed_sale': 'finance.seedSale',
            'milk_sale': 'finance.milkSale',
            'egg_sale': 'finance.eggSale',
            'animal_sale': 'finance.animalSale',
            'offspring_sale': 'finance.offspringSale',
            'wool_sale': 'finance.woolSale',
            'manure_sale': 'finance.manureSale',
            'other_income': 'finance.otherIncome',
            // Expense categories
            'seeds': 'finance.seeds',
            'fertilizer': 'finance.fertilizer',
            'pesticide': 'finance.pesticide',
            'labor': 'finance.labor',
            'land_rent': 'finance.landRent',
            'irrigation': 'finance.irrigation',
            'equipment': 'finance.equipment',
            'transport': 'finance.transport',
            'feed': 'finance.feed',
            'bedding': 'finance.bedding',
            'vaccination': 'finance.vaccination',
            'health_care': 'finance.healthCare',
            'breeding_service': 'finance.breedingService',
            'animal_purchase': 'finance.animalPurchase',
            'other_expense': 'finance.otherExpense',
        };
        const key = categoryKeyMap[category];
        return key ? t(key) : category;
    };
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const total = data.type === 'income' ? totalIncome : totalExpense;
            const percentage = ((data.amount / total) * 100).toFixed(1);
            return (<div className="bg-popover border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{getCategoryDisplay(data.category)}</p>
          <p className="text-sm">{formatCurrency(data.amount)}</p>
          <p className="text-xs text-muted-foreground">{percentage}% of total</p>
        </div>);
        }
        return null;
    };
    // Custom legend component (rendered outside recharts)
    const LegendList = ({ data, total, type }) => (<div className="mt-4 space-y-2">
      {data.map((item, index) => {
            const percentage = ((item.amount / total) * 100).toFixed(1);
            return (<div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}/>
              <span className="text-muted-foreground">{getCategoryDisplay(item.category)}</span>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold">{percentage}%</span>
              <span className="text-muted-foreground">{formatCurrency(item.amount)}</span>
            </div>
          </div>);
        })}
    </div>);
    const incomeDataWithType = incomeData.map(item => ({ ...item, type: 'income' }));
    const expenseDataWithType = expenseData.map(item => ({ ...item, type: 'expense' }));
    return (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income Section */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600"/> 
          {t('finance.incomeByCategory')}
        </h3>
        {incomeData && incomeData.length > 0 ? (<>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={incomeDataWithType} cx="50%" cy="50%" outerRadius={80} dataKey="amount" nameKey="category" label={false}>
                    {incomeDataWithType.map((_, index) => (<Cell key={`cell-income-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <LegendList data={incomeData} total={totalIncome} type="income"/>
          </>) : (<div className="flex items-center justify-center h-64 text-muted-foreground">
            {t('finance.noIncomeData')}
          </div>)}
      </Card>

      {/* Expense Section */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-rose-600"/> 
          {t('finance.expenseByCategory')}
        </h3>
        {expenseData && expenseData.length > 0 ? (<>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseDataWithType} cx="50%" cy="50%" outerRadius={80} dataKey="amount" nameKey="category" label={false}>
                    {expenseDataWithType.map((_, index) => (<Cell key={`cell-expense-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <LegendList data={expenseData} total={totalExpense} type="expense"/>
          </>) : (<div className="flex items-center justify-center h-64 text-muted-foreground">
            {t('finance.noExpenseData')}
          </div>)}
      </Card>
    </div>);
}
