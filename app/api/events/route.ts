import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            include: { volunteers: true },
            orderBy: { date: 'asc' }
        });
        return Response.json(events);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    let role: string | null = null;
    let userDistrict: string | null = null;

    if (token) {
        try {
            const payload = JSON.parse(token);
            role = payload.role;
            userDistrict = payload.district;
        } catch (e) {
            if (token === "admin_logged_in_v2") role = "SUPER_ADMIN";
        }
    }

    if (!role) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const {
            title,
            date,
            endDate,
            type,
            location,
            district,
            status,
            description,
            imagePaths,
            volunteers,
            // Assuming role and userDistrict are passed in the body for this example
            // In a real application, these would typically come from an authenticated session or token.
            role,
            userDistrict
        } = body;

        if (role === 'DISTRICT_ADMIN' && district !== userDistrict) {
            return NextResponse.json({ error: "Unauthorized: You can only create events in your district" }, { status: 403 });
        }

        const event = await prisma.event.create({
            data: {
                title,
                date: new Date(date),
                endDate: endDate ? new Date(endDate) : null,
                type: type || "Paper",
                location,
                district,
                status,
                description,
                imagePaths: JSON.stringify(imagePaths || []),
                volunteers: {
                    create: volunteers?.map((v: any) => ({
                        name: v.name,
                        role: v.role || "Member",
                        email: v.email,
                        phone: v.phone,
                        bio: v.bio || "",
                        photoUrl: v.photoUrl || ""
                    }))
                }
            }
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
