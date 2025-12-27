import { ChevronLeft, ChevronRight } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CustomToolbar(toolbar: any) {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
        toolbar.onNavigate('TODAY');
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 px-1">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                    {toolbar.label}
                </h2>
                <p className="text-slate-500 font-medium mt-1">Manage and track your seminars</p>
            </div>

            <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                    <button
                        onClick={goToBack}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-md text-slate-500 hover:text-slate-800 transition"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={goToCurrent}
                        className="px-3 py-1 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
                    >
                        Today
                    </button>
                    <button
                        onClick={goToNext}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-md text-slate-500 hover:text-slate-800 transition"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className="w-px h-6 bg-slate-200"></div>

                <div className="flex p-1 gap-1">
                    {['month', 'week', 'agenda'].map(view => (
                        <button
                            key={view}
                            onClick={() => toolbar.onView(view)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${toolbar.view === view
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                        >
                            {view}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
