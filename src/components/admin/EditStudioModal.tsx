
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

interface EditStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studio: any;
}

const EditStudioModal = ({ open, onOpenChange, studio }: EditStudioModalProps) => {
  const queryClient = useQueryClient();

  const editStudioMutation = useMutation({
    mutationFn: async (studioData: any) => {
      console.log('Updating studio with data:', studioData);
      
      const { data, error } = await supabase
        .from('studios')
        .update(studioData)
        .eq('id', studio.id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Studio updated successfully:', data);

      // Log the activity
      try {
        await supabase.rpc('log_admin_activity', {
          _action: 'Updated studio',
          _target_type: 'studio',
          _target_id: studio.id,
          _details: studioData
        });
      } catch (logError) {
        console.warn('Failed to log admin activity:', logError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudios'] });
      queryClient.invalidateQueries({ queryKey: ['studioCities'] });
      toast.success('Studio updated successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating studio:', error);
      toast.error('Failed to update studio');
    }
  });

  const handleSubmit = async (data: any) => {
    console.log('Form submission data:', data);
    await editStudioMutation.mutateAsync(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Studio</DialogTitle>
        </DialogHeader>
        <StudioForm
          onSubmit={handleSubmit}
          initialData={studio}
          isLoading={editStudioMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditStudioModal;
