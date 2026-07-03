// src/features/admin/users-management/components/UserDetailModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Loader2,
  Crown,
  Building2,
  User as UserIcon,
  CheckCircle,
  XCircle,
  MailCheck,
  Trash2,
  XCircle as XCircleIcon,
  UserCheck,
  UserX
} from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/admin.api';

const UserDetailModal = ({ open, onClose, userId, onUserUpdated }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const farmersRes = await adminService.listFarmers({ page: 1, page_size: 100 });
      const farmer = farmersRes.data?.farmers?.find(f => f.id === userId);
      
      if (farmer) {
        setUser({
          ...farmer,
          is_farmer: true,
          is_admin: false,
        });
      } else {
        const adminsRes = await adminService.listAdmins();
        const admin = adminsRes.data?.admins?.find(a => a.id === userId);
        if (admin) {
          setUser({
            ...admin,
            is_admin: true,
            is_farmer: false,
          });
        } else {
          throw new Error('User not found');
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!user) return;
    
    setActionLoading(true);
    try {
      if (action === 'activate') {
        await adminService.updateFarmer(user.id, { is_active: true });
        toast.success(`${user.full_name || user.username} activated successfully`);
      } else if (action === 'deactivate') {
        await adminService.updateFarmer(user.id, { is_active: false });
        toast.success(`${user.full_name || user.username} deactivated successfully`);
      } else if (action === 'verify_email') {
        await adminService.updateFarmer(user.id, { is_email_verified: true });
        toast.success(`${user.full_name || user.username} email verified successfully`);
      } else if (action === 'verify_account') {
        // This sets both active and email verified
        await adminService.updateFarmer(user.id, { is_active: true, is_email_verified: true });
        toast.success(`${user.full_name || user.username} account verified successfully`);
      } else if (action === 'delete') {
        await adminService.deleteFarmer(user.id);
        toast.success(`${user.full_name || user.username} deleted successfully`);
        onClose();
        onUserUpdated?.();
        return;
      }
      
      // Refresh user data
      await fetchUserDetails();
      onUserUpdated?.();
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      toast.error(`Failed to ${action} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const RoleBadge = () => {
    if (!user) return null;
    if (user.is_admin) {
      return (
        <Badge className="flex items-center gap-1.5 bg-purple-100 text-purple-700 border-purple-200">
          <Crown className="w-3 h-3" />
          <span>Admin</span>
        </Badge>
      );
    }
    if (user.is_farmer) {
      return (
        <Badge className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 border-emerald-200">
          <Building2 className="w-3 h-3" />
          <span>Farmer</span>
        </Badge>
      );
    }
    return (
      <Badge className="flex items-center gap-1.5 bg-gray-100 text-gray-700 border-gray-200">
        <UserIcon className="w-3 h-3" />
        <span>User</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-12">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">User not found</h3>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">User Details</DialogTitle>
        </DialogHeader>

        {/* Profile Header */}
        <div className="flex items-center gap-6 p-6 bg-linear-to-r from-emerald-50 to-blue-50 rounded-lg">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{user.full_name || user.username}</h2>
              <RoleBadge />
              <Badge className={`
                ${user.is_active && user.is_email_verified ? 'bg-green-100 text-green-700' :
                  !user.is_email_verified && user.is_active ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'}
              `}>
                {user.is_active && user.is_email_verified ? 'Active' :
                 !user.is_email_verified && user.is_active ? 'Pending Email' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Only for Farmers */}
        {user.is_farmer && !user.is_admin && (
          <div className="flex flex-wrap justify-end gap-2">
            {/* Account Status Actions */}
            {!user.is_active && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAction('activate')}
                disabled={actionLoading}
                className="gap-2 border-green-300 text-green-700 hover:bg-green-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                Activate Account
              </Button>
            )}
            {user.is_active && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAction('deactivate')}
                disabled={actionLoading}
                className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                Deactivate Account
              </Button>
            )}

            {/* Email Verification Actions */}
            {!user.is_email_verified && user.is_active && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAction('verify_email')}
                disabled={actionLoading}
                className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailCheck className="w-4 h-4" />}
                Verify Email
              </Button>
            )}

            {/* Full Verification (Both Account & Email) */}
            {(!user.is_active || !user.is_email_verified) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAction('verify_account')}
                disabled={actionLoading}
                className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Verify Full Account
              </Button>
            )}

            {/* Delete Action */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAction('delete')}
              disabled={actionLoading}
              className="gap-2 border-red-300 text-red-700 hover:bg-red-50"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete User
            </Button>

            {/* Promote to Admin */}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Shield className="w-4 h-4" />
              Promote to Admin
            </Button>
          </div>
        )}

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{user.location || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">District</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{user.district || user.farm_district || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Region</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <p className="font-medium text-gray-900">
                    {user.geographical_region ? 
                      (user.geographical_region === 'terai' ? 'Terai Region' :
                       user.geographical_region === 'hilly' ? 'Hilly Region' :
                       'Himalayan Region') : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium text-gray-900">@{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{user.email}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{user.phone || '-'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Joined Date</p>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Verified</p>
                <Badge className={user.is_email_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {user.is_email_verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <Badge className={user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Farmer-specific information */}
        {user.is_farmer && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Farm Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Farm Name</p>
                  <p className="font-medium text-gray-900">{user.farm_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Farm Area</p>
                  <p className="font-medium text-gray-900">{user.total_farm_area ? `${user.total_farm_area} hectares` : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Farm District</p>
                  <p className="font-medium text-gray-900">{user.farm_district || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Farm Municipality</p>
                  <p className="font-medium text-gray-900">{user.farm_municipality || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Soil Type</p>
                  <p className="font-medium text-gray-900">{user.farm_soil_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Water Source</p>
                  <p className="font-medium text-gray-900">{user.water_source || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;