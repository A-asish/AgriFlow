import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Eye, CheckCircle, Info, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const RecommendationCard = ({ crop, index, language, onViewDetails, t }) => {
    const getFeasibilityConfig = (feasibility) => {
        const configs = {
            high: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', scoreColor: 'bg-emerald-500', label: t('crops.feasibilityHigh') || 'Excellent' },
            medium: { icon: Info, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', scoreColor: 'bg-amber-500', label: t('crops.feasibilityMedium') || 'Good' },
            low: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', scoreColor: 'bg-orange-500', label: t('crops.feasibilityLow') || 'Moderate' },
        };
        return configs[feasibility] || { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', scoreColor: 'bg-red-500', label: t('crops.feasibilityPoor') || 'Poor' };
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'text-emerald-600';
        if (score >= 50) return 'text-amber-600';
        if (score >= 30) return 'text-orange-600';
        return 'text-red-600';
    };

    const config = getFeasibilityConfig(crop.feasibility);
    const Icon = config.icon;

    return (
        <Card className={cn('border-0 shadow-xl rounded-2xl overflow-hidden border-l-4 cursor-pointer hover:shadow-2xl transition-all duration-300', config.border)}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h4 className="font-bold text-lg">
                            {language === 'np' && crop.crop_name_np ? crop.crop_name_np : crop.crop_name}
                        </h4>
                        <p className="text-xs text-muted-foreground capitalize">{crop.feasibility} {t('crops.feasibilityScore')?.toLowerCase() || 'feasibility'}</p>
                    </div>
                    <div className="flex gap-2">
                        <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
                            <Icon className="w-3 h-3" />
                            {crop.confidence}%
                        </div>
                        <button 
                            onClick={() => onViewDetails(crop)}
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            title="View Details"
                        >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {crop.explanation?.summary || `${crop.crop_name} is suitable for your farm conditions.`}
                </p>

                {/* Actionable Advice Preview */}
                {crop.actionable_advice && crop.actionable_advice.length > 0 && (
                    <div className="mb-3 p-2 rounded-lg bg-amber-50">
                        <p className="text-xs text-amber-600 truncate">
                            💡 {crop.actionable_advice[0]}
                        </p>
                    </div>
                )}

                {/* Score Bar */}
                <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span>{t('crops.feasibilityScore') || 'Feasibility Score'}</span>
                        <span className={getScoreColor(crop.confidence)}>{crop.confidence}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', config.scoreColor)} style={{ width: `${crop.confidence}%` }} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default RecommendationCard;