
import RoleRedirectGuard from "~/components/guards/RoleRedirectGuard";
import Dashboard from "./Dashboard";

export default function ProtectedOrderPage() {
    return (
        <RoleRedirectGuard>
            <Dashboard />
        </RoleRedirectGuard>
    );
}  