
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Studios", href: "/studios" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-slate-800">
              Book<span className="text-orange-500">MyStage</span>
            </span>
          </Link>

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
            <Link to="/favorites">
              <Button variant="ghost" size="sm" className="hover:bg-orange-50">
                <Heart className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/bookings">
              <Button variant="ghost" size="sm" className="hover:bg-orange-50">
                <Calendar className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="hover:bg-orange-50">
                <User className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Sign In
              </Button>
            </Link>
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
              <div className="border-t pt-4 flex space-x-2">
                <Link to="/favorites" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Favorites
                  </Button>
                </Link>
                <Link to="/bookings" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Bookings
                  </Button>
                </Link>
              </div>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
