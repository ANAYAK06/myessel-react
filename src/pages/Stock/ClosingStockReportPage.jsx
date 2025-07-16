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
    Calendar,
    TrendingUp,
    CheckCircle,
    Clock,
    FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchStockCloseUpdateCC,
    fetchCCFinancialYears,
    fetchStockCloseReportData,
    setFilters,
    clearFilters,
    resetReportData,
    resetAllData,
    clearError,
    selectStockCloseUpdateCC,
    selectCCFinancialYears,
    selectStockCloseReportData,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectClosingStockSummary
} from '../../slices/stockSlice/closingStockReportSlice';

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

// Modal Component for Stock Details
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
                        <div className="max-h-96 overflow-y-auto">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stock Details Modal Component
const StockDetailsModal = ({ isOpen, onClose, stockData }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Stock Closing Details - ${stockData?.CCCode || 'N/A'}`} size="lg">
            {stockData ? (
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction Reference</p>
                                <p className="text-base text-gray-900 dark:text-white">{stockData.Transactionrefno || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost Center</p>
                                <p className="text-base text-gray-900 dark:text-white">{stockData.CCName || stockData.CCCode || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">From Date</p>
                                <p className="text-base text-gray-900 dark:text-white">{stockData.FromDate || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">To Date</p>
                                <p className="text-base text-gray-900 dark:text-white">{stockData.ToDate || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction Type</p>
                                <p className="text-base text-gray-900 dark:text-white">{stockData.TransactionType || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                                <span className={clsx(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                    stockData.Status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                )}>
                                    {stockData.Status || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Financial Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{formatCurrency(stockData.Amount)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Purchase Amount</p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">₹{formatCurrency(stockData.TotalPurchaseAmt)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Stock Amount</p>
                                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">₹{formatCurrency(stockData.NewStockAmt)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Old Stock Amount</p>
                                <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">₹{formatCurrency(stockData.OldStockAmt)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Value</p>
                                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">₹{formatCurrency(stockData.CurrentValue)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Closing Amount</p>
                                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">₹{formatCurrency(stockData.ClosingAmount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    {stockData.Remarks && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-50 dark:from-gray-900/20 dark:to-gray-900/20 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Remarks</h4>
                            <p className="text-gray-700 dark:text-gray-300">{stockData.Remarks}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No stock details available</p>
                </div>
            )}
        </Modal>
    );
};

// Summary Cards Component
const SummaryCards = ({ summary }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const cards = [
        {
            title: 'Total Records',
            value: summary.totalRecords,
            icon: FileText,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
            isCount: true,
            subtitle: 'Closing stock records'
        },
        {
            title: 'Total Amount',
            value: summary.totalAmount,
            icon: IndianRupee,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            isCount: false,
            subtitle: 'Total stock amount'
        },
        {
            title: 'Total Closing Amount',
            value: summary.totalClosingAmount,
            icon: TrendingUp,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
            isCount: false,
            subtitle: 'Final closing amount'
        },
        {
            title: 'Approved Records',
            value: summary.approvedRecords,
            icon: CheckCircle,
            color: 'from-green-500 to-green-600',
            bgColor: 'from-green-50 to-green-50 dark:from-green-900/20 dark:to-green-900/20',
            isCount: true,
            subtitle: `${summary.pendingRecords} pending`
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {cards.map((card, index) => (
                <div key={index} className={`bg-gradient-to-r ${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                {card.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {card.isCount ? card.value : `₹${formatCurrency(card.value)}`}
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

const ClosingStockReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const stockCloseUpdateCC = useSelector(selectStockCloseUpdateCC);
    const ccFinancialYears = useSelector(selectCCFinancialYears);
    const stockCloseReportData = useSelector(selectStockCloseReportData);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const closingStockSummary = useSelector(selectClosingStockSummary);

    // Get userData from auth state (includes UID and roleId)
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        CCCode: '',
        Year: ''
    });

    // Modal state
    const [isStockDetailsModalOpen, setIsStockDetailsModalOpen] = useState(false);
    const [selectedStockData, setSelectedStockData] = useState(null);

    // Track initialization
    const [hasInitialized, setHasInitialized] = useState(false);

    // Load CC codes when userData is available
    useEffect(() => {
        if (uid && roleId && !hasInitialized) {
            const params = {
                UserId: uid,
                Roleid: roleId
            };

            dispatch(fetchStockCloseUpdateCC(params))
                .unwrap()
                .then((response) => {
                    console.log('✅ Stock Close Update CC loaded successfully');
                    setHasInitialized(true);
                })
                .catch((error) => {
                    console.error('❌ Failed to load Stock Close Update CC:', error);
                    toast.error('Failed to load cost center codes');
                    setHasInitialized(true);
                });
        }
    }, [dispatch, uid, roleId, hasInitialized]);

    // Load financial years when CC Code is selected
    useEffect(() => {
        if (localFilters.CCCode && hasInitialized) {
            const params = {
                CCCode: localFilters.CCCode
            };

            dispatch(fetchCCFinancialYears(params))
                .unwrap()
                .then((response) => {
                    console.log('✅ CC Financial Years loaded successfully for CC:', localFilters.CCCode);
                    // Clear selected year when CC changes
                    setLocalFilters(prev => ({ ...prev, Year: '' }));
                })
                .catch((error) => {
                    console.error('❌ Failed to load CC Financial Years:', error);
                    toast.error('Failed to load financial years');
                });
        }
    }, [localFilters.CCCode, dispatch, hasInitialized]);

    // Sync local filters with Redux filters
    useEffect(() => {
        setLocalFilters(prev => ({
            ...prev,
            CCCode: filters.CCCode || '',
            Year: filters.Year || ''
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

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN');
        } catch {
            return dateString;
        }
    };

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    // Handle refresh CC codes
    const handleRefreshCCCodes = async () => {
        try {
            if (uid && roleId) {
                const params = {
                    UserId: uid,
                    Roleid: roleId
                };

                await dispatch(fetchStockCloseUpdateCC(params)).unwrap();
                toast.success('Cost center codes refreshed successfully');
            } else {
                toast.warning('Please ensure user credentials are available.');
            }

        } catch (error) {
            console.error('❌ Failed to refresh Stock Close Update CC:', error);
            toast.error('Failed to refresh cost center codes. Please try again.');
        }
    };

    // Handle refresh financial years
    const handleRefreshFinancialYears = async () => {
        try {
            if (localFilters.CCCode) {
                const params = {
                    CCCode: localFilters.CCCode
                };

                await dispatch(fetchCCFinancialYears(params)).unwrap();
                toast.success('Financial years refreshed successfully');
            } else {
                toast.warning('Please select a cost center first.');
            }

        } catch (error) {
            console.error('❌ Failed to refresh CC Financial Years:', error);
            toast.error('Failed to refresh financial years. Please try again.');
        }
    };

    // Handle view button click
    const handleView = async () => {
        try {
            // Validate required fields
            if (!localFilters.CCCode) {
                toast.warning('Please select a cost center');
                return;
            }
            if (!localFilters.Year) {
                toast.warning('Please select a financial year');
                return;
            }

            // Update Redux filters
            const apiFilters = {
                CCCode: localFilters.CCCode,
                Year: localFilters.Year
            };

            dispatch(setFilters(apiFilters));

            // Prepare params for stock close report data
            const params = {
                CCCode: localFilters.CCCode,
                Year: localFilters.Year
            };

            await dispatch(fetchStockCloseReportData(params)).unwrap();
            toast.success('Closing stock report loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching closing stock report:', error);
            toast.error('Failed to fetch closing stock report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            CCCode: '',
            Year: ''
        });
        dispatch(resetAllData());
    };

    // Handle row click to view stock details
    const handleRowClick = (stockData) => {
        setSelectedStockData(stockData);
        setIsStockDetailsModalOpen(true);
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = stockCloseReportData?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Transaction Reference': item.Transactionrefno || '-',
                'CC Code': item.CCCode || '-',
                'CC Name': item.CCName || '-',
                'From Date': item.FromDate || '-',
                'To Date': item.ToDate || '-',
                'Transaction Type': item.TransactionType || '-',
                'Amount': item.Amount || 0,
                'Total Purchase Amount': item.TotalPurchaseAmt || 0,
                'New Stock Amount': item.NewStockAmt || 0,
                'Old Stock Amount': item.OldStockAmt || 0,
                'Daily Issue Amount': item.DailyIssueAmt || 0,
                'Current Value': item.CurrentValue || 0,
                'Closing Amount': item.ClosingAmount || 0,
                'Status': item.Status || '-',
                'Remarks': item.Remarks || '-'
            }));

            const filename = `Closing_Stock_Report_${localFilters.CCCode || 'All'}_${localFilters.Year || 'All'}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get report data for display
    const reportData = stockCloseReportData?.Data || [];

    // Helper function to check if form is valid for submission
    const isFormValid = () => {
        return !!(uid && roleId && localFilters.CCCode && localFilters.Year && !isAnyLoading);
    };

    // Helper function to get CC code options
    const getCCCodeOptions = () => {
        if (!stockCloseUpdateCC) {
            return [];
        }

        // Handle different response structures
        let data = [];
        if (Array.isArray(stockCloseUpdateCC)) {
            data = stockCloseUpdateCC;
        } else if (stockCloseUpdateCC.Data && Array.isArray(stockCloseUpdateCC.Data)) {
            data = stockCloseUpdateCC.Data;
        } else if (stockCloseUpdateCC.data && Array.isArray(stockCloseUpdateCC.data)) {
            data = stockCloseUpdateCC.data;
        }

        return data;
    };

    // Helper function to get financial year options
    const getFinancialYearOptions = () => {
        if (!ccFinancialYears) {
            return [];
        }

        // Handle different response structures
        let data = [];
        if (Array.isArray(ccFinancialYears)) {
            data = ccFinancialYears;
        } else if (ccFinancialYears.Data && Array.isArray(ccFinancialYears.Data)) {
            data = ccFinancialYears.Data;
        } else if (ccFinancialYears.data && Array.isArray(ccFinancialYears.data)) {
            data = ccFinancialYears.data;
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
                            <Package className="h-8 w-8 text-indigo-600" />
                            Closing Stock Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Monitor and analyze stock closing transactions with comprehensive financial data
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-indigo-100 dark:from-indigo-900 dark:to-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Stock Management
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
                        <span className="text-gray-900 dark:text-white">Closing Stock Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* CC Code Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Building className="w-4 h-4 inline mr-2" />
                            Cost Center Code
                            <button
                                onClick={handleRefreshCCCodes}
                                disabled={loading.stockCloseUpdateCC}
                                className="ml-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                title="Refresh Cost Center Codes"
                            >
                                <RefreshCw className={`w-4 h-4 inline ${loading.stockCloseUpdateCC ? 'animate-spin' : ''}`} />
                            </button>
                        </label>
                        <select
                            value={localFilters.CCCode}
                            onChange={(e) => handleFilterChange('CCCode', e.target.value)}
                            disabled={loading.stockCloseUpdateCC}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Cost Center</option>
                            {getCCCodeOptions().map((cc, index) => {
                                const ccCode = cc?.CC_Code || cc?.ccVal || cc?.code || cc?.CCCode;
                                const ccName = cc?.CC_Name || cc?.ccName || cc?.name || cc?.CCName;
                                const ccId = cc?.CC_Id || cc?.ccId || cc?.id || cc?.CCId;

                                if (!ccCode) {
                                    return null;
                                }

                                return (
                                    <option key={ccId || index} value={ccCode}>
                                        {ccName ? ccName : ''}
                                    </option>
                                );
                            })}
                        </select>

                        {loading.stockCloseUpdateCC && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 flex items-center">
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Loading cost centers...
                            </p>
                        )}

                        {errors.stockCloseUpdateCC && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                                Failed to load cost centers.
                                <button
                                    onClick={handleRefreshCCCodes}
                                    className="ml-1 underline hover:no-underline"
                                >
                                    Retry
                                </button>
                            </p>
                        )}

                        {/* Status info */}
                        <div className="text-xs text-gray-500 mt-2">
                            Options: {getCCCodeOptions().length}
                            {localFilters.CCCode && <span className="text-green-600"> | Selected: {localFilters.CCCode}</span>}
                        </div>
                    </div>

                    {/* Financial Year Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Financial Year
                            <button
                                onClick={handleRefreshFinancialYears}
                                disabled={loading.ccFinancialYears || !localFilters.CCCode}
                                className="ml-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                title="Refresh Financial Years"
                            >
                                <RefreshCw className={`w-4 h-4 inline ${loading.ccFinancialYears ? 'animate-spin' : ''}`} />
                            </button>
                        </label>
                        <select
                            value={localFilters.Year}
                            onChange={(e) => handleFilterChange('Year', e.target.value)}
                            disabled={loading.ccFinancialYears || !localFilters.CCCode}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Financial Year</option>
                            {getFinancialYearOptions().map((year, index) => {
                                const yearValue = year?.Year || year?.year || year?.value || year?.FYear;
                                const yearDisplay = year?.YearDisplay || year?.yearDisplay || year?.display || yearValue;

                                if (!yearValue) {
                                    return null;
                                }

                                return (
                                    <option key={index} value={yearValue}>
                                        {yearDisplay || yearValue}
                                    </option>
                                );
                            })}
                        </select>

                        {loading.ccFinancialYears && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 flex items-center">
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Loading financial years...
                            </p>
                        )}

                        {errors.ccFinancialYears && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                                Failed to load financial years.
                                <button
                                    onClick={handleRefreshFinancialYears}
                                    className="ml-1 underline hover:no-underline"
                                >
                                    Retry
                                </button>
                            </p>
                        )}

                        {/* Status info */}
                        <div className="text-xs text-gray-500 mt-2">
                            Options: {getFinancialYearOptions().length}
                            {localFilters.Year && <span className="text-green-600"> | Selected: {localFilters.Year}</span>}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={!isFormValid()}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-600 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.stockCloseReportData ? (
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
                        <Tooltip content="Download closing stock report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(reportData) || reportData.length === 0}
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
            <SummaryCards summary={closingStockSummary} />

            {/* Closing Stock Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(reportData) && reportData.length > 0 ? (
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Transaction Ref
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-28">
                                        CC Code
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-40">
                                        CC Name
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-28">
                                        From Date
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-28">
                                        To Date
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Amount
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Closing Amount
                                    </th>
                                    <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider w-24">
                                        Status
                                    </th>
                                    <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider w-20">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {reportData.map((stock, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-32">
                                            <div className="truncate font-medium" title={stock.Transactionrefno}>
                                                {stock.Transactionrefno || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-28">
                                            <div className="truncate font-medium" title={stock.CCCode}>
                                                {stock.CCCode || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-40">
                                            <div className="truncate" title={stock.CCName}>
                                                {stock.CCName || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-28">
                                            <div className="truncate" title={formatDate(stock.FromDate)}>
                                                {formatDate(stock.FromDate)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-28">
                                            <div className="truncate" title={formatDate(stock.ToDate)}>
                                                {formatDate(stock.ToDate)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold w-32">
                                            <div className="truncate" title={`₹${formatCurrency(stock.Amount)}`}>
                                                <span className="text-green-600 dark:text-green-400">
                                                    ₹{formatCurrency(stock.Amount)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold w-32">
                                            <div className="truncate" title={`₹${formatCurrency(stock.ClosingAmount)}`}>
                                                <span className="text-purple-600 dark:text-purple-400">
                                                    ₹{formatCurrency(stock.ClosingAmount)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center w-24">
                                            <span className={clsx(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                stock.Status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            )}>
                                                {stock.Status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center w-20">
                                            <button
                                                onClick={() => handleRowClick(stock)}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                title="View Stock Details"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        {/* Empty State */}
                        {!loading.stockCloseReportData && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-indigo-100 dark:from-indigo-900 dark:to-indigo-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Closing Stock Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select cost center and financial year, then click "View Report" to load closing stock data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.stockCloseReportData && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-indigo-100 dark:from-indigo-900 dark:to-indigo-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Closing Stock Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching closing stock data...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Stock Details Modal */}
            <StockDetailsModal
                isOpen={isStockDetailsModalOpen}
                onClose={() => setIsStockDetailsModalOpen(false)}
                stockData={selectedStockData}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200">
                        <p className="font-semibold mb-1">Closing Stock Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Cost Center Selection:</strong> Choose from available cost centers based on user permissions<br />
                            2. <strong>Financial Year Filter:</strong> Select specific financial years (format: 2024-25) based on selected cost center<br />
                            3. <strong>Cascading Dropdowns:</strong> Financial years are loaded dynamically based on cost center selection<br />
                            4. <strong>Stock Details:</strong> Click the eye icon to view comprehensive closing stock information<br />
                            5. <strong>Summary Analytics:</strong> Overview of total records, amounts, closing amounts, and approval status<br />
                            6. <strong>Financial Breakdown:</strong> Detailed view of purchase amounts, stock amounts, and current values<br />
                            7. <strong>Export Functionality:</strong> Download complete closing stock data as Excel file<br />
                            8. <strong>Real-time Status:</strong> Track approval status and transaction types<br />
                            9. <strong>Responsive Design:</strong> Optimized for all devices with sticky table headers
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

export default ClosingStockReportPage;