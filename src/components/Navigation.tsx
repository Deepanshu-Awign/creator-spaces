
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Shield, MapPin, ChevronDown, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import creatorSpacesLogo from "@/assets/creator-spaces-logo-colorful.png";
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
    <nav className="sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img 
              src={creatorSpacesLogo}
              alt="Creator Spaces Logo" 
              className="h-8 w-auto"
            />
          </Link>

          {/* City Selector */}
          {selectedCity && (
            <div className="hidden md:flex items-center">
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger className="w-40 border-neutral-300 focus:border-brand hover:border-neutral-400 transition-colors bg-white shadow-sm">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-neutral-600 mr-2" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border border-neutral-200 shadow-lg">
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city} className="hover:bg-neutral-50">
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
                className={`text-sm font-medium transition-colors relative py-2 ${
                  isActive(item.href) 
                    ? "text-neutral-900" 
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth & User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-neutral-100 rounded-full border border-neutral-300 px-3 py-2 flex items-center gap-2"
                  >
                    <div className="w-6 h-6 bg-neutral-900 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <Menu className="w-4 h-4 text-neutral-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-neutral-200 shadow-lg min-w-48">
                  <DropdownMenuItem onClick={handleProfileClick} className="hover:bg-neutral-50">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/bookings")} className="hover:bg-neutral-50">
                    <Calendar className="w-4 h-4 mr-2" />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/favorites")} className="hover:bg-neutral-50">
                    <Heart className="w-4 h-4 mr-2" />
                    Favorites
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-neutral-200" />
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="hover:bg-neutral-50">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-neutral-200" />
                  <DropdownMenuItem onClick={handleSignOut} disabled={isLoggingOut} className="hover:bg-neutral-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-neutral-900 hover:bg-neutral-800 text-white rounded-full px-6 py-2 font-medium transition-colors"
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
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-neutral-200">
              {/* Mobile City Selector */}
              {selectedCity && (
                <div className="px-3 py-2 border-b border-neutral-200">
                  <Select value={selectedCity} onValueChange={handleCityChange}>
                    <SelectTrigger className="w-full border-neutral-300 bg-white">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-neutral-600 mr-2" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-neutral-200 shadow-lg">
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city} className="hover:bg-neutral-50">
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
                  className={`block px-3 py-3 text-base font-medium transition-colors ${
                    isActive(item.href) ? "text-neutral-900 bg-neutral-50" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  } rounded-lg mx-2`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <div className="space-y-1 pt-2 border-t border-neutral-200 mt-2">
                  <Button 
                    variant="ghost"
                    className="w-full justify-start mx-2 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900"
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
                    className="w-full justify-start mx-2 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900"
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
                    className="w-full justify-start mx-2 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900"
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
                      className="w-full justify-start mx-2 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900"
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
                    className="w-full justify-start mx-2 hover:bg-red-50 text-red-600 hover:text-red-700"
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
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white mt-4 mx-2 rounded-lg"
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
