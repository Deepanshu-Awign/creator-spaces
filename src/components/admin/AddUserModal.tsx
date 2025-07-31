
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

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddUserModal = ({ open, onOpenChange }: AddUserModalProps) => {
  const queryClient = useQueryClient();

  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      // Create user with proper auth signup
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password || Math.random().toString(36).substring(2, 15), // Generate random password if not provided
        email_confirm: true, // Auto-confirm email for admin-created users
        user_metadata: {
          full_name: userData.full_name,
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Update profile with additional data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: userData.phone,
          location: userData.location,
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      // Assign role if specified
      if (userData.role && userData.role !== 'user') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: userData.role,
          });

        if (roleError) throw roleError;
      }

      // Log the activity
      await supabase.rpc('log_admin_activity', {
        _action: 'Created user',
        _target_type: 'user',
        _target_id: authData.user.id,
        _details: userData
      });

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User created successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <UserForm
          onSubmit={(data) => addUserMutation.mutate(data)}
          isLoading={addUserMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
