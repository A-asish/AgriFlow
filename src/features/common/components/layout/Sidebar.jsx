import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/shared/components/ui/button';
import { LayoutDashboard, Wheat, Beef, Wallet, Calendar, CloudSun, Settings, LogOut, User, ChevronRight, Sprout, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
export function Sidebar() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const menuItems = [
        { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/dashboard' },
        { icon: Wheat, label: t('nav.crops'), path: '/crops' },
        { icon: Beef, label: t('nav.livestock'), path: '/livestock' },
        { icon: Wallet, label: t('nav.finance'), path: '/finance' },
        // ✅ REMOVED: Budget item - now integrated into Finance page
        // { icon: PiggyBank, label: t('finance.budgets') || 'Budgets', path: '/finance/budgets' },
        { icon: Sparkles, label: t('crops.recommendations') || 'Crop Recommendations', path: '/crops/recommendations' },
        { icon: Calendar, label: t('nav.calendar'), path: '/calendar' },
        { icon: CloudSun, label: t('nav.weather'), path: '/weather' },
        { icon: Settings, label: t('nav.settings'), path: '/settings' },
    ];
    return (<aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card fixed h-full z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
          <Sprout className="w-6 h-6 text-primary-foreground"/>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">AgriFlow</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{t('landing.smartFarm')}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (<Link key={item.path} to={item.path} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200", location.pathname === item.path && "bg-primary/10 text-primary font-semibold")}>
            <item.icon className="w-5 h-5"/>
            <span>{item.label}</span>
            {location.pathname === item.path && (<motion.div layoutId="active-pill" className="ml-auto"><ChevronRight className="w-4 h-4"/></motion.div>)}
          </Link>))}
      </nav>

      <div className="p-4 border-t border-border">
        <Link to="/profile" className="p-4 rounded-2xl bg-muted/50 flex items-center gap-3 mb-4 hover:bg-primary/5 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20">
            <User className="w-5 h-5 text-primary"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user?.full_name || user?.username}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"/>
        </Link>
        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={logout}>
          <LogOut className="w-5 h-5"/>
          <span>{t('nav.logout')}</span>
        </Button>
      </div>
    </aside>);
}
