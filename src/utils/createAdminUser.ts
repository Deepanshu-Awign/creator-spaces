
import { supabase } from "@/integrations/supabase/client";

export const createAdminUser = async (email: string, password: string, fullName: string) => {
  try {
    console.log('Creating admin user...');
    
    // First sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      throw signUpError;
    }

    if (!signUpData.user) {
      throw new Error('No user returned from sign up');
    }

    console.log('User created successfully:', signUpData.user.id);

    // Wait a moment for the profile to be created by the trigger
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Assign admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: signUpData.user.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('Role assignment error:', roleError);
      throw roleError;
    }

    console.log('Admin role assigned successfully');
    return { success: true, user: signUpData.user };

  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, error };
  }
};
