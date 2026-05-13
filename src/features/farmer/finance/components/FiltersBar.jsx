import { Button } from '@/shared/components/ui/button';
import { Calendar, Filter, RefreshCw, Target, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
export function FiltersBar({ selectedYear, selectedMonth, filterType, onYearChange, onMonthChange, onTypeChange, onRefresh, onSetBudget, }) {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const years = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];
    const months = [
        { value: '', label: t('common.all') },
        { value: '1', label: t('finance.jan') },
        { value: '2', label: t('finance.feb') },
        { value: '3', label: t('finance.mar') },
        { value: '4', label: t('finance.apr') },
        { value: '5', label: t('finance.may') },
        { value: '6', label: t('finance.jun') },
        { value: '7', label: t('finance.jul') },
        { value: '8', label: t('finance.aug') },
        { value: '9', label: t('finance.sep') },
        { value: '10', label: t('finance.oct') },
        { value: '11', label: t('finance.nov') },
        { value: '12', label: t('finance.dec') },
    ];
    return (<div className="flex flex-wrap justify-between items-center gap-4">
      <div className="flex flex-wrap gap-3">
        {/* Year Filter */}
        <div className="flex items-center gap-2 bg-muted/30 rounded-xl px-3 py-2">
          <Calendar className="w-4 h-4 text-muted-foreground"/>
          <select className="bg-transparent text-sm focus:outline-none" value={selectedYear} onChange={(e) => onYearChange(parseInt(e.target.value))}>
            {years.map(year => (<option key={year} value={year}>{year}</option>))}
          </select>
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-2 bg-muted/30 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-muted-foreground"/>
          <select className="bg-transparent text-sm focus:outline-none" value={selectedMonth} onChange={(e) => onMonthChange(e.target.value)}>
            {months.map(month => (<option key={month.value} value={month.value}>{month.label}</option>))}
          </select>
        </div>

        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2"/> {t('common.refresh')}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onSetBudget}>
          <Target className="w-4 h-4 mr-2"/> {t('finance.setBudget')}
        </Button>
        <Button onClick={() => navigate('/finance/new')}>
          <Plus className="w-4 h-4 mr-2"/> {t('finance.addTransaction')}
        </Button>
      </div>
    </div>);
}
