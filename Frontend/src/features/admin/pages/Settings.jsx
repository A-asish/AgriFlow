// src/features/admin/pages/Settings.jsx

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  User, Mail, Key, Save, Loader2, Eye, EyeOff, 
  Check, Database, LogOut, Smartphone
} from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import adminService from '../services/admin.api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // ============ STATE ============
  
  // Profile State
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  
  // Password Change State
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Loading States
  const [savingProfile, setSavingProfile] = useState(false);
  
  // ============ FETCH FUNCTIONS ============
  
  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await adminService.getProfile();
      if (res.data) {
        setProfileData({
          username: res.data.username || '',
          email: res.data.email || '',
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          phone: res.data.phone || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      toast.error('Failed to load profile data');
    } finally {
      setProfileLoading(false);
    }
  };
  
  // ============ INITIAL LOAD ============
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  // ============ PROFILE HANDLERS ============
  
  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      await adminService.updateProfile({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
      });
      toast.success('Profile updated successfully');
      await fetchProfile();
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };
  
  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    if (!passwordData.old_password) {
      toast.error('Please enter your current password');
      return;
    }
    
    setPasswordLoading(true);
    try {
      await adminService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
      });
      toast.success('Password changed successfully');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      console.error('Failed to change password:', err);
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  // ============ LOGOUT ============
  
  const handleLogout = async () => {
    try {
      await adminService.logout({ refresh: localStorage.getItem('refresh_token') });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      logout();
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };
  
  // ============ RENDER HELPERS ============
  
  const renderLoading = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  );
  
  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Settings</h1>
          <p className="text-slate-500 font-medium">Manage your account settings.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-slate-100 rounded-xl p-1 h-auto flex flex-wrap">
            <TabsTrigger value="profile" className="rounded-lg font-bold px-6 py-2 flex-1">
              <User className="w-4 h-4 mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="rounded-lg font-bold px-6 py-2 flex-1">
              <Key className="w-4 h-4 mr-2" /> Password
            </TabsTrigger>
          </TabsList>

          {/* ============================================================ */}
          {/* PROFILE TAB */}
          {/* ============================================================ */}
          <TabsContent value="profile" className="m-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <Card className="p-8 border-slate-100 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-emerald-100 mb-6">
                  {profileData.first_name?.[0]?.toUpperCase() || profileData.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-1">
                  {profileData.first_name || profileData.username || 'Admin'}
                </h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Administrator</p>
                <div className="w-full pt-6 border-t border-slate-50 space-y-3">
                  <Badge className="w-full py-2 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-700 border-emerald-200 justify-center">
                    <Check className="w-4 h-4 mr-2" /> Verified Account
                  </Badge>
                  <Badge variant="outline" className="w-full py-2 rounded-xl text-sm font-bold bg-slate-50 text-slate-600 border-slate-200 justify-center">
                    <Database className="w-4 h-4 mr-2" /> {user?.is_admin ? 'Admin' : 'User'}
                  </Badge>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full mt-6 rounded-xl font-bold bg-rose-50 text-rose-600 border-2 border-rose-200 hover:bg-rose-100 hover:text-rose-700"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </Card>

              {/* Profile Edit Form */}
              <Card className="lg:col-span-2 p-8 border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" /> Personal Information
                </h3>
                
                {profileLoading ? (
                  renderLoading()
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Username
                        </Label>
                        <Input 
                          value={profileData.username} 
                          disabled 
                          className="rounded-xl border-slate-200 h-12 font-bold px-4 bg-slate-50 text-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Email
                        </Label>
                        <Input 
                          value={profileData.email} 
                          disabled 
                          className="rounded-xl border-slate-200 h-12 font-bold px-4 bg-slate-50 text-slate-600"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          First Name
                        </Label>
                        <Input 
                          value={profileData.first_name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                          className="rounded-xl border-slate-200 h-12 font-bold px-4"
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Last Name
                        </Label>
                        <Input 
                          value={profileData.last_name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                          className="rounded-xl border-slate-200 h-12 font-bold px-4"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        <Smartphone className="w-3.5 h-3.5 inline mr-1" /> Phone Number
                      </Label>
                      <Input 
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="rounded-xl border-slate-200 h-12 font-bold px-4"
                        placeholder="98XXXXXXXX"
                      />
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-end">
                  <Button 
                    className="rounded-xl font-black bg-emerald-600 px-8 py-6 text-white shadow-lg shadow-emerald-100 gap-2 hover:bg-emerald-700"
                    onClick={handleProfileSave}
                    disabled={savingProfile || profileLoading}
                  >
                    {savingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {savingProfile ? 'Saving...' : 'Update Profile'}
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ============================================================ */}
          {/* PASSWORD TAB - Fixed: Single eye button for all fields */}
          {/* ============================================================ */}
          <TabsContent value="password" className="m-0">
            <Card className="p-8 border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-500" /> Change Password
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="rounded-xl font-bold gap-2"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPasswords ? 'Hide' : 'Show'} Passwords
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Current Password
                  </Label>
                  <Input 
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, old_password: e.target.value }))}
                    className="rounded-xl border-slate-200 h-12 font-bold px-4"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    New Password
                  </Label>
                  <Input 
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                    className="rounded-xl border-slate-200 h-12 font-bold px-4"
                    placeholder="Enter new password (min 8 chars)"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Confirm New Password
                  </Label>
                  <Input 
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                    className={`rounded-xl border-slate-200 h-12 font-bold px-4 ${
                      passwordData.confirm_password && passwordData.confirm_password !== passwordData.new_password
                        ? 'border-red-300 focus:border-red-500'
                        : ''
                    }`}
                    placeholder="Confirm new password"
                  />
                  {passwordData.confirm_password && passwordData.confirm_password !== passwordData.new_password && (
                    <p className="text-xs text-red-500 font-medium mt-1">Passwords don't match</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button 
                  className="rounded-xl font-black bg-slate-900 px-8 py-6 text-white shadow-lg shadow-slate-100 gap-2 hover:bg-slate-800"
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;