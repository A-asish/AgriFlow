import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
export function useCrud({ fetchFn, addFn, updateFn, deleteFn, onSuccess, onError, successMessage = {
    add: 'Added successfully',
    update: 'Updated successfully',
    delete: 'Deleted successfully'
} }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const isMounted = useRef(true);
    const isFetching = useRef(false);
    const fetchItems = useCallback(async () => {
        // Prevent multiple simultaneous fetches
        if (isFetching.current)
            return;
        isFetching.current = true;
        setLoading(true);
        setError(null);
        try {
            const response = await fetchFn();
            if (!isMounted.current)
                return;
            const data = Array.isArray(response.data)
                ? response.data
                : (response.data?.results || []);
            setItems(data);
            return data;
        }
        catch (err) {
            console.error('Error fetching items:', err);
            if (!isMounted.current)
                return;
            const errorMsg = err.response?.data?.message || 'Failed to fetch data';
            setError(errorMsg);
            onError?.(err);
            return [];
        }
        finally {
            if (isMounted.current) {
                setLoading(false);
            }
            isFetching.current = false;
        }
    }, [fetchFn, onError]);
    const addItem = async (data) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await addFn(data);
            toast.success(successMessage.add || 'Added successfully');
            await fetchItems();
            onSuccess?.();
            return response;
        }
        catch (err) {
            console.error('Error adding item:', err);
            const errorMsg = err.response?.data?.message || 'Failed to add';
            setError(errorMsg);
            toast.error(errorMsg);
            onError?.(err);
            throw err;
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const updateItem = async (id, data) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await updateFn(id, data);
            toast.success(successMessage.update || 'Updated successfully');
            await fetchItems();
            onSuccess?.();
            return response;
        }
        catch (err) {
            console.error('Error updating item:', err);
            const errorMsg = err.response?.data?.message || 'Failed to update';
            setError(errorMsg);
            toast.error(errorMsg);
            onError?.(err);
            throw err;
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const deleteItem = async (id) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await deleteFn(id);
            toast.success(successMessage.delete || 'Deleted successfully');
            await fetchItems();
            onSuccess?.();
            return true;
        }
        catch (err) {
            console.error('Error deleting item:', err);
            const errorMsg = err.response?.data?.message || 'Failed to delete';
            setError(errorMsg);
            toast.error(errorMsg);
            onError?.(err);
            throw err;
        }
        finally {
            setIsSubmitting(false);
        }
    };
    useEffect(() => {
        isMounted.current = true;
        fetchItems();
        return () => {
            isMounted.current = false;
        };
    }, [fetchItems]);
    return {
        items,
        loading,
        isSubmitting,
        error,
        fetchItems,
        addItem,
        updateItem,
        deleteItem
    };
}
