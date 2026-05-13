import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertCircle } from 'lucide-react';
export function BudgetFormModal({ isOpen, editingBudget, budgetForm, existingBudgets, onClose, onSubmit, onFormChange }) {
    const { t } = useLanguage();
    const [duplicateError, setDuplicateError] = useState(null);
    if (!isOpen)
        return null;
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];
    // Check if budget for this period already exists
    const checkDuplicate = () => {
        if (editingBudget)
            return false;
        const exists = existingBudgets.some(budget => {
            if (budgetForm.month === null) {
                // Check for annual budget
                return budget.month === null && Number(budget.year) === Number(budgetForm.year);
            }
            else {
                // Check for monthly budget
                return Number(budget.month) === Number(budgetForm.month) && Number(budget.year) === Number(budgetForm.year);
            }
        });
        if (exists) {
            const period = budgetForm.month
                ? `${new Date(0, budgetForm.month - 1).toLocaleString('default', { month: 'long' })} ${budgetForm.year}`
                : `Annual ${budgetForm.year}`;
            setDuplicateError(`A budget for ${period} already exists. You can edit the existing budget instead.`);
            return true;
        }
        setDuplicateError(null);
        return false;
    };
    const handleSubmit = () => {
        if (checkDuplicate())
            return;
        onSubmit();
    };
    return (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">
          {editingBudget ? 'Edit Budget' : 'Create New Budget'}
        </h2>

        {/* Warning about duplicate budgets */}
        {!editingBudget && (<div className="mb-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
            <p>⚠️ You can only have ONE budget per month/year. If you create a budget for a period that already exists, it will update the existing budget.</p>
          </div>)}

        <div className="space-y-4">
          {/* Monthly/Annual Toggle */}
          <div>
            <label className="text-sm font-medium mb-1 block">Budget Type</label>
            <div className="flex gap-2">
              <Button type="button" variant={budgetForm.month !== null ? 'default' : 'outline'} className="flex-1" onClick={() => onFormChange('month', 1)} disabled={!!editingBudget}>
                Monthly
              </Button>
              <Button type="button" variant={budgetForm.month === null ? 'default' : 'outline'} className="flex-1" onClick={() => onFormChange('month', null)} disabled={!!editingBudget}>
                Annual
              </Button>
            </div>
          </div>

          {/* Month selector (only for monthly budgets) */}
          {budgetForm.month !== null && (<div>
              <label className="text-sm font-medium mb-1 block">Month</label>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={budgetForm.month} onChange={(e) => onFormChange('month', parseInt(e.target.value))} disabled={!!editingBudget}>
                <option value={1}>January</option>
                <option value={2}>February</option>
                <option value={3}>March</option>
                <option value={4}>April</option>
                <option value={5}>May</option>
                <option value={6}>June</option>
                <option value={7}>July</option>
                <option value={8}>August</option>
                <option value={9}>September</option>
                <option value={10}>October</option>
                <option value={11}>November</option>
                <option value={12}>December</option>
              </select>
            </div>)}

          {/* Year selector */}
          <div>
            <label className="text-sm font-medium mb-1 block">Year</label>
            <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={budgetForm.year} onChange={(e) => onFormChange('year', parseInt(e.target.value))} disabled={!!editingBudget}>
              {years.map(year => (<option key={year} value={year}>{year}</option>))}
            </select>
          </div>

          {/* Planned Income */}
          <div>
            <label className="text-sm font-medium mb-1 block">Planned Income (₹)</label>
            <input type="number" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={budgetForm.planned_income} onChange={(e) => onFormChange('planned_income', e.target.value)} placeholder="Enter planned income"/>
          </div>

          {/* Planned Expense */}
          <div>
            <label className="text-sm font-medium mb-1 block">Planned Expense (₹)</label>
            <input type="number" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" value={budgetForm.planned_expense} onChange={(e) => onFormChange('planned_expense', e.target.value)} placeholder="Enter planned expense"/>
          </div>

          {/* Duplicate Error */}
          {duplicateError && (<div className="p-3 bg-red-50 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5"/>
              <p className="text-xs text-red-600">{duplicateError}</p>
            </div>)}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              {editingBudget ? 'Update Budget' : 'Create Budget'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>);
}
