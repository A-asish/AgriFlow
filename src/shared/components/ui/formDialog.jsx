import { Button } from './button';
import { ResponsiveDialog } from './ResponsiveDialog';
export function FormDialog({ isOpen, onClose, onSubmit, title, submitText = 'Save', isSubmitting = false, children }) {
    return (<ResponsiveDialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="space-y-4">
          {children}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:flex-1 bg-green-600 hover:bg-green-700">
              {isSubmitting ? 'Saving...' : submitText}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </ResponsiveDialog>);
}
