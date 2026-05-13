import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/shared/components/ui/button';
import { Menu, Bell, Globe, User } from 'lucide-react';
export function Header({ title, subtitle, onMenuClick }) {
    const { language, setLanguage, t } = useLanguage();
    return (<header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-6 sm:px-10 lg:px-12 py-4 sm:py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={onMenuClick}>
            <Menu className="w-5 h-5"/>
          </Button>
          <div className="hidden sm:block">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 h-9 sm:h-10 text-xs sm:text-sm" onClick={() => setLanguage(language === 'en' ? 'np' : 'en')}>
            <Globe className="w-4 h-4"/>
            <span className="hidden xs:inline">{language === 'en' ? 'नेपाली' : 'English'}</span>
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 relative">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5"/>
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"/>
          </Button>
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 sm:hidden">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary"/>
          </div>
        </div>
      </div>
      <div className="sm:hidden mt-2">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </header>);
}
