"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { MapPin, Users, X, Edit2, Trash2, Filter, Plus } from "lucide-react";
import { clsx } from 'clsx';
import { useRouter, useSearchParams } from "next/navigation";
import CustomToolbar from "@/app/components/CalendarToolbar";

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

type Event = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: {
        id: string; // Ensure ID is passed in resource for actions
        status: string;
        location: string;
        district: string;
        type: string;
        description: string;
        volunteers: { id: string; name: string; role: string }[];
        imagePaths: string;
    };
};

// All 25 Districts (Shared constant ideally, but hardcoding for now)
const ALL_DISTRICTS = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota",
    "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale",
    "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
    "Trincomalee", "Vavuniya"
];

export default function CalendarClient({ isAdmin, role, adminDistrict }: { isAdmin: boolean; role?: string | null; adminDistrict?: string | null }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());
    const [selectedDistrict, setSelectedDistrict] = useState("");

    const fetchEvents = () => {
        fetch("/api/events")
            .then((res) => res.json())
            .then((data) => {
                const formattedEvents = data.map((e: any) => ({
                    id: e.id,
                    title: e.title,
                    start: new Date(e.date),
                    end: e.endDate ? new Date(e.endDate) : new Date(e.date),
                    allDay: true,
                    resource: { ...e, id: e.id },
                }));
                setEvents(formattedEvents);
            });
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Deep linking effect
    useEffect(() => {
        const eventId = searchParams.get('eventId');
        if (eventId && events.length > 0) {
            const found = events.find(e => e.id === eventId);
            if (found) {
                setDate(found.start);
                setSelectedEvent(found.resource);
            }
        }
    }, [events, searchParams]);

    const onNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);
    const onView = useCallback((newView: any) => setView(newView), [setView]);

    const filteredEvents = useMemo(() => {
        if (!selectedDistrict) return events;
        return events.filter(e => e.resource?.district === selectedDistrict);
    }, [events, selectedDistrict]);

    const handleCreate = () => {
        router.push('/admin');
    };

    const onSelectSlot = (slotInfo: { start: Date }) => {
        const dateStr = format(slotInfo.start, 'yyyy-MM-dd');
        router.push(`/admin?date=${dateStr}`);
    };

    const eventStyleGetter = (event: Event) => {
        let backgroundColor = '#3B82F6';
        if (event.resource?.status === 'COMPLETED') backgroundColor = '#10B981';
        if (event.resource?.status === 'CANCELLED') backgroundColor = '#EF4444';

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this seminar?")) return;
        try {
            const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
            if (res.ok) {
                alert("Seminar deleted successfully.");
                setSelectedEvent(null);
                fetchEvents();
            } else {
                alert("Failed to delete.");
            }
        } catch {
            alert("Error deleting.");
        }
    };

    const handleEdit = (event: any) => {
        router.push(`/admin?edit=${event.id}`);
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                <h2 className="text-lg font-bold text-slate-700">Seminar Calendar</h2>
                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <button
                            onClick={handleCreate}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm"
                        >
                            <Plus size={18} />
                            Add Seminar
                        </button>
                    )}

                    <div className="h-6 w-px bg-slate-200"></div>

                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="border p-2 rounded-lg text-sm min-w-[180px]"
                        >
                            <option value="">All Districts</option>
                            {ALL_DISTRICTS.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div style={{ height: 700 }} className="font-sans">
                    <BigCalendar
                        localizer={localizer}
                        events={filteredEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: "100%" }}
                        onSelectEvent={(event) => setSelectedEvent(event.resource)}

                        selectable
                        onSelectSlot={onSelectSlot}

                        view={view}
                        date={date}
                        onView={onView}
                        onNavigate={onNavigate}

                        views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
                        eventPropGetter={eventStyleGetter}
                        components={{
                            toolbar: CustomToolbar
                        }}
                        tooltipAccessor={e => `${e.title} - ${e.resource?.location}`}
                        className="rounded-lg"
                    />
                </div>
            </div>

            {selectedEvent && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        {/* Header Image or Color */}
                        <div className={`h-24 ${selectedEvent.status === 'COMPLETED' ? 'bg-green-600' : 'bg-blue-600'} relative`}>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-1 rounded-full transition"
                            >
                                <X size={20} />
                            </button>

                            {/* Action Buttons - Only for Admin */}
                            {isAdmin && (
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {(role === 'SUPER_ADMIN' || (role === 'DISTRICT_ADMIN' && selectedEvent.district === adminDistrict)) && (
                                        <>
                                            <button
                                                onClick={() => handleEdit(selectedEvent)}
                                                className="bg-white/20 hover:bg-white/90 hover:text-blue-600 text-white p-1.5 rounded-lg transition"
                                                title="Edit Seminar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(selectedEvent.id)}
                                                className="bg-white/20 hover:bg-red-500 hover:text-white text-white p-1.5 rounded-lg transition"
                                                title="Delete Seminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-6 -mt-10 relative">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 inline-block mb-4">
                                <span className={clsx("text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider", {
                                    'bg-green-100 text-green-700': selectedEvent.status === 'COMPLETED',
                                    'bg-blue-100 text-blue-700': selectedEvent.status === 'UPCOMING',
                                    'bg-red-100 text-red-700': selectedEvent.status === 'CANCELLED',
                                })}>
                                    {selectedEvent.status}
                                </span>
                                {selectedEvent.type && (
                                    <span className="ml-2 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-purple-100 text-purple-700">
                                        {selectedEvent.type} Seminar
                                    </span>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedEvent.title}</h2>

                            <div className="space-y-4 text-slate-600 mt-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-blue-500 p-1.5 bg-blue-50 rounded-lg w-8 h-8" size={32} />
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">Location</p>
                                        <p className="text-sm">{selectedEvent.location}, {selectedEvent.district}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="text-purple-500 p-1.5 bg-purple-50 rounded-lg w-8 h-8 flex items-center justify-center">
                                        <span className="font-serif italic font-bold">i</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">Description</p>
                                        <p className="text-sm leading-relaxed">{selectedEvent.description || "No description provided."}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4 mt-2">
                                    <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2 mb-3">
                                        <Users size={16} className="text-orange-500" />
                                        Participating Volunteers
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedEvent.volunteers?.length > 0 ? selectedEvent.volunteers.map((v: any) => (
                                            <div key={v.id} className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm flex flex-col">
                                                <span className="font-medium">{v.name}</span>
                                                <span className="text-[10px] text-slate-400 uppercase">{v.role}</span>
                                            </div>
                                        )) : <p className="text-sm text-slate-400 italic">No volunteers assigned.</p>}
                                    </div>
                                </div>

                                {/* Image Gallery Mini */}
                                {selectedEvent.imagePaths && (
                                    <div className="border-t pt-4 mt-2">
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {JSON.parse(selectedEvent.imagePaths).map((path: string, i: number) => (
                                                <img key={i} src={path} className="w-20 h-20 rounded-lg object-cover border" alt="Seminar" />
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 border-t text-center">
                            <button
                                className="text-sm text-slate-500 hover:text-slate-800 font-medium transition"
                                onClick={() => setSelectedEvent(null)}
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
