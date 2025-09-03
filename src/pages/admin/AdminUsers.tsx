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
import { Search, MoreHorizontal, Shield, ShieldCheck, Edit, Trash2, UserCheck, Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import EditUserModal from '@/components/admin/EditUserModal';
import AddUserModal from '@/components/admin/AddUserModal';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [roleChangeUser, setRoleChangeUser] = useState<any>(null);
  const [newRole, setNewRole] = useState<'admin' | 'manager' | 'user'>('user');
  const [showAddUser, setShowAddUser] = useState(false);
  const queryClient = useQueryClient();

  // Fetch users with their roles using separate queries
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['adminUsers', searchTerm],
    queryFn: async () => {
      console.log('Fetching users...');
      
      // First get profiles
      let profileQuery = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        profileQuery = profileQuery.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data: profiles, error: profilesError } = await profileQuery;
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        return [];
      }

      // Get user roles for all users
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', profiles.map(p => p.id));

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }

      // Get booking counts for all users
      const { data: bookingCounts, error: bookingsError } = await supabase
        .from('bookings')
        .select('user_id')
        .in('user_id', profiles.map(p => p.id));

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
      }

      // Combine the data
      const usersWithRolesAndBookings = profiles.map(profile => {
        const userRole = userRoles?.find(role => role.user_id === profile.id);
        const userBookings = bookingCounts?.filter(booking => booking.user_id === profile.id) || [];
        
        return {
          ...profile,
          user_roles: userRole ? [{ role: userRole.role }] : [],
          bookings: userBookings
        };
      });

      console.log('Users fetched:', usersWithRolesAndBookings);
      return usersWithRolesAndBookings;
    }
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'manager' | 'user' }) => {
      // First, delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then insert new role if not 'user' (default)
      if (role !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (error) throw error;
      }

      // Log the activity
      try {
        await supabase.rpc('log_admin_activity', {
          _action: `Assigned ${role} role`,
          _target_type: 'user',
          _target_id: userId
        });
      } catch (logError) {
        console.warn('Failed to log admin activity:', logError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Role updated successfully');
      setRoleChangeUser(null);
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
      setRoleChangeUser(null);
    }
  });

  const handleRoleChange = (user: any, role: 'admin' | 'manager' | 'user') => {
    setRoleChangeUser(user);
    setNewRole(role);
  };

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Log the activity
      try {
        await supabase.rpc('log_admin_activity', {
          _action: 'Deleted user',
          _target_type: 'user',
          _target_id: userId
        });
      } catch (logError) {
        console.warn('Failed to log admin activity:', logError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User deleted successfully');
      setDeletingUser(null);
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  });

  const getUserRole = (user: any): string => {
    if (user.user_roles && user.user_roles.length > 0) {
      return user.user_roles[0].role;
    }
    return 'user';
  };

  const getUserRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="gap-1"><Shield className="w-3 h-3" />Admin</Badge>;
      case 'manager':
        return <Badge variant="secondary" className="gap-1"><ShieldCheck className="w-3 h-3" />Manager</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  if (error) {
    console.error('Error in AdminUsers:', error);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Users</h1>
            <p className="text-gray-600 mt-2">Manage registered users and assign admin roles</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              Error loading users: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Users</h1>
          <p className="text-gray-600 mt-2">Manage registered users and assign admin roles</p>
        </div>
        <Button onClick={() => setShowAddUser(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Registered Users</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found. Users will appear here when they register on the platform.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'No name'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.location || 'No location'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getUserRoleBadge(getUserRole(user))}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.bookings?.length || 0} bookings
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
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
                            onClick={() => setEditingUser(user)}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user, 'admin')}
                            className="gap-2"
                          >
                            <Shield className="w-4 h-4" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user, 'manager')}
                            className="gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Make Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user, 'user')}
                            className="gap-2"
                          >
                            <UserCheck className="w-4 h-4" />
                            Make User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingUser(user)}
                            className="gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete User
                          </DropdownMenuItem>
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

      {/* Add User Modal */}
      <AddUserModal
        open={showAddUser}
        onOpenChange={setShowAddUser}
      />

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          user={editingUser}
        />
      )}

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={!!roleChangeUser} onOpenChange={() => setRoleChangeUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              {newRole === 'admin' ? 'Security Warning: Admin Role Assignment' : `Change User Role to ${newRole}`}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to change "{roleChangeUser?.full_name || roleChangeUser?.email}" 
                from <strong>{getUserRole(roleChangeUser)}</strong> to <strong>{newRole}</strong>.
              </p>
              {newRole === 'admin' && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-red-800 font-medium">⚠️ Critical Action Warning:</p>
                  <p className="text-red-700 text-sm mt-1">
                    Admin users have full system access including user management, 
                    studio management, and system configuration. Only grant admin 
                    access to trusted personnel.
                  </p>
                </div>
              )}
              <p className="text-sm">This action will be logged for security purposes.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => assignRoleMutation.mutate({ 
                userId: roleChangeUser?.id, 
                role: newRole 
              })}
              className={newRole === 'admin' ? "bg-red-600 hover:bg-red-700" : undefined}
            >
              {newRole === 'admin' ? 'Confirm Admin Access' : `Assign ${newRole} Role`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingUser?.full_name || deletingUser?.email}"? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserMutation.mutate(deletingUser.id)}
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

export default AdminUsers;
