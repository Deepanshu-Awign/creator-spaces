
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
import { Search, MoreHorizontal, Plus, Star, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const AdminStudios = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch studios with booking count
  const { data: studios, isLoading } = useQuery({
    queryKey: ['adminStudios', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('studios')
        .select(`
          *,
          bookings(id)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter === 'active') {
        query = query.eq('is_active', true);
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false);
      }

      const { data } = await query;
      
      if (searchTerm && data) {
        return data.filter(studio => 
          studio.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          studio.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return data || [];
    }
  });

  // Toggle studio status mutation
  const toggleStudioMutation = useMutation({
    mutationFn: async ({ studioId, isActive }: { studioId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('studios')
        .update({ is_active: isActive })
        .eq('id', studioId);

      if (error) throw error;

      // Log the activity
      await supabase.rpc('log_admin_activity', {
        _action: `${isActive ? 'Activated' : 'Deactivated'} studio`,
        _target_type: 'studio',
        _target_id: studioId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudios'] });
      toast.success('Studio status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating studio:', error);
      toast.error('Failed to update studio status');
    }
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Studios</h1>
          <p className="text-gray-600 mt-2">Manage all studios and their listings</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Studio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Studios</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search studios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Studios</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Studio</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price/Hour</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studios?.map((studio) => (
                <TableRow key={studio.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {studio.images?.[0] && (
                        <img 
                          src={studio.images[0]} 
                          alt={studio.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <div className="font-medium">{studio.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {studio.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{studio.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">₹{(studio.price_per_hour / 100).toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{studio.rating || 0}</span>
                      <span className="text-sm text-gray-500">({studio.total_reviews || 0})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {studio.bookings?.length || 0} bookings
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(studio.is_active)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          Edit Studio
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleStudioMutation.mutate({ 
                            studioId: studio.id, 
                            isActive: !studio.is_active 
                          })}
                        >
                          {studio.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete Studio
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

export default AdminStudios;
