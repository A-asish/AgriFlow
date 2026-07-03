// src/features/admin/livestock-management/components/LivestockTable.jsx
import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu';
import { PawPrint, MoreVertical, Eye, Trash2, Calendar, User, Loader2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import GenderBadge from './GenderBadge';

const LivestockTable = ({ 
  livestock, 
  loading, 
  selectedLivestock, 
  onSelectAll, 
  onSelect, 
  onViewDetails, 
  onDelete,
  selectAll 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </Card>
    );
  }

  if (livestock.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-gray-500">
          <PawPrint className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No livestock found. Register an animal to get started.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectAll && livestock.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Animal Details</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {livestock.map((animal) => (
              <TableRow key={animal.id} className="hover:bg-gray-50">
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedLivestock.includes(animal.id)}
                    onChange={() => onSelect(animal.id)}
                    className="rounded border-gray-300"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <PawPrint className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{animal.name || 'Unnamed'}</p>
                      <p className="text-xs text-slate-500">Tag: {animal.tag_number}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-slate-700">{animal.animal_type_name}</p>
                  <GenderBadge gender={animal.gender} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400"/>
                    <span className="text-sm font-medium text-slate-600">{animal.farmer_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400"/>
                    <span className="text-sm text-slate-600">
                      {animal.age_months ? `${animal.age_months} months` : 'N/A'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <StatusBadge status={animal.status} />
                    {animal.is_pregnant && (
                      <span className="inline-flex items-center gap-1 text-xs text-pink-600">
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        Pregnant
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-500">{formatDate(animal.created_at)}</span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreVertical className="w-4 h-4 text-slate-400"/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl w-48 shadow-xl border-slate-100 p-2">
                      <DropdownMenuItem 
                        onClick={() => onViewDetails(animal)}
                        className="rounded-xl gap-3 font-bold text-slate-600 cursor-pointer p-2.5"
                      >
                        <Eye className="w-4 h-4 text-blue-500"/> View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(animal)}
                        className="rounded-xl gap-3 font-bold text-red-600 cursor-pointer p-2.5"
                      >
                        <Trash2 className="w-4 h-4"/> Delete Animal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default LivestockTable;