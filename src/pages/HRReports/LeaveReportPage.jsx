import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import {
    Users,
    Calendar,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    RefreshCw,
    ChevronRight,
    CalendarDays,
    TrendingUp,
    Printer,
    FileDown,
    Clock,
    Building2,
    CheckCircle,
    XCircle,
    HourglassIcon
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchLeaveReportGrid,
    setFilters,
    clearFilters,
    resetLeaveReportData,
    clearError,
    selectLeaveReportGrid,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading
} from '../../slices/HrReportSlice/leaveReportSlice';

// Import CustomDatePicker
import CustomDatePicker from '../../components/CustomDatePicker';

// Utility functions for date handling
const formatDateForAPI = (date) => {
    if (!date) return '';
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
};

const formatDateForDisplay = (date) => {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'string') {
        const d = new Date(date);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
};

const convertDateToString = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    if (date instanceof Date) {
        return formatDateForAPI(date);
    }
    return '';
};

// Tooltip Component
const Tooltip = ({ children, content }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {children}
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg whitespace-nowrap z-50">
                    {content}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
            )}
        </div>
    );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        'Approved': { 
            color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            icon: CheckCircle
        },
        'Rejected': { 
            color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
            icon: XCircle
        },
        'Pending': { 
            color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
            icon: HourglassIcon
        },
        'Default': { 
            color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
            icon: Clock
        }
    };

    const config = statusConfig[status] || statusConfig['Default'];
    const IconComponent = config.icon;

    return (
        <span className={clsx(
            "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1",
            config.color
        )}>
            <IconComponent className="h-3 w-3" />
            {status || 'N/A'}
        </span>
    );
};

