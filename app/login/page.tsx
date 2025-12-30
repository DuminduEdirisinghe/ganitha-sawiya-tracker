"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            router.push("/"); // Redirect to main dashboard
            router.refresh();
        } else {
            const data = await res.json();
            setError(data.error || "Invalid username or password");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 max-w-sm w-full">
                <div className="text-center mb-6">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-700">
                        <LogIn size={20} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
                    <p className="text-slate-500 text-sm">Sign in to manage Ganitha Sawiya</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                        <input
                            type="text"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
