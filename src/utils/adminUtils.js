import { supabase } from '../supabaseClient';

/**
 * Check if a user is admin based on their role in the profiles table
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} - True if user is admin, false otherwise
 */
export const isUserAdmin = async (userId) => {
  if (!userId) return false;
  
  try {
    // maybeSingle() returns null (not an error) when no row is found,
    // avoiding the 406 PGRST116 error that single() throws for missing profiles.
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Check if a user is admin based on their role (synchronous version using cached profile)
 * @param {Object} user - The user object from auth
 * @param {Object} profile - The user's profile object
 * @returns {boolean} - True if user is admin, false otherwise
 */
export const isUserAdminSync = (user, profile) => {
  if (!user || !profile) return false;
  return profile.role === 'admin';
};

/**
 * Get user profile with role information
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} - The user profile or null if not found
 */
export const getUserProfile = async (userId) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
