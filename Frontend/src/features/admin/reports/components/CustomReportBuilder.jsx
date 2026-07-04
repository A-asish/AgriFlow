// src/features/admin/reports/components/CustomReportBuilder.jsx
import React from 'react';
import { Download, Users, Wallet, Sprout, Beef, Loader2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

const CustomReportBuilder = ({ 
  customReport, 
  setCustomReport, 
  onGenerate, 
  generating 
}) => {
  const modules = [
    { id: 'include_farmers', label: 'Farmers', icon: Users },
    { id: 'include_crops', label: 'Crops', icon: Sprout },
    { id: 'include_livestock', label: 'Livestock', icon: Beef },
    { id: 'include_finance', label: 'Finance', icon: Wallet },
  ];

  return (
    <Card className="p-5">
      <h3 className="text-base font-bold mb-4">Custom Report</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium">Format</Label>
          <Select 
            value={customReport.format} 
            onValueChange={(v) => setCustomReport(prev => ({ ...prev, format: v }))}
          >
            <SelectTrigger className="h-9 text-sm mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium">Start Date</Label>
            <Input 
              type="date" 
              value={customReport.date_range_start} 
              onChange={(e) => setCustomReport(prev => ({ ...prev, date_range_start: e.target.value }))} 
              className="h-9 text-sm mt-1" 
            />
          </div>
          <div>
            <Label className="text-xs font-medium">End Date</Label>
            <Input 
              type="date" 
              value={customReport.date_range_end} 
              onChange={(e) => setCustomReport(prev => ({ ...prev, date_range_end: e.target.value }))} 
              className="h-9 text-sm mt-1" 
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium mb-2 block">Modules</Label>
          <div className="space-y-2">
            {modules.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50">
                <Checkbox 
                  id={item.id} 
                  checked={customReport[item.id]} 
                  onCheckedChange={(checked) => setCustomReport(prev => ({ ...prev, [item.id]: checked }))} 
                />
                <label htmlFor={item.id} className="text-sm flex items-center gap-2 cursor-pointer">
                  <item.icon className="w-4 h-4 text-slate-400" />
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Checkbox 
            id="include_details" 
            checked={customReport.include_details} 
            onCheckedChange={(checked) => setCustomReport(prev => ({ ...prev, include_details: checked }))} 
          />
          <label htmlFor="include_details" className="text-sm cursor-pointer">Include details</label>
        </div>

        <Button 
          onClick={onGenerate} 
          disabled={generating} 
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Download className="w-4 h-4 mr-2"/>}
          Generate Report
        </Button>
      </div>
    </Card>
  );
};

export default CustomReportBuilder;