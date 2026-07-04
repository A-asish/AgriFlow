// src/features/farmer/crops/pages/RecommendationPage.jsx

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { cropsService } from '@/features/farmer/crops/services/crops.api';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import RecommendationForm from '../components/RecommendationForm';
import RecommendationResults from '../components/RecommendationResults';
import RecommendationHistory from '../components/RecommendationHistory';

// Options data
const regionOptions = [
    { value: 'terai', label: 'Terai (तराई)', labelEn: 'Terai' },
    { value: 'mid-hill', label: 'Mid-Hill (मध्य पहाडी)', labelEn: 'Mid-Hill' },
    { value: 'hill', label: 'Hill (पहाडी)', labelEn: 'Hill' },
    { value: 'mountain', label: 'Mountain (हिमाली)', labelEn: 'Mountain' },
];

const seasonOptions = [
    { value: 'spring', label: 'Spring (बसन्त)', labelEn: 'Spring' },
    { value: 'summer', label: 'Summer (गर्मी)', labelEn: 'Summer' },
    { value: 'monsoon', label: 'Monsoon (वर्षा)', labelEn: 'Monsoon' },
    { value: 'autumn', label: 'Autumn (शरद)', labelEn: 'Autumn' },
    { value: 'winter', label: 'Winter (जाडो)', labelEn: 'Winter' },
];

const waterSourceOptions = [
    { value: 'rainfed_only', label: 'Rainfed Only (वर्षा आधारित)', labelEn: 'Rainfed Only' },
    { value: 'canal', label: 'Canal (नहर)', labelEn: 'Canal' },
    { value: 'well', label: 'Well (इनार)', labelEn: 'Well' },
    { value: 'river', label: 'River (नदी)', labelEn: 'River' },
    { value: 'drip_irrigation', label: 'Drip Irrigation (टपक सिँचाइ)', labelEn: 'Drip Irrigation' },
];

const soilTypeOptions = [
    { value: 'clay', label: 'Clay (चिल्लो)', labelEn: 'Clay' },
    { value: 'loamy', label: 'Loamy (दोमट)', labelEn: 'Loamy' },
    { value: 'sandy', label: 'Sandy (बालुवे)', labelEn: 'Sandy' },
    { value: 'silty', label: 'Silty (सिल्टी)', labelEn: 'Silty' },
    { value: 'clay_loam', label: 'Clay Loam (चिल्लो दोमट)', labelEn: 'Clay Loam' },
];

const laborOptions = [
    { value: 'low', label: 'Low (कम)', labelEn: 'Low' },
    { value: 'medium', label: 'Medium (मध्यम)', labelEn: 'Medium' },
    { value: 'high', label: 'High (धेरै)', labelEn: 'High' },
];

const marketOptions = [
    { value: 'near', label: 'Near (नजिक)', labelEn: 'Near' },
    { value: 'medium', label: 'Medium (मध्यम)', labelEn: 'Medium' },
    { value: 'far', label: 'Far (टाढा)', labelEn: 'Far' },
];

const goalOptions = [
    { value: 'profit', label: 'Profit (नाफा)', labelEn: 'Profit' },
    { value: 'food_security', label: 'Food Security (खाद्य सुरक्षा)', labelEn: 'Food Security' },
    { value: 'mixed', label: 'Mixed (मिश्रित)', labelEn: 'Mixed' },
    { value: 'subsistence', label: 'Subsistence (निर्वाह)', labelEn: 'Subsistence' },
];

const droughtRiskOptions = [
    { value: 'high', label: 'High (उच्च)', labelEn: 'High Risk', description: 'Very dry area, little rainfall, frequent droughts' },
    { value: 'medium', label: 'Medium (मध्यम)', labelEn: 'Medium Risk', description: 'Moderate rainfall, occasional dry spells' },
    { value: 'low', label: 'Low (न्यून)', labelEn: 'Low Risk', description: 'Good rainfall, reliable water source' },
];

const frostRiskOptions = [
    { value: 'yes', label: 'Yes (हो)', labelEn: 'Yes - Frost occurs', description: 'Your area experiences frost' },
    { value: 'no', label: 'No (होइन)', labelEn: 'No - Frost-free', description: 'Your area is frost-free' },
];

