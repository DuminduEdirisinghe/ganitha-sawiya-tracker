"use client";

import { useState, useMemo } from "react";
import { Mail, Phone, Award, Filter, MapPin, X } from "lucide-react";

// All 25 Districts (Shared constant)
const ALL_DISTRICTS = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota",
    "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale",
    "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
    "Trincomalee", "Vavuniya"
];

type Volunteer = {
    id: string;
    name: string;
    role: string;
    bio?: string | null;
    photoUrl?: string | null;
    email?: string | null;
    phone?: string | null;
    events: { district: string; title: string, id: string }[];
};

export default function VolunteerClient({ volunteers, isAdmin }: { volunteers: Volunteer[], isAdmin: boolean }) {
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

    const filteredVolunteers = useMemo(() => {
        if (!selectedDistrict) return volunteers;
        return volunteers.filter(v =>
            v.events.some(e => e.district === selectedDistrict)
        );
    }, [volunteers, selectedDistrict]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Our Volunteers</h1>

                    {/* District Filter */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                            <Filter size={16} className="text-slate-500" />
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="bg-transparent text-sm text-slate-700 outline-none min-w-[150px]"
                            >
                                <option value="">All Districts</option>
                                {ALL_DISTRICTS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        {selectedDistrict && (
                            <button
                                onClick={() => setSelectedDistrict("")}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-500 text-sm">
                                <th className="pb-3 font-medium pl-4">Name</th>
                                <th className="pb-3 font-medium">Participations</th>
                                <th className="pb-3 font-medium">Active Districts</th>
                                <th className="pb-3 font-medium">Contact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredVolunteers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                                        No volunteers found for the selected filter.
                                    </td>
                                </tr>
                            ) : null}
                            {filteredVolunteers.map((volunteer) => {
                                const activeDistricts = Array.from(new Set(volunteer.events.map(e => e.district)));

                                return (
                                    <tr
                                        key={volunteer.id}
                                        onClick={() => setSelectedVolunteer(volunteer)}
                                        className="group hover:bg-slate-50 transition cursor-pointer"
                                    >
                                        <td className="py-4 pr-4 pl-4">
                                            <div className="flex items-center gap-3">
                                                {volunteer.photoUrl ? (
                                                    <img src={volunteer.photoUrl} alt={volunteer.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                                        {volunteer.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-semibold text-slate-700 block group-hover:text-blue-600 transition">{volunteer.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                                <Award size={12} />
                                                {volunteer.events.length} Seminars
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="flex flex-wrap gap-1">
                                                {activeDistricts.slice(0, 3).map(d => (
                                                    <span key={d} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                                        {d}
                                                    </span>
                                                ))}
                                                {activeDistricts.length > 3 && (
                                                    <span className="text-[10px] text-slate-400 pl-1">
                                                        +{activeDistricts.length - 3} more
                                                    </span>
                                                )}
                                                {activeDistricts.length === 0 && <span className="text-slate-300 text-xs">-</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-slate-500">
                                            {isAdmin ? (
                                                <div className="flex flex-col gap-1">
                                                    {volunteer.phone ? <div className="flex items-center gap-1"><Phone size={12} /> {volunteer.phone}</div> : <span className="text-slate-300">-</span>}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Hidden</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Volunteer Details Modal */}
            {selectedVolunteer && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedVolunteer(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-blue-600 h-24 relative">
                            <button
                                onClick={() => setSelectedVolunteer(null)}
                                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-1 rounded-full transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 pb-6 -mt-12 relative">
                            <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-lg mb-4">
                                {selectedVolunteer.photoUrl ? (
                                    <img src={selectedVolunteer.photoUrl} alt={selectedVolunteer.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-3xl font-bold">
                                        {selectedVolunteer.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-slate-800">{selectedVolunteer.name}</h2>
                            <p className="text-blue-600 font-medium mb-4">{selectedVolunteer.role}</p>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {selectedVolunteer.bio || "No bio available for this volunteer."}
                                    </p>
                                </div>

                                <div className="flex gap-4 border-t pt-4">
                                    <div className="flex-1">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Participations</h3>
                                        <p className="font-semibold text-slate-800">{selectedVolunteer.events.length} Seminars</p>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact</h3>
                                        {isAdmin ? (
                                            <>
                                                {selectedVolunteer.phone ? (
                                                    <a href={`tel:${selectedVolunteer.phone}`} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                                        <Phone size={14} /> {selectedVolunteer.phone}
                                                    </a>
                                                ) : <span className="text-slate-400 text-sm">N/A</span>}
                                                {selectedVolunteer.email && (
                                                    <a href={`mailto:${selectedVolunteer.email}`} className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1 mt-1">
                                                        <Mail size={14} /> {selectedVolunteer.email}
                                                    </a>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">Contact info hidden</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
