import React from 'react';
import { cn } from "@/lib/utils";
import AdminLayout from '../../components/AdminLayout';
import { Sprout, MoreVertical, Calendar, User, Plus, MapPin } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import adminService from '../../services/admin.api';
import { useAdminData } from '../../hooks/useAdminData';
import DataTable from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';
const Crops = () => {
    const { data: cropsData, loading, setParams, refresh } = useAdminData({
        fetchFn: (p) => adminService.listCrops(p)
    });
    const handleSearch = (term) => {
        setParams({ search: term, page: 1 });
        refresh();
    };
    const handleFilterChange = (key, value) => {
        setParams({ [key]: value, page: 1 });
        refresh();
    };
    const getStageColor = (stage) => {
        const s = stage?.toLowerCase();
        switch (s) {
            case 'harvest': return 'bg-emerald-500';
            case 'fruiting': return 'bg-amber-500';
            case 'flowering': return 'bg-pink-500';
            case 'vegetative': return 'bg-blue-500';
            case 'seeding': return 'bg-slate-400';
            default: return 'bg-slate-200';
        }
    };
    const columns = [
        {
            header: 'Crop Details',
            accessor: (c) => (<div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md", getStageColor(c.growth_stage))}>
            <Sprout className="w-5 h-5"/>
          </div>
          <div>
            <p className="font-bold text-slate-800">{c.name}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.variety || 'Standard'}</p>
          </div>
        </div>),
        },
        {
            header: 'Farmer',
            accessor: (c) => (<div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-400"/>
          <span className="text-sm font-bold text-slate-600">{c.farmer_name}</span>
        </div>),
        },
        {
            header: 'Field Info',
            accessor: (c) => (<div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
             <MapPin className="w-3 h-3"/> {c.field_name || 'N/A'}
          </div>
          <p className="text-xs font-semibold text-slate-400">{c.field_area} {c.area_unit}</p>
        </div>),
        },
        {
            header: 'Growth Phase',
            accessor: (c) => (<div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight text-slate-400">
             <span>{c.growth_stage_display}</span>
          </div>
          <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
             <div className={cn("h-full", getStageColor(c.growth_stage))} style={{ width: '75%' }}/>
          </div>
        </div>),
        },
        {
            header: 'Status',
            accessor: (c) => <StatusBadge status={c.status}/>,
        },
        {
            header: 'Dates',
            accessor: (c) => (<div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Planted: {formatDate(c.planting_date)}</p>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Harvest: {formatDate(c.expected_harvest_date)}</p>
        </div>),
        },
        {
            header: 'Actions',
            className: 'text-right',
            headerClassName: 'text-right',
            accessor: (c) => (<DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreVertical className="w-4 h-4 text-slate-400"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl w-48 shadow-xl border-slate-100 p-2">
            <DropdownMenuItem className="rounded-xl gap-3 font-bold text-slate-600 cursor-pointer p-2.5">
              <Sprout className="w-4 h-4 text-emerald-500"/> Inspect Lifecycle
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl gap-3 font-bold text-slate-600 cursor-pointer p-2.5">
              <Calendar className="w-4 h-4 text-blue-500"/> Schedule Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>),
        },
    ];
    return (<AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Crop Inventory</h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Monitoring cultivation cycles across the platform.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button className="flex-1 sm:flex-none rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100">
              <Plus className="w-4 h-4"/> Register Crop
            </Button>
          </div>
        </div>

        <SearchFilter onSearch={handleSearch} placeholder="Search crops or farmers..." filters={[
            {
                label: 'Status',
                value: 'status',
                options: [
                    { label: 'Active', value: 'active' },
                    { label: 'Harvested', value: 'harvested' },
                    { label: 'Done', value: 'done' },
                ]
            },
            {
                label: 'Stage',
                value: 'growth_stage',
                options: [
                    { label: 'Seeding', value: 'seeding' },
                    { label: 'Vegetative', value: 'vegetative' },
                    { label: 'Flowering', value: 'flowering' },
                    { label: 'Fruiting', value: 'fruiting' },
                    { label: 'Harvest', value: 'harvest' },
                ]
            }
        ]} onFilterChange={handleFilterChange}/>

        <DataTable columns={columns} data={cropsData?.crops || []} loading={loading} emptyMessage="No active crops found."/>
      </div>
    </AdminLayout>);
};
export default Crops;
