import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Sprout, Beef, Wallet, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useState } from 'react';
export function TransactionsList({ transactions, onRefresh }) {
    const { t } = useLanguage();
    const navigate = useNavigate();
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterSource, setFilterSource] = useState('all');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedCropField, setSelectedCropField] = useState('all');
    const [selectedAnimal, setSelectedAnimal] = useState('all');
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const formatCurrency = (amount) => {
        if (!amount || isNaN(amount) || amount === 0) {
            return `${t('common.rs')} 0`;
        }
        const roundedAmount = Math.round(amount);
        const formattedAmount = roundedAmount.toLocaleString('en-IN');
        return `${t('common.rs')} ${formattedAmount}`;
    };
    // Map category keys to display names using translation keys
    const getCategoryDisplay = (category) => {
        // Map database keys to translation keys
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
    const getSourceIcon = (transaction) => {
        if (transaction.transaction_type === 'crop_income' || transaction.transaction_type === 'crop_expense') {
            return <Sprout className="w-4 h-4 text-green-600 shrink-0"/>;
        }
        else if (transaction.transaction_type === 'animal_income' || transaction.transaction_type === 'animal_expense') {
            return <Beef className="w-4 h-4 text-amber-600 shrink-0"/>;
        }
        return <Wallet className="w-4 h-4 text-blue-600 shrink-0"/>;
    };
    const getSourceDisplay = (transaction) => {
        if (transaction.transaction_type?.includes('crop')) {
            return t('crops.title');
        }
        else if (transaction.transaction_type?.includes('animal')) {
            return t('livestock.title');
        }
        return t('finance.general');
    };
    const getSourceType = (transaction) => {
        if (transaction.transaction_type?.includes('crop')) {
            return 'crop';
        }
        else if (transaction.transaction_type?.includes('animal')) {
            return 'animal';
        }
        return 'general';
    };
    const getSourceColor = (type) => {
        switch (type) {
            case 'crop':
                return 'bg-green-100 text-green-700';
            case 'animal':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };
    // Extract unique field names from crop transactions
    const getUniqueFields = () => {
        const fields = new Set();
        transactions.forEach(tx => {
            if (tx.transaction_type?.includes('crop')) {
                const fieldName = tx.crop_field_name;
                if (fieldName)
                    fields.add(fieldName);
            }
        });
        return Array.from(fields).sort();
    };
    // Extract unique animal tags
    const getUniqueAnimals = () => {
        const animals = new Map();
        transactions.forEach(tx => {
            if (tx.transaction_type?.includes('animal')) {
                const tag = tx.animal_tag;
                const name = tx.animal_name;
                if (tag) {
                    animals.set(tag, { tag, name: name || '' });
                }
            }
        });
        return Array.from(animals.values()).sort((a, b) => a.tag.localeCompare(b.tag));
    };
    // Apply filters
    const getFilteredTransactions = () => {
        let filtered = [...transactions];
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(tx => tx.description?.toLowerCase().includes(searchLower) ||
                tx.category?.toLowerCase().includes(searchLower) ||
                tx.crop_name?.toLowerCase().includes(searchLower) ||
                tx.crop_field_name?.toLowerCase().includes(searchLower) ||
                tx.animal_name?.toLowerCase().includes(searchLower) ||
                tx.animal_tag?.toLowerCase().includes(searchLower));
        }
        // Type filter (income/expense)
        if (filterType !== 'all') {
            filtered = filtered.filter(tx => filterType === 'income' ? tx.transaction_type?.includes('income') : tx.transaction_type?.includes('expense'));
        }
        // Source filter (crop/animal/general)
        if (filterSource !== 'all') {
            filtered = filtered.filter(tx => getSourceType(tx) === filterSource);
        }
        // Crop field filter
        if (selectedCropField !== 'all') {
            filtered = filtered.filter(tx => tx.transaction_type?.includes('crop') &&
                tx.crop_field_name === selectedCropField);
        }
        // Animal filter
        if (selectedAnimal !== 'all') {
            filtered = filtered.filter(tx => tx.transaction_type?.includes('animal') &&
                tx.animal_tag === selectedAnimal);
        }
        // Year filter
        if (selectedYear) {
            filtered = filtered.filter(tx => {
                const txDate = new Date(tx.date);
                return txDate.getFullYear().toString() === selectedYear;
            });
        }
        // Month filter
        if (selectedMonth) {
            filtered = filtered.filter(tx => {
                const txDate = new Date(tx.date);
                return (txDate.getMonth() + 1).toString() === selectedMonth;
            });
        }
        return filtered;
    };
    const filteredTransactions = getFilteredTransactions();
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    // Reset page when filters change
    const handleFilterChange = () => {
        setCurrentPage(1);
    };
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
    const uniqueFields = getUniqueFields();
    const uniqueAnimals = getUniqueAnimals();
    const clearFilters = () => {
        setSearchTerm('');
        setFilterType('all');
        setFilterSource('all');
        setSelectedCropField('all');
        setSelectedAnimal('all');
        setSelectedYear(new Date().getFullYear().toString());
        setSelectedMonth('');
        setCurrentPage(1);
        if (onRefresh)
            onRefresh();
    };
    const hasActiveFilters = searchTerm !== '' ||
        filterType !== 'all' ||
        filterSource !== 'all' ||
        selectedCropField !== 'all' ||
        selectedAnimal !== 'all' ||
        selectedMonth !== '';
    return (<Card className="p-4 rounded-xl border border-gray-100 shadow-sm">
      {/* Filters Row */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <div className="relative w-40">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400"/>
            <Input placeholder={t('common.search')} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); handleFilterChange(); }} className="pl-7 py-1 h-8 text-sm rounded-lg w-full border-gray-200"/>
          </div>

          <select className="bg-gray-50 text-sm rounded-lg px-2 py-1 h-8 focus:outline-none border border-gray-200" value={filterType} onChange={(e) => { setFilterType(e.target.value); handleFilterChange(); }}>
            <option value="all">{t('common.all')} {t('finance.types')}</option>
            <option value="income">{t('finance.income')}</option>
            <option value="expense">{t('finance.expense')}</option>
          </select>

          <select className="bg-gray-50 text-sm rounded-lg px-2 py-1 h-8 focus:outline-none border border-gray-200" value={filterSource} onChange={(e) => { setFilterSource(e.target.value); handleFilterChange(); }}>
            <option value="all">{t('common.all')} {t('finance.sources')}</option>
            <option value="crop">{t('crops.title')}</option>
            <option value="animal">{t('livestock.title')}</option>
            <option value="general">{t('finance.general')}</option>
          </select>

          {(filterSource === 'crop' || filterSource === 'all') && uniqueFields.length > 0 && (<select className="bg-gray-50 text-sm rounded-lg px-2 py-1 h-8 focus:outline-none border border-gray-200" value={selectedCropField} onChange={(e) => { setSelectedCropField(e.target.value); handleFilterChange(); }}>
              <option value="all">{t('common.all')} {t('crops.fields')}</option>
              {uniqueFields.map(field => (<option key={field} value={field}>{field}</option>))}
            </select>)}

          {(filterSource === 'animal' || filterSource === 'all') && uniqueAnimals.length > 0 && (<select className="bg-gray-50 text-sm rounded-lg px-2 py-1 h-8 focus:outline-none border border-gray-200" value={selectedAnimal} onChange={(e) => { setSelectedAnimal(e.target.value); handleFilterChange(); }}>
              <option value="all">{t('common.all')} {t('livestock.animals')}</option>
              {uniqueAnimals.map(animal => (<option key={animal.tag} value={animal.tag}>
                  {animal.name ? `${animal.name}` : animal.tag}
                </option>))}
            </select>)}

          <select className="bg-gray-50 text-sm rounded-lg px-2 py-1 h-8 focus:outline-none border border-gray-200" value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); handleFilterChange(); }}>
            {years.map(year => (<option key={year} value={year}>{year}</option>))}
          </select>

          <select className="bg-gray-50 text-sm rounded-lg px-2 py-1 h-8 focus:outline-none border border-gray-200" value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); handleFilterChange(); }}>
            {months.map(month => (<option key={month.value} value={month.value}>{month.label}</option>))}
          </select>

          {hasActiveFilters && (<Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-red-600 text-sm gap-1 hover:bg-red-50">
              <X className="w-3 h-3"/> {t('common.clear')}
            </Button>)}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-gray-500 mb-3">
        {filteredTransactions.length} {filteredTransactions.length === 1 ? t('finance.transaction') : t('finance.transactions')}
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {paginatedTransactions.length > 0 ? (paginatedTransactions.map((tx) => {
            const sourceType = getSourceType(tx);
            const sourceDisplay = getSourceDisplay(tx);
            const sourceColor = getSourceColor(sourceType);
            const isIncome = tx.transaction_type?.includes('income');
            const categoryDisplay = getCategoryDisplay(tx.category);
            // Clean up legacy auto-generated descriptions from older records
            let displayText = tx.description;
            if (displayText && displayText.includes('finance.')) {
                const match = displayText.match(/finance\.([a-z_]+)/);
                if (match) {
                    const rawCategory = match[1];
                    const displayCat = getCategoryDisplay(rawCategory);
                    displayText = displayText.replace(`finance.${rawCategory}`, displayCat);
                }
            }
            // Fallback to category display if no description
            displayText = displayText || categoryDisplay;
            return (<div key={tx.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getSourceIcon(tx)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-medium text-sm truncate">{displayText}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${sourceColor} font-medium text-[10px]`}>
                        {sourceDisplay}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className={`font-bold text-sm whitespace-nowrap ml-2 ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>);
        })) : (<div className="text-center py-8">
            <p className="text-sm text-gray-500">{t('finance.noTransactions')}</p>
            {hasActiveFilters ? (<Button variant="link" onClick={clearFilters} className="mt-1 text-sm text-emerald-600">
                {t('common.clearFilters')}
              </Button>) : (<Button variant="link" onClick={() => navigate('/finance/new')} className="mt-1 text-sm text-emerald-600">
                {t('finance.addFirstTransaction')}
              </Button>)}
          </div>)}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (<div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-7 px-2 text-xs gap-1 rounded-lg border-gray-200">
            <ChevronLeft className="w-3 h-3"/> {t('common.previous')}
          </Button>
          <span className="text-xs text-gray-500">
            {currentPage} / {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-7 px-2 text-xs gap-1 rounded-lg border-gray-200">
            {t('common.next')} <ChevronRight className="w-3 h-3"/>
          </Button>
        </div>)}
    </Card>);
}
