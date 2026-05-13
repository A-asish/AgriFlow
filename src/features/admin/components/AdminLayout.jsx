import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Wheat, Wallet, Beef, BarChart3, FileText, Bell, Settings, LogOut, Menu, X, ChevronRight, Sprout } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/shared/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile/tablet
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
    React.useEffect(() => {
        const handleResize = () => {
            const isLarge = window.innerWidth >= 1024;
            setIsLargeScreen(isLarge);
            if (isLarge) {
                setIsSidebarOpen(true);
            }
            else {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Farmer Management', path: '/admin/farmers' },
        { icon: Wheat, label: 'Crop Management', path: '/admin/crops' },
        { icon: Beef, label: 'Livestock Management', path: '/admin/livestock' },
        { icon: Wallet, label: 'Financial Management', path: '/admin/finance' },
        { icon: BarChart3, label: 'System Analytics', path: '/admin/analytics' },
        { icon: FileText, label: 'Reports & Export', path: '/admin/reports' },
        { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
        { icon: Settings, label: 'Profile & Settings', path: '/admin/settings' },
    ];
    const handleLogout = () => {
        logout();
        navigate('/auth');
    };
    return (<div className="min-h-screen bg-[#f8fafc] flex text-slate-900 relative">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && !isLargeScreen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"/>)}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 transform lg:translate-x-0 lg:static lg:block", isSidebarOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:w-20 lg:translate-x-0", !isSidebarOpen && "lg:block")}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Sprout className="w-6 h-6 text-white"/>
            </div>
            {isSidebarOpen && (<div className="animate-in fade-in duration-500">
                <h1 className="text-xl font-bold tracking-tight">AgriFlow</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin Console</p>
              </div>)}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (<Link key={item.path} to={item.path} onClick={() => !isLargeScreen && setIsSidebarOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-500 hover:text-emerald-600 hover:bg-emerald-50", isActive && "bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white shadow-md shadow-emerald-100")}>
                  <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "group-hover:text-emerald-600")}/>
                  {isSidebarOpen && <span className="font-semibold">{item.label}</span>}
                  {isActive && isSidebarOpen && (<motion.div layoutId="active-pill" className="ml-auto">
                      <ChevronRight className="w-4 h-4"/>
                    </motion.div>)}
                </Link>);
        })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100">
            {isSidebarOpen && (<div className="p-4 rounded-2xl bg-slate-50 flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                  <span className="text-emerald-700 font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">Admin</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>)}
            <Button variant="ghost" className={cn("w-full justify-start gap-3 rounded-xl transition-colors", isSidebarOpen ? "px-4" : "px-0 justify-center", "text-rose-500 hover:text-rose-600 hover:bg-rose-50")} onClick={handleLogout}>
              <LogOut className="w-5 h-5"/>
              {isSidebarOpen && <span className="font-bold">Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:flex hidden h-10 w-10 text-slate-500">
              <Menu className="w-5 h-5"/>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden flex h-10 w-10 text-slate-500">
              {isSidebarOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
            </Button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                {menuItems.find(item => location.pathname === item.path)?.label || 'Admin Panel'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="rounded-xl relative text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
              <Bell className="w-5 h-5"/>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"/>
            </Button>
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-100">
              A
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-10 flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>);
};
export default AdminLayout;
