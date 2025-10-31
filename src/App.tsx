import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAutoCreateProfile } from "@/hooks/useAutoCreateProfile";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import SimpleAuth from "./pages/SimpleAuth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// Create QueryClient with HMR stability
let queryClient = new QueryClient();

// Preserve queryClient across HMR to prevent dispatcher errors
if (import.meta.hot) {
  if (!import.meta.hot.data.queryClient) {
    import.meta.hot.data.queryClient = queryClient;
  } else {
    queryClient = import.meta.hot.data.queryClient;
  }
}

const AppContent = () => {
  // Auto-create profiles when users sign in
  useAutoCreateProfile();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<SimpleAuth />} />
      <Route path="/app" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
