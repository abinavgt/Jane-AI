import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLeads,
  createLead,
  seedDemoLeads,
  getDashboardStats,
  getAppointments,
  getCourses,
  getCallDetail,
  updateAppointmentStatus,
  voiceChat,
} from '../lib/api';

export function useLeads(params) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => getLeads(params),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 10000,
  });
}

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
    refetchInterval: 8000,
  });
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });
}

export function useCallDetail(callId) {
  return useQuery({
    queryKey: ['call-detail', callId],
    queryFn: () => getCallDetail(callId),
    enabled: !!callId,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useSeedDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: seedDemoLeads,
    onSuccess: () => {
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['leads'] });
        qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
        qc.invalidateQueries({ queryKey: ['appointments'] });
      }, 3000);
    },
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateAppointmentStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// Backward compatibility alias
export const useRmQueue = useAppointments;
export const useUpdateRmStatus = useUpdateAppointmentStatus;
