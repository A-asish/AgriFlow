import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/lib/utils';
const SearchFilter = ({ onSearch, filters, onFilterChange, placeholder = "Search...", className, extraActions, }) => {
    return (<Card className={cn("p-4 border-slate-100 shadow-sm", className)}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <Input placeholder={placeholder} className="pl-10 rounded-xl border-slate-200 focus:ring-emerald-500 h-10 w-full" onChange={(e) => onSearch(e.target.value)}/>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {filters?.map((filter) => (<div key={filter.value} className="flex items-center gap-2 flex-1 sm:flex-none min-w-35">
              {filter.value === 'region' && <Filter className="hidden sm:block w-4 h-4 text-slate-400 ml-2"/>}
              <select className="bg-slate-50 border-slate-200 rounded-xl text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 w-full" onChange={(e) => onFilterChange?.(filter.value, e.target.value)}>
                <option value="">{filter.label}</option>
                {filter.options.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>))}
          {extraActions}
        </div>
      </div>
    </Card>);
};
export default SearchFilter;
