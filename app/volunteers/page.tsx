import { prisma } from "@/lib/prisma";
import VolunteerClient from "./VolunteerClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getVolunteers(adminDistrict: string | null) {
    const where = adminDistrict ? {
        events: {
            some: {
                district: adminDistrict
            }
        }
    } : {};

    const volunteers = await prisma.volunteer.findMany({
        where,
        include: { events: true },
        orderBy: { name: 'asc' }
    });
    return volunteers;
}

export default async function VolunteersPage() {
    const cookieStore = cookies();
    const authToken = cookieStore.get("auth_token");

    let isAdmin = false;
    let adminDistrict = null;

    if (authToken) {
        try {
            const payload = JSON.parse(authToken.value);
            // Verify it's a valid session structure
            if (payload.username) {
                isAdmin = true;
                if (payload.role === 'DISTRICT_ADMIN') {
                    adminDistrict = payload.district;
                }
            }
        } catch (e) {
            // Fallback for old simple token if it still exists (legacy support)
            if (authToken.value === "admin_logged_in_v2") {
                isAdmin = true;
            }
        }
    }

    if (!isAdmin) {
        redirect("/login");
    }

    const volunteers = await getVolunteers(adminDistrict);

    return (
        <VolunteerClient volunteers={volunteers} isAdmin={isAdmin} />
    );
}
