import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Users, Download, RotateCcw, Eye, Search,
    AlertTriangle, ChevronRight, Phone, HardHat,
    IdCard, ShieldCheck, UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    fetchLabourReport,
    setLabourType,
    resetLabourReport,
    clearLabourError,
    selectLabourList,
    selectLabourLoading,
    selectLabourError,
    selectLabourType,
} from '../../slices/HrReportSlice/labourReportSlice';

const LABOUR_TYPES = ['Own Labour', 'Contractor'];

const downloadAsCSV = (data, filename) => {
    if (!data.length) { toast.warning('No data to download'); return; }
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
        headers.map(h => {
            const v = row[h] ?? '';
            return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
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
    toast.success('Downloaded successfully');
};

const fmt = (dateStr) => dateStr ? dateStr.split(' ')[0] : '-';

const StatCard = ({ label, value, icon: Icon, gradient, iconGradient, border, textColor, subTextColor }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-5 border ${border} shadow-sm`}>
        <div className="flex items-center justify-between">
            <div>
                <p className={`text-xs font-semibold ${subTextColor} mb-1 uppercase tracking-wide`}>{label}</p>
                <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
            </div>
            <div className={`bg-gradient-to-br ${iconGradient} p-3 rounded-xl shadow-md`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </div>
);

const COLUMNS = [
    { key: '#',            label: '#' },
    { key: 'LabourId',     label: 'Labour ID' },
    { key: 'LabourName',   label: 'Name' },
    { key: 'Gender',       label: 'Gender' },
    { key: 'Age',          label: 'Age' },
    { key: 'DOB',          label: 'DOB' },
    { key: 'FatherName',   label: 'Father Name' },
    { key: 'Department',   label: 'Department' },
    { key: 'DesignationName', label: 'Designation' },
    { key: 'Category',     label: 'Category' },
    { key: 'CostCenterName', label: 'Cost Center' },
    { key: 'ContractorName', label: 'Contractor' },
    { key: 'ContactMobile', label: 'Mobile' },
    { key: 'JoiningDate',  label: 'Joining Date' },
    { key: 'DateofExit',   label: 'Date of Exit' },
    { key: 'UANNumber',    label: 'UAN Number' },
    { key: 'PFNumber',     label: 'PF Number' },
    { key: 'ESINumber',    label: 'ESI Number' },
    { key: 'BankName',     label: 'Bank Name' },
    { key: 'BankAccountNo', label: 'A/C Number' },
    { key: 'IFSCCode',     label: 'IFSC' },
    { key: 'BankBranch',   label: 'Branch' },
];

const Cell = ({ children, className = '' }) => (
    <td className={`px-4 py-3 text-sm whitespace-nowrap ${className}`}>{children}</td>
);

const Dash = () => <span className="text-gray-400">-</span>;

const LabourReportPage = () => {
    const dispatch = useDispatch();
    const labourList = useSelector(selectLabourList);
    const loading = useSelector(selectLabourLoading);
    const error = useSelector(selectLabourError);
    const labourType = useSelector(selectLabourType);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (error) {
            toast.error(`Error: ${error}`);
            dispatch(clearLabourError());
        }
    }, [error, dispatch]);

    const handleGenerate = async () => {
        try {
            await dispatch(fetchLabourReport(labourType)).unwrap();
            toast.success('Report generated successfully');
        } catch {
            toast.error('Failed to generate report');
        }
    };

    const handleReset = () => {
        dispatch(resetLabourReport());
        setSearchQuery('');
    };

    const rawData = Array.isArray(labourList?.Data) ? labourList.Data
        : Array.isArray(labourList) ? labourList : [];

    const filteredData = rawData.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
            item.LabourName?.toLowerCase().includes(q) ||
            item.LabourId?.toLowerCase().includes(q) ||
            item.DesignationName?.toLowerCase().includes(q) ||
            item.ContractorName?.toLowerCase().includes(q) ||
            item.Department?.toLowerCase().includes(q) ||
            item.FatherName?.toLowerCase().includes(q) ||
            item.UANNumber?.toLowerCase().includes(q) ||
            item.PFNumber?.toLowerCase().includes(q) ||
            item.ESINumber?.toLowerCase().includes(q) ||
            item.CostCenterName?.toLowerCase().includes(q) ||
            item.BankName?.toLowerCase().includes(q) ||
            item.BankAccountNo?.toLowerCase().includes(q) ||
            item.ContactMobile?.includes(q)
        );
    });

    const totalLabours = rawData.length;
    const activeLabours = rawData.filter(l => !l.DateofExit).length;
    const pfEnrolled  = rawData.filter(l => l.PFNumber).length;
    const esiEnrolled = rawData.filter(l => l.ESINumber).length;

    const handleExcelDownload = () => {
        const data = filteredData.map(item => ({
            'Labour ID':      item.LabourId         || '-',
            'Labour Name':    item.LabourName        || '-',
            'Labour Type':    item.LabourType        || '-',
            'Gender':         item.Gender            || '-',
            'Age':            item.Age               || '-',
            'DOB':            fmt(item.DOB),
            'Father Name':    item.FatherName        || '-',
            'Department':     item.Department        || '-',
            'Designation':    item.DesignationName   || '-',
            'Category':       item.Category          || '-',
            'Cost Center':    item.CostCenter        || '-',
            'Cost Center Name': item.CostCenterName  || '-',
            'Contractor':     item.ContractorName    || '-',
            'Mobile':         item.ContactMobile     || '-',
            'Joining Date':   fmt(item.JoiningDate),
            'Date of Exit':   fmt(item.DateofExit),
            'UAN Number':     item.UANNumber         || '-',
            'PF Number':      item.PFNumber          || '-',
            'ESI Number':     item.ESINumber         || '-',
            'Bank Name':      item.BankName          || '-',
            'Account No':     item.BankAccountNo     || '-',
            'IFSC Code':      item.IFSCCode          || '-',
            'Bank Branch':    item.BankBranch        || '-',
        }));
        downloadAsCSV(
            data,
            `Labour_Report_${labourType.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}`
        );
    };

    return (
        <div className="space-y-6 p-6">

            {/* ── Header ─────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <HardHat className="h-8 w-8 text-indigo-600" />
                            Labour Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            View labour details by type — Own Labour or Contractor
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full">
                            HR Reports
                        </span>
                        {loading && (
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <RotateCcw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading...</span>
                            </div>
                        )}
                    </div>
                </div>
                <nav className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>HR Reports</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 dark:text-white font-medium">Labour Report</span>
                </nav>
            </div>

            {/* ── Stat Cards ─────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Labours"
                    value={totalLabours}
                    icon={Users}
                    gradient="from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
                    iconGradient="from-blue-500 to-blue-700"
                    border="border-blue-200 dark:border-blue-700"
                    textColor="text-blue-900 dark:text-white"
                    subTextColor="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    label="Active Labours"
                    value={activeLabours}
                    icon={UserCheck}
                    gradient="from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20"
                    iconGradient="from-emerald-500 to-emerald-700"
                    border="border-emerald-200 dark:border-emerald-700"
                    textColor="text-emerald-900 dark:text-white"
                    subTextColor="text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                    label="PF Enrolled"
                    value={pfEnrolled}
                    icon={IdCard}
                    gradient="from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20"
                    iconGradient="from-indigo-500 to-indigo-700"
                    border="border-indigo-200 dark:border-indigo-700"
                    textColor="text-indigo-900 dark:text-white"
                    subTextColor="text-indigo-600 dark:text-indigo-400"
                />
                <StatCard
                    label="ESI Enrolled"
                    value={esiEnrolled}
                    icon={ShieldCheck}
                    gradient="from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20"
                    iconGradient="from-violet-500 to-purple-700"
                    border="border-violet-200 dark:border-violet-700"
                    textColor="text-violet-900 dark:text-white"
                    subTextColor="text-violet-600 dark:text-violet-400"
                />
            </div>

            {/* ── Filters & Actions ──────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                    {/* Labour Type Toggle */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Labour Type
                        </label>
                        <div className="flex rounded-lg border border-indigo-300 dark:border-indigo-600 overflow-hidden w-fit shadow-sm">
                            {LABOUR_TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => { dispatch(setLabourType(type)); handleReset(); }}
                                    className={`px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
                                        labourType === type
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-inner'
                                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by name, ID, UAN, bank, department, cost center..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading
                                ? <RotateCcw className="h-5 w-5 animate-spin" />
                                : <Eye className="h-5 w-5" />}
                            Generate Report
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Reset
                        </button>
                    </div>

                    <button
                        onClick={handleExcelDownload}
                        disabled={filteredData.length === 0}
                        className="px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Download className="h-5 w-5" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* ── Table ─────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
                                    {COLUMNS.map(col => (
                                        <th key={col.key} className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredData.map((item, idx) => (
                                    <tr
                                        key={item.LabourId || idx}
                                        className="hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
                                    >
                                        {/* # */}
                                        <Cell className="text-gray-400 dark:text-gray-500">{idx + 1}</Cell>

                                        {/* Labour ID */}
                                        <Cell className="font-semibold text-indigo-600 dark:text-indigo-400">
                                            {item.LabourId || <Dash />}
                                        </Cell>

                                        {/* Name */}
                                        <Cell className="font-medium text-gray-900 dark:text-white">
                                            {item.LabourName || <Dash />}
                                        </Cell>

                                        {/* Gender */}
                                        <Cell>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                item.Gender === 'Female'
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                                {item.Gender || '-'}
                                            </span>
                                        </Cell>

                                        {/* Age */}
                                        <Cell className="text-gray-700 dark:text-gray-300">
                                            {item.Age || <Dash />}
                                        </Cell>

                                        {/* DOB */}
                                        <Cell className="text-gray-700 dark:text-gray-300">
                                            {item.DOB ? fmt(item.DOB) : <Dash />}
                                        </Cell>

                                        {/* Father Name */}
                                        <Cell className="text-gray-700 dark:text-gray-300">
                                            {item.FatherName || <Dash />}
                                        </Cell>

                                        {/* Department */}
                                        <Cell className="text-gray-700 dark:text-gray-300">
                                            {item.Department || <Dash />}
                                        </Cell>

                                        {/* Designation */}
                                        <Cell className="text-gray-700 dark:text-gray-300">
                                            {item.DesignationName || <Dash />}
                                        </Cell>

                                        {/* Category */}
                                        <Cell className="text-gray-700 dark:text-gray-300">
                                            {item.Category || <Dash />}
                                        </Cell>

                                        {/* Cost Center */}
                                        <Cell className="text-gray-700 dark:text-gray-300">
                                            {item.CostCenterName
                                                ? <span title={item.CostCenter}>{item.CostCenterName}</span>
                                                : <Dash />}
                                        </Cell>

                                        {/* Contractor */}
                                        <Cell className="text-gray-700 dark:text-gray-300">
                                            {item.ContractorName || <Dash />}
                                        </Cell>

                                        {/* Mobile */}
                                        <Cell className="text-gray-700 dark:text-gray-300">
                                            {item.ContactMobile
                                                ? <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-indigo-400" />{item.ContactMobile}</span>
                                                : <Dash />}
                                        </Cell>

                                        {/* Joining Date */}
                                        <Cell className="text-gray-700 dark:text-gray-300">
                                            {item.JoiningDate ? fmt(item.JoiningDate) : <Dash />}
                                        </Cell>

                                        {/* Date of Exit */}
                                        <Cell>
                                            {item.DateofExit
                                                ? <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">{fmt(item.DateofExit)}</span>
                                                : <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Active</span>}
                                        </Cell>

                                        {/* UAN Number */}
                                        <Cell>
                                            {item.UANNumber
                                                ? <span className="text-xs font-mono bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">{item.UANNumber}</span>
                                                : <Dash />}
                                        </Cell>

                                        {/* PF Number */}
                                        <Cell>
                                            {item.PFNumber
                                                ? <span className="text-xs font-mono bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">{item.PFNumber}</span>
                                                : <Dash />}
                                        </Cell>

                                        {/* ESI Number */}
                                        <Cell>
                                            {item.ESINumber
                                                ? <span className="text-xs font-mono bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 px-2 py-1 rounded">{item.ESINumber}</span>
                                                : <Dash />}
                                        </Cell>

                                        {/* Bank Name */}
                                        <Cell className="text-gray-700 dark:text-gray-300">
                                            {item.BankName || <Dash />}
                                        </Cell>

                                        {/* Account No */}
                                        <Cell>
                                            {item.BankAccountNo
                                                ? <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{item.BankAccountNo}</span>
                                                : <Dash />}
                                        </Cell>

                                        {/* IFSC */}
                                        <Cell>
                                            {item.IFSCCode
                                                ? <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{item.IFSCCode}</span>
                                                : <Dash />}
                                        </Cell>

                                        {/* Branch */}
                                        <Cell className="text-gray-700 dark:text-gray-300">
                                            {item.BankBranch || <Dash />}
                                        </Cell>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-t border-gray-200 dark:border-gray-600 text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                            Showing {filteredData.length} of {rawData.length} records
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        {loading ? (
                            <div className="flex flex-col items-center">
                                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full p-5 mb-4">
                                    <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Labour Data</h3>
                                <p className="text-gray-500 dark:text-gray-400">Fetching records, please wait...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full p-5 mb-4">
                                    <Search className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Data Found</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Select a labour type and click <span className="font-semibold text-indigo-600 dark:text-indigo-400">"Generate Report"</span> to load data.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Error ─────────────────────────────────────── */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <span className="text-red-800 dark:text-red-200 text-sm">{error}</span>
                </div>
            )}
        </div>
    );
};

export default LabourReportPage;
