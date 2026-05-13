import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Calendar } from '@/shared/components/ui/calendar';
const CalendarPage = () => {
    const { t } = useLanguage();
    const [date, setDate] = useState(new Date());
    return (<MainLayout title={t('calendar.title')} subtitle={t('calendar.subtitle')}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="farm-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">{t('calendar.schedule')}</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon"><ChevronLeft className="w-4 h-4"/></Button>
                <Button variant="outline" size="icon"><ChevronRight className="w-4 h-4"/></Button>
                <Button className="rounded-xl gap-2 font-semibold ml-2"><Plus className="w-4 h-4"/> {t('calendar.addEvent')}</Button>
              </div>
            </div>
            <div className="text-center py-20 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20"/>
              <p>{t('calendar.noActivities')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="farm-card p-4 sm:p-6">
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-xl border-0 p-0"/>
          </div>
        </div>
      </div>
    </MainLayout>);
};
export default CalendarPage;
