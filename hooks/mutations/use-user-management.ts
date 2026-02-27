import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import {
  userProfileSchema,
  type ActivateUserRequest,
  type KycStatus,
  type SuspendUserRequest,
  type UserProfile,
} from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

import { adminKeys } from '../queries/use-admin-dashboard';

// ─── Suspend User ──────────────────────────────────────────────────────────

async function suspendUser(request: SuspendUserRequest): Promise<void> {
  const { error } = await supabase.rpc('suspend_user_account', {
    p_user_id: request.user_id,
    p_reason: request.reason,
  });

  if (error) {
    throw new Error(`Error al suspender usuario: ${error.message}`);
  }
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suspendUser,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.userDetail(variables.user_id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });
    },
  });
}

// ─── Activate User ─────────────────────────────────────────────────────────

async function activateUser(request: ActivateUserRequest): Promise<void> {
  const { error } = await supabase.rpc('activate_user_account', {
    p_user_id: request.user_id,
  });

  if (error) {
    throw new Error(`Error al activar usuario: ${error.message}`);
  }
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateUser,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.userDetail(variables.user_id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });
    },
  });
}

// ─── Update KYC Status ─────────────────────────────────────────────────────

export interface UpdateKycStatusRequest {
  user_id: string;
  kyc_status: KycStatus;
}

async function updateKycStatus(
  request: UpdateKycStatusRequest,
  adminId: string,
): Promise<UserProfile> {
  const updateData: Record<string, unknown> = {
    kyc_status: request.kyc_status,
  };

  if (request.kyc_status === 'approved') {
    updateData.kyc_approved_at = new Date().toISOString();
    updateData.kyc_approved_by = adminId;
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('user_id', request.user_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar estado KYC: ${error.message}`);
  }

  return userProfileSchema.parse(data);
}

export function useUpdateKycStatus() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: (request: UpdateKycStatusRequest) => {
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }
      return updateKycStatus(request, userId);
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.userDetail(user.user_id) });
    },
  });
}
