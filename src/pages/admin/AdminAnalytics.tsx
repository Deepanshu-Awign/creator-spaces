
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

const AdminAnalytics = () => {
  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      // Revenue by month
      const { data: bookings } = await supabase
        .from('bookings')
        .select('created_at, total_price, status')
        .eq('payment_status', 'paid');

      // User registrations by month
      const { data: users } = await supabase
        .from('profiles')
        .select('created_at');

      // Studio performance
      const { data: studios } = await supabase
        .from('studios')
        .select(`
          id, title, 
          bookings(total_price)
        `);

      // Process revenue data
      const revenueByMonth = bookings?.reduce((acc: any[], booking) => {
        const month = new Date(booking.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' });
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.revenue += booking.total_price / 100;
          existing.bookings += 1;
        } else {
          acc.push({ 
            month, 
            revenue: booking.total_price / 100, 
            bookings: 1 
          });
        }
        return acc;
      }, []) || [];

      // Process user growth data
      const userGrowth = users?.reduce((acc: any[], user) => {
        const month = new Date(user.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' });
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.users += 1;
        } else {
          acc.push({ month, users: 1 });
        }
        return acc;
      }, []) || [];

      // Top performing studios
      const studioPerformance = studios?.map(studio => ({
        name: studio.title,
        revenue: studio.bookings?.reduce((sum: number, booking: any) => sum + (booking.total_price / 100), 0) || 0,
        bookings: studio.bookings?.length || 0
      })).sort((a, b) => b.revenue - a.revenue).slice(0, 5) || [];

      return {
        revenueByMonth,
        userGrowth,
        studioPerformance
      };
    }
  });

  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Performance metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{analytics?.revenueByMonth?.reduce((sum, item) => sum + item.revenue, 0)?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.revenueByMonth?.reduce((sum, item) => sum + item.bookings, 0) || 0}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +8% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.userGrowth?.reduce((sum, item) => sum + item.users, 0) || 0}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +15% from last month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Booking Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{Math.round((analytics?.revenueByMonth?.reduce((sum, item) => sum + item.revenue, 0) || 0) / 
                    (analytics?.revenueByMonth?.reduce((sum, item) => sum + item.bookings, 0) || 1))?.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +3% from last month
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.revenueByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Studio Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Studios</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics?.studioPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'revenue' ? `₹${value}` : value,
                name === 'revenue' ? 'Revenue' : 'Bookings'
              ]} />
              <Bar dataKey="revenue" fill="#F97316" />
              <Bar dataKey="bookings" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
