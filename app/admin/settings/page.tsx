import ChangePasswordForm from "@/app/components/ChangePasswordForm";
import UserManagement from "@/app/admin/components/UserManagement";
import { Settings } from "lucide-react";
import { cookies } from "next/headers";

export default function SettingsPage() {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token");
    let isSuperAdmin = false;

    if (token) {
        try {
            const session = JSON.parse(token.value);
            if (session.role === "SUPER_ADMIN") {
                isSuperAdmin = true;
            }
        } catch (e) { }
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
                    <Settings size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
                    <p className="text-slate-500">Manage your profile and security</p>
                </div>
            </div>

            <div className="grid gap-12">
                <section>
                    <h2 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">Security</h2>
                    <ChangePasswordForm />
                </section>

                {isSuperAdmin && (
                    <section>
                        <h2 className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">User Administration</h2>
                        <p className="text-sm text-slate-500 mb-4">You have super admin privileges to manage other users.</p>
                        <UserManagement />
                    </section>
                )}
            </div>
        </div>
    );
}
