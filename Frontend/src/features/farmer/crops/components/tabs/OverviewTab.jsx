import { Wheat, Calendar, Droplets, MapPin, Info, Sprout, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/shared/components/ui/badge';
export function OverviewTab({ crop }) {
    const { t, language } = useLanguage();
    const formatCurrency = (value) => {
        if (!value || value === 0)
            return `${t('common.rs')} 0`;
        return `${t('common.rs')} ${Math.round(value).toLocaleString('en-IN')}`;
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-700 border-green-200">{t('crops.statusActive')}</Badge>;
            case 'harvested':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200">{t('crops.statusHarvested')}</Badge>;
            case 'failed':
                return <Badge className="bg-red-100 text-red-700 border-red-200">{t('crops.statusFailed')}</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
        }
    };
    const getGrowthStageBadge = (stage) => {
        switch (stage) {
            case 'seeding':
                return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Seeding</Badge>;
            case 'vegetative':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Vegetative</Badge>;
            case 'flowering':
                return <Badge className="bg-pink-100 text-pink-700 border-pink-200">Flowering</Badge>;
            case 'fruiting':
                return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Fruiting</Badge>;
            case 'harvest':
                return <Badge className="bg-green-100 text-green-700 border-green-200">Harvest</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-700">{stage}</Badge>;
        }
    };
    // Calculate days since planting
    const calculateDaysSincePlanting = (plantingDate) => {
        if (!plantingDate)
            return 0;
        const planting = new Date(plantingDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - planting.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    // Calculate days until harvest
    const calculateDaysUntilHarvest = (expectedHarvestDate) => {
        if (!expectedHarvestDate)
            return 0;
        const harvest = new Date(expectedHarvestDate);
        const today = new Date();
        const diffTime = harvest.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    const daysSincePlanting = calculateDaysSincePlanting(crop.planting_date);
    const daysUntilHarvest = calculateDaysUntilHarvest(crop.expected_harvest_date);
    const isReadyToHarvest = daysUntilHarvest <= 0 && daysUntilHarvest !== 0;
    return (<div className="space-y-6">
      {/* Basic Information Card */}
      <div className="farm-card p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-green-600"/> {t('crops.basicInfo')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Sprout className="w-5 h-5 text-green-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('crops.cropName')}</p>
              <p className="font-semibold truncate">
                {language === 'np' && crop.name_np ? crop.name_np : crop.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Wheat className="w-5 h-5 text-green-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('crops.variety')}</p>
              <p className="font-semibold truncate">{crop.variety || t('crops.localVariety')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('crops.fieldName')}</p>
              <p className="font-semibold truncate">{crop.field_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Droplets className="w-5 h-5 text-green-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('crops.irrigation')}</p>
              <p className="font-semibold truncate">{crop.is_irrigated ? t('common.yes') : t('common.no')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('crops.soilType')}</p>
              <p className="font-semibold truncate">{crop.soil_type || t('crops.notAvailable')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Wheat className="w-5 h-5 text-green-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('crops.area')}</p>
              <p className="font-semibold truncate">
                {crop.field_area} {crop.area_unit ? t(`crops.${crop.area_unit.toLowerCase()}`) || crop.area_unit : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Information Card */}
      <div className="farm-card p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-green-600"/> {t('crops.dateInformation') || 'Date Information'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('crops.plantingDate')}</p>
              <p className="font-semibold truncate">{new Date(crop.planting_date).toLocaleDateString()}</p>
              {daysSincePlanting > 0 && (<p className="text-xs text-muted-foreground">{t('crops.daysSincePlanting')}: {daysSincePlanting} {t('dashboard.days')}</p>)}
            </div>
          </div>
          {crop.expected_harvest_date && (<div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{t('crops.expectedHarvest')}</p>
                <p className="font-semibold truncate">{new Date(crop.expected_harvest_date).toLocaleDateString()}</p>
                {daysUntilHarvest > 0 && (<p className="text-xs text-muted-foreground">
                    {t('crops.remainingDaystoHarvest')}: {daysUntilHarvest} {t('dashboard.days')}
                  </p>)}
                {daysUntilHarvest === 0 && (<p className="text-xs text-orange-600 font-semibold">{t('crops.readyToHarvest')}</p>)}
                {daysUntilHarvest < 0 && (<p className="text-xs text-red-600">{t('crops.harvestPassed')}</p>)}
              </div>
            </div>)}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Sprout className="w-5 h-5 text-green-600 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('crops.growthStage')}</p>
              <div>{getGrowthStageBadge(crop.growth_stage)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="farm-card p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-green-600"/> {t('crops.status')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('crops.currentStatus')}</p>
              <div>{getStatusBadge(crop.status)}</div>
            </div>
          </div>
          {isReadyToHarvest && crop.status === 'active' && (<div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Wheat className="w-5 h-5 text-green-600 shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-700">{t('crops.readyToHarvest')}</p>
                <p className="font-semibold text-green-700">{t('crops.harvest')}</p>
              </div>
            </div>)}
        </div>
      </div>

      {/* Financial Summary Card */}
      <div className="farm-card p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600"/> {t('finance.title')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700">{t('finance.totalIncome')}</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(crop.total_income || 0)}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">{t('finance.totalExpense')}</p>
            <p className="text-xl font-bold text-red-700">{formatCurrency(crop.total_expense || 0)}</p>
          </div>
          <div className={`p-3 rounded-lg border ${(crop.total_income - crop.total_expense) >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <p className={`text-xs ${(crop.total_income - crop.total_expense) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{t('finance.netProfit')}</p>
            <p className={`text-xl font-bold ${(crop.total_income - crop.total_expense) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency((crop.total_income || 0) - (crop.total_expense || 0))}
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700">{t('finance.profitMargin')}</p>
            <p className="text-xl font-bold text-purple-700">
              {crop.total_income && crop.total_income > 0
            ? ((((crop.total_income || 0) - (crop.total_expense || 0)) / (crop.total_income || 1)) * 100).toFixed(1)
            : 0}%
            </p>
          </div>
        </div>
    </div>

      {/* Notes Card */}
      {crop.notes && (<div className="farm-card p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-green-600"/> {t('crops.additionalNotes')}
          </h3>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{crop.notes}</p>
          </div>
        </div>)}
    </div>);
}
