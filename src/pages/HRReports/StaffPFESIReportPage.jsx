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
    DollarSign,
    Wallet,
    CreditCard,
    IndianRupee,
    Shield
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchPFESIPaidYears,
    fetchPfEsiPaidMonthsByYear,
    fetchPFESIPaidCC,
    fetchPaidPFData,
    fetchPaidESIData,
    setFilters,
    clearFilters,
    setReportType,
    resetPFESIReportData,
    clearError,
    clearMonthsData,
    clearCostCentreData,
    selectPFESIYears,
    selectPFESIMonths,
    selectPFESICostCentres,
    selectStaffPFData,
    selectStaffESIData,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectCurrentReportData,
    selectIsEPFReport
} from '../../slices/HrReportSlice/pfandesiReportSlice';

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

// Summary Cards Component for EPF Report
const EPFSummaryCards = ({ reportData }) => {
    if (!reportData || !reportData.Data) {
        return null;
    }

    const data = reportData.Data;
    const pfData = data.lstPaidPFData || [];

    const summary = {
        totalEmployees: pfData.length,
        totalWorkdays: data.TotalWorkdays || 0,
        totalGross: data.TotalGross || 0,
        totalEmpContribution: data.TotalPFEmpCont || 0,
        totalEmplrContribution: data.TotalPFEmplrCont || 0,
        totalAdmin: data.TotalPFAdmin || 0,
    };

    const cards = [
        {
            title: 'Total Employees',
            value: summary.totalEmployees,
            icon: Users,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        },
        {
            title: 'Total Working Days',
            value: summary.totalWorkdays.toFixed(1),
            icon: Calendar,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
        },
        {
            title: 'Total Gross Amount',
            value: `₹${summary.totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Employee Contribution',
            value: `₹${summary.totalEmpContribution.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: Wallet,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        },
        {
            title: 'Employer Contribution',
            value: `₹${summary.totalEmplrContribution.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: CreditCard,
            color: 'from-pink-500 to-rose-600',
            bgColor: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20'
        },
        {
            title: 'Admin Charges',
            value: `₹${summary.totalAdmin.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: Shield,
            color: 'from-violet-500 to-purple-600',
            bgColor: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
            {cards.map((card, index) => (
                <div key={index} className={`bg-gradient-to-r ${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                {card.title}
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
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

// Summary Cards Component for ESI Report
const ESISummaryCards = ({ reportData }) => {
    if (!reportData || !reportData.Data) {
        return null;
    }

    const data = reportData.Data;
    const esiData = data.lstPaidEsiData || [];

    const summary = {
        totalEmployees: esiData.length,
        totalWorkdays: data.TotalWorkdays || 0,
        totalGross: data.TotalGross || 0,
        totalEmpContribution: data.TotalEsiEmpCont || 0,
        totalEmplrContribution: data.TotalEsiEmplrCont || 0,
    };

    const cards = [
        {
            title: 'Total Employees',
            value: summary.totalEmployees,
            icon: Users,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        },
        {
            title: 'Total Working Days',
            value: summary.totalWorkdays.toFixed(1),
            icon: Calendar,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
        },
        {
            title: 'Total Gross Amount',
            value: `₹${summary.totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Employee Contribution',
            value: `₹${summary.totalEmpContribution.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: Wallet,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        },
        {
            title: 'Employer Contribution',
            value: `₹${summary.totalEmplrContribution.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: CreditCard,
            color: 'from-pink-500 to-rose-600',
            bgColor: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20'
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
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
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

const StaffPFESIReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const pfesiYears = useSelector(selectPFESIYears);
    const pfesiMonths = useSelector(selectPFESIMonths);
    const pfesiCostCentres = useSelector(selectPFESICostCentres);
    const staffPFData = useSelector(selectStaffPFData);
    const staffESIData = useSelector(selectStaffESIData);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const currentReportData = useSelector(selectCurrentReportData);
    const isEPFReport = useSelector(selectIsEPFReport);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        reportType: 'EPF',
        selectedYear: '',
        selectedMonth: '',
        selectedCCCode: ''
    });

    // Fetch years on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await dispatch(fetchPFESIPaidYears({
                    reportType: 'EPF',
                    lType: '',
                    contraCode: '',
                    eType: 'Staff'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching initial years:', error);
            }
        };

        fetchInitialData();
    }, [dispatch]);

    // Sync local filters with Redux filters
    useEffect(() => {
        if (filters.reportType || filters.selectedYear || filters.selectedMonth || filters.selectedCCCode) {
            setLocalFilters({
                reportType: filters.reportType || 'EPF',
                selectedYear: filters.selectedYear || '',
                selectedMonth: filters.selectedMonth || '',
                selectedCCCode: filters.selectedCCCode || ''
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

    // Handle report type change
    const handleReportTypeChange = async (e) => {
        const newReportType = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            reportType: newReportType,
            selectedYear: '',
            selectedMonth: '',
            selectedCCCode: ''
        }));

        dispatch(setReportType(newReportType));
        dispatch(resetPFESIReportData());

        try {
            await dispatch(fetchPFESIPaidYears({
                reportType: newReportType,
                lType: '',
                contraCode: '',
                eType: 'Staff'
            })).unwrap();
        } catch (error) {
            console.error('❌ Error fetching years:', error);
        }
    };

    // Handle year change
    const handleYearChange = async (e) => {
        const year = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            selectedYear: year,
            selectedMonth: '',
            selectedCCCode: ''
        }));

        dispatch(clearMonthsData());

        if (year) {
            try {
                await dispatch(fetchPfEsiPaidMonthsByYear({
                    year: year,
                    reportType: localFilters.reportType,
                    lType: '',
                    contraCode: '',
                    eType: 'Staff'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching months:', error);
            }
        }
    };

    // Handle month change
    const handleMonthChange = async (e) => {
        const month = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            selectedMonth: month,
            selectedCCCode: ''
        }));

        dispatch(clearCostCentreData());

        if (month && localFilters.selectedYear) {
            try {
                await dispatch(fetchPFESIPaidCC({
                    month: month,
                    year: localFilters.selectedYear,
                    reportType: localFilters.reportType,
                    lType: '',
                    contraCode: '',
                    eType: 'Staff'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching cost centres:', error);
            }
        }
    };

    // Handle cost centre change
    const handleCCCodeChange = (e) => {
        const ccCode = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            selectedCCCode: ccCode
        }));
    };

    // Handle view button click
    const handleView = async () => {
        // Validation
        if (!localFilters.reportType) {
            toast.warning('Please select Report Type');
            return;
        }

        if (!localFilters.selectedYear) {
            toast.warning('Please select Year');
            return;
        }

        if (!localFilters.selectedMonth) {
            toast.warning('Please select Month');
            return;
        }

        if (!localFilters.selectedCCCode) {
            toast.warning('Please select Cost Centre');
            return;
        }

        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));

            // Prepare parameters for API call
            const params = {
                ReportType: localFilters.reportType,
                CCCode: localFilters.selectedCCCode,
                Month: localFilters.selectedMonth,
                Year: localFilters.selectedYear
            };

            console.log('📊 Fetching Staff PF/ESI report data with params:', params);

            // Call appropriate API based on report type
            if (localFilters.reportType === 'EPF') {
                await dispatch(fetchPaidPFData(params)).unwrap();
                toast.success('Staff PF report loaded successfully');
            } else {
                await dispatch(fetchPaidESIData(params)).unwrap();
                toast.success('Staff ESI report loaded successfully');
            }

        } catch (error) {
            console.error('❌ Error fetching report:', error);
            toast.error('Failed to fetch report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            reportType: 'EPF',
            selectedYear: '',
            selectedMonth: '',
            selectedCCCode: ''
        });

        dispatch(clearFilters());
        dispatch(resetPFESIReportData());
        dispatch(setReportType('EPF'));

        // Refetch years for EPF
        dispatch(fetchPFESIPaidYears({
            reportType: 'EPF',
            lType: '',
            contraCode: '',
            eType: 'Staff'
        }));
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            if (!currentReportData?.Data) {
                toast.warning('No data available to download');
                return;
            }

            const data = localFilters.reportType === 'EPF'
                ? currentReportData.Data.lstPaidPFData
                : currentReportData.Data.lstPaidEsiData;

            if (!data || data.length === 0) {
                toast.warning('No records available to download');
                return;
            }

            const monthName = currentReportData.Data.MonthName || localFilters.selectedMonth;
            const filename = `Staff_${localFilters.reportType}_Report_${monthName}_${localFilters.selectedYear}`;

            downloadAsExcel(data, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get month name from month number
    const getMonthName = (monthNum) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[parseInt(monthNum) - 1] || monthNum;
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
                            Staff {localFilters.reportType} Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View and manage staff {localFilters.reportType === 'EPF' ? 'Provident Fund' : 'ESI'} contribution reports
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Staff Reports
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
                        <span>PF & ESI Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Staff {localFilters.reportType} Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {/* Report Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Report Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.reportType}
                            onChange={handleReportTypeChange}
                            disabled={isAnyLoading}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="EPF">Provident Fund (EPF)</option>
                            <option value="ESIC">ESI Corporation (ESIC)</option>
                        </select>
                    </div>

                    {/* Year */}
                    {/* Year */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.selectedYear}
                            onChange={handleYearChange}
                            disabled={isAnyLoading || !pfesiYears || pfesiYears.length === 0}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Year</option>
                            {pfesiYears && Array.isArray(pfesiYears) && pfesiYears.map((yearObj, index) => {
                                // Handle both object format {Year: '2023'} and string format '2023'
                                const yearValue = yearObj?.Year || yearObj?.YearValue || yearObj;
                                return (
                                    <option key={index} value={yearValue}>
                                        {yearValue}
                                    </option>
                                );
                            })}
                        </select>
                    </div>


                    {/* Month */}
                    {/* Month */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Month <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.selectedMonth}
                            onChange={handleMonthChange}
                            disabled={isAnyLoading || !localFilters.selectedYear || !pfesiMonths || pfesiMonths.length === 0}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Month</option>
                            {pfesiMonths && Array.isArray(pfesiMonths) && pfesiMonths.map((monthObj, index) => {
                                // Handle both object format and string format
                                let monthValue, monthName;

                                if (typeof monthObj === 'object' && monthObj !== null) {
                                    // Object format: {MonthNo: '12', MonthName: 'Dec'}
                                    monthValue = monthObj.MonthNo || monthObj.Month || monthObj.month;
                                    monthName = monthObj.MonthName || getMonthName(monthValue);
                                } else {
                                    // String/number format: '12' or 12
                                    monthValue = monthObj;
                                    monthName = getMonthName(monthValue);
                                }

                                return (
                                    <option key={index} value={monthValue}>
                                        {monthName}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Cost Centre */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Cost Centre <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.selectedCCCode}
                            onChange={handleCCCodeChange}
                            disabled={isAnyLoading || !localFilters.selectedMonth || !pfesiCostCentres || pfesiCostCentres.length === 0}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Cost Centre</option>
                            <option value="0">All Cost Centres</option>
                            {pfesiCostCentres && Array.isArray(pfesiCostCentres) && pfesiCostCentres.map((ccObj, index) => {
                                // Handle both object format and string format
                                let ccValue, ccDisplay;

                                if (typeof ccObj === 'object' && ccObj !== null) {
                                    // Object format: {CCCode: 'CC-12', CCName: 'Cost Centre 12'}
                                    ccValue = ccObj.CC_Code || ccObj.ccCode || ccObj.CC;
                                    ccDisplay = ccObj.CC_Name || ccObj.ccName || ccValue;
                                } else {
                                    // String format: 'CC-12'
                                    ccValue = ccObj;
                                    ccDisplay = ccObj;
                                }

                                return (
                                    <option key={index} value={ccValue}>
                                        {ccDisplay}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isAnyLoading || !localFilters.reportType || !localFilters.selectedYear || !localFilters.selectedMonth || !localFilters.selectedCCCode}
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
                        <Tooltip content="Print report">
                            <button
                                onClick={handlePrint}
                                disabled={!currentReportData?.Data}
                                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Printer className="h-5 w-5" />
                                Print
                            </button>
                        </Tooltip>

                        {/* Excel Download Button */}
                        <Tooltip content="Download report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!currentReportData?.Data}
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
            {currentReportData?.Data && (
                localFilters.reportType === 'EPF' ? (
                    <EPFSummaryCards reportData={currentReportData} />
                ) : (
                    <ESISummaryCards reportData={currentReportData} />
                )
            )}

            {/* Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {currentReportData?.Data ? (
                    <div className="overflow-x-auto">
                        {localFilters.reportType === 'EPF' ? (
                            /* EPF Table */
                            currentReportData.Data.lstPaidPFData && currentReportData.Data.lstPaidPFData.length > 0 ? (
                                <>
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
                                                    Designation
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    UAN No
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Working Days
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    PF Gross
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Employee Cont.
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Employer Cont.
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Admin
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Transaction Ref
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {currentReportData.Data.lstPaidPFData.map((employee, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                            {employee.EmpRowno || index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {employee.Name}
                                                            </div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                ID: {employee.EmpRefno}
                                                            </div>
                                                            <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                                                CC: {employee.CCCode}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                            {employee.Designation || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {employee.SalaryType === 'M' ? 'Monthly' : 'Daily'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                                                            {employee.UANNo || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                            {employee.NoofWorkingDays ? parseFloat(employee.NoofWorkingDays).toFixed(1) : '0.0'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            ₹{employee.PFGrossamt ? parseFloat(employee.PFGrossamt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                            ₹{employee.EmployeeContAmt ? parseFloat(employee.EmployeeContAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                                                            ₹{employee.EmployerContAmt ? parseFloat(employee.EmployerContAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                            ₹{employee.Admin ? parseFloat(employee.Admin).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                                            {employee.PayRollRefno || 'N/A'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Footer with totals */}
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                Total Employees: {currentReportData.Data.lstPaidPFData.length}
                                            </span>
                                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                                {currentReportData.Data.MonthName} {localFilters.selectedYear} - Staff EPF Report
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                            <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No EPF Data Found</h3>
                                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                            No EPF records available for the selected filters.
                                        </p>
                                    </div>
                                </div>
                            )
                        ) : (
                            /* ESI Table */
                            currentReportData.Data.lstPaidEsiData && currentReportData.Data.lstPaidEsiData.length > 0 ? (
                                <>
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
                                                    Designation
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    ESI IP No
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Working Days
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    ESI Gross
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Employee Cont.
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Employer Cont.
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Transaction Ref
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {currentReportData.Data.lstPaidEsiData.map((employee, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                            {employee.EmpRowno || index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {employee.Name}
                                                            </div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                ID: {employee.EmpRefno}
                                                            </div>
                                                            <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                                                CC: {employee.CCCode}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                            {employee.Designation || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {employee.SalaryType === 'M' ? 'Monthly' : 'Daily'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                                                            {employee.ESIIPNo || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                            {employee.NoofWorkingDays ? parseFloat(employee.NoofWorkingDays).toFixed(1) : '0.0'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            ₹{employee.ESIGorssAmount ? parseFloat(employee.ESIGorssAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                            ₹{employee.EmployeeContAmt ? parseFloat(employee.EmployeeContAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                                                            ₹{employee.EmployerContAmt ? parseFloat(employee.EmployerContAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                                            {employee.PayRollRefno || 'N/A'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Footer with totals */}
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                Total Employees: {currentReportData.Data.lstPaidEsiData.length}
                                            </span>
                                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                                {currentReportData.Data.MonthName} {localFilters.selectedYear} - Staff ESI Report
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                            <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No ESI Data Found</h3>
                                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                            No ESI records available for the selected filters.
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
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
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Report Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select report type, year, month, and cost centre, then click "View Report" to load data.
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
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching {localFilters.reportType} data for the selected filters...
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
                        <p className="font-semibold mb-1">Staff PF & ESI Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Report Type:</strong> Switch between EPF (Provident Fund) and ESIC (ESI Corporation) reports<br />
                            2. <strong>Year Selection:</strong> Select the year for which you want to view the report<br />
                            3. <strong>Month Selection:</strong> Choose the month for the report<br />
                            4. <strong>Cost Centre Filter:</strong> Select specific cost centre or "All Cost Centres" for comprehensive view<br />
                            5. <strong>Summary Statistics:</strong> View totals for employees, working days, gross amounts, and contributions<br />
                            6. <strong>Detailed Records:</strong> See employee-wise breakdown with UAN/ESI IP numbers, designations, and contribution amounts<br />
                            7. <strong>Export Options:</strong> Download the report as Excel or print for records
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

export default StaffPFESIReportPage;