const RecommendationPage = () => {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [history, setHistory] = useState([]);
    const [recommendation, setRecommendation] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    // ========== ALL FIELDS START EMPTY - NO DEFAULTS ==========
    const [soilData, setSoilData] = useState({
        region: '',
        season: '',
        water_source: '',
        soil_type: '',
        labor_availability: '',
        market_distance: '',
        farming_goal: '',
        temperature: null,
        frost_risk: '',
        drought_risk: '',
        ph: null,
        n: null,
        p: null,
        k: null,
    });
    // ===========================================================

    useEffect(() => {
        // DO NOT auto-set season - let user select manually
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await cropsService.getRecommendationHistory();
            setHistory(res.data?.history || []);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setSoilData((prev) => ({ ...prev, [field]: value }));
    };

    const handleGetRecommendations = async () => {
        const requiredFields = [
            'region', 'season', 'temperature', 'drought_risk', 'frost_risk',
            'water_source', 'soil_type', 'labor_availability', 'market_distance', 'farming_goal'
        ];
        
        const missingFields = requiredFields.filter(field => {
            const value = soilData[field];
            return value === null || value === undefined || value === '';
        });
        
        if (missingFields.length > 0) {
            toast.error(`Please fill all required fields: ${missingFields.join(', ')}`);
            return;
        }

        setLoading(true);
        
        try {
            const submitData = {
                region: soilData.region,
                season: soilData.season,
                water_source: soilData.water_source,
                soil_type: soilData.soil_type,
                labor_availability: soilData.labor_availability,
                market_distance: soilData.market_distance,
                farming_goal: soilData.farming_goal,
                temperature: Number(soilData.temperature),
                frost_risk: soilData.frost_risk,
                drought_risk: soilData.drought_risk,
                ph: soilData.ph ? Number(soilData.ph) : null,
                n: soilData.n ? Number(soilData.n) : null,
                p: soilData.p ? Number(soilData.p) : null,
                k: soilData.k ? Number(soilData.k) : null,
            };

            const response = await cropsService.recommend(submitData);
            const result = response.data || response;
            
            if (result.success) {
                setRecommendation(result);
                toast.success('Recommendations generated successfully!');
                fetchHistory();
            } else {
                toast.error(result.error || 'Failed to generate recommendations');
            }
        } catch (error) {
            console.error('Recommendation error:', error);
            const errorMessage = error.response?.data?.errors || error.message || 'Failed to generate recommendation';
            const finalMessage = typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage;
            toast.error(finalMessage);
        } finally {
            setLoading(false);
        }
    };

    const deleteHistory = async (id) => {
        try {
            await cropsService.deleteRecommendationHistory(id);
            toast.success('History entry deleted');
            fetchHistory();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const loadHistoryEntry = (entry) => {
        setSoilData({
            region: entry.region || '',
            season: entry.season || '',
            water_source: entry.water_source || '',
            soil_type: entry.soil_type || '',
            labor_availability: entry.labor_availability || '',
            market_distance: entry.market_distance || '',
            farming_goal: entry.farming_goal || '',
            temperature: entry.temperature || null,
            frost_risk: entry.frost_risk ? 'yes' : 'no',
            drought_risk: entry.drought_risk || '',
            ph: entry.ph || null,
            n: entry.n || null,
            p: entry.p || null,
            k: entry.k || null,
        });
        toast.info('Form loaded with selected history');
    };

    const getSelectValue = (value) => {
        if (value && value !== '') return value;
        return undefined;
    };

    return (
        <MainLayout 
            title={t('crops.recommendations') || 'Crop Recommendations'} 
            subtitle={t('crops.recommendationsDesc') || 'Get AI-powered insights for your next harvest'}
        >
            <div className="space-y-6">
                <RecommendationForm
                    language={language}
                    soilData={soilData}
                    handleChange={handleChange}
                    handleGetRecommendations={handleGetRecommendations}
                    loading={loading}
                    showAdvanced={showAdvanced}
                    setShowAdvanced={setShowAdvanced}
                    getSelectValue={getSelectValue}
                    regionOptions={regionOptions}
                    seasonOptions={seasonOptions}
                    waterSourceOptions={waterSourceOptions}
                    soilTypeOptions={soilTypeOptions}
                    laborOptions={laborOptions}
                    marketOptions={marketOptions}
                    goalOptions={goalOptions}
                    droughtRiskOptions={droughtRiskOptions}
                    frostRiskOptions={frostRiskOptions}
                    t={t}
                />

                <RecommendationResults
                    recommendation={recommendation}
                    language={language}
                    t={t}
                />

                <RecommendationHistory
                    history={history}
                    historyLoading={historyLoading}
                    loadHistoryEntry={loadHistoryEntry}
                    deleteHistory={deleteHistory}
                    t={t}
                />
            </div>
        </MainLayout>
    );
};

export default RecommendationPage;