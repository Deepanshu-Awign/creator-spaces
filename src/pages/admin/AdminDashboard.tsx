
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Building, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  // Fetch dashboard statistics
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [usersResult, bookingsResult, studiosResult, revenueResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id, total_price, status', { count: 'exact' }),
        supabase.from('studios').select('id, is_active', { count: 'exact' }),
        supabase.from('bookings').select('total_price').eq('payment_status', 'paid')
      ]);

      const totalRevenue = revenueResult.data?.reduce((sum, booking) => sum + booking.total_price, 0) || 0;
      const activeStudios = studiosResult.data?.filter(studio => studio.is_active).length || 0;
      const pendingBookings = bookingsResult.data?.filter(booking => booking.status === 'pending').length || 0;

      return {
        totalUsers: usersResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        totalStudios: studiosResult.count || 0,
        activeStudios,
        totalRevenue: totalRevenue / 100, // Convert from paise to rupees
        pendingBookings
      };
    }
  });

  // Fetch recent activities
  const { data: recentActivities } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    }
  });

  // Fetch recent bookings
  const { data: recentBookings } = useQuery({
    queryKey: ['recentBookings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id(full_name, email),
          studios:studio_id(title)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    }
  });

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Studios',
      value: `${stats?.activeStudios || 0}/${stats?.totalStudios || 0}`,
      icon: Building,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Pending Bookings',
      value: stats?.pendingBookings || 0,
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Growth Rate',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your admin dashboard</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings?.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{booking.studios?.title}</p>
                    <p className="text-sm text-gray-600">{booking.profiles?.full_name || booking.profiles?.email}</p>
                    <p className="text-xs text-gray-500">{new Date(booking.booking_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(booking.total_price / 100).toLocaleString()}</p>
                    <Badge variant={
                      booking.status === 'confirmed' ? 'default' :
                      booking.status === 'pending' ? 'secondary' :
                      booking.status === 'cancelled' ? 'destructive' : 'outline'
                    }>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Admin Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities?.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 py-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    {activity.target_type && (
                      <p className="text-xs text-gray-600">Target: {activity.target_type}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
