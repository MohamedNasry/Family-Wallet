import { apiClient } from './client';
import { Family, FamilyMember, InvitePayload } from '../types/family.types';

export const familyApi = {
  getMyFamily(): Promise<Family> {
    return apiClient.get<Family>('/family/me');
  },

  getMembers(): Promise<FamilyMember[]> {
    return apiClient.get<FamilyMember[]>('/family/members');
  },

  getMember(memberId: string): Promise<FamilyMember> {
    return apiClient.get<FamilyMember>(`/family/members/${memberId}`);
  },

  inviteMember(payload: InvitePayload): Promise<{ inviteCode: string }> {
    return apiClient.post<{ inviteCode: string }>('/family/invite', payload);
  },

  removeMember(memberId: string): Promise<void> {
    return apiClient.delete<void>(`/family/members/${memberId}`);
  },

  updateMemberRole(memberId: string, role: string): Promise<FamilyMember> {
    return apiClient.patch<FamilyMember>(`/family/members/${memberId}/role`, { role });
  },

  createFamily(name: string): Promise<Family> {
    return apiClient.post<Family>('/family', { name });
  },

  updateFamily(familyId: string, data: Partial<Family>): Promise<Family> {
    return apiClient.put<Family>(`/family/${familyId}`, data);
  },
};