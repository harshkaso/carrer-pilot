import type { LoginResponse } from "../types/auth";
import { apiFetch } from "./client";

interface RegisterInput {
    username: string;
    email: string;
    password: string;
}

export async function register (input: RegisterInput): Promise<void> {
    const response = await fetch("/api/auth/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw new Error("Registration failed");
    }
}

export async function login(username: string, password: string,): Promise<LoginResponse> {
    const response = await fetch("/api/auth/login",{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    return response.json();
}

export async function logout(token: string): Promise<void> {
    const response = await apiFetch("/api/auth/logout/", token, {
        method: "POST"
    });

    if (!response.ok) {
        throw new Error("Logout failed");
    }
}