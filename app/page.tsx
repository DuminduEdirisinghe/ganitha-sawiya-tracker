import { prisma } from "@/lib/prisma";
import DashboardClient from "@/app/components/DashboardClient";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic'; // Ensure fresh data on every request

export default async function Home() {
  try {
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

    // Check for admin role
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;
    let isAdmin = false;
    if (token) {
      try {
        const payload = JSON.parse(token);
        if (payload.role) isAdmin = true; // Any role (Super or District) is admin
      } catch (e) {
        if (token === "admin_logged_in_v2") isAdmin = true;
      }
    }

    return (
      <DashboardClient events={serializedEvents} isAdmin={isAdmin} />
    );
  } catch (error) {
    console.error("Dashboard Load Error:", error);
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">System Error</h1>
        <p className="text-slate-600 mb-4">Could not load dashboard data.</p>
        <div className="bg-slate-100 p-4 rounded text-left overflow-auto max-w-2xl mx-auto">
          <pre className="text-xs text-red-800">{String(error)}</pre>
        </div>
      </div>
    );
  }
}

