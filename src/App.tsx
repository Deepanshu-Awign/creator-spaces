
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import Index from "./pages/Index";
import Studios from "./pages/Studios";
import StudioDetail from "./pages/StudioDetail";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import BookingDetails from "./pages/BookingDetails";

// Admin components
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminStudios from "./pages/admin/AdminStudios";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-white">
            {/* Main content with safe area handling */}
            <div className="min-h-screen" style={{ 
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 5rem)'
            }}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/:city" element={<Index />} />
                <Route path="/studios" element={<Studios />} />
                <Route path="/studio/:id" element={<StudioDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/bookings" element={<Profile />} />
                <Route path="/booking/:id" element={<BookingDetails />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="studios" element={<AdminStudios />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            
            {/* Mobile bottom navigation with safe area handling */}
            <div style={{ 
              paddingBottom: 'env(safe-area-inset-bottom)',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0
            }}>
              <MobileBottomNav />
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
