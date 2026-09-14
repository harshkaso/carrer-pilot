export interface AuthUser {
    id: number;
    username: string;
    email: string;
}

export interface LoginResponse {
    token: string;
    user: AuthUser;
}

export interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
}