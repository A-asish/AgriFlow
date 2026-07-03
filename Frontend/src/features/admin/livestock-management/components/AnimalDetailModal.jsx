// src/features/admin/livestock-management/components/AnimalDetailModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { PawPrint, Calendar, User, Baby, Heart, Syringe, Stethoscope, Milk, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/admin.api';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN');
  } catch {
    return 'N/A';
  }
};

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  if (s === 'active') return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>;
  if (s === 'sold') return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Sold</span>;
  if (s === 'dead') return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Deceased</span>;
  if (s === 'butchered') return <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Butchered</span>;
  return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{status || 'Unknown'}</span>;
};

const GenderBadge = ({ gender }) => {
  const g = gender?.toLowerCase();
  if (g === 'male') return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">Male</span>;
  if (g === 'female') return <span className="px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-600">Female</span>;
  return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Unknown</span>;
};

const AnimalDetailModal = ({ open, onClose, animalId, onUpdate }) => {
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && animalId) {
      fetchAnimalDetails();
    }
  }, [open, animalId]);

  const fetchAnimalDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getLivestockDetail(animalId);
      setAnimal(response.data);
    } catch (error) {
      console.error('Error fetching animal details:', error);
      setError('Failed to load animal details');
      toast.error('Failed to load animal details');
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

  if (error || !animal) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Error Loading Animal</h3>
            <p className="text-gray-500 mt-2">{error || 'Animal not found'}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <PawPrint className="w-6 h-6 text-emerald-600" />
            Animal Details
          </DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-center gap-6 p-6 bg-linear-to-r from-emerald-50 to-blue-50 rounded-lg">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <PawPrint className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900">{animal.name || 'Unnamed'}</h2>
              <StatusBadge status={animal.status} />
              <GenderBadge gender={animal.gender} />
              {animal.is_pregnant && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                  <Baby className="w-3 h-3" /> Pregnant
                </span>
              )}
            </div>
            <p className="text-gray-600">Tag: {animal.tag_number} | Type: {animal.animal_type_name}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><User className="w-4 h-4" />{animal.farmer_name}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Added: {formatDate(animal.created_at)}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="breeding">Breeding</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-500">Animal Type</p><p className="font-medium">{animal.animal_type_name}</p></div>
                  <div><p className="text-sm text-gray-500">Tag Number</p><p className="font-medium">{animal.tag_number}</p></div>
                  <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{animal.name || 'Unnamed'}</p></div>
                  <div><p className="text-sm text-gray-500">Gender</p><p className="font-medium capitalize">{animal.gender}</p></div>
                  <div><p className="text-sm text-gray-500">Status</p><StatusBadge status={animal.status} /></div>
                  <div><p className="text-sm text-gray-500">Pregnant</p><p className="font-medium">{animal.is_pregnant ? 'Yes' : 'No'}</p></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Birth & Age</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-500">Birth Date</p><p className="font-medium">{formatDate(animal.birth_date)}</p></div>
                  <div><p className="text-sm text-gray-500">Age</p><p className="font-medium">{animal.age_months ? `${animal.age_months} months` : 'N/A'}</p></div>
                  <div><p className="text-sm text-gray-500">Acquisition Date</p><p className="font-medium">{formatDate(animal.acquisition_date)}</p></div>
                </div>
              </CardContent>
            </Card>

            {animal.notes && (
              <Card>
                <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                <CardContent><p className="text-gray-600">{animal.notes}</p></CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Syringe className="w-5 h-5" /> Vaccinations</CardTitle></CardHeader>
              <CardContent>
                {animal.vaccinations?.length > 0 ? (
                  <div className="space-y-3">
                    {animal.vaccinations.map((v, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div><p className="font-medium">{v.vaccine_name}</p><p className="text-sm text-gray-500">By: {v.administered_by || 'Unknown'}</p></div>
                        <div className="text-right"><p className="text-sm">{formatDate(v.vaccine_date)}</p></div>
                      </div>
                    ))}
                  </div>
                ) : (<p className="text-gray-500 text-center py-4">No vaccination records</p>)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope className="w-5 h-5" /> Health Records</CardTitle></CardHeader>
              <CardContent>
                {animal.health_records?.length > 0 ? (
                  <div className="space-y-3">
                    {animal.health_records.map((r, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between"><p className="font-medium">{r.health_type}</p><p className="text-sm">{formatDate(r.treatment_date)}</p></div>
                        <p className="text-sm text-gray-600">Diagnosis: {r.diagnosis}</p>
                        {r.treatment && <p className="text-sm text-gray-600">Treatment: {r.treatment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (<p className="text-gray-500 text-center py-4">No health records</p>)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Breeding Tab */}
          <TabsContent value="breeding" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Baby className="w-5 h-5" /> Pregnancy</CardTitle></CardHeader>
              <CardContent>
                {animal.is_pregnant ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-500">Last Pregnancy</p><p className="font-medium">{formatDate(animal.last_pregnancy_date)}</p></div>
                    <div><p className="text-sm text-gray-500">Expected Birth</p><p className="font-medium">{formatDate(animal.expected_birth_date)}</p></div>
                  </div>
                ) : (<p className="text-gray-500">Not pregnant</p>)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Breeding History</CardTitle></CardHeader>
              <CardContent>
                {animal.breeding_records?.length > 0 ? (
                  <div className="space-y-3">
                    {animal.breeding_records.map((r, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">Bred: {formatDate(r.breeding_date)}</p>
                        <p className="text-sm">Successful: {r.successful ? 'Yes' : 'No'}</p>
                        {r.sire_name_display && <p className="text-sm text-gray-600">Sire: {r.sire_name_display}</p>}
                        {r.actual_birth_date && <p className="text-sm text-green-600">Born: {formatDate(r.actual_birth_date)}</p>}
                        {r.offspring_count > 0 && <p className="text-sm text-blue-600">Offspring: {r.offspring_count}</p>}
                      </div>
                    ))}
                  </div>
                ) : (<p className="text-gray-500 text-center py-4">No breeding records</p>)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Production Tab - Milk Records */}
          <TabsContent value="production" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Milk className="w-5 h-5" /> Milk Production</CardTitle></CardHeader>
              <CardContent>
                {animal.milk_records?.length > 0 ? (
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Total Milk Production</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {animal.milk_records.reduce((s, r) => s + Number(r.quantity_liters), 0)} Liters
                      </p>
                    </div>
                    <div className="space-y-2">
                      {animal.milk_records.map((r, i) => (
                        <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <div><p className="font-medium">{r.quantity_liters} Liters</p><p className="text-sm text-gray-500">{r.milk_time}</p></div>
                          <p className="text-sm text-gray-500">{formatDate(r.date)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (<p className="text-gray-500 text-center py-4">No milk records</p>)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4 pt-4 border-t">
          <button onClick={onClose} className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg">Close</button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnimalDetailModal;