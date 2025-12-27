import CalendarClient from "./CalendarClient";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default function CalendarPage() {
    const cookieStore = cookies();
    const authToken = cookieStore.get("auth_token");

    let isAdmin = false;
    let adminDistrict: string | null = null;
    let role: string | null = null;

    if (authToken) {
        try {
            const payload = JSON.parse(authToken.value);
            isAdmin = true;
            role = payload.role;
            adminDistrict = payload.district;
        } catch (e) {
            // Fallback for old sessions or simple strings
            if (authToken.value === "admin_logged_in_v2") {
                isAdmin = true;
                role = "SUPER_ADMIN"; // Assume old sessions are super
            }
        }
    }

    return (
        <CalendarClient isAdmin={isAdmin} role={role} adminDistrict={adminDistrict} />
    );
}
