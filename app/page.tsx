import { prisma } from "@/lib/prisma";
import DashboardClient from "@/app/components/DashboardClient";

export const dynamic = 'force-dynamic'; // Ensure fresh data on every request

export default async function Home() {
  const events = await prisma.event.findMany({
    include: { volunteers: true },
    orderBy: { date: 'desc' }
  });

  // Serialize dates to pass to Client Component (Next.js requirement)
  const serializedEvents = events.map(event => ({
    ...event,
    date: event.date.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }));

  return (
    <DashboardClient events={serializedEvents} />
  );
}