// Summary Cards Component
const SummaryCards = ({ leaveReportGrid }) => {
    if (!leaveReportGrid || !Array.isArray(leaveReportGrid.Data) || leaveReportGrid.Data.length === 0) {
        return null;
    }

    const data = leaveReportGrid.Data;

    // Calculate summary statistics
    const summary = {
        totalLeaves: data.length,
        approved: data.filter(leave => leave.Status === 'Approved').length,
        rejected: data.filter(leave => leave.Status === 'Rejected').length,
        pending: data.filter(leave => leave.Status === 'Pending').length,
        totalDays: data.reduce((sum, leave) => sum + (parseFloat(leave.Noofleaves) || 0), 0)
    };

    const cards = [
        {
            title: 'Total Leave Records',
            value: summary.totalLeaves,
            icon: FileSpreadsheet,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        },
        {
            title: 'Approved',
            value: summary.approved,
            icon: CheckCircle,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Rejected',
            value: summary.rejected,
            icon: XCircle,
            color: 'from-red-500 to-rose-600',
            bgColor: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20'
        },
        {
            title: 'Pending',
            value: summary.pending,
            icon: HourglassIcon,
            color: 'from-yellow-500 to-orange-600',
            bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
        },
        {
            title: 'Total Leave Days',
            value: summary.totalDays.toFixed(1),
            icon: Calendar,
            color: 'from-cyan-500 to-blue-600',
            bgColor: 'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {cards.map((card, index) => (
                <div key={index} className={`bg-gradient-to-r ${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                {card.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {card.value}
                            </p>
                        </div>
                        <div className={`bg-gradient-to-r ${card.color} p-3 rounded-lg`}>
                            <card.icon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Helper function to download data as Excel
const downloadAsExcel = (data, filename) => {
    try {
        const csvContent = convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading Excel:', error);
        toast.error('Error downloading Excel file');
    }
};

const convertToCSV = (data) => {
    if (!Array.isArray(data) || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(',')
        )
    ].join('\n');

    return csvContent;
};

// Print function
const handlePrint = () => {
    window.print();
};

const LeaveReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const leaveReportGrid = useSelector(selectLeaveReportGrid);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        fromDate: '',
        toDate: ''
    });

    // Set default dates to current month
    useEffect(() => {
        const currentDate = new Date();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setLocalFilters({
            fromDate: formatDate(firstDay),
            toDate: formatDate(lastDay)
        });
    }, []);

    // Sync local filters with Redux filters
    useEffect(() => {
        if (filters.fromDate || filters.toDate) {
            setLocalFilters({
                fromDate: filters.fromDate,
                toDate: filters.toDate
            });
        }
    }, [filters]);

    // Show error messages via toast
    useEffect(() => {
        Object.entries(errors).forEach(([key, error]) => {
            if (error && error !== null) {
                toast.error(`Error with ${key}: ${error}`);
                dispatch(clearError({ errorType: key }));
            }
        });
    }, [errors, dispatch]);

    // Handle date changes
    const handleDateChange = (filterName, dateValue) => {
        const dateString = convertDateToString(dateValue);
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: dateString
        }));
    };

    // Handle view button click
    const handleView = async () => {
        // Validation
        if (!localFilters.fromDate) {
            toast.warning('Please select From Date');
            return;
        }

        if (!localFilters.toDate) {
            toast.warning('Please select To Date');
            return;
        }

        // Validate date range
        const fromDate = new Date(localFilters.fromDate);
        const toDate = new Date(localFilters.toDate);

        if (fromDate > toDate) {
            toast.warning('From Date cannot be greater than To Date');
            return;
        }

        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));

            // Prepare parameters for API call
            const params = {
                fromDate: localFilters.fromDate,
                toDate: localFilters.toDate
            };

            console.log('📅 Fetching leave report data with params:', params);

            await dispatch(fetchLeaveReportGrid(params)).unwrap();

            toast.success('Leave report loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching leave report:', error);
            toast.error('Failed to fetch leave report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        const currentDate = new Date();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setLocalFilters({
            fromDate: formatDate(firstDay),
            toDate: formatDate(lastDay)
        });

        dispatch(clearFilters());
        dispatch(resetLeaveReportData());
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            if (!leaveReportGrid?.Data || leaveReportGrid.Data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const data = leaveReportGrid.Data;
            const filename = `Leave_Report_${localFilters.fromDate}_to_${localFilters.toDate}`;

            downloadAsExcel(data, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <CalendarDays className="h-8 w-8 text-indigo-600" />
                            Leave Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Track and manage employee leave records and balances
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            HR Reports
                        </div>
                        {isAnyLoading && (
                            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                        <span>Dashboard</span>
                        <ChevronRight className="w-4 h-4" />
                        <span>HR Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Leave Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {/* From Date */}
                    <div>
                        <CustomDatePicker
                            label="From Date"
                            placeholder="Select from date"
                            value={formatDateForDisplay(localFilters.fromDate)}
                            onChange={(date) => handleDateChange('fromDate', date)}
                            maxDate={formatDateForDisplay(localFilters.toDate) || new Date()}
                            size="md"
                            required
                        />
                    </div>

                    {/* To Date */}
                    <div>
                        <CustomDatePicker
                            label="To Date"
                            placeholder="Select to date"
                            value={formatDateForDisplay(localFilters.toDate)}
                            onChange={(date) => handleDateChange('toDate', date)}
                            minDate={formatDateForDisplay(localFilters.fromDate)}
                            maxDate={new Date()}
                            size="md"
                            required
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isAnyLoading || !localFilters.fromDate || !localFilters.toDate}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {isAnyLoading ? (
                                <RotateCcw className="h-5 w-5 animate-spin" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                            View Report
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Reset
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Export:</span>

                        {/* Print Button */}
                        <Tooltip content="Print leave report">
                            <button
                                onClick={handlePrint}
                                disabled={!leaveReportGrid?.Data || leaveReportGrid.Data.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Printer className="h-5 w-5" />
                                Print
                            </button>
                        </Tooltip>

                        {/* Excel Download Button */}
                        <Tooltip content="Download leave report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!leaveReportGrid?.Data || leaveReportGrid.Data.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <FileDown className="h-5 w-5" />
                                Export Excel
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <SummaryCards leaveReportGrid={leaveReportGrid} />

            {/* Leave Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {leaveReportGrid?.Data && Array.isArray(leaveReportGrid.Data) && leaveReportGrid.Data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Employee Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Leave Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        From Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        To Date
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                        No. of Leaves
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                        Balance Leaves
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Transaction Ref
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {leaveReportGrid.Data.map((leave, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {leave.EmployeeName}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    ID: {leave.Emprefno}
                                                </div>
                                                <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                                    CC: {leave.cccode}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                {leave.LeaveType || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {leave.FromDate || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {leave.ToDate || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                {leave.Noofleaves ? parseFloat(leave.Noofleaves).toFixed(1) : '0.0'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {leave.Balanceleaves ? parseFloat(leave.Balanceleaves).toFixed(2) : '0.00'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <StatusBadge status={leave.Status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                                {leave.TransactionRefNo || 'N/A'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer with count */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Showing {leaveReportGrid.Data.length} of {leaveReportGrid.Data.length} leave records
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                    Leave Report: {localFilters.fromDate} to {localFilters.toDate}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Empty State */}
                        {!isAnyLoading && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Leave Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select a date range and click "View Report" to load leave records.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {isAnyLoading && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Leave Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching leave data for the selected date range...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Leave Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Date Range Filter:</strong> Select from and to dates to view leave records within that period<br />
                            2. <strong>Leave Types:</strong> Track different types of leaves including Earned Leave, Sick Leave, etc.<br />
                            3. <strong>Status Tracking:</strong> View Approved, Rejected, and Pending leave requests<br />
                            4. <strong>Balance Information:</strong> See current leave balance and balance after approval<br />
                            5. <strong>Summary Statistics:</strong> View total leave records, approval status breakdown, and total leave days<br />
                            6. <strong>Export Options:</strong> Download the report as Excel or print for records<br />
                            7. <strong>Transaction Tracking:</strong> Each leave record has a unique transaction reference number
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {Object.values(errors).some(error => error) && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                        <span className="text-red-800 dark:text-red-200 text-sm">
                            {Object.values(errors).find(error => error)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveReportPage;