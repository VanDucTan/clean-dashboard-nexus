import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { AccountProvider } from '@/contexts/AccountContext';
import { ThemeProvider } from '@/components/theme-provider';
import PrivateRoute from '@/components/PrivateRoute';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Test from "./pages/Test";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <AccountProvider>
            <TooltipProvider>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/test/:id" element={<Test />} />

                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Index />
                      </PrivateRoute>
                    }
                  />

                  {/* Redirect any unknown routes to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Toaster />
                <Sonner />
              </Router>
            </TooltipProvider>
          </AccountProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
