import { Calendar, Umbrella, Sun } from 'lucide-react';
const getWeatherIcon = (condition, iconCode) => {
    const condition_lower = condition.toLowerCase();
    if (condition_lower.includes('sun') || condition_lower.includes('clear')) {
        return <Sun className="w-6 h-6 text-yellow-500"/>;
    }
    if (condition_lower.includes('rain') || condition_lower.includes('drizzle')) {
        return <Umbrella className="w-6 h-6 text-blue-500"/>;
    }
    if (condition_lower.includes('cloud')) {
        return <Cloud className="w-6 h-6 text-gray-500"/>;
    }
    if (condition_lower.includes('thunder')) {
        return <CloudLightning className="w-6 h-6 text-purple-500"/>;
    }
    if (condition_lower.includes('snow')) {
        return <CloudSnow className="w-6 h-6 text-blue-300"/>;
    }
    return <Cloud className="w-6 h-6 text-gray-500"/>;
};
// Import missing icons
import { Cloud, CloudLightning, CloudSnow } from 'lucide-react';
const formatDay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString())
        return 'Today';
    if (date.toDateString() === tomorrow.toDateString())
        return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};
export const DailyForecastComponent = ({ forecasts }) => {
    if (!forecasts || forecasts.length === 0)
        return null;
    return (<div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-gray-500"/>
        <h3 className="text-sm font-semibold text-gray-700">5-Day Forecast</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {forecasts.map((day, idx) => (<div key={idx} className="text-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <p className="text-sm font-semibold text-gray-700">
              {formatDay(day.date)}
            </p>
            
            <div className="my-2">
              {getWeatherIcon(day.condition, day.icon)}
            </div>
            
            <p className="text-lg font-bold text-gray-800">
              {Math.round(day.max_temp)}°
            </p>
            
            <p className="text-xs text-gray-500">
              {Math.round(day.min_temp)}°
            </p>
            
            {day.rain_chance > 0 && (<div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-blue-600">
                <Umbrella className="w-2.5 h-2.5"/>
                <span>{day.rain_chance}%</span>
              </div>)}
          </div>))}
      </div>
    </div>);
};
