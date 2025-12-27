const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ALL_DISTRICTS = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota",
    "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale",
    "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
    "Trincomalee", "Vavuniya"
];

async function main() {
    // 1. Create Super Admin
    const superAdmin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: { role: 'SUPER_ADMIN', district: null },
        create: {
            username: 'admin',
            password: 'password123',
            role: 'SUPER_ADMIN',
            district: null
        },
    });
    console.log('Created Super Admin:', superAdmin.username);

    // 2. Create District Admins
    for (const district of ALL_DISTRICTS) {
        const username = `admin_${district.toLowerCase().replace(/\s+/g, '')}`;
        const user = await prisma.user.upsert({
            where: { username },
            update: { role: 'DISTRICT_ADMIN', district },
            create: {
                username,
                password: 'password123',
                role: 'DISTRICT_ADMIN',
                district,
            },
        });
        console.log(`Created Admin for ${district}: ${user.username}`);
    }

    // 3. Seed Volunteers (prevent duplicates)
    const vol1 = await prisma.volunteer.upsert({
        where: { id: "vol-kasun" },
        update: {},
        create: { id: "vol-kasun", name: "Kasun Perera", role: "Lecturer" }
    });

    // Note: Upsert needs a unique field. `id` is unique. 
    // If we want to use 'seed-vol-kasun' as ID, we can string literal it.

    // 4. Seed Events
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
        // Simple check to avoid duplicate events if running seed multiple times
        const existing = await prisma.event.findFirst({
            where: { title: event.title, date: event.date }
        });

        if (!existing) {
            await prisma.event.create({
                data: {
                    ...event,
                    volunteers: {
                        connect: [{ id: "vol-kasun" }]
                    }
                }
            });
            console.log(`Created event: ${event.title}`);
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
