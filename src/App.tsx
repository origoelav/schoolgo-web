import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SchoolGo from "./pages/SchoolGo";
import SchoolGoAdmin from "./pages/SchoolGoAdmin";
import SchoolGoMaster from "./pages/SchoolGoMaster";
import SchoolGoLogin from "./pages/SchoolGoLogin";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Analytics />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SchoolGo />} />
          <Route path="/login" element={<SchoolGoLogin />} />
          <Route path="/admin" element={<ProtectedRoute><SchoolGoAdmin /></ProtectedRoute>} />
          <Route path="/master" element={<ProtectedRoute requireAdmin><SchoolGoMaster /></ProtectedRoute>} />
          
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
