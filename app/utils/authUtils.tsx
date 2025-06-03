// src/utils/authUtils.ts
import { jwtDecode } from "jwt-decode";

export const getUserIdFromToken = (): string | null => {
    if (typeof window === "undefined") return null; // 🛡 tránh lỗi SSR

    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    try {
        const decoded: any = jwtDecode(token);
        return decoded.sub || decoded.id || decoded.userId || decoded.roles || decoded.fullName;
    } catch (err) {
        console.error("Invalid token", err);
        return null;
    }
}

export const getRolesFromToken = (): string | null => {
    return localStorage.getItem("userRole");
};