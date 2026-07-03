// src/features/farmer/crops/components/RecommendationResults.jsx

import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Sprout, TrendingUp, Eye } from 'lucide-react';
import RecommendationCard from './RecommendationCard';
import CropDetailModal from './CropDetailModal';
import { cropsService } from '@/features/farmer/crops/services/crops.api';

const RecommendationResults = ({ recommendation, language, t }) => {
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [cropDetails, setCropDetails] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const handleViewDetails = async (crop) => {
        setSelectedCrop(crop);
        setModalOpen(true);
        setLoadingDetails(true);
        
        try {
            const response = await cropsService.searchKnowledgeBase(crop.crop_name);
            let fullCropData = null;
            const data = response.data;
            
            if (data?.results && Array.isArray(data.results) && data.results.length > 0) {
                fullCropData = data.results.find(item => 
                    item.name_en?.toLowerCase() === crop.crop_name?.toLowerCase()
                );
            } else if (Array.isArray(data) && data.length > 0) {
                fullCropData = data.find(item => 
                    item.name_en?.toLowerCase() === crop.crop_name?.toLowerCase()
                );
            } else if (data && typeof data === 'object' && data.name_en) {
                fullCropData = data;
            }
            
            if (fullCropData) {
                setCropDetails({
                    ...fullCropData,
                    confidence: crop.confidence,
                    feasibility: crop.feasibility,
                    explanation: crop.explanation,
                    actionable_advice: crop.actionable_advice,
                    factor_scores: crop.factor_scores,
                    npk_status: crop.npk_status,
                });
            } else {
                setCropDetails(crop);
            }
        } catch (error) {
            console.error('Error fetching crop details:', error);
            setCropDetails(crop);
        } finally {
            setLoadingDetails(false);
        }
    };

    // No recommendations found - Simple and friendly message
    if (!recommendation || !recommendation.recommendations || recommendation.recommendations.length === 0) {
        return (
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                            <Sprout className="w-8 h-8 text-amber-500" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {t?.('crops.sorryMessage') || 'Sorry, No Recommendations Available'}
                        </h3>
                        
                        <p className="text-sm text-gray-500 mb-3">
                            {t?.('crops.unableToRecommend') || "We're unable to provide crop recommendations for your current farm conditions."}
                        </p>
                        
                        <p className="text-sm text-gray-500 mb-4">
                            {t?.('crops.possibleReasons') || 'This might be because your inputs are outside typical ranges, or we need more information about your farm.'}
                        </p>
                        
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-600">
                                {t?.('crops.futureImprovement') || "We're constantly improving our system. Please try adjusting your inputs or check back later for better recommendations."}
                            </p>
                        </div>
                        
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                        >
                            ↑ {t?.('crops.adjustInputs') || 'Adjust your inputs'}
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-lg rounded-2xl bg-emerald-50">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-black text-emerald-600">{recommendation.summary?.possible_count || 0}</p>
                        <p className="text-[10px] font-bold text-emerald-700 uppercase">{t?.('crops.possibleCrops') || 'Possible Crops'}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg rounded-2xl bg-green-50">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-black text-green-600">{recommendation.summary?.high_feasibility || 0}</p>
                        <p className="text-[10px] font-bold text-green-700 uppercase">{t?.('crops.highFeasibility') || 'High Feasibility'}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg rounded-2xl bg-amber-50">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-black text-amber-600">{recommendation.summary?.medium_feasibility || 0}</p>
                        <p className="text-[10px] font-bold text-amber-700 uppercase">{t?.('crops.mediumFeasibility') || 'Medium Feasibility'}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg rounded-2xl bg-red-50">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-black text-red-600">{recommendation.summary?.low_feasibility || 0}</p>
                        <p className="text-[10px] font-bold text-red-700 uppercase">{t?.('crops.lowFeasibility') || 'Low Feasibility'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Best Crop Highlight */}
            {recommendation.summary?.best_crop && (
                <Card 
                    className="border-0 shadow-xl rounded-2xl bg-linear-to-r from-emerald-500 to-green-500 text-white cursor-pointer hover:shadow-2xl transition-all duration-300"
                    onClick={() => handleViewDetails(recommendation.recommendations[0])}
                >
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-wider">{t?.('crops.topRecommendation') || 'Top Recommendation'}</p>
                                <p className="text-2xl font-black mt-1">{recommendation.summary.best_crop}</p>
                                <p className="text-sm opacity-90 mt-1">{recommendation.summary.best_confidence}% {t?.('crops.confidence') || 'confidence'}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-white/20">
                                <Eye className="w-8 h-8" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recommended Crops Grid */}
            <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">{t?.('crops.recommendedCrops') || 'Recommended Crops'}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {recommendation.recommendations.map((crop, index) => (
                    <RecommendationCard
                        key={crop.crop_id || index}
                        crop={crop}
                        index={index}
                        language={language}
                        onViewDetails={handleViewDetails}
                        t={t}
                    />
                ))}
            </div>

            {/* Crop Detail Modal */}
            <CropDetailModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedCrop(null);
                    setCropDetails(null);
                }}
                crop={selectedCrop}
                cropDetails={cropDetails}
                loading={loadingDetails}
                language={language}
                t={t}
            />
        </div>
    );
};

export default RecommendationResults;