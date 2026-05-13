import { Calendar, Tag, HeartPulse, Baby, DollarSign, Info, Sprout } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/shared/components/ui/badge';
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
