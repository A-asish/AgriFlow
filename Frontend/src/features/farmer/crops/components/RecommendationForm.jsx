import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { AlertCircle, Beaker, Loader2, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

const RecommendationForm = ({
    language,
    soilData,
    handleChange,
    handleGetRecommendations,
    loading,
    showAdvanced,
    setShowAdvanced,
    regionOptions,
    seasonOptions,
    waterSourceOptions,
    soilTypeOptions,
    laborOptions,
    marketOptions,
    goalOptions,
    droughtRiskOptions,
    frostRiskOptions,
    t
}) => {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Required fields list
    const requiredFields = [
        'region', 'season', 'temperature', 'drought_risk', 'frost_risk',
        'water_source', 'soil_type', 'labor_availability', 'market_distance', 'farming_goal'
    ];

    // Validation functions
    const validateField = (name, value) => {
        switch (name) {
            case 'region':
                if (!value) return 'Region is required';
                return '';
            case 'season':
                if (!value) return 'Season is required';
                return '';
            case 'temperature':
                if (value === null || value === undefined || value === '') return 'Temperature is required';
                const temp = parseFloat(value);
                if (isNaN(temp)) return 'Must be a valid number';
                if (temp < -20 || temp > 50) return 'Temperature must be between -20°C and 50°C';
                return '';
            case 'drought_risk':
                if (!value) return 'Drought risk is required';
                return '';
            case 'frost_risk':
                if (!value) return 'Frost risk is required';
                return '';
            case 'water_source':
                if (!value) return 'Water source is required';
                return '';
            case 'soil_type':
                if (!value) return 'Soil type is required';
                return '';
            case 'labor_availability':
                if (!value) return 'Labor availability is required';
                return '';
            case 'market_distance':
                if (!value) return 'Market distance is required';
                return '';
            case 'farming_goal':
                if (!value) return 'Farming goal is required';
                return '';
            case 'ph':
                if (value && (value < 0 || value > 14)) return 'pH must be between 0 and 14';
                return '';
            case 'n':
                if (value && value < 0) return 'Nitrogen cannot be negative';
                if (value && value > 500) return 'Nitrogen seems too high (>500 kg/ha)';
                return '';
            case 'p':
                if (value && value < 0) return 'Phosphorus cannot be negative';
                if (value && value > 300) return 'Phosphorus seems too high (>300 kg/ha)';
                return '';
            case 'k':
                if (value && value < 0) return 'Potassium cannot be negative';
                if (value && value > 500) return 'Potassium seems too high (>500 kg/ha)';
                return '';
            default:
                return '';
        }
    };

    // Validate all fields
    const validateAllFields = () => {
        const newErrors = {};
        requiredFields.forEach(field => {
            const error = validateField(field, soilData[field]);
            if (error) newErrors[field] = error;
        });
        
        if (soilData.ph) {
            const phError = validateField('ph', soilData.ph);
            if (phError) newErrors.ph = phError;
        }
        if (soilData.n) {
            const nError = validateField('n', soilData.n);
            if (nError) newErrors.n = nError;
        }
        if (soilData.p) {
            const pError = validateField('p', soilData.p);
            if (pError) newErrors.p = pError;
        }
        if (soilData.k) {
            const kError = validateField('k', soilData.k);
            if (kError) newErrors.k = kError;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle field change with validation
    const handleFieldChange = (field, value) => {
        handleChange(field, value);
        setTouched(prev => ({ ...prev, [field]: true }));
        
        const error = validateField(field, value);
        if (!error && errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        } else if (error && !errors[field]) {
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    // Handle field blur
    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, soilData[field]);
        if (error) {
            setErrors(prev => ({ ...prev, [field]: error }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = () => {
        const allTouched = {};
        requiredFields.forEach(field => {
            allTouched[field] = true;
        });
        setTouched(allTouched);
        
        const isValid = validateAllFields();
        
        if (isValid) {
            handleGetRecommendations();
        } else {
            const firstErrorField = document.querySelector('.border-red-500');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const hasError = (field) => {
        return touched[field] && errors[field];
    };

    const getSelectValue = (value) => {
        if (value && value !== '') return value;
        return undefined;
    };

    return (
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-linear-to-r from-emerald-600 to-green-600 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/10">
                        <Beaker className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black">
                            {t?.('crops.farmInformation') || 'Farm Information'}
                        </CardTitle>
                        <CardDescription className="text-emerald-50/80">
                            {t?.('crops.enterFarmDetails') || 'Enter your farm details'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Region */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t?.('crops.region') || 'Region'} <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={getSelectValue(soilData.region)} 
                            onValueChange={val => handleFieldChange('region', val)}
                            onOpenChange={() => handleBlur('region')}
                        >
                            <SelectTrigger className={cn("rounded-xl", hasError('region') && "border-red-500 focus:ring-red-500")}>
                                <SelectValue placeholder={t?.('crops.selectRegion') || 'Select Region'} />
                            </SelectTrigger>
                            <SelectContent>
                                {regionOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {language === 'np' ? opt.label : opt.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasError('region') && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" /> {errors.region}
                            </p>
                        )}
                    </div>

                    {/* Season */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t?.('crops.season') || 'Season'} <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={getSelectValue(soilData.season)} 
                            onValueChange={val => handleFieldChange('season', val)}
                            onOpenChange={() => handleBlur('season')}
                        >
                            <SelectTrigger className={cn("rounded-xl", hasError('season') && "border-red-500 focus:ring-red-500")}>
                                <SelectValue placeholder={t?.('crops.selectSeason') || 'Select Season'} />
                            </SelectTrigger>
                            <SelectContent>
                                {seasonOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {language === 'np' ? opt.label : opt.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasError('season') && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" /> {errors.season}
                            </p>
                        )}
                    </div>

                    {/* Temperature */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t?.('crops.temperature') || 'Temperature'} (°C) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="number"
                            step="0.5"
                            placeholder="e.g., 25.5"
                            value={soilData.temperature === null || soilData.temperature === undefined ? '' : soilData.temperature}
                            onChange={e => handleFieldChange('temperature', e.target.value ? parseFloat(e.target.value) : null)}
                            onBlur={() => handleBlur('temperature')}
                            className={cn("rounded-xl", hasError('temperature') && "border-red-500 focus:ring-red-500")}
                        />
                        {hasError('temperature') && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" /> {errors.temperature}
                            </p>
                        )}
                    </div>

                    {/* Drought Risk */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t?.('crops.droughtRisk') || 'Drought Risk'} <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={getSelectValue(soilData.drought_risk)} 
                            onValueChange={val => handleFieldChange('drought_risk', val)}
                            onOpenChange={() => handleBlur('drought_risk')}
                        >
                            <SelectTrigger className={cn("rounded-xl", hasError('drought_risk') && "border-red-500 focus:ring-red-500")}>
                                <SelectValue placeholder={t?.('crops.selectDroughtRisk') || 'Select Drought Risk'} />
                            </SelectTrigger>
                            <SelectContent>
                                {droughtRiskOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {language === 'np' ? opt.label : opt.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasError('drought_risk') && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" /> {errors.drought_risk}
                            </p>
                        )}
                    </div>

                    {/* Frost Risk */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t?.('crops.frostRisk') || 'Frost Risk'} <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={getSelectValue(soilData.frost_risk)} 
                            onValueChange={val => handleFieldChange('frost_risk', val)}
                            onOpenChange={() => handleBlur('frost_risk')}
                        >
                            <SelectTrigger className={cn("rounded-xl", hasError('frost_risk') && "border-red-500 focus:ring-red-500")}>
                                <SelectValue placeholder={t?.('crops.selectFrostRisk') || 'Select Frost Risk'} />
                            </SelectTrigger>
                            <SelectContent>
                                {frostRiskOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {language === 'np' ? opt.label : opt.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasError('frost_risk') && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" /> {errors.frost_risk}
                            </p>
                        )}
                    </div>

                    {/* Water Source */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t?.('crops.waterSource') || 'Water Source'} <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={getSelectValue(soilData.water_source)} 
                            onValueChange={val => handleFieldChange('water_source', val)}
                            onOpenChange={() => handleBlur('water_source')}
                        >
                            <SelectTrigger className={cn("rounded-xl", hasError('water_source') && "border-red-500 focus:ring-red-500")}>
                                <SelectValue placeholder={t?.('crops.selectWaterSource') || 'Select Water Source'} />
                            </SelectTrigger>
                            <SelectContent>
                                {waterSourceOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {language === 'np' ? opt.label : opt.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasError('water_source') && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" /> {errors.water_source}
                            </p>
                        )}
                    </div>

                    {/* Soil Type */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t?.('crops.soilType') || 'Soil Type'} <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={getSelectValue(soilData.soil_type)} 
                            onValueChange={val => handleFieldChange('soil_type', val)}
                            onOpenChange={() => handleBlur('soil_type')}
                        >
                            <SelectTrigger className={cn("rounded-xl", hasError('soil_type') && "border-red-500 focus:ring-red-500")}>
                                <SelectValue placeholder={t?.('crops.selectSoilType') || 'Select Soil Type'} />
                            </SelectTrigger>
                            <SelectContent>
                                {soilTypeOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {language === 'np' ? opt.label : opt.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasError('soil_type') && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" /> {errors.soil_type}
                            </p>
                        )}
                    </div>

                    {/* Labor Availability */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t?.('crops.laborAvailability') || 'Labor Availability'} <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={getSelectValue(soilData.labor_availability)} 
                            onValueChange={val => handleFieldChange('labor_availability', val)}
                            onOpenChange={() => handleBlur('labor_availability')}
                        >
                            <SelectTrigger className={cn("rounded-xl", hasError('labor_availability') && "border-red-500 focus:ring-red-500")}>
                                <SelectValue placeholder={t?.('crops.selectLaborAvailability') || 'Select Labor Availability'} />
                            </SelectTrigger>
                            <SelectContent>
                                {laborOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {language === 'np' ? opt.label : opt.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasError('labor_availability') && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" /> {errors.labor_availability}
                            </p>
                        )}
                    </div>

                    {/* Market Distance */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t?.('crops.marketDistance') || 'Market Distance'} <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={getSelectValue(soilData.market_distance)} 
                            onValueChange={val => handleFieldChange('market_distance', val)}
                            onOpenChange={() => handleBlur('market_distance')}
                        >
                            <SelectTrigger className={cn("rounded-xl", hasError('market_distance') && "border-red-500 focus:ring-red-500")}>
                                <SelectValue placeholder={t?.('crops.selectMarketDistance') || 'Select Market Distance'} />
                            </SelectTrigger>
                            <SelectContent>
                                {marketOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {language === 'np' ? opt.label : opt.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasError('market_distance') && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" /> {errors.market_distance}
                            </p>
                        )}
                    </div>

                    {/* Farming Goal */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t?.('crops.farmingGoal') || 'Farming Goal'} <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={getSelectValue(soilData.farming_goal)} 
                            onValueChange={val => handleFieldChange('farming_goal', val)}
                            onOpenChange={() => handleBlur('farming_goal')}
                        >
                            <SelectTrigger className={cn("rounded-xl", hasError('farming_goal') && "border-red-500 focus:ring-red-500")}>
                                <SelectValue placeholder={t?.('crops.selectFarmingGoal') || 'Select Farming Goal'} />
                            </SelectTrigger>
                            <SelectContent>
                                {goalOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {language === 'np' ? opt.label : opt.labelEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {hasError('farming_goal') && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3" /> {errors.farming_goal}
                            </p>
                        )}
                    </div>
                </div>

                {/* Advanced Options Toggle */}
                <div className="mt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-xs text-muted-foreground"
                    >
                        {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (pH, NPK)'}
                    </Button>
                </div>

                {/* Advanced Options */}
                {showAdvanced && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {t?.('crops.phLevel') || 'pH Level'} <span className="text-gray-400 text-[10px]">(Optional)</span>
                                </Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="14"
                                    placeholder="6.5 - 7.5"
                                    value={soilData.ph === null || soilData.ph === undefined ? '' : soilData.ph}
                                    onChange={e => handleFieldChange('ph', e.target.value ? parseFloat(e.target.value) : null)}
                                    onBlur={() => handleBlur('ph')}
                                    className={cn("rounded-xl", hasError('ph') && "border-red-500 focus:ring-red-500")}
                                />
                                {hasError('ph') && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.ph}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {t?.('crops.nitrogen') || 'Nitrogen (N) kg/ha'} <span className="text-gray-400 text-[10px]">(Optional)</span>
                                </Label>
                                <Input
                                    type="number"
                                    step="10"
                                    placeholder="30 - 120"
                                    value={soilData.n === null || soilData.n === undefined ? '' : soilData.n}
                                    onChange={e => handleFieldChange('n', e.target.value ? parseFloat(e.target.value) : null)}
                                    onBlur={() => handleBlur('n')}
                                    className={cn("rounded-xl", hasError('n') && "border-red-500 focus:ring-red-500")}
                                />
                                {hasError('n') && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.n}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {t?.('crops.phosphorus') || 'Phosphorus (P) kg/ha'} <span className="text-gray-400 text-[10px]">(Optional)</span>
                                </Label>
                                <Input
                                    type="number"
                                    step="10"
                                    placeholder="20 - 80"
                                    value={soilData.p === null || soilData.p === undefined ? '' : soilData.p}
                                    onChange={e => handleFieldChange('p', e.target.value ? parseFloat(e.target.value) : null)}
                                    onBlur={() => handleBlur('p')}
                                    className={cn("rounded-xl", hasError('p') && "border-red-500 focus:ring-red-500")}
                                />
                                {hasError('p') && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.p}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {t?.('crops.potassium') || 'Potassium (K) kg/ha'} <span className="text-gray-400 text-[10px]">(Optional)</span>
                                </Label>
                                <Input
                                    type="number"
                                    step="10"
                                    placeholder="20 - 80"
                                    value={soilData.k === null || soilData.k === undefined ? '' : soilData.k}
                                    onChange={e => handleFieldChange('k', e.target.value ? parseFloat(e.target.value) : null)}
                                    onBlur={() => handleBlur('k')}
                                    className={cn("rounded-xl", hasError('k') && "border-red-500 focus:ring-red-500")}
                                />
                                {hasError('k') && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.k}
                                    </p>
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-3 text-center">
                            {t?.('crops.optionalHint') || '💡 Optional: Provide pH and NPK values for more accurate soil health analysis'}
                        </p>
                    </div>
                )}


                <Button
                    onClick={handleSubmit}
                    className="w-full mt-6 h-12 rounded-xl font-bold gap-2 bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Leaf className="w-4 h-4" />}
                    {t?.('crops.getRecommendations') || 'Get Crop Recommendations'}
                </Button>
            </CardContent>
        </Card>
    );
};

export default RecommendationForm;