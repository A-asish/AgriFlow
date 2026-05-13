import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
// Features
import DashboardPage from '@/features/farmer/dashboard/pages/FarmerDashboard';
import LandingPage from '@/features/farmer/dashboard/pages/LandingPage';
import NotFound from '@/features/farmer/dashboard/pages/NotFound';
import CropsPage from '@/features/farmer/crops/pages/CropsList';
import CropDetailPage from '@/features/farmer/crops/pages/CropDetail';
import NewCropPage from '@/features/farmer/crops/pages/NewCrop';
import LivestockPage from '@/features/farmer/livestock/pages/LivestockPage';
import AnimalDetailPage from '@/features/farmer/livestock/pages/LivestockDetailPage';
import NewAnimalPage from '@/features/farmer/livestock/pages/NewLivestockPage';
import FinancePage from '@/features/farmer/finance/pages/FinancePage';
import NewTransactionPage from '@/features/farmer/finance/pages/NewTransactionPage';
import CategoriesPage from '@/features/farmer/finance/pages/CategoriesPage';
import AuthPage from "@/features/auth/pages/AuthPage";
import ForgotPassword from '@/features/auth/pages/ForgotPassword';
import ResetPassword from '@/features/auth/pages/ResetPassword';
import VerifyEmail from '@/features/auth/pages/VerifyEmail';
import ProfilePage from '@/features/auth/pages/ProfilePage';
// Admin Features
import AdminDashboard from '@/features/admin/dashboard/pages/AdminDashboard';
import AdminFarmers from '@/features/admin/farmers-management/pages/FarmersList';
import AdminCrops from '@/features/admin/crops-management/pages/CropsList';
import AdminLivestock from '@/features/admin/livestock-management/pages/LivestockList';
import AdminFinance from '@/features/admin/finance-management/pages/FinanceList';
import AdminAnalytics from "@/features/admin/pages/Analytics";
import AdminReports from '@/features/admin/reports/pages/Reports';
import AdminNotifications from "@/features/admin/pages/Notifications";
import AdminSettingsPage from "@/features/admin/pages/Settings";
import WeatherPage from '@/features/farmer/weather/pages/WeatherPage';
import CalendarPage from '@/features/farmer/calendar/pages/CalendarPage';
import SettingsPage from "@/features/settings/pages/SettingsPage";
import RecommendationPage from '@/features/farmer/crops/pages/RecommendationPage';
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading)
        return (<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
    </div>);
    if (!isAuthenticated)
        return <Navigate to="/auth" replace/>;
    return <>{children}</>;
}
function AdminProtectedRoute({ children }) {
    const { user, isAuthenticated, loading } = useAuth();
    if (loading)
        return (<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
    </div>);
    if (!isAuthenticated)
        return <Navigate to="/auth" replace/>;
    // Only allow access if user is admin
    if (!user?.is_admin)
        return <Navigate to="/dashboard" replace/>;
    return <>{children}</>;
}
function AuthRoute({ children }) {
    const { user, isAuthenticated, loading } = useAuth();
    if (loading)
        return null;
    if (isAuthenticated) {
        if (user?.is_admin) {
            return <Navigate to="/admin/dashboard" replace/>;
        }
        return <Navigate to="/dashboard" replace/>;
    }
    return <>{children}</>;
}
const AppRoutes = () => (<Routes>
    <Route path="/" element={<LandingPage />}/>
    <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>}/>
    <Route path="/verify-email" element={<VerifyEmail />}/>
    <Route path="/forgot-password" element={<ForgotPassword />}/>
    <Route path="/reset-password" element={<ResetPassword />}/>
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}/>
    
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}/>
    
    {/* Admin Routes */}
    <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>}/>
    <Route path="/admin/farmers" element={<AdminProtectedRoute><AdminFarmers /></AdminProtectedRoute>}/>
    <Route path="/admin/crops" element={<AdminProtectedRoute><AdminCrops /></AdminProtectedRoute>}/>
    <Route path="/admin/livestock" element={<AdminProtectedRoute><AdminLivestock /></AdminProtectedRoute>}/>
    <Route path="/admin/finance" element={<AdminProtectedRoute><AdminFinance /></AdminProtectedRoute>}/>
    <Route path="/admin/analytics" element={<AdminProtectedRoute><AdminAnalytics /></AdminProtectedRoute>}/>
    <Route path="/admin/reports" element={<AdminProtectedRoute><AdminReports /></AdminProtectedRoute>}/>
    <Route path="/admin/notifications" element={<AdminProtectedRoute><AdminNotifications /></AdminProtectedRoute>}/>
    <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettingsPage /></AdminProtectedRoute>}/>
    
    <Route path="/crops" element={<ProtectedRoute><CropsPage /></ProtectedRoute>}/>
    <Route path="/crops/:id" element={<ProtectedRoute><CropDetailPage /></ProtectedRoute>}/>
    <Route path="/crops/new" element={<ProtectedRoute><NewCropPage /></ProtectedRoute>}/>
    <Route path="/crops/recommendations" element={<ProtectedRoute><RecommendationPage /></ProtectedRoute>}/>
    
    <Route path="/livestock" element={<ProtectedRoute><LivestockPage /></ProtectedRoute>}/>
    <Route path="/livestock/:id" element={<ProtectedRoute><AnimalDetailPage /></ProtectedRoute>}/>
    <Route path="/livestock/new" element={<ProtectedRoute><NewAnimalPage /></ProtectedRoute>}/>
    
    <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>}/>
    <Route path="/finance/new" element={<ProtectedRoute><NewTransactionPage /></ProtectedRoute>}/>
    <Route path="/finance/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>}/>
    
    <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>}/>
    <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>}/>
    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}/>
    
    <Route path="*" element={<NotFound />}/>
  </Routes>);
export default AppRoutes;
