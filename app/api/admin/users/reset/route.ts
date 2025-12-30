import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const cookieStore = cookies();
        const authToken = cookieStore.get("auth_token");

        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userSession = JSON.parse(authToken.value);

        // Only SUPER_ADMIN can reset others
        if (userSession.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { username, newPassword } = await req.json();

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        // Update password
        await prisma.user.update({
            where: { username },
            data: { password: newPassword }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
