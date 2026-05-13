import { useState, useCallback } from 'react';
export function usePagination({ initialPage = 1, initialPageSize = 10, pageSizeOptions = [5, 10, 20, 50] } = {}) {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const getPaginatedData = useCallback((data) => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return data.slice(start, end);
    }, [currentPage, pageSize]);
    const getTotalPages = useCallback((totalItems) => {
        return Math.ceil(totalItems / pageSize);
    }, [pageSize]);
    const goToPage = (page) => {
        setCurrentPage(Math.max(1, page));
    };
    const nextPage = () => {
        setCurrentPage(prev => prev + 1);
    };
    const prevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };
    const changePageSize = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };
    const resetPagination = () => {
        setCurrentPage(initialPage);
        setPageSize(initialPageSize);
    };
    return {
        currentPage,
        pageSize,
        pageSizeOptions,
        getPaginatedData,
        getTotalPages,
        goToPage,
        nextPage,
        prevPage,
        changePageSize,
        resetPagination
    };
}
