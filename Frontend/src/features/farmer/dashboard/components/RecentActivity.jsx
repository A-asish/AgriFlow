import { CheckCircle2, Clock, AlertCircle, TrendingUp, TrendingDown, Wheat, Beef, Sprout, Syringe, Pill, Flower2, Milestone, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { financeService } from '@/features/farmer/finance/services/finance.api';
import { cropsService } from '@/features/farmer/crops/services/crops.api';
import { Button } from '@/shared/components/ui/button';
export function RecentActivity() {
    const { t } = useLanguage();
    const [allActivities, setAllActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    // Multi-lingual time ago function
    const getTimeAgo = (date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);
        if (diffSeconds < 60)
            return t('dashboard.justNow');
        if (diffMinutes < 60) {
            if (diffMinutes === 1)
                return `1 ${t('dashboard.minuteAgo')}`;
            return `${diffMinutes} ${t('dashboard.minutesAgo')}`;
        }
        if (diffHours < 24) {
            if (diffHours === 1)
                return `1 ${t('dashboard.hourAgo')}`;
            return `${diffHours} ${t('dashboard.hoursAgo')}`;
        }
        if (diffDays === 1)
            return t('dashboard.yesterday');
        if (diffDays < 7)
            return `${diffDays} ${t('dashboard.daysAgo')}`;
        if (diffWeeks === 1)
            return `1 ${t('dashboard.weekAgo')}`;
        if (diffWeeks < 4)
            return `${diffWeeks} ${t('dashboard.weeksAgo')}`;
        if (diffMonths === 1)
            return `1 ${t('dashboard.monthAgo')}`;
        if (diffMonths < 12)
            return `${diffMonths} ${t('dashboard.monthsAgo')}`;
        if (diffYears === 1)
            return `1 ${t('dashboard.yearAgo')}`;
        return `${diffYears} ${t('dashboard.yearsAgo')}`;
    };
    const formatFullDate = (date) => {
        const locale = t('common.locale') === 'np' ? 'ne-NP' : 'en-US';
        return date.toLocaleString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };
    const getActivityTitle = (tx, amountText) => {
        let type = 'finance';
        let icon = tx.transaction_type?.includes('income') ? TrendingUp : TrendingDown;
        let title = '';
        // Helper function to format category name
        const formatCategoryName = (category) => {
            if (!category)
                return '';
            // Replace underscores with spaces
            let formatted = category.replace(/_/g, ' ');
            // Capitalize first letter of each word
            formatted = formatted.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            return formatted;
        };
        const formattedCategory = formatCategoryName(tx.category);
        if (tx.transaction_type === 'crop_income') {
            title = `${t('dashboard.activityCropIncome')}: ${formattedCategory}${amountText}`;
            icon = Wheat;
            type = 'crop';
        }
        else if (tx.transaction_type === 'crop_expense') {
            title = `${t('dashboard.activityCropExpense')}: ${formattedCategory}${amountText}`;
            icon = Sprout;
            type = 'crop';
        }
        else if (tx.transaction_type === 'animal_income') {
            title = `${t('dashboard.activityAnimalIncome')}: ${formattedCategory}${amountText}`;
            icon = Beef;
            type = 'livestock';
        }
        else if (tx.transaction_type === 'animal_expense') {
            title = `${t('dashboard.activityAnimalExpense')}: ${formattedCategory}${amountText}`;
            icon = Milestone;
            type = 'livestock';
        }
        else {
            title = `${formattedCategory || t('finance.transaction')}${amountText}`;
        }
        // Override specific categories with custom formatting
        if (tx.category === 'Vaccination') {
            icon = Syringe;
            type = 'vaccination';
            title = `${t('dashboard.activityVaccination')}${amountText}`;
        }
        else if (tx.category === 'Health Care') {
            icon = Pill;
            type = 'health';
            title = `${t('dashboard.activityHealthCare')}${amountText}`;
        }
        else if (tx.category === 'Fertilizer') {
            icon = Flower2;
            title = `${t('dashboard.activityFertilizer')}${amountText}`;
        }
        else if (tx.category === 'Animal Purchase') {
            icon = Beef;
            title = `${t('dashboard.activityAnimalPurchase')}${amountText}`;
        }
        return { title, type, icon };
    };
    const shortenTitle = (title) => {
        if (title.length > 45)
            return title.substring(0, 42) + '...';
        return title;
    };
    const fetchActivities = async () => {
        setLoading(true);
        try {
            // Fetch ALL transactions (no pagination limit)
            const transactionsRes = await financeService.listTransactions({ limit: 100 });
            const transactions = transactionsRes.data?.results || transactionsRes.data || [];
            const cropsRes = await cropsService.listCrops();
            const crops = Array.isArray(cropsRes.data) ? cropsRes.data : [];
            const fetchedActivities = [];
            transactions.forEach((tx) => {
                let activityDate;
                if (tx.created_at) {
                    activityDate = new Date(tx.created_at);
                }
                else if (tx.date) {
                    activityDate = new Date(tx.date);
                }
                else {
                    activityDate = new Date();
                }
                const amountText = tx.amount ? ` - ${t('common.rs')} ${tx.amount.toLocaleString('en-IN')}` : '';
                const { title, type, icon } = getActivityTitle(tx, amountText);
                const status = tx.transaction_type?.includes('income') ? 'income' : 'expense';
                fetchedActivities.push({
                    id: `tx_${tx.id}`,
                    type,
                    title: shortenTitle(title),
                    time: getTimeAgo(activityDate),
                    date: activityDate,
                    timestamp: activityDate.getTime(),
                    status,
                    icon,
                    amount: tx.amount,
                    category: tx.category,
                });
            });
            // Add crop status updates
            crops.forEach((crop) => {
                let updateDate;
                if (crop.updated_at) {
                    updateDate = new Date(crop.updated_at);
                }
                else if (crop.created_at) {
                    updateDate = new Date(crop.created_at);
                }
                else {
                    updateDate = new Date();
                }
                if (crop.status === 'harvested') {
                    fetchedActivities.push({
                        id: `crop_${crop.id}`,
                        type: 'crop',
                        title: `${crop.name} ${t('dashboard.activityHarvested')}`,
                        time: getTimeAgo(updateDate),
                        date: updateDate,
                        timestamp: updateDate.getTime(),
                        status: 'success',
                        icon: Wheat,
                    });
                }
            });
            // Sort by timestamp - newest first
            fetchedActivities.sort((a, b) => b.timestamp - a.timestamp);
            setAllActivities(fetchedActivities);
        }
        catch (error) {
            console.error('Error fetching activities:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchActivities();
    }, []);
    // Calculate paginated activities
    const totalActivities = allActivities.length;
    const totalPages = Math.ceil(totalActivities / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedActivities = allActivities.slice(startIndex, endIndex);
    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };
    const statusIcons = {
        success: <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600"/>,
        pending: <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600"/>,
        expense: <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500"/>,
        income: <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600"/>,
        alert: <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500"/>,
    };
    if (loading && allActivities.length === 0) {
        return (<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-800">{t('dashboard.recentActivity')}</h3>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"/>
        </div>
      </div>);
    }
    return (<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800">{t('dashboard.recentActivity')}</h3>
          {totalActivities > 0 && (<p className="text-xs text-gray-400 mt-0.5">
              {totalActivities} {t('dashboard.totalActivities')}
            </p>)}
        </div>
        <button onClick={() => fetchActivities()} className="text-[10px] sm:text-xs font-medium text-green-600 hover:text-green-700">
          {t('dashboard.refresh')}
        </button>
      </div>

      <div className="flex-1 space-y-3 sm:space-y-4">
        {paginatedActivities.length > 0 ? (paginatedActivities.map((activity) => (<div key={activity.id} className="flex items-start gap-3 sm:gap-4 group">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors border shrink-0
                ${activity.type === 'crop' ? 'bg-green-50 border-green-100 group-hover:bg-green-100' : ''}
                ${activity.type === 'livestock' ? 'bg-amber-50 border-amber-100 group-hover:bg-amber-100' : ''}
                ${activity.type === 'finance' ? 'bg-blue-50 border-blue-100 group-hover:bg-blue-100' : ''}
                ${activity.type === 'health' ? 'bg-rose-50 border-rose-100 group-hover:bg-rose-100' : ''}
                ${activity.type === 'vaccination' ? 'bg-indigo-50 border-indigo-100 group-hover:bg-indigo-100' : ''}
              `}>
                <activity.icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors
                  ${activity.type === 'crop' ? 'text-green-600 group-hover:text-green-700' : ''}
                  ${activity.type === 'livestock' ? 'text-amber-600 group-hover:text-amber-700' : ''}
                  ${activity.type === 'finance' ? 'text-blue-600 group-hover:text-blue-700' : ''}
                  ${activity.type === 'health' ? 'text-rose-600 group-hover:text-rose-700' : ''}
                  ${activity.type === 'vaccination' ? 'text-indigo-600 group-hover:text-indigo-700' : ''}
                `}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate" title={activity.title}>
                    {activity.title}
                  </p>
                  <div className="shrink-0">
                    {statusIcons[activity.status]}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[10px] sm:text-xs text-gray-500" title={formatFullDate(activity.date)}>
                    {activity.time}
                  </p>
                  {activity.amount && (<span className="text-[9px] sm:text-[10px] text-gray-400">
                      • {t('common.rs')} {activity.amount.toLocaleString('en-IN')}
                    </span>)}
                </div>
              </div>
            </div>))) : (<div className="text-center py-12">
            <p className="text-sm text-gray-500">{t('dashboard.noRecentActivity')}</p>
          </div>)}
      </div>

      {/* Pagination - Only show if more than 1 page */}
      {totalPages > 1 && (<div className="flex items-center justify-between mt-4 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="h-7 px-2 text-xs gap-1">
            <ChevronLeft className="w-3 h-3"/> {t('common.previous')}
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="h-7 px-2 text-xs gap-1">
            {t('common.next')} <ChevronRight className="w-3 h-3"/>
          </Button>
        </div>)}
    </div>);
}
