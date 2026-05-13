import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cropsService } from '@/features/farmer/crops/services/crops.api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Leaf, Beaker, CheckCircle, AlertTriangle, Info, Loader2, History, Trash2, Sprout, TrendingUp, XCircle, Droplet, FlaskConical, ThumbsUp, AlertCircle, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
const regionOptions = [
    { value: 'terai', label: 'Terai (तराई)', labelEn: 'Terai' },
    { value: 'mid-hill', label: 'Mid-Hill (मध्य पहाडी)', labelEn: 'Mid-Hill' },
    { value: 'hill', label: 'Hill (पहाडी)', labelEn: 'Hill' },
    { value: 'mountain', label: 'Mountain (हिमाली)', labelEn: 'Mountain' },
];
const seasonOptions = [
    { value: 'spring', label: 'Spring (बसन्त)', labelEn: 'Spring' },
    { value: 'monsoon', label: 'Monsoon (वर्षा)', labelEn: 'Monsoon' },
    { value: 'autumn', label: 'Autumn (शरद)', labelEn: 'Autumn' },
    { value: 'winter', label: 'Winter (जाडो)', labelEn: 'Winter' },
];
const waterSourceOptions = [
    { value: 'rainfed_only', label: 'Rainfed Only (वर्षा आधारित)', labelEn: 'Rainfed Only' },
    { value: 'seasonal_canal', label: 'Seasonal Canal (मौसमी नहर)', labelEn: 'Seasonal Canal' },
    { value: 'well_borewell', label: 'Well/Borewell (इनार/बोरवेल)', labelEn: 'Well/Borewell' },
    { value: 'drip_irrigation', label: 'Drip Irrigation (टपक सिँचाइ)', labelEn: 'Drip Irrigation' },
];
const soilTypeOptions = [
    { value: 'loamy', label: 'Loamy (दोमट)', labelEn: 'Loamy' },
    { value: 'clay', label: 'Clay (चिल्लो)', labelEn: 'Clay' },
    { value: 'sandy', label: 'Sandy (बालुवे)', labelEn: 'Sandy' },
    { value: 'silty', label: 'Silty (सिल्टी)', labelEn: 'Silty' },
];
const laborOptions = [
    { value: 'low', label: 'Low (कम)', labelEn: 'Low' },
    { value: 'medium', label: 'Medium (मध्यम)', labelEn: 'Medium' },
    { value: 'high', label: 'High (धेरै)', labelEn: 'High' },
];
const marketOptions = [
    { value: 'near', label: 'Near (नजिक)', labelEn: 'Near' },
    { value: 'far', label: 'Far (टाढा)', labelEn: 'Far' },
];
const goalOptions = [
    { value: 'food_security', label: 'Food Security (खाद्य सुरक्षा)', labelEn: 'Food Security' },
    { value: 'profit', label: 'Profit (नाफा)', labelEn: 'Profit' },
    { value: 'mixed', label: 'Mixed (मिश्रित)', labelEn: 'Mixed' },
];
// Updated NPK status badge configuration
const getNpkStatusConfig = (status) => {
    switch (status) {
        case 'Perfect':
            return { color: 'bg-emerald-100 text-emerald-700', icon: ThumbsUp, label: 'Perfect', description: 'Exactly matches crop needs' };
        case 'Fits':
            return { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Fits', description: 'Within acceptable range' };
        case 'Low':
            return { color: 'bg-amber-100 text-amber-700', icon: AlertTriangle, label: 'Low', description: 'Slightly below needs' };
        case 'Very Low':
            return { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Very Low', description: 'Severely deficient' };
        case 'High':
            return { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle, label: 'High', description: 'Slightly above needs' };
        case 'Very High':
            return { color: 'bg-red-100 text-red-700', icon: Ban, label: 'Very High', description: 'Excess - toxic levels' };
        default:
            return { color: 'bg-gray-100 text-gray-700', icon: Info, label: 'Unknown', description: 'No data' };
    }
};
const RecommendationPage = () => {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [history, setHistory] = useState([]);
    const [recommendation, setRecommendation] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [soilData, setSoilData] = useState({
        region: '',
        season: '',
        water_source: '',
        soil_type: '',
        labor_availability: '',
        market_distance: '',
        farming_goal: '',
        temperature_override: null,
        elevation_risk: null,
        ph: null,
        n: null,
        p: null,
        k: null,
    });
    const [hasError, setHasError] = useState(false);
    useEffect(() => {
        const currentSeason = getCurrentSeason();
        setSoilData(prev => ({ ...prev, season: currentSeason }));
        fetchHistory();
    }, []);
    const getCurrentSeason = () => {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5)
            return 'spring';
        if (month >= 6 && month <= 9)
            return 'monsoon';
        if (month >= 10 && month <= 11)
            return 'autumn';
        return 'winter';
    };
    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await cropsService.getRecommendationHistory();
            setHistory(res.data?.history || []);
        }
        catch (error) {
            console.error("Error fetching history:", error);
        }
        finally {
            setHistoryLoading(false);
        }
    };
    const handleChange = (field, value) => {
        setSoilData((prev) => ({ ...prev, [field]: value }));
    };
    const handleGetRecommendations = async () => {
        const requiredFields = ['region', 'season', 'water_source', 'soil_type', 'labor_availability', 'market_distance', 'farming_goal'];
        const missingFields = requiredFields.filter(field => !soilData[field]);
        if (missingFields.length > 0) {
            toast.error('Please fill all required fields');
            return;
        }
        setLoading(true);
        const submitData = {};
        Object.keys(soilData).forEach(key => {
            const value = soilData[key];
            if (value !== null && value !== undefined && value !== '') {
                submitData[key] = key === 'n' || key === 'p' || key === 'k' ? Number(value) : value;
            }
        });
        if ((submitData.n || submitData.p || submitData.k) && (!submitData.n || !submitData.p || !submitData.k)) {
            toast.error('Please provide all three NPK values for accurate analysis');
            setLoading(false);
            return;
        }
        try {
            const response = await cropsService.recommend(submitData);
            const result = response.data || response;
            if (result.success) {
                setRecommendation(result);
                toast.success('Recommendations generated successfully!');
                fetchHistory();
            }
            else {
                toast.error(result.error || 'Failed to generate recommendations');
            }
        }
        catch (error) {
            console.error('Recommendation error:', error);
            toast.error(error.response?.data?.errors || 'Failed to generate recommendation');
        }
        finally {
            setLoading(false);
        }
    };
    const getFeasibilityConfig = (feasibility) => {
        switch (feasibility) {
            case 'high':
                return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Excellent', scoreColor: 'bg-emerald-500' };
            case 'medium':
                return { icon: Info, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Good', scoreColor: 'bg-amber-500' };
            case 'low':
                return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Moderate', scoreColor: 'bg-orange-500' };
            default:
                return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Poor', scoreColor: 'bg-red-500' };
        }
    };
    const getScoreColor = (score) => {
        if (score >= 70)
            return 'text-emerald-600';
        if (score >= 50)
            return 'text-amber-600';
        if (score >= 30)
            return 'text-orange-600';
        return 'text-red-600';
    };
    const deleteHistory = async (id) => {
        try {
            await cropsService.deleteRecommendationHistory(id);
            toast.success('History entry deleted');
            fetchHistory();
        }
        catch (error) {
            toast.error('Failed to delete');
        }
    };
    const loadHistoryEntry = (entry) => {
        setSoilData({
            region: entry.region || '',
            season: entry.season || '',
            water_source: entry.water_availability || '',
            soil_type: entry.soil_type || '',
            labor_availability: entry.experience || 'medium',
            market_distance: 'near',
            farming_goal: entry.goal || 'mixed',
            temperature_override: entry.temperature || null,
            elevation_risk: entry.frost_risk || null,
            ph: entry.ph || null,
            n: null,
            p: null,
            k: null,
        });
        toast.info('Form loaded with selected history');
    };
    const getSelectValue = (value) => {
        if (value && value !== '')
            return value;
        return undefined;
    };
    if (hasError) {
        return (<MainLayout title="Crop Recommendations" subtitle="Something went wrong">
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
            <p className="text-red-600">Something went wrong. Please refresh the page.</p>
            <Button onClick={() => window.location.reload()} className="mt-4 bg-linear-to-r from-emerald-600 to-green-600">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </MainLayout>);
    }
    return (<MainLayout title={t('crops.recommendations') || 'Crop Recommendations'} subtitle={t('crops.recommendationsDesc') || 'Get AI-powered insights for your next harvest'}>
      <div className="space-y-6">
        {/* Farm Input Form - Same as before */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-linear-to-r from-emerald-600 to-green-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10">
                <Beaker className="w-5 h-5"/>
              </div>
              <div>
                <CardTitle className="text-xl font-black">
                  {language === 'np' ? 'खेतको जानकारी' : 'Farm Information'}
                </CardTitle>
                <CardDescription className="text-emerald-50/80">
                  {language === 'np' ? 'आफ्नो खेतको विवरण भर्नुहोस्' : 'Enter your farm details'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Form fields - same as before */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {language === 'np' ? 'क्षेत्र' : 'Region'} *
                </Label>
                <Select value={getSelectValue(soilData.region)} onValueChange={val => handleChange('region', val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={language === 'np' ? 'क्षेत्र छान्नुहोस्' : 'Select region'}/>
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>
                        {language === 'np' ? opt.label : opt.labelEn}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {language === 'np' ? 'मौसम' : 'Season'} *
                </Label>
                <Select value={getSelectValue(soilData.season)} onValueChange={val => handleChange('season', val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={language === 'np' ? 'मौसम छान्नुहोस्' : 'Select season'}/>
                  </SelectTrigger>
                  <SelectContent>
                    {seasonOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>
                        {language === 'np' ? opt.label : opt.labelEn}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {language === 'np' ? 'पानीको स्रोत' : 'Water Source'} *
                </Label>
                <Select value={getSelectValue(soilData.water_source)} onValueChange={val => handleChange('water_source', val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={language === 'np' ? 'पानीको स्रोत छान्नुहोस्' : 'Select water source'}/>
                  </SelectTrigger>
                  <SelectContent>
                    {waterSourceOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>
                        {language === 'np' ? opt.label : opt.labelEn}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {language === 'np' ? 'माटोको प्रकार' : 'Soil Type'} *
                </Label>
                <Select value={getSelectValue(soilData.soil_type)} onValueChange={val => handleChange('soil_type', val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={language === 'np' ? 'माटोको प्रकार छान्नुहोस्' : 'Select soil type'}/>
                  </SelectTrigger>
                  <SelectContent>
                    {soilTypeOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>
                        {language === 'np' ? opt.label : opt.labelEn}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {language === 'np' ? 'श्रम उपलब्धता' : 'Labor Availability'} *
                </Label>
                <Select value={getSelectValue(soilData.labor_availability)} onValueChange={val => handleChange('labor_availability', val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={language === 'np' ? 'श्रम उपलब्धता छान्नुहोस्' : 'Select labor availability'}/>
                  </SelectTrigger>
                  <SelectContent>
                    {laborOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>
                        {language === 'np' ? opt.label : opt.labelEn}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {language === 'np' ? 'बजार दूरी' : 'Market Distance'} *
                </Label>
                <Select value={getSelectValue(soilData.market_distance)} onValueChange={val => handleChange('market_distance', val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={language === 'np' ? 'बजार दूरी छान्नुहोस्' : 'Select market distance'}/>
                  </SelectTrigger>
                  <SelectContent>
                    {marketOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>
                        {language === 'np' ? opt.label : opt.labelEn}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {language === 'np' ? 'खेतीको लक्ष्य' : 'Farming Goal'} *
                </Label>
                <Select value={getSelectValue(soilData.farming_goal)} onValueChange={val => handleChange('farming_goal', val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={language === 'np' ? 'खेतीको लक्ष्य छान्नुहोस्' : 'Select farming goal'}/>
                  </SelectTrigger>
                  <SelectContent>
                    {goalOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>
                        {language === 'np' ? opt.label : opt.labelEn}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="mt-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-muted-foreground">
                <FlaskConical className="w-3 h-3 mr-1"/>
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (pH, NPK, Temperature)'}
              </Button>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (<div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {language === 'np' ? 'पीएच स्तर' : 'pH Level'}
                    </Label>
                    <Input type="number" step="0.1" min="0" max="14" placeholder="6.5 - 7.5" value={soilData.ph || ''} onChange={e => handleChange('ph', e.target.value ? parseFloat(e.target.value) : null)} className="rounded-xl"/>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {language === 'np' ? 'तापक्रम' : 'Temperature'} (°C)
                    </Label>
                    <Input type="number" step="0.5" placeholder={language === 'np' ? 'तापक्रम' : 'Temperature'} value={soilData.temperature_override || ''} onChange={e => handleChange('temperature_override', e.target.value ? parseFloat(e.target.value) : null)} className="rounded-xl"/>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Nitrogen (N) kg/ha
                    </Label>
                    <Input type="number" step="10" placeholder="30 - 120" value={soilData.n || ''} onChange={e => handleChange('n', e.target.value ? parseFloat(e.target.value) : null)} className="rounded-xl"/>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Phosphorus (P) kg/ha
                    </Label>
                    <Input type="number" step="10" placeholder="20 - 80" value={soilData.p || ''} onChange={e => handleChange('p', e.target.value ? parseFloat(e.target.value) : null)} className="rounded-xl"/>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Potassium (K) kg/ha
                    </Label>
                    <Input type="number" step="10" placeholder="20 - 80" value={soilData.k || ''} onChange={e => handleChange('k', e.target.value ? parseFloat(e.target.value) : null)} className="rounded-xl"/>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {language === 'np' ? 'जोखिम क्षेत्र' : 'Frost Risk'}
                    </Label>
                    <Select value={soilData.elevation_risk === undefined ? undefined : soilData.elevation_risk ? "true" : "false"} onValueChange={val => handleChange('elevation_risk', val === "true")}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={language === 'np' ? 'स्वतः पत्ता लगाउनुहोस्' : 'Auto-detect'}/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">{language === 'np' ? 'हो' : 'Yes'}</SelectItem>
                        <SelectItem value="false">{language === 'np' ? 'होइन' : 'No'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>)}

            <Button onClick={handleGetRecommendations} className="w-full mt-6 h-12 rounded-xl font-bold gap-2 bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Leaf className="w-4 h-4"/>}
              {language === 'np' ? 'बाली सिफारिस पाउनुहोस्' : 'Get Crop Recommendations'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {recommendation && recommendation.recommendations && recommendation.recommendations.length > 0 && (<div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg rounded-2xl bg-linear-to-br from-emerald-50 to-emerald-100">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-black text-emerald-600">{recommendation.summary.possible_count}</p>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">
                    {language === 'np' ? 'सम्भावित बाली' : 'Possible Crops'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg rounded-2xl bg-linear-to-br from-green-50 to-green-100">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-black text-green-600">{recommendation.summary.high_feasibility}</p>
                  <p className="text-[10px] font-bold text-green-700 uppercase">
                    {language === 'np' ? 'उच्च सम्भावना' : 'High Feasibility'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg rounded-2xl bg-linear-to-br from-amber-50 to-amber-100">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-black text-amber-600">{recommendation.summary.medium_feasibility}</p>
                  <p className="text-[10px] font-bold text-amber-700 uppercase">
                    {language === 'np' ? 'मध्यम सम्भावना' : 'Medium Feasibility'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg rounded-2xl bg-linear-to-br from-red-50 to-red-100">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-black text-red-600">
                    {recommendation.summary.total_evaluated - recommendation.summary.possible_count}
                  </p>
                  <p className="text-[10px] font-bold text-red-700 uppercase">
                    {language === 'np' ? 'असम्भव' : 'Not Suitable'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Best Crop Highlight */}
            {recommendation.summary.best_crop && (<Card className="border-0 shadow-xl rounded-2xl bg-linear-to-r from-emerald-500 to-green-500 text-white">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold opacity-80 uppercase tracking-wider">
                        {language === 'np' ? 'सर्वोत्तम सिफारिस' : 'Top Recommendation'}
                      </p>
                      <p className="text-2xl font-black mt-1">{recommendation.summary.best_crop}</p>
                      <p className="text-sm opacity-90 mt-1">
                        {recommendation.summary.best_confidence}% confidence
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/20">
                      <TrendingUp className="w-8 h-8"/>
                    </div>
                  </div>
                </CardContent>
              </Card>)}

            {/* Recommended Crops Grid */}
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="w-5 h-5 text-primary"/>
              <h3 className="font-semibold text-lg">
                {language === 'np' ? 'सिफारिस गरिएका बालीहरू' : 'Recommended Crops'}
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {recommendation.recommendations.map((crop, index) => {
                const config = getFeasibilityConfig(crop.feasibility);
                const Icon = config.icon;
                const npkStatus = crop.npk_status || crop.explanation?.npk_status;
                return (<Card key={crop.crop_id} className={cn('border-0 shadow-xl rounded-2xl overflow-hidden border-l-4', config.border, 'border-l-current')}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-lg">
                            {language === 'np' && crop.crop_name_np ? crop.crop_name_np : crop.crop_name}
                          </h4>
                          <p className="text-xs text-muted-foreground capitalize">{crop.feasibility} feasibility</p>
                        </div>
                        <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
                          <Icon className="w-3 h-3"/>
                          {crop.confidence}%
                        </div>
                      </div>

                      {/* Explanation Summary */}
                      <p className="text-sm text-muted-foreground mb-3">
                        {crop.explanation?.summary}
                      </p>

                      {/* NPK Status - UPDATED with better display */}
                      {npkStatus && (npkStatus.nitrogen || npkStatus.phosphorus || npkStatus.potassium) && (<div className="mb-3 p-3 rounded-xl bg-gray-50">
                          <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1">
                            <Droplet className="w-3 h-3"/>
                            Soil Nutrient Status
                          </p>
                          <div className="space-y-2">
                            {/* Nitrogen */}
                            {npkStatus.nitrogen && npkStatus.nitrogen.status && (<div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold w-5">N</span>
                                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', getNpkStatusConfig(npkStatus.nitrogen.status).color)}>
                                    {getNpkStatusConfig(npkStatus.nitrogen.status).label}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{npkStatus.nitrogen.message}</p>
                              </div>)}
                            {/* Phosphorus */}
                            {npkStatus.phosphorus && npkStatus.phosphorus.status && (<div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold w-5">P</span>
                                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', getNpkStatusConfig(npkStatus.phosphorus.status).color)}>
                                    {getNpkStatusConfig(npkStatus.phosphorus.status).label}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{npkStatus.phosphorus.message}</p>
                              </div>)}
                            {/* Potassium */}
                            {npkStatus.potassium && npkStatus.potassium.status && (<div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold w-5">K</span>
                                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', getNpkStatusConfig(npkStatus.potassium.status).color)}>
                                    {getNpkStatusConfig(npkStatus.potassium.status).label}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{npkStatus.potassium.message}</p>
                              </div>)}
                          </div>
                          {/* Suggestions from NPK status */}
                          {(npkStatus.nitrogen?.suggestion || npkStatus.phosphorus?.suggestion || npkStatus.potassium?.suggestion) && (<div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-[10px] text-amber-600">
                                💡 {npkStatus.nitrogen?.suggestion || npkStatus.phosphorus?.suggestion || npkStatus.potassium?.suggestion}
                              </p>
                            </div>)}
                        </div>)}

                      {/* Strengths */}
                      {crop.explanation?.strengths && crop.explanation.strengths.length > 0 && (<div className="mb-2">
                          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3"/>
                            {language === 'np' ? 'फाइदाहरू' : 'Strengths'}
                          </p>
                          <div className="space-y-0.5 mt-1">
                            {crop.explanation.strengths.slice(0, 2).map((s, i) => (<p key={i} className="text-xs text-emerald-600">• {s.reason}</p>))}
                          </div>
                        </div>)}

                      {/* Weaknesses & Mitigations */}
                      {crop.explanation?.weaknesses && crop.explanation.weaknesses.length > 0 && (<div className="mb-2">
                          <p className="text-xs font-bold text-amber-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3"/>
                            {language === 'np' ? 'सावधानीहरू' : 'Considerations'}
                          </p>
                          <div className="space-y-0.5 mt-1">
                            {crop.explanation.weaknesses.slice(0, 2).map((w, i) => (<div key={i}>
                                <p className="text-xs text-amber-600">• {w.reason}</p>
                                {w.mitigation && (<p className="text-[10px] text-muted-foreground ml-2">→ {w.mitigation}</p>)}
                              </div>))}
                          </div>
                        </div>)}

                      {/* Actionable Advice */}
                      {crop.actionable_advice && crop.actionable_advice.length > 0 && (<div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-bold text-blue-600 flex items-center gap-1">
                            <Info className="w-3 h-3"/>
                            {language === 'np' ? 'सुझावहरू' : 'Recommendations'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{crop.actionable_advice[0]}</p>
                        </div>)}

                      {/* Score Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{language === 'np' ? 'सम्भावना स्कोर' : 'Feasibility Score'}</span>
                          <span className={getScoreColor(crop.confidence)}>{crop.confidence}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', config.scoreColor)} style={{ width: `${crop.confidence}%` }}/>
                        </div>
                      </div>
                    </CardContent>
                  </Card>);
            })}
            </div>

            {/* History Section */}
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-muted-foreground"/> 
                  {language === 'np' ? 'हालैको इतिहास' : 'Recent History'}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="divide-y max-h-75 overflow-y-auto">
                  {historyLoading ? (<div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground"/></div>) : history && history.length > 0 ? (history.map((item) => (<div key={item.id} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <button className="flex-1 text-left" onClick={() => loadHistoryEntry(item)}>
                            <p className="font-bold text-sm capitalize">{item.region || 'N/A'} - {item.season || 'N/A'}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()} • {item.soil_type} soil
                            </p>
                            {item.ph && <p className="text-[10px] text-muted-foreground">pH: {item.ph}</p>}
                          </button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteHistory(item.id)}>
                            <Trash2 className="w-3 h-3"/>
                          </Button>
                        </div>
                      </div>))) : (<p className="px-6 py-8 text-center text-sm text-muted-foreground italic">
                      {language === 'np' ? 'कुनै पुरानो अनुरोध छैन' : 'No previous requests'}
                    </p>)}
                </div>
              </CardContent>
            </Card>
          </div>)}
      </div>
    </MainLayout>);
};
export default RecommendationPage;
