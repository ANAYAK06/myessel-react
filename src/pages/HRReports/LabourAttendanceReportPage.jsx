import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import {
    Users,
    Building2,
    Calendar,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    Info,
    RefreshCw,
    ChevronRight,
    Activity,
    UserCheck,
    CalendarDays,
    TrendingUp,
    Printer,
    FileDown,
    HardHat,
    Briefcase,
    LayoutList,
    TableProperties,
} from 'lucide-react';
import { toast } from 'react-toastify';

import {
    fetchAttReportContractors,
    fetchLabourAttData,
    fetchLabourMonthAttData,
    fetchLabourCCForAttReport,
    fetchAttLabourById,
    clearFilters,
    resetLabourAttData,
    resetLabourCCList,
    resetLabourSearch,
    clearError,
    selectContractors,
    selectLabourAttData,
    selectLabourMonthAttData,
    selectLabourCCList,
    selectLabourSearchResults,
    selectLoading,
    selectErrors,
    selectIsAnyLoading,
} from '../../slices/HrReportSlice/labourAttendanceReportSlice';

// ============================================================
// Helpers
// ============================================================
const MONTHS = [
    { value: '1',  label: 'January' },
    { value: '2',  label: 'February' },
    { value: '3',  label: 'March' },
    { value: '4',  label: 'April' },
    { value: '5',  label: 'May' },
    { value: '6',  label: 'June' },
    { value: '7',  label: 'July' },
    { value: '8',  label: 'August' },
    { value: '9',  label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

const generateYears = () => {
    const cur = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => cur - i);
};

const getMonthLabel = (value) => MONTHS.find((m) => m.value === value)?.label ?? value;

const downloadCSV = (data, filename) => {
    if (!data?.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
        headers.map((h) => {
            const v = row[h];
            return typeof v === 'string' && v.includes(',') ? `"${v}"` : (v ?? '');
        }).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// ============================================================
// Tooltip
// ============================================================
const Tooltip = ({ children, content }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            {children}
            {show && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg whitespace-nowrap z-50">
                    {content}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                </div>
            )}
        </div>
    );
};

// ============================================================
// Attendance Status Badge  (P | HD | A | H)
// ============================================================
const STATUS_CONFIG = {
    P:  { label: 'P',  color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',   full: 'Present'  },
    HD: { label: 'HD', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300', full: 'Half Day' },
    A:  { label: 'A',  color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',             full: 'Absent'   },
    H:  { label: 'H',  color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',         full: 'Holiday'  },
};

const AttBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status || '-', color: 'bg-gray-100 dark:bg-gray-800 text-gray-500', full: status || '-' };
    return (
        <Tooltip content={cfg.full}>
            <div className={clsx('flex items-center justify-center w-9 h-9 rounded-lg font-bold text-xs', cfg.color)}>
                {cfg.label}
            </div>
        </Tooltip>
    );
};

// ============================================================
// Legend
// ============================================================
const Legend = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex flex-wrap items-center gap-4">
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                    <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs', val.color)}>
                        {val.label}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{val.full}</span>
                </div>
            ))}
        </div>
    </div>
);

