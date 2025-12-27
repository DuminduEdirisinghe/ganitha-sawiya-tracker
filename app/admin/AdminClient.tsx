

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Upload, X, Save, MapPin, UserPlus, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Suspense } from "react";

export default function AdminClient({ role, adminDistrict }: { role?: string | null; adminDistrict?: string | null }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminContent role={role} adminDistrict={adminDistrict} />
        </Suspense>
    );
}

function AdminContent({ role, adminDistrict }: { role?: string | null; adminDistrict?: string | null }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    // Auto-edit effect
    useEffect(() => {
        const editParam = searchParams.get('edit');
        if (editParam && events.length > 0) {
            const eventToEdit = events.find(e => e.id === editParam);
            if (eventToEdit) {
                handleEdit(eventToEdit);
                // Clear param so refresh doesn't re-trigger? Optional.
            }
        }
    }, [events, searchParams]);

    // Set default district for District Admins
    useEffect(() => {
        if (adminDistrict) {
            setFormData(prev => ({ ...prev, district: adminDistrict }));
        }
    }, [adminDistrict]);


    const fetchEvents = async () => {
        const res = await fetch("/api/events");
        if (res.ok) {
            const data = await res.json();
            setEvents(data);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this seminar?")) return;

        try {
            const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchEvents();
            } else {
                alert("Failed to delete");
            }
        } catch (e) {
            alert("Error deleting");
        }
    };

    const handleEdit = (event: any) => {
        setEditingId(event.id);

        // Calculate duration approx
        let duration = "1";
        if (event.endDate && event.date) {
            const start = new Date(event.date);
            const end = new Date(event.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            // +1 because same day start-end is 1 day. 
            // Logic check: if start=Jan1, end=Jan1, diff=0, duration=1.
            // If start=Jan1, end=Jan2, diff=1 day, duration=2.
            duration = String(diffDays > 3 ? 3 : diffDays); // Limit to dropdown
        }

        setFormData({
            title: event.title,
            date: event.date.split("T")[0],
            duration,
            type: event.type || "Paper",
            location: event.location,
            district: event.district,
            status: event.status,
            description: event.description || "",
            imagePaths: event.imagePaths ? JSON.parse(event.imagePaths) : [],
            volunteers: event.volunteers.map((v: any) => ({ name: v.name, role: v.role, phone: v.phone || "" }))
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            title: "", date: "", duration: "1", type: "Paper", location: "", district: "", status: "UPCOMING", description: "", imagePaths: [], volunteers: []
        });
    };

    const [formData, setFormData] = useState({
        title: "",
        date: "",
        duration: "1", // 1, 2, or 3 days
        type: "Paper",
        location: "",
        district: "",
        status: "UPCOMING",
        description: "",
        imagePaths: [] as string[],
        volunteers: [] as { name: string; role: string; phone: string; bio: string; photoUrl: string }[]
    });

    const [newVolunteer, setNewVolunteer] = useState({ name: "", role: "Member", phone: "", bio: "", photoUrl: "" });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        const data = new FormData();
        data.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: data });
        if (res.ok) {
            const { path } = await res.json();
            setFormData(prev => ({ ...prev, imagePaths: [...prev.imagePaths, path] }));
        }
    };

    const handleVolunteerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        const data = new FormData();
        data.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: data });
        if (res.ok) {
            const { path } = await res.json();
            setNewVolunteer(prev => ({ ...prev, photoUrl: path }));
        }
    };

    const addVolunteer = () => {
        if (newVolunteer.name) {
            setFormData(prev => ({
                ...prev,
                volunteers: [...prev.volunteers, newVolunteer]
            }));
            setNewVolunteer({ name: "", role: "Member", phone: "", bio: "", photoUrl: "" });
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Calculate endDate
        let endDate = null;
        if (formData.date) {
            const start = new Date(formData.date);
            const duration = parseInt(formData.duration);
            if (duration > 1) {
                const end = new Date(start);
                end.setDate(start.getDate() + (duration - 1));
                endDate = end.toISOString();
            } else {
                endDate = start.toISOString();
            }
        }

        try {
            const url = editingId ? `/api/events/${editingId}` : "/api/events";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, endDate })
            });

            if (res.ok) {
                alert(editingId ? "Seminar updated successfully!" : "Seminar created successfully!");
                cancelEdit(); // Resets form
                fetchEvents(); // Refresh list
            } else {
                alert("Something went wrong");
            }
        } catch {
            alert("Error submitting form");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-700">{role === 'SUPER_ADMIN' ? 'Super Admin' : 'District Admin'}</p>
                        {adminDistrict && <p className="text-xs text-slate-500">{adminDistrict} District</p>}
                        <div className="text-[10px] text-red-500 bg-red-50 p-1 rounded mt-1">
                            Debug: Role=[{role}] Dist=[{adminDistrict}]
                        </div>
                    </div>
                    <button className="text-sm text-red-600 hover:underline" onClick={async () => {
                        await fetch("/api/logout", { method: "POST" });
                        window.location.href = "/login";
                    }}>Logout</button>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        {editingId ? <Edit2 className="bg-orange-100 text-orange-600 p-1 rounded-full" size={24} /> : <Plus className="bg-blue-100 text-blue-600 p-1 rounded-full" size={24} />}
                        {editingId ? "Edit Seminar" : "Create New Seminar"}
                    </h2>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-sm text-slate-500 hover:text-slate-800">Cancel Edit</button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Seminar Title</label>
                            <input required name="title" value={formData.title} onChange={handleInputChange} className="w-full border p-2 rounded-lg" placeholder="e.g. Ganitha Sawiya - Matara" />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full border p-2 rounded-lg" />
                            </div>
                            <div className="w-32">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                                <select name="duration" value={formData.duration} onChange={handleInputChange} className="w-full border p-2 rounded-lg bg-white">
                                    <option value="1">1 Day</option>
                                    <option value="2">2 Days</option>
                                    <option value="3">3 Days</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Seminar Type</label>
                            <select name="type" value={formData.type} onChange={handleInputChange} className="w-full border p-2 rounded-lg bg-white">
                                <option value="Paper">Paper Seminar</option>
                                <option value="Remedial">Remedial Seminar</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">School (Location)</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
                                <input required name="location" value={formData.location} onChange={handleInputChange} className="w-full border pl-10 p-2 rounded-lg" placeholder="School Name" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                            <select
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                className={`w-full border p-2 rounded-lg bg-white ${adminDistrict ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                                disabled={!!adminDistrict}
                            >
                                <option value="">Select District</option>
                                {["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border p-2 rounded-lg h-24" placeholder="Details about the seminar..."></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Seminar Status</label>
                        <div className="flex gap-4">
                            {["UPCOMING", "COMPLETED", "CANCELLED"].map(status => (
                                <label key={status} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border ${formData.status === status ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white'}`}>
                                    <input type="radio" name="status" value={status} checked={formData.status === status} onChange={handleInputChange} className="accent-blue-600" />
                                    <span className="text-sm font-medium">{status}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Photos */}
                    <div className="border-t pt-6">
                        <label className="block text-sm font-medium text-slate-700 mb-4">Seminar Photos</label>
                        <div className="flex flex-wrap gap-4 items-start">
                            {formData.imagePaths.map((path, i) => (
                                <div key={i} className="relative group">
                                    <img src={path} alt="Upload" className="w-24 h-24 object-cover rounded-lg border" />
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, imagePaths: p.imagePaths.filter((_, idx) => idx !== i) }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition">
                                <Upload size={20} />
                                <span className="text-xs mt-1">Upload</span>
                                <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                            </label>
                        </div>
                    </div>

                    {/* Volunteers */}
                    <div className="border-t pt-6">
                        <label className="block text-sm font-medium text-slate-700 mb-4">Assign Volunteers</label>

                        <div className="bg-slate-50 p-4 rounded-lg mb-4">
                            <div className="flex gap-4 items-start">
                                {/* Photo Upload Logic */}
                                <div className="shrink-0">
                                    <label className="block text-xs text-slate-500 mb-1">Photo</label>
                                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group bg-white hover:bg-slate-50 transition cursor-pointer">
                                        {newVolunteer.photoUrl ? (
                                            <img src={newVolunteer.photoUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload size={20} className="text-slate-400" />
                                        )}
                                        <input type="file" onChange={handleVolunteerPhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-500">Name</label>
                                            <input value={newVolunteer.name} onChange={e => setNewVolunteer({ ...newVolunteer, name: e.target.value })} className="w-full border p-2 rounded text-sm" placeholder="Member Name" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">Role</label>
                                            <select value={newVolunteer.role} onChange={e => setNewVolunteer({ ...newVolunteer, role: e.target.value })} className="w-full border p-2 rounded text-sm">
                                                <option>Member</option>
                                                <option>Coordinator</option>
                                                <option>Lecturer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-end">
                                        <div className="flex-1">
                                            <label className="text-xs text-slate-500">Bio (Optional)</label>
                                            <input value={newVolunteer.bio} onChange={e => setNewVolunteer({ ...newVolunteer, bio: e.target.value })} className="w-full border p-2 rounded text-sm" placeholder="Short bio..." />
                                        </div>
                                        <div className="w-32">
                                            <label className="text-xs text-slate-500">Phone</label>
                                            <input value={newVolunteer.phone} onChange={e => setNewVolunteer({ ...newVolunteer, phone: e.target.value })} className="w-full border p-2 rounded text-sm" placeholder="07x..." />
                                        </div>
                                        <button type="button" onClick={addVolunteer} className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 h-10 w-10 flex items-center justify-center">
                                            <UserPlus size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {formData.volunteers.length > 0 && (
                            <div className="space-y-2">
                                {formData.volunteers.map((v, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white border p-2 rounded-lg text-sm">
                                        <div>
                                            <span className="font-medium text-slate-800">{v.name}</span>
                                            <span className="text-slate-500 ml-2">({v.role})</span>
                                        </div>
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, volunteers: p.volunteers.filter((_, idx) => idx !== i) }))} className="text-slate-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-6 flex justify-end">
                        <button disabled={loading} type="submit" className={
                            `px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 text-white ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
                            }`
                        }>
                            {loading ? "Saving..." : <><Save size={18} /> {editingId ? "Update Seminar" : "Save Seminar"}</>}
                        </button>
                    </div>
                </form >
            </div >

            {/* List of Existing Seminars */}
            < div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100" >
                <h2 className="text-xl font-semibold mb-6 text-slate-800">Manage Seminars</h2>
                <div className="space-y-3">
                    {events.length === 0 ? (
                        <p className="text-slate-500 text-sm italic">No seminars found.</p>
                    ) : (
                        events.map((event) => (
                            <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition">
                                <div>
                                    <h3 className="font-semibold text-slate-800">{event.title}</h3>
                                    <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                        <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                                        <span>•</span>
                                        <span>{event.location}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${event.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            event.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>{event.status}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {(role === 'SUPER_ADMIN' || (role === 'DISTRICT_ADMIN' && event.district === adminDistrict)) && (
                                        <>
                                            <button
                                                onClick={() => handleEdit(event)}
                                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div >
        </div >
    );
}
