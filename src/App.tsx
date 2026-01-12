import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ChatProvider } from "@/context/ChatContext";
import { Loader2 } from "lucide-react";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <Landing />} />
      <Route path="/auth" element={user ? <Navigate to="/home" replace /> : <Auth />} />
      <Route path="/onboarding" element={<Onboarding />} />
      
      {/* Protected Routes wrapped in SidebarLayout */}
      <Route path="/home" element={<SidebarLayout><Home /></SidebarLayout>} />
      <Route path="/dashboard" element={<SidebarLayout><Dashboard /></SidebarLayout>} />
      <Route path="/chat" element={<SidebarLayout><Chat /></SidebarLayout>} />
      <Route path="/profile" element={<SidebarLayout><Profile /></SidebarLayout>} />
      
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function ChatWrapper() {
  const { user } = useAuth();
  return (
    <ChatProvider userId={user?.id}>
      <AppRoutes />
    </ChatProvider>
  );
}

function AppContent() {
  return (
    <AuthProvider>
      <ChatWrapper />
    </AuthProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
