// src/features/admin/crops-management/components/CropRegisterModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/admin.api';

const CropRegisterModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [farmers, setFarmers] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [formData, setFormData] = useState({
    farmer_id: '',
    crop_id: '',
    planting_date: '',
    expected_harvest_date: '',
    area_planted: '',
    area_unit: 'ropani',
  });

  useEffect(() => {
    if (open) {
      fetchFarmers();
      fetchKnowledgeBase();
    }
  }, [open]);

  const fetchFarmers = async () => {
    try {
      const response = await adminService.listFarmers({ page: 1, page_size: 100 });
      setFarmers(response.data.farmers || []);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  const fetchKnowledgeBase = async () => {
    try {
      const response = await adminService.listKnowledgeBase({ page: 1, page_size: 100 });
      setKnowledgeBase(response.data.results || []);
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.farmer_id || !formData.crop_id || !formData.planting_date || !formData.area_planted) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await adminService.registerCrop(formData);
      toast.success('Crop registered successfully');
      onSuccess?.();
      onClose();
      setFormData({
        farmer_id: '',
        crop_id: '',
        planting_date: '',
        expected_harvest_date: '',
        area_planted: '',
        area_unit: 'ropani',
      });
    } catch (error) {
      console.error('Error registering crop:', error);
      toast.error('Failed to register crop');
    } finally {
      setLoading(false);
    }
  };

  const areaUnits = [
    { value: 'ropani', label: 'Ropani' },
    { value: 'kattha', label: 'Kattha' },
    { value: 'bigha', label: 'Bigha' },
    { value: 'hectare', label: 'Hectare' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Register New Crop</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Farmer *</Label>
              <Select value={formData.farmer_id} onValueChange={(v) => handleChange('farmer_id', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select farmer" />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map(farmer => (
                    <SelectItem key={farmer.id} value={farmer.id.toString()}>
                      {farmer.full_name || farmer.username} - {farmer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Crop Type *</Label>
              <Select value={formData.crop_id} onValueChange={(v) => handleChange('crop_id', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  {knowledgeBase.map(crop => (
                    <SelectItem key={crop.id} value={crop.id.toString()}>
                      {crop.name_en} - {crop.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Planting Date *</Label>
              <Input
                type="date"
                value={formData.planting_date}
                onChange={(e) => handleChange('planting_date', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Expected Harvest Date</Label>
              <Input
                type="date"
                value={formData.expected_harvest_date}
                onChange={(e) => handleChange('expected_harvest_date', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Area Planted *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Enter area"
                value={formData.area_planted}
                onChange={(e) => handleChange('area_planted', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Area Unit</Label>
              <Select value={formData.area_unit} onValueChange={(v) => handleChange('area_unit', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {areaUnits.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Register Crop
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CropRegisterModal;