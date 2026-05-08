import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Users, Download, RotateCcw, Eye, Search,
    AlertTriangle, ChevronRight, Phone, HardHat,
    IdCard, ShieldCheck, PhoneCall
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
            item.Department?.toLowerCase().includes(q)
        );
    });

    const totalLabours = rawData.length;
    const pfEnrolled  = rawData.filter(l => l.PFNumber).length;
    const esiEnrolled = rawData.filter(l => l.ESINumber).length;
    const withContact = rawData.filter(l => l.ContactMobile).length;

    const handleExcelDownload = () => {
        const data = filteredData.map(item => ({
            'Labour ID':    item.LabourId       || '-',
            'Labour Name':  item.LabourName      || '-',
            'Labour Type':  item.LabourType      || '-',
            'Gender':       item.Gender          || '-',
            'Designation':  item.DesignationName || '-',
            'Contractor':   item.ContractorName  || '-',
            'Department':   item.Department      || '-',
            'Mobile':       item.ContactMobile   || '-',
            'Joining Date': item.JoiningDate ? item.JoiningDate.split(' ')[0] : '-',
            'PF Number':    item.PFNumber        || '-',
            'ESI Number':   item.ESINumber       || '-',
        }));
        downloadAsCSV(
            data,
            `Labour_Report_${labourType.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}`
        );
    };

    return (
        <div className="space-y-6 p-6">

            {/* ── Header ────────────────────────────────────────────── */}
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

            {/* ── Stat Cards ────────────────────────────────────────── */}
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
                <StatCard
                    label="With Contact"
                    value={withContact}
                    icon={PhoneCall}
                    gradient="from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
                    iconGradient="from-purple-500 to-purple-700"
                    border="border-purple-200 dark:border-purple-700"
                    textColor="text-purple-900 dark:text-white"
                    subTextColor="text-purple-600 dark:text-purple-400"
                />
            </div>

            {/* ── Filters & Actions ─────────────────────────────────── */}
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
                                placeholder="Search by name, ID, designation, department..."
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
                        Export Excel
                    </button>
                </div>
            </div>

            {/* ── Table ─────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
                                    {[
                                        '#', 'Labour ID', 'Name', 'Gender', 'Designation',
                                        labourType === 'Contractor' ? 'Contractor' : 'Department',
                                        'Mobile', 'Joining Date', 'PF Number', 'ESI Number'
                                    ].map(col => (
                                        <th key={col} className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                                            {col}
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
                                        <td className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                            {item.LabourId || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            {item.LabourName || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                item.Gender === 'Female'
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                                {item.Gender || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                            {item.DesignationName || <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                            {labourType === 'Contractor'
                                                ? (item.ContractorName || <span className="text-gray-400">-</span>)
                                                : (item.Department || <span className="text-gray-400">-</span>)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                            {item.ContactMobile ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3 text-indigo-400" />
                                                    {item.ContactMobile}
                                                </span>
                                            ) : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                            {item.JoiningDate ? item.JoiningDate.split(' ')[0] : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {item.PFNumber
                                                ? <span className="text-xs font-mono bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">{item.PFNumber}</span>
                                                : <span className="text-gray-400 text-sm">-</span>}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {item.ESINumber
                                                ? <span className="text-xs font-mono bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 px-2 py-1 rounded">{item.ESINumber}</span>
                                                : <span className="text-gray-400 text-sm">-</span>}
                                        </td>
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

            {/* ── Error ─────────────────────────────────────────────── */}
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
