import AdminClient from "./AdminClient";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default function AdminPage() {
    const cookieStore = cookies();
    const authToken = cookieStore.get("auth_token");

    let role: string | null = null;
    let adminDistrict: string | null = null;

    if (authToken) {
        try {
            const payload = JSON.parse(authToken.value);
            role = payload.role;
            adminDistrict = payload.district;
        } catch (e) {
            // Fallback
            if (authToken.value === "admin_logged_in_v2") {
                role = "SUPER_ADMIN";
            }
        }
    }

    return (
        <AdminClient role={role} adminDistrict={adminDistrict} />
    );
}