// ============================================================
// Summary Cards (for day-by-day report)
// ============================================================
const SummaryCards = ({ rows }) => {
    if (!rows?.length) return null;

    const totals = rows.reduce(
        (acc, r) => ({
            present:  acc.present  + (Number(r.TotalPresent)  || 0),
            halfDay:  acc.halfDay  + (Number(r.TotalHalfDay)  || 0),
            absent:   acc.absent   + (Number(r.TotalAbsent)   || 0),
            holiday:  acc.holiday  + (Number(r.TotalHoliday)  || 0),
            daysWorked: acc.daysWorked + (Number(r.DaysWorked) || 0),
        }),
        { present: 0, halfDay: 0, absent: 0, holiday: 0, daysWorked: 0 }
    );

    const cards = [
        { title: 'Total Present',  value: totals.present,  icon: UserCheck,     color: 'from-green-500 to-emerald-600',  bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' },
        { title: 'Half Days',      value: totals.halfDay,  icon: Activity,      color: 'from-orange-500 to-amber-600',   bg: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20' },
        { title: 'Absent',         value: totals.absent,   icon: AlertTriangle, color: 'from-red-500 to-rose-600',       bg: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20' },
        { title: 'Holidays',       value: totals.holiday,  icon: Calendar,      color: 'from-blue-500 to-cyan-600',      bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
        { title: 'Days Worked',    value: totals.daysWorked, icon: TrendingUp,  color: 'from-indigo-500 to-purple-600',  bg: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            {cards.map((card, i) => (
                <div key={i} className={`bg-gradient-to-r ${card.bg} rounded-xl p-5 border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                        </div>
                        <div className={`bg-gradient-to-r ${card.color} p-3 rounded-lg`}>
                            <card.icon className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ============================================================
// Day-by-Day Detail Table
// ============================================================
const DetailTable = ({ rows }) => {
    if (!rows?.length) return null;

    // Build day columns from D01-D31
    const dayKeys = Array.from({ length: 31 }, (_, i) => `D${String(i + 1).padStart(2, '0')}`);

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gradient-to-r from-teal-600 to-emerald-700 sticky top-0 z-10">
                    <tr>
                        <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase sticky left-0 bg-teal-600 z-20 min-w-[220px]">
                            Labour
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-white uppercase min-w-[90px]">CC</th>
                        {dayKeys.map((d) => (
                            <th key={d} className="px-1 py-3 text-center text-xs font-bold text-white uppercase min-w-[40px]">
                                {d.replace('D0', '').replace('D', '')}
                            </th>
                        ))}
                        <th className="px-3 py-3 text-center text-xs font-bold text-white uppercase bg-emerald-700 min-w-[60px]">P</th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-white uppercase bg-emerald-700 min-w-[60px]">HD</th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-white uppercase bg-emerald-700 min-w-[60px]">A</th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-white uppercase bg-emerald-700 min-w-[60px]">Wk</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            {/* Labour info */}
                            <td className="px-3 py-3 sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white text-xs">{row.LabourId}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">{row.LabourName}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500">{row.Category}</div>
                                        {row.ContractorName && (
                                            <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">{row.ContractorName}</div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            {/* CC */}
                            <td className="px-3 py-3 text-center text-xs text-gray-700 dark:text-gray-300">
                                <div className="font-medium">{row.CCCode}</div>
                                <div className="text-gray-500 dark:text-gray-500 truncate max-w-[80px]" title={row.CCName}>{row.CCName}</div>
                            </td>
                            {/* Day columns */}
                            {dayKeys.map((d) => (
                                <td key={d} className="px-1 py-2 text-center">
                                    {row[d] ? <AttBadge status={row[d]} /> : (
                                        <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-300 dark:text-gray-600 text-xs">–</div>
                                    )}
                                </td>
                            ))}
                            {/* Totals */}
                            <td className="px-3 py-3 text-center font-bold text-green-600 dark:text-green-400 text-sm">{row.TotalPresent ?? '-'}</td>
                            <td className="px-3 py-3 text-center font-bold text-orange-500 dark:text-orange-400 text-sm">{row.TotalHalfDay ?? '-'}</td>
                            <td className="px-3 py-3 text-center font-bold text-red-500 dark:text-red-400 text-sm">{row.TotalAbsent ?? '-'}</td>
                            <td className="px-3 py-3 text-center font-bold text-blue-500 dark:text-blue-400 text-sm">{row.DaysWorked ?? '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Showing {rows.length} labour{rows.length !== 1 ? 's' : ''}
                </span>
                <span className="text-teal-600 dark:text-teal-400 font-semibold">Labour Attendance — Day Detail</span>
            </div>
        </div>
    );
};

// ============================================================
// Monthly CC-Summary Table
// ============================================================
const MonthlySummaryTable = ({ rows, monthLabel, year }) => {
    if (!rows?.length) return null;

    const grand = rows.reduce(
        (acc, r) => ({
            labours:    acc.labours    + (Number(r.TotalLabours)    || 0),
            daysWorked: acc.daysWorked + (Number(r.TotalDaysWorked) || 0),
            present:    acc.present    + (Number(r.TotalPresent)    || 0),
            halfDay:    acc.halfDay    + (Number(r.TotalHalfDay)    || 0),
            absent:     acc.absent     + (Number(r.TotalAbsent)     || 0),
            holiday:    acc.holiday    + (Number(r.TotalHoliday)    || 0),
        }),
        { labours: 0, daysWorked: 0, present: 0, halfDay: 0, absent: 0, holiday: 0 }
    );

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                    <tr>
                        {['#', 'CC Code', 'CC Name', 'Total Labours', 'Days Worked', 'Present', 'Half Day', 'Absent', 'Holiday'].map((h) => (
                            <th key={h} className="px-4 py-3 text-center text-xs font-bold text-white uppercase whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{idx + 1}</td>
                            <td className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">{row.CCCode}</td>
                            <td className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">{row.CCName}</td>
                            <td className="px-4 py-3 text-center font-bold text-indigo-600 dark:text-indigo-400">{row.TotalLabours}</td>
                            <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{row.TotalDaysWorked}</td>
                            <td className="px-4 py-3 text-center font-bold text-green-600 dark:text-green-400">{row.TotalPresent}</td>
                            <td className="px-4 py-3 text-center font-bold text-orange-500 dark:text-orange-400">{row.TotalHalfDay}</td>
                            <td className="px-4 py-3 text-center font-bold text-red-500 dark:text-red-400">{row.TotalAbsent}</td>
                            <td className="px-4 py-3 text-center font-bold text-blue-500 dark:text-blue-400">{row.TotalHoliday}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                    <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white text-xs uppercase">Grand Total</td>
                        <td className="px-4 py-3 text-center font-bold text-indigo-700 dark:text-indigo-300">{grand.labours}</td>
                        <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">{grand.daysWorked}</td>
                        <td className="px-4 py-3 text-center font-bold text-green-700 dark:text-green-300">{grand.present}</td>
                        <td className="px-4 py-3 text-center font-bold text-orange-600 dark:text-orange-300">{grand.halfDay}</td>
                        <td className="px-4 py-3 text-center font-bold text-red-600 dark:text-red-300">{grand.absent}</td>
                        <td className="px-4 py-3 text-center font-bold text-blue-600 dark:text-blue-300">{grand.holiday}</td>
                    </tr>
                </tfoot>
            </table>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {rows.length} Cost Centre{rows.length !== 1 ? 's' : ''} — {monthLabel} {year}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Monthly CC Summary</span>
            </div>
        </div>
    );
};

// ============================================================
// Main Page
// ============================================================
const LabourAttendanceReportPage = () => {
    const dispatch = useDispatch();

    // Redux state
    const contractors        = useSelector(selectContractors);
    const labourAttData      = useSelector(selectLabourAttData);
    const labourMonthAttData = useSelector(selectLabourMonthAttData);
    const labourCCList       = useSelector(selectLabourCCList);
    const labourSearchResults= useSelector(selectLabourSearchResults);
    const loading            = useSelector(selectLoading);
    const errors             = useSelector(selectErrors);
    const isAnyLoading       = useSelector(selectIsAnyLoading);

    // Local form state
    const [searchType,      setSearchType]      = useState('id');   // 'id' | 'cc'
    const [labourType,      setLabourType]       = useState('Own Labour');
    const [contractorCode,  setContractorCode]   = useState('');
    const [selectedMonth,   setSelectedMonth]    = useState('');
    const [selectedYear,    setSelectedYear]     = useState('');
    const [typeValue,       setTypeValue]        = useState('');

    // Labour search (ID mode)
    const [searchTerm,         setSearchTerm]         = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchRef = useRef(null);

    // View mode for CC-wise results
    const [viewMode, setViewMode] = useState('detail'); // 'detail' | 'summary'

    // ── Init: current month/year ────────────────────────────────────
    useEffect(() => {
        const now = new Date();
        setSelectedYear(now.getFullYear().toString());
        setSelectedMonth((now.getMonth() + 1).toString());
    }, []);

    // ── Fetch contractors on mount ──────────────────────────────────
    useEffect(() => {
        dispatch(fetchAttReportContractors());
    }, [dispatch]);

    // ── Fetch CC list whenever month/year/labourType/contractor change (CC mode)
    useEffect(() => {
        if (searchType === 'cc' && selectedMonth && selectedYear) {
            dispatch(fetchLabourCCForAttReport({
                month: selectedMonth,
                year: selectedYear,
                labourType: labourType,
                contractor: labourType === 'Contractor' ? contractorCode : '',
            }));
            setTypeValue('');
        }
    }, [searchType, selectedMonth, selectedYear, labourType, contractorCode, dispatch]);

    // ── Labour autocomplete (ID mode) ──────────────────────────────
    useEffect(() => {
        if (searchType === 'id' && searchTerm.length >= 2) {
            dispatch(fetchAttLabourById({
                prefix: searchTerm,
                labourType: labourType,
                contractor: labourType === 'Contractor' ? contractorCode : '',
            }));
            setShowSearchDropdown(true);
        } else {
            setShowSearchDropdown(false);
        }
    }, [searchTerm, searchType, labourType, contractorCode, dispatch]);

    // ── Close dropdown on outside click ────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearchDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Error toasts ────────────────────────────────────────────────
    useEffect(() => {
        Object.entries(errors).forEach(([key, err]) => {
            if (err) {
                toast.error(`Error: ${err}`);
                dispatch(clearError({ errorType: key }));
            }
        });
    }, [errors, dispatch]);

    // ── Handlers ────────────────────────────────────────────────────
    const handleSearchTypeChange = (type) => {
        setSearchType(type);
        setTypeValue('');
        setSearchTerm('');
        dispatch(resetLabourAttData());
        dispatch(resetLabourSearch());
    };

    const handleLabourTypeChange = (type) => {
        setLabourType(type);
        setContractorCode('');
        setTypeValue('');
        setSearchTerm('');
        dispatch(resetLabourAttData());
        dispatch(resetLabourCCList());
        dispatch(resetLabourSearch());
    };

    const handleLabourSelect = (labour) => {
        setTypeValue(labour.LabourId ?? labour.RefNo ?? '');
        setSearchTerm(`${labour.LabourId ?? labour.RefNo} — ${labour.LabourName ?? labour.EmpName ?? ''}`);
        setShowSearchDropdown(false);
    };

    const handleView = async () => {
        if (!selectedYear)  { toast.warning('Please select a year');  return; }
        if (!selectedMonth) { toast.warning('Please select a month'); return; }
        if (labourType === 'Contractor' && !contractorCode) {
            toast.warning('Please select a contractor'); return;
        }
        if (!typeValue) {
            toast.warning(searchType === 'id' ? 'Please search and select a labour' : 'Please select a Cost Centre');
            return;
        }

        const params = {
            typeValue,
            month: selectedMonth,
            year: selectedYear,
            reportType: searchType === 'id' ? 'ID' : 'CCCode',
            contractorCode: labourType === 'Contractor' ? contractorCode : '',
            labourType,
        };

        try {
            await dispatch(fetchLabourAttData(params)).unwrap();
            // Also fetch monthly summary for CC mode
            if (searchType === 'cc') {
                dispatch(fetchLabourMonthAttData({
                    month: selectedMonth,
                    year: selectedYear,
                    contractorCode: labourType === 'Contractor' ? contractorCode : '',
                    labourType,
                }));
            }
            toast.success('Attendance report loaded successfully');
        } catch {
            toast.error('Failed to fetch attendance report. Please try again.');
        }
    };

    const handleReset = () => {
        const now = new Date();
        setSelectedYear(now.getFullYear().toString());
        setSelectedMonth((now.getMonth() + 1).toString());
        setTypeValue('');
        setSearchTerm('');
        setContractorCode('');
        dispatch(clearFilters());
        dispatch(resetLabourAttData());
        dispatch(resetLabourSearch());
    };

    const handleExcelDownload = () => {
        const data = viewMode === 'summary'
            ? (Array.isArray(labourMonthAttData?.Data) ? labourMonthAttData.Data : labourMonthAttData)
            : (Array.isArray(labourAttData?.Data) ? labourAttData.Data : labourAttData);
        if (!data?.length) { toast.warning('No data available to download'); return; }
        const suffix = viewMode === 'summary' ? 'Monthly_Summary' : 'Day_Detail';
        downloadCSV(data, `Labour_Attendance_${suffix}_${selectedYear}_${getMonthLabel(selectedMonth)}`);
        toast.success('Excel file downloaded successfully');
    };

    // Normalise API response to array
    const detailRows   = Array.isArray(labourAttData?.Data)      ? labourAttData.Data      : (Array.isArray(labourAttData)      ? labourAttData      : []);
    const summaryRows  = Array.isArray(labourMonthAttData?.Data) ? labourMonthAttData.Data : (Array.isArray(labourMonthAttData) ? labourMonthAttData : []);
    const ccList       = Array.isArray(labourCCList?.Data)       ? labourCCList.Data       : (Array.isArray(labourCCList)       ? labourCCList       : []);
    const contractorList = Array.isArray(contractors?.Data)      ? contractors.Data         : (Array.isArray(contractors)       ? contractors        : []);
    const searchList   = Array.isArray(labourSearchResults?.Data)? labourSearchResults.Data : (Array.isArray(labourSearchResults)? labourSearchResults: []);

    const hasDetailData  = detailRows.length > 0;
    const hasSummaryData = summaryRows.length > 0;
    const hasAnyData     = hasDetailData || hasSummaryData;

    // ── Render ───────────────────────────────────────────────────────
    return (
        <div className="space-y-5 p-6">

            {/* ── Page Header ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <CalendarDays className="h-7 w-7 text-teal-600" />
                            Labour Attendance Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Monthly attendance tracking — by Labour ID or Cost Centre
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-2 bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900 dark:to-emerald-900 text-teal-800 dark:text-teal-200 text-sm rounded-full">
                            HR Reports
                        </span>
                        {isAnyLoading && (
                            <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-sm">
                                <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
                            </span>
                        )}
                    </div>
                </div>
                <nav className="text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <span>Dashboard</span>
                        <ChevronRight className="w-4 h-4" />
                        <span>HR Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Labour Attendance Report</span>
                    </div>
                </nav>
            </div>

            {/* ── Step 1: Search Type ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Step 1 — Search By
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { value: 'id', label: 'Labour ID Wise', icon: Users,     desc: 'View attendance for a specific labour' },
                        { value: 'cc', label: 'CC Code Wise',   icon: Building2, desc: 'View attendance for all labours in a Cost Centre' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleSearchTypeChange(opt.value)}
                            className={clsx(
                                'p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 text-left',
                                searchType === opt.value
                                    ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 text-teal-700 dark:text-teal-300'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-500 text-gray-700 dark:text-gray-300'
                            )}
                        >
                            <opt.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="font-semibold">{opt.label}</div>
                                <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Step 2: Labour Type ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Step 2 — Labour Type
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {[
                        { value: 'Own Labour',  label: 'Own Labour',  icon: HardHat,  desc: "Company's direct labours" },
                        { value: 'Contractor',  label: 'Contractor',  icon: Briefcase, desc: 'Labour supplied by a contractor' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleLabourTypeChange(opt.value)}
                            className={clsx(
                                'p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 text-left',
                                labourType === opt.value
                                    ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-700 dark:text-amber-300'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-500 text-gray-700 dark:text-gray-300'
                            )}
                        >
                            <opt.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="font-semibold">{opt.label}</div>
                                <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Contractor dropdown (only when Contractor selected) */}
                {labourType === 'Contractor' && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Select Contractor <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={contractorCode}
                            onChange={(e) => { setContractorCode(e.target.value); setTypeValue(''); }}
                            disabled={loading.contractors}
                            className="w-full sm:w-72 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 transition-colors"
                        >
                            <option value="">— Select Contractor —</option>
                            {contractorList.map((c, i) => (
                                <option key={c.ContractorCode ?? i} value={c.ContractorCode}>
                                    {c.ContractorName ?? c.ContractorCode}
                                </option>
                            ))}
                        </select>
                        {loading.contractors && (
                            <p className="text-xs text-amber-500 mt-1">Loading contractors…</p>
                        )}
                    </div>
                )}
            </div>

            {/* ── Step 3: Period + Labour / CC ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Step 3 — Period &amp; {searchType === 'id' ? 'Labour' : 'Cost Centre'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Month */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Month <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => { setSelectedMonth(e.target.value); setTypeValue(''); dispatch(resetLabourAttData()); }}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">Select Month</option>
                            {MONTHS.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Year */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => { setSelectedYear(e.target.value); setTypeValue(''); dispatch(resetLabourAttData()); }}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">Select Year</option>
                            {generateYears().map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* ID search */}
                    {searchType === 'id' && (
                        <div className="relative sm:col-span-2" ref={searchRef}>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Labour ID / Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setTypeValue('');
                                    }}
                                    onFocus={() => searchTerm.length >= 2 && setShowSearchDropdown(true)}
                                    placeholder="Type Labour ID or name to search…"
                                    disabled={!selectedMonth || !selectedYear || (labourType === 'Contractor' && !contractorCode)}
                                    className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 transition-colors"
                                />
                                {loading.labourSearch
                                    ? <RefreshCw className="absolute right-3 top-3.5 h-5 w-5 text-teal-400 animate-spin" />
                                    : <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                                }
                            </div>

                            {/* Autocomplete dropdown */}
                            {showSearchDropdown && searchList.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {searchList.map((l, i) => (
                                        <button
                                            key={i}
                                            onMouseDown={() => handleLabourSelect(l)}
                                            className="w-full px-4 py-3 text-left hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-0"
                                        >
                                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {l.LabourId ?? l.RefNo}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {l.LabourName ?? l.EmpName} {l.Category ? `— ${l.Category}` : ''}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showSearchDropdown && searchTerm.length >= 2 && searchList.length === 0 && !loading.labourSearch && (
                                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No labours found for "{searchTerm}"
                                </div>
                            )}
                        </div>
                    )}

                    {/* CC Code dropdown */}
                    {searchType === 'cc' && (
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Cost Centre <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={typeValue}
                                onChange={(e) => setTypeValue(e.target.value)}
                                disabled={loading.labourCCList || !selectedMonth || !selectedYear}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 transition-colors"
                            >
                                <option value="">— Select Cost Centre —</option>
                                {ccList.map((cc, i) => (
                                    <option key={cc.CCCode ?? cc.CC_Code ?? i} value={cc.CCCode ?? cc.CC_Code}>
                                        {(cc.CCCode ?? cc.CC_Code)} — {cc.CCName ?? cc.CC_Name ?? ''}
                                    </option>
                                ))}
                            </select>
                            {loading.labourCCList && (
                                <p className="text-xs text-teal-500 mt-1">Loading cost centres…</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Action Buttons ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isAnyLoading || !selectedMonth || !selectedYear || !typeValue ||
                                (labourType === 'Contractor' && !contractorCode)}
                            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                        >
                            {isAnyLoading
                                ? <RotateCcw className="h-5 w-5 animate-spin" />
                                : <Eye className="h-5 w-5" />
                            }
                            View Report
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Reset
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Export:</span>
                        <Tooltip content="Print report">
                            <button
                                onClick={() => window.print()}
                                disabled={!hasAnyData}
                                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                            >
                                <Printer className="h-5 w-5" /> Print
                            </button>
                        </Tooltip>
                        <Tooltip content="Download as Excel / CSV">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!hasAnyData}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                            >
                                <FileDown className="h-5 w-5" /> Export
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* ── Results Area ── */}
            {(isAnyLoading || hasAnyData) && (
                <div className="space-y-4">

                    {/* View toggle (CC wise shows both views) */}
                    {searchType === 'cc' && hasAnyData && (
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 w-fit">
                            <button
                                onClick={() => setViewMode('detail')}
                                className={clsx(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                    viewMode === 'detail'
                                        ? 'bg-teal-600 text-white shadow'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                )}
                            >
                                <TableProperties className="h-4 w-4" /> Day Detail
                            </button>
                            <button
                                onClick={() => setViewMode('summary')}
                                className={clsx(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                    viewMode === 'summary'
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                )}
                            >
                                <LayoutList className="h-4 w-4" /> Monthly Summary
                            </button>
                        </div>
                    )}

                    {/* Loading spinner */}
                    {isAnyLoading && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-full p-4">
                                    <RotateCcw className="h-10 w-10 text-teal-500 animate-spin" />
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 font-medium">Loading attendance data…</p>
                            </div>
                        </div>
                    )}

                    {/* Detail view */}
                    {!isAnyLoading && (viewMode === 'detail' || searchType === 'id') && hasDetailData && (
                        <>
                            <SummaryCards rows={detailRows} />
                            <Legend />
                            <DetailTable rows={detailRows} />
                        </>
                    )}

                    {/* Monthly summary view */}
                    {!isAnyLoading && viewMode === 'summary' && searchType === 'cc' && hasSummaryData && (
                        <MonthlySummaryTable
                            rows={summaryRows}
                            monthLabel={getMonthLabel(selectedMonth)}
                            year={selectedYear}
                        />
                    )}

                    {/* No data state */}
                    {!isAnyLoading && !hasDetailData && (viewMode === 'detail' || searchType === 'id') && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full p-4">
                                    <Search className="h-10 w-10 text-gray-400" />
                                </div>
                                <p className="text-gray-900 dark:text-white font-semibold">No Attendance Data Found</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">
                                    No records were found for the selected criteria. Try adjusting the filters.
                                </p>
                            </div>
                        </div>
                    )}
                    {!isAnyLoading && !hasSummaryData && viewMode === 'summary' && searchType === 'cc' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full p-4">
                                    <Search className="h-10 w-10 text-gray-400" />
                                </div>
                                <p className="text-gray-900 dark:text-white font-semibold">No Monthly Summary Data</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No CC-wise summary available for the selected month.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty initial state */}
            {!isAnyLoading && !hasAnyData && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-full p-4">
                            <CalendarDays className="h-12 w-12 text-teal-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Attendance Data</h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md text-sm">
                            Select your search type, labour type, period, and {searchType === 'id' ? 'a labour ID' : 'a cost centre'}, then click "View Report".
                        </p>
                    </div>
                </div>
            )}

            {/* ── Info Note ── */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-teal-800 dark:text-teal-200">
                        <p className="font-semibold mb-1">Labour Attendance Report Guide</p>
                        <ul className="space-y-0.5 text-gray-700 dark:text-teal-200 list-disc list-inside">
                            <li><strong>Step 1</strong> — Choose Labour ID Wise (individual) or CC Code Wise (all labours at a cost centre)</li>
                            <li><strong>Step 2</strong> — Select Own Labour or Contractor; if Contractor, pick from the list</li>
                            <li><strong>Step 3</strong> — Pick Month, Year, then the specific Labour / Cost Centre</li>
                            <li><strong>CC Wise</strong> — toggle between "Day Detail" (day-by-day per labour) and "Monthly Summary" (CC-level aggregates)</li>
                            <li><strong>Status codes</strong> — P = Present, HD = Half Day, A = Absent, H = Holiday</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabourAttendanceReportPage;
