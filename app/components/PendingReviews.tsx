"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function PendingReviews({ events }: { events: any[] }) {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleUpdateStatus = async (eventId: string, newStatus: string) => {
        setIsLoading(eventId);
        try {
            const res = await fetch(`/api/events/${eventId}`, {
                method: "PATCH", // Assuming PATCH or POST is supported for updates
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                router.refresh(); // Refresh data to remove from list
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating status");
        } finally {
            setIsLoading(null);
        }
    };

    if (events.length === 0) return null;

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                    <AlertTriangle size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-800">Action Required: Overdue Seminars</h3>
                    <p className="text-amber-700 text-sm mb-4">
                        The following {events.length} seminars have passed their scheduled date but are still marked as "Upcoming".
                        Please confirm their status.
                    </p>

                    <div className="space-y-3">
                        {events.map((event) => (
                            <div key={event.id} className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-semibold text-slate-800">{event.title}</h4>
                                    <p className="text-xs text-slate-500">
                                        {format(new Date(event.date), "PPP")} • {event.location} • {event.district}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleUpdateStatus(event.id, "COMPLETED")}
                                        disabled={isLoading === event.id}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-md hover:bg-green-200 transition disabled:opacity-50"
                                    >
                                        <CheckCircle size={14} /> Failed? No, Completed
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(event.id, "CANCELLED")}
                                        disabled={isLoading === event.id}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-md hover:bg-slate-200 transition disabled:opacity-50"
                                    >
                                        <XCircle size={14} /> Cancelled
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
