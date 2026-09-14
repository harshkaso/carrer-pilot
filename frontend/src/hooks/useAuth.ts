import { useState } from "react";
import { login, logout } from "../api/auth";
import type { AuthUser } from "../types/auth";

export function useAuth() {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);

    async function handleLogin(
        username: string,
        password: string,
    ) {
        const data = await login(username, password);
        
        setToken(data.token);
        setUser(data.user);
    }

    async function handleLogout() {
        if (token) {
            await logout(token);
        }
        setToken(null);
        setUser(null);
    }

    return {
        token,
        user,
        handleLogin,
        handleLogout,
    };
}