export type Role = 'admin' | 'viewer' | 'writer';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string | null;
  description: string | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentSearchResult extends Equipment {
  rank: number;
  headline: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  total: number;
}

export interface EquipmentStats {
  total: number;
  recent: Equipment[];
}

export interface CreateEquipmentPayload {
  id: string;
  name: string;
  description: string;
  tags?: string[];
}

export interface UpdateEquipmentPayload {
  name?: string;
  description?: string;
  tags?: string[];
}
