import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/cards/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Users, 
  DollarSign, 
  TrendingUp,
  Route,
  Calendar,
  UserCheck,
  Edit,
  Trash2,
  Plus,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: tours, isLoading: toursLoading } = useQuery({
    queryKey: ['/api/tours'],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  if (statsLoading) {
    return <div className="flex items-center justify-center h-full">Loading dashboard...</div>;
  }

  const recentTours = (tours as Tour[] | undefined)?.slice(0, 3) || [];
  const recentTransactions = (transactions as any[] | undefined)?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Tours"
          value={(stats as any)?.activeTours || 0}
          icon={MapPin}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          change="+12%"
          changeType="positive"
        />
        <StatCard
          title="Total Tourists"
          value={(stats as any)?.totalTourists || 0}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          change={(stats as any)?.totalTourists > 0 ? "+0%" : "0%"}
          changeType="neutral"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats as any)?.totalRevenue || 0}`}
          icon={DollarSign}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
          change="+0%"
          changeType="neutral"
        />
        <StatCard
          title="Net Profit"
          value={`$${(stats as any)?.netProfit || 0}`}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          change="+0%"
          changeType="neutral"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tours */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Tours</CardTitle>
              <Button variant="ghost" size="sm" data-testid="view-all-tours">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {toursLoading ? (
              <div className="text-center py-8">Loading tours...</div>
            ) : recentTours.length > 0 ? (
              <div className="space-y-4">
                {recentTours.map((tour: any) => (
                  <div key={tour.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge 
                            variant={tour.status === 'active' ? 'default' : 'secondary'}
                            className={tour.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {tour.status}
                          </Badge>
                          <Button variant="ghost" size="sm" data-testid={`edit-tour-${tour.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`delete-tour-${tour.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">{tour.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{tour.description}</p>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{tour.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{tour.startDate} • {tour.endDate}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Max {tour.capacity} people</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium text-gray-800">${tour.price}</span>
                          </div>
                        </div>
                      </div>
                      <img 
                        src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80" 
                        alt="Desert tour landscape" 
                        className="w-20 h-16 rounded-lg object-cover ml-4"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Route className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No tours available</p>
                <p className="text-sm">Create your first tour to get started</p>
                <Button className="mt-4" data-testid="add-new-tour">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Tour
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" data-testid="view-all-activity">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="text-center py-8">Loading activity...</div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <Plus className={`w-4 h-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                      ) : (
                        <DollarSign className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{transaction.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{transaction.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">All caught up!</p>
                <p className="text-sm">No recent activities to show</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
