"use client";

import { useMemo } from "react";

// Colors for top performers
const COLORS = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-orange-500", "bg-indigo-500"];

export default function DistrictProgress({ data }: { data: { name: string; value: number }[] }) {

    // Sort by count desc
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => b.value - a.value);
    }, [data]);

    if (sortedData.length === 0) {
        return <div className="text-center text-slate-400 py-8">No data to display.</div>;
    }

    // Max value for scaling (100% width)
    const maxValue = sortedData[0].value || 1;

    return (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedData.map((district, index) => {
                // Calculate percentage relative to the *max* value found (to make bars readable)
                const percentage = (district.value / maxValue) * 100;

                // Color logic: Top 3 get distinct colors, others get generic blue
                const barColor = index < 3 ? COLORS[index] : "bg-slate-400";

                return (
                    <div key={district.name} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium text-slate-700 truncate" title={district.name}>
                            {district.name}
                        </div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <div className="w-8 text-sm font-bold text-slate-600 text-right">
                            {district.value}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
