
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MoreHorizontal, Calendar, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AdminBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch bookings with filters
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['adminBookings', searchTerm, statusFilter, dateFilter, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          profiles!bookings_user_id_fkey(full_name, email),
          studios!bookings_studio_id_fkey(title, location)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`profiles.full_name.ilike.%${searchTerm}%,studios.title.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply date filters
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        query = query.eq('booking_date', today);
      } else if (dateFilter === 'this_week') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        query = query.gte('booking_date', startOfWeek.toISOString().split('T')[0])
                    .lte('booking_date', endOfWeek.toISOString().split('T')[0]);
      } else if (dateFilter === 'this_month') {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        query = query.gte('booking_date', startOfMonth.toISOString().split('T')[0])
                    .lte('booking_date', endOfMonth.toISOString().split('T')[0]);
      } else if (dateFilter === 'custom' && startDate && endDate) {
        query = query.gte('booking_date', startDate).lte('booking_date', endDate);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching bookings:', error);
        return [];
      }
      return data || [];
    }
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status,
          ...(status === 'confirmed' && { approved_at: new Date().toISOString() })
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Log the activity
      await supabase.rpc('log_admin_activity', {
        _action: `${status.charAt(0).toUpperCase() + status.slice(1)} booking`,
        _target_type: 'booking',
        _target_id: bookingId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      toast.success('Booking status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const pendingBookings = bookings?.filter(booking => booking.status === 'pending') || [];
  const totalRevenue = bookings?.reduce((sum, booking) => 
    booking.payment_status === 'paid' ? sum + booking.total_price : sum, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-2">Manage all studio bookings and track revenue</p>
        </div>
        <div className="flex gap-4 items-center">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Total Revenue: ₹{totalRevenue.toLocaleString()}
          </Badge>
          {pendingBookings.length > 0 && (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {pendingBookings.length} Pending Approvals
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Actions for Pending Bookings */}
      {pendingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Pending Bookings - Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{booking.studios?.title}</div>
                    <div className="text-sm text-gray-600">
                      {booking.profiles?.full_name} • {new Date(booking.booking_date).toLocaleDateString()} • ₹{booking.total_price}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'confirmed' })}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'cancelled' })}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Bookings</CardTitle>
            <div className="flex gap-4">
              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Date filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {/* Custom Date Range */}
              {dateFilter === 'custom' && (
                <>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40"
                  />
                </>
              )}

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading bookings...</div>
          ) : bookings?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bookings found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Details</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Studio</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">#{booking.id.slice(0, 8)}</div>
                        <div className="text-sm text-gray-500">
                          {booking.duration_hours}h • {booking.guest_count} guests
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.profiles?.full_name}</div>
                        <div className="text-sm text-gray-500">{booking.profiles?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.studios?.title}</div>
                        <div className="text-sm text-gray-500">{booking.studios?.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">{booking.start_time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₹{booking.total_price}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(booking.payment_status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => navigate(`/booking/${booking.id}`)}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </DropdownMenuItem>
                          {booking.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'confirmed' })}
                                className="gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'cancelled' })}
                                className="gap-2 text-red-600"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel
                              </DropdownMenuItem>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <DropdownMenuItem
                              onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: 'completed' })}
                              className="gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;
