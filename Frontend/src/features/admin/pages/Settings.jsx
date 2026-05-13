import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { Shield, Sprout, Beef, Plus, Trash2, Edit, Save, Key, Globe, BellRing } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Switch } from '@/shared/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
const Settings = () => {
    const { user } = useAuth();
    const handleSaveProfile = () => {
        toast.success('System configuration synchronized');
    };
    return (<AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">System Configuration</h1>
          <p className="text-slate-500 font-medium">Manage ecosystem parameters and administrative security.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6 sm:space-y-8">
           <TabsList className="bg-slate-100 rounded-xl p-1 h-auto flex flex-wrap lg:flex-nowrap">
              <TabsTrigger value="profile" className="rounded-lg font-bold px-4 sm:px-6 py-2 flex-1">Account</TabsTrigger>
              <TabsTrigger value="categories" className="rounded-lg font-bold px-4 sm:px-6 py-2 flex-1">Taxonomies</TabsTrigger>
              <TabsTrigger value="system" className="rounded-lg font-bold px-4 sm:px-6 py-2 flex-1">Global</TabsTrigger>
           </TabsList>

           {/* Profile Settings */}
           <TabsContent value="profile" className="m-0 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <Card className="p-8 border-slate-100 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-3xl bg-slate-800 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-slate-100 mb-6">
                       {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">{user?.full_name || 'AgriFlow Admin'}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Master Administrator</p>
                    <div className="w-full pt-6 border-t border-slate-50 space-y-4">
                       <Button variant="outline" className="w-full rounded-xl font-bold h-12">Edit Profile</Button>
                       <Button variant="destructive" className="w-full rounded-xl font-bold h-12 bg-rose-50 text-rose-500 border-0 hover:bg-rose-100 shadow-none">Restrict Access</Button>
                    </div>
                 </Card>

                 <Card className="lg:col-span-2 p-8 border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                       <Shield className="w-5 h-5 text-emerald-500"/> Administrative Security
                    </h3>
                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Admin Username</label>
                             <Input defaultValue={user?.username} className="rounded-xl border-slate-200 h-12 font-bold px-4"/>
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Recovery Email</label>
                             <Input defaultValue={user?.email} className="rounded-xl border-slate-200 h-12 font-bold px-4"/>
                          </div>
                       </div>
                       
                       <div className="pt-6 border-t border-slate-50 space-y-6">
                          <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                             <Key className="w-4 h-4 text-blue-500"/> Access Credentials
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current Secret</label>
                                <Input type="password" placeholder="••••••••" className="rounded-xl border-slate-200 h-12 font-bold px-4"/>
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Secret</label>
                                <Input type="password" placeholder="Update passphrase" className="rounded-xl border-slate-200 h-12 font-bold px-4"/>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-10 flex justify-end">
                       <Button className="rounded-xl font-black bg-emerald-600 px-10 py-6 text-white shadow-lg shadow-emerald-100 gap-2" onClick={handleSaveProfile}>
                          <Save className="w-4 h-4"/> Commit Changes
                       </Button>
                    </div>
                 </Card>
              </div>
           </TabsContent>

           {/* Categories Management */}
           <TabsContent value="categories" className="m-0 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card className="p-8 border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                             <Sprout className="w-5 h-5"/>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800">Crop Taxonomies</h3>
                       </div>
                       <Button size="sm" className="bg-slate-900 text-white rounded-xl font-bold h-10 gap-2">
                          <Plus className="w-4 h-4"/> Define Type
                       </Button>
                    </div>
                    <div className="space-y-3">
                       {['Cereals', 'Vegetables', 'Fruits', 'Legumes'].map((item) => (<div key={item} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 flex items-center justify-between group h-16">
                             <span className="font-extrabold text-slate-700">{item}</span>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 text-blue-500 hover:bg-blue-50"><Edit className="w-4 h-4"/></Button>
                                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 text-rose-500 hover:bg-rose-50"><Trash2 className="w-4 h-4"/></Button>
                             </div>
                         </div>))}
                    </div>
                 </Card>

                 <Card className="p-8 border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                             <Beef className="w-5 h-5"/>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800">Livestock Species</h3>
                       </div>
                       <Button size="sm" className="bg-slate-900 text-white rounded-xl font-bold h-10 gap-2">
                          <Plus className="w-4 h-4"/> Define Type
                       </Button>
                    </div>
                    <div className="space-y-3">
                       {['Cattle', 'Goat', 'Poultry', 'Pig'].map((item) => (<div key={item} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 flex items-center justify-between group h-16">
                             <span className="font-extrabold text-slate-700">{item}</span>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 text-blue-500 hover:bg-blue-50"><Edit className="w-4 h-4"/></Button>
                                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 text-rose-500 hover:bg-rose-50"><Trash2 className="w-4 h-4"/></Button>
                             </div>
                         </div>))}
                    </div>
                 </Card>
              </div>
           </TabsContent>

           {/* Global Config */}
           <TabsContent value="system" className="m-0">
              <Card className="border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
                    <Badge className="bg-emerald-600 text-white border-0 rounded-lg">LIVE</Badge>
                    <div>
                       <h3 className="text-lg font-bold text-slate-800">Ecosystem Parameters</h3>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Global Application Logic</p>
                    </div>
                 </div>
                 <div className="p-8 divide-y divide-slate-50">
                    <div className="py-6 flex items-center justify-between first:pt-0">
                       <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 flex items-center gap-2">
                             <Globe className="w-4 h-4 text-blue-500"/> Network Indexing
                          </h4>
                          <p className="text-sm text-slate-400 font-medium">Allow public search engines to discover verified farm profiles.</p>
                       </div>
                       <Switch defaultChecked={true} className="data-[state=checked]:bg-emerald-600"/>
                    </div>
                    <div className="py-6 flex items-center justify-between">
                       <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 flex items-center gap-2">
                             <BellRing className="w-4 h-4 text-emerald-500"/> Auto-Approval Flow
                          </h4>
                          <p className="text-sm text-slate-400 font-medium">Automatically approve registrations from white-listed regions.</p>
                       </div>
                       <Switch defaultChecked={false} className="data-[state=checked]:bg-emerald-600"/>
                    </div>
                 </div>
                 <div className="p-8 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-50">
                    <Button variant="ghost" className="rounded-xl font-bold px-8">Discard</Button>
                    <Button className="rounded-xl font-black bg-slate-900 text-white px-8 h-12 shadow-lg shadow-slate-100" onClick={handleSaveProfile}>Update Config</Button>
                 </div>
              </Card>
           </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>);
};
export default Settings;
