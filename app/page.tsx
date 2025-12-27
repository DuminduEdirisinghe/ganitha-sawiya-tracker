import { prisma } from "@/lib/prisma";
import DashboardClient from "@/app/components/DashboardClient";

export const dynamic = 'force-dynamic'; // Ensure fresh data on every request

export default async function Home() {
  const events = await prisma.event.findMany({
    include: { volunteers: true },
    orderBy: { date: 'desc' }
  });

  return (
    <DashboardClient events={events} />
  );
}

