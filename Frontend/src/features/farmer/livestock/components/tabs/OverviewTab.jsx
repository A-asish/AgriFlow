import { useState, useEffect, useCallback } from 'react';
import { Calendar, Tag, HeartPulse, Baby, DollarSign, Info, Sprout, AlertTriangle, Clock, CircleCheck, RotateCcw, RefreshCw, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import notificationApi from '@/features/common/services/notification.api';
import { normalizeReminder } from '@/features/farmer/dashboard/utils/reminderUtils';

function RelatedAlerts({ itemId, source }) {
    const { t, language } = useLanguage();
    const [alerts, setAlerts] = useState([]);
    const [filteredAlerts, setFilteredAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 3;

    // Filter states
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed
    const [filterPriority, setFilterPriority] = useState('all'); // all, critical, urgent, high, medium, low

    const fetchAlerts = useCallback(async (showSpinner = false) => {
        if (showSpinner) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        try {
            const response = await notificationApi.getFarmAlerts({ status: 'all' });
            if (response) {
                const rawAlerts = source === 'crop' ? response.crop : response.livestock;
                const normalized = (rawAlerts || []).map(a => normalizeReminder(a, source));
                const filtered = normalized.filter(a => {
                    // normalizeReminder stores the linked record ID in `sourceId`
                    return String(a.sourceId) === String(itemId);
                });
                setAlerts(filtered);
                setFilteredAlerts(filtered);
            }
        } catch (error) {
            console.error('Failed to fetch related alerts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [itemId, source]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    // Apply filters whenever alerts or filter states change
    useEffect(() => {
        let result = [...alerts];

        // Filter by status
        if (filterStatus === 'active') {
            result = result.filter(a => !a.isCompleted);
        } else if (filterStatus === 'completed') {
            result = result.filter(a => a.isCompleted);
        }

        // Filter by priority
        if (filterPriority !== 'all') {
            result = result.filter(a => a.priority === filterPriority);
        }

        setFilteredAlerts(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [alerts, filterStatus, filterPriority]);

    const handleMarkComplete = async (alertId) => {
        setActionId(alertId);
        try {
            await notificationApi.markAsCompleted(alertId);
            setAlerts(prev =>
                prev.map(a => a.id === alertId ? { ...a, isCompleted: true } : a)
            );
        } catch (error) {
            console.error('Failed to mark alert complete:', error);
        } finally {
            setActionId(null);
        }
    };

    const handleReopen = async (alertId) => {
        setActionId(alertId);
        try {
            await notificationApi.markAsUncompleted(alertId);
            setAlerts(prev =>
                prev.map(a => a.id === alertId ? { ...a, isCompleted: false } : a)
            );
        } catch (error) {
            console.error('Failed to reopen alert:', error);
        } finally {
            setActionId(null);
        }
    };

    const clearFilters = () => {
        setFilterStatus('all');
        setFilterPriority('all');
    };

    const priorityStyles = {
        critical: 'bg-red-100 text-red-700 border-red-200',
        urgent: 'bg-orange-100 text-orange-700 border-orange-200',
        high: 'bg-orange-50 text-orange-600 border-orange-100',
        medium: 'bg-amber-50 text-amber-700 border-amber-100',
        low: 'bg-green-50 text-green-700 border-green-100',
    };

    const formatDueDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        const locale = language === 'np' ? 'ne-NP' : 'en-US';
        return date.toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const totalItems = filteredAlerts.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    if (loading) {
        return (
            <div className="farm-card p-6 flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
            </div>
        );
    }

    if (alerts.length === 0) {
        return null;
    }

    const activeCount = alerts.filter(a => !a.isCompleted).length;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

    const hasActiveFilters = filterStatus !== 'all' || filterPriority !== 'all';

    return (
        <div className="farm-card p-6 border-rose-100 bg-rose-50/10 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    <h3 className="text-lg font-bold text-gray-800">
                        {language === 'np' ? 'सम्बन्धित सतर्कताहरू' : 'Related Alerts'}
                    </h3>
                    {activeCount > 0 && (
                        <Badge className="bg-rose-500 text-white hover:bg-rose-600 font-normal">
                            {activeCount} {language === 'np' ? 'सक्रिय' : 'active'}
                        </Badge>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                    onClick={() => fetchAlerts(true)}
                    disabled={refreshing}
                >
                    <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Filter className="w-4 h-4" />
                    <span>{language === 'np' ? 'फिल्टर' : 'Filter'}:</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    {/* Status Filter */}
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-8 w-35 rounded-lg text-xs border-gray-200 bg-white">
                            <SelectValue placeholder={language === 'np' ? 'सबै स्थिति' : 'All status'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{language === 'np' ? 'सबै स्थिति' : 'All status'}</SelectItem>
                            <SelectItem value="active">{language === 'np' ? 'सक्रिय' : 'Active'}</SelectItem>
                            <SelectItem value="completed">{language === 'np' ? 'सम्पन्न' : 'Completed'}</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Priority Filter */}
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="h-8 w-35 rounded-lg text-xs border-gray-200 bg-white">
                            <SelectValue placeholder={language === 'np' ? 'सबै प्राथमिकता' : 'All priority'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{language === 'np' ? 'सबै प्राथमिकता' : 'All priority'}</SelectItem>
                            <SelectItem value="critical">{language === 'np' ? 'जोखिमपूर्ण' : 'Critical'}</SelectItem>
                            <SelectItem value="urgent">{language === 'np' ? 'अत्यावश्यक' : 'Urgent'}</SelectItem>
                            <SelectItem value="high">{language === 'np' ? 'उच्च' : 'High'}</SelectItem>
                            <SelectItem value="medium">{language === 'np' ? 'मध्यम' : 'Medium'}</SelectItem>
                            <SelectItem value="low">{language === 'np' ? 'न्यून' : 'Low'}</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-gray-500 hover:text-gray-700"
                            onClick={clearFilters}
                        >
                            <X className="w-3 h-3 mr-1" />
                            {language === 'np' ? 'खाली गर्नुहोस्' : 'Clear'}
                        </Button>
                    )}
                </div>

                {/* Results count */}
                <div className="ml-auto text-xs text-muted-foreground">
                    {language === 'np' 
                        ? `${filteredAlerts.length} मध्ये ${alerts.length} फेला पर्यो`
                        : `Found ${filteredAlerts.length} of ${alerts.length}`}
                </div>
            </div>

            {/* Alert List */}
            <div className="space-y-3 max-h-75 overflow-y-auto pr-1">
                {paginatedAlerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">
                            {language === 'np' 
                                ? 'कुनै पनि फिल्टरसँग मेल खाने सतर्कताहरू छैनन्' 
                                : 'No alerts match the selected filters'}
                        </p>
                        {hasActiveFilters && (
                            <Button
                                variant="link"
                                size="sm"
                                className="text-xs mt-1"
                                onClick={clearFilters}
                            >
                                {language === 'np' ? 'फिल्टर खाली गर्नुहोस्' : 'Clear filters'}
                            </Button>
                        )}
                    </div>
                ) : (
                    paginatedAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`p-4 rounded-xl border bg-white shadow-sm transition-all ${
                                alert.isCompleted ? 'opacity-70 border-gray-100 bg-gray-50/50' : 'border-rose-100/80 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm text-gray-900">
                                            {alert.title}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs capitalize font-normal ${priorityStyles[alert.priority] ?? priorityStyles.medium}`}
                                        >
                                            {alert.priorityDisplay || alert.priority}
                                        </Badge>
                                        {alert.isCompleted && (
                                            <Badge className="text-xs bg-green-600 text-white font-normal">
                                                {t('dashboard.alertCompleted') || 'Completed'}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                                        {alert.message}
                                    </p>
                                    {alert.dueDate && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>
                                                {t('dashboard.alertSent') || 'Sent'}: {formatDueDate(alert.dueDate)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="shrink-0">
                                    {!alert.isCompleted ? (
                                        <Button
                                            size="sm"
                                            disabled={actionId === alert.id}
                                            className="h-8 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
                                            onClick={() => handleMarkComplete(alert.id)}
                                        >
                                            <CircleCheck className="w-3.5 h-3.5 mr-1" />
                                            {t('dashboard.markComplete') || 'Complete'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={actionId === alert.id}
                                            className="h-8 text-xs rounded-lg font-medium text-gray-700 border-gray-200"
                                            onClick={() => handleReopen(alert.id)}
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                            {t('dashboard.reopenAlert') || 'Reopen'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-3 border-t border-rose-100/40">
                    <span className="text-xs text-muted-foreground">
                        {language === 'np'
                            ? `देखाउँदै ${startIndex + 1}–${endIndex} / ${totalItems}`
                            : `Showing ${startIndex + 1}–${endIndex} of ${totalItems}`}
                    </span>
                    <div className="flex items-center gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 rounded-lg text-xs gap-1 px-2 border-rose-100 bg-white"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-3 h-3" />
                            {t('common.previous') || 'Prev'}
                        </Button>
                        <span className="text-xs font-medium text-gray-700 min-w-16 text-center">
                            {language === 'np'
                                ? `पृष्ठ ${currentPage} / ${totalPages}`
                                : `Page ${currentPage} of ${totalPages}`}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 rounded-lg text-xs gap-1 px-2 border-rose-100 bg-white"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            {t('common.next') || 'Next'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function OverviewTab({ animal }) {
    const { t } = useLanguage();
    const formatCurrency = (value) => {
        if (!value || value === 0)
            return `${t('common.rs')} 0`;
        return `${t('common.rs')} ${Math.round(value).toLocaleString('en-IN')}`;
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-700 border-green-200">{t('livestock.statusActive')}</Badge>;
            case 'sold':
                return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{t('livestock.statusSold')}</Badge>;
            case 'dead':
                return <Badge className="bg-red-100 text-red-700 border-red-200">{t('livestock.statusDead')}</Badge>;
            case 'butchered':
                return <Badge className="bg-orange-100 text-orange-700 border-orange-200">{t('livestock.statusButchered')}</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
        }
    };
    const getGenderBadge = (gender) => {
        switch (gender) {
            case 'male':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200">{t('livestock.genderMale')}</Badge>;
            case 'female':
                return <Badge className="bg-pink-100 text-pink-700 border-pink-200">{t('livestock.genderFemale')}</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-700">{t('livestock.genderUnknown')}</Badge>;
        }
    };
    const calculateAge = (birthDate) => {
        if (!birthDate)
            return 'N/A';
        const birth = new Date(birthDate);
        const today = new Date();
        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        if (months < 0) {
            years--;
            months += 12;
        }
        if (years > 0)
            return `${years} yr${years > 1 ? 's' : ''}`;
        if (months > 0)
            return `${months} month${months > 1 ? 's' : ''}`;
        return 'Newborn';
    };
    return (<div className="space-y-6">
      {/* Related Alerts Section - Now with filters and pagination */}
      <RelatedAlerts itemId={animal.id} source="livestock" />

      {/* Basic Information Card */}
      <div className="farm-card p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-amber-600"/> {t('livestock.basicInfo')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Tag className="w-5 h-5 text-amber-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('livestock.tagId')}</p>
              <p className="font-semibold truncate">{animal.tag_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Sprout className="w-5 h-5 text-amber-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('livestock.animalType')}</p>
              <p className="font-semibold truncate">{animal.animal_type_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('livestock.gender')}</p>
              <p className="font-semibold capitalize truncate">{animal.gender}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <HeartPulse className="w-5 h-5 text-amber-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('common.status')}</p>
              <div>{getStatusBadge(animal.status)}</div>
            </div>
          </div>
          {animal.name && (<div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Info className="w-5 h-5 text-amber-600 shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{t('livestock.name')}</p>
                <p className="font-semibold truncate">{animal.name}</p>
              </div>
            </div>)}
        </div>
      </div>

      {/* Date Information Card */}
      <div className="farm-card p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-amber-600"/> {t('livestock.acquisitionInformation')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Calendar className="w-5 h-5 text-amber-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('livestock.birthDate')}</p>
              <p className="font-semibold truncate">{animal.birth_date ? new Date(animal.birth_date).toLocaleDateString() : 'N/A'}</p>
              {animal.birth_date && <p className="text-xs text-muted-foreground">{t('livestock.age')}: {calculateAge(animal.birth_date)}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Calendar className="w-5 h-5 text-amber-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('livestock.acquisitionDate')}</p>
              <p className="font-semibold truncate">{animal.acquisition_date ? new Date(animal.acquisition_date).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <DollarSign className="w-5 h-5 text-amber-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('livestock.acquisitionCost')}</p>
              <p className="font-semibold truncate">{formatCurrency(animal.acquisition_cost)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pregnancy Information Card (Only for females) */}
      {animal.gender === 'female' && (<div className="farm-card p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Baby className="w-5 h-5 text-pink-600"/> {t('livestock.pregnancyInformation')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <HeartPulse className="w-5 h-5 text-pink-600 shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{t('livestock.isPregnant')}</p>
                <p className="font-semibold truncate">{animal.is_pregnant ? t('common.yes') : t('common.no')}</p>
              </div>
            </div>
            {animal.is_pregnant && (<>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-pink-600 shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{t('livestock.lastPregnancyDate')}</p>
                    <p className="font-semibold truncate">{animal.last_pregnancy_date ? new Date(animal.last_pregnancy_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-pink-600 shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{t('livestock.expectedBirthDate')}</p>
                    <p className="font-semibold truncate">{animal.expected_birth_date ? new Date(animal.expected_birth_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </>)}
          </div>
        </div>)}

      {/* Financial Summary Card */}
      <div className="farm-card p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600"/> {t('finance.title')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700">{t('finance.totalIncome')}</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(animal.total_income)}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">{t('finance.totalExpense')}</p>
            <p className="text-xl font-bold text-red-700">{formatCurrency(animal.total_expense)}</p>
          </div>
          <div className={`p-3 rounded-lg border ${(animal.total_income - animal.total_expense) >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <p className={`text-xs ${(animal.total_income - animal.total_expense) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{t('finance.netProfit')}</p>
            <p className={`text-xl font-bold ${(animal.total_income - animal.total_expense) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency((animal.total_income || 0) - (animal.total_expense || 0))}
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700">{t('finance.profitMargin')}</p>
            <p className="text-xl font-bold text-purple-700">
              {animal.total_income && animal.total_income > 0
            ? ((((animal.total_income || 0) - (animal.total_expense || 0)) / (animal.total_income || 1)) * 100).toFixed(1)
            : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Notes Card */}
      {animal.notes && (<div className="farm-card p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-amber-600"/> {t('livestock.additionalNotes')}
          </h3>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm">{animal.notes}</p>
          </div>
        </div>)}
    </div>);
}