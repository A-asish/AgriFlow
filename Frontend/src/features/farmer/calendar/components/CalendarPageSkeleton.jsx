import { Skeleton } from '@/shared/components/ui/skeleton';

export function CalendarPageSkeleton() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-105 lg:col-span-2 rounded-2xl" />
                <Skeleton className="h-105 rounded-2xl" />
            </div>
        </div>
    );
}
