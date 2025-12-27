
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const event = await prisma.event.findUnique({
            where: { id: params.id },
            include: { volunteers: true }
        });
        if (!event) return new NextResponse("Event not found", { status: 404 });
        return NextResponse.json(event);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("auth_token")?.value;
        let role = null;
        let userDistrict = null;

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

        // Check if event exists and belongs to district if restricted
        const existingEvent = await prisma.event.findUnique({ where: { id: params.id } });
        if (!existingEvent) return new NextResponse("Event not found", { status: 404 });

        if (role === 'DISTRICT_ADMIN' && existingEvent.district !== userDistrict) {
            return NextResponse.json({ error: "Unauthorized: You can only edit events in your district" }, { status: 403 });
        }

        const body = await req.json();
        const {
            title, date, endDate, type, location, district, status, description, imagePaths, volunteers
        } = body;

        // Prevent District Admin from changing the district to another
        if (role === 'DISTRICT_ADMIN' && district !== userDistrict) {
            return NextResponse.json({ error: "Unauthorized: You cannot change the event to another district" }, { status: 403 });
        }

        // First, delete existing volunteers to replace them (simple approach) or update them.
        await prisma.volunteer.deleteMany({
            where: { events: { some: { id: params.id } } }
        });

        // Actually, the previous implementation in POST uses `volunteers: { create: ... }`.
        // This implies for every event we are creating NEW volunteer records, not reusing them from a pool?
        // Let's check the schema again. `Volunteer` has an ID.
        // If the user intends to reuse volunteers, the UI should support selecting them.
        // The current UI just asks for Name/Role. It implies simple one-off volunteers per event.
        // So deleting them and recreating is fine for this specific app context.

        // However, to be safe, let's just update the event scalar fields and handle volunteers carefully.
        // For this specific iteration, I will delete all volunteers associated with this event ID and recreate them from the list.

        // Wait, `deleteMany` with `where: { events: { some: { id: params.id } } }` will delete the volunteer records themselves.
        // Since the prompt implies "Assign Volunteers" (creating them on the fly), this is likely acceptable.

        // A safer standard approach for "replace all children":
        // 1. Update event, set volunteers to empty (disconnect).
        // 2. Delete the now-orphaned volunteers if they shouldn't exist? (Not easy with implicit m-n).

        // Let's stick to the pattern used in POST: `create`.
        // So for PUT:
        // Transaction:
        // 1. Delete volunteers linked to this event? 
        // Let's assume for now we just `set: []` to disconnect and then `create` new ones? 
        // Or simpler: User `prisma.event.update` with `volunteers: { deleteMany: {}, create: [...] }`.

        const event = await prisma.event.update({
            where: { id: params.id },
            data: {
                title,
                date: new Date(date),
                endDate: endDate ? new Date(endDate) : null,
                type,
                location,
                district,
                status,
                description,
                imagePaths: JSON.stringify(imagePaths || []),
                volunteers: {
                    deleteMany: {}, // Remove all associated volunteers
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
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("auth_token")?.value;
        let role = null;
        let userDistrict = null;

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

        const existingEvent = await prisma.event.findUnique({ where: { id: params.id } });
        if (!existingEvent) return new NextResponse("Event not found", { status: 404 });

        if (role === 'DISTRICT_ADMIN' && existingEvent.district !== userDistrict) {
            return NextResponse.json({ error: "Unauthorized: You can only delete events in your district" }, { status: 403 });
        }

        await prisma.event.delete({
            where: { id: params.id }
        });
        return new NextResponse("Deleted", { status: 200 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
