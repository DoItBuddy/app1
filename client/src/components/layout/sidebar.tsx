import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Route, 
  Users, 
  DollarSign, 
  Folder,
  MapPin
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tours", href: "/tours", icon: Route },
  { name: "Tourists", href: "/tourists", icon: Users },
  { name: "Finances", href: "/finances", icon: DollarSign },
  { name: "Files", href: "/files", icon: Folder },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Desert Voyagers</h1>
              <p className="text-sm text-gray-600">Tour Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Users className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Tour Guide Owner</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
