import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Wheat, Sliders, BookOpen } from 'lucide-react';

const CropManagementTabs = ({ activeTab }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'cultivations', label: 'Farmer Cultivations', path: '/admin/crops', icon: Wheat },
        { id: 'configs', label: 'Lifecycle Configurations', path: '/admin/crop-configs', icon: Sliders },
        { id: 'kb', label: 'Recommendation Parameters', path: '/admin/knowledge-base', icon: BookOpen },
    ];

    return (
        <div className="flex flex-wrap border-b border-slate-200 mb-6 bg-slate-50/50 p-1 rounded-xl gap-1.5 w-max max-w-full">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id || location.pathname === tab.path;
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => navigate(tab.path)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap",
                            isActive
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                                : "text-slate-500 hover:text-emerald-600 hover:bg-slate-100/50"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default CropManagementTabs;
