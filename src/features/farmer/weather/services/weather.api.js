import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const weatherApi = {
    // Get weather (current + daily forecast)
    getWeather: async (city, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/weather/`, {
                params: { city },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to fetch weather'
            };
        }
    },
    // Keep getCompleteWeather for backward compatibility (or remove if not used)
    getCompleteWeather: async (city, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/weather/complete/`, {
                params: { city },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to fetch complete weather'
            };
        }
    },
    getFarmingAdvice: async (city, token) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/weather/advice/`, {
                params: { city },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                city: city,
                country: '',
                current_weather: {},
                advice: []
            };
        }
    },
};
