// features/dashboard/components/LivestockStatus.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { Beef, Heart, Activity, Baby } from 'lucide-react';
export function LivestockStatus({ animals, loading }) {
    const { t } = useLanguage();
    // Calculate statistics
    const totalAnimals = animals.length;
    const activeAnimals = animals.filter((a) => a.status === 'active').length;
    const pregnantAnimals = animals.filter((a) => a.is_pregnant === true).length;
    const healthyAnimals = animals.filter((a) => a.status === 'active' && !a.is_pregnant).length;
    const getHealthIcon = (status) => {
        switch (status) {
            case 'active':
                return <Heart className="w-4 h-4 text-green-500"/>;
            case 'pregnant':
                return <Baby className="w-4 h-4 text-pink-500"/>;
            default:
                return <Activity className="w-4 h-4 text-gray-500"/>;
        }
    };
    if (loading) {
        return (<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Beef className="w-5 h-5 text-amber-600"/>
          <h3 className="font-semibold text-base sm:text-lg text-gray-800">{t('dashboard.livestockStatus')}</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"/>
        </div>
      </div>);
    }
    return (<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Beef className="w-5 h-5 text-amber-600"/>
        <h3 className="font-semibold text-base sm:text-lg text-gray-800">{t('dashboard.livestockStatus')}</h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="text-center p-2 bg-amber-50 rounded-lg">
          <p className="text-2xl font-bold text-amber-700">{totalAnimals}</p>
          <p className="text-xs text-amber-600">{t('dashboard.totalAnimals')}</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-700">{activeAnimals}</p>
          <p className="text-xs text-green-600">{t('dashboard.activeAnimals')}</p>
        </div>
        <div className="text-center p-2 bg-pink-50 rounded-lg">
          <p className="text-2xl font-bold text-pink-700">{pregnantAnimals}</p>
          <p className="text-xs text-pink-600">{t('dashboard.pregnantAnimals')}</p>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-700">{healthyAnimals}</p>
          <p className="text-xs text-blue-600">{t('dashboard.healthyAnimals')}</p>
        </div>
      </div>

      {/* Animal List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {animals.length > 0 ? (animals.slice(0, 5).map((animal) => (<div key={animal.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {getHealthIcon(animal.is_pregnant ? 'pregnant' : animal.status)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-amber-800 truncate">
                      {animal.name || animal.tag_number}
                    </span>
                    <span className="text-xs text-amber-600 font-medium">
                      {animal.animal_type?.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t('livestock.tagId')}: {animal.tag_number}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full font-medium
                  ${animal.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                  ${animal.status === 'sold' ? 'bg-gray-100 text-gray-700' : ''}
                  ${animal.status === 'dead' ? 'bg-red-100 text-red-700' : ''}
                `}>
                  {animal.status}
                </span>
                {animal.is_pregnant && (<p className="text-[10px] text-pink-600 mt-1">
                    {t('livestock.pregnant')}
                  </p>)}
              </div>
            </div>))) : (<p className="text-sm text-gray-500 text-center py-4">{t('dashboard.noAnimals')}</p>)}
        
        {animals.length > 5 && (<button className="w-full text-center text-xs text-amber-600 hover:text-amber-700 font-medium py-2">
            + {animals.length - 5} more animals
          </button>)}
      </div>
    </div>);
}
