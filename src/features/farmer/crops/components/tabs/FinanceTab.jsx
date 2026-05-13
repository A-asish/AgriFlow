import { DollarSign, TrendingUp, TrendingDown, Plus, Edit2, Trash2, AlertTriangle, AlertCircle, User, Building, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { cropsService } from '@/features/farmer/crops/services/crops.api';
import { toast } from 'sonner';
import { ResponsiveDialog } from '@/shared/components/ui/ResponsiveDialog';
export function FinanceTab({ crop, onRefresh, isReadOnly = false, canAdd = true }) {
    const { t, language } = useLanguage();
    // Get all financial data from crop
    const [incomes, setIncomes] = useState(crop.incomes || []);
    const [expenses, setExpenses] = useState(crop.expenses || []);
    const [fertilizers, setFertilizers] = useState(crop.fertilizers || []);
    const [pesticides, setPesticides] = useState(crop.pesticides || []);
    const [labor, setLabor] = useState(crop.labour_records || []);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteType, setDeleteType] = useState('income');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formType, setFormType] = useState('income');
    const [form, setForm] = useState({
        source: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        buyer_name: '',
        buyer_contact: '',
        vendor_name: '',
        vendor_contact: '',
        notes: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const safeParseNumber = (value) => {
        if (value === null || value === undefined || value === '')
            return 0;
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        return isNaN(num) ? 0 : num;
    };
    const formatCurrency = (value) => {
        const numValue = safeParseNumber(value);
        if (numValue === 0)
            return `${t('common.rs')} 0`;
        return `${t('common.rs')} ${Math.round(numValue).toLocaleString('en-IN')}`;
    };
    const validatePhoneNumber = (phone) => {
        if (!phone)
            return '';
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            return 'Phone number must be 10 digits';
        }
        return '';
    };
    const validateDate = (date) => {
        if (!date)
            return `${t('common.date')} ${t('common.isRequired')}`;
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
            return 'Date cannot be in the future';
        }
        return '';
    };
    // Fetch fresh data
    const fetchData = async () => {
        if (!crop?.id)
            return;
        setLoading(true);
        try {
            const [incomesRes, expensesRes, fertilizersRes, pesticidesRes, laborRes] = await Promise.all([
                cropsService.listIncomes(crop.id),
                cropsService.listExpenses(crop.id),
                cropsService.listFertilizers(crop.id),
                cropsService.listPesticides(crop.id),
                cropsService.listLabor(crop.id)
            ]);
            setIncomes(Array.isArray(incomesRes.data) ? incomesRes.data : (incomesRes.data?.results || []));
            setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : (expensesRes.data?.results || []));
            setFertilizers(Array.isArray(fertilizersRes.data) ? fertilizersRes.data : (fertilizersRes.data?.results || []));
            setPesticides(Array.isArray(pesticidesRes.data) ? pesticidesRes.data : (pesticidesRes.data?.results || []));
            setLabor(Array.isArray(laborRes.data) ? laborRes.data : (laborRes.data?.results || []));
        }
        catch (error) {
            console.error('Error fetching finance data:', error);
            toast.error(t('common.error'));
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [crop?.id]);
    // Combine ALL financial activities
    const getAllActivities = () => {
        const activities = [];
        // Add Crop Incomes
        incomes.forEach((item) => {
            activities.push({
                id: item.id,
                type: 'income',
                category: item.source_display || item.source,
                name: item.description || item.source,
                amount: safeParseNumber(item.amount),
                date: item.date,
                description: item.description,
                notes: item.notes,
                original: item,
                sourceType: 'income',
                createdAt: item.created_at
            });
        });
        // Add Crop Expenses (manual)
        expenses.forEach((item) => {
            activities.push({
                id: item.id,
                type: 'expense',
                category: item.category_display || item.category,
                name: item.description || item.category,
                amount: safeParseNumber(item.amount),
                date: item.date,
                description: item.description,
                notes: item.notes,
                original: item,
                sourceType: 'expense',
                subCategory: item.category,
                createdAt: item.created_at
            });
        });
        // Add Fertilizers
        fertilizers.forEach((item) => {
            activities.push({
                id: `fert_${item.id}`,
                type: 'expense',
                category: 'Fertilizer',
                name: item.name,
                amount: safeParseNumber(item.cost),
                date: item.application_date || item.created_at,
                description: `${item.name} (${item.quantity} ${item.unit})`,
                notes: item.notes,
                original: item,
                sourceType: 'fertilizer',
                subCategory: 'Fertilizer',
                createdAt: item.created_at
            });
        });
        // Add Pesticides
        pesticides.forEach((item) => {
            activities.push({
                id: `pest_${item.id}`,
                type: 'expense',
                category: 'Pesticide',
                name: item.name,
                amount: safeParseNumber(item.cost),
                date: item.application_date || item.created_at,
                description: `${item.name}${item.target_pest ? ` (for ${item.target_pest})` : ''}`,
                notes: item.notes,
                original: item,
                sourceType: 'pesticide',
                subCategory: 'Pesticide',
                createdAt: item.created_at
            });
        });
        // Add Labor
        labor.forEach((item) => {
            activities.push({
                id: `labor_${item.id}`,
                type: 'expense',
                category: 'Labor',
                name: item.name,
                amount: safeParseNumber(item.total_cost),
                date: item.date || item.created_at,
                description: `${item.workers_count} workers × ${item.days} days`,
                notes: item.notes,
                original: item,
                sourceType: 'labor',
                subCategory: 'Labor',
                createdAt: item.created_at
            });
        });
        return activities.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA === dateB) {
                // If dates are equal, sort by created_at (most recent first)
                const createdAtA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const createdAtB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return createdAtB - createdAtA;
            }
            return dateB - dateA;
        });
    };
    const getFilteredActivities = () => {
        const all = getAllActivities();
        if (activeTab === 'all')
            return all;
        return all.filter(activity => activity.type === activeTab);
    };
    const filteredActivities = getFilteredActivities();
    // Calculate totals from ALL sources
    const totalIncome = getAllActivities()
        .filter(a => a.type === 'income')
        .reduce((sum, a) => sum + safeParseNumber(a.amount), 0);
    const totalExpense = getAllActivities()
        .filter(a => a.type === 'expense')
        .reduce((sum, a) => sum + safeParseNumber(a.amount), 0);
    const netProfit = totalIncome - totalExpense;
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const paginatedActivities = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const validateAmount = (amount) => {
        if (!amount)
            return `${t('finance.Amount')} ${t('common.isRequired')}`;
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount))
            return 'Please enter a valid number';
        if (numAmount <= 0)
            return 'Amount must be greater than 0';
        if (numAmount > 10000000)
            return 'Amount must be less than 10,000,000';
        return '';
    };
    const validateDescription = (description) => {
        if (formType === 'income' && form.source === 'other' && !description) {
            return 'Description is required for other income sources';
        }
        if (formType === 'expense' && form.category === 'other' && !description) {
            return 'Description is required for other expense categories';
        }
        return '';
    };
    const clearFieldError = (field) => {
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };
    const handleFieldChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        clearFieldError(field);
        if (field === 'amount') {
            const error = validateAmount(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, amount: error }));
            else
                clearFieldError('amount');
        }
        if (field === 'date') {
            const error = validateDate(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, date: error }));
            else
                clearFieldError('date');
        }
        if (field === 'description') {
            const error = validateDescription(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, description: error }));
            else
                clearFieldError('description');
        }
        if (field === 'buyer_contact' || field === 'vendor_contact') {
            const error = validatePhoneNumber(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, [field]: error }));
            else
                clearFieldError(field);
        }
    };
    const handleSelectChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        clearFieldError(field);
        if ((field === 'source' && value === 'other') || (field === 'category' && value === 'other')) {
            if (!form.description) {
                setFieldErrors(prev => ({ ...prev, description: 'Description is required for other sources/categories' }));
            }
        }
        else {
            clearFieldError('description');
        }
    };
    const validateForm = () => {
        const errors = {};
        const amountError = validateAmount(form.amount);
        if (amountError)
            errors.amount = amountError;
        const dateError = validateDate(form.date);
        if (dateError)
            errors.date = dateError;
        if (formType === 'income' && !form.source) {
            errors.source = `${t('finance.source')} ${t('common.isRequired')}`;
        }
        if (formType === 'expense' && !form.category) {
            errors.category = `${t('finance.Category')} ${t('common.isRequired')}`;
        }
        const descriptionError = validateDescription(form.description);
        if (descriptionError)
            errors.description = descriptionError;
        if (form.buyer_contact && validatePhoneNumber(form.buyer_contact)) {
            errors.buyer_contact = validatePhoneNumber(form.buyer_contact);
        }
        if (form.vendor_contact && validatePhoneNumber(form.vendor_contact)) {
            errors.vendor_contact = validatePhoneNumber(form.vendor_contact);
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const openAddIncomeForm = () => {
        setFormType('income');
        setEditing(null);
        setForm({
            source: '',
            category: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            buyer_name: '',
            buyer_contact: '',
            vendor_name: '',
            vendor_contact: '',
            notes: ''
        });
        setFieldErrors({});
        setShowForm(true);
    };
    const openAddExpenseForm = () => {
        setFormType('expense');
        setEditing(null);
        setForm({
            source: '',
            category: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            buyer_name: '',
            buyer_contact: '',
            vendor_name: '',
            vendor_contact: '',
            notes: ''
        });
        setFieldErrors({});
        setShowForm(true);
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }
        setIsSubmitting(true);
        let data = {
            amount: parseFloat(form.amount),
            date: form.date,
            description: form.description || "",
            notes: form.notes || ""
        };
        if (formType === 'income') {
            data.source = form.source;
            data.buyer_name = form.buyer_name || "";
            data.buyer_contact = form.buyer_contact || "";
        }
        else {
            data.category = form.category;
            data.vendor_name = form.vendor_name || "";
            data.vendor_contact = form.vendor_contact || "";
        }
        try {
            if (editing?.id) {
                if (formType === 'income') {
                    await cropsService.updateIncome(editing.id, data);
                }
                else {
                    await cropsService.updateExpense(editing.id, data);
                }
                toast.success(`${formType === 'income' ? 'Income' : 'Expense'} updated successfully`);
            }
            else {
                if (formType === 'income') {
                    await cropsService.addIncome(crop.id, data);
                }
                else {
                    await cropsService.addExpense(crop.id, data);
                }
                toast.success(`${formType === 'income' ? 'Income' : 'Expense'} added successfully`);
            }
            setShowForm(false);
            setEditing(null);
            setForm({
                source: '',
                category: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                buyer_name: '',
                buyer_contact: '',
                vendor_name: '',
                vendor_contact: '',
                notes: ''
            });
            setFieldErrors({});
            await fetchData();
            onRefresh();
        }
        catch (error) {
            console.error('Error saving finance record:', error);
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'object') {
                    const errorMessages = Object.entries(errorData)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                    toast.error(errorMessages);
                }
                else {
                    toast.error(errorData);
                }
            }
            else {
                toast.error(`Failed to save ${formType === 'income' ? 'income' : 'expense'}`);
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDelete = async () => {
        if (!deleteId)
            return;
        setIsSubmitting(true);
        try {
            if (deleteType === 'income') {
                await cropsService.deleteIncome(deleteId);
            }
            else {
                await cropsService.deleteExpense(deleteId);
            }
            toast.success(`${deleteType === 'income' ? 'Income' : 'Expense'} deleted successfully`);
            setShowDeleteConfirm(false);
            setDeleteId(null);
            await fetchData();
            onRefresh();
        }
        catch (error) {
            console.error('Error deleting finance record:', error);
            toast.error(error.response?.data?.message || 'Failed to delete record');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const startEdit = (item, type) => {
        if (isReadOnly || !canAdd)
            return;
        setEditing(item.original);
        setFormType(type);
        if (type === 'income') {
            setForm({
                source: item.original.source || '',
                category: '',
                amount: safeParseNumber(item.amount).toString(),
                date: item.date || new Date().toISOString().split('T')[0],
                description: item.description || '',
                buyer_name: item.original.buyer_name || '',
                buyer_contact: item.original.buyer_contact || '',
                vendor_name: '',
                vendor_contact: '',
                notes: item.notes || ''
            });
        }
        else {
            // For expenses, check if it's a regular expense, fertilizer, pesticide, or labor
            if (item.sourceType === 'fertilizer' || item.sourceType === 'pesticide' || item.sourceType === 'labor') {
                // These cannot be edited in finance tab - they have their own tabs
                toast.info('Please edit this record in its respective tab (Fertilizer/Pesticide/Labor)');
                return;
            }
            setForm({
                source: '',
                category: item.original.category || '',
                amount: safeParseNumber(item.amount).toString(),
                date: item.date || new Date().toISOString().split('T')[0],
                description: item.description || '',
                buyer_name: '',
                buyer_contact: '',
                vendor_name: item.original.vendor_name || '',
                vendor_contact: item.original.vendor_contact || '',
                notes: item.notes || ''
            });
        }
        setFieldErrors({});
        setShowForm(true);
    };
    const getActivityStyle = (type, sourceType) => {
        if (type === 'income') {
            return {
                bg: 'bg-emerald-50',
                text: 'text-emerald-600',
                border: 'border-emerald-200',
                icon: TrendingUp,
                amountClass: 'text-emerald-600'
            };
        }
        // Different colors for different expense types
        if (sourceType === 'fertilizer') {
            return {
                bg: 'bg-blue-50',
                text: 'text-blue-600',
                border: 'border-blue-200',
                icon: TrendingDown,
                amountClass: 'text-blue-600'
            };
        }
        if (sourceType === 'pesticide') {
            return {
                bg: 'bg-orange-50',
                text: 'text-orange-600',
                border: 'border-orange-200',
                icon: TrendingDown,
                amountClass: 'text-orange-600'
            };
        }
        if (sourceType === 'labor') {
            return {
                bg: 'bg-purple-50',
                text: 'text-purple-600',
                border: 'border-purple-200',
                icon: TrendingDown,
                amountClass: 'text-purple-600'
            };
        }
        return {
            bg: 'bg-red-50',
            text: 'text-red-600',
            border: 'border-red-200',
            icon: TrendingDown,
            amountClass: 'text-red-600'
        };
    };
    if (loading) {
        return (<div className="farm-card">
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"/>
        </div>
      </div>);
    }
    const hasFormErrors = Object.keys(fieldErrors).length > 0;
    return (<div className="farm-card">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500 shrink-0"/> {t('finance.title')}
        </h3>
        {!isReadOnly && canAdd && (<div className="flex gap-2">
            <Button size="sm" className="rounded-lg gap-2 bg-green-600 hover:bg-green-700" onClick={openAddIncomeForm}>
              <Plus className="w-4 h-4"/> <TrendingUp className="w-3 h-3"/> {t('finance.addIncome')}
            </Button>
            <Button size="sm" className="rounded-lg gap-2 bg-red-600 hover:bg-red-700" onClick={openAddExpenseForm}>
              <Plus className="w-4 h-4"/> <TrendingDown className="w-3 h-3"/> {t('finance.addExpense')}
            </Button>
          </div>)}
      </div>

      {/* Financial Summary Card */}
      <div className="farm-card p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600"/> {t('finance.title')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700">{t('finance.totalIncome')}</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(crop.total_income || 0)}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">{t('finance.totalExpense')}</p>
            <p className="text-xl font-bold text-red-700">{formatCurrency(crop.total_expense || 0)}</p>
          </div>
          <div className={`p-3 rounded-lg border ${(crop.total_income - crop.total_expense) >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <p className={`text-xs ${(crop.total_income - crop.total_expense) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{t('finance.netProfit')}</p>
            <p className={`text-xl font-bold ${(crop.total_income - crop.total_expense) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency((crop.total_income || 0) - (crop.total_expense || 0))}
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700">{t('finance.profitMargin')}</p>
            <p className="text-xl font-bold text-purple-700">
              {crop.total_income && crop.total_income > 0
            ? ((((crop.total_income || 0) - (crop.total_expense || 0)) / (crop.total_income || 1)) * 100).toFixed(1)
            : 0}%
            </p>
          </div>
        </div>
      </div>


     
      {/* Tab Switcher */}
      <div className="flex gap-2 border-b mb-6">
        <button onClick={() => {
            setActiveTab('all');
            setCurrentPage(1);
        }} className={`px-4 py-2 font-semibold transition-all ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-muted-foreground hover:text-foreground'}`}>
          <List className="w-4 h-4 inline mr-2"/> {t('common.all')}
        </button>
        <button onClick={() => {
            setActiveTab('income');
            setCurrentPage(1);
        }} className={`px-4 py-2 font-semibold transition-all ${activeTab === 'income' ? 'border-b-2 border-green-500 text-green-600' : 'text-muted-foreground hover:text-foreground'}`}>
          <TrendingUp className="w-4 h-4 inline mr-2"/> {t('finance.income')}
        </button>
        <button onClick={() => {
            setActiveTab('expense');
            setCurrentPage(1);
        }} className={`px-4 py-2 font-semibold transition-all ${activeTab === 'expense' ? 'border-b-2 border-red-500 text-red-600' : 'text-muted-foreground hover:text-foreground'}`}>
          <TrendingDown className="w-4 h-4 inline mr-2"/> {t('finance.expense')}
        </button>
      </div>

      {/* Activities List - All Transactions */}
      <div className="space-y-3">
        {paginatedActivities.length === 0 ? (<p className="text-center py-10 text-muted-foreground">No transactions found.</p>) : (paginatedActivities.map((item) => {
            const style = getActivityStyle(item.type, item.sourceType);
            const Icon = style.icon;
            return (<div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border ${style.border} ${style.bg} gap-3`}>
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg ${style.bg} shrink-0`}>
                    <Icon className={`w-4 h-4 ${style.text}`}/>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text} font-medium`}>
                        {item.category}
                      </span>
                      {item.sourceType && item.sourceType !== 'income' && item.sourceType !== 'expense' && (<span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {item.sourceType}
                        </span>)}
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                    {item.description && item.description !== item.name && (<p className="text-xs text-muted-foreground mt-1">{item.description}</p>)}
                    {item.notes && !item.description && (<p className="text-xs text-muted-foreground mt-1">{item.notes}</p>)}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className={`text-lg font-bold ${style.amountClass} whitespace-nowrap`}>
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                  </span>
                  {(item.type === 'income' || item.type === 'expense') && item.sourceType !== 'fertilizer' && item.sourceType !== 'pesticide' && item.sourceType !== 'labor' && !isReadOnly && canAdd && (<div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(item, item.type)}>
                        <Edit2 className="w-3 h-3"/>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                        setDeleteId(item.id);
                        setDeleteType(item.type);
                        setShowDeleteConfirm(true);
                    }}>
                        <Trash2 className="w-3 h-3"/>
                      </Button>
                    </div>)}
                </div>
              </div>);
        }))}

        {/* Pagination */}
        {totalPages > 1 && (<div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="gap-1">
              <ChevronLeft className="w-4 h-4"/> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({filteredActivities.length} items)
            </span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="gap-1">
              Next <ChevronRight className="w-4 h-4"/>
            </Button>
          </div>)}
      </div>

      {/* Income/Expense Form Dialog */}
      <ResponsiveDialog isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); setFieldErrors({}); }} title={editing ? t('common.edit') : (formType === 'income' ? t('finance.addIncome') : t('finance.addExpense'))} maxWidth="md">
        <div className="space-y-4">
          {formType === 'income' ? (<div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('finance.source')} *
              </Label>
              <Select value={form.source} onValueChange={(v) => handleSelectChange('source', v)}>
                <SelectTrigger className={`rounded-xl h-11 sm:h-12 ${fieldErrors.source ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={t('finance.selectSource')}/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crop_sale">{t('finance.cropSale')}</SelectItem>
                  <SelectItem value="subsidy">{t('finance.subsidy')}</SelectItem>
                  <SelectItem value="insurance">{t('finance.insurance')}</SelectItem>
                  <SelectItem value="seed_sale">{t('finance.seedSale')}</SelectItem>
                  <SelectItem value="other">{t('finance.otherIncome')}</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.source && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3"/> {fieldErrors.source}
                </p>)}
            </div>) : (<div className="space-y-1.5">
              <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t('finance.Category')} *
              </Label>
              <Select value={form.category} onValueChange={(v) => handleSelectChange('category', v)}>
                <SelectTrigger className={`rounded-xl h-11 sm:h-12 ${fieldErrors.category ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={t('finance.selectCategory')}/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seed">{t('finance.seed')}</SelectItem>
                  <SelectItem value="land_rent">{t('finance.landRent')}</SelectItem>
                  <SelectItem value="irrigation">{t('finance.irrigation')}</SelectItem>
                  <SelectItem value="equipment">{t('finance.equipment')}</SelectItem>
                  <SelectItem value="transport">{t('finance.transport')}</SelectItem>
                  <SelectItem value="other">{t('finance.otherExpense')}</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.category && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3"/> {fieldErrors.category}
                </p>)}
            </div>)}

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('finance.Amount')} ({t('common.rs')}) *
            </Label>
            <Input type="number" step="1" className={`rounded-xl h-11 sm:h-12 ${fieldErrors.amount ? 'border-red-500' : ''}`} value={form.amount} onChange={e => handleFieldChange('amount', e.target.value)} placeholder={t('finance.enterAmount')}/>
            {fieldErrors.amount && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {fieldErrors.amount}
              </p>)}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('common.date')} *
            </Label>
            <Input type="date" value={form.date} onChange={e => handleFieldChange('date', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.date ? 'border-red-500' : ''}`}/>
            {fieldErrors.date && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {fieldErrors.date}
              </p>)}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('common.description')} {(form.source === 'other' || form.category === 'other') && <span className="text-red-500">*</span>}
            </Label>
            <Input value={form.description} onChange={e => handleFieldChange('description', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.description ? 'border-red-500' : ''}`} placeholder={t('finance.descriptionPlaceholder')}/>
            {fieldErrors.description && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3"/> {fieldErrors.description}
              </p>)}
          </div>

          {formType === 'income' ? (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Buyer Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                  <Input value={form.buyer_name} onChange={e => handleFieldChange('buyer_name', e.target.value)} className="rounded-xl h-11 sm:h-12 pl-10" placeholder="Buyer name"/>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Buyer Contact
                </Label>
                <Input type="tel" maxLength={10} value={form.buyer_contact} onChange={e => handleFieldChange('buyer_contact', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.buyer_contact ? 'border-red-500' : ''}`} placeholder="Phone number (10 digits)"/>
                {fieldErrors.buyer_contact && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {fieldErrors.buyer_contact}
                  </p>)}
              </div>
            </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Vendor Name
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                  <Input value={form.vendor_name} onChange={e => handleFieldChange('vendor_name', e.target.value)} className="rounded-xl h-11 sm:h-12 pl-10" placeholder="Vendor name"/>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Vendor Contact
                </Label>
                <Input type="tel" maxLength={10} value={form.vendor_contact} onChange={e => handleFieldChange('vendor_contact', e.target.value)} className={`rounded-xl h-11 sm:h-12 ${fieldErrors.vendor_contact ? 'border-red-500' : ''}`} placeholder="Phone number (10 digits)"/>
                {fieldErrors.vendor_contact && (<p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3"/> {fieldErrors.vendor_contact}
                  </p>)}
              </div>
            </div>)}

          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t('common.notes')}
            </Label>
            <Textarea className="rounded-xl resize-none" rows={2} value={form.notes} onChange={e => handleFieldChange('notes', e.target.value)} placeholder={t('common.notesPlaceholder')}/>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting || hasFormErrors} className="w-full sm:flex-1 bg-green-600 hover:bg-green-700">
              {isSubmitting ? t('common.saving') : (editing ? t('common.edit') : t('common.add'))}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); setFieldErrors({}); }} className="w-full sm:flex-1">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeleteId(null); }} title={t('common.delete')} maxWidth="sm">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600"/>
          </div>
          <p className="text-sm text-gray-500 mb-6">{t('common.deleteConfirmation')}</p>
          <div className="flex gap-3">
            <Button onClick={handleDelete} disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700">
              {isSubmitting ? t('common.saving') : t('common.delete')}
            </Button>
            <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeleteId(null); }} className="flex-1">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>);
}
