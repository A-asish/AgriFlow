// src/features/admin/livestock-management/components/DeleteConfirmDialog.jsx
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
import { Loader2 } from 'lucide-react';

const DeleteConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  animal, 
  loading,
  title = "Delete Animal",
  isBulk = false,
  count = 0
}) => {
  const getDescription = () => {
    if (isBulk) {
      return `This action cannot be undone. This will permanently delete ${count} animal(s) and all associated data including health records, vaccinations, milk records, and breeding history.`;
    }
    return `This action cannot be undone. This will permanently delete the animal "${animal?.name || animal?.tag_number}" and all associated data including health records, vaccinations, milk records, and breeding history.`;
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Delete {isBulk ? 'Permanently' : 'Animal'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;