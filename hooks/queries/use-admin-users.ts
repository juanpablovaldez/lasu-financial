import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { supabase } from '@/lib/supabase';
import {
  adminRoleTypeSchema,
  userProfileSchema,
  type AdminRoleType,
  type UserProfile,
} from '@/schemas';

import { adminKeys } from './use-admin-dashboard';

const userProfileListSchema = z.array(userProfileSchema);

/**
 * Fetch all user profiles (admin view).
 */
async function fetchAllUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

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

/**
 * Fetch the set of user IDs that have an active admin role.
 */
async function fetchAdminUserIds(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('admin_roles')
    .select('user_id')
    .is('revoked_at', null);

  if (error) {
    throw new Error(`Error fetching admin roles: ${error.message}`);
  }

  return new Set((data ?? []).map((r) => r.user_id));
}

export function useAdminUserIds() {
  return useQuery({
    queryKey: [...adminKeys.all, 'admin-user-ids'] as const,
    queryFn: fetchAdminUserIds,
    staleTime: 60_000,
  });
}

/**
 * Fetch the active admin role for a user, if any.
 */
async function fetchUserRole(userId: string): Promise<AdminRoleType | null> {
  const { data, error } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Error fetching user role: ${error.message}`);
  }

  if (!data) return null;
  return adminRoleTypeSchema.parse(data.role);
}

/**
 * Returns the active admin role for a user, or null if they are a regular client.
 */
export function useAdminUserRole(userId: string | undefined) {
  return useQuery({
    queryKey: adminKeys.userRole(userId!),
    queryFn: () => fetchUserRole(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
}
