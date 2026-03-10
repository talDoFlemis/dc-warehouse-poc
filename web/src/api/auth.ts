import { api } from './client';
import type { User } from './types';

export async function login(username: string, password: string): Promise<User> {
  return api.post<User>('/auth/login', { username, password });
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getProfile(): Promise<User> {
  return api.get<User>('/users/profile');
}

export async function getAllUsers(): Promise<User[]> {
  return api.get<User[]>('/users');
}
