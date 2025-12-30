import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
    try {
        const cookieStore = cookies();
        const authToken = cookieStore.get("auth_token");

        if (!authToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userSession = JSON.parse(authToken.value);
        const { currentPassword, newPassword } = await req.json();

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
        }

        // Verify current password
        const user = await prisma.user.findUnique({
            where: { username: userSession.username }
        });

        if (!user || user.password !== currentPassword) {
            return NextResponse.json({ error: "Current password incorrect" }, { status: 400 });
        }

        // Update password
        await prisma.user.update({
            where: { username: userSession.username },
            data: { password: newPassword }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
