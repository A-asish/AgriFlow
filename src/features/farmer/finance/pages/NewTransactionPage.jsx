import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, Save, X, Sprout, Beef } from 'lucide-react';
// Transaction type options based on Django model
const TRANSACTION_TYPES = [
    { value: 'crop_income', labelKey: 'finance.cropIncome', icon: Sprout, type: 'income', group: 'crop' },
    { value: 'crop_expense', labelKey: 'finance.cropExpense', icon: Sprout, type: 'expense', group: 'crop' },
    { value: 'animal_income', labelKey: 'finance.animalIncome', icon: Beef, type: 'income', group: 'animal' },
    { value: 'animal_expense', labelKey: 'finance.animalExpense', icon: Beef, type: 'expense', group: 'animal' },
];
// Category options with translation keys
const CATEGORY_OPTIONS = {
    crop_income: [
        { value: 'crop_sale', labelKey: 'finance.cropSale', group: 'crop' },
        { value: 'subsidy', labelKey: 'finance.subsidy', group: 'crop' },
        { value: 'insurance', labelKey: 'finance.insurance', group: 'crop' },
        { value: 'seed_sale', labelKey: 'finance.seedSale', group: 'crop' },
        { value: 'other_income', labelKey: 'finance.otherIncome', group: 'crop' },
    ],
    crop_expense: [
        { value: 'seeds', labelKey: 'finance.seeds', group: 'crop' },
        { value: 'fertilizer', labelKey: 'finance.fertilizer', group: 'crop' },
        { value: 'pesticide', labelKey: 'finance.pesticide', group: 'crop' },
        { value: 'labor', labelKey: 'finance.labor', group: 'crop' },
        { value: 'land_rent', labelKey: 'finance.landRent', group: 'crop' },
        { value: 'irrigation', labelKey: 'finance.irrigation', group: 'crop' },
        { value: 'equipment', labelKey: 'finance.equipment', group: 'crop' },
        { value: 'transport', labelKey: 'finance.transport', group: 'crop' },
        { value: 'other_expense', labelKey: 'finance.otherExpense', group: 'crop' },
    ],
    animal_income: [
        { value: 'milk_sale', labelKey: 'finance.milkSale', group: 'animal' },
        { value: 'egg_sale', labelKey: 'finance.eggSale', group: 'animal' },
        { value: 'animal_sale', labelKey: 'finance.animalSale', group: 'animal' },
        { value: 'offspring_sale', labelKey: 'finance.offspringSale', group: 'animal' },
        { value: 'wool_sale', labelKey: 'finance.woolSale', group: 'animal' },
        { value: 'manure_sale', labelKey: 'finance.manureSale', group: 'animal' },
        { value: 'subsidy', labelKey: 'finance.subsidy', group: 'animal' },
        { value: 'other_income', labelKey: 'finance.otherIncome', group: 'animal' },
    ],
    animal_expense: [
        { value: 'feed', labelKey: 'finance.feed', group: 'animal' },
        { value: 'bedding', labelKey: 'finance.bedding', group: 'animal' },
        { value: 'vaccination', labelKey: 'finance.vaccination', group: 'animal' },
        { value: 'health_care', labelKey: 'finance.healthCare', group: 'animal' },
        { value: 'breeding_service', labelKey: 'finance.breedingService', group: 'animal' },
        { value: 'animal_purchase', labelKey: 'finance.animalPurchase', group: 'animal' },
        { value: 'equipment', labelKey: 'finance.equipment', group: 'animal' },
        { value: 'transport', labelKey: 'finance.transport', group: 'animal' },
        { value: 'other_expense', labelKey: 'finance.otherExpense', group: 'animal' },
    ],
};
const NewTransactionPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { addTransaction } = useFinance();
    const [loading, setLoading] = useState(false);
    const [crops, setCrops] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [loadingCrops, setLoadingCrops] = useState(false);
    const [loadingAnimals, setLoadingAnimals] = useState(false);
    const [form, setForm] = useState({
        transaction_type: 'crop_income',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        crop: null,
        animal: null,
        notes: '',
    });
    // Get current transaction type info
    const currentTypeInfo = TRANSACTION_TYPES.find(t => t.value === form.transaction_type);
    const isIncome = currentTypeInfo?.type === 'income';
    const isCropRelated = currentTypeInfo?.group === 'crop';
    const isAnimalRelated = currentTypeInfo?.group === 'animal';
    // Get available categories for current transaction type
    const getAvailableCategories = () => {
        return CATEGORY_OPTIONS[form.transaction_type] || [];
    };
    // Fetch crops for crop-related transactions
    const fetchCrops = async () => {
        setLoadingCrops(true);
        try {
            const response = await fetch('/api/crops/', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            const data = await response.json();
            setCrops(data.results || data || []);
        }
        catch (error) {
            console.error('Error fetching crops:', error);
        }
        finally {
            setLoadingCrops(false);
        }
    };
    // Fetch animals for animal-related transactions
    const fetchAnimals = async () => {
        setLoadingAnimals(true);
        try {
            const response = await fetch('/api/livestock/animals/', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            const data = await response.json();
            setAnimals(data.results || data || []);
        }
        catch (error) {
            console.error('Error fetching animals:', error);
        }
        finally {
            setLoadingAnimals(false);
        }
    };
    // Load crops/animals when transaction type changes
    useEffect(() => {
        if (isCropRelated) {
            fetchCrops();
        }
        else if (isAnimalRelated) {
            fetchAnimals();
        }
    }, [form.transaction_type]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation
        if (!form.amount || parseFloat(form.amount) <= 0) {
            toast.error(t('finance.amountRequired'));
            return;
        }
        if (!form.category) {
            toast.error(t('finance.categoryRequired'));
            return;
        }
        setLoading(true);
        try {
            const selectedCategoryInfo = getAvailableCategories().find(c => c.value === form.category);
            const payload = {
                transaction_type: form.transaction_type,
                amount: parseFloat(form.amount),
                date: form.date,
                description: form.description || `${t(selectedCategoryInfo?.labelKey || '')} - ${t(currentTypeInfo?.labelKey || '')}`,
                category: form.category,
                notes: form.notes,
            };
            if (isCropRelated && form.crop) {
                payload.crop = form.crop;
            }
            if (isAnimalRelated && form.animal) {
                payload.animal = form.animal;
            }
            await addTransaction(payload);
            toast.success(t('finance.addSuccess'));
            navigate('/finance');
        }
        catch (error) {
            console.error("Error adding transaction:", error);
            toast.error(error.response?.data?.error || t('finance.addError'));
        }
        finally {
            setLoading(false);
        }
    };
    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Reset related fields when transaction type changes
        if (field === 'transaction_type') {
            setForm(prev => ({ ...prev, crop: null, animal: null, category: '' }));
        }
    };
    return (<MainLayout title={t('finance.addTransaction')} subtitle={t('finance.addTransactionSubtitle')}>
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              {isIncome ? (<TrendingUp className="w-6 h-6 text-emerald-500"/>) : (<TrendingDown className="w-6 h-6 text-rose-500"/>)}
              <h3 className="text-lg font-bold text-gray-800">{t('finance.transactionDetails')}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Transaction Type */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold">{t('finance.transactionType')} *</Label>
                <Select value={form.transaction_type} onValueChange={(v) => handleFormChange('transaction_type', v)}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder={t('finance.selectType')}/>
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((type) => (<SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4"/>
                          <span>{t(type.labelKey)}</span>
                        </div>
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold">{t('finance.amount')} ({t('common.rs')}) *</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={e => handleFormChange('amount', e.target.value)} placeholder={t('finance.enterAmount')} className="rounded-xl h-11" required/>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold">{t('finance.date')} *</Label>
                <Input type="date" value={form.date} onChange={e => handleFormChange('date', e.target.value)} className="rounded-xl h-11" required/>
              </div>

              {/* Category - Dynamic based on transaction type */}
              <div className="space-y-1.5">
                <Label className="text-sm font-bold">{t('finance.category')} *</Label>
                <Select value={form.category || undefined} onValueChange={(v) => handleFormChange('category', v)}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder={t('finance.selectCategory')}/>
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCategories().map((cat) => (<SelectItem key={cat.value} value={cat.value}>
                        {t(cat.labelKey)}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>



              {/* Description */}
              <div className={isCropRelated || isAnimalRelated ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
                <Label className="text-sm font-bold">{t('finance.description')}</Label>
                <Input value={form.description} onChange={e => handleFormChange('description', e.target.value)} placeholder={t('finance.descriptionPlaceholder')} className="rounded-xl h-11"/>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-sm font-bold">{t('finance.notes')}</Label>
              <Textarea value={form.notes} onChange={e => handleFormChange('notes', e.target.value)} placeholder={t('finance.notesPlaceholder')} rows={3} className="rounded-xl"/>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/finance')} className="w-full sm:w-auto rounded-xl h-11 px-8 font-bold gap-2">
              <X className="w-4 h-4"/> {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:flex-1 rounded-xl h-11 font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
              <Save className="w-4 h-4"/>
              {loading ? t('common.saving') : t('finance.addTransaction')}
            </Button>
          </div>

          {/* Info Note */}
          <div className="text-center text-xs text-gray-400">
            <p>{t('finance.transactionNote')}</p>
          </div>
        </form>
      </div>
    </MainLayout>);
};
export default NewTransactionPage;
