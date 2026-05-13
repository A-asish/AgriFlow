import React from 'react';
import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { FinanceProvider } from "@/contexts/FinanceContext";
import AppRoutes from "./routes/AppRoutes";
const App = () => (<TooltipProvider>
    <Toaster />
    <Sonner />
    <FinanceProvider>
      <AppRoutes />
    </FinanceProvider>
  </TooltipProvider>);
export default App;
