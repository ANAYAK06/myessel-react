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
    UserX,
    CalendarDays,
    TrendingDown,
    Printer,
    FileDown,
    Clock,
    Building2,
    Mail,
    Phone,
    Briefcase,
    MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchEmpExit,
    fetchReportEmpExitById,
    setFilters,
    clearFilters,
    resetEmpExitData,
    clearError,
    resetEmpExitDetails,
    clearEmpExitListData,
    selectEmpExitList,
    selectEmpExitDetails,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading
} from '../../slices/HrReportSlice/employeeExitReportSlice';

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

// Exit Type Badge Component
const ExitTypeBadge = ({ status }) => {
    const statusConfig = {
        'Approved': { color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
        'Rejected': { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
        'Pending': { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
        'Default': { color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' }
    };

    const config = statusConfig[status] || statusConfig['Default'];

    return (
        <span className={clsx(
            "px-3 py-1 rounded-full text-xs font-semibold",
            config.color
        )}>
            {status || 'N/A'}
        </span>
    );
};

// Summary Cards Component
const SummaryCards = ({ empExitList }) => {
    if (!empExitList || !Array.isArray(empExitList.Data) || empExitList.Data.length === 0) {
        return null;
    }

    const data = empExitList.Data;

    // Calculate summary statistics
    const summary = {
        totalExits: data.length,
        approved: data.filter(emp => emp.ApprovalStatus === 'Approved').length,
        rejected: data.filter(emp => emp.ApprovalStatus === 'Rejected').length,
        pending: data.filter(emp => emp.ApprovalStatus === 'Pending').length,
        avgNoticePeriod: data.length > 0 
            ? (data.reduce((sum, emp) => sum + (parseFloat(emp.NoticePereiodDays) || 0), 0) / data.length).toFixed(1)
            : 0
    };

    const cards = [
        {
            title: 'Total Exits',
            value: summary.totalExits,
            icon: UserX,
            color: 'from-red-500 to-rose-600',
            bgColor: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20'
        },
        {
            title: 'Approved',
            value: summary.approved,
            icon: Users,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Rejected',
            value: summary.rejected,
            icon: AlertTriangle,
            color: 'from-red-500 to-orange-600',
            bgColor: 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'
        },
        {
            title: 'Pending',
            value: summary.pending,
            icon: Clock,
            color: 'from-yellow-500 to-orange-600',
            bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
        },
        {
            title: 'Avg Notice Period',
            value: `${summary.avgNoticePeriod} days`,
            icon: Calendar,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
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

// Employee Exit Details Modal
const EmployeeExitDetailsModal = ({ isOpen, onClose, details }) => {
    if (!isOpen || !details) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <UserX className="h-7 w-7" />
                            Employee Exit Details
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    {/* Employee Basic Info */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-600 p-2 rounded-lg">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Employee Name</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {details.EmployeeName || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-600 p-2 rounded-lg">
                                        <FileSpreadsheet className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Employee ID</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {details.EmpRefNo || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-600 p-2 rounded-lg">
                                        <Briefcase className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Designation</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {details.DesignationName || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-600 p-2 rounded-lg">
                                        <Building2 className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {details.Department || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="bg-yellow-600 p-2 rounded-lg">
                                        <MapPin className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Cost Center</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {details.CCName || details.CostCenter || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="bg-red-600 p-2 rounded-lg">
                                        <UserX className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Approval Status</p>
                                        <div className="mt-1">
                                            <ExitTypeBadge status={details.ApprovalStatus} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exit Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Date of Joining</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {details.JoiningDate || 'N/A'}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Resignation Date</p>
                            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                {details.ResignationDate || 'N/A'}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Relieving Date</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {details.RelievingDate || 'N/A'}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Notice Period (Days)</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {details.NoticePereiodDays || 'N/A'}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Last Attendance Date</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {details.LastAttDate || 'N/A'}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Group Name</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {details.GroupName || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">State</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {details.State || 'N/A'}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Category</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {details.Category || 'N/A'}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Report To Role</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {details.ReportToRole || 'N/A'}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Created By</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {details.Createdby || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Remarks */}
                    {details.Remarks && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">Remarks</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {details.Remarks}
                            </p>
                        </div>
                    )}

                    {/* Additional Notes */}
                    {details.Note && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mt-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">Notes</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {details.Note}
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-b-xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
                    >
                        Close
                    </button>
                </div>
            </div>
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

const EmployeeExitReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const empExitList = useSelector(selectEmpExitList);
    const empExitDetails = useSelector(selectEmpExitDetails);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        fromDate: '',
        toDate: ''
    });

    // Modal state
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

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

            console.log('📊 Fetching employee exit data with params:', params);

            await dispatch(fetchEmpExit(params)).unwrap();

            toast.success('Employee exit report loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching employee exit report:', error);
            toast.error('Failed to fetch employee exit report. Please try again.');
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
        dispatch(resetEmpExitData());
    };

    // Handle view details
    const handleViewDetails = async (employee) => {
        try {
            console.log('👁️ Viewing details for employee:', employee);

            // Fetch detailed report using employee data
            const params = {
                empRefNo: employee.EmpRefNo,
                id: employee.Id,
                roleId: employee.RoleId || '0'
            };

            console.log('📋 Fetching employee exit details with params:', params);

            const result = await dispatch(fetchReportEmpExitById(params)).unwrap();

            setSelectedEmployee(result?.Data || result);
            setIsDetailsModalOpen(true);

        } catch (error) {
            console.error('❌ Error fetching employee exit details:', error);
            toast.error('Failed to fetch employee details. Please try again.');
        }
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            if (!empExitList?.Data || empExitList.Data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const data = empExitList.Data;
            const filename = `Employee_Exit_Report_${localFilters.fromDate}_to_${localFilters.toDate}`;

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
                            <UserX className="h-8 w-8 text-indigo-600" />
                            Employee Exit Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Track and manage employee exits, resignations, and terminations
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
                        <span className="text-gray-900 dark:text-white">Employee Exit Report</span>
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
                        <Tooltip content="Print employee exit report">
                            <button
                                onClick={handlePrint}
                                disabled={!empExitList?.Data || empExitList.Data.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Printer className="h-5 w-5" />
                                Print
                            </button>
                        </Tooltip>

                        {/* Excel Download Button */}
                        <Tooltip content="Download employee exit report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!empExitList?.Data || empExitList.Data.length === 0}
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
            <SummaryCards empExitList={empExitList} />

            {/* Employee Exit List Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {empExitList?.Data && Array.isArray(empExitList.Data) && empExitList.Data.length > 0 ? (
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
                                        Designation / Cost Center
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Resignation Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Relieving Date
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                        Notice Period
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {empExitList.Data.map((employee, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {employee.EmployeeName}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    ID: {employee.EmpRefNo}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {employee.DesignationName || 'N/A'}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {employee.CCName || employee.CostCenter || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-red-600 dark:text-red-400 font-semibold">
                                                {employee.ResignationDate || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {employee.RelievingDate || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                                {employee.NoticePereiodDays} {employee.NoticePereiodDays === 1 ? 'day' : 'days'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <ExitTypeBadge status={employee.ApprovalStatus} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Tooltip content="View employee exit details">
                                                <button
                                                    onClick={() => handleViewDetails(employee)}
                                                    className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </button>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer with count */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Showing {empExitList.Data.length} of {empExitList.Data.length} employee exits
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                    Exit Report: {localFilters.fromDate} to {localFilters.toDate}
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
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Employee Exit Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select a date range and click "View Report" to load employee exit data.
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
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Employee Exit Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching employee exit data for the selected date range...
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
                        <p className="font-semibold mb-1">Employee Exit Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Date Range Filter:</strong> Select from and to dates to view employee exits within that period<br />
                            2. <strong>Approval Status:</strong> Track Approved, Rejected, and Pending exit requests<br />
                            3. <strong>Summary Statistics:</strong> View total exits, approval status breakdown, and average notice period<br />
                            4. <strong>Detailed View:</strong> Click "View" button to see complete employee exit details including dates, remarks, and approval status<br />
                            5. <strong>Export Options:</strong> Download the report as Excel or print for records<br />
                            6. <strong>Comprehensive Data:</strong> Track resignation date, relieving date, notice period, and approval status
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

            {/* Employee Exit Details Modal */}
            <EmployeeExitDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedEmployee(null);
                }}
                details={selectedEmployee}
            />
        </div>
    );
};

export default EmployeeExitReportPage;