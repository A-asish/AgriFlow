// src/features/admin/pages/Notifications.jsx

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  Bell, 
  Send, 
  Users, 
  Sprout, 
  Beef, 
  MapPin, 
  Search, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Check, 
  AlertTriangle,
  History,
  Info,
  Eye,
  X,
  Languages,
  Globe,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/shared/components/ui/select';
import adminService from '../services/admin.api';
import { toast } from 'sonner';
import NotificationDetailModal from '../components/NotificationDetailModal';

const notifTypeOptions = [
  { label: '📢 Broadcast', value: 'broadcast' },
  { label: '🎯 Targeted', value: 'targeted' },
  { label: '🌤️ Weather Alert', value: 'weather_alert' },
  { label: '🌾 Crop Care Reminder', value: 'crop_reminder' },
  { label: '🐄 Animal Care Reminder', value: 'animal_reminder' },
  { label: '💰 Marketing/Promotion', value: 'marketing' }
];

const targetTypeOptions = [
  { label: '🌍 All Farmers', value: 'all' },
  { label: '👤 Specific Farmers', value: 'individual' },
  { label: '🌱 Farmers of Specific Crop', value: 'crop' },
  { label: '🐄 Farmers of Specific Livestock', value: 'livestock' },
  { label: '🗺️ Farmers of Specific Region', value: 'region' },
  { label: '📍 Farmers of Specific District', value: 'district' }
];

const regionOptions = [
  { label: '🏔️ Terai Region', value: 'terai' },
  { label: '⛰️ Hilly Region', value: 'hilly' },
  { label: '🏔️ Himalayan Region', value: 'himalayan' }
];

const priorityOptions = [
  { label: '🟢 Low', value: 'low' },
  { label: '🟡 Medium', value: 'medium' },
  { label: '🟠 High', value: 'high' },
  { label: '🔴 Urgent', value: 'urgent' }
];

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

const typeIcons = {
  broadcast: '📢',
  targeted: '🎯',
  weather_alert: '🌤️',
  crop_reminder: '🌾',
  animal_reminder: '🐄',
  marketing: '💰'
};

const typeLabels = {
  broadcast: 'Broadcast',
  targeted: 'Targeted',
  weather_alert: 'Weather Alert',
  crop_reminder: 'Crop Reminder',
  animal_reminder: 'Animal Reminder',
  marketing: 'Marketing/Promo'
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return 'N/A';
  }
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('new');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State - English
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  // Form State - Nepali
  const [titleNp, setTitleNp] = useState('');
  const [messageNp, setMessageNp] = useState('');
  
  const [notifType, setNotifType] = useState('broadcast');
  const [priority, setPriority] = useState('medium');
  const [targetType, setTargetType] = useState('all');
  const [sendEmail, setSendEmail] = useState(false);

  // Target inputs
  const [targetCrop, setTargetCrop] = useState('');
  const [targetLivestock, setTargetLivestock] = useState('');
  const [targetRegion, setTargetRegion] = useState('');
  const [targetDistrict, setTargetDistrict] = useState('');

  // Farmers list (for individual targeting)
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmers, setSelectedFarmers] = useState([]);
  const [farmersSearch, setFarmersSearch] = useState('');
  const [farmersLoading, setFarmersLoading] = useState(false);

  // History State
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 1
  });

  // Load farmers if individual targeting is selected
  useEffect(() => {
    if (targetType === 'individual' && farmers.length === 0) {
      fetchFarmers();
    }
  }, [targetType]);

  const fetchFarmers = async () => {
    setFarmersLoading(true);
    try {
      const res = await adminService.listFarmers({ page_size: 100 });
      setFarmers(res.data?.farmers || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load farmers list');
    } finally {
      setFarmersLoading(false);
    }
  };

  // Load sent history
  const fetchHistory = async (page = 1) => {
    setHistoryLoading(true);
    try {
      const res = await adminService.listNotifications({ page });
      setHistory(res.data?.notifications || []);
      setPagination(res.data?.pagination || {
        total: 0,
        page: 1,
        page_size: 20,
        total_pages: 1
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sent notifications log');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory(1);
    }
  }, [activeTab]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter both title and message in English');
      return;
    }

    if (!titleNp.trim() || !messageNp.trim()) {
      toast.error('Please enter both title and message in Nepali');
      return;
    }

    if (targetType === 'individual' && selectedFarmers.length === 0) {
      toast.error('Please select at least one farmer');
      return;
    }

    if (targetType === 'crop' && !targetCrop.trim()) {
      toast.error('Please specify a crop');
      return;
    }

    if (targetType === 'livestock' && !targetLivestock.trim()) {
      toast.error('Please specify livestock type');
      return;
    }

    if (targetType === 'region' && !targetRegion) {
      toast.error('Please select a geographical region');
      return;
    }

    if (targetType === 'district' && !targetDistrict.trim()) {
      toast.error('Please specify a district');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        title_np: titleNp.trim(),
        message: message.trim(),
        message_np: messageNp.trim(),
        notification_type: notifType,
        priority,
        target_type: targetType,
        send_email: sendEmail
      };

      if (targetType === 'individual') {
        payload.target_farmers = selectedFarmers;
      } else if (targetType === 'crop') {
        payload.target_crop = targetCrop;
      } else if (targetType === 'livestock') {
        payload.target_livestock = targetLivestock;
      } else if (targetType === 'region') {
        payload.target_region = targetRegion;
      } else if (targetType === 'district') {
        payload.target_district = targetDistrict;
      }

      await adminService.sendNotification(payload);
      toast.success('Notification broadcasted successfully in both English and Nepali!');
      
      // Clear Form
      setTitle('');
      setMessage('');
      setTitleNp('');
      setMessageNp('');
      setNotifType('broadcast');
      setPriority('medium');
      setTargetType('all');
      setSendEmail(false);
      setSelectedFarmers([]);
      setTargetCrop('');
      setTargetLivestock('');
      setTargetRegion('');
      setTargetDistrict('');
      
      // Go to history tab
      setActiveTab('history');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFarmer = (id) => {
    if (selectedFarmers.includes(id)) {
      setSelectedFarmers(prev => prev.filter(fid => fid !== id));
    } else {
      setSelectedFarmers(prev => [...prev, id]);
    }
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const filteredFarmers = farmers.filter(f => {
    const searchLower = farmersSearch.toLowerCase();
    return (
      f.full_name?.toLowerCase().includes(searchLower) ||
      f.username?.toLowerCase().includes(searchLower) ||
      f.farm_name?.toLowerCase().includes(searchLower) ||
      f.phone?.toLowerCase().includes(searchLower)
    );
  });

  const getTargetDescription = (item) => {
    switch (item.target_type) {
      case 'individual':
        return `Targeted: Specific Farmers`;
      case 'crop':
        return `Crop: ${item.target_crop || 'N/A'}`;
      case 'livestock':
        return `Livestock: ${item.target_livestock || 'N/A'}`;
      case 'region':
        return `Region: ${item.target_region ? (item.target_region.charAt(0).toUpperCase() + item.target_region.slice(1)) : 'N/A'}`;
      case 'district':
        return `District: ${item.target_district || 'N/A'}`;
      default:
        return 'Broadcast: All Farmers';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Ecosystem Notifications</h1>
          <p className="text-slate-500 font-medium">Broadcast admin announcements or send targeted notices to farmers based on filters.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
          <TabsList className="bg-slate-100 rounded-xl p-1 h-auto flex flex-wrap max-w-md">
            <TabsTrigger value="new" className="rounded-lg font-bold px-6 py-2.5 flex-1 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Send Notification
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg font-bold px-6 py-2.5 flex-1 flex items-center justify-center gap-2">
              <History className="w-4 h-4" /> Sent History
            </TabsTrigger>
          </TabsList>

          {/* New Notification Tab */}
          <TabsContent value="new" className="m-0">
            <form onSubmit={handleSend} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Notification details */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-emerald-600" /> Notification Content
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-xs font-medium">
                        Enter the notification content in both English and Nepali
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* English Title */}
                      <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <span>🇬🇧</span> Title (English) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          placeholder="Enter notification title in English..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="rounded-lg border-slate-200 h-11 font-medium focus-visible:ring-emerald-500"
                          required
                        />
                      </div>

                      {/* Nepali Title */}
                      <div className="space-y-1.5">
                        <Label htmlFor="titleNp" className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <Languages className="w-3.5 h-3.5 text-purple-500" /> Title (नेपाली) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="titleNp"
                          placeholder="शीर्षक नेपालीमा लेख्नुहोस्..."
                          value={titleNp}
                          onChange={(e) => setTitleNp(e.target.value)}
                          className="rounded-lg border-slate-200 h-11 font-medium focus-visible:ring-emerald-500"
                          required
                        />
                      </div>

                      {/* English Message */}
                      <div className="space-y-1.5">
                        <Label htmlFor="message" className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <span>🇬🇧</span> Message (English) <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Enter message in English..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="rounded-lg border-slate-200 min-h-30 font-medium focus-visible:ring-emerald-500"
                          required
                        />
                      </div>

                      {/* Nepali Message */}
                      <div className="space-y-1.5">
                        <Label htmlFor="messageNp" className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <Languages className="w-3.5 h-3.5 text-purple-500" /> Message (नेपाली) <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="messageNp"
                          placeholder="सन्देश नेपालीमा लेख्नुहोस्..."
                          value={messageNp}
                          onChange={(e) => setMessageNp(e.target.value)}
                          className="rounded-lg border-slate-200 min-h-30 font-medium focus-visible:ring-emerald-500"
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notification Settings Card */}
                  <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-emerald-600" /> Notification Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="notifType" className="text-xs font-bold text-slate-500">
                            Notification Type
                          </Label>
                          <Select value={notifType} onValueChange={setNotifType}>
                            <SelectTrigger className="rounded-lg border-slate-200 h-11 focus:ring-emerald-500">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                              {notifTypeOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="rounded-lg font-medium py-2">
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="priority" className="text-xs font-bold text-slate-500">
                            Priority Level
                          </Label>
                          <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger className="rounded-lg border-slate-200 h-11 focus:ring-emerald-500">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                              {priorityOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="rounded-lg font-medium py-2">
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <Checkbox 
                          id="sendEmail" 
                          checked={sendEmail} 
                          onCheckedChange={setSendEmail}
                          className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <Label htmlFor="sendEmail" className="font-medium text-slate-600 cursor-pointer text-sm select-none flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          Also dispatch email alerts to targeted farmers
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Targeting panel */}
                <div className="space-y-6">
                  <Card className="border-slate-100 shadow-sm sticky top-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" /> Target Audience
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-xs font-medium">
                        Select who should receive this notification
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="targetType" className="text-xs font-bold text-slate-500">
                          Filter Criteria
                        </Label>
                        <Select value={targetType} onValueChange={setTargetType}>
                          <SelectTrigger className="rounded-lg border-slate-200 h-11 focus:ring-emerald-500">
                            <SelectValue placeholder="Select target criteria" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg">
                            {targetTypeOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value} className="rounded-lg font-medium py-2">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Dynamic Filters depending on targetType */}
                      {targetType === 'all' && (
                        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-start gap-2 border border-emerald-100">
                          <Info className="w-4 h-4 shrink-0 mt-0.5" />
                          <div className="text-sm font-medium">
                            This broadcast will target every active farmer registered on AgriFlow.
                          </div>
                        </div>
                      )}

                      {targetType === 'crop' && (
                        <div className="space-y-1.5 animate-in fade-in duration-300">
                          <Label htmlFor="targetCrop" className="text-xs font-bold text-slate-500">
                            <Sprout className="w-3.5 h-3.5 inline mr-1" /> Crop Name
                          </Label>
                          <Input
                            id="targetCrop"
                            placeholder="e.g. Rice, Wheat, Potato"
                            value={targetCrop}
                            onChange={(e) => setTargetCrop(e.target.value)}
                            className="rounded-lg border-slate-200 h-11 font-medium focus-visible:ring-emerald-500"
                          />
                          <p className="text-[10px] text-slate-400 font-medium">Targets farmers with active cycles of this crop.</p>
                        </div>
                      )}

                      {targetType === 'livestock' && (
                        <div className="space-y-1.5 animate-in fade-in duration-300">
                          <Label htmlFor="targetLivestock" className="text-xs font-bold text-slate-500">
                            <Beef className="w-3.5 h-3.5 inline mr-1" /> Livestock Type
                          </Label>
                          <Input
                            id="targetLivestock"
                            placeholder="e.g. Cow, Buffalo, Goat"
                            value={targetLivestock}
                            onChange={(e) => setTargetLivestock(e.target.value)}
                            className="rounded-lg border-slate-200 h-11 font-medium focus-visible:ring-emerald-500"
                          />
                          <p className="text-[10px] text-slate-400 font-medium">Targets farmers owning active livestock of this species.</p>
                        </div>
                      )}

                      {targetType === 'region' && (
                        <div className="space-y-1.5 animate-in fade-in duration-300">
                          <Label htmlFor="targetRegion" className="text-xs font-bold text-slate-500">
                            <MapPin className="w-3.5 h-3.5 inline mr-1" /> Geographical Region
                          </Label>
                          <Select value={targetRegion} onValueChange={setTargetRegion}>
                            <SelectTrigger className="rounded-lg border-slate-200 h-11 focus:ring-emerald-500">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                              {regionOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="rounded-lg font-medium py-2">
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {targetType === 'district' && (
                        <div className="space-y-1.5 animate-in fade-in duration-300">
                          <Label htmlFor="targetDistrict" className="text-xs font-bold text-slate-500">
                            <MapPin className="w-3.5 h-3.5 inline mr-1" /> District Name
                          </Label>
                          <Input
                            id="targetDistrict"
                            placeholder="e.g. Kathmandu, Lalitpur, Kaski"
                            value={targetDistrict}
                            onChange={(e) => setTargetDistrict(e.target.value)}
                            className="rounded-lg border-slate-200 h-11 font-medium focus-visible:ring-emerald-500"
                          />
                        </div>
                      )}

                      {targetType === 'individual' && (
                        <div className="space-y-3 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-slate-500">
                              <Users className="w-3.5 h-3.5 inline mr-1" /> Select Farmers
                            </Label>
                            {selectedFarmers.length > 0 && (
                              <Badge className="bg-emerald-600 text-white rounded-lg text-xs">
                                {selectedFarmers.length} selected
                              </Badge>
                            )}
                          </div>

                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              placeholder="Search farmers..."
                              value={farmersSearch}
                              onChange={(e) => setFarmersSearch(e.target.value)}
                              className="pl-9 h-10 rounded-lg text-sm border-slate-200"
                            />
                          </div>

                          {farmersLoading ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            </div>
                          ) : (
                            <div className="border border-slate-100 rounded-lg max-h-52 overflow-y-auto divide-y divide-slate-50 bg-slate-50/20 p-1.5">
                              {filteredFarmers.length === 0 ? (
                                <div className="text-center py-4 text-sm text-slate-400 font-medium">
                                  No farmers found
                                </div>
                              ) : (
                                filteredFarmers.map(farmer => (
                                  <div 
                                    key={farmer.id}
                                    onClick={() => handleSelectFarmer(farmer.id)}
                                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                                      selectedFarmers.includes(farmer.id) 
                                        ? 'bg-emerald-50 text-emerald-800' 
                                        : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <div>
                                      <p className="font-bold text-sm">{farmer.full_name || farmer.username}</p>
                                      <p className="text-xs text-slate-400 font-medium">Farm: {farmer.farm_name || 'N/A'}</p>
                                    </div>
                                    <Checkbox 
                                      checked={selectedFarmers.includes(farmer.id)}
                                      onCheckedChange={() => handleSelectFarmer(farmer.id)}
                                      className="rounded border-slate-300"
                                    />
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Send Button - Full width at bottom */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading}
                  size="lg"
                  className="rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 shadow-lg shadow-emerald-100 gap-2 flex items-center justify-center min-w-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <Languages className="w-4 h-4" />
                      Dispatch Announcement (EN / NP)
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Sent History Tab */}
          <TabsContent value="history" className="m-0">
            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Dispatch Log</CardTitle>
                  <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Audit Trail of Sent Messages</CardDescription>
                </div>
                <Badge variant="outline" className="h-7 px-3 bg-white font-bold border-slate-200">
                  Total Dispatched: {pagination.total}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                    <span className="font-semibold text-sm">Fetching notification log...</span>
                  </div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
                    <Bell className="w-12 h-12 text-slate-300 mb-4 stroke-[1.5]" />
                    <h4 className="text-base font-bold text-slate-700">No sent notifications found</h4>
                    <p className="text-sm font-medium mt-1">You haven't broadcasted any notification from this server yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {history.map(item => (
                      <div key={item.id} className="p-6 hover:bg-slate-50/30 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2 max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-lg">{typeIcons[item.notification_type] || '📢'}</span>
                              <h4 className="font-bold text-slate-800 text-base">{item.title}</h4>
                              {item.title_np && (
                                <Badge variant="outline" className="font-semibold rounded-lg bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                  <Languages className="w-3 h-3 mr-1" /> {item.title_np}
                                </Badge>
                              )}
                              <Badge variant="outline" className={`font-semibold rounded-lg text-xs ${priorityColors[item.priority] || 'bg-slate-100 text-slate-800'}`}>
                                {item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : 'Medium'}
                              </Badge>
                              <Badge className="bg-slate-800 text-white border-0 rounded-lg text-[10px] font-bold py-0.5 px-2">
                                {typeLabels[item.notification_type] || 'Announce'}
                              </Badge>
                            </div>
                            
                            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                              {item.message}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-300" /> {getTargetDescription(item)}
                              </span>
                              <span>•</span>
                              <span>Sent by: {item.sent_by_name || 'System Admin'}</span>
                              {item.title_np && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-purple-600">
                                    <Languages className="w-3 h-3" /> Bilingual
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                              {formatDate(item.sent_at)}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewNotification(item)}
                              className="rounded-lg font-semibold h-8 px-3 text-xs flex items-center gap-1 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Full
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              {/* Pagination */}
              {!historyLoading && pagination.total_pages > 1 && (
                <div className="p-4 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-400">
                    Showing page {pagination.page} of {pagination.total_pages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchHistory(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="rounded-lg font-bold h-9 px-4"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchHistory(pagination.page + 1)}
                      disabled={pagination.page === pagination.total_pages}
                      className="rounded-lg font-bold h-9 px-4"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
      />
    </AdminLayout>
  );
}