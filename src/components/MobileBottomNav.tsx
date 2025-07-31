
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
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 z-[9999] md:hidden shadow-lg"
      style={{ 
        paddingBottom: `max(${safeArea.bottom}px, env(safe-area-inset-bottom, 0px))`,
        paddingLeft: `max(${safeArea.left}px, env(safe-area-inset-left, 0px))`,
        paddingRight: `max(${safeArea.right}px, env(safe-area-inset-right, 0px))`,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 min-w-[60px] ${
                isActive(item.href)
                  ? "text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive(item.href) ? "fill-current" : ""}`} />
              <span className={`text-xs font-medium ${isActive(item.href) ? "font-semibold" : ""}`}>
                {item.name}
              </span>
              {isActive(item.href) && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-neutral-900 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
