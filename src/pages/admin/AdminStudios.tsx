
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, MoreHorizontal, Building, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import AddStudioModal from '@/components/admin/AddStudioModal';
import EditStudioModal from '@/components/admin/EditStudioModal';

const AdminStudios = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudio, setEditingStudio] = useState<any>(null);
  const [deletingStudio, setDeletingStudio] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch studios
  const { data: studios, isLoading } = useQuery({
    queryKey: ['adminStudios', searchTerm],
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
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      const { data } = await query;
      return data || [];
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Studios</h1>
          <p className="text-gray-600 mt-2">Manage studios and their availability</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Studio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Studios</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search studios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Studio</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Price/Hour</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studios?.map((studio) => (
                <TableRow key={studio.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{studio.title}</div>
                      <div className="text-sm text-gray-500">{studio.location}</div>
                      {studio.amenities && (
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
                  <TableCell>₹{studio.price_per_hour}</TableCell>
                  <TableCell>{getStatusBadge(studio)}</TableCell>
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
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingStudio(studio)}
                          className="gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Studio
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleStatusMutation.mutate({ studioId: studio.id, isActive: studio.is_active })}
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
                          onClick={() => setDeletingStudio(studio)}
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
