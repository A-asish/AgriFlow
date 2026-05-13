import { useState, useEffect, useCallback } from 'react';
import { weatherApi } from '../services/weather.api';
export const useWeather = (initialCity = 'Kathmandu') => {
    const [weatherData, setWeatherData] = useState(null);
    const [advice, setAdvice] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [city, setCity] = useState(initialCity);
    const fetchWeather = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
        if (!token) {
            setError('Please login to view weather information');
            setLoading(false);
            return;
        }
        try {
            const [weatherResponse, adviceResponse] = await Promise.all([
                weatherApi.getWeather(city, token),
                weatherApi.getFarmingAdvice(city, token)
            ]);
            if (weatherResponse.success && weatherResponse.data) {
                setWeatherData(weatherResponse.data);
            }
            else {
                setError(weatherResponse.error || 'Failed to fetch weather data');
            }
            if (adviceResponse.success && adviceResponse.advice) {
                setAdvice(adviceResponse.advice);
            }
        }
        catch (err) {
            setError(err.message || 'Network error. Please try again.');
        }
        finally {
            setLoading(false);
        }
    }, [city]);
    useEffect(() => {
        fetchWeather();
    }, [fetchWeather]);
    return {
        weatherData,
        advice,
        loading,
        error,
        city,
        setCity,
        refetch: fetchWeather
    };
};
