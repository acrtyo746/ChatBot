
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { useAuth } from "./context/AuthContext";
import { MainLayout } from "./components/MainLayout";
import { AuthForms } from "./components/AuthForms";
import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient();

// Authentication wrapper component
const AuthenticatedApp = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return user ? <MainLayout /> : <AuthForms />;
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ChatProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AuthenticatedApp />} />
                <Route path="*" element={<AuthenticatedApp />} />
              </Routes>
            </BrowserRouter>
          </ChatProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
