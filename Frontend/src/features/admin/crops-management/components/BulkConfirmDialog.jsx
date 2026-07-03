// src/features/admin/crops-management/components/BulkConfirmDialog.jsx
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';

const BulkConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  actionType, 
  selectedCount,
  loading 
}) => {
  const getActionDetails = () => {
    switch (actionType) {
      case 'activate':
        return {
          title: 'Activate Crops?',
          description: `Are you sure you want to activate ${selectedCount} crop(s)?`,
          buttonText: 'Activate',
          buttonClass: 'bg-green-600 hover:bg-green-700',
          icon: <AlertTriangle className="w-6 h-6 text-green-600" />
        };
      case 'harvest':
        return {
          title: 'Mark as Harvested?',
          description: `Are you sure you want to mark ${selectedCount} crop(s) as harvested?`,
          buttonText: 'Mark Harvested',
          buttonClass: 'bg-blue-600 hover:bg-blue-700',
          icon: <AlertTriangle className="w-6 h-6 text-blue-600" />
        };
      case 'complete':
        return {
          title: 'Mark as Completed?',
          description: `Are you sure you want to mark ${selectedCount} crop(s) as completed?`,
          buttonText: 'Mark Completed',
          buttonClass: 'bg-purple-600 hover:bg-purple-700',
          icon: <AlertTriangle className="w-6 h-6 text-purple-600" />
        };
      case 'delete':
        return {
          title: 'Delete Crops?',
          description: `This action cannot be undone. This will permanently delete ${selectedCount} crop(s) and all associated data.`,
          buttonText: 'Delete Permanently',
          buttonClass: 'bg-red-600 hover:bg-red-700',
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />
        };
      default:
        return {
          title: 'Confirm Action',
          description: `Are you sure you want to perform this action on ${selectedCount} crop(s)?`,
          buttonText: 'Confirm',
          buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
          icon: <AlertTriangle className="w-6 h-6 text-emerald-600" />
        };
    }
  };

  const details = getActionDetails();

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {details.icon}
            <AlertDialogTitle className="text-xl">{details.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {details.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className={details.buttonClass}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {details.buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BulkConfirmDialog;