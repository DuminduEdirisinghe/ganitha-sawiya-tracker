"use client";

import { useState, useEffect } from "react";
import { Users, RefreshCw, KeyRound } from "lucide-react";

type User = {
    id: string;
    username: string;
    role: string;
    district: string | null;
};

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setResetStatus("loading");

        try {
            const res = await fetch("/api/admin/users/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: selectedUser.username, newPassword }),
            });

            if (res.ok) {
                setResetStatus("success");
                setNewPassword("");
                setTimeout(() => {
                    setSelectedUser(null);
                    setResetStatus("idle");
                }, 2000);
            } else {
                setResetStatus("error");
            }
        } catch (error) {
            setResetStatus("error");
        }
    };

    if (loading) return <div className="text-slate-500 text-sm">Loading users...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 mt-8 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Users size={18} className="text-blue-600" />
                    User Management
                </h3>
                <button onClick={fetchUsers} className="text-slate-400 hover:text-blue-600 transition">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-medium">
                        <tr>
                            <th className="px-6 py-3">Username</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">District</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-medium">{user.username}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {user.role === 'SUPER_ADMIN' ? 'Admin' : 'District'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{user.district || "-"}</td>
                                <td className="px-6 py-4 text-right">
                                    {user.role !== 'SUPER_ADMIN' && (
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center justify-end gap-1 ml-auto"
                                        >
                                            <KeyRound size={14} /> Reset
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Reset Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                        <h4 className="text-lg font-bold mb-2">Reset Password</h4>
                        <p className="text-sm text-slate-500 mb-4">Set a new password for <strong>{selectedUser.username}</strong>.</p>

                        <form onSubmit={handleResetPassword}>
                            <input
                                type="text"
                                placeholder="New Password"
                                className="w-full border p-2 rounded mb-4"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoFocus
                                required
                                minLength={6}
                            />

                            {resetStatus === 'success' && <p className="text-green-600 text-sm mb-4">Password reset successful!</p>}
                            {resetStatus === 'error' && <p className="text-red-600 text-sm mb-4">Failed to reset.</p>}

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setSelectedUser(null); setResetStatus('idle'); setNewPassword(""); }}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetStatus === 'loading' || resetStatus === 'success'}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {resetStatus === 'loading' ? 'Saving...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
