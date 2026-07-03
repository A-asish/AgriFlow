import { useState, useEffect } from 'react';
import { CloudSun, Wind, Droplets, Thermometer, MapPin, AlertTriangle, Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const getWeatherIcon = (iconCode, condition) => {
    const baseClass = "w-24 h-24 sm:w-32 sm:h-32 text-white";
    const condition_lower = condition ? condition.toLowerCase() : '';
    
    if (condition_lower.includes('thunder') || condition_lower.includes('lightning')) {
        return <CloudLightning className={baseClass}/>;
    }
    if (condition_lower.includes('snow') || condition_lower.includes('blizzard')) {
        return <CloudSnow className={baseClass}/>;
    }
    if (condition_lower.includes('rain') || condition_lower.includes('drizzle') || condition_lower.includes('shower')) {
        return <CloudRain className={baseClass}/>;
    }
    if (condition_lower.includes('fog') || condition_lower.includes('mist') || condition_lower.includes('haze')) {
        return <CloudFog className={baseClass}/>;
    }
    if (condition_lower.includes('cloud') || condition_lower.includes('overcast')) {
        return <Cloud className={baseClass}/>;
    }
    if (condition_lower.includes('clear') || condition_lower.includes('sunny')) {
        return <Sun className={baseClass}/>;
    }
    return <CloudSun className={baseClass}/>;
};

export function WeatherWidget() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const city = user?.location || 'Kathmandu';

    useEffect(() => {
        const fetchWeather = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/api/weather/?city=${encodeURIComponent(city)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setWeatherData(data.data);
                } else {
                    setError(data.error || 'Failed to fetch weather');
                }
            } catch (err) {
                console.error('Weather widget fetch error:', err);
                setError('Failed to fetch weather');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [city, API_BASE_URL]);

    if (loading) {
        return (
            <div className="farm-card gradient-sky text-white border-0 p-6 flex justify-center items-center h-[260px] rounded-2xl">
                <div className="animate-pulse text-center">
                    <CloudSun className="w-10 h-10 mx-auto opacity-80 animate-bounce" />
                    <p className="text-xs mt-2 opacity-80">Loading weather...</p>
                </div>
            </div>
        );
    }

    if (error || !weatherData) {
        return (
            <div className="farm-card gradient-sky text-white border-0 p-6 flex flex-col justify-between h-[260px] rounded-2xl">
                <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs uppercase font-bold tracking-wider">{city}, Nepal</span>
                </div>
                <div className="text-center py-4">
                    <AlertTriangle className="w-8 h-8 mx-auto opacity-80 mb-2" />
                    <p className="text-sm font-semibold">{error || 'Weather not available'}</p>
                </div>
                <div className="text-[10px] opacity-60">AgriFlow Weather</div>
            </div>
        );
    }

    const current = weatherData.current;

    return (
        <div className="farm-card gradient-sky text-white border-0 relative overflow-hidden group p-6 rounded-2xl h-[260px]">
            <div className="absolute top-0 right-0 p-4 opacity-25 group-hover:scale-105 transition-transform duration-500">
                {getWeatherIcon(current.icon, current.condition)}
            </div>
            
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
                            <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                            {weatherData.city || city}, {weatherData.country || 'Nepal'}
                        </span>
                    </div>

                    <div className="flex items-end gap-3 sm:gap-4 mb-4">
                        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tighter">
                            {Math.round(current.temperature)}°C
                        </h2>
                        <div className="pb-1.5 sm:pb-2">
                            <p className="text-sm sm:text-base font-bold leading-none capitalize">
                                {current.condition}
                            </p>
                            <p className="text-[10px] sm:text-xs opacity-80 font-medium mt-1">
                                {t('weather.feelsLike')} {Math.round(current.feels_like)}°C
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-auto">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                        <Droplets className="w-3.5 h-3.5 mb-1 opacity-80"/>
                        <p className="text-[9px] font-bold uppercase opacity-60">{t('weather.humidity')}</p>
                        <p className="text-xs sm:text-sm font-extrabold">{current.humidity}%</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                        <Wind className="w-3.5 h-3.5 mb-1 opacity-80"/>
                        <p className="text-[9px] font-bold uppercase opacity-60">{t('weather.wind')}</p>
                        <p className="text-xs sm:text-sm font-extrabold">{current.wind_speed} km/h</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                        <Thermometer className="w-3.5 h-3.5 mb-1 opacity-80"/>
                        <p className="text-[9px] font-bold uppercase opacity-60">{t('weather.pressure') || 'Pressure'}</p>
                        <p className="text-xs sm:text-sm font-extrabold">{current.pressure || 1012} hPa</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
