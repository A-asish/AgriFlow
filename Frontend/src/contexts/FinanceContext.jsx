import React, { createContext, useContext, useState, useEffect } from 'react';
import { financeService } from '@/features/farmer/finance/services/finance.api';
import { useAuth } from '@/contexts/AuthContext'; // ✅ Add this import
import { toast } from 'sonner';
const FinanceContext = createContext(undefined);
export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context)
        throw new Error('useFinance must be used within a FinanceProvider');
    return context;
};
export const FinanceProvider = ({ children }) => {
    const { isAuthenticated } = useAuth(); // ✅ Get auth state
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchAllData = async () => {
        // ✅ CRITICAL: Don't fetch if not authenticated
        if (!isAuthenticated) {
            console.log('FinanceProvider: Not authenticated, skipping fetch');
            setLoading(false);
            return;
        }
        console.log('FinanceProvider: Fetching finance data');
        setLoading(true);
        try {
            const [transactionsRes, summaryRes] = await Promise.all([
                financeService.listTransactions(),
                financeService.getSummary(),
            ]);
            setTransactions(transactionsRes.data?.results || transactionsRes.data || []);
            setSummary(summaryRes.data);
        }
        catch (error) {
            console.error('Error fetching finance data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    // ✅ Only fetch when authenticated
    useEffect(() => {
        fetchAllData();
    }, [isAuthenticated]); // ✅ Re-fetch when auth state changes
    const refreshData = async () => {
        if (!isAuthenticated)
            return; // ✅ Don't refresh if not authenticated
        await fetchAllData();
    };
    const addTransaction = async (data) => {
        if (!isAuthenticated) {
            toast.error('Please login to add transactions');
            throw new Error('Not authenticated');
        }
        try {
            const response = await financeService.createTransaction(data);
            await fetchAllData();
            toast.success('Transaction added successfully');
            return response;
        }
        catch (error) {
            toast.error('Failed to add transaction');
            throw error;
        }
    };
    const updateTransaction = async (id, data) => {
        if (!isAuthenticated) {
            toast.error('Please login to update transactions');
            throw new Error('Not authenticated');
        }
        try {
            const response = await financeService.updateTransaction(id, data);
            await fetchAllData();
            toast.success('Transaction updated successfully');
            return response;
        }
        catch (error) {
            toast.error('Failed to update transaction');
            throw error;
        }
    };
    const deleteTransaction = async (id) => {
        if (!isAuthenticated) {
            toast.error('Please login to delete transactions');
            throw new Error('Not authenticated');
        }
        try {
            await financeService.deleteTransaction(id);
            await fetchAllData();
            toast.success('Transaction deleted successfully');
        }
        catch (error) {
            toast.error('Failed to delete transaction');
            throw error;
        }
    };
    return (<FinanceContext.Provider value={{
            transactions,
            summary,
            loading,
            refreshData,
            addTransaction,
            updateTransaction,
            deleteTransaction,
        }}>
      {children}
    </FinanceContext.Provider>);
};
