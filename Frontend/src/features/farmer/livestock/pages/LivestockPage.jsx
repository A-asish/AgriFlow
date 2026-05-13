import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Plus, Search, Filter, Beef, Calendar, Tag, ChevronRight, X, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { livestockService } from '@/features/farmer/livestock/services/livestock.api';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ResponsiveDialog } from '@/shared/components/ui/ResponsiveDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
const LivestockPage = () => {
    const { t, language } = useLanguage();
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [showFilter, setShowFilter] = useState(false);
    // Filter states
    const [filters, setFilters] = useState({
        gender: 'all',
        status: 'all',
        isPregnant: 'all',
        dateRange: {
            type: 'all',
            year: '',
            month: '',
            startDate: '',
            endDate: '',
        },
    });
    const [availableYears, setAvailableYears] = useState([]);
    const [availableMonths] = useState([
        { value: '01', label: 'January' }, { value: '02', label: 'February' },
        { value: '03', label: 'March' }, { value: '04', label: 'April' },
        { value: '05', label: 'May' }, { value: '06', label: 'June' },
        { value: '07', label: 'July' }, { value: '08', label: 'August' },
        { value: '09', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' },
    ]);
    useEffect(() => {
        const fetchAnimals = async () => {
            try {
                const res = await livestockService.listAnimals();
                const animalsData = Array.isArray(res.data) ? res.data : [];
                setAnimals(animalsData);
                const years = [...new Set(animalsData
                        .map((animal) => animal.acquisition_date ? new Date(animal.acquisition_date).getFullYear().toString() : null)
                        .filter((year) => year !== null && year !== undefined))].sort((a, b) => b.localeCompare(a));
                setAvailableYears(years);
            }
            catch (error) {
                console.error("Error fetching animals:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchAnimals();
    }, []);
    const matchesSearch = (animal) => {
        if (search === '')
            return true;
        const searchLower = search.toLowerCase();
        switch (searchField) {
            case 'name':
                return animal.name?.toLowerCase().includes(searchLower) ||
                    (animal.animal_type_name?.toLowerCase().includes(searchLower));
            case 'tag':
                return animal.tag_number?.toLowerCase().includes(searchLower);
            case 'type':
                return animal.animal_type_name?.toLowerCase().includes(searchLower);
            default:
                return (animal.name?.toLowerCase().includes(searchLower) ||
                    animal.tag_number?.toLowerCase().includes(searchLower) ||
                    animal.animal_type_name?.toLowerCase().includes(searchLower) ||
                    animal.gender?.toLowerCase().includes(searchLower) ||
                    animal.status?.toLowerCase().includes(searchLower));
        }
    };
    const matchesDateRange = (animal) => {
        const { dateRange } = filters;
        if (dateRange.type === 'all' || !animal.acquisition_date)
            return true;
        const animalDate = new Date(animal.acquisition_date);
        const animalYear = animalDate.getFullYear().toString();
        const animalMonth = (animalDate.getMonth() + 1).toString().padStart(2, '0');
        if (dateRange.type === 'year')
            return animalYear === dateRange.year;
        if (dateRange.type === 'month')
            return animalYear === dateRange.year && animalMonth === dateRange.month;
        if (dateRange.type === 'custom') {
            const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
            const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
            if (startDate && animalDate < startDate)
                return false;
            if (endDate && animalDate > endDate)
                return false;
            return true;
        }
        return true;
    };
    const filteredAnimals = animals.filter(animal => {
        return matchesSearch(animal) &&
            (filters.gender === 'all' || animal.gender === filters.gender) &&
            (filters.status === 'all' || animal.status === filters.status) &&
            (filters.isPregnant === 'all' || (filters.isPregnant === 'true' ? animal.is_pregnant : !animal.is_pregnant)) &&
            matchesDateRange(animal);
    });
    const getGenderCount = (gender) => {
        if (gender === 'all')
            return animals.length;
        return animals.filter(a => a.gender === gender).length;
    };
    const getStatusCount = (status) => {
        if (status === 'all')
            return animals.length;
        return animals.filter(a => a.status === status).length;
    };
    const getPregnancyCount = (pregnant) => {
        if (pregnant === 'all')
            return animals.length;
        return animals.filter(a => a.is_pregnant === (pregnant === 'true')).length;
    };
    const clearAllFilters = () => {
        setSearch('');
        setSearchField('all');
        setFilters({
            gender: 'all',
            status: 'all',
            isPregnant: 'all',
            dateRange: { type: 'all', year: '', month: '', startDate: '', endDate: '' },
        });
    };
    const hasActiveFilters = () => {
        return search !== '' ||
            filters.gender !== 'all' ||
            filters.status !== 'all' ||
            filters.isPregnant !== 'all' ||
            filters.dateRange.type !== 'all';
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-50 text-green-700 border-green-200';
            case 'sold': return 'bg-gray-50 text-gray-600 border-gray-200';
            case 'dead': return 'bg-red-50 text-red-700 border-red-200';
            case 'butchered': return 'bg-orange-50 text-orange-700 border-orange-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'active': return t('livestock.statusActive');
            case 'sold': return t('livestock.statusSold');
            case 'dead': return t('livestock.statusDead');
            case 'butchered': return t('livestock.statusButchered');
            default: return status;
        }
    };
    const getGenderDisplay = (gender) => {
        switch (gender) {
            case 'male': return t('livestock.genderMale');
            case 'female': return t('livestock.genderFemale');
            default: return t('livestock.genderUnknown');
        }
    };
    return (<MainLayout title={t('livestock.title')} subtitle={t('livestock.subtitle')}>
      <div className="space-y-4 sm:space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex flex-1 max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <Input placeholder={`Search by ${searchField === 'all' ? 'name, tag, type, gender, status' : searchField}...`} className="pl-10 rounded-xl pr-10" value={search} onChange={(e) => setSearch(e.target.value)}/>
              {search && (<button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4"/>
                </button>)}
            </div>
            <Select value={searchField} onValueChange={(v) => setSearchField(v)}>
              <SelectTrigger className="w-32 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="name">Animal Name</SelectItem>
                <SelectItem value="tag">Tag ID</SelectItem>
                <SelectItem value="type">Animal Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 relative" onClick={() => setShowFilter(true)}>
              <Filter className="w-4 h-4"/>
              {hasActiveFilters() && (<span className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 rounded-full animate-pulse"/>)}
            </Button>
            <Link to="/livestock/new" className="flex-1 sm:flex-none">
              <Button className="rounded-xl gap-2 h-10 w-full sm:w-auto font-semibold bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4"/> {t('livestock.addNew')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (<div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {search && (<Badge variant="secondary" className="gap-1 rounded-full bg-gray-100">
                Search: "{search}" ({searchField})
                <button onClick={() => setSearch('')} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3"/>
                </button>
              </Badge>)}
            {filters.gender !== 'all' && (<Badge variant="secondary" className="gap-1 rounded-full bg-gray-100">
                Gender: {getGenderDisplay(filters.gender)}
                <button onClick={() => setFilters({ ...filters, gender: 'all' })} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3"/>
                </button>
              </Badge>)}
            {filters.status !== 'all' && (<Badge variant="secondary" className="gap-1 rounded-full bg-gray-100">
                Status: {getStatusDisplay(filters.status)}
                <button onClick={() => setFilters({ ...filters, status: 'all' })} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3"/>
                </button>
              </Badge>)}
            {filters.isPregnant !== 'all' && (<Badge variant="secondary" className="gap-1 rounded-full bg-gray-100">
                Pregnant: {filters.isPregnant === 'true' ? 'Yes' : 'No'}
                <button onClick={() => setFilters({ ...filters, isPregnant: 'all' })} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3"/>
                </button>
              </Badge>)}
            {filters.dateRange.type === 'year' && filters.dateRange.year && (<Badge variant="secondary" className="gap-1 rounded-full bg-gray-100">
                Year: {filters.dateRange.year}
                <button onClick={() => setFilters({ ...filters, dateRange: { ...filters.dateRange, type: 'all', year: '' } })} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3"/>
                </button>
              </Badge>)}
            {filters.dateRange.type === 'month' && filters.dateRange.year && filters.dateRange.month && (<Badge variant="secondary" className="gap-1 rounded-full bg-gray-100">
                {availableMonths.find(m => m.value === filters.dateRange.month)?.label} {filters.dateRange.year}
                <button onClick={() => setFilters({ ...filters, dateRange: { ...filters.dateRange, type: 'all', year: '', month: '' } })} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3"/>
                </button>
              </Badge>)}
            {filters.dateRange.type === 'custom' && (filters.dateRange.startDate || filters.dateRange.endDate) && (<Badge variant="secondary" className="gap-1 rounded-full bg-gray-100">
                Date: {filters.dateRange.startDate || 'any'} to {filters.dateRange.endDate || 'any'}
                <button onClick={() => setFilters({ ...filters, dateRange: { ...filters.dateRange, type: 'all', startDate: '', endDate: '' } })} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3"/>
                </button>
              </Badge>)}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-7 text-green-600">
              Clear all
            </Button>
          </div>)}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Found {filteredAnimals.length} {filteredAnimals.length === 1 ? 'animal' : 'animals'}
        </div>

        {/* Filter Dialog */}
        <ResponsiveDialog isOpen={showFilter} onClose={() => setShowFilter(false)} title="Filter Animals" maxWidth="md">
          <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
            {/* Gender Filter */}
            <div>
              <h4 className="text-sm font-bold mb-3">Gender</h4>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setFilters({ ...filters, gender: 'all' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.gender === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  All ({getGenderCount('all')})
                </button>
                <button onClick={() => setFilters({ ...filters, gender: 'male' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.gender === 'male' ? 'bg-green-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                  Male ({getGenderCount('male')})
                </button>
                <button onClick={() => setFilters({ ...filters, gender: 'female' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.gender === 'female' ? 'bg-green-600 text-white' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'}`}>
                  Female ({getGenderCount('female')})
                </button>
                <button onClick={() => setFilters({ ...filters, gender: 'unknown' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.gender === 'unknown' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                  Unknown ({getGenderCount('unknown')})
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h4 className="text-sm font-bold mb-3">Status</h4>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setFilters({ ...filters, status: 'all' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.status === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  All ({getStatusCount('all')})
                </button>
                <button onClick={() => setFilters({ ...filters, status: 'active' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.status === 'active' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                  Active ({getStatusCount('active')})
                </button>
                <button onClick={() => setFilters({ ...filters, status: 'sold' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.status === 'sold' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                  Sold ({getStatusCount('sold')})
                </button>
                <button onClick={() => setFilters({ ...filters, status: 'dead' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.status === 'dead' ? 'bg-green-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                  Dead ({getStatusCount('dead')})
                </button>
                <button onClick={() => setFilters({ ...filters, status: 'butchered' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.status === 'butchered' ? 'bg-green-600 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>
                  Butchered ({getStatusCount('butchered')})
                </button>
              </div>
            </div>

            {/* Pregnancy Filter */}
            <div>
              <h4 className="text-sm font-bold mb-3">Pregnancy Status</h4>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setFilters({ ...filters, isPregnant: 'all' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.isPregnant === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  All ({getPregnancyCount('all')})
                </button>
                <button onClick={() => setFilters({ ...filters, isPregnant: 'true' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.isPregnant === 'true' ? 'bg-green-600 text-white' : 'bg-pink-50 text-pink-700 hover:bg-pink-100'}`}>
                  Pregnant ({getPregnancyCount('true')})
                </button>
                <button onClick={() => setFilters({ ...filters, isPregnant: 'false' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.isPregnant === 'false' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                  Not Pregnant ({getPregnancyCount('false')})
                </button>
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <h4 className="text-sm font-bold mb-3">Acquisition Date</h4>
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setFilters({ ...filters, dateRange: { ...filters.dateRange, type: 'all' } })} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.dateRange.type === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    All Dates
                  </button>
                  <button onClick={() => setFilters({ ...filters, dateRange: { ...filters.dateRange, type: 'year' } })} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.dateRange.type === 'year' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    By Year
                  </button>
                  <button onClick={() => setFilters({ ...filters, dateRange: { ...filters.dateRange, type: 'month' } })} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.dateRange.type === 'month' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    By Month
                  </button>
                  <button onClick={() => setFilters({ ...filters, dateRange: { ...filters.dateRange, type: 'custom' } })} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.dateRange.type === 'custom' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    Custom Range
                  </button>
                </div>

                {filters.dateRange.type === 'year' && availableYears.length > 0 && (<div className="grid grid-cols-3 gap-2">
                    {availableYears.map(year => (<button key={year} onClick={() => setFilters({ ...filters, dateRange: { ...filters.dateRange, year } })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.dateRange.year === year ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                        {year}
                      </button>))}
                  </div>)}

                {filters.dateRange.type === 'month' && (<div className="space-y-3">
                    {availableYears.length > 0 && (<div className="grid grid-cols-3 gap-2">
                        {availableYears.map(year => (<button key={year} onClick={() => setFilters({ ...filters, dateRange: { ...filters.dateRange, year } })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.dateRange.year === year ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            {year}
                          </button>))}
                      </div>)}
                    {filters.dateRange.year && (<div className="grid grid-cols-3 gap-2">
                        {availableMonths.map(month => (<button key={month.value} onClick={() => setFilters({ ...filters, dateRange: { ...filters.dateRange, month: month.value } })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.dateRange.month === month.value ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            {month.label.substring(0, 3)}
                          </button>))}
                      </div>)}
                  </div>)}

                {filters.dateRange.type === 'custom' && (<div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Start Date</label>
                      <input type="date" className="w-full p-2 border rounded-lg mt-1" value={filters.dateRange.startDate} onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, startDate: e.target.value } })}/>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">End Date</label>
                      <input type="date" className="w-full p-2 border rounded-lg mt-1" value={filters.dateRange.endDate} onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, endDate: e.target.value } })}/>
                    </div>
                  </div>)}
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={() => setShowFilter(false)} className="flex-1 bg-green-600 hover:bg-green-700">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearAllFilters} className="flex-1">
                Clear All
              </Button>
            </div>
          </div>
        </ResponsiveDialog>

        {/* Animals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (Array(6).fill(0).map((_, i) => (<div key={i} className="farm-card p-0 overflow-hidden">
                <Skeleton className="h-32 w-full"/>
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4"/>
                  <Skeleton className="h-4 w-1/2"/>
                  <div className="flex gap-2"><Skeleton className="h-8 w-20"/><Skeleton className="h-8 w-20"/></div>
                </div>
              </div>))) : filteredAnimals.length > 0 ? (filteredAnimals.map((animal) => (<Link key={animal.id} to={`/livestock/${animal.id}`} className="farm-card p-0 overflow-hidden group hover:shadow-xl transition-all duration-300">
                {/* Only the profile background is amber */}
                <div className="h-32 bg-linear-to-br from-amber-700 to-amber-900 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Beef className="w-12 h-12 text-amber-300/50 group-hover:scale-110 group-hover:text-amber-300/70 transition-all duration-500"/>
                  </div>
                  <Badge className={`absolute top-3 right-3 rounded-lg border backdrop-blur-sm ${getStatusColor(animal.status)}`}>
                    {getStatusDisplay(animal.status)}
                  </Badge>
                  {animal.is_pregnant && (<Badge className="absolute top-3 left-3 rounded-lg border bg-pink-100 text-pink-700 border-pink-200 backdrop-blur-sm">
                      <HeartPulse className="w-3 h-3 mr-1"/> Pregnant
                    </Badge>)}
                </div>
                
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                        {language === 'np' && animal.animal_type_name_np ? animal.animal_type_name_np : animal.animal_type_name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium line-clamp-1">
                        {animal.name || animal.tag_number}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600"/>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        {animal.tag_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600"/>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        {animal.acquisition_date ? new Date(animal.acquisition_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">
                        Gender
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-700 capitalize">
                        {getGenderDisplay(animal.gender)}
                      </span>
                    </div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5"/>
                    </div>
                  </div>
                </div>
              </Link>))) : (<div className="col-span-full py-12 sm:py-20 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Beef className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"/>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {hasActiveFilters() ? 'No matching animals found' : 'No animals found'}
              </h3>
              <p className="text-gray-500 mb-6 sm:mb-8 max-w-xs mx-auto text-sm sm:text-base">
                {hasActiveFilters()
                ? 'Try adjusting your search or filter criteria'
                : 'You haven\'t added any animals yet. Start by adding your first animal to track its health and production.'}
              </p>
              {hasActiveFilters() ? (<Button variant="outline" onClick={clearAllFilters} className="rounded-xl">
                  Clear all filters
                </Button>) : (<Link to="/livestock/new">
                  <Button className="rounded-xl gap-2 font-semibold bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4"/> {t('livestock.addNew')}
                  </Button>
                </Link>)}
            </div>)}
        </div>
      </div>
    </MainLayout>);
};
export default LivestockPage;
