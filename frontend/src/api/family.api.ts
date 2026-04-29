import { apiRequest } from "./client";
import type { Family, FamilyMember } from "../types/family.types";

export type CreateFamilyRequest = { name: string; country?: string; currency?: string };
export type JoinFamilyRequest = { code: string };

export type CreateFamilyResponse = { success: boolean; family: Family };
export type JoinFamilyResponse = { success: boolean; family: Family };
export type MembersResponse = { success: boolean; members: FamilyMember[] };

export const createFamilyApi = async (
  payload: CreateFamilyRequest
): Promise<CreateFamilyResponse> =>
  apiRequest<CreateFamilyResponse>("/api/families", { method: "POST", body: payload });

export const joinFamilyApi = async (
  payload: JoinFamilyRequest
): Promise<JoinFamilyResponse> =>
  apiRequest<JoinFamilyResponse>("/api/families/join", { method: "POST", body: payload });

export const getMembersApi = async (): Promise<MembersResponse> =>
  apiRequest<MembersResponse>("/api/families/members", { method: "GET" });

