import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, SectionCard, StatCard, Badge, EmptyState, SearchInput, Pagination } from '../components/PortalUI';
import { fetchMyAttendance } from '../../../slices/HRSlice/employeePortalSlice';

const PAGE_SIZE = 10;

const statusConfig = {
    P: { label: 'Present', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
    A: { label: 'Absent', className: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400' },
    HD: { label: 'Half Day', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
    PL: { label: 'Paid Leave', className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' },
    L: { label: 'Leave', className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' },
    H: { label: 'Holiday', className: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300' },
    S: { label: 'Sunday/Holiday', className: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300' },
    WO: { label: 'Week Off', className: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300' },
};
const notMarked = { label: 'Not Marked', className: 'bg-gray-50 text-gray-400 dark:bg-white/5 dark:text-gray-500' };
const statusOf = (code) => (code ? statusConfig[code] || { label: code, className: notMarked.className } : notMarked);

const Attendance = ({ employeeData }) => {
    const dispatch = useDispatch();
    const { attendanceData, loading } = useSelector((state) => state.employeePortal);

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonthIndex, setViewMonthIndex] = useState(today.getMonth()); // 0-11
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const empRefNo = employeeData?.EmpRefno;
    const monthName = useMemo(
        () => new Date(viewYear, viewMonthIndex, 1).toLocaleString('en-US', { month: 'long' }),
        [viewYear, viewMonthIndex]
    );

    useEffect(() => {
        if (empRefNo) {
            dispatch(fetchMyAttendance({ empRefNo, month: monthName, year: viewYear }));
        }
    }, [dispatch, empRefNo, monthName, viewYear]);

    const goToMonth = (delta) => {
        let newIndex = viewMonthIndex + delta;
        let newYear = viewYear;
        if (newIndex < 0) { newIndex = 11; newYear -= 1; }
        else if (newIndex > 11) { newIndex = 0; newYear += 1; }
        setViewMonthIndex(newIndex);
        setViewYear(newYear);
    };

    const record = attendanceData?.Data?.[0];

    const dayColumns = useMemo(() => {
        if (!record) return [];
        const cols = [];
        Object.keys(record).forEach((key) => {
            if (key.includes('#')) {
                const [dayName, dateStr] = key.split('#');
                cols.push({ key, dayName, date: parseInt(dateStr, 10), value: record[key] });
            }
        });
        return cols.sort((a, b) => a.date - b.date);
    }, [record]);

    const summary = useMemo(
        () => dayColumns.reduce((acc, col) => {
            if (col.value === 'P') acc.present += 1;
            else if (col.value === 'A') acc.absent += 1;
            else if (col.value === 'HD') acc.halfDay += 1;
            else if (col.value === 'PL' || col.value === 'L') acc.onLeave += 1;
            return acc;
        }, { present: 0, absent: 0, halfDay: 0, onLeave: 0 }),
        [dayColumns]
    );

    const filteredDayColumns = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return dayColumns;
        return dayColumns.filter((col) => {
            const status = statusOf(col.value);
            return `${col.date} ${col.dayName} ${status.label}`.toLowerCase().includes(term);
        });
    }, [dayColumns, search]);

    const totalPages = Math.max(1, Math.ceil(filteredDayColumns.length / PAGE_SIZE));
    const pagedDayColumns = filteredDayColumns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search, monthName, viewYear]);

    return (
        <div>
            <PageHeader title="Attendance / Time" subtitle="Your monthly attendance record" icon={Clock} />

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <StatCard label="Present" value={summary.present} tone="navy" />
                <StatCard label="Half Day" value={summary.halfDay} tone="white" />
                <StatCard label="Absent" value={summary.absent} tone="white" />
                <StatCard label="On Leave" value={summary.onLeave} tone="white" />
                <StatCard label="Payable Days" value={record?.TotalPresentDays ?? '—'} sub={record?.TotalMonthDays ? `of ${record.TotalMonthDays}` : undefined} tone="orange" />
            </div>

            <SectionCard
                title={`Daily Record — ${monthName} ${viewYear}`}
                icon={Clock}
                action={
                    <div className="flex items-center gap-2">
                        {dayColumns.length > 0 && (
                            <SearchInput value={search} onChange={setSearch} placeholder="Search date, day, status…" className="sm:w-52" />
                        )}
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={() => goToMonth(-1)}
                                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => goToMonth(1)}
                                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                }
            >
                {loading.attendanceData ? (
                    <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
                ) : dayColumns.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title="No attendance found"
                        subtitle="No attendance has been recorded for this month yet."
                    />
                ) : filteredDayColumns.length === 0 ? (
                    <EmptyState icon={Clock} title="No matching records" subtitle="Try a different search term." />
                ) : (
                    <>
                    <div className="overflow-x-auto -mx-4 sm:-mx-5">
                        <table className="w-full min-w-[420px]">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-4 sm:px-5 py-2.5">Date</th>
                                    <th className="px-2 py-2.5">Day</th>
                                    <th className="px-2 py-2.5">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/60">
                                {pagedDayColumns.map((col) => {
                                    const status = statusOf(col.value);
                                    return (
                                        <tr key={col.key} className="text-sm">
                                            <td className="px-4 sm:px-5 py-2.5 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">
                                                {col.date} {monthName.slice(0, 3)} {viewYear}
                                            </td>
                                            <td className="px-2 py-2.5 text-gray-500 dark:text-gray-400">{col.dayName}</td>
                                            <td className="px-2 py-2.5">
                                                <Badge className={status.className}>{status.label}</Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalItems={filteredDayColumns.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                    </>
                )}
            </SectionCard>
        </div>
    );
};

export default Attendance;
