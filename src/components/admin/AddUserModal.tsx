
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
      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(), // This would need proper user creation via auth
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          location: userData.location,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Assign role if specified
      if (userData.role && userData.role !== 'user') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: profile.id,
            role: userData.role,
          });

        if (roleError) throw roleError;
      }

      // Log the activity
      await supabase.rpc('log_admin_activity', {
        _action: 'Created user',
        _target_type: 'user',
        _target_id: profile.id,
        _details: userData
      });

      return profile;
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
