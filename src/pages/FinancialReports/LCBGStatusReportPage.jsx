import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import {
    Package,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    Info,
    RefreshCw,
    ChevronRight,
    Activity,
    XCircle,
    Building,
    IndianRupee,
    Package2,
    Coins,
    FileText,
    Calendar,
    TrendingDown,
    BarChart3,
    AlertCircle,
    CreditCard,
    DollarSign,
    Banknote,
    PieChart
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import LCBG slice actions and selectors
import {
    fetchLCBGStatusReportMainGrid,
    setFilters,
    clearFilters,
    resetAllData,
    clearError,
    selectLCBGStatusReportMainGrid,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectLCBGStatusReportSummary
} from '../../slices/lcbgSlice/lcbgSlice';

// Import financial year slice
import { 
    fetchAllFinancialYears,
    selectAllFinancialYears 
} from '../../slices/budgetSlice/budgetReportSlice';

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

// Modal Component for LCBG Details
const Modal = ({ isOpen, onClose, title, children, size = 'xl' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-7xl'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className={clsx(
                    "inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full",
                    sizeClasses[size]
                )}>
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="max-h-[80vh] overflow-y-auto">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Summary Cards Component
const SummaryCards = ({ summaryData }) => {
    const formatAmount = (amount) => {
        if (!amount && amount !== 0) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (!summaryData || !Array.isArray(summaryData) || summaryData.length === 0) {
        return null;
    }

    const summary = summaryData[0]; // Take first summary record

    const cards = [
        {
            title: 'Sanctioned LC Limit',
            value: summary.SANCTIONEDLCLIMIT || 0,
            icon: CreditCard,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            subtitle: 'Total approved limit'
        },
        {
            title: 'Limit Released',
            value: summary.LCBGLIMITRELEASEDFORUTILISATION || 0,
            icon: TrendingDown,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
            subtitle: 'For utilization'
        },
        {
            title: 'LC Outstanding',
            value: summary.LCCONSUMEDOUTSTANDINGASONTODAY || 0,
            icon: Banknote,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
            subtitle: 'As on today'
        },
        {
            title: 'Total Outstanding',
            value: summary.LCandBGLIMITCONSUMEDOUTSTANDINGTODAY || 0,
            icon: Banknote,
            color: 'from-red-500 to-red-600',
            bgColor: 'from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20',
            subtitle: 'LC + BG combined'
        },
        {
            title: 'Available Balance',
            value: summary.BALANCELCBGLIMITAVAIABLE || 0,
            icon: PieChart,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            subtitle: 'Remaining limit'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {cards.map((card, index) => (
                <div key={index} className={`bg-gradient-to-r ${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                {card.title}
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {formatAmount(card.value)}
                            </p>
                            {card.subtitle && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {card.subtitle}
                                </p>
                            )}
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

const LCBGStatusReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const lcbgStatusReportMainGrid = useSelector(selectLCBGStatusReportMainGrid);
    const allFinancialYears = useSelector(selectAllFinancialYears);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        LCBGStatus: '',
        FYYear: ''
    });

    // Track initialization
    const [hasInitialized, setHasInitialized] = useState(false);

    // Load financial years on component mount
    useEffect(() => {
        if (!hasInitialized) {
            dispatch(fetchAllFinancialYears())
                .unwrap()
                .then(() => {
                    console.log('✅ Financial years loaded successfully');
                    setHasInitialized(true);
                })
                .catch((error) => {
                    console.error('❌ Failed to load financial years:', error);
                    toast.error('Failed to load financial years');
                    setHasInitialized(true);
                });
        }
    }, [dispatch, hasInitialized]);

    // Sync local filters with Redux filters
    useEffect(() => {
        setLocalFilters(prev => ({
            ...prev,
            LCBGStatus: filters.LCBGStatus || '',
            FYYear: filters.FYYear || ''
        }));
    }, [filters]);

    // Show error messages via toast
    useEffect(() => {
        Object.entries(errors).forEach(([key, error]) => {
            if (error && error !== null) {
                toast.error(`Error with ${key}: ${error}`);
                // Clear the error after showing
                dispatch(clearError({ errorType: key }));
            }
        });
    }, [errors, dispatch]);

    // Format date for display in table
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN');
        } catch {
            return dateString;
        }
    };

    // Format amount for display
    const formatAmount = (amount) => {
        if (!amount && amount !== 0) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    // Handle view button click
    const handleView = async () => {
        try {
            // Validate required fields
            if (!localFilters.LCBGStatus) {
                toast.warning('Please select LCBG Status');
                return;
            }

            if (!localFilters.FYYear) {
                toast.warning('Please select Financial Year');
                return;
            }

            // Extract start and end year from FY format (e.g., "2024-25" -> start: 2024, end: 2025)
            const fyParts = localFilters.FYYear.split('-');
            if (fyParts.length !== 2) {
                toast.error('Invalid financial year format');
                return;
            }

            const startYear = fyParts[0];
            const endYear = parseInt(fyParts[0]) + 1; // Calculate end year

            // Update Redux filters
            const apiFilters = {
                LCBGStatus: localFilters.LCBGStatus,
                FYYear: localFilters.FYYear,
                StartYear: startYear,
                EndYear: endYear.toString()
            };

            dispatch(setFilters(apiFilters));

            // Prepare params for LCBG status report
            const params = {
                StartYear: startYear,
                EndYear: endYear.toString(),
                FYYear: localFilters.FYYear,
                LCBGStatus: localFilters.LCBGStatus
            };

            await dispatch(fetchLCBGStatusReportMainGrid(params)).unwrap();
            toast.success('LCBG Status Report loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching LCBG status report:', error);
            toast.error('Failed to fetch LCBG status report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            LCBGStatus: '',
            FYYear: ''
        });
        dispatch(resetAllData());
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = lcbgStatusReportMainGrid?.Data?.LCBGMainData || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Type': item.TYPE || '-',
                'Beneficiary Name': item.NAMEOFBENEFICIRY || '-',
                'LCBG/BOE Number': item.LCBGBOENO || '-',
                'LC Amendment/BOE Date': formatDate(item.LCAMENDBOEDATE),
                'LC Amount (Including Amendment & Tolerance)': item.LCAMTINCAMENDANDTOLE || 0,
                'Cumulative Net LCBG Consumption': item.CumulativeNetLCBGconsumption || 0,
                'BOE Settlement Due Date': formatDate(item.BOESettelmentDueDate),
                'BOE Basic and GST': item.BOEBASICANDGST || 0,
                'BOE Interest': item.BOEINTERST || 0,
                'BOE Total Settlement Amount': item.BOETOTALSETTLEMENTAMT || 0,
                'Cumulative BOE Settled Value': item.CUMULATIVEBOESETTLEDVALUE || 0,
                'LCBG Limit Balance': item.LCBGLIMITBALANCE || 0
            }));

            const filename = `LCBG_Status_Report_${localFilters.LCBGStatus}_${localFilters.FYYear}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get LCBG main data and summary data for display
    const lcbgMainData = lcbgStatusReportMainGrid?.Data?.LCBGMainData || [];
    const lcbgSummaryData = lcbgStatusReportMainGrid?.Data?.LCBGSummaryData || [];

    // Helper function to check if form is valid for submission
    const isFormValid = () => {
        return !!(localFilters.LCBGStatus && localFilters.FYYear && !isAnyLoading);
    };

    // Helper function to get financial year options
    const getFinancialYearOptions = () => {
        if (!allFinancialYears) {
            return [];
        }

        let data = [];
        if (Array.isArray(allFinancialYears)) {
            data = allFinancialYears;
        } else if (allFinancialYears.Data && Array.isArray(allFinancialYears.Data)) {
            data = allFinancialYears.Data;
        } else if (allFinancialYears.data && Array.isArray(allFinancialYears.data)) {
            data = allFinancialYears.data;
        }

        return data;
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <CreditCard className="h-8 w-8 text-indigo-600" />
                            LCBG Status Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Monitor Letter of Credit and Bank Guarantee status with comprehensive financial analytics
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Financial Reports
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
                        <span>Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">LCBG Status Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* LCBG Status Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Activity className="w-4 h-4 inline mr-2" />
                            LCBG Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.LCBGStatus}
                            onChange={(e) => handleFilterChange('LCBGStatus', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">Select LCBG Status</option>
                            <option value="Active">Active</option>
                            <option value="Close">Close</option>
                            <option value="Select All">Select All</option>
                        </select>
                    </div>

                    {/* Financial Year Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Financial Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.FYYear}
                            onChange={(e) => handleFilterChange('FYYear', e.target.value)}
                            disabled={loading.allFinancialYears}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Financial Year</option>
                            {getFinancialYearOptions().map((year, index) => {
                                const yearValue = year?.YearValue || year?.Year;
                                const yearDisplay = year?.Year || year?.YearValue;
                                
                                if (!yearValue) return null;
                                
                                return (
                                    <option key={yearValue || index} value={yearValue}>
                                        {yearDisplay || `FY ${yearValue}`}
                                    </option>
                                );
                            })}
                        </select>

                        {loading.allFinancialYears && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 flex items-center">
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Loading financial years...
                            </p>
                        )}

                        {errors.allFinancialYears && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                                Failed to load financial years. Please refresh the page.
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={!isFormValid()}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.lcbgStatusReportMainGrid ? (
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

                        {/* Excel Download Button */}
                        <Tooltip content="Download LCBG status report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(lcbgMainData) || lcbgMainData.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Download className="h-5 w-5" />
                                Excel
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <SummaryCards summaryData={lcbgSummaryData} />

            {/* LCBG Status Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(lcbgMainData) && lcbgMainData.length > 0 ? (
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-20">
                                        Type
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-64">
                                        Beneficiary Name
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-40">
                                        LCBG/BOE Number
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Amendment/BOE Date
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-36">
                                        Net Consumption
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Settlement Due Date
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-36">
                                        BOE Basic & GST
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-36">
                                        Settlement Amount
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-36">
                                        Limit Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {lcbgMainData.map((record, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-20">
                                            <span className={clsx(
                                                "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                                                record.TYPE === 'LC' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                record.TYPE === 'BG' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                            )}>
                                                {record.TYPE || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-64">
                                            <div className="truncate font-medium" title={record.NAMEOFBENEFICIRY}>
                                                {record.NAMEOFBENEFICIRY || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-40">
                                            <div className="truncate font-mono text-xs" title={record.LCBGBOENO}>
                                                {record.LCBGBOENO || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-32">
                                            <div className="truncate">
                                                {formatDate(record.LCAMENDBOEDATE)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white text-right font-medium w-36">
                                            <span className="text-indigo-600 dark:text-indigo-400">
                                                {formatAmount(record.CumulativeNetLCBGconsumption || 0)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-32">
                                            <div className="truncate">
                                                {formatDate(record.BOESettelmentDueDate)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white text-right font-medium w-36">
                                            <span className="text-purple-600 dark:text-purple-400">
                                                {formatAmount(record.BOEBASICANDGST || 0)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white text-right font-medium w-36">
                                            <span className="text-orange-600 dark:text-orange-400">
                                                {formatAmount(record.BOETOTALSETTLEMENTAMT || 0)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white text-right font-bold w-36">
                                            <span className={clsx(
                                                record.LCBGLIMITBALANCE > 0 ? 
                                                "text-red-600 dark:text-red-400" : 
                                                "text-green-600 dark:text-green-400"
                                            )}>
                                                {formatAmount(record.LCBGLIMITBALANCE || 0)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        {/* Empty State */}
                        {!loading.lcbgStatusReportMainGrid && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No LCBG Status Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select LCBG status and financial year, then click "View Report" to load LCBG status data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.lcbgStatusReportMainGrid && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading LCBG Status Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching LCBG status data...
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
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200">
                        <p className="font-semibold mb-1">LCBG Status Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>LCBG Status Filter:</strong> Choose between Active, Close, or Select All to filter LC/BG records<br />
                            2. <strong>Financial Year Selection:</strong> Required filter to view LCBG data for specific financial year<br />
                            3. <strong>Comprehensive Summary:</strong> View sanctioned limits, utilization, outstanding amounts, and available balance<br />
                            4. <strong>Detailed Grid:</strong> Complete LCBG information including beneficiary details, dates, and financial amounts<br />
                            5. <strong>Type Classification:</strong> Clear distinction between LC (Letter of Credit), BG (Bank Guarantee), and BOE (Bill of Exchange)<br />
                            6. <strong>Financial Tracking:</strong> Monitor consumption, settlement amounts, and limit balances for each record<br />
                            7. <strong>Export Functionality:</strong> Download complete LCBG status data as Excel file for analysis<br />
                            8. <strong>Real-time Status:</strong> Current status of all LCBG instruments with due dates and settlement information<br />
                            9. <strong>Color-coded Indicators:</strong> Visual representation of different types and balance statuses<br />
                            10. <strong>Compliance Tracking:</strong> Monitor settlement due dates and outstanding obligations for financial compliance
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

export default LCBGStatusReportPage;