// src/features/admin/components/StatCard.jsx
import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCompactCurrency, formatCompactNumber } from '../utils/helpers';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  trendValue, 
  subtitle, 
  className,
  isCurrency = false
}) => {
  const formattedValue = isCurrency 
    ? formatCompactCurrency(value) 
    : formatCompactNumber(value);
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={cn("p-4 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300", className)}>
        <div className="flex justify-between items-start mb-3">
          <div className={cn("p-2 rounded-xl flex items-center justify-center", color)}>
            <Icon className="w-5 h-5 text-white"/>
          </div>
          {trend && (
            <div className={cn("flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md", 
              trend === 'up' ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
            )}>
              {trend === 'up' ? <TrendingUp className="w-2.5 h-2.5"/> : <TrendingDown className="w-2.5 h-2.5"/>}
              {trendValue}%
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {formattedValue}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-slate-400 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;