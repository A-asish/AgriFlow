import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { usePagination } from '@/shared/hooks/usePagination';
export function CrudTable({ title, icon: Icon, columns, data, loading = false, onAdd, onEdit, onDelete, renderActions, itemsPerPage = 10 }) {
    const { getPaginatedData, currentPage, nextPage, prevPage, getTotalPages } = usePagination({
        initialPageSize: itemsPerPage
    });
    const paginatedData = getPaginatedData(data);
    const totalPages = getTotalPages(data.length);
    if (loading) {
        return (<div className="farm-card">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg"/>
          <Skeleton className="h-20 w-full rounded-lg"/>
          <Skeleton className="h-20 w-full rounded-lg"/>
        </div>
      </div>);
    }
    return (<div className="farm-card">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5"/>} {title}
        </h3>
        {onAdd && (<Button size="sm" className="rounded-lg gap-2 bg-green-600 hover:bg-green-700" onClick={onAdd}>
            <Plus className="w-4 h-4"/> Add
          </Button>)}
      </div>

      {data.length === 0 ? (<p className="text-center py-10 text-muted-foreground">No records found</p>) : (<>
          <div className="space-y-3">
            {paginatedData.map((item) => (<div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-xl gap-3">
                <div className="min-w-0 flex-1">
                  {columns.map((col) => (<div key={String(col.key)} className="mb-1">
                      <span className="text-xs text-muted-foreground">{col.label}: </span>
                      <span className="text-sm font-medium">
                        {col.render ? col.render(item[col.key], item) : String(item[col.key] || '-')}
                      </span>
                    </div>))}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {renderActions ? (renderActions(item)) : (<>
                      {onEdit && (<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
                          <Edit2 className="w-3 h-3"/>
                        </Button>)}
                      {onDelete && (<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(item)}>
                          <Trash2 className="w-3 h-3"/>
                        </Button>)}
                    </>)}
                </div>
              </div>))}
          </div>

          {totalPages > 1 && (<div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 1} className="gap-1">
                <ChevronLeft className="w-4 h-4"/> Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === totalPages} className="gap-1">
                Next <ChevronRight className="w-4 h-4"/>
              </Button>
            </div>)}
        </>)}
    </div>);
}
