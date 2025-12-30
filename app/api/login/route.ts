import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();
        const cleanUsername = username.trim();
        const cleanPassword = password.trim();

        // Use standard Prisma Client
        const user = await prisma.user.findUnique({
            where: { username: cleanUsername }
        });

        if (!user) {
            return NextResponse.json({ error: `User '${cleanUsername}' not found` }, { status: 404 });
        }

        if (user.password !== cleanPassword) {
            return NextResponse.json({ error: "Password incorrect" }, { status: 401 });
        }

        // Create a payload with role and district
        const payload = JSON.stringify({
            username: user.username,
            role: user.role,
            district: user.district
        });

        // Set auth cookie
        cookies().set("auth_token", payload, { httpOnly: true, path: "/" });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
