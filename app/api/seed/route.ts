import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Check if data exists
        const userCount = await prisma.user.count();
        if (userCount > 0) {
            return NextResponse.json({ message: "Database already seeded" });
        }

        // Create Admin User
        await prisma.user.create({
            data: {
                username: "admin",
                password: "password123", // In real app, hash this!
            },
        });

        // Create Events
        const events = [
            {
                title: "Ganitha Sawiya - Gampaha",
                date: new Date("2024-10-15"),
                location: "Bandaranayake College",
                district: "Gampaha",
                status: "COMPLETED",
                description: "Seminar for Grade 11 students covering Geometry.",
            },
            {
                title: "Ganitha Sawiya - Galle",
                date: new Date("2024-11-20"),
                location: "Mahinda College",
                district: "Galle",
                status: "COMPLETED",
                description: "Focus on Algebra and Trigonometry.",
            },
            {
                title: "Ganitha Sawiya - Jaffna",
                date: new Date("2024-12-05"),
                location: "Jaffna Central College",
                district: "Jaffna",
                status: "COMPLETED",
                description: "General Math revision.",
            },
            {
                title: "Ganitha Sawiya - Colombo",
                date: new Date("2025-01-10"),
                location: "Royal College",
                district: "Colombo",
                status: "UPCOMING",
                description: "Final refresher before exams.",
            },
        ];

        for (const event of events) {
            await prisma.event.create({
                data: {
                    ...event,
                    volunteers: {
                        create: [
                            { name: "Kasun Perera", role: "Lecturer" },
                            { name: "Amal Silva", role: "Coordinator" },
                        ],
                    },
                },
            });
        }

        return NextResponse.json({ message: "Seeding successful" });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
