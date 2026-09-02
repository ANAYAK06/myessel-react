import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, SectionCard, StatCard, EmptyState } from '../components/PortalUI';
import { fetchMyAttendance } from '../../../slices/HRSlice/employeePortalSlice';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const statusLabel = {
    P: 'Present', A: 'Absent', HD: 'Half Day', PL: 'Paid Leave', L: 'Leave',
    H: 'Holiday', S: 'Sun / Holiday', WO: 'Week Off',
};

// Tint used for the calendar day cells (distinct from the pill Badge styles).
const dayStyles = {
    P: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
    A: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
    HD: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
    PL: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
    L: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200',
    H: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200',
    S: 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500',
    WO: 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500',
};
const emptyDayClass = 'text-gray-300 dark:text-gray-600';
const legend = ['P', 'HD', 'A', 'PL', 'L', 'H', 'S', 'WO'];

// Turn one month's API payload into { byDate: {1: 'P', 2: 'A', …}, totals }
const parseRecord = (payload) => {
    const record = payload?.Data?.[0];
    const byDate = {};
    if (record) {
        Object.keys(record).forEach((key) => {
            if (key.includes('#')) {
                const day = parseInt(key.split('#')[1], 10);
                if (!Number.isNaN(day)) byDate[day] = record[key];
            }
        });
    }
    return {
        byDate,
        totalPresentDays: record?.TotalPresentDays,
        totalMonthDays: record?.TotalMonthDays,
    };
};

