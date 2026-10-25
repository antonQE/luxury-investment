import { apiClient } from '@/api/clients';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roleKey: string;
  permissions: string[];
}

interface UserEnvelope {
  data: { user: AuthUser };
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await apiClient.post<UserEnvelope>('/v1/admin/auth/login', { email, password });
  return data.data.user;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<UserEnvelope>('/v1/admin/auth/me');
  return data.data.user;
}

export async function logout(): Promise<void> {
  await apiClient.post('/v1/admin/auth/logout');
}
