
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Building, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  // Fetch dashboard stats with proper calculations
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      try {
        const [
          { count: totalUsers },
          { count: activeStudios },
          { count: totalBookings },
          { count: pendingBookings },
          { data: recentBookings },
          { data: topStudios },
          { data: paidBookings }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('studios').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('bookings').select('*', { count: 'exact', head: true }),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase
            .from('bookings')
            .select(`
              *,
              profiles!bookings_user_id_fkey(full_name, email),
              studios!bookings_studio_id_fkey(title)
            `)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('studios')
            .select(`
              *,
              bookings(id, status, total_price)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('bookings')
            .select('total_price, status, payment_status')
            .eq('payment_status', 'paid')
        ]);

        // Calculate revenue from paid bookings
        const totalRevenue = paidBookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;
        
        // Calculate today's revenue
        const today = new Date().toISOString().split('T')[0];
        const { data: todayBookings } = await supabase
          .from('bookings')
          .select('total_price')
          .eq('booking_date', today)
          .eq('payment_status', 'paid');
        
        const todayRevenue = todayBookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;

        // Calculate this month's revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const { data: monthBookings } = await supabase
          .from('bookings')
          .select('total_price')
          .gte('booking_date', startOfMonth.toISOString().split('T')[0])
          .eq('payment_status', 'paid');
        
        const monthRevenue = monthBookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;

        return {
          totalUsers: totalUsers || 0,
          activeStudios: activeStudios || 0,
          totalBookings: totalBookings || 0,
          pendingBookings: pendingBookings || 0,
          totalRevenue,
          todayRevenue,
          monthRevenue,
          recentBookings: recentBookings || [],
          topStudios: topStudios || []
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          totalUsers: 0,
          activeStudios: 0,
          totalBookings: 0,
          pendingBookings: 0,
          totalRevenue: 0,
          todayRevenue: 0,
          monthRevenue: 0,
          recentBookings: [],
          topStudios: []
        };
      }
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-700">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your studio booking platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered platform users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Studios</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeStudios || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available for booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              From completed payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.todayRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Revenue generated today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.monthRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Revenue this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions Alert */}
      {(stats?.pendingBookings || 0) > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Pending Actions Required
            </CardTitle>
            <Badge variant="secondary" className="bg-yellow-100">
              {stats?.pendingBookings || 0} pending
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-800">
              You have {stats?.pendingBookings || 0} bookings waiting for approval. 
              <a href="/admin/bookings" className="ml-2 underline font-medium">
                Review now →
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentBookings?.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No recent bookings</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Studio</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.recentBookings?.map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.profiles?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>{booking.studios?.title}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>₹{booking.total_price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Studio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topStudios?.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No studios available</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Studio</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.topStudios?.map((studio: any) => (
                    <TableRow key={studio.id}>
                      <TableCell className="font-medium">{studio.title}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {studio.location?.substring(0, 30)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {studio.bookings?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{studio.price_per_hour}/hr</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
