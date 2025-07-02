
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, User, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSafeArea } from "@/hooks/useSafeArea";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const safeArea = useSafeArea();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Studios", href: "/studios", icon: Search },
    { name: "Favorites", href: "/favorites", icon: Heart },
    { name: "Bookings", href: "/bookings", icon: Calendar },
    { name: "Profile", href: user ? "/profile" : "/login", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden shadow-lg"
      style={{ 
        paddingBottom: `${safeArea.bottom}px`,
        paddingLeft: `${safeArea.left}px`,
        paddingRight: `${safeArea.right}px`
      }}
    >
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "text-orange-500 bg-orange-50"
                  : "text-gray-600 hover:text-orange-500"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
