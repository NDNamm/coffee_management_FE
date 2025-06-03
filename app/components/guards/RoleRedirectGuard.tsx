import { get } from "node_modules/axios/index.cjs";
import { useEffect, useState, type JSX } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserIdFromToken } from "~/utils/authUtils";

export default function RoleRedirectGuard({ children }: { children: JSX.Element }) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const role = getUserIdFromToken();
        if (role?.includes("ADMIN")) {
            navigate("/admin/dashboard", { replace: true });
        }
        else {
            navigate("/", { replace: true });
        }
    })
    return children;
}