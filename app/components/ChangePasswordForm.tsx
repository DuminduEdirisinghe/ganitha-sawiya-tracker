"use client";

import { useState } from "react";
import { Lock, Save } from "lucide-react";

export default function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (newPassword.length < 6) {
            setStatus("error");
            setMessage("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus("error");
            setMessage("New passwords do not match.");
            return;
        }

        setStatus("loading");

        try {
            const res = await fetch("/api/profile/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("Password updated successfully!");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to update password.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-md">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Lock size={18} className="text-blue-600" />
                Change Password
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                    <div className={`p-3 rounded text-sm ${status === "success" ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {message}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                    <input
                        type="password"
                        required
                        className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                    <input
                        type="password"
                        required
                        className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                    <input
                        type="password"
                        required
                        className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70"
                    >
                        {status === "loading" ? "Updating..." : (
                            <>
                                <Save size={16} /> Update Password
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
