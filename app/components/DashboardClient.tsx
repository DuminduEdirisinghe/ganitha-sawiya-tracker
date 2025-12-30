"use client";

import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from "date-fns";
import { MapPin, School, Users, Calendar as CalendarIcon, Filter, X } from "lucide-react";
import DistrictChart from "./DistrictChart";
import DistrictProgress from "./DistrictProgress";
import DistrictScoreboard from "./DistrictScoreboard";
import PendingReviews from "./PendingReviews";
import { useRouter } from "next/navigation";

// All 25 Districts
const ALL_DISTRICTS = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota",
    "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale",
    "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
    "Trincomalee", "Vavuniya"
];

// Time Filters
const TIME_FILTERS = {
    ALL: "All Time",
    WEEKLY: "This Week",
    MONTHLY: "This Month",
    YEARLY: "This Year"
};

export default function DashboardClient({ events, isAdmin }: { events: any[], isAdmin: boolean }) {
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [timeFilter, setTimeFilter] = useState<keyof typeof TIME_FILTERS>("ALL");
    const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; items: string[] }>({
        isOpen: false,
        title: "",
        items: []
    });

    const router = useRouter();

    const handleEventClick = (id: string) => {
        router.push(`/calendar?eventId=${id}`);
    };

    const filteredEvents = useMemo(() => {
        let filtered = events;
        const now = new Date();

        // 1. Filter by District
        if (selectedDistrict) {
            filtered = filtered.filter(e => e.district === selectedDistrict);
        }

        // 2. Filter by Time
        if (timeFilter !== "ALL") {
            let start, end;
            if (timeFilter === "WEEKLY") {
                start = startOfWeek(now);
                end = endOfWeek(now);
            } else if (timeFilter === "MONTHLY") {
                start = startOfMonth(now);
                end = endOfMonth(now);
            } else if (timeFilter === "YEARLY") {
                start = startOfYear(now);
                end = endOfYear(now);
            }

            if (start && end) {
                filtered = filtered.filter(e => {
                    const eventDate = new Date(e.date);
                    return isWithinInterval(eventDate, { start, end });
                });
            }
        }

        return filtered;
    }, [events, selectedDistrict, timeFilter]);

    const stats = useMemo(() => {
        // Stats are derived from FILTERED events now? 
        // Or should stats be global? "Districts Reached" usually implies "Total". 
        // But "Dashboard Filter" implies adjusting the view.
        // Let's assume the filter applies to the DASHBOARD view, so stats update.

        const completed = filteredEvents.filter(e => e.status === 'COMPLETED');
        const upcoming = filteredEvents.filter(e => e.status === 'UPCOMING');

        // Use Sets for unique lists
        const uniqueSchoolsSet = new Set(completed.map(e => e.location));
        const uniqueDistrictsSet = new Set(completed.map(e => e.district));

        const totalVolunteers = completed.reduce((acc, curr) => acc + (curr.volunteers?.length || 0), 0);

        // Chart data
        const districtCounts: Record<string, number> = {};
        completed.forEach(e => {
            districtCounts[e.district] = (districtCounts[e.district] || 0) + 1;
        });
        const chartData = Object.entries(districtCounts).map(([name, value]) => ({ name, value }));

        return {
            completedCount: completed.length,
            upcomingCount: upcoming.length,
            districtCount: uniqueDistrictsSet.size,
            schoolCount: uniqueSchoolsSet.size,
            volunteerCount: totalVolunteers,
            recentEvents: completed.slice(0, 3),
            upcomingList: upcoming.slice(0, 3),
            chartData,

            // Lists for Modals
            uniqueDistrictsList: Array.from(uniqueDistrictsSet).sort(),
            uniqueSchoolsList: Array.from(uniqueSchoolsSet).sort()
        };
    }, [filteredEvents]);

    const openModal = (title: string, items: string[]) => {
        setModalState({ isOpen: true, title, items });
    };

    return (
        <div className="space-y-8">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-4">
                <h2 className="font-bold text-slate-700 flex items-center gap-2">
                    <Filter size={20} className="text-blue-500" />
                    Dashboard Filters
                </h2>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Time Filter */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {(Object.keys(TIME_FILTERS) as Array<keyof typeof TIME_FILTERS>).map((key) => (
                            <button
                                key={key}
                                onClick={() => setTimeFilter(key)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${timeFilter === key
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {TIME_FILTERS[key]}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                    {/* District Filter */}
                    <div className="flex items-center gap-2">
                        {selectedDistrict && (
                            <button onClick={() => setSelectedDistrict("")} className="text-sm text-red-500 hover:underline">
                                Clear
                            </button>
                        )}
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="border p-2 rounded-lg text-sm min-w-[150px]"
                        >
                            <option value="">All Districts</option>
                            {ALL_DISTRICTS.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Overdue Banner */}
            {isAdmin && <PendingReviews events={filteredEvents.filter(e => e.status === 'UPCOMING' && new Date(e.date) < new Date(new Date().setHours(0, 0, 0, 0)))} />}

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Districts Reached"
                    value={stats.districtCount}
                    icon={MapPin}
                    color="bg-blue-500"
                    onClick={() => openModal("Districts Reached", stats.uniqueDistrictsList)}
                    isClickable
                />
                <StatCard
                    label="Schools Visited"
                    value={stats.schoolCount}
                    icon={School}
                    color="bg-emerald-500"
                    onClick={() => openModal("Schools Visited", stats.uniqueSchoolsList)}
                    isClickable
                />
                <StatCard label="Seminars Conducted" value={stats.completedCount} icon={CalendarIcon} color="bg-purple-500" />
                <StatCard label="Volunteer Participations" value={stats.volunteerCount} icon={Users} color="bg-orange-500" />
            </div>

            {/* District Breakdown / Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">

                <h2 className="text-lg font-bold mb-4 flex items-center">
                    <div className="w-2 h-8 bg-blue-600 rounded mr-3"></div>
                    District Scoreboard {selectedDistrict ? `(${selectedDistrict})` : ""}
                </h2>
                <div className="w-full">
                    <DistrictScoreboard events={filteredEvents} />
                </div>
                {/* Removed old text breakdown table as Scoreboard covers it */}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <div className="w-2 h-8 bg-blue-600 rounded mr-3"></div>
                        Recent Seminars
                    </h2>
                    <div className="space-y-4">
                        {stats.recentEvents.length === 0 ? <p className="text-slate-500">No completed seminars found.</p> : null}
                        {stats.recentEvents.map(event => (
                            <div key={event.id} onClick={() => handleEventClick(event.id)} className="cursor-pointer flex items-start p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-white hover:shadow-md hover:border-blue-200 transition transform hover:-translate-y-1">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800">{event.title}</h3>
                                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                        <MapPin size={14} /> {event.location}, {event.district}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                        <CalendarIcon size={14} /> {format(new Date(event.date), 'MMM dd, yyyy')}
                                    </div>
                                </div>
                                {event.status === 'COMPLETED' && (
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Completed</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <div className="w-2 h-8 bg-purple-600 rounded mr-3"></div>
                        Upcoming Events
                    </h2>
                    <div className="space-y-4">
                        {stats.upcomingList.length === 0 ? <p className="text-slate-500">No upcoming seminars scheduled.</p> : null}
                        {stats.upcomingList.map(event => (
                            <div key={event.id} onClick={() => handleEventClick(event.id)} className="cursor-pointer flex items-start p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-white hover:shadow-md hover:border-purple-300 transition transform hover:-translate-y-1">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800">{event.title}</h3>
                                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                        <MapPin size={14} /> {event.location}, {event.district}
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                        <CalendarIcon size={14} /> {format(new Date(event.date), 'MMM dd, yyyy')}
                                    </div>
                                </div>
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Upcoming</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Simple Modal */}
            {
                modalState.isOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                        onClick={() => setModalState({ ...modalState, isOpen: false })}
                    >
                        <div
                            className="bg-white rounded-xl shadow-lg max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-700">{modalState.title}</h3>
                                <button onClick={() => setModalState({ ...modalState, isOpen: false })} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 max-h-[300px] overflow-y-auto">
                                {modalState.items.length > 0 ? (
                                    <ul className="space-y-2">
                                        {modalState.items.map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-400 text-center italic">No items to display.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
    color,
    onClick,
    isClickable
}: {
    label: string,
    value: number,
    icon: React.ElementType,
    color: string,
    onClick?: () => void,
    isClickable?: boolean
}) {
    return (
        <div
            onClick={onClick}
            className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 transition hover:shadow-md 
                ${isClickable ? "cursor-pointer hover:scale-105 active:scale-95" : "hover:scale-[1.02]"}
            `}
        >
            <div className={`p-4 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
                <Icon className={color.replace('bg-', 'text-')} size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}
