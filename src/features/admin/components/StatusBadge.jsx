import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/lib/utils';
import { getColorByStatus } from '../utils/helpers';
const StatusBadge = ({ status, className }) => {
    const color = getColorByStatus(status);
    const colorMap = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
    };
    return (<Badge className={cn("rounded-lg px-2.5 py-0.5 font-bold capitalize shadow-none border", colorMap[color] || colorMap.slate, className)}>
      {status}
    </Badge>);
};
export default StatusBadge;
