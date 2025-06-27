
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Search, MoreHorizontal, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

const AdminBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch bookings with related data
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['adminBookings', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id(full_name, email),
          studios:studio_id(title, location)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data } = await query;
      
      if (searchTerm && data) {
        return data.filter(booking => 
          booking.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.studios?.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return data || [];
    }
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status, adminNotes }: { 
      bookingId: string; 
      status: string; 
      adminNotes?: string;
    }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status,
          admin_notes: adminNotes,
          approved_at: status === 'confirmed' ? new Date().toISOString() : null,
          approved_by: status === 'confirmed' ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Log the activity
      await supabase.rpc('log_admin_activity', {
        _action: `Updated booking status to ${status}`,
        _target_type: 'booking',
        _target_id: bookingId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      toast.success('Booking updated successfully');
    },
    onError: (error) => {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-2">Manage all studio bookings</p>
        </div>
        <Button className="gap-2">
          <Calendar className="w-4 h-4" />
          Calendar View
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Bookings</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Details</TableHead>
                <TableHead>Studio</TableHead>
                <TableHead>Customer</TableHead>
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
                      <div className="font-medium">#{booking.id.slice(-8)}</div>
                      <div className="text-sm text-gray-500">
                        {booking.duration_hours}h booking
                      </div>
                      {booking.guest_count && (
                        <div className="text-xs text-gray-400">
                          {booking.guest_count} guests
                        </div>
                      )}
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
                      <div className="font-medium">{booking.profiles?.full_name || 'No name'}</div>
                      <div className="text-sm text-gray-500">{booking.profiles?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{booking.start_time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">₹{(booking.total_price / 100).toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(booking.status)}
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(booking.payment_status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => updateBookingMutation.mutate({ 
                            bookingId: booking.id, 
                            status: 'confirmed' 
                          })}
                        >
                          Confirm Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateBookingMutation.mutate({ 
                            bookingId: booking.id, 
                            status: 'cancelled' 
                          })}
                        >
                          Cancel Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateBookingMutation.mutate({ 
                            bookingId: booking.id, 
                            status: 'completed' 
                          })}
                        >
                          Mark Complete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;
