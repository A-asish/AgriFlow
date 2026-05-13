import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';
function DataTable({ columns, data, loading, emptyMessage = "No data found", onRowClick, className, }) {
    return (<Card className={cn("border-slate-100 shadow-sm overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              {columns.map((column, idx) => (<TableHead key={idx} className={cn("font-bold text-slate-800 whitespace-nowrap", column.headerClassName)}>
                  {column.header}
                </TableHead>))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (Array(5).fill(0).map((_, i) => (<TableRow key={i}>
                  {columns.map((_, j) => (<TableCell key={j} className="h-20 animate-pulse bg-slate-50/20"/>))}
                </TableRow>))) : data.length > 0 ? (data.map((item) => (<TableRow key={item.id} className={cn("group transition-colors", onRowClick ? "hover:bg-slate-50/50 cursor-pointer" : "")} onClick={() => onRowClick?.(item)}>
                  {columns.map((column, idx) => (<TableCell key={idx} className={cn("py-4", column.className)}>
                      {typeof column.accessor === 'function'
                    ? column.accessor(item)
                    : item[column.accessor]}
                    </TableCell>))}
                </TableRow>))) : (<TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Inbox className="w-12 h-12 text-slate-200"/>
                    <p className="text-lg font-bold text-slate-400">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </div>
    </Card>);
}
export default DataTable;
