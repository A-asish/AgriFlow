import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
export function useAdminData({ fetchFn, initialParams = {}, onSuccess, onError, immediate = true, }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);
    const [params, setParams] = useState(initialParams);
    const fetch = useCallback(async (fetchParams) => {
        try {
            setLoading(true);
            setError(null);
            const activeParams = fetchParams !== undefined ? fetchParams : params;
            const response = await fetchFn(activeParams);
            setData(response.data);
            onSuccess?.(response.data);
            return response.data;
        }
        catch (err) {
            setError(err);
            onError?.(err);
            toast.error(err.response?.data?.message || 'Failed to fetch data');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [fetchFn, params, onSuccess, onError]);
    useEffect(() => {
        if (immediate) {
            fetch();
        }
    }, [immediate]); // Only run on mount if immediate is true, fetch depends on too many things
    const updateParams = useCallback((newParams) => {
        setParams((prev) => ({ ...prev, ...newParams }));
    }, []);
    const refresh = useCallback(() => fetch(), [fetch]);
    return {
        data,
        loading,
        error,
        params,
        setParams: updateParams,
        refresh,
        setData,
    };
}
