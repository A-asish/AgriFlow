import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { 
    History, Trash2, Loader2, Eye, Calendar, MapPin, Droplet, 
    Thermometer, Target, Leaf, Snowflake, Users, 
    Truck, Sprout, AlertTriangle, Clock, FlaskConical, ChevronDown, ChevronUp
} from 'lucide-react';
import { ResponsiveDialog } from '@/shared/components/ui/ResponsiveDialog';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/lib/utils';

const RecommendationHistory = ({ history, historyLoading, loadHistoryEntry, deleteHistory, t }) => {
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showAllCrops, setShowAllCrops] = useState(true);

    // Safety check for t function
    const safeT = (key, defaultValue) => {
        if (t && typeof t === 'function') {
            return t(key) || defaultValue;
        }
        return defaultValue;
    };

    const getSeasonDisplay = (season) => {
        if (!season) return 'N/A';
        const seasons = {
            spring: safeT('crops.spring', 'Spring'),
            summer: safeT('crops.summer', 'Summer'),
            monsoon: safeT('crops.monsoon', 'Monsoon'),
            autumn: safeT('crops.autumn', 'Autumn'),
            winter: safeT('crops.winter', 'Winter'),
        };
        return seasons[season] || season;
    };

    const getRegionDisplay = (region) => {
        if (!region) return 'N/A';
        const regions = {
            terai: safeT('crops.terai', 'Terai'),
            'mid-hill': safeT('crops.midHill', 'Mid-Hill'),
            hill: safeT('crops.hill', 'Hill'),
            mountain: safeT('crops.mountain', 'Mountain'),
        };
        return regions[region] || region;
    };

    const getWaterSourceDisplay = (source) => {
        if (!source) return 'N/A';
        const sources = {
            rainfed_only: safeT('crops.rainfedOnly', 'Rainfed Only'),
            canal: safeT('crops.canal', 'Canal'),
            well: safeT('crops.well', 'Well'),
            river: safeT('crops.river', 'River'),
            drip_irrigation: safeT('crops.dripIrrigation', 'Drip Irrigation'),
        };
        return sources[source] || source;
    };

    const getSoilTypeDisplay = (soil) => {
        if (!soil) return 'N/A';
        const soils = {
            clay: safeT('crops.clay', 'Clay'),
            loamy: safeT('crops.loamy', 'Loamy'),
            sandy: safeT('crops.sandy', 'Sandy'),
            silty: safeT('crops.silty', 'Silty'),
            clay_loam: safeT('crops.clayLoam', 'Clay Loam'),
        };
        return soils[soil] || soil;
    };

    const getGoalDisplay = (goal) => {
        if (!goal) return 'N/A';
        const goals = {
            profit: safeT('crops.goalProfit', 'Profit'),
            food_security: safeT('crops.goalFoodSecurity', 'Food Security'),
            mixed: safeT('crops.goalMixed', 'Mixed'),
            subsistence: safeT('crops.goalSubsistence', 'Subsistence'),
        };
        return goals[goal] || goal;
    };

    const getFrostRiskDisplay = (risk) => {
        if (risk === undefined || risk === null) return 'N/A';
        return risk ? (safeT('crops.frostYes', 'Yes')) : (safeT('crops.frostNo', 'No'));
    };

    const getDroughtRiskDisplay = (risk) => {
        if (!risk) return 'N/A';
        const risks = {
            high: safeT('crops.droughtHigh', 'High Risk'),
            medium: safeT('crops.droughtMedium', 'Medium Risk'),
            low: safeT('crops.droughtLow', 'Low Risk'),
        };
        return risks[risk] || risk;
    };

    const getLaborDisplay = (labor) => {
        if (!labor) return 'N/A';
        const labors = {
            low: safeT('crops.laborLow', 'Low'),
            medium: safeT('crops.laborMedium', 'Medium'),
            high: safeT('crops.laborHigh', 'High'),
        };
        return labors[labor] || labor;
    };

    const getMarketDisplay = (market) => {
        if (!market) return 'N/A';
        const markets = {
            near: safeT('crops.marketNear', 'Near'),
            medium: safeT('crops.marketMedium', 'Medium'),
            far: safeT('crops.marketFar', 'Far'),
        };
        return markets[market] || market;
    };

    const getFeasibilityColor = (feasibility) => {
        switch (feasibility) {
            case 'high': return 'text-emerald-600 bg-emerald-50';
            case 'medium': return 'text-amber-600 bg-amber-50';
            case 'low': return 'text-orange-600 bg-orange-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const DetailRow = ({ icon, label, value }) => (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
            <div className="text-muted-foreground">{icon}</div>
            <div className="flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value || 'N/A'}</p>
            </div>
        </div>
    );

    const CropCard = ({ crop, index }) => {
        const feasibilityColor = getFeasibilityColor(crop.feasibility);
        return (
            <div className="border rounded-lg p-3 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">#{index + 1}</span>
                            <h5 className="font-bold text-emerald-700">
                                {crop.crop_name}
                            </h5>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {crop.crop_name_np}
                        </p>
                    </div>
                    <div className={cn("px-2 py-0.5 rounded-full text-xs font-medium", feasibilityColor)}>
                        {crop.feasibility}
                    </div>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                    <div>
                        <p className="text-[10px] text-muted-foreground">Confidence</p>
                        <p className="text-sm font-bold">{crop.confidence}%</p>
                    </div>
                    <div className="w-24">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full bg-emerald-500" 
                                style={{ width: `${crop.confidence}%` }}
                            />
                        </div>
                    </div>
                </div>
                
                {crop.explanation?.summary && (
                    <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">
                        {crop.explanation.summary}
                    </p>
                )}
            </div>
        );
    };

    const handleViewDetails = (item) => {
        setSelectedHistory(item);
        setShowDetailDialog(true);
    };

    const handleLoadAndView = (item) => {
        if (loadHistoryEntry) {
            loadHistoryEntry(item);
        }
    };

    const handleDelete = (id) => {
        if (deleteHistory) {
            deleteHistory(id);
        }
    };

    // Safely get recommendations array
    const getRecommendations = () => {
        if (!selectedHistory?.recommendations) return [];
        if (!Array.isArray(selectedHistory.recommendations)) return [];
        return selectedHistory.recommendations;
    };

    const recommendations = getRecommendations();
    const topRecommendation = recommendations.length > 0 ? recommendations[0] : null;

    return (
        <>
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <History className="w-5 h-5 text-muted-foreground" />
                        {safeT('crops.recentHistory', 'Recent History')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="divide-y max-h-96 overflow-y-auto">
                        {historyLoading ? (
                            <div className="p-4 text-center">
                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                            </div>
                        ) : history && history.length > 0 ? (
                            history.map((item) => (
                                <div key={item.id} className="px-4 py-3 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between gap-2">
                                        <button 
                                            className="flex-1 text-left" 
                                            onClick={() => handleLoadAndView(item)}
                                        >
                                            <p className="font-bold text-sm capitalize">
                                                {getRegionDisplay(item.region)} - {getSeasonDisplay(item.season)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {new Date(item.created_at).toLocaleDateString()} • {getSoilTypeDisplay(item.soil_type)}
                                            </p>
                                            {item.temperature && (
                                                <p className="text-[10px] text-muted-foreground">
                                                    {safeT('crops.temperature', 'Temperature')}: {item.temperature}°C
                                                </p>
                                            )}
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => handleViewDetails(item)}
                                                title={safeT('common.viewDetails', 'View Details')}
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                                                onClick={() => handleDelete(item.id)}
                                                title={safeT('common.delete', 'Delete')}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="px-6 py-8 text-center text-sm text-muted-foreground italic">
                                {safeT('crops.noHistory', 'No previous requests')}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* History Detail Dialog - Shows ALL crops with scores */}
            <ResponsiveDialog 
                isOpen={showDetailDialog} 
                onClose={() => setShowDetailDialog(false)} 
                title={safeT('crops.historyDetails', 'Request Details')}
                maxWidth="md"
            >
                {selectedHistory && (
                    <div className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
                        {/* Header with Date */}
                        <div className="text-center border-b pb-3">
                            <p className="text-xs text-muted-foreground">
                                {new Date(selectedHistory.created_at).toLocaleString()}
                            </p>
                            <Badge className="mt-2 bg-emerald-100 text-emerald-700">
                                {getSeasonDisplay(selectedHistory.season)} {new Date(selectedHistory.created_at).getFullYear()}
                            </Badge>
                        </div>

                        {/* Farm Conditions - Collapsible */}
                        <div>
                            <button 
                                onClick={() => setShowAllCrops(!showAllCrops)}
                                className="flex items-center justify-between w-full text-sm font-bold mb-2"
                            >
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                    {safeT('crops.farmConditions', 'Farm Conditions')}
                                </span>
                                {showAllCrops ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </button>
                            
                            {showAllCrops && (
                                <div className="grid grid-cols-2 gap-2">
                                    <DetailRow 
                                        icon={<MapPin className="w-4 h-4" />}
                                        label={safeT('crops.region', 'Region')}
                                        value={getRegionDisplay(selectedHistory.region)}
                                    />
                                    <DetailRow 
                                        icon={<Calendar className="w-4 h-4" />}
                                        label={safeT('crops.season', 'Season')}
                                        value={getSeasonDisplay(selectedHistory.season)}
                                    />
                                    <DetailRow 
                                        icon={<Droplet className="w-4 h-4" />}
                                        label={safeT('crops.waterSource', 'Water Source')}
                                        value={getWaterSourceDisplay(selectedHistory.water_source)}
                                    />
                                    <DetailRow 
                                        icon={<Leaf className="w-4 h-4" />}
                                        label={safeT('crops.soilType', 'Soil Type')}
                                        value={getSoilTypeDisplay(selectedHistory.soil_type)}
                                    />
                                    <DetailRow 
                                        icon={<Thermometer className="w-4 h-4" />}
                                        label={safeT('crops.temperature', 'Temperature')}
                                        value={selectedHistory.temperature ? `${selectedHistory.temperature}°C` : 'N/A'}
                                    />
                                    <DetailRow 
                                        icon={<Target className="w-4 h-4" />}
                                        label={safeT('crops.farmingGoal', 'Farming Goal')}
                                        value={getGoalDisplay(selectedHistory.farming_goal)}
                                    />
                                    <DetailRow 
                                        icon={<Snowflake className="w-4 h-4" />}
                                        label={safeT('crops.frostRisk', 'Frost Risk')}
                                        value={getFrostRiskDisplay(selectedHistory.frost_risk)}
                                    />
                                    <DetailRow 
                                        icon={<AlertTriangle className="w-4 h-4" />}
                                        label={safeT('crops.droughtRisk', 'Drought Risk')}
                                        value={getDroughtRiskDisplay(selectedHistory.drought_risk)}
                                    />
                                    <DetailRow 
                                        icon={<Users className="w-4 h-4" />}
                                        label={safeT('crops.laborAvailability', 'Labor Availability')}
                                        value={getLaborDisplay(selectedHistory.labor_availability)}
                                    />
                                    <DetailRow 
                                        icon={<Truck className="w-4 h-4" />}
                                        label={safeT('crops.marketDistance', 'Market Distance')}
                                        value={getMarketDisplay(selectedHistory.market_distance)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Soil Test Data (if available) */}
                        {(selectedHistory.ph || selectedHistory.n || selectedHistory.p || selectedHistory.k) && (
                            <div>
                                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                                    <FlaskConical className="w-4 h-4 text-blue-600" />
                                    {safeT('crops.soilTestData', 'Soil Test Data')}
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedHistory.ph && (
                                        <DetailRow 
                                            icon={<FlaskConical className="w-4 h-4" />}
                                            label="pH"
                                            value={selectedHistory.ph}
                                        />
                                    )}
                                    {selectedHistory.n && (
                                        <DetailRow 
                                            icon={<FlaskConical className="w-4 h-4" />}
                                            label="Nitrogen (N)"
                                            value={`${selectedHistory.n} kg/ha`}
                                        />
                                    )}
                                    {selectedHistory.p && (
                                        <DetailRow 
                                            icon={<FlaskConical className="w-4 h-4" />}
                                            label="Phosphorus (P)"
                                            value={`${selectedHistory.p} kg/ha`}
                                        />
                                    )}
                                    {selectedHistory.k && (
                                        <DetailRow 
                                            icon={<FlaskConical className="w-4 h-4" />}
                                            label="Potassium (K)"
                                            value={`${selectedHistory.k} kg/ha`}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ALL RECOMMENDED CROPS - Complete List with Scores */}
                        <div>
                            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <Sprout className="w-4 h-4 text-emerald-600" />
                                {safeT('crops.recommendedCrops', 'Recommended Crops')}
                                {recommendations.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                        {recommendations.length} crops
                                    </Badge>
                                )}
                            </h4>
                            
                            {recommendations.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                    {recommendations.map((crop, index) => (
                                        <CropCard key={crop.crop_id || index} crop={crop} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <Sprout className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        {safeT('crops.noRecommendationsFound', 'No recommendations found for this request')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Summary Stats */}
                        {recommendations.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <p className="text-lg font-bold text-emerald-600">
                                            {recommendations.filter(c => c.feasibility === 'high').length}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">High</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-amber-600">
                                            {recommendations.filter(c => c.feasibility === 'medium').length}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">Medium</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-orange-600">
                                            {recommendations.filter(c => c.feasibility === 'low').length}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">Low</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <Button 
                                onClick={() => {
                                    if (loadHistoryEntry) {
                                        loadHistoryEntry(selectedHistory);
                                    }
                                    setShowDetailDialog(false);
                                }} 
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                <History className="w-4 h-4 mr-2" />
                                {safeT('crops.loadThisRequest', 'Load This Request')}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => setShowDetailDialog(false)} 
                                className="flex-1"
                            >
                                {safeT('common.close', 'Close')}
                            </Button>
                        </div>
                    </div>
                )}
            </ResponsiveDialog>
        </>
    );
};

export default RecommendationHistory;