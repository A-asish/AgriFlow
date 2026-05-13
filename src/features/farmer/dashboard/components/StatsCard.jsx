import { cn } from '@/lib/utils';
export function StatCard({ title, value, subtitle, icon: Icon, variant = 'default' }) {
    const variants = {
        default: 'bg-white border-gray-100',
        green: 'bg-green-50 border-green-200',
        blue: 'bg-blue-50 border-blue-200',
        amber: 'bg-amber-50 border-amber-200',
        rose: 'bg-rose-50 border-rose-200',
    };
    const iconColors = {
        default: 'text-gray-500 bg-gray-100',
        green: 'text-green-600 bg-green-100',
        blue: 'text-blue-600 bg-blue-100',
        amber: 'text-amber-600 bg-amber-100',
        rose: 'text-rose-600 bg-rose-100',
    };
    const textColors = {
        default: 'text-gray-900',
        green: 'text-green-800',
        blue: 'text-blue-800',
        amber: 'text-amber-800',
        rose: 'text-rose-800',
    };
    return (<div className={cn("rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-200", variants[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 sm:space-y-3">
          <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
          <h3 className={cn("text-xl sm:text-2xl md:text-3xl font-extrabold", textColors[variant])}>{value}</h3>
          {subtitle && <p className="text-[10px] sm:text-xs text-gray-500 font-medium">{subtitle}</p>}
        </div>
        <div className={cn("p-2 sm:p-3 rounded-xl sm:rounded-2xl", iconColors[variant])}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6"/>
        </div>
      </div>
    </div>);
}
