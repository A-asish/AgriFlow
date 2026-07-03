import { CalendarClock, ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { startOfDay } from '../hooks/useCalendarActivities';

export function CalendarSidebar({
    date,
    onDateChange,
    datesWithActivities,
    upcomingActivities,
    formatDate,
    actionId,
    onOpen,
    onMarkComplete,
}) {
    const { t } = useLanguage();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (delta) => {
        const newDate = new Date(date);
        newDate.setMonth(date.getMonth() + delta);
        onDateChange(newDate);
    };

    const isToday = (day) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };

    const isSelected = (day) => {
        return (
            day === date.getDate() &&
            currentMonth === date.getMonth() &&
            currentYear === date.getFullYear()
        );
    };

    const hasActivities = (day) => {
        try {
            const dateObj = new Date(currentYear, currentMonth, day);
            const dateKey = startOfDay(dateObj).toISOString();
            return datesWithActivities.has(dateKey);
        } catch (error) {
            return false;
        }
    };

    const handleDateClick = (day) => {
        try {
            const newDate = new Date(currentYear, currentMonth, day);
            onDateChange(newDate);
        } catch (error) {
            console.error('Error selecting date:', error);
        }
    };

    const getActivityCount = (day) => {
        try {
            const dateObj = new Date(currentYear, currentMonth, day);
            const dateKey = startOfDay(dateObj).toISOString();
            return upcomingActivities.filter(
                act => {
                    try {
                        return startOfDay(new Date(act.planned_date)).toISOString() === dateKey;
                    } catch (error) {
                        return false;
                    }
                }
            ).length;
        } catch (error) {
            return 0;
        }
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Safe render of activity item
    const renderActivityItem = (activity) => {
        try {
            const isActive = actionId === activity.id;
            const isCompleted = activity.completed || false;

            return (
                <div
                    key={activity.id || `activity-${Math.random()}`}
                    className={`
                        p-3 rounded-lg border cursor-pointer transition-colors
                        hover:bg-gray-50
                        ${isActive ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}
                    `}
                    onClick={() => {
                        try {
                            if (activity.id) onOpen(activity.id);
                        } catch (error) {
                            console.error('Error opening activity:', error);
                        }
                    }}
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {activity.title || 'Untitled Activity'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {activity.crop_name || 'Unknown Crop'} • {activity.growth_stage || 'Unknown Stage'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {activity.planned_date ? formatDate(new Date(activity.planned_date)) : 'No date'}
                                {activity.day_offset !== undefined && activity.day_offset !== null && (
                                    <span className="ml-2 text-blue-600">
                                        Day {activity.day_offset}
                                    </span>
                                )}
                            </p>
                        </div>
                        {!isCompleted && (
                            <button
                                className="px-2 py-1 text-xs border rounded-md hover:bg-gray-100 shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    try {
                                        if (activity.id) onMarkComplete(activity.id);
                                    } catch (error) {
                                        console.error('Error marking complete:', error);
                                    }
                                }}
                            >
                                Mark done
                            </button>
                        )}
                        {isCompleted && (
                            <span className="px-2 py-1 text-xs border rounded-md text-green-600 border-green-600 shrink-0 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Done
                            </span>
                        )}
                    </div>
                </div>
            );
        } catch (error) {
            console.error('Error rendering activity item:', error);
            return null;
        }
    };

    return (
        <div className="space-y-4">
            {/* Custom Calendar */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 sm:p-5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    {t?.('calendar.selectedDate') || 'Selected Date'}
                </p>
                
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-sm">
                        {monthNames[currentMonth]} {currentYear}
                    </span>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        aria-label="Next month"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                        <div
                            key={day}
                            className="text-center text-xs font-medium text-muted-foreground"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before month start */}
                    {Array.from({ length: firstDay }).map((_, index) => (
                        <div key={`empty-${index}`} className="aspect-square" />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const today = isToday(day);
                        const selected = isSelected(day);
                        const hasActivity = hasActivities(day);
                        const activityCount = getActivityCount(day);

                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={`
                                    relative aspect-square flex items-center justify-center
                                    text-sm rounded-full transition-colors
                                    hover:bg-gray-100
                                    ${selected ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                                    ${today && !selected ? 'border-2 border-primary' : ''}
                                `}
                            >
                                {day}
                                
                                {/* Activity dot indicator */}
                                {hasActivity && (
                                    <span className={`
                                        absolute -bottom-0.5 w-1.5 h-1.5 rounded-full
                                        ${selected ? 'bg-primary-foreground' : 'bg-primary'}
                                    `} />
                                )}
                                
                                {/* Activity count badge for multiple activities */}
                                {activityCount > 1 && (
                                    <span className={`
                                        absolute -top-1 -right-1 h-4 min-w-4 px-1 
                                        text-[10px] flex items-center justify-center rounded-full
                                        ${selected 
                                            ? 'bg-primary-foreground text-primary border border-primary' 
                                            : 'bg-primary text-primary-foreground'
                                        }
                                    `}>
                                        {activityCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-3 border-t flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <span>Has activities</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-transparent" />
                        <span>Today</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[8px]">2</span>
                        <span>Multiple</span>
                    </div>
                </div>
            </div>

            {/* Upcoming Activities */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50 bg-muted/20 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                        <CalendarClock className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-gray-800">
                        {t?.('calendar.upcomingDeadlines') || 'Upcoming Activities'}
                    </h3>
                </div>
                <div className="p-4">
                    <ScrollArea className="h-[min(280px,40vh)] pr-2">
                        {!upcomingActivities || upcomingActivities.length === 0 ? (
                            <div className="text-center text-sm text-gray-500 py-8">
                                <Circle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                No upcoming activities
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {upcomingActivities.slice(0, 10).map((activity) => 
                                    renderActivityItem(activity)
                                )}
                                {upcomingActivities.length > 10 && (
                                    <p className="text-center text-xs text-gray-500 pt-2">
                                        +{upcomingActivities.length - 10} more activities
                                    </p>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}