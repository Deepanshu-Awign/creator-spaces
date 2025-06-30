
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, MoreHorizontal, Plus, Edit, Trash2, CheckCircle, XCircle, MapPin, Eye } from 'lucide-react';
import { toast } from 'sonner';
import AddStudioModal from '@/components/admin/AddStudioModal';
import EditStudioModal from '@/components/admin/EditStudioModal';
import AdminStudioDetails from '@/components/admin/AdminStudioDetails';

const AdminStudios = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudio, setEditingStudio] = useState<any>(null);
  const [viewingStudio, setViewingStudio] = useState<any>(null);
  const [deletingStudio, setDeletingStudio] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch studios with enhanced location data
  const { data: studios, isLoading } = useQuery({
    queryKey: ['adminStudios', searchTerm, selectedCity],
    queryFn: async () => {
      let query = supabase
        .from('studios')
        .select(`
          *,
          profiles!studios_host_id_fkey(full_name, email),
          bookings(id)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }

      if (selectedCity && selectedCity !== 'all') {
        query = query.eq('city', selectedCity);
      }

      const { data } = await query;
      return data || [];
    }
  });

  // Get unique cities for filter
  const { data: cities } = useQuery({
    queryKey: ['studioCities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('studios')
        .select('city')
        .not('city', 'is', null)
        .not('city', 'eq', '');
      
      const uniqueCities = Array.from(new Set(data?.map(item => item.city).filter(Boolean))).sort();
      return uniqueCities;
    }
  });

  // Delete studio mutation
  const deleteStudioMutation = useMutation({
    mutationFn: async (studioId: string) => {
      const { error } = await supabase
        .from('studios')
        .delete()
        .eq('id', studioId);

      if (error) throw error;

      // Log the activity
      await supabase.rpc('log_admin_activity', {
        _action: 'Deleted studio',
        _target_type: 'studio',
        _target_id: studioId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudios'] });
      toast.success('Studio deleted successfully');
      setDeletingStudio(null);
    },
    onError: (error) => {
      console.error('Error deleting studio:', error);
      toast.error('Failed to delete studio');
    }
  });

  // Toggle studio status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ studioId, isActive }: { studioId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('studios')
        .update({ is_active: !isActive })
        .eq('id', studioId);

      if (error) throw error;

      // Log the activity
      await supabase.rpc('log_admin_activity', {
        _action: `${!isActive ? 'Activated' : 'Deactivated'} studio`,
        _target_type: 'studio',
        _target_id: studioId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudios'] });
      toast.success('Studio status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating studio status:', error);
      toast.error('Failed to update studio status');
    }
  });

  const getStatusBadge = (studio: any) => {
    if (!studio.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">Active</Badge>;
  };

  const formatLocation = (studio: any) => {
    if (studio.city && studio.state) {
      return `${studio.city}, ${studio.state}`;
    }
    return studio.location || 'No location';
  };

  // If viewing studio details, show the details component
  if (viewingStudio) {
    return (
      <AdminStudioDetails
        studio={viewingStudio}
        onEdit={() => {
          setEditingStudio(viewingStudio);
          setViewingStudio(null);
        }}
        onBack={() => setViewingStudio(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Studios</h1>
          <p className="text-gray-600 mt-2">Manage studios and their availability</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Studio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>All Studios</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {/* City Filter */}
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities?.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Search */}
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search studios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Studio</TableHead>
                  <TableHead className="min-w-[150px]">Host</TableHead>
                  <TableHead>Price/Hour</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studios?.map((studio) => (
                  <TableRow 
                    key={studio.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => setViewingStudio(studio)}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{studio.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {studio.description}
                        </div>
                        {studio.amenities && studio.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {studio.amenities.slice(0, 2).map((amenity: string) => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {studio.amenities.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{studio.amenities.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{studio.profiles?.full_name || 'No Host'}</div>
                        <div className="text-sm text-gray-500">{studio.profiles?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₹{studio.price_per_hour}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(studio)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium">{formatLocation(studio)}</div>
                          {studio.pincode && (
                            <div className="text-gray-500">{studio.pincode}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {studio.bookings?.length || 0} bookings
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(studio.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingStudio(studio);
                            }}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStudio(studio);
                            }}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Studio
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatusMutation.mutate({ studioId: studio.id, isActive: studio.is_active });
                            }}
                            className="gap-2"
                          >
                            {studio.is_active ? (
                              <>
                                <XCircle className="w-4 h-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingStudio(studio);
                            }}
                            className="gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Studio
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Studio Modal */}
      <AddStudioModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
      />

      {/* Edit Studio Modal */}
      {editingStudio && (
        <EditStudioModal
          open={!!editingStudio}
          onOpenChange={(open) => !open && setEditingStudio(null)}
          studio={editingStudio}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingStudio} onOpenChange={() => setDeletingStudio(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Studio</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingStudio?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteStudioMutation.mutate(deletingStudio.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminStudios;
