import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { livestockService } from '../services/livestock.api';
import { useNavigate } from 'react-router-dom';

const DeleteConfirmDialog = ({ animal, isOpen, onClose }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await livestockService.deleteAnimal(animal.id);
            toast.success(t('common.success'));
            navigate('/livestock');
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-sm m-4 p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600"/>
                </div>
                <p className="text-gray-500 mb-6">
                    {t('common.deleteConfirmation')}
                </p>
                <div className="flex gap-3">
                    <Button onClick={handleDelete} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700">
                        {loading ? t('common.saving') : t('common.delete')}
                    </Button>
                    <Button variant="outline" onClick={onClose} className="flex-1">{t('common.cancel')}</Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmDialog;