import { AlertTriangle } from 'lucide-react';
export const WeatherAlertComponent = ({ alerts }) => {
    if (!alerts || alerts.length === 0)
        return null;
    return (<div className="space-y-2 sm:space-y-3">
      <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2">
        <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500"/>
        <span>Weather Alerts ({alerts.length})</span>
      </h3>
      
      {alerts.map((alert, idx) => (<div key={idx} className="farm-card bg-red-50 border-red-200 p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5"/>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-red-800 text-xs sm:text-sm">{alert.event}</h4>
              <p className="text-[10px] sm:text-xs text-red-700 mt-1 wrap-break-word">
                {alert.description}
              </p>
              <p className="text-[9px] sm:text-[10px] text-red-600 mt-1.5">
                {new Date(alert.start).toLocaleDateString()} → {new Date(alert.end).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>))}
    </div>);
};
