import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, Edit2, RefreshCw, Trash2, HeartPulse, DollarSign, Archive, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const LivestockHeader = ({ animal, isActive, onEdit, onStatusChange, onDelete }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const getStatusIcon = () => {
        if (isActive) return <HeartPulse className="w-4 h-4"/>;
        if (animal?.status === 'sold') return <DollarSign className="w-4 h-4"/>;
        if (animal?.status === 'dead') return <AlertCircle className="w-4 h-4"/>;
        if (animal?.status === 'butchered') return <Archive className="w-4 h-4"/>;
        return <Info className="w-4 h-4"/>;
    };

    const getStatusBadgeClass = () => {
        if (isActive) return 'bg-green-100 text-green-700';
        if (animal?.status === 'sold') return 'bg-gray-100 text-gray-700';
        if (animal?.status === 'dead') return 'bg-red-100 text-red-700';
        if (animal?.status === 'butchered') return 'bg-orange-100 text-orange-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="flex items-center justify-between flex-wrap gap-3">
            <Button variant="ghost" onClick={() => navigate('/livestock')} className="rounded-xl gap-2 px-0 hover:bg-transparent">
                <ChevronLeft className="w-4 h-4"/> {t('common.backToLivestock')}
            </Button>
            
            <div className="flex gap-2">
                <div className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 ${getStatusBadgeClass()}`}>
                    {getStatusIcon()}
                    <span className="capitalize">{animal?.status}</span>
                </div>
                
                {isActive && (
                    <>
                        <Button variant="outline" size="sm" onClick={onEdit} className="rounded-xl gap-2">
                            <Edit2 className="w-4 h-4"/> {t('common.edit')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={onStatusChange} className="rounded-xl gap-2">
                            <RefreshCw className="w-4 h-4"/> {t('common.changeStatus')}
                        </Button>
                    </>
                )}
                
                <Button variant="outline" size="sm" onClick={onDelete} className="rounded-xl gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4"/> {t('common.delete')}
                </Button>
            </div>
        </div>
    );
};

export default LivestockHeader;