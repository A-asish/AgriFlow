import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Sprout, ArrowRight } from 'lucide-react';
const stageProgress = {
    seeding: 20,
    vegetative: 40,
    flowering: 60,
    fruiting: 80,
    harvest: 100,
};
export function CropStatus({ crops, loading }) {
    const { t } = useLanguage();
    const navigate = useNavigate();
    if (loading) {
        return (<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sprout className="w-5 h-5 text-green-600"/>
          <h3 className="font-semibold text-base sm:text-lg text-gray-800">{t('dashboard.cropStatus')}</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"/>
        </div>
      </div>);
    }
    return (<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-600"/>
          <h3 className="font-semibold text-base sm:text-lg text-gray-800">{t('dashboard.cropStatus')}</h3>
        </div>
        <button
          onClick={() => navigate('/crops')}
          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          {t('common.viewAll')} <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      
      <div className="space-y-4 sm:space-y-5">
        {crops.length > 0 ? (crops.map((crop) => (<div
              key={crop.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/crops/${crop.id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/crops/${crop.id}`); }}
              className="p-3 rounded-lg bg-green-50/50 border border-green-100 cursor-pointer hover:bg-green-100/60 hover:border-green-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm sm:text-base text-green-800 truncate">
                  {crop.name} {crop.name_np && `(${crop.name_np})`}
                </span>
                <span className="text-xs sm:text-sm text-green-600 capitalize font-medium whitespace-nowrap ml-2">
                  {crop.growth_stage}
                </span>
              </div>
              <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 transition-all duration-500 rounded-full" style={{ width: `${stageProgress[crop.growth_stage] || 20}%` }}/>
              </div>
            </div>))) : (<p className="text-sm text-gray-500 text-center py-4">{t('dashboard.noCrops')}</p>)}
      </div>
    </div>);
}
