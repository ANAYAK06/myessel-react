import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import {
    FileSpreadsheet, Users, IndianRupee, TrendingDown,
    Search, Download, RefreshCw, X, ChevronRight,
    Loader2, AlertTriangle, Eye, Filter,
} from 'lucide-react';
import { toast } from 'react-toastify';

import {
    fetchLTAReport,
    fetchLTADetail,
    clearDetail,
    selectLTARecords,
    selectLTADetail,
    selectLTALoading,
    selectLTADetailLoading,
    selectLTAError,
} from '../../slices/HrReportSlice/ltaReportSlice';

const fmt = (v) =>
    parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_COLORS = {
    Running:   'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    Closed:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    PreClosed: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    Approved:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
};

const statusBadge = (status) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
        {status || '—'}
    </span>
);

const DetailModal = ({ detail, loading, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-t-2xl">
                <div>
                    <h2 className="text-xl font-bold text-white">LTA Transaction Detail</h2>
                    {detail && (
                        <p className="text-teal-100 text-sm mt-0.5">
                            {detail.TransactionRefNo} · {detail.EmployeeName || detail.EmployeName}
                        </p>
                    )}
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-white" />
                </button>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center gap-3 py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                        <span className="text-gray-600 dark:text-gray-400">Loading details…</span>
                    </div>
                ) : !detail ? (
                    <p className="text-center text-gray-500 py-10">No detail available.</p>
                ) : (
                    <div className="space-y-5">
                        {/* Employee & CC */}
                        <Section title="Employee Information">
                            <Row label="Employee ID" value={detail.EmployeeID} />
                            <Row label="Employee Name" value={detail.EmployeName} />
                            <Row label="CC Code" value={detail.CCCode} />
                            <Row label="CC Name" value={detail.CCName} />
                            <Row label="DCA" value={detail.DCAName} />
                            <Row label="Sub DCA" value={detail.SubDCAName} />
                        </Section>

                        {/* Advance Info */}
                        <Section title="Advance Information">
                            <Row label="Advance Type" value={detail.AdvanceType} />
                            <Row label="LTA Amount" value={`₹${fmt(detail.LTAAmount)}`} highlight />
                            <Row label="LTA Balance" value={`₹${fmt(detail.LTABalance)}`} />
                            <Row label="EMI Amount" value={`₹${fmt(detail.EMIAmount)}`} />
                            <Row label="No. of Installments" value={detail.NoOfInstallments} />
                            <Row label="Balance Installments" value={detail.NoOfBalanceInstallments} />
                        </Section>

                        {/* Status & Dates */}
                        <Section title="Status & Dates">
                            <Row label="Loan Status" value={statusBadge(detail.LoanStatus)} />
                            <Row label="Request Status" value={statusBadge(detail.RequestStatus)} />
                            <Row label="Report Final Status" value={detail.ReportFinalStatus} />
                            <Row label="Requested Date" value={detail.RequestedDate} />
                            <Row label="Payment Request Date" value={detail.PaymentRequestDate} />
                            <Row label="Disbursement Date" value={detail.DisbursementDate} />
                        </Section>

                        {/* Remarks */}
                        {(detail.EmpRemarks || detail.ReportingMgrRemarks) && (
                            <Section title="Remarks">
                                {detail.EmpRemarks && <Row label="Employee Remarks" value={detail.EmpRemarks} />}
                                {detail.ReportingMgrRemarks && <Row label="Manager Remarks" value={detail.ReportingMgrRemarks} />}
                            </Section>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
);

const Section = ({ title, children }) => (
    <div>
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl divide-y divide-gray-200 dark:divide-gray-600">
            {children}
        </div>
    </div>
);

const Row = ({ label, value, highlight }) => (
    <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`text-sm font-medium ${highlight ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-gray-900 dark:text-white'}`}>
            {value ?? '—'}
        </span>
    </div>
);

const LTAReportPage = () => {
    const dispatch = useDispatch();

    const records       = useSelector(selectLTARecords);
    const detail        = useSelector(selectLTADetail);
    const loading       = useSelector(selectLTALoading);
    const detailLoading = useSelector(selectLTADetailLoading);
    const error         = useSelector(selectLTAError);

    const [search, setSearch]             = useState('');
    const [filterType, setFilterType]     = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showModal, setShowModal]       = useState(false);

    useEffect(() => {
        dispatch(fetchLTAReport());
    }, [dispatch]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const advanceTypes  = useMemo(() => ['All', ...[...new Set(records.map(r => r.AdvanceType).filter(Boolean))]], [records]);
    const loanStatuses  = useMemo(() => ['All', ...[...new Set(records.map(r => r.LoanStatus).filter(Boolean))]], [records]);

    const filtered = useMemo(() => records.filter(r => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            (r.EmployeeID || '').toLowerCase().includes(q) ||
            (r.EmployeName || '').toLowerCase().includes(q) ||
            (r.TransactionRefNo || '').toLowerCase().includes(q) ||
            (r.CCCode || '').toLowerCase().includes(q);
        const matchType   = filterType   === 'All' || r.AdvanceType === filterType;
        const matchStatus = filterStatus === 'All' || r.LoanStatus  === filterStatus;
        return matchSearch && matchType && matchStatus;
    }), [records, search, filterType, filterStatus]);

    const totals = useMemo(() => ({
        amount:  filtered.reduce((s, r) => s + parseFloat(r.LTAAmount  || 0), 0),
        balance: filtered.reduce((s, r) => s + parseFloat(r.LTABalance || 0), 0),
    }), [filtered]);

    const handleView = (transNo) => {
        dispatch(fetchLTADetail(transNo));
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        dispatch(clearDetail());
    };

    const handleExport = () => {
        if (!filtered.length) { toast.warning('No data to export'); return; }
        const rows = filtered.map(r => ({
            'Employee ID':       r.EmployeeID,
            'Employee Name':     r.EmployeName,
            'CC Code':           r.CCCode,
            'CC Name':           r.CCName,
            'Advance Type':      r.AdvanceType,
            'Transaction Ref No': r.TransactionRefNo,
            'LTA Amount':        r.LTAAmount,
            'LTA Balance':       r.LTABalance,
            'Loan Status':       r.LoanStatus,
            'Request Status':    r.RequestStatus,
            'Disbursement Date': r.DisbursementDate,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'LTA Report');
        XLSX.writeFile(wb, `LTA_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
        toast.success('Excel downloaded');
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
                                <FileSpreadsheet className="h-6 w-6 text-white" />
                            </div>
                            LTA Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Long Term Advance given to Staff
                        </p>
                        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                            <span>HR Reports</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-gray-700 dark:text-gray-200">LTA Report</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => dispatch(fetchLTAReport())}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { icon: Users,        label: 'Total Records',    value: filtered.length,                 color: 'from-teal-500 to-cyan-600',    bg: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20' },
                    { icon: IndianRupee,  label: 'Total LTA Amount', value: `₹${fmt(totals.amount)}`,        color: 'from-blue-500 to-indigo-600',   bg: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' },
                    { icon: TrendingDown, label: 'Total Balance',     value: `₹${fmt(totals.balance)}`,       color: 'from-amber-500 to-orange-600',  bg: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' },
                ].map((c, i) => (
                    <div key={i} className={`bg-gradient-to-r ${c.bg} rounded-xl p-5 border border-gray-200 dark:border-gray-700`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{c.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</p>
                            </div>
                            <div className={`p-3 bg-gradient-to-br ${c.color} rounded-xl`}>
                                <c.icon className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-4 w-4 text-teal-600" />
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search employee, ID, trans no…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                    >
                        {advanceTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'All Advance Types' : t}</option>)}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                    >
                        {loanStatuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Loan Statuses' : s}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center gap-3 py-16">
                        <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
                        <span className="text-gray-500 dark:text-gray-400">Loading LTA records…</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center gap-3 py-16 text-red-500">
                        <AlertTriangle className="h-6 w-6" />
                        <span>{error}</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <FileSpreadsheet className="h-12 w-12 mb-3 opacity-40" />
                        <p className="font-medium">No LTA records found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gradient-to-r from-teal-600 to-cyan-600">
                                    <tr>
                                        {['#', 'Employee', 'CC', 'Advance Type', 'Trans Ref No', 'LTA Amount', 'Balance', 'Loan Status', 'Request Status', 'Action'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filtered.map((r, i) => (
                                        <tr key={r.LTAId ?? i} className="hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-medium">{i + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-sm text-gray-900 dark:text-white">{r.EmployeName}</div>
                                                <div className="text-xs text-teal-600 dark:text-teal-400">{r.EmployeeID}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{r.CCCode}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[160px] truncate">{r.CCName}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                                    {r.AdvanceType || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-mono text-gray-700 dark:text-gray-300">{r.TransactionRefNo}</td>
                                            <td className="px-4 py-3 text-sm font-bold text-right text-teal-700 dark:text-teal-400">
                                                ₹{fmt(r.LTAAmount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-amber-700 dark:text-amber-400 font-semibold">
                                                ₹{fmt(r.LTABalance)}
                                            </td>
                                            <td className="px-4 py-3">{statusBadge(r.LoanStatus)}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                    {r.RequestStatus || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleView(r.TransactionRefNo)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Table footer */}
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                Showing {filtered.length} of {records.length} records
                            </span>
                            <div className="flex gap-6">
                                <span className="text-teal-700 dark:text-teal-300 font-semibold">
                                    Total: ₹{fmt(totals.amount)}
                                </span>
                                <span className="text-amber-700 dark:text-amber-300 font-semibold">
                                    Balance: ₹{fmt(totals.balance)}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {showModal && (
                <DetailModal
                    detail={detail}
                    loading={detailLoading}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default LTAReportPage;
