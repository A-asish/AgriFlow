import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Beef, MoreVertical, Activity, Heart, Baby, Milk, AlertCircle, MapPin, User, ArrowUpRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import adminService from '../../services/admin.api';
import { useAdminData } from '../../hooks/useAdminData';
import DataTable from '../../components/DataTable';
import SearchFilter from '../../components/SearchFilter';
import StatusBadge from '../../components/StatusBadge';
const Livestock = () => {
    const { data: livestockData, loading, setParams, refresh } = useAdminData({
        fetchFn: (p) => adminService.listLivestock(p)
    });
    const handleSearch = (term) => {
        setParams({ search: term, page: 1 });
        refresh();
    };
    const handleFilterChange = (key, value) => {
        setParams({ [key]: value, page: 1 });
        refresh();
    };
    const columns = [
        {
            header: 'Animal ID/Tag',
            accessor: (l) => (<div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
            <Beef className="w-5 h-5"/>
          </div>
          <div>
            <p className="font-black text-slate-800">{l.tag_number}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: #LV-{l.id.toString().padStart(4, '0')}</p>
          </div>
        </div>),
        },
        {
            header: 'Farmer/Owner',
            accessor: (l) => (<div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
            <User className="w-3.5 h-3.5"/>
            {l.farmer_name}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <MapPin className="w-3 h-3"/> Nepal
          </div>
        </div>),
        },
        {
            header: 'Type & Breed',
            accessor: (l) => (<div>
          <p className="text-sm font-black text-slate-700">{l.animal_type_name}</p>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-tight">{l.status}</p>
        </div>),
        },
        {
            header: 'Health State',
            accessor: (l) => <StatusBadge status={l.health_status}/>,
        },
        {
            header: 'Created On',
            accessor: (l) => (<div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">{new Date(l.created_at).toLocaleDateString()}</span>
        </div>),
        },
        {
            header: 'Actions',
            className: 'text-right',
            headerClassName: 'text-right',
            accessor: (l) => (<DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreVertical className="w-4 h-4 text-slate-400"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl w-48 shadow-xl border-slate-100 p-2">
            <DropdownMenuItem className="rounded-xl gap-3 font-bold text-slate-600 p-2.5 cursor-pointer">
              <Activity className="w-4 h-4 text-emerald-500"/> Medical Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl gap-3 font-bold text-slate-600 p-2.5 cursor-pointer">
              <Baby className="w-4 h-4 text-blue-500"/> Breeding Log
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-slate-50"/>
            <DropdownMenuItem className="rounded-xl gap-3 font-bold text-rose-500 p-2.5 hover:bg-rose-50 cursor-pointer">
              <AlertCircle className="w-4 h-4"/> Issue Warning
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>),
        },
    ];
    return (<AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Livestock Inventory</h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Monitoring platform-wide animal health and productivity.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none rounded-xl font-bold gap-2">
               <Activity className="w-4 h-4"/> Health Overview
            </Button>
            <Button className="flex-1 sm:flex-none rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100">
              <Baby className="w-4 h-4"/> Breeding Monitor
            </Button>
          </div>
        </div>

        {/* Dynamic Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <Card className="p-6 border-slate-100 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Heart className="w-6 h-6"/>
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Health Index</p>
                    <h3 className="text-xl font-black text-slate-800">94.2%</h3>
                 </div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 w-[94%]"/>
              </div>
           </Card>
           <Card className="p-6 border-slate-100 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Milk className="w-6 h-6"/>
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Daily Yield</p>
                    <h3 className="text-xl font-black text-slate-800">4,250L</h3>
                 </div>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 text-[10px] font-black uppercase tracking-tighter">
                 <ArrowUpRight className="w-3 h-3"/> 8% Increase
              </div>
           </Card>
           <Card className="p-6 border-slate-100 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Baby className="w-6 h-6"/>
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Gestation</p>
                    <h3 className="text-xl font-black text-slate-800">142 Animals</h3>
                 </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected this month: 24</p>
           </Card>
           <Card className="p-6 border-slate-100 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                    <AlertCircle className="w-6 h-6"/>
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Quarantine</p>
                    <h3 className="text-xl font-black text-slate-800">8 Critical</h3>
                 </div>
              </div>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Immediate action needed</p>
           </Card>
        </div>

        <div className="space-y-6">
           <SearchFilter onSearch={handleSearch} placeholder="Search animals, tags..." filters={[
            {
                label: 'Type',
                value: 'type',
                options: [
                    { label: 'Cattle', value: 'Cattle' },
                    { label: 'Goat', value: 'Goat' },
                    { label: 'Buffalo', value: 'Buffalo' },
                    { label: 'Pig', value: 'Pig' },
                ]
            },
            {
                label: 'Health Status',
                value: 'health_status',
                options: [
                    { label: 'Good', value: 'good' },
                    { label: 'Fair', value: 'fair' },
                    { label: 'Poor', value: 'poor' },
                ]
            }
        ]} onFilterChange={handleFilterChange}/>

           <DataTable columns={columns} data={livestockData?.livestock || []} loading={loading} emptyMessage="No livestock records found."/>
        </div>
      </div>
    </AdminLayout>);
};
export default Livestock;
