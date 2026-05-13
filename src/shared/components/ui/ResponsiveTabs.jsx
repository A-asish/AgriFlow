import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
export function ResponsiveTabs({ tabs, defaultTab, variant = 'default', className, onTabChange }) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    useEffect(() => {
        if (defaultTab) {
            setActiveTab(defaultTab);
        }
    }, [defaultTab]);
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setIsMobileMenuOpen(false);
        onTabChange?.(tabId);
    };
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    const ActiveIcon = activeTabData?.icon;
    // Variant styles
    const variantStyles = {
        default: {
            list: "bg-muted/50 p-1 rounded-xl",
            trigger: "rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm",
        },
        pills: {
            list: "flex flex-wrap gap-2",
            trigger: "rounded-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        },
        underline: {
            list: "border-b border-border",
            trigger: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent",
        },
    };
    return (<Tabs value={activeTab} onValueChange={handleTabChange} className={cn("w-full", className)}>
      {/* Mobile: Dropdown Select */}
      <div className="block lg:hidden mb-4">
        <div className="relative">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              {ActiveIcon && <ActiveIcon className="w-4 h-4"/>}
              <span className="font-medium">{activeTabData?.label}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`}/>
          </button>
          
          {isMobileMenuOpen && (<div className="absolute top-full left-0 right-0 mt-1 bg-popover rounded-xl shadow-lg border border-border z-50 max-h-60 overflow-y-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (<button key={tab.id} onClick={() => handleTabChange(tab.id)} className={cn("w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors", "first:rounded-t-xl last:rounded-b-xl", activeTab === tab.id && "bg-primary/10 text-primary font-semibold")}>
                    {Icon && <Icon className="w-4 h-4"/>}
                    <span className="text-sm">{tab.label}</span>
                  </button>);
            })}
            </div>)}
        </div>
      </div>

      {/* Tablet & Desktop: Horizontal Scroll / Grid */}
      <div className="hidden lg:block w-full">
        <div className={cn("w-full overflow-x-auto pb-2 scrollbar-thin", variantStyles[variant].list)}>
          <TabsList className={cn("w-full min-w-max flex gap-1 sm:gap-2", variantStyles[variant].list)}>
            {tabs.map((tab) => {
            const Icon = tab.icon;
            return (<TabsTrigger key={tab.id} value={tab.id} className={cn("flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-all", variantStyles[variant].trigger)}>
                  {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4"/>}
                  <span className="hidden xs:inline">{tab.label}</span>
                </TabsTrigger>);
        })}
          </TabsList>
        </div>
      </div>

      {/* Tab Contents */}
      {tabs.map((tab) => (<TabsContent key={tab.id} value={tab.id} className="mt-4 sm:mt-6">
          {tab.content}
        </TabsContent>))}
    </Tabs>);
}
