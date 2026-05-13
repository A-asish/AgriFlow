import { CloudSun, Wind, Droplets, Thermometer, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
export function WeatherWidget() {
    const { t } = useLanguage();
    const { user } = useAuth();
    return (<div className="farm-card gradient-sky text-white border-0 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
        <CloudSun className="w-24 h-24 sm:w-32 sm:h-32"/>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
          </div>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">{user?.location || 'Kathmandu'}, Nepal</span>
        </div>

        <div className="flex items-end gap-3 sm:gap-4 mb-6 sm:mb-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tighter">24°C</h2>
          <div className="pb-1.5 sm:pb-2">
            <p className="text-sm sm:text-base font-bold leading-none">{t('weather.sunny')}</p>
            <p className="text-[10px] sm:text-xs opacity-80 font-medium">{t('weather.feelsLike')} 26°C</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
            <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-1 sm:mb-2 opacity-80"/>
            <p className="text-[10px] sm:text-xs font-bold uppercase opacity-60">{t('weather.humidity')}</p>
            <p className="text-xs sm:text-sm font-extrabold">45%</p>
          </div>
          <div className="p-3 sm:p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
            <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-1 sm:mb-2 opacity-80"/>
            <p className="text-[10px] sm:text-xs font-bold uppercase opacity-60">{t('weather.wind')}</p>
            <p className="text-xs sm:text-sm font-extrabold">12 km/h</p>
          </div>
          <div className="p-3 sm:p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
            <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-1 sm:mb-2 opacity-80"/>
            <p className="text-[10px] sm:text-xs font-bold uppercase opacity-60">{t('weather.pressure')}</p>
            <p className="text-xs sm:text-sm font-extrabold">1012 hPa</p>
          </div>
        </div>
      </div>
    </div>);
}
