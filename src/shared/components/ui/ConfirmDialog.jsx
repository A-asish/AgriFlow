import { AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { ResponsiveDialog } from './ResponsiveDialog';
export function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure?', confirmText = 'Delete', cancelText = 'Cancel', isProcessing = false }) {
    return (<ResponsiveDialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600"/>
        </div>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button onClick={onConfirm} disabled={isProcessing} className="flex-1 bg-red-600 hover:bg-red-700">
            {isProcessing ? 'Processing...' : confirmText}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>);
}
