// src/features/admin/hooks/useAdminData.js
import { useState, useEffect, useCallback, useRef } from 'react';

export const useAdminData = ({ fetchFn, initialParams = {} }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [params, setParams] = useState(initialParams);
    const [pagination, setPagination] = useState(null);

    // Use ref to prevent infinite loops
    const isMounted = useRef(true);
    const fetchIdRef = useRef(0);

    // Keep the latest fetchFn in a ref. This runs on every render (no deps
    // array) but does NOT trigger effects or re-create fetchData, so a
    // caller passing an inline/unstable fetchFn can no longer cause an
    // infinite fetch loop.
    const fetchFnRef = useRef(fetchFn);
    useEffect(() => {
        fetchFnRef.current = fetchFn;
    });

    const fetchData = useCallback(async (currentParams) => {
        const fetchId = ++fetchIdRef.current;

        setLoading(true);
        setError(null);

        try {
            console.log('🔍 Fetching with params:', currentParams);
            const response = await fetchFnRef.current(currentParams);

            // Only update if this is still the latest request
            if (fetchId !== fetchIdRef.current) {
                console.log('⏭️ Skipping outdated fetch:', fetchId);
                return;
            }

            console.log('✅ Response received:', response);

            // Handle different response structures
            let responseData = response.data;
            let dataArray = [];
            let paginationData = null;

            if (responseData && typeof responseData === 'object') {
                // Check if response has 'data' property (array)
                if ('data' in responseData && Array.isArray(responseData.data)) {
                    dataArray = responseData.data;
                    paginationData = responseData.pagination || null;
                } else if (Array.isArray(responseData)) {
                    dataArray = responseData;
                } else {
                    dataArray = [];
                }
            }

            if (isMounted.current && fetchId === fetchIdRef.current) {
                setData(dataArray);
                setPagination(paginationData);
            }
        } catch (err) {
            console.error('❌ Fetch error:', err);
            if (isMounted.current && fetchId === fetchIdRef.current) {
                setError(err.response?.data?.error || err.message || 'Failed to fetch data');
            }
        } finally {
            if (isMounted.current && fetchId === fetchIdRef.current) {
                setLoading(false);
            }
        }
        // Stable forever — fetchFn is read from the ref, not from a dependency.
    }, []);

    // Initial fetch and when params change
    useEffect(() => {
        fetchData(params);
    }, [fetchData, params]);

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const refresh = useCallback(() => {
        fetchData(params);
    }, [fetchData, params]);

    const updateParams = useCallback((newParams) => {
        setParams(prev => {
            const updated = { ...prev, ...newParams };
            console.log('📝 Params updated:', updated);
            return updated;
        });
    }, []);

    return {
        data,
        loading,
        error,
        pagination,
        params,
        setParams: updateParams,
        refresh
    };
};

export default useAdminData;