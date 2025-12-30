import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const cookieStore = cookies();
        const authToken = cookieStore.get("auth_token");

        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userSession = JSON.parse(authToken.value);

        // Only SUPER_ADMIN can see all users
        if (userSession.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                district: true,
            },
            orderBy: { username: 'asc' }
        });

        return NextResponse.json(users);

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
