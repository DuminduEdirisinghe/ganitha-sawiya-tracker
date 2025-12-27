import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        // Use raw query to bypass potential stale Prisma Client types
        const users = await prisma.$queryRaw<any[]>`SELECT * FROM User WHERE username = ${username} LIMIT 1`;
        const user = users[0];

        if (!user || user.password !== password) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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
