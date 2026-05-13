import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/shared/components/ui/button';
import { X, LogOut, Sprout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
export function MainLayout({ children, title, subtitle }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { logout } = useAuth();
    const { t } = useLanguage();
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);
    return (<div className="min-h-screen bg-background flex">
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-60 lg:hidden"/>)}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (<motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-70 lg:hidden flex flex-col">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
                  <Sprout className="w-5 h-5 text-primary-foreground"/>
                </div>
                <h1 className="text-lg font-bold">AgriFlow</h1>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="rounded-full">
                <X className="w-5 h-5"/>
              </Button>
            </div>

            {/* ✅ UPDATED: Mobile navigation links - removed Budgets, fixed AI Advice */}
            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/crops" className="nav-link">Crops</Link>
              <Link to="/livestock" className="nav-link">Livestock</Link>
              <Link to="/finance" className="nav-link">Finance</Link>
              {/* Budgets removed - now in Finance page */}
              <Link to="/crops/recommendations" className="nav-link">Crop Recommendations</Link>
              <Link to="/calendar" className="nav-link">Calendar</Link>
              <Link to="/weather" className="nav-link">Weather</Link>
              <Link to="/settings" className="nav-link">Settings</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
            </nav>

            <div className="p-4 border-t border-border">
              <Button variant="ghost" className="w-full justify-start gap-3 text-destructive rounded-xl" onClick={logout}>
                <LogOut className="w-5 h-5"/>
                <span>Logout</span>
              </Button>
            </div>
          </motion.aside>)}
      </AnimatePresence>

      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        <Header title={title} subtitle={subtitle} onMenuClick={() => setIsSidebarOpen(true)}/>
        <div className="w-full max-w-(--breakpoint-2xl) mx-auto p-4 sm:p-10 lg:p-12 flex-1 animate-fade-in">
          {children}
        </div>
      </main>
    </div>);
}
