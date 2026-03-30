export interface Role {
  id: number;
  rolDescripcion: string;
}

export interface User {
  id: number;
  nombreCompleto: string;
  email: string;
  rolId: number;
  activo: boolean;
  fechaCreacion: string;
  rol: { rolDescripcion: string };
}

export interface CreateUserPayload {
  nombreCompleto: string;
  email: string;
  password: string;
  rolId: number;
  activo?: boolean;
}

export interface UpdateUserPayload {
  nombreCompleto?: string;
  email?: string;
  password?: string;
  rolId?: number;
  activo?: boolean;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUsers {
  data: User[];
  meta: PaginatedMeta;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  rolId?: number;
  activo?: boolean;
}
