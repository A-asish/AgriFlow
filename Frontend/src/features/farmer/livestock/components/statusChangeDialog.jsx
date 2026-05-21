import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { livestockService } from '../services/livestock.api';

const StatusChangeDialog = ({ animal, isOpen, onClose, onRefresh }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');

    const getStatusOptions = () => {
        return [
            { value: 'sold', label: t('livestock.statusSold'), color: 'gray' },
            { value: 'dead', label: t('livestock.statusDead'), color: 'red' },
            { value: 'butchered', label: t('livestock.statusButchered'), color: 'orange' },
        ];
    };

    const handleSubmit = async () => {
        if (!selectedStatus) return;
        
        setLoading(true);
        try {
            await livestockService.updateAnimal(animal.id, { status: selectedStatus });
            toast.success(t('common.success'));
            onRefresh();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-sm m-4 p-6">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                        <RefreshCw className="h-6 w-6 text-gray-600"/>
                    </div>
                    <p className="text-gray-600 mb-4">
                        {t('livestock.currentStatus')}: <span className="font-bold capitalize">{animal?.status}</span>
                    </p>
                    
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="rounded-xl h-11">
                            <SelectValue placeholder={t('common.selectStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            {getStatusOptions().map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedStatus === 'sold' && (
                        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mt-4">
                            ⚠️ {t('livestock.statusSold')}
                        </p>
                    )}
                    {selectedStatus === 'dead' && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-4">
                            ⚠️ {t('livestock.statusDead')}
                        </p>
                    )}
                    {selectedStatus === 'butchered' && (
                        <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg mt-4">
                            ⚠️ {t('livestock.statusButchered')}
                        </p>
                    )}
                </div>
                
                <div className="flex gap-3 mt-6">
                    <Button onClick={handleSubmit} disabled={loading || !selectedStatus} className="flex-1 bg-amber-600">
                        {loading ? t('common.saving') : t('common.save')}
                    </Button>
                    <Button variant="outline" onClick={onClose} className="flex-1">{t('common.cancel')}</Button>
                </div>
            </div>
        </div>
    );
};

export default StatusChangeDialog;