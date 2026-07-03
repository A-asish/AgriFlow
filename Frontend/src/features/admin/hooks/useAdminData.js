// src/features/admin/hooks/useAdminData.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useAdminData({ fetchFn, initialParams = {} }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);
  const isMounted = useRef(true);
  const isFetching = useRef(false);

  const fetchData = useCallback(async (fetchParams) => {
    // Prevent multiple simultaneous fetches
    if (isFetching.current) return;
    
    isFetching.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const currentParams = fetchParams !== undefined ? fetchParams : params;
      
      // Clean params - remove empty values
      const cleanParams = {};
      Object.keys(currentParams).forEach(key => {
        if (currentParams[key] !== '' && 
            currentParams[key] !== null && 
            currentParams[key] !== undefined && 
            currentParams[key] !== 'all') {
          cleanParams[key] = currentParams[key];
        }
      });
      
      const response = await fetchFn(cleanParams);
      
      if (isMounted.current) {
        setData(response.data);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error('Fetch error:', err);
        setError(err);
        toast.error(err.response?.data?.error || 'Failed to fetch data');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isFetching.current = false;
    }
  }, [fetchFn, params]);

  // Only fetch on mount and when params change (with debounce)
  useEffect(() => {
    // Debounce to prevent rapid calls
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [params]); // Only depend on params, not fetchData

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

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