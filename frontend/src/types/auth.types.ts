export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  rol_id: number;
}

export interface SessionUser {
  access_token: string;
  rol_id: number;
}
