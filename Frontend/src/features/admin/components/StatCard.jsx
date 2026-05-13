import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, description, className, }) => {
    return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={cn("p-6 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300", className)}>
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-3 rounded-2xl bg-opacity-10", color.replace('bg-', 'text-'))} style={{ backgroundColor: 'var(--tw-bg-opacity)' }}>
             <div className={cn("p-3 rounded-2xl flex items-center justify-center", color)}>
               <Icon className="w-6 h-6 text-white"/>
             </div>
          </div>
          {trend && (<div className={cn("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg", trend === 'up' ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50")}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
              {trendValue}%
            </div>)}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {value}
          </h3>
          {description && (<p className="text-xs text-slate-400 mt-2 font-medium">{description}</p>)}
        </div>
      </Card>
    </motion.div>);
};
export default StatCard;
