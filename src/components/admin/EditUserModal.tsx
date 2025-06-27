
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import UserForm from './UserForm';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

const EditUserModal = ({ open, onOpenChange, user }: EditUserModalProps) => {
  const queryClient = useQueryClient();

  const editUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      // Update user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
          location: userData.location,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      // Update role if specified
      if (userData.role) {
        // First remove existing role
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);

        // Add new role if not 'user'
        if (userData.role !== 'user') {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: userData.role,
            });

          if (roleError) throw roleError;
        }
      }

      // Log the activity
      await supabase.rpc('log_admin_activity', {
        _action: 'Updated user',
        _target_type: 'user',
        _target_id: user.id,
        _details: userData
      });

      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User updated successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  });

  const getUserRole = () => {
    return user.user_roles?.[0]?.role || 'user';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <UserForm
          onSubmit={(data) => editUserMutation.mutate(data)}
          initialData={{
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            location: user.location,
            role: getUserRole(),
          }}
          isLoading={editUserMutation.isPending}
          isEdit={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
