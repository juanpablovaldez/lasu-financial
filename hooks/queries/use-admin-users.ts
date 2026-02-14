import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { supabase } from '@/lib/supabase';
import { userProfileSchema, type UserProfile } from '@/schemas';

import { adminKeys } from './use-admin-dashboard';

const userProfileListSchema = z.array(userProfileSchema);

/**
 * Fetch all user profiles (admin view).
 */
async function fetchAllUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }

  return userProfileListSchema.parse(data);
}

/**
 * Query hook for all user profiles (admin view).
 */
export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: fetchAllUsers,
    staleTime: 30_000,
  });
}

/**
 * Fetch a single user profile by user_id.
 */
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }

  return userProfileSchema.parse(data);
}

/**
 * Query hook for a single user profile (admin view).
 */
export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.userDetail(id!),
    queryFn: () => fetchUserProfile(id!),
    enabled: !!id,
  });
}
