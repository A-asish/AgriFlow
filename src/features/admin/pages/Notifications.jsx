import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { Bell, Send, MessageSquare, AlertTriangle, History, MoreVertical, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import adminService from '../services/admin.api';
import { useAdminData } from '../hooks/useAdminData';
import DataTable from '../components/DataTable';
import { formatDate } from '../utils/helpers';
import { toast } from 'sonner';
const Notifications = () => {
    const { data: historyData, loading, refresh } = useAdminData({
        fetchFn: () => adminService.listNotifications()
    });
    const templates = [
        { id: 'weather', icon: AlertTriangle, title: 'Extreme Weather', text: 'Alert: High probability of [Event] in [Location] over the next 24 hours. Please take necessary precautions for your crops.' },
        { id: 'reminder', icon: Bell, title: 'Care Reminder', text: 'Reminder: It is time for [Activity] for your [Crop/Animal]. Regular monitoring ensures better yield.' },
        { id: 'marketing', icon: MessageSquare, title: 'Opportunity', text: 'Exciting news! A new [Program/Market] is now available for farmers in [Region]. Tap to learn more.' },
    ];
    const handleSend = () => {
        toast.loading('Broadcasting message...');
        setTimeout(() => {
            toast.dismiss();
            toast.success('Notification broadcasted to targeted segments!');
            refresh();
        }, 2000);
    };
    const columns = [
        {
            header: 'Title & Topic',
            accessor: (n) => (<div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
             <Bell className="w-5 h-5"/>
          </div>
          <div>
             <p className="font-black text-slate-700 tracking-tight">{n.title}</p>
             <div className="flex gap-2 mt-1">
                <Badge variant="secondary" className="rounded-lg bg-slate-100 text-slate-400 font-bold px-2 py-0 text-[10px] uppercase">Announcement</Badge>
                {n.is_read && (<div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase">
                    <CheckCircle2 className="w-3 h-3"/> Broadcast
                  </div>)}
             </div>
          </div>
        </div>),
        },
        {
            header: 'Message Preview',
            accessor: (n) => (<p className="text-sm font-medium text-slate-400 truncate max-w-xs">{n.message}</p>),
        },
        {
            header: 'Dispatched On',
            accessor: (n) => (<span className="text-sm font-bold text-slate-400">{formatDate(n.created_at || new Date().toISOString())}</span>),
        },
        {
            header: 'Actions',
            className: 'text-right',
            headerClassName: 'text-right',
            accessor: (n) => (<div className="flex items-center justify-end gap-1">
           <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
              <Trash2 className="w-4 h-4"/>
           </Button>
           <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <MoreVertical className="w-5 h-5 text-slate-300"/>
           </Button>
        </div>),
        },
    ];
    return (<AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Communication Center</h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Broadcast news, alerts, and critical updates to your farm network.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Composer */}
           <Card className="lg:col-span-2 p-4 sm:p-8 border-slate-100 shadow-sm flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                 <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                    <Send className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500"/>
                    New Broadcast
                 </h3>
                 <Badge variant="outline" className="rounded-xl px-4 py-1.5 font-bold uppercase tracking-widest text-[9px] w-fit">Auto-saved</Badge>
              </div>

              <div className="space-y-6 flex-1">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                       <Input placeholder="Enter notification title..." className="rounded-xl border-slate-200 h-12 font-bold px-4 focus:ring-emerald-500"/>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Segment</label>
                       <select className="w-full bg-slate-50 border-slate-200 h-12 rounded-xl px-4 font-bold text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500">
                          <option>All Registered Farmers</option>
                          <option>Terai Region Only</option>
                          <option>Hilly Region Only</option>
                          <option>Mountain Region Only</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                    <Textarea placeholder="Type your message here..." className="rounded-2xl border-slate-200 min-h-40 font-semibold p-4 focus:ring-emerald-500"/>
                 </div>
              </div>

              <div className="flex gap-4 mt-8 pt-8 border-t border-slate-50">
                 <Button variant="ghost" className="flex-1 rounded-xl h-14 font-black text-slate-400 hover:bg-slate-50">Save as Template</Button>
                 <Button className="flex-1 rounded-xl h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-100 gap-2" onClick={handleSend}>
                    Dispatch Notification <Send className="w-4 h-4"/>
                 </Button>
              </div>
           </Card>

           {/* Templates & Tools */}
           <div className="space-y-8">
              <Card className="p-8 border-slate-100 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <History className="w-16 h-16"/>
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 mb-6">Standard Templates</h3>
                 <div className="space-y-4">
                    {templates.map((tpl) => (<div key={tpl.id} className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all cursor-pointer group">
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                               <tpl.icon className="w-4 h-4"/>
                            </div>
                            <span className="text-sm font-black text-slate-700">{tpl.title}</span>
                         </div>
                         <p className="text-[10px] font-semibold text-slate-400 leading-relaxed overflow-hidden line-clamp-2">{tpl.text}</p>
                      </div>))}
                 </div>
                 <Button variant="ghost" className="w-full mt-6 rounded-xl font-bold gap-2 text-slate-400 group">
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform"/> Create New Template
                 </Button>
              </Card>

              <Card className="p-8 border-slate-100 bg-slate-900 text-white overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <AlertTriangle className="w-20 h-20"/>
                 </div>
                 <h3 className="text-lg font-bold mb-4 relative z-10">Emergency System</h3>
                 <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6 relative z-10">
                    Broadcast critical failure warnings or system outages.
                 </p>
                 <Button className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 font-black relative z-10">Trigger Alerts</Button>
              </Card>
           </div>
        </div>

        {/* History Table */}
        <Card className="border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <History className="w-5 h-5 text-slate-300"/>
                 Dispatch Archive
              </h3>
           </div>
           
           <DataTable columns={columns} data={historyData?.notifications || []} loading={loading} emptyMessage="No broadcast history found."/>
        </Card>
      </div>
    </AdminLayout>);
};
export default Notifications;
