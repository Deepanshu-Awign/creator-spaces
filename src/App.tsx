
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/SecureAuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { initializeWebVitals } from "@/hooks/usePerformanceMonitor";
import { useEffect } from "react";

// Lazy load components for better performance
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy loaded components
const Index = lazy(() => import("./pages/Index"));
const Studios = lazy(() => import("./pages/Studios"));
const StudioDetail = lazy(() => import("./pages/StudioDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Favorites = lazy(() => import("./pages/Favorites"));
const SecureLogin = lazy(() => import("./pages/SecureLogin"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BookingDetails = lazy(() => import("./pages/BookingDetails"));

// Admin components
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminStudios = lazy(() => import("./pages/admin/AdminStudios"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
      <p className="text-slate-600">Loading...</p>
    </div>
  </div>
);

// Enhanced QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize performance monitoring
    initializeWebVitals();

    // Security headers check (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Check: Ensure HTTPS in production');
      console.log('Security Check: Verify CSP headers');
      console.log('Security Check: Check CORS configuration');
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/:city" element={<Index />} />
                  <Route path="/studios" element={<Studios />} />
                  <Route path="/studio/:id" element={<StudioDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/bookings" element={<Profile />} />
                  <Route path="/booking/:id" element={<BookingDetails />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/login" element={<SecureLogin />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    </Suspense>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="studios" element={<AdminStudios />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                  
                  {/* Catch-all route MUST be last */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
