"use client";

import { useMemo } from "react";
import { differenceInDays, parseISO } from "date-fns";

type EventDetails = {
    id: string;
    district: string;
    type: string;
    date: Date | string;
    endDate: Date | string | null;
    status: string;
};

export default function DistrictScoreboard({ events }: { events: EventDetails[] }) {

    const stats = useMemo(() => {
        // Group by district
        const districtMap: Record<string, {
            paper: number;
            remedial: number;
            oneDay: number;
            twoDay: number;
            threeDay: number;
            total: number;
        }> = {};

        events.forEach(event => {
            // Only count completed events? Or all? Usually scoreboards show completed + upcoming progress.
            // Let's count COMPLETED for "Score", but maybe all for general stats. 
            // User asked "how much ... are done", implies COMPLETED.
            if (event.status !== 'COMPLETED') return;

            const district = event.district;
            if (!districtMap[district]) {
                districtMap[district] = { paper: 0, remedial: 0, oneDay: 0, twoDay: 0, threeDay: 0, total: 0 };
            }

            // Count Type
            if (event.type === 'Paper') districtMap[district].paper++;
            if (event.type === 'Remedial') districtMap[district].remedial++;

            // Count Duration
            let duration = 1;
            if (event.endDate) {
                const start = typeof event.date === 'string' ? parseISO(event.date) : event.date;
                const end = typeof event.endDate === 'string' ? parseISO(event.endDate) : event.endDate;
                duration = differenceInDays(end, start) + 1;
            }

            if (duration === 1) districtMap[district].oneDay++;
            else if (duration === 2) districtMap[district].twoDay++;
            else if (duration >= 3) districtMap[district].threeDay++;

            districtMap[district].total++;
        });

        // Convert to array and sort by total descending
        return Object.entries(districtMap)
            .map(([name, stat]) => ({ name, ...stat }))
            .sort((a, b) => b.total - a.total);
    }, [events]);

    if (stats.length === 0) {
        return <div className="text-center text-slate-400 py-8">No completed seminars yet.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs tracking-wider">
                    <tr>
                        <th className="px-4 py-3 rounded-tl-lg">District</th>
                        <th className="px-4 py-3 text-center bg-blue-50 text-blue-700">Paper</th>
                        <th className="px-4 py-3 text-center bg-green-50 text-green-700">Remedial</th>
                        <th className="px-4 py-3 text-center">1-Day</th>
                        <th className="px-4 py-3 text-center">2-Day</th>
                        <th className="px-4 py-3 text-center">3-Day+</th>
                        <th className="px-4 py-3 text-right font-black rounded-tr-lg">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {stats.map((row) => (
                        <tr key={row.name} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                            <td className="px-4 py-3 text-center font-semibold text-blue-600">{row.paper || "-"}</td>
                            <td className="px-4 py-3 text-center font-semibold text-green-600">{row.remedial || "-"}</td>
                            <td className="px-4 py-3 text-center text-slate-500">{row.oneDay || "-"}</td>
                            <td className="px-4 py-3 text-center text-slate-500">{row.twoDay || "-"}</td>
                            <td className="px-4 py-3 text-center text-slate-500">{row.threeDay || "-"}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900">{row.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
