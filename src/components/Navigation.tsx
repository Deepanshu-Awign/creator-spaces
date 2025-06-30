import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Shield, MapPin, ChevronDown, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NavigationProps {
  selectedCity?: string | null;
  onCityChange?: (city: string) => void;
}

const Navigation = ({ selectedCity, onCityChange }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isAdmin = useIsAdmin();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Studios", href: "/studios" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    fetchAvailableCities();
  }, []);

  const fetchAvailableCities = async () => {
    try {
      const { data, error } = await supabase
        .from("studios")
        .select("city")
        .eq("is_active", true)
        .not("city", "is", null);

      if (error) throw error;

      // Clean up city names and get unique cities
      const cities = [...new Set(
        data?.map(studio => studio.city?.replace(/\s+division$/i, '').trim()).filter(Boolean)
      )].sort();

      setAvailableCities(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCityChange = (city: string) => {
    if (onCityChange) {
      onCityChange(city);
      localStorage.setItem('selectedCity', city);
      // Update URL with city
      window.history.pushState({}, '', `/${city.toLowerCase().replace(/\s+/g, '-')}`);
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/9d2aa32d-c2f5-4ff8-b94e-180758e8e0aa.png" 
              alt="BookMyStudio Logo" 
              className="h-8 w-auto"
            />
            <span className="text-2xl font-bold text-slate-800">
              Book<span className="text-orange-500">MyStudio</span>
            </span>
          </Link>

          {/* City Selector */}
          {selectedCity && (
            <div className="hidden md:flex items-center">
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger className="w-40 border-orange-200 focus:border-orange-500">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-orange-500 mr-2" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                  isActive(item.href) ? "text-orange-500" : "text-slate-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth & User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-orange-50">
                    <User className="w-4 h-4 mr-2" />
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/bookings")}>
                    <Calendar className="w-4 h-4 mr-2" />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/favorites")}>
                    <Heart className="w-4 h-4 mr-2" />
                    Favorites
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} disabled={isLoggingOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleLoginClick}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {/* Mobile City Selector */}
              {selectedCity && (
                <div className="px-3 py-2 border-b">
                  <Select value={selectedCity} onValueChange={handleCityChange}>
                    <SelectTrigger className="w-full border-orange-200">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-orange-500 mr-2" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-orange-500 ${
                    isActive(item.href) ? "text-orange-500" : "text-slate-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <div className="space-y-2 pt-2 border-t">
                  <Button 
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      handleProfileClick();
                      setIsMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/bookings");
                      setIsMenuOpen(false);
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    My Bookings
                  </Button>
                  <Button 
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/favorites");
                      setIsMenuOpen(false);
                    }}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Favorites
                  </Button>
                  {isAdmin && (
                    <Button 
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/admin");
                        setIsMenuOpen(false);
                      }}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  )}
                  <Button 
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-4"
                  onClick={() => {
                    handleLoginClick();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
