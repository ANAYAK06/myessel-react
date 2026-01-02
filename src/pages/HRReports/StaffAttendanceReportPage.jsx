import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import {
    Users,
    Building2,
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
    Activity,
    UserCheck,
    CalendarDays,
    TrendingUp,
    Printer,
    FileDown
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchAttendanceCCByMonth,
    fetchAttendanceData,
    fetchEmployeesForAttendanceReport,
    setFilters,
    clearFilters,
    setReportType,
    resetAttendanceData,
    clearError,
    resetSelectedData,
    clearCostCentresData,
    selectAttendanceCostCentres,
    selectAttendanceData,
    selectAttendanceEmployees,
    selectLoading,
    selectErrors,
    selectFilters,
    selectReportType,
    selectIsAnyLoading,
    selectIsCostCentreReportType,
    selectIsEmployeeReportType
} from '../../slices/HrReportSlice/staffAttendanceReportSlice';

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

// Attendance Status Badge Component
const AttendanceStatusBadge = ({ status }) => {
    const statusConfig = {
        'P': { label: 'P', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', fullLabel: 'Present' },
        'A': { label: 'A', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', fullLabel: 'Absent' },
        'PL': { label: 'PL', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', fullLabel: 'Paid Leave' },
        'HD': { label: 'HD', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300', fullLabel: 'Half Day' },
        'H': { label: 'H', color: 'bg-orange-200 dark:bg-orange-800/30 text-orange-800 dark:text-orange-200', fullLabel: 'Holiday' },
        'S': { label: 'S', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', fullLabel: 'Sunday/Holiday' },
        'L': { label: 'L', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300', fullLabel: 'Leave' },
        'WO': { label: 'WO', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', fullLabel: 'Week Off' },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', fullLabel: status };

    return (
        <Tooltip content={config.fullLabel}>
            <div className={clsx(
                "flex items-center justify-center w-10 h-10 rounded-lg font-bold text-xs",
                config.color
            )}>
                {config.label}
            </div>
        </Tooltip>
    );
};

// Summary Cards Component
const SummaryCards = ({ attendanceData }) => {
    if (!attendanceData || !Array.isArray(attendanceData.Data) || attendanceData.Data.length === 0) {
        return null;
    }

    // Calculate attendance summary from all employees
    const summary = attendanceData.Data.reduce((acc, employee) => {
        // Count different attendance types from day columns (Mon#1 to Wed#31)
        Object.keys(employee).forEach(key => {
            if (key.includes('#')) {
                const status = employee[key];
                if (status === 'P') acc.totalPresent += 1;
                else if (status === 'HD') acc.halfDays += 0.5;
                else if (status === 'A') acc.absent += 1;
                else if (status === 'PL' || status === 'L') acc.onLeave += 1;
            }
        });
        
        // Add employee present days
        acc.totalPresentDays += parseFloat(employee.TotalPresentDays || 0);
        
        return acc;
    }, {
        totalPresent: 0,
        halfDays: 0,
        absent: 0,
        onLeave: 0,
        totalPresentDays: 0
    });

    const totalEmployees = attendanceData.Data.length;
    const totalMonthDays = attendanceData.Data[0]?.TotalMonthDays || 31;
    const totalPossibleDays = totalEmployees * totalMonthDays;
    const avgAttendance = totalPossibleDays > 0 
        ? ((summary.totalPresentDays / totalPossibleDays) * 100).toFixed(2) 
        : 0;

    const cards = [
        {
            title: 'Total Present',
            value: Math.round(summary.totalPresent),
            icon: UserCheck,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Half Days',
            value: Math.round(summary.halfDays),
            icon: Activity,
            color: 'from-yellow-500 to-orange-600',
            bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
        },
        {
            title: 'Absent',
            value: Math.round(summary.absent),
            icon: AlertTriangle,
            color: 'from-red-500 to-rose-600',
            bgColor: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20'
        },
        {
            title: 'On Leave',
            value: Math.round(summary.onLeave),
            icon: Calendar,
            color: 'from-cyan-500 to-blue-600',
            bgColor: 'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20'
        },
        {
            title: 'Avg. Attendance',
            value: `${avgAttendance}%`,
            icon: TrendingUp,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
            isPercentage: true
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

// Legend Component
const AttendanceLegend = () => {
    const legendItems = [
        { status: 'P', label: 'Present', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
        { status: 'HD', label: 'Half Day', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
        { status: 'A', label: 'Absent', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
        { status: 'S', label: 'Sunday/Holiday', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
        { status: 'WO', label: 'Week Off', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
        { status: 'L', label: 'Leave', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' },
        { status: 'PL', label: 'Paid Leave', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
        { status: 'H', label: 'Holiday', color: 'bg-orange-200 dark:bg-orange-800/30 text-orange-800 dark:text-orange-200' }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                            item.color
                        )}>
                            {item.status}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                    </div>
                ))}
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

// Generate years array (current year and previous 5 years)
const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 6; i++) {
        years.push(currentYear - i);
    }
    return years;
};

// Generate months array with names
const generateMonths = () => {
    return [
        { value: 'January', label: 'January' },
        { value: 'February', label: 'February' },
        { value: 'March', label: 'March' },
        { value: 'April', label: 'April' },
        { value: 'May', label: 'May' },
        { value: 'June', label: 'June' },
        { value: 'July', label: 'July' },
        { value: 'August', label: 'August' },
        { value: 'September', label: 'September' },
        { value: 'October', label: 'October' },
        { value: 'November', label: 'November' },
        { value: 'December', label: 'December' }
    ];
};

// Helper function to convert month name to number
const getMonthNumber = (monthName) => {
    const months = {
        'January': '1',
        'February': '2',
        'March': '3',
        'April': '4',
        'May': '5',
        'June': '6',
        'July': '7',
        'August': '8',
        'September': '9',
        'October': '10',
        'November': '11',
        'December': '12'
    };
    return months[monthName] || '';
};

const StaffAttendanceReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const attendanceCostCentres = useSelector(selectAttendanceCostCentres);
    const attendanceData = useSelector(selectAttendanceData);
    const attendanceEmployees = useSelector(selectAttendanceEmployees);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const reportType = useSelector(selectReportType);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const isCostCentreReport = useSelector(selectIsCostCentreReportType);
    const isEmployeeReport = useSelector(selectIsEmployeeReportType);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        selectedMonth: '',
        selectedYear: '',
        typeValue: '',
        prefix: '',
        prefixType: 'ID' // ID or CC
    });

    // Employee search state
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    // Report type options
    const reportTypeOptions = [
        { value: 'employee', label: 'Employee ID Wise', icon: Users },
        { value: 'costcentre', label: 'Cost Centre Wise', icon: Building2 }
    ];

    // Load initial data
    useEffect(() => {
        // Set default year and month to current
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = monthNames[currentDate.getMonth()];
        
        setLocalFilters(prev => ({
            ...prev,
            selectedYear: currentYear.toString(),
            selectedMonth: currentMonth
        }));
    }, []);

    // Fetch cost centres when year and month are selected for costcentre report
    useEffect(() => {
        const shouldFetchCostCentres =
            reportType === 'costcentre' &&
            localFilters.selectedYear &&
            localFilters.selectedYear !== '' &&
            localFilters.selectedMonth &&
            localFilters.selectedMonth !== '';

        console.log('🔍 Cost Centre Fetch Check:', {
            year: localFilters.selectedYear,
            month: localFilters.selectedMonth,
            shouldFetch: shouldFetchCostCentres,
            reportType
        });

        if (shouldFetchCostCentres) {
            // Convert month name to number for GetAttendanceCCByMonth API
            const monthNumber = getMonthNumber(localFilters.selectedMonth);
            
            const params = {
                month: monthNumber,  // API expects number (1, 2, 3...)
                year: localFilters.selectedYear
            };

            console.log('🚀 Fetching cost centres with params:', params);
            console.log('📅 Month Conversion:', {
                monthName: localFilters.selectedMonth,
                monthNumber: monthNumber
            });
            
            dispatch(fetchAttendanceCCByMonth(params));
        }
    }, [localFilters.selectedYear, localFilters.selectedMonth, reportType, dispatch]);

    // Handle employee search - fetch employee suggestions as user types
    useEffect(() => {
        if (employeeSearchTerm.length >= 2 && reportType === 'employee') {
            // Extract prefix from search term (e.g., "MS00001" -> "MS")
            const prefix = employeeSearchTerm.replace(/[0-9]/g, '');
            
            if (prefix.length > 0) {
                const params = {
                    prefix: prefix,
                    prefixType: 'ID'
                };
                
                console.log('🔍 Searching employees with params:', params);
                dispatch(fetchEmployeesForAttendanceReport(params));
            }
        }
    }, [employeeSearchTerm, reportType, dispatch]);

    // Filter employees based on search term
    useEffect(() => {
        if (attendanceEmployees?.Data && Array.isArray(attendanceEmployees.Data)) {
            const filtered = attendanceEmployees.Data.filter(emp =>
                emp.RefNo?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                emp.EmpName?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
            );
            setFilteredEmployees(filtered);
        }
    }, [attendanceEmployees, employeeSearchTerm]);

    // Sync local filters with Redux filters
    useEffect(() => {
        setLocalFilters(filters);
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

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        console.log('🔄 Filter Change:', { filterName, value });

        setLocalFilters(prev => ({
            ...prev,
            [filterName]: value
        }));

        // Reset dependent data when key filters change
        if (filterName === 'selectedYear' || filterName === 'selectedMonth') {
            setLocalFilters(prev => ({
                ...prev,
                typeValue: ''
            }));
            dispatch(resetSelectedData());
        }
    };

    // Handle report type change
    const handleReportTypeChange = (newReportType) => {
        dispatch(setReportType(newReportType));
        setLocalFilters({
            selectedMonth: localFilters.selectedMonth,
            selectedYear: localFilters.selectedYear,
            typeValue: '',
            prefix: '',
            prefixType: newReportType === 'employee' ? 'ID' : 'CC'
        });
        setEmployeeSearchTerm('');
        dispatch(resetAttendanceData());
    };

    // Handle employee selection from dropdown
    const handleEmployeeSelect = (employee) => {
        setEmployeeSearchTerm(employee.EmpName);
        setLocalFilters(prev => ({
            ...prev,
            typeValue: employee.RefNo,
            prefix: employee.RefNo.replace(/[0-9]/g, ''),
            prefixType: 'ID'
        }));
        setShowEmployeeDropdown(false);
    };

    // Handle view button click
    const handleView = async () => {
        // Validation based on report type
        if (!localFilters.selectedYear) {
            toast.warning('Please select a year');
            return;
        }

        if (!localFilters.selectedMonth) {
            toast.warning('Please select a month');
            return;
        }

        if (reportType === 'employee') {
            if (!localFilters.typeValue) {
                toast.warning('Please search and select an employee');
                return;
            }
        }

        if (reportType === 'costcentre') {
            if (!localFilters.typeValue) {
                toast.warning('Please select a cost centre');
                return;
            }
        }

        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));

            // Prepare parameters for API call - Backend expects specific format
            // ReportType should be 'ID' or 'CCCode' (not 'CC')
            const apiReportType = reportType === 'employee' ? 'ID' : 'CCCode';
            
            const params = {
                typeValue: localFilters.typeValue.toString().trim(),
                month: localFilters.selectedMonth.toString().trim(),
                year: localFilters.selectedYear.toString().trim(),
                reportType: apiReportType
            };

            console.log('📊 Fetching attendance data with params:', params);
            console.log('🔍 Report Type Mapping:', {
                frontendReportType: reportType,
                apiReportType: apiReportType,
                typeValue: params.typeValue
            });
            
            await dispatch(fetchAttendanceData(params)).unwrap();

            toast.success('Attendance report loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching attendance report:', error);
            toast.error('Failed to fetch attendance report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = monthNames[currentDate.getMonth()];
        
        setLocalFilters({
            selectedMonth: currentMonth,
            selectedYear: currentYear.toString(),
            typeValue: '',
            prefix: '',
            prefixType: reportType === 'employee' ? 'ID' : 'CC'
        });
        setEmployeeSearchTerm('');
        dispatch(clearFilters());
        dispatch(resetAttendanceData());
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            if (!attendanceData?.Data || attendanceData.Data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const data = attendanceData.Data;
            const filename = `Staff_Attendance_Report_${localFilters.selectedYear}_${localFilters.selectedMonth}`;

            downloadAsExcel(data, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get day columns from attendance data
    const getDayColumns = () => {
        if (!attendanceData?.Data || attendanceData.Data.length === 0) return [];
        
        const firstEmployee = attendanceData.Data[0];
        const dayColumns = [];
        
        Object.keys(firstEmployee).forEach(key => {
            if (key.includes('#')) {
                const parts = key.split('#');
                const day = parts[0]; // Mon, Tue, Wed, etc.
                const date = parts[1]; // 1, 2, 3, etc.
                dayColumns.push({ key, day, date });
            }
        });
        
        return dayColumns;
    };

    const dayColumns = getDayColumns();

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <CalendarDays className="h-8 w-8 text-indigo-600" />
                            Staff Attendance Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Monthly attendance tracking for employees and cost centres
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
                        <span className="text-gray-900 dark:text-white">Staff Attendance Report</span>
                    </div>
                </nav>
            </div>

            {/* Report Type Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Report Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportTypeOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleReportTypeChange(option.value)}
                            className={clsx(
                                "p-4 rounded-lg border-2 transition-all duration-300 flex items-center gap-3",
                                reportType === option.value
                                    ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-700 dark:text-indigo-300"
                                    : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-300"
                            )}
                        >
                            <option.icon className="h-6 w-6" />
                            <span className="font-medium">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {/* Year Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.selectedYear}
                            onChange={(e) => handleFilterChange('selectedYear', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">Select Year</option>
                            {generateYears().map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Month Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Month <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.selectedMonth}
                            onChange={(e) => handleFilterChange('selectedMonth', e.target.value)}
                            disabled={!localFilters.selectedYear}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Month</option>
                            {generateMonths().map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Employee ID Search - For Employee Wise */}
                    {reportType === 'employee' && (
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Employee ID <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={employeeSearchTerm}
                                    onChange={(e) => {
                                        setEmployeeSearchTerm(e.target.value);
                                        setShowEmployeeDropdown(true);
                                    }}
                                    onFocus={() => setShowEmployeeDropdown(true)}
                                    placeholder="Type employee ID or name..."
                                    disabled={!localFilters.selectedMonth}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                />
                                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                            </div>

                            {/* Autocomplete Dropdown */}
                            {showEmployeeDropdown && employeeSearchTerm.length >= 2 && filteredEmployees.length > 0 && (
                                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {loading.attendanceEmployees ? (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                                            Searching employees...
                                        </div>
                                    ) : (
                                        filteredEmployees.map((employee, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleEmployeeSelect(employee)}
                                                className="w-full px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-0"
                                            >
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {employee.RefNo}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {employee.EmpName}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cost Centre Selection - For Cost Centre Wise */}
                    {reportType === 'costcentre' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Cost Centre <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.typeValue}
                                onChange={(e) => handleFilterChange('typeValue', e.target.value)}
                                disabled={loading.attendanceCostCentres || !localFilters.selectedMonth}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Cost Centre</option>
                                {Array.isArray(attendanceCostCentres?.Data) && attendanceCostCentres.Data.map((cc, index) => (
                                    <option key={cc.CC_Code || index} value={cc.CC_Code}>
                                        {cc.CC_Code} - {cc.CC_Name || cc.CC_Code}
                                    </option>
                                ))}
                            </select>

                            {loading.attendanceCostCentres && (
                                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                    Loading cost centres...
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isAnyLoading || !localFilters.selectedYear || !localFilters.selectedMonth || !localFilters.typeValue}
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
                        <Tooltip content="Print attendance report">
                            <button
                                onClick={handlePrint}
                                disabled={!attendanceData?.Data || attendanceData.Data.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Printer className="h-5 w-5" />
                                Print
                            </button>
                        </Tooltip>

                        {/* Excel Download Button */}
                        <Tooltip content="Download attendance report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!attendanceData?.Data || attendanceData.Data.length === 0}
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
            <SummaryCards attendanceData={attendanceData} />

            {/* Attendance Legend */}
            {attendanceData?.Data && attendanceData.Data.length > 0 && (
                <AttendanceLegend />
            )}

            {/* Attendance Sheet Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {attendanceData?.Data && Array.isArray(attendanceData.Data) && attendanceData.Data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gradient-to-r from-indigo-600 to-purple-700 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider sticky left-0 bg-indigo-600 z-20">
                                            Employee
                                        </th>
                                        {dayColumns.map((dayCol, index) => (
                                            <th key={index} className="px-3 py-4 text-center text-xs font-bold text-white uppercase tracking-wider min-w-[50px]">
                                                <div>{dayCol.date}</div>
                                                <div className="text-[10px] opacity-80">{dayCol.day}</div>
                                            </th>
                                        ))}
                                        <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider sticky right-0 bg-purple-700 z-20">
                                            Total<br/>Days
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider sticky right-0 bg-purple-700 z-20" style={{ right: '80px' }}>
                                            Present<br/>Days
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {attendanceData.Data.map((employee, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-4 py-4 sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                        {index + 1}
                                                    </div>
                                                    <div className="min-w-[200px]">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {employee.RefNo}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                                            {employee.EmpName}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-500">
                                                            {employee.Department} • {employee.Designation}
                                                        </div>
                                                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                            {employee.CCCode} - {employee.WorkingLocation}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {dayColumns.map((dayCol, dayIndex) => (
                                                <td key={dayIndex} className="px-2 py-2 text-center">
                                                    <AttendanceStatusBadge status={employee[dayCol.key]} />
                                                </td>
                                            ))}
                                            <td className="px-4 py-4 text-center sticky right-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-10" style={{ right: '80px' }}>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {employee.TotalMonthDays || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center sticky right-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-10">
                                                <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                                    {employee.TotalPresentDays || '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer with employee count */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Showing {attendanceData.Data.length} of {attendanceData.Data.length} employees
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                    {reportType === 'employee' ? 'Employee ID Wise Report' : 'Cost Centre Wise Report'}
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
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Attendance Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select your report type, year, month, and {reportType === 'employee' ? 'employee ID' : 'cost centre'}, then click "View Report" to load attendance data.
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
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Attendance Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching attendance data for the selected criteria...
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
                        <p className="font-semibold mb-1">Staff Attendance Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Employee ID Wise:</strong> Search for a specific employee by typing their ID or name, then select to view their attendance<br />
                            2. <strong>Cost Centre Wise:</strong> Select a cost centre to view attendance for all employees in that cost centre<br />
                            3. <strong>Attendance Sheet View:</strong> Horizontal scrollable calendar showing all days with color-coded status<br />
                            4. <strong>Color-Coded Status:</strong> P=Present, A=Absent, PL=Paid Leave, HD=Half Day, H=Holiday, S=Sunday, L=Leave<br />
                            5. <strong>Summary Analytics:</strong> Total present days, absences, leaves, and attendance percentage<br />
                            6. <strong>Export Options:</strong> Download as Excel or print the attendance report<br />
                            7. <strong>Search as you type:</strong> Employee search shows suggestions - select one to view their attendance
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

export default StaffAttendanceReportPage;