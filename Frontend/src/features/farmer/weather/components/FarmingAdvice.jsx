import { Sun, AlertTriangle, CloudSun, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
const getAdviceIcon = (type) => {
    const iconClass = "w-3.5 h-3.5 sm:w-4 sm:h-4";
    switch (type) {
        case 'danger': return <AlertTriangle className={`${iconClass} text-red-500`}/>;
        case 'warning': return <AlertTriangle className={`${iconClass} text-orange-500`}/>;
        case 'good': return <Sun className={`${iconClass} text-green-500`}/>;
        default: return <CloudSun className={`${iconClass} text-blue-500`}/>;
    }
};
const getAdviceBgColor = (type) => {
    switch (type) {
        case 'danger': return 'bg-red-50 border-red-200';
        case 'warning': return 'bg-orange-50 border-orange-200';
        case 'good': return 'bg-green-50 border-green-200';
        default: return 'bg-blue-50 border-blue-200';
    }
};
export const FarmingAdviceComponent = ({ advice }) => {
    const [expanded, setExpanded] = useState(false);
    if (!advice || advice.length === 0)
        return null;
    const displayAdvice = expanded ? advice : advice.slice(0, 2);
    return (<div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2">
          <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600"/>
          <span>Smart Farming Tips</span>
        </h3>
        {advice.length > 2 && (<button onClick={() => setExpanded(!expanded)} className="text-[10px] sm:text-xs text-green-600 hover:text-green-700 flex items-center gap-0.5 sm:gap-1">
            {expanded ? (<>Show Less <ChevronUp className="w-3 h-3"/></>) : (<>Show More ({advice.length - 2}) <ChevronDown className="w-3 h-3"/></>)}
          </button>)}
      </div>
      
      <div className="grid gap-2 sm:gap-3">
        {displayAdvice.map((item, idx) => (<div key={idx} className={`p-2.5 sm:p-3 rounded-xl ${getAdviceBgColor(item.type)}`}>
            <div className="flex items-start gap-2 sm:gap-2.5">
              {getAdviceIcon(item.type)}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm">{item.title}</h4>
                <p className="text-[10px] sm:text-xs mt-0.5 text-gray-700">{item.message}</p>
                <p className="text-[9px] sm:text-[10px] font-medium mt-1 text-gray-600">
                  → {item.action}
                </p>
              </div>
            </div>
          </div>))}
      </div>
    </div>);
};
