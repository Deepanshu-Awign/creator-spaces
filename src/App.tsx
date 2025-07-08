
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import LoadingScreen from "@/components/LoadingScreen";
import LazyWrapper from "@/components/LazyWrapper";
import NetworkStatusBar from "@/components/NetworkStatusBar";
import { useSafeArea } from "@/hooks/useSafeArea";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { lazy, useState, useEffect } from "react";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Studios = lazy(() => import("./pages/Studios"));
const StudioDetail = lazy(() => import("./pages/StudioDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Login = lazy(() => import("./pages/Login"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BookingDetails = lazy(() => import("./pages/BookingDetails"));

// Lazy load admin components
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminStudios = lazy(() => import("./pages/admin/AdminStudios"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

// Create query client with caching optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const safeArea = useSafeArea();
  const { isOnline } = useOfflineStorage();
  
  return (
    <div className="h-screen overflow-hidden bg-white">
      {/* Network Status Bar */}
      <NetworkStatusBar />
      
      {/* Main scrollable content area */}
      <div 
        className="h-full overflow-y-auto overflow-x-hidden" 
        style={{ 
          paddingTop: `${safeArea.top}px`,
          paddingLeft: `${safeArea.left}px`,
          paddingRight: `${safeArea.right}px`,
          paddingBottom: `calc(80px + ${safeArea.bottom}px)`, // Space for fixed bottom nav
        }}
      >
        <Routes>
          <Route path="/" element={<LazyWrapper><Index /></LazyWrapper>} />
          <Route path="/:city" element={<LazyWrapper><Index /></LazyWrapper>} />
          <Route path="/studios" element={<LazyWrapper><Studios /></LazyWrapper>} />
          <Route path="/studio/:id" element={<LazyWrapper><StudioDetail /></LazyWrapper>} />
          <Route path="/profile" element={<LazyWrapper><Profile /></LazyWrapper>} />
          <Route path="/bookings" element={<LazyWrapper><Profile /></LazyWrapper>} />
          <Route path="/booking/:id" element={<LazyWrapper><BookingDetails /></LazyWrapper>} />
          <Route path="/favorites" element={<LazyWrapper><Favorites /></LazyWrapper>} />
          <Route path="/login" element={<LazyWrapper><Login /></LazyWrapper>} />
          <Route path="/about" element={<LazyWrapper><About /></LazyWrapper>} />
          <Route path="/contact" element={<LazyWrapper><Contact /></LazyWrapper>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <LazyWrapper>
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            </LazyWrapper>
          }>
            <Route index element={<LazyWrapper><AdminDashboard /></LazyWrapper>} />
            <Route path="users" element={<LazyWrapper><AdminUsers /></LazyWrapper>} />
            <Route path="bookings" element={<LazyWrapper><AdminBookings /></LazyWrapper>} />
            <Route path="studios" element={<LazyWrapper><AdminStudios /></LazyWrapper>} />
            <Route path="analytics" element={<LazyWrapper><AdminAnalytics /></LazyWrapper>} />
            <Route path="settings" element={<LazyWrapper><AdminSettings /></LazyWrapper>} />
          </Route>
          
          <Route path="*" element={<LazyWrapper><NotFound /></LazyWrapper>} />
        </Routes>
      </div>
      
      {/* Fixed bottom navigation - completely independent */}
      <MobileBottomNav />
    </div>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Register service worker for offline functionality
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered successfully:', registration);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('New service worker version available');
          });
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    // Initialize app
    const initializeApp = async () => {
      try {
        // Register service worker first
        await registerServiceWorker();
        
        // Preload critical resources
        const preloadPromises = [
          // Preload logo image
          new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = "/lovable-uploads/63c25b0c-9e71-4bbb-b0e3-4529c6c44ecf.png";
          }),
          // Minimum loading time for better UX
          new Promise(resolve => setTimeout(resolve, 1500))
        ];

        await Promise.all(preloadPromises);
      } catch (error) {
        console.log("App initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
