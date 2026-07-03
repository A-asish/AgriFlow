// src/features/admin/crops-management/components/CropDetailModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Sprout,
  MapPin,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  Package,
  Loader2,
  XCircle,
  Flower2,
} from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/admin.api';
import { cn } from "@/lib/utils";

// Helper function for date formatting
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN');
  } catch {
    return 'N/A';
  }
};

// Format currency in Rupees
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return 'Rs. 0';
  return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
};

// Stage configurations
const getStageColor = (stage) => {
  const s = stage?.toLowerCase();
  const colors = {
    'germination': 'bg-purple-500',
    'vegetative': 'bg-blue-500',
    'flowering': 'bg-pink-500',
    'maturation': 'bg-amber-500',
    'harvest': 'bg-emerald-500'
  };
  return colors[s] || 'bg-slate-200';
};

const getStageIcon = (stage) => {
  const s = stage?.toLowerCase();
  switch (s) {
    case 'harvest': return <Package className="w-5 h-5" />;
    case 'maturation': return <Flower2 className="w-5 h-5" />;
    case 'flowering': return <Flower2 className="w-5 h-5" />;
    case 'vegetative': return <Sprout className="w-5 h-5" />;
    case 'germination': return <Sprout className="w-5 h-5" />;
    default: return <Sprout className="w-5 h-5" />;
  }
};

const getStageDisplayName = (stage) => {
  const s = stage?.toLowerCase();
  const stages = {
    'germination': 'Germination',
    'vegetative': 'Vegetative',
    'flowering': 'Flowering',
    'maturation': 'Maturation',
    'harvest': 'Harvest'
  };
  return stages[s] || s || 'Unknown';
};

const getStatusColor = (status) => {
  const s = status?.toLowerCase();
  switch (s) {
    case 'active': return 'bg-green-100 text-green-700';
    case 'harvested': return 'bg-blue-100 text-blue-700';
    case 'done': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const CropDetailModal = ({ open, onClose, cropId, onUpdate }) => {
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && cropId) {
      fetchCropDetails();
    }
  }, [open, cropId]);

  const fetchCropDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getCropDetail(cropId);
      setCrop(response.data);
    } catch (error) {
      console.error('Error fetching crop details:', error);
      setError(error.response?.data?.error || 'Failed to load crop details');
      toast.error('Failed to load crop details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Error Loading Crop</h3>
            <p className="text-gray-500 mt-2">{error}</p>
            <Button onClick={fetchCropDetails} className="mt-4">
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!crop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Crop not found</h3>
            <p className="text-gray-500 mt-2">The crop you're looking for doesn't exist or has been deleted.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Get data from serializer methods
  const expenseBreakdown = crop.expense_breakdown || {};
  const harvestDetails = crop.harvest_details || { count: 0, total_quantity: 0, recent_harvests: [] };
  const yieldAnalysis = crop.yield_analysis || { expected_yield: 0, actual_yield: 0, achievement_percentage: 0 };
  const growthTimeline = crop.growth_timeline || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
            Crop Details
          </DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-center gap-6 p-6 bg-linear-to-r from-emerald-50 to-green-50 rounded-lg">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg ${getStageColor(crop.growth_stage)}`}>
            {getStageIcon(crop.growth_stage)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900">{crop.name}</h2>
              <Badge className={getStatusColor(crop.status)}>{crop.status}</Badge>
              <Badge className="bg-purple-100 text-purple-700">
                {getStageDisplayName(crop.growth_stage)}
              </Badge>
            </div>
            <p className="text-gray-600">{crop.variety || 'Standard Variety'}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{crop.farmer_info?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{crop.field_name || 'No field name'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Planted: {formatDate(crop.planting_date)}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="harvest">Harvest</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Crop Name</p>
                    <p className="font-medium">{crop.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Variety</p>
                    <p className="font-medium">{crop.variety || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Growth Stage</p>
                    <p className="font-medium">{getStageDisplayName(crop.growth_stage)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium capitalize">{crop.status || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Field Name</p>
                    <p className="font-medium">{crop.field_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Field Area</p>
                    <p className="font-medium">{crop.field_area} {crop.area_unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Irrigated</p>
                    <p className="font-medium">{crop.is_irrigated ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Soil Type</p>
                    <p className="font-medium">{crop.soil_type || '-'}</p>
                  </div>
                  {crop.notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="font-medium">{crop.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Planting Date</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{formatDate(crop.planting_date)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected Harvest Date</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{formatDate(crop.expected_harvest_date) || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(crop.total_income)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Total Expense</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(expenseBreakdown.total || crop.total_expense)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Net Profit</p>
                    <p className={`text-2xl font-bold ${(crop.net_profit || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {formatCurrency(crop.net_profit)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Fertilizers</span>
                    <span className="font-medium">{formatCurrency(expenseBreakdown.fertilizers)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Pesticides</span>
                    <span className="font-medium">{formatCurrency(expenseBreakdown.pesticides)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Labor</span>
                    <span className="font-medium">{formatCurrency(expenseBreakdown.labor)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Other Expenses</span>
                    <span className="font-medium">{formatCurrency(expenseBreakdown.other)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 font-bold">
                    <span>Total Expenses</span>
                    <span className="text-lg">{formatCurrency(expenseBreakdown.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="harvest" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Harvest Information</CardTitle>
              </CardHeader>
              <CardContent>
                {harvestDetails.count > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Total Harvests</p>
                        <p className="text-2xl font-bold text-emerald-600">{harvestDetails.count}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Total Quantity</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {harvestDetails.total_quantity} kg
                        </p>
                      </div>
                    </div>
                    
                    {harvestDetails.recent_harvests && harvestDetails.recent_harvests.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-3">Recent Harvests</p>
                        <div className="space-y-2">
                          {harvestDetails.recent_harvests.map((harvest, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{harvest.quantity} {harvest.unit || 'kg'}</p>
                                <p className="text-sm text-gray-500">Quality: {harvest.quality}</p>
                              </div>
                              <p className="text-sm text-gray-500">{formatDate(harvest.date)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No harvest records yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {yieldAnalysis.expected_yield > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Yield Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Expected Yield</span>
                      <span className="font-medium">{yieldAnalysis.expected_yield} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Actual Yield</span>
                      <span className="font-medium">{yieldAnalysis.actual_yield} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Achievement</span>
                      <span className={`font-medium ${yieldAnalysis.achievement_percentage >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {yieldAnalysis.achievement_percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(yieldAnalysis.achievement_percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Growth Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {growthTimeline && growthTimeline.length > 0 ? (
                  <div className="space-y-4">
                    {growthTimeline.map((stage, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${
                          stage.status === 'completed' ? 'bg-emerald-500' :
                          stage.status === 'current' ? getStageColor(stage.stage) : 'bg-gray-200'
                        }`}>
                          {stage.status === 'completed' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : stage.status === 'current' ? (
                            getStageIcon(stage.stage)
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">
                            {stage.stage_display || getStageDisplayName(stage.stage)}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {stage.status === 'completed' ? '✓ Completed' :
                             stage.status === 'current' ? '🔄 In Progress' : '⏳ Upcoming'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No timeline data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CropDetailModal;