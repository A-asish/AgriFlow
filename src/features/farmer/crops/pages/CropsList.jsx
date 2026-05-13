import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Plus, Search, Filter, Wheat, Calendar, Map, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { cropsService } from '@/features/farmer/crops/services/crops.api';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ResponsiveDialog } from '@/shared/components/ui/ResponsiveDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
const CropsPage = () => {
    const { t, language } = useLanguage();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchField, setSearchField] = useState('all');
    const [showFilter, setShowFilter] = useState(false);
    // Filter states
    const [filters, setFilters] = useState({
        status: 'all',
        growthStage: 'all',
        dateRange: {
            type: 'all',
            year: '',
            month: '',
            startDate: '',
            endDate: '',
        },
        areaRange: {
            min: '',
            max: '',
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
        const fetchCrops = async () => {
            try {
                const res = await cropsService.listCrops();
                const cropsData = Array.isArray(res.data) ? res.data : [];
                setCrops(cropsData);
                const years = [...new Set(cropsData.map((crop) => new Date(crop.planting_date).getFullYear().toString()))].sort((a, b) => b.localeCompare(a));
                setAvailableYears(years);
            }
            catch (error) {
                console.error("Error fetching crops:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchCrops();
    }, []);
    const matchesSearch = (crop) => {
        if (search === '')
            return true;
        const searchLower = search.toLowerCase();
        switch (searchField) {
            case 'name':
                return crop.name.toLowerCase().includes(searchLower) ||
                    (crop.name_np && crop.name_np.toLowerCase().includes(searchLower));
            case 'field':
                return crop.field_name?.toLowerCase().includes(searchLower);
            case 'variety':
                return crop.variety?.toLowerCase().includes(searchLower);
            default:
                return (crop.name.toLowerCase().includes(searchLower) ||
                    (crop.name_np && crop.name_np.toLowerCase().includes(searchLower)) ||
                    crop.field_name?.toLowerCase().includes(searchLower) ||
                    crop.variety?.toLowerCase().includes(searchLower) ||
                    crop.status?.toLowerCase().includes(searchLower) ||
                    crop.growth_stage?.toLowerCase().includes(searchLower) ||
                    new Date(crop.planting_date).toLocaleDateString().includes(searchLower));
        }
    };
    const matchesDateRange = (crop) => {
        const { dateRange } = filters;
        if (dateRange.type === 'all')
            return true;
        const cropDate = new Date(crop.planting_date);
        const cropYear = cropDate.getFullYear().toString();
        const cropMonth = (cropDate.getMonth() + 1).toString().padStart(2, '0');
        if (dateRange.type === 'year')
            return cropYear === dateRange.year;
        if (dateRange.type === 'month')
            return cropYear === dateRange.year && cropMonth === dateRange.month;
        if (dateRange.type === 'custom') {
            const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
            const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
            if (startDate && cropDate < startDate)
                return false;
            if (endDate && cropDate > endDate)
                return false;
            return true;
        }
        return true;
    };
    const matchesAreaRange = (crop) => {
        const { areaRange } = filters;
        const area = parseFloat(crop.field_area);
        if (areaRange.min && area < parseFloat(areaRange.min))
            return false;
        if (areaRange.max && area > parseFloat(areaRange.max))
            return false;
        return true;
    };
    const filteredCrops = crops.filter(crop => {
        return matchesSearch(crop) &&
            (filters.status === 'all' || crop.status === filters.status) &&
            (filters.growthStage === 'all' || crop.growth_stage === filters.growthStage) &&
            matchesDateRange(crop) &&
            matchesAreaRange(crop);
    });
    const getStatusCount = (status) => {
        if (status === 'all')
            return crops.length;
        return crops.filter(c => c.status === status).length;
    };
    const getGrowthStageCount = (stage) => {
        if (stage === 'all')
            return crops.length;
        return crops.filter(c => c.growth_stage === stage).length;
    };
    const clearAllFilters = () => {
        setSearch('');
        setSearchField('all');
        setFilters({
            status: 'all',
            growthStage: 'all',
            dateRange: { type: 'all', year: '', month: '', startDate: '', endDate: '' },
            areaRange: { min: '', max: '' },
        });
    };
    const hasActiveFilters = () => {
        return search !== '' ||
            filters.status !== 'all' ||
            filters.growthStage !== 'all' ||
            filters.dateRange.type !== 'all' ||
            filters.areaRange.min !== '' ||
            filters.areaRange.max !== '';
    };
    const getStatusBorderColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-50 text-green-700 border-green-200';
            case 'harvested': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'done': return 'bg-gray-50 text-gray-600 border-gray-200'; // Changed from 'failed' to 'done'
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'active': return 'Active';
            case 'harvested': return 'Harvested';
            case 'done': return 'Done'; // Changed from 'Failed' to 'Done'
            default: return status;
        }
    };
    return (<MainLayout title={t('crops.title')} subtitle={t('crops.subtitle')}>
      <div className="space-y-4 sm:space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex flex-1 max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <Input placeholder={`Search by ${searchField === 'all' ? 'name, field, variety, date, status' : searchField}...`} className="pl-10 rounded-xl pr-10" value={search} onChange={(e) => setSearch(e.target.value)}/>
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
                <SelectItem value="name">Crop Name</SelectItem>
                <SelectItem value="field">Field Name</SelectItem>
                <SelectItem value="variety">Variety</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 relative" onClick={() => setShowFilter(true)}>
              <Filter className="w-4 h-4"/>
              {hasActiveFilters() && (<span className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 rounded-full animate-pulse"/>)}
            </Button>
            <Link to="/crops/new" className="flex-1 sm:flex-none">
              <Button className="rounded-xl gap-2 h-10 w-full sm:w-auto font-semibold bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4"/> {t('crops.addNew')}
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
            {filters.status !== 'all' && (<Badge variant="secondary" className="gap-1 rounded-full capitalize bg-gray-100">
                Status: {filters.status}
                <button onClick={() => setFilters({ ...filters, status: 'all' })} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3"/>
                </button>
              </Badge>)}
            {filters.growthStage !== 'all' && (<Badge variant="secondary" className="gap-1 rounded-full capitalize bg-gray-100">
                Stage: {filters.growthStage}
                <button onClick={() => setFilters({ ...filters, growthStage: 'all' })} className="ml-1 hover:text-red-500">
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
            {(filters.areaRange.min || filters.areaRange.max) && (<Badge variant="secondary" className="gap-1 rounded-full bg-gray-100">
                Area: {filters.areaRange.min || '0'} - {filters.areaRange.max || '∞'} {crops[0]?.area_unit || 'ropani'}
                <button onClick={() => setFilters({ ...filters, areaRange: { min: '', max: '' } })} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3"/>
                </button>
              </Badge>)}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-7 text-green-600">
              Clear all
            </Button>
          </div>)}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Found {filteredCrops.length} {filteredCrops.length === 1 ? 'crop' : 'crops'}
        </div>

        {/* Filter Dialog */}
        <ResponsiveDialog isOpen={showFilter} onClose={() => setShowFilter(false)} title="Filter Crops" maxWidth="md">
          <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
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
                <button onClick={() => setFilters({ ...filters, status: 'harvested' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.status === 'harvested' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                  Harvested ({getStatusCount('harvested')})
                </button>
                <button onClick={() => setFilters({ ...filters, status: 'done' })} // Changed from 'failed' to 'done'
     className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.status === 'done' ? 'bg-gray-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                  Done ({getStatusCount('done')})
                </button>
              </div>
            </div>

            {/* Growth Stage Filter - Keep as is */}
            <div>
              <h4 className="text-sm font-bold mb-3">Growth Stage</h4>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setFilters({ ...filters, growthStage: 'all' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.growthStage === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  All ({getGrowthStageCount('all')})
                </button>
                <button onClick={() => setFilters({ ...filters, growthStage: 'seeding' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.growthStage === 'seeding' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  Seeding
                </button>
                <button onClick={() => setFilters({ ...filters, growthStage: 'vegetative' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.growthStage === 'vegetative' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  Vegetative
                </button>
                <button onClick={() => setFilters({ ...filters, growthStage: 'flowering' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.growthStage === 'flowering' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  Flowering
                </button>
                <button onClick={() => setFilters({ ...filters, growthStage: 'fruiting' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.growthStage === 'fruiting' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  Fruiting
                </button>
                <button onClick={() => setFilters({ ...filters, growthStage: 'harvest' })} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.growthStage === 'harvest' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  Harvest
                </button>
              </div>
            </div>

            {/* Date Filter - Keep as is */}
            <div>
              <h4 className="text-sm font-bold mb-3">Planting Date</h4>
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

                {/* Year/Month selection content - keep as is */}
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

            {/* Area Range Filter - Keep as is */}
            <div>
              <h4 className="text-sm font-bold mb-3">Area Range ({crops[0]?.area_unit || 'ropani'})</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Min Area</label>
                  <input type="number" step="0.01" placeholder="Min" className="w-full p-2 border rounded-lg mt-1" value={filters.areaRange.min} onChange={(e) => setFilters({ ...filters, areaRange: { ...filters.areaRange, min: e.target.value } })}/>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Max Area</label>
                  <input type="number" step="0.01" placeholder="Max" className="w-full p-2 border rounded-lg mt-1" value={filters.areaRange.max} onChange={(e) => setFilters({ ...filters, areaRange: { ...filters.areaRange, max: e.target.value } })}/>
                </div>
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

        {/* Crops Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (Array(6).fill(0).map((_, i) => (<div key={i} className="farm-card p-0 overflow-hidden">
                <Skeleton className="h-32 w-full"/>
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4"/>
                  <Skeleton className="h-4 w-1/2"/>
                  <div className="flex gap-2"><Skeleton className="h-8 w-20"/><Skeleton className="h-8 w-20"/></div>
                </div>
              </div>))) : filteredCrops.length > 0 ? (filteredCrops.map((crop) => (<Link key={crop.id} to={`/crops/${crop.id}`} className="farm-card p-0 overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="h-32 bg-linear-to-br from-green-50 to-green-100 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wheat className="w-12 h-12 text-green-300 group-hover:scale-110 group-hover:text-green-400 transition-all duration-500"/>
                  </div>
                  <Badge className={`absolute top-3 right-3 rounded-lg border backdrop-blur-sm ${getStatusBorderColor(crop.status)}`}>
                    {getStatusDisplay(crop.status)}
                  </Badge>
                </div>
                
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                        {language === 'np' && crop.name_np ? crop.name_np : crop.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium line-clamp-1">
                        {crop.variety || 'Local Variety'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600"/>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        {crop.field_name} ({crop.field_area} {crop.area_unit || 'ropani'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600"/>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        {new Date(crop.planting_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">
                        Growth Stage
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-700 capitalize">
                        {crop.growth_stage}
                      </span>
                    </div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5"/>
                    </div>
                  </div>
                </div>
              </Link>))) : (<div className="col-span-full py-12 sm:py-20 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Wheat className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"/>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {hasActiveFilters() ? 'No matching crops found' : 'No crops found'}
              </h3>
              <p className="text-gray-500 mb-6 sm:mb-8 max-w-xs mx-auto text-sm sm:text-base">
                {hasActiveFilters()
                ? 'Try adjusting your search or filter criteria'
                : 'You haven\'t added any crops yet. Start by adding your first crop to track its growth.'}
              </p>
              {hasActiveFilters() ? (<Button variant="outline" onClick={clearAllFilters} className="rounded-xl">
                  Clear all filters
                </Button>) : (<Link to="/crops/new">
                  <Button className="rounded-xl gap-2 font-semibold bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4"/> Add New Crop
                  </Button>
                </Link>)}
            </div>)}
        </div>
      </div>
    </MainLayout>);
};
export default CropsPage;