const MonthCalendar = ({ year, monthIndex, monthName, byDate, loading, today }) => {
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
    const hasData = Object.keys(byDate).length > 0;

    const cells = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 text-center">
                {monthName} {year}
            </p>

            {loading && !hasData ? (
                <p className="text-xs text-gray-400 py-10 text-center">Loading…</p>
            ) : (
                <>
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {WEEKDAYS.map((w, i) => (
                            <div key={i} className="text-[10px] font-semibold text-gray-400 text-center">{w}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((d, i) => {
                            if (d === null) return <div key={i} />;
                            const code = byDate[d];
                            const isToday = isCurrentMonth && d === today.getDate();
                            return (
                                <div
                                    key={i}
                                    title={`${d} ${monthName.slice(0, 3)} — ${statusLabel[code] || 'Not marked'}`}
                                    className={`aspect-square rounded-md flex flex-col items-center justify-center text-[11px] font-medium ${dayStyles[code] || emptyDayClass} ${isToday ? 'ring-2 ring-orange-400' : ''}`}
                                >
                                    <span className="leading-none">{d}</span>
                                    {code && <span className="text-[7px] leading-none uppercase mt-0.5 opacity-70">{code}</span>}
                                </div>
                            );
                        })}
                    </div>
                    {!hasData && (
                        <p className="text-[11px] text-gray-400 text-center mt-2">No record for this month</p>
                    )}
                </>
            )}
        </div>
    );
};

const Attendance = ({ employeeData }) => {
    const dispatch = useDispatch();
    const { attendanceByPeriod, attendancePeriodLoading } = useSelector((state) => state.employeePortal);

    const empRefNo = employeeData?.EmpRefno;
    const today = useMemo(() => new Date(), []);

    // `anchor` is the newest (right-most) visible month; window shows anchor-2 … anchor.
    const [anchor, setAnchor] = useState({ year: today.getFullYear(), monthIndex: today.getMonth() });

    const isAtCurrent = anchor.year === today.getFullYear() && anchor.monthIndex === today.getMonth();

    const shift = (delta) => setAnchor((a) => {
        const d = new Date(a.year, a.monthIndex + delta, 1);
        const now = new Date(today.getFullYear(), today.getMonth(), 1);
        if (d > now) return a; // never page into the future
        return { year: d.getFullYear(), monthIndex: d.getMonth() };
    });

    const months = useMemo(() => [2, 1, 0].map((back) => {
        const d = new Date(anchor.year, anchor.monthIndex - back, 1);
        const monthName = d.toLocaleString('en-US', { month: 'long' });
        return { year: d.getFullYear(), monthIndex: d.getMonth(), monthName, key: `${monthName}-${d.getFullYear()}` };
    }), [anchor]);

    useEffect(() => {
        if (!empRefNo) return;
        months.forEach((m) => {
            const known = Object.prototype.hasOwnProperty.call(attendanceByPeriod || {}, m.key);
            const inFlight = (attendancePeriodLoading || {})[m.key];
            if (!known && !inFlight) {
                dispatch(fetchMyAttendance({ empRefNo, month: m.monthName, year: m.year }));
            }
        });
    }, [dispatch, empRefNo, months, attendanceByPeriod, attendancePeriodLoading]);

    const perMonth = useMemo(() => {
        const out = {};
        months.forEach((m) => {
            out[m.key] = {
                ...parseRecord(attendanceByPeriod?.[m.key]),
                loading: !!attendancePeriodLoading?.[m.key],
            };
        });
        return out;
    }, [months, attendanceByPeriod, attendancePeriodLoading]);

    const summary = useMemo(() => months.reduce((acc, m) => {
        const { byDate, totalPresentDays, totalMonthDays } = perMonth[m.key];
        Object.values(byDate).forEach((v) => {
            if (v === 'P') acc.present += 1;
            else if (v === 'A') acc.absent += 1;
            else if (v === 'HD') acc.halfDay += 1;
            else if (v === 'PL' || v === 'L') acc.leave += 1;
        });
        acc.payable += parseFloat(totalPresentDays || 0);
        acc.monthDays += parseFloat(totalMonthDays || 0);
        return acc;
    }, { present: 0, absent: 0, halfDay: 0, leave: 0, payable: 0, monthDays: 0 }), [months, perMonth]);

    const anyLoading = months.some((m) => perMonth[m.key].loading);
    const anyData = months.some((m) => Object.keys(perMonth[m.key].byDate).length > 0);

    const first = months[0];
    const last = months[2];
    const rangeLabel = first.year === last.year
        ? `${first.monthName.slice(0, 3)} – ${last.monthName.slice(0, 3)} ${last.year}`
        : `${first.monthName.slice(0, 3)} ${first.year} – ${last.monthName.slice(0, 3)} ${last.year}`;

    return (
        <div>
            <PageHeader title="Attendance / Time" subtitle="Your attendance calendar — three months at a glance" icon={Clock} />

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <StatCard label="Present" value={summary.present} tone="navy" />
                <StatCard label="Half Day" value={summary.halfDay} tone="white" />
                <StatCard label="Absent" value={summary.absent} tone="white" />
                <StatCard label="On Leave" value={summary.leave} tone="white" />
                <StatCard
                    label="Payable Days"
                    value={summary.payable || '—'}
                    sub={summary.monthDays ? `of ${summary.monthDays}` : undefined}
                    tone="orange"
                />
            </div>

            <SectionCard
                title={rangeLabel}
                icon={Clock}
                action={
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => shift(-3)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                            <ChevronLeft className="w-4 h-4" /> Older
                        </button>
                        <button
                            onClick={() => shift(3)}
                            disabled={isAtCurrent}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        >
                            Newer <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                }
            >
                {!anyLoading && !anyData ? (
                    <EmptyState
                        icon={Clock}
                        title="No attendance found"
                        subtitle="No attendance has been recorded for these months yet."
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {months.map((m) => (
                                <MonthCalendar
                                    key={m.key}
                                    year={m.year}
                                    monthIndex={m.monthIndex}
                                    monthName={m.monthName}
                                    byDate={perMonth[m.key].byDate}
                                    loading={perMonth[m.key].loading}
                                    today={today}
                                />
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                            {legend.map((code) => (
                                <div key={code} className="flex items-center gap-1.5">
                                    <span className={`w-3 h-3 rounded ${dayStyles[code]}`} />
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">{statusLabel[code]}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </SectionCard>
        </div>
    );
};

export default Attendance;
