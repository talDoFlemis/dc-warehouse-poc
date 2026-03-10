import { api } from './client';
import type {
  Equipment,
  EquipmentSearchResult,
  EquipmentStats,
  PaginatedResponse,
  CreateEquipmentPayload,
  UpdateEquipmentPayload,
} from './types';

export async function getEquipments(
  cursor?: string,
  limit: number = 20,
): Promise<PaginatedResponse<Equipment>> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', String(limit));
  return api.get<PaginatedResponse<Equipment>>(
    `/equipments?${params.toString()}`,
  );
}

export async function getEquipment(id: string): Promise<Equipment> {
  return api.get<Equipment>(`/equipments/${encodeURIComponent(id)}`);
}

export async function createEquipment(
  data: CreateEquipmentPayload,
): Promise<Equipment> {
  return api.post<Equipment>('/equipments', data);
}

export async function updateEquipment(
  id: string,
  data: UpdateEquipmentPayload,
): Promise<Equipment> {
  return api.patch<Equipment>(`/equipments/${encodeURIComponent(id)}`, data);
}

export async function deleteEquipment(
  id: string,
): Promise<{ message: string }> {
  return api.delete<{ message: string }>(
    `/equipments/${encodeURIComponent(id)}`,
  );
}

export async function searchEquipments(
  query: string,
  cursor?: string,
  limit: number = 20,
): Promise<PaginatedResponse<EquipmentSearchResult>> {
  const params = new URLSearchParams();
  params.set('q', query);
  if (cursor) params.set('cursor', cursor);
  params.set('limit', String(limit));
  return api.get<PaginatedResponse<EquipmentSearchResult>>(
    `/equipments/search?${params.toString()}`,
  );
}

export async function getEquipmentStats(): Promise<EquipmentStats> {
  return api.get<EquipmentStats>('/equipments/stats');
}
