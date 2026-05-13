import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { StatCard } from '@/features/farmer/dashboard/components/StatsCard';
import { WeatherWidget } from '@/features/farmer/dashboard/components/WeatherWidget';
import { RecentActivity } from '@/features/farmer/dashboard/components/RecentActivity';
import { CropStatus } from '@/features/farmer/dashboard/components/CropStatus';
import { LivestockStatus } from '@/features/farmer/dashboard/components/LivestockStatus';
import { Wheat, Beef, TrendingUp, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { cropsService } from '@/features/farmer/crops/services/crops.api';
import { livestockService } from '@/features/farmer/livestock/services/livestock.api';
import { financeService } from '@/features/farmer/finance/services/finance.api';
const Index = () => {
    const { t } = useLanguage();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        activeCrops: 0,
        totalAnimals: 0,
        totalIncome: 0,
        totalExpense: 0,
    });
    const [crops, setCrops] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    // Helper function to format large numbers
    const formatLargeNumber = (value) => {
        if (!value || value === 0) {
            return `${t('common.rs')} 0`;
        }
        const absValue = Math.abs(value);
        if (absValue >= 10000000) {
            const croreValue = (value / 10000000).toFixed(2);
            return `${t('common.rs')} ${croreValue} Cr`;
        }
        else if (absValue >= 100000) {
            const lakhValue = (value / 100000).toFixed(1);
            return `${t('common.rs')} ${lakhValue} L`;
        }
        else if (absValue >= 10000) {
            const thousandValue = (value / 1000).toFixed(1);
            return `${t('common.rs')} ${thousandValue} K`;
        }
        else {
            return `${t('common.rs')} ${value.toLocaleString('en-IN')}`;
        }
    };
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            try {
                const [cropsRes, animalsRes, financeRes] = await Promise.all([
                    cropsService.listCrops(),
                    livestockService.listAnimals(),
                    financeService.getSummary(),
                ]);
                const activeCrops = Array.isArray(cropsRes.data) ? cropsRes.data.filter((c) => c.status === 'active') : [];
                const animalsList = Array.isArray(animalsRes.data) ? animalsRes.data : [];
                setCrops(activeCrops);
                setAnimals(animalsList);
                setStats({
                    activeCrops: activeCrops.length,
                    totalAnimals: animalsList.length,
                    totalIncome: financeRes.data?.total_income || 0,
                    totalExpense: financeRes.data?.total_expense || 0,
                });
            }
            catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated]);
    if (authLoading) {
        return (<MainLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"/>
        </div>
      </MainLayout>);
    }
    if (!isAuthenticated) {
        return (<MainLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">{t('dashboard.loginToView')}</p>
        </div>
      </MainLayout>);
    }
    return (<MainLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
      <div className="space-y-10 sm:space-y-14 lg:space-y-16 max-w-screen-2xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          <StatCard title={t('dashboard.activeCrops')} value={stats.activeCrops} subtitle={loading ? '...' : `${stats.activeCrops} ${t('dashboard.activeCrops')}`} icon={Wheat} variant="green"/>
          <StatCard title={t('dashboard.totalAnimals')} value={stats.totalAnimals} subtitle={loading ? '...' : `${stats.totalAnimals} ${t('dashboard.totalAnimals')}`} icon={Beef} variant="blue"/>
          <StatCard title={t('dashboard.totalIncome')} value={formatLargeNumber(stats.totalIncome)} icon={TrendingUp} variant="amber"/>
          <StatCard title={t('dashboard.totalExpense')} value={formatLargeNumber(stats.totalExpense)} icon={AlertTriangle} variant="rose"/>
        </div>

        {/* Weather Widget and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          <div className="lg:col-span-1">
            <WeatherWidget />
          </div>
          
          {/* Recent Activity - Takes remaining 2/3 of the space */}
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
        </div>

        {/* Crop Status and Livestock Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
          <CropStatus crops={crops} loading={loading}/>
          <LivestockStatus animals={animals} loading={loading}/>
        </div>
      </div>
    </MainLayout>);
};
export default Index;
