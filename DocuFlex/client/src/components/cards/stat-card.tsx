import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  change,
  changeType = "neutral"
}: StatCardProps) {
  const changeColorClass = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600"
  }[changeType];

  return (
    <Card className="border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-2" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
          </div>
          <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`${iconColor} w-6 h-6`} />
          </div>
        </div>
        {change && (
          <div className="mt-4 flex items-center text-sm">
            <span className={`font-medium ${changeColorClass}`}>{change}</span>
            <span className="text-gray-600 ml-2">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
