import { MapPin, Droplets, Wind, Sun, Sunrise, Sunset, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, CloudSun, Moon } from 'lucide-react';
const getWeatherIcon = (iconCode, condition, isDaytime = true) => {
    const baseClass = "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20";
    const condition_lower = condition.toLowerCase();
    // First check by condition text (more accurate)
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
        // Partly cloudy vs mostly cloudy
        if (condition_lower.includes('partly')) {
            return isDaytime ? <CloudSun className={baseClass}/> : <Cloud className={baseClass}/>;
        }
        return <Cloud className={baseClass}/>;
    }
    if (condition_lower.includes('clear') || condition_lower.includes('sunny')) {
        return isDaytime ? <Sun className={baseClass}/> : <Moon className={baseClass}/>;
    }
    // Fallback based on icon code
    const iconMap = {
        '113': <Sun className={baseClass}/>, // Sunny
        '116': <CloudSun className={baseClass}/>, // Partly cloudy
        '119': <Cloud className={baseClass}/>, // Cloudy
        '122': <Cloud className={baseClass}/>, // Overcast
        '176': <CloudRain className={baseClass}/>, // Patchy rain
        '179': <CloudSnow className={baseClass}/>, // Patchy snow
        '182': <CloudRain className={baseClass}/>, // Patchy sleet
        '185': <CloudRain className={baseClass}/>, // Patchy freezing drizzle
        '200': <CloudLightning className={baseClass}/>, // Thundery outbreaks
        '227': <CloudSnow className={baseClass}/>, // Blowing snow
        '230': <CloudSnow className={baseClass}/>, // Blizzard
        '248': <CloudFog className={baseClass}/>, // Fog
        '260': <CloudFog className={baseClass}/>, // Freezing fog
        '263': <CloudDrizzle className={baseClass}/>, // Patchy light drizzle
        '266': <CloudDrizzle className={baseClass}/>, // Light drizzle
        '281': <CloudRain className={baseClass}/>, // Freezing drizzle
        '284': <CloudRain className={baseClass}/>, // Heavy freezing drizzle
        '293': <CloudDrizzle className={baseClass}/>, // Patchy light rain
        '296': <CloudDrizzle className={baseClass}/>, // Light rain
        '299': <CloudRain className={baseClass}/>, // Moderate rain at times
        '302': <CloudRain className={baseClass}/>, // Moderate rain
        '305': <CloudRain className={baseClass}/>, // Heavy rain at times
        '308': <CloudRain className={baseClass}/>, // Heavy rain
        '311': <CloudRain className={baseClass}/>, // Light freezing rain
        '314': <CloudRain className={baseClass}/>, // Moderate or heavy freezing rain
        '317': <CloudRain className={baseClass}/>, // Light sleet
        '320': <CloudRain className={baseClass}/>, // Moderate or heavy sleet
        '323': <CloudSnow className={baseClass}/>, // Patchy light snow
        '326': <CloudSnow className={baseClass}/>, // Light snow
        '329': <CloudSnow className={baseClass}/>, // Patchy moderate snow
        '332': <CloudSnow className={baseClass}/>, // Moderate snow
        '335': <CloudSnow className={baseClass}/>, // Patchy heavy snow
        '338': <CloudSnow className={baseClass}/>, // Heavy snow
        '350': <CloudRain className={baseClass}/>, // Ice pellets
        '353': <CloudRain className={baseClass}/>, // Light rain shower
        '356': <CloudRain className={baseClass}/>, // Moderate or heavy rain shower
        '359': <CloudRain className={baseClass}/>, // Torrential rain shower
        '362': <CloudRain className={baseClass}/>, // Light sleet showers
        '365': <CloudRain className={baseClass}/>, // Moderate or heavy sleet showers
        '368': <CloudSnow className={baseClass}/>, // Light snow showers
        '371': <CloudSnow className={baseClass}/>, // Moderate or heavy snow showers
        '374': <CloudRain className={baseClass}/>, // Light showers of ice pellets
        '377': <CloudRain className={baseClass}/>, // Moderate or heavy showers of ice pellets
        '386': <CloudLightning className={baseClass}/>, // Patchy light rain with thunder
        '389': <CloudLightning className={baseClass}/>, // Moderate or heavy rain with thunder
        '392': <CloudSnow className={baseClass}/>, // Patchy light snow with thunder
        '395': <CloudSnow className={baseClass}/>, // Moderate or heavy snow with thunder
    };
    return iconMap[iconCode] || <CloudSun className={baseClass}/>;
};
// Helper to determine if it's daytime based on current time vs sunrise/sunset
const isDaytime = (currentTime, sunrise, sunset) => {
    try {
        const now = new Date();
        const currentHour = now.getHours();
        // Simple check: 6 AM to 6 PM is daytime
        return currentHour >= 6 && currentHour < 18;
    }
    catch {
        return true; // Default to daytime
    }
};
export const WeatherCard = ({ city, country, current, onLocationClick }) => {
    const sunrise = current.sunrise || '--:--';
    const sunset = current.sunset || '--:--';
    const daytime = isDaytime(new Date().toTimeString(), sunrise, sunset);
    return (<div className="farm-card gradient-sky text-white border-0 p-4 sm:p-5 md:p-6">
      {/* Location Header */}
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <button onClick={onLocationClick} className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity text-left">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
          <div>
            <h2 className="font-bold text-sm sm:text-base md:text-lg">
              {city}, {country}
            </h2>
            <p className="text-[10px] sm:text-xs opacity-80">
              {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })}
            </p>
          </div>
        </button>
      </div>

      {/* Main Weather Info */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {getWeatherIcon(current.icon, current.condition, daytime)}
          <div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold">
              {Math.round(current.temperature)}°C
            </div>
            <p className="text-xs sm:text-sm capitalize mt-0.5">{current.condition}</p>
            <p className="text-[10px] sm:text-xs opacity-75">
              Feels like {Math.round(current.feels_like)}°C
            </p>
          </div>
        </div>
        
        {/* Weather Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80"/>
            <div>
              <p className="text-[8px] sm:text-[10px] opacity-60">Humidity</p>
              <p className="font-semibold text-xs sm:text-sm">{current.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80"/>
            <div>
              <p className="text-[8px] sm:text-[10px] opacity-60">Wind</p>
              <p className="font-semibold text-xs sm:text-sm">{current.wind_speed} km/h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sun Times - Only show if data exists */}
      {(sunrise !== '--:--' || sunset !== '--:--') && (<div className="flex gap-3 sm:gap-4 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-white/20 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1">
            <Sunrise className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
            <span>Sunrise: {sunrise}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sunset className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
            <span>Sunset: {sunset}</span>
          </div>
        </div>)}
    </div>);
};
