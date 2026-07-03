// src/features/farmer/crops/components/CropDetailModal.jsx

import React, { useState } from 'react';
import { ResponsiveDialog } from '@/shared/components/ui/ResponsiveDialog';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { 
    Sprout, Thermometer, Droplet, CloudRain, 
    Calendar, MapPin, Tractor, AlertOctagon, 
    Snowflake, TrendingUp, CheckCircle, AlertTriangle,
    XCircle, Info, ThumbsUp, AlertCircle, Ban,
    Flower2, Leaf, Droplets as DropletsIcon,
    ChevronDown, ChevronUp, Calculator, 
    Plus, Minus, Equal, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

// Utility function to round to 1 decimal place (fixes floating point errors)
const round = (num) => {
    if (num === undefined || num === null) return 0;
    return Math.round(num * 10) / 10;
};

const CropDetailModal = ({ isOpen, onClose, crop, cropDetails, loading }) => {
    const { t, language } = useLanguage();
    const [showFullCalculation, setShowFullCalculation] = useState(false);
    
    const data = cropDetails || crop;
    if (!data) return null;

    // ========== SAFE CONFIDENCE CALCULATION ==========
    let confidenceValue = crop?.confidence || cropData?.confidence || 0;
    if (confidenceValue > 1) confidenceValue = confidenceValue / 100;
    confidenceValue = Math.min(0.95, Math.max(0, confidenceValue));
    const finalConfidencePercent = confidenceValue * 100;
    const roundedConfidence = Math.round(finalConfidencePercent);
    // =================================================

    const MAX_SCORES = {
        season: 30, region: 20, soil: 15, temperature: 15, water: 10, ph: 10, npk_bonus: 10,
    };

    // Get individual scores
    const seasonScore = data?.factor_scores?.season || 0;
    const regionScore = data?.factor_scores?.region || 0;
    const soilScore = data?.factor_scores?.soil || 0;
    const tempScore = data?.factor_scores?.temperature || 0;
    const waterScore = data?.factor_scores?.water || 0;
    const phScore = data?.factor_scores?.ph || 0;
    const npkBonus = data?.factor_scores?.npk_bonus || 0;
    const ruleAdjustment = data?.factor_scores?.rule_adjustment || 0;
    const penalties = data?.factor_scores?.penalties || 0;
    const certaintyFactor = data?.factor_scores?.certainty_factor || 1.0;
    const goalBonus = 20; // Subsistence + Pulse = +20
    
    // Calculate totals with rounding
    const baseTotal = round(seasonScore + regionScore + soilScore + tempScore + waterScore + phScore + Math.max(0, npkBonus));
    const afterPenalties = round(baseTotal - penalties);
    const withRuleAdjustment = round(afterPenalties + ruleAdjustment);
    const withGoalBonus = round(withRuleAdjustment + goalBonus);
    
    // Apply diminishing returns cap
    let afterCap = withGoalBonus;
    let capApplied = false;
    let excess = 0;
    let diminishingReturn = 0;
    
    if (withGoalBonus > 92) {
        excess = round(withGoalBonus - 92);
        diminishingReturn = round(excess * 0.2);
        afterCap = round(92 + diminishingReturn);
        capApplied = 'high';
    } else if (withGoalBonus > 85) {
        excess = round(withGoalBonus - 85);
        diminishingReturn = round(excess * 0.5);
        afterCap = round(85 + diminishingReturn);
        capApplied = 'medium';
    }
    
    // Apply certainty factor
    const finalCalculated = round(afterCap * certaintyFactor);
    const finalTotal = Math.min(100, finalCalculated);

    const getScoreColor = (score, maxScore) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 80) return 'text-emerald-600';
        if (percentage >= 60) return 'text-amber-600';
        if (percentage >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const getFeasibilityConfig = (feasibility) => {
        const configs = {
            high: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: t('crops.feasibilityHigh') || 'Excellent' },
            medium: { icon: Info, color: 'text-amber-600', bg: 'bg-amber-50', label: t('crops.feasibilityMedium') || 'Good' },
            low: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', label: t('crops.feasibilityLow') || 'Moderate' },
        };
        return configs[feasibility] || { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: t('crops.feasibilityPoor') || 'Poor' };
    };

    const getNpkStatusConfig = (status) => {
        const configs = {
            'Perfect': { color: 'bg-emerald-100 text-emerald-700', icon: ThumbsUp, label: t('crops.npkPerfect') || 'Perfect' },
            'Fits': { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: t('crops.npkFits') || 'Fits' },
            'Low': { color: 'bg-amber-100 text-amber-700', icon: AlertTriangle, label: t('crops.npkLow') || 'Low' },
            'Very Low': { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: t('crops.npkVeryLow') || 'Very Low' },
            'High': { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle, label: t('crops.npkHigh') || 'High' },
            'Very High': { color: 'bg-red-100 text-red-700', icon: Ban, label: t('crops.npkVeryHigh') || 'Very High' },
            'Unknown': { color: 'bg-gray-100 text-gray-700', icon: Info, label: t('crops.npkUnknown') || 'Unknown' }
        };
        return configs[status] || configs['Unknown'];
    };

    const DetailRow = ({ icon, label, value, suffix = '' }) => (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">
                    {value && value !== 'N/A' && value !== 'null' && value !== '' 
                        ? `${value}${suffix}` : t('common.notAvailable') || 'Not specified'}
                </p>
            </div>
        </div>
    );

    const NPKSection = ({ label, value, status }) => {
        const config = getNpkStatusConfig(status);
        const Icon = config.icon;
        return (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold w-6">{label}</span>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', config.color)}>
                        <Icon className="w-3 h-3 inline mr-1" />
                        {config.label}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground max-w-[60%] text-right">{value || t('crops.noSoilTestData') || 'No data'}</p>
            </div>
        );
    };

    const ScoreRow = ({ label, obtained, maxScore, note = '' }) => {
        const percentage = maxScore > 0 ? (obtained / maxScore) * 100 : 0;
        return (
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="capitalize text-muted-foreground">{label}</span>
                    {note && <span className="text-[10px] text-muted-foreground italic">({note})</span>}
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-1.5">
                        <div className={cn('h-1.5 rounded-full', getScoreColor(obtained, maxScore))} 
                             style={{ width: `${Math.min(100, percentage)}%` }} />
                    </div>
                    <span className={cn("font-bold w-12 text-right", getScoreColor(obtained, maxScore))}>
                        {Math.round(obtained)}/{maxScore}
                    </span>
                </div>
            </div>
        );
    };

    const CalculationLine = ({ label, value, operator = '+', isPositive = true, isSubtotal = false, isFinal = false }) => {
        const roundedValue = round(value);
        return (
            <div className={cn(
                "flex items-center justify-between py-2",
                isSubtotal && "border-t border-gray-200 mt-1 pt-2",
                isFinal && "bg-emerald-50 rounded-lg p-3 mt-2"
            )}>
                <div className="flex items-center gap-2">
                    {operator === '+' && <Plus className="w-3 h-3 text-emerald-600" />}
                    {operator === '-' && <Minus className="w-3 h-3 text-red-600" />}
                    {operator === '=' && <Equal className="w-3 h-3 text-blue-600" />}
                    {operator === '→' && <ArrowRight className="w-3 h-3 text-purple-600" />}
                    {operator === '×' && <span className="text-sm text-purple-600">×</span>}
                    <span className={cn("text-sm", isFinal && "font-bold")}>{label}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className={cn(
                        "font-mono text-sm",
                        isPositive || roundedValue > 0 ? "text-emerald-600" : "text-red-600",
                        isFinal && "text-lg font-bold text-emerald-700"
                    )}>
                        {operator === '×' ? `× ${roundedValue.toFixed(2)}` : (roundedValue >= 0 ? `+ ${roundedValue}` : `- ${Math.abs(roundedValue)}`)}
                    </span>
                    {!isFinal && operator !== '×' && <span className="text-muted-foreground text-xs">{t('finance.points') || 'pts'}</span>}
                </div>
            </div>
        );
    };

    const config = getFeasibilityConfig(data?.feasibility);
    const FeasibilityIcon = config.icon;
    const cropName = language === 'np' ? (data?.name_np || data?.crop_name_np) : (data?.name_en || data?.crop_name);

    return (
        <ResponsiveDialog isOpen={isOpen} onClose={onClose} title="" maxWidth="lg">
            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            ) : (
                <div className="space-y-4 max-h-[80vh] overflow-y-auto px-1">
                    {/* Header */}
                    <div className="text-center border-b pb-4">
                        <h2 className="text-2xl font-bold">{cropName}</h2>
                        {data?.feasibility && (
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className={cn('flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
                                    <FeasibilityIcon className="w-3 h-3" />
                                    {config.label}
                                </div>
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    <TrendingUp className="w-3 h-3" />
                                    {roundedConfidence}%
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {data?.explanation?.summary && (
                        <Card className="border-0 shadow-sm rounded-xl bg-linear-to-r from-emerald-50 to-green-50">
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">{data.explanation.summary}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Growth Requirements */}
                    <div>
                        <h3 className="text-md font-bold mb-3 flex items-center gap-2">
                            <Sprout className="w-4 h-4 text-emerald-600" />
                            {t('crops.growthRequirements') || 'Growth Requirements'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <DetailRow icon={<Thermometer className="w-4 h-4 text-orange-500" />} 
                                label={t('crops.temperatureRange') || 'Temperature Range'} 
                                value={data?.temp_min && data?.temp_max ? `${data.temp_min}°C - ${data.temp_max}°C` : null} />
                            <DetailRow icon={<Droplet className="w-4 h-4 text-blue-500" />} 
                                label={t('crops.waterRequirement') || 'Water Requirement'} 
                                value={data?.water_req} />
                            <DetailRow icon={<CloudRain className="w-4 h-4 text-cyan-500" />} 
                                label={t('crops.droughtTolerance') || 'Drought Tolerance'} 
                                value={data?.drought_tolerance} />
                            <DetailRow icon={<Snowflake className="w-4 h-4 text-sky-500" />} 
                                label={t('crops.frostSensitivity') || 'Frost Sensitivity'} 
                                value={data?.frost_sensitive} />
                            <DetailRow icon={<MapPin className="w-4 h-4 text-purple-500" />} 
                                label={t('crops.soilPreference') || 'Soil Preference'} 
                                value={data?.soil_ideal} />
                            <DetailRow icon={<Calendar className="w-4 h-4 text-green-500" />} 
                                label={t('crops.bestSeason') || 'Best Season'} 
                                value={data?.best_season} />
                            <DetailRow icon={<Tractor className="w-4 h-4 text-amber-500" />} 
                                label={t('crops.laborRequirement') || 'Labor Requirement'} 
                                value={data?.labor_req} />
                            <DetailRow icon={<AlertOctagon className="w-4 h-4 text-red-500" />} 
                                label={t('crops.storageLife') || 'Storage Life'} 
                                value={data?.storage_life} />
                            <DetailRow icon={<Leaf className="w-4 h-4 text-emerald-500" />} 
                                label={t('crops.phRange') || 'pH Range'} 
                                value={data?.ph_min && data?.ph_max ? `${data.ph_min} - ${data.ph_max}` : null} />
                            <DetailRow icon={<Flower2 className="w-4 h-4 text-pink-500" />} 
                                label={t('crops.category') || 'Category'} 
                                value={data?.category} />
                        </div>
                    </div>

                    {/* NPK Analysis */}
                    {data?.npk_status && (
                        <div>
                            <h3 className="text-md font-bold mb-3 flex items-center gap-2">
                                <DropletsIcon className="w-4 h-4 text-blue-600" />
                                {t('crops.npkAnalysis') || 'NPK Analysis'}
                            </h3>
                            <div className="space-y-2">
                                <NPKSection label="N" value={data.npk_status.nitrogen?.message} status={data.npk_status.nitrogen?.status} />
                                <NPKSection label="P" value={data.npk_status.phosphorus?.message} status={data.npk_status.phosphorus?.status} />
                                <NPKSection label="K" value={data.npk_status.potassium?.message} status={data.npk_status.potassium?.status} />
                            </div>
                        </div>
                    )}

                    {/* Strengths */}
                    {data?.explanation?.strengths?.length > 0 && (
                        <div>
                            <h3 className="text-md font-bold mb-3 flex items-center gap-2 text-emerald-600">
                                <CheckCircle className="w-4 h-4" />
                                {t('crops.strengths') || 'Strengths'}
                            </h3>
                            <div className="space-y-1">
                                {data.explanation.strengths.slice(0, 5).map((s, i) => (
                                    <p key={i} className="text-sm text-emerald-600 flex items-start gap-2">
                                        <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                        {s.reason}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actionable Advice */}
                    {data?.actionable_advice?.length > 0 && (
                        <div>
                            <h3 className="text-md font-bold mb-3 flex items-center gap-2 text-blue-600">
                                <Info className="w-4 h-4" />
                                {t('crops.actionableAdvice') || 'Actionable Advice'}
                            </h3>
                            <div className="space-y-2">
                                {data.actionable_advice.slice(0, 4).map((advice, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-blue-50">
                                        <p className="text-sm text-blue-700">💡 {advice}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Score Breakdown */}
                    <div>
                        <button 
                            onClick={() => setShowFullCalculation(!showFullCalculation)}
                            className="flex items-center justify-between w-full mb-3 group"
                        >
                            <div className="flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-purple-600" />
                                <h3 className="text-md font-bold">{t('crops.scoreBreakdown') || 'Score Breakdown'}</h3>
                            </div>
                            {showFullCalculation ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            )}
                        </button>

                        {/* Simple View */}
                        {!showFullCalculation && (
                            <div className="space-y-2">
                                <ScoreRow label={t('crops.season') || 'Season'} obtained={seasonScore} maxScore={MAX_SCORES.season} 
                                    note={seasonScore === 30 ? t('crops.best') : seasonScore === 15 ? t('crops.alternative') : ''} />
                                <ScoreRow label={t('crops.region') || 'Region'} obtained={regionScore} maxScore={MAX_SCORES.region} 
                                    note={regionScore === 20 ? t('crops.suitable') : ''} />
                                <ScoreRow label={t('crops.soil') || 'Soil'} obtained={soilScore} maxScore={MAX_SCORES.soil} 
                                    note={soilScore === 15 ? t('crops.ideal') : soilScore === 8 ? t('crops.acceptable') : ''} />
                                <ScoreRow label={t('crops.temperature') || 'Temperature'} obtained={tempScore} maxScore={MAX_SCORES.temperature} />
                                <ScoreRow label={t('crops.water') || 'Water'} obtained={waterScore} maxScore={MAX_SCORES.water} 
                                    note={waterScore === 10 ? t('crops.irrigated') : waterScore > 0 ? t('crops.rainfed') : ''} />
                                <ScoreRow label="pH" obtained={phScore} maxScore={MAX_SCORES.ph} />
                                <ScoreRow label={t('crops.npkBonus') || 'NPK Bonus'} obtained={Math.max(0, npkBonus)} maxScore={MAX_SCORES.npk_bonus} />
                                
                                {ruleAdjustment !== 0 && (
                                    <div className="flex items-center justify-between text-sm pt-1">
                                        <span className="text-muted-foreground">{t('crops.ruleAdjustments') || 'Rule Adjustments'}</span>
                                        <span className={cn("font-bold", ruleAdjustment > 0 ? "text-emerald-600" : "text-red-600")}>
                                            {ruleAdjustment > 0 ? `+${ruleAdjustment}` : ruleAdjustment}
                                        </span>
                                    </div>
                                )}
                                
                                {penalties > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{t('crops.penalties') || 'Penalties'}</span>
                                        <span className="font-bold text-red-600">-{penalties}</span>
                                    </div>
                                )}
                                
                                <div className="pt-3 mt-2 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">{t('crops.finalScore') || 'Final Score'}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${roundedConfidence}%` }} />
                                            </div>
                                            <span className="font-bold text-emerald-600 text-lg">{roundedConfidence}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Full Calculation View */}
                        {showFullCalculation && (
                            <div className="space-y-0 rounded-xl border bg-white p-4">
                                <h4 className="text-sm font-bold mb-4 pb-2 border-b">{t('crops.calculationFormula') || 'Calculation Formula'}</h4>
                                
                                {/* Base Scores */}
                                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                                    <CalculationLine label={t('crops.season') || 'Season'} value={seasonScore} />
                                    <CalculationLine label={t('crops.region') || 'Region'} value={regionScore} />
                                    <CalculationLine label={t('crops.soil') || 'Soil'} value={soilScore} />
                                    <CalculationLine label={t('crops.temperature') || 'Temperature'} value={tempScore} />
                                    <CalculationLine label={t('crops.water') || 'Water'} value={waterScore} />
                                    <CalculationLine label="pH" value={phScore} />
                                    <CalculationLine label={t('crops.npkBonus') || 'NPK Bonus'} value={Math.max(0, npkBonus)} />
                                    <CalculationLine label={t('crops.baseTotal') || 'Base Total'} value={baseTotal} operator="=" isSubtotal />
                                </div>

                                {/* Penalties */}
                                {penalties > 0 && (
                                    <div className="bg-red-50 rounded-lg p-3 mb-2">
                                        <CalculationLine label={t('crops.totalPenalties') || 'Total Penalties'} value={-penalties} operator="-" isPositive={false} />
                                        <CalculationLine label={t('crops.afterPenalties') || 'After Penalties'} value={afterPenalties} operator="=" isSubtotal />
                                    </div>
                                )}

                                {/* Rule Adjustments */}
                                {ruleAdjustment !== 0 && (
                                    <div className="bg-amber-50 rounded-lg p-3 mb-2">
                                        <CalculationLine label={t('crops.ruleAdjustments') || 'Rule Adjustments'} value={ruleAdjustment} operator="+" />
                                        <CalculationLine label={t('crops.afterRules') || 'After Rules'} value={withRuleAdjustment} operator="=" isSubtotal />
                                    </div>
                                )}

                                {/* Goal Bonus */}
                                <div className="bg-emerald-50 rounded-lg p-3 mb-2">
                                    <CalculationLine label={`${t('crops.goalBonus') || 'Goal Bonus'} (${t('crops.subsistence') || 'Subsistence'} + ${t('crops.pulse') || 'Pulse'})`} value={goalBonus} operator="+" />
                                    <CalculationLine label={t('crops.beforeCap') || 'Before Cap'} value={withGoalBonus} operator="=" isSubtotal />
                                </div>

                                {/* Diminishing Returns Cap */}
                                {capApplied === 'high' && (
                                    <div className="bg-blue-50 rounded-lg p-3 mb-2">
                                        <CalculationLine label={`${t('crops.excessAbove') || 'Excess above'} 92`} value={excess} operator="→" />
                                        <CalculationLine label={`${t('crops.diminishingReturns') || 'Diminishing returns'} (20%)`} value={diminishingReturn} operator="→" />
                                        <CalculationLine label={`${t('crops.finalScore') || 'Final Score'} = 92 + ${excess} × 20%`} value={afterCap} operator="=" isSubtotal />
                                    </div>
                                )}
                                
                                {capApplied === 'medium' && (
                                    <div className="bg-blue-50 rounded-lg p-3 mb-2">
                                        <CalculationLine label={`${t('crops.excessAbove') || 'Excess above'} 85`} value={excess} operator="→" />
                                        <CalculationLine label={`${t('crops.diminishingReturns') || 'Diminishing returns'} (50%)`} value={diminishingReturn} operator="→" />
                                        <CalculationLine label={`${t('crops.finalScore') || 'Final Score'} = 85 + ${excess} × 50%`} value={afterCap} operator="=" isSubtotal />
                                    </div>
                                )}

                                {/* Certainty Factor */}
                                {certaintyFactor !== 1.0 && (
                                    <div className="bg-purple-50 rounded-lg p-3 mt-2">
                                        <CalculationLine label={t('crops.certaintyFactor') || 'Certainty Factor'} value={certaintyFactor} operator="×" />
                                        <CalculationLine label={`${t('crops.finalConfidence') || 'FINAL CONFIDENCE'}`} value={roundedConfidence} operator="=" isFinal />
                                    </div>
                                )}

                                {certaintyFactor === 1.0 && (
                                    <CalculationLine label={`🎯 ${t('crops.finalConfidence') || 'FINAL CONFIDENCE'}`} value={roundedConfidence} operator="=" isFinal />
                                )}

                                <p className="text-[10px] text-muted-foreground text-center mt-3">
                                    * {t('crops.scoreCapExplanation') || 'Maximum score capped at 92 with diminishing returns, then max 95%'}
                                </p>
                            </div>
                        )}
                    </div>

                    <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        {t('common.close') || 'Close'}
                    </Button>
                </div>
            )}
        </ResponsiveDialog>
    );
};

export default CropDetailModal;