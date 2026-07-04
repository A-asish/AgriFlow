// src/features/admin/reports/components/ReportTemplates.jsx
import React from 'react';
import { cn } from "@/lib/utils";
import { Users, Wallet, Sprout, Beef } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

const reportTemplates = [
  { 
    id: 'farmer', 
    title: 'Farmer Demographic Registry', 
    description: 'Complete list of registered farmers with contact and farm specifications.', 
    icon: Users, 
    color: 'text-blue-500 bg-blue-50', 
    filename: 'farmers_report' 
  },
  { 
    id: 'financial', 
    title: 'Ecosystem Financial Summary', 
    description: 'System-wide income and expense records with categorical breakdown.', 
    icon: Wallet, 
    color: 'text-emerald-500 bg-emerald-50', 
    filename: 'financial_report' 
  },
  { 
    id: 'crop', 
    title: 'Platform Cultivation Metrics', 
    description: 'Monitoring of current growth stages and expected yield across all fields.', 
    icon: Sprout, 
    color: 'text-amber-500 bg-amber-50', 
    filename: 'crops_report' 
  },
  { 
    id: 'livestock', 
    title: 'Livestock Health & Stats', 
    description: 'Animal inventory monitoring, health states, and breeding cycles.', 
    icon: Beef, 
    color: 'text-purple-500 bg-purple-50', 
    filename: 'livestock_report' 
  },
];

const ReportTemplates = ({ onGenerate, generating }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reportTemplates.map((tpl) => (
        <Card key={tpl.id} className="p-5 hover:shadow-md transition-shadow flex flex-col justify-between border-slate-100">
          <div>
            <div className="flex justify-between items-start">
              <div className={cn("p-2 rounded-lg", tpl.color)}>
                <tpl.icon className="w-5 h-5"/>
              </div>
            </div>
            <h4 className="font-bold mt-3 text-slate-800 text-sm">{tpl.title}</h4>
            <p className="text-xs text-slate-400 font-semibold mt-1 leading-relaxed">{tpl.description}</p>
          </div>
          
          <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-100/60">
            <span className="text-[9px] font-black uppercase text-slate-400 mr-auto">Format:</span>
            <Button 
              variant="outline" 
              size="xs" 
              onClick={() => onGenerate(tpl.id, 'csv', tpl.filename)} 
              disabled={generating} 
              className="h-7 text-[10px] font-bold px-2.5 rounded-lg border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
            >
              CSV
            </Button>
            <Button 
              variant="outline" 
              size="xs" 
              onClick={() => onGenerate(tpl.id, 'excel', tpl.filename)} 
              disabled={generating} 
              className="h-7 text-[10px] font-bold px-2.5 rounded-lg border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
            >
              Excel
            </Button>
            <Button 
              variant="outline" 
              size="xs" 
              onClick={() => onGenerate(tpl.id, 'pdf', tpl.filename)} 
              disabled={generating} 
              className="h-7 text-[10px] font-bold px-2.5 rounded-lg border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
            >
              PDF
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ReportTemplates;