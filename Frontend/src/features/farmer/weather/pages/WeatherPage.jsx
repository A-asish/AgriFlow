import { useState, useEffect } from 'react';
import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Search, CloudSun, AlertTriangle, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { WeatherCard } from '../components/WeatherCard';
import { DailyForecastComponent } from '../components/DailyForecast';
import { FarmingAdviceComponent } from '../components/FarmingAdvice';
const WeatherPage = () => {
    const { t } = useLanguage();
    const { user, refreshProfile } = useAuth();
    const [weatherData, setWeatherData] = useState(null);
    const [advice, setAdvice] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [city, setCity] = useState(user?.location || 'Kathmandu');
    const [showSearch, setShowSearch] = useState(false);
    const [searchCity, setSearchCity] = useState('');
    const [isValidCity, setIsValidCity] = useState(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const fetchWeather = async () => {
        setLoading(true);
        setError(null);
        // FIXED: Use 'access_token' (underscore) not 'accessToken' (camelCase)
        const token = localStorage.getItem('access_token');
        console.log('=== WEATHER DEBUG ===');
        console.log('Token exists:', !!token);
        console.log('City:', city);
        console.log('API URL:', `${API_BASE_URL}/api/weather/?city=${encodeURIComponent(city)}`);
        if (!token) {
            setError('Please login to view weather');
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
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            if (data.success) {
                setWeatherData(data.data);
                setIsValidCity(true);
                // Fetch farming advice
                const adviceRes = await fetch(`${API_BASE_URL}/api/weather/advice/?city=${encodeURIComponent(city)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const adviceData = await adviceRes.json();
                if (adviceData.success) {
                    setAdvice(adviceData.advice);
                }
            }
            else {
                setIsValidCity(false);
                setError(data.error || 'Failed to fetch weather data');
            }
        }
        catch (err) {
            console.error('Fetch error:', err);
            setIsValidCity(false);
            setError('Network error. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (isValidCity || city === 'Kathmandu') {
            fetchWeather();
        }
    }, [city]);
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchCity.trim()) {
            setIsValidCity(true);
            setCity(searchCity.trim());
            setSearchCity('');
            setShowSearch(false);
        }
    };
    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                setShowSearch(true);
            }, () => {
                setError('Unable to get your location');
            });
        }
        else {
            setError('Geolocation is not supported by your browser');
        }
    };
    if (loading) {
        return (<MainLayout title="Weather" subtitle="Current weather conditions">
        <div className="flex justify-center py-20">
          <div className="animate-pulse text-center">
            <CloudSun className="w-12 h-12 mx-auto text-gray-400 mb-3"/>
            <p className="text-gray-500">Loading weather...</p>
          </div>
        </div>
      </MainLayout>);
    }
    if (error) {
        return (<MainLayout title="Weather" subtitle="Current weather conditions">
        <div className="text-center py-12 bg-red-50 rounded-2xl">
          <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-3"/>
          <p className="text-red-600 mb-4">{error}</p>
          {error.includes('No matching location') && (<div className="mb-4 text-sm text-gray-600">
              <p>Suggested cities: Kathmandu, Pokhara, Biratnagar, Lalitpur</p>
            </div>)}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setShowSearch(true)}>Search Again</Button>
            <Button onClick={fetchWeather} variant="outline">Try Again</Button>
          </div>
        </div>
      </MainLayout>);
    }
    return (<MainLayout title="Weather" subtitle="Current weather conditions">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          {!showSearch ? (<>
              <Button onClick={() => setShowSearch(true)} variant="outline" className="gap-2">
                <Search className="w-4 h-4"/> Search Location
              </Button>
              <Button onClick={handleUseCurrentLocation} variant="outline" className="gap-2">
                <MapPin className="w-4 h-4"/> Current Location
              </Button>
              <div className="flex items-center gap-1 text-sm text-gray-500 sm:ml-auto">
                <MapPin className="w-3 h-3"/>
                <span>{weatherData?.city}, {weatherData?.country}</span>
              </div>
            </>) : (<form onSubmit={handleSearch} className="flex gap-2 w-full">
              <div className="flex-1">
                <input type="text" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} placeholder="Enter city name (e.g., Pokhara, Kathmandu, Biratnagar)" className="w-full p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" autoFocus/>
                <p className="text-xs text-gray-400 mt-1">
                  Examples: Kathmandu, Pokhara, Biratnagar, Lalitpur
                </p>
              </div>
              <Button type="submit">Search</Button>
              <Button type="button" variant="outline" onClick={() => setShowSearch(false)}>
                Cancel
              </Button>
            </form>)}
        </div>

        {/* Weather Card */}
        {weatherData && (<>
            <WeatherCard city={weatherData.city} country={weatherData.country} current={weatherData.current} onLocationClick={() => setShowSearch(true)}/>

            {/* Daily Forecast */}
            <DailyForecastComponent forecasts={weatherData.daily_forecast}/>

            {/* Farming Advice */}
            {advice.length > 0 && <FarmingAdviceComponent advice={advice}/>}
          </>)}

        {/* Hint if user's location is misspelled */}
        {user?.location && weatherData && weatherData.city !== user.location && (<div className="text-xs text-center text-gray-400 bg-gray-50 p-2 rounded-lg">
            💡 Your profile location "{user.location}" was corrected to "{weatherData.city}"
          </div>)}
      </div>
    </MainLayout>);
};
export default WeatherPage;
