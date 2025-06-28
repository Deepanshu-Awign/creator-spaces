
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
import StudioForm from './StudioForm';

interface AddStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddStudioModal = ({ open, onOpenChange }: AddStudioModalProps) => {
  const queryClient = useQueryClient();

  const addStudioMutation = useMutation({
    mutationFn: async (studioData: any) => {
      const { data, error } = await supabase
        .from('studios')
        .insert({
          ...studioData,
          approval_status: 'approved',
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Log the activity
      await supabase.rpc('log_admin_activity', {
        _action: 'Created studio',
        _target_type: 'studio',
        _target_id: data.id,
        _details: studioData
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudios'] });
      toast.success('Studio created successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error creating studio:', error);
      toast.error('Failed to create studio');
    }
  });

  const handleSubmit = async (data: any) => {
    await addStudioMutation.mutateAsync(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Studio</DialogTitle>
        </DialogHeader>
        <StudioForm
          onSubmit={handleSubmit}
          isLoading={addStudioMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddStudioModal;
