import { Menu, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface HeaderProps {
  onMenuClick: () => void;
}

const pageInfo = {
  "/": {
    title: "Dashboard Overview",
    description: "Track your business performance and recent activities"
  },
  "/tours": {
    title: "Tour Management",
    description: "Manage your desert voyager tours and schedules"
  },
  "/tourists": {
    title: "Tourist Records",
    description: "Manage customer information and bookings"
  },
  "/finances": {
    title: "Financial Tracking",
    description: "Monitor your income, expenses, and profitability"
  },
  "/files": {
    title: "File Manager",
    description: "Upload and manage your documents, reports, and media files"
  },
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [location] = useLocation();
  const currentPage = pageInfo[location as keyof typeof pageInfo] || pageInfo["/"];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            data-testid="menu-button"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{currentPage.title}</h2>
            <p className="text-gray-600">{currentPage.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative" data-testid="notifications-button">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" data-testid="settings-button">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
