import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    ChevronDown, 
    ChevronUp,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    FileSpreadsheet,
    Info,
    Calculator,
    Receipt,
    Percent,
    Mail,
    FileText,
    X,
    DollarSign,
    ArrowRightLeft,
    Calendar,
    Building2,
    CreditCard,
    BanknoteIcon
} from 'lucide-react';
import {
    fetchAccruedInterestReport,
    fetchAccruedInterestReportSummary,
    fetchLiquidityStatusReport,
    setFilters,
    clearFilters,
    setReportType,
    resetReportData,
    resetSelectedCCData,
    openModal,
    closeModal,
    selectAccruedInterestReport,
    selectAccruedInterestReportSummary,
    selectLiquidityStatusReport,
    selectLoading,
    selectErrors,
    selectFilters,
    selectModalData,
    selectIsModalOpen,
    selectCanShowSummaryReport,
    selectCurrentReportData,
    selectCurrentReportLoading,
    selectCurrentReportError,
    selectReportSummary,
    selectReportType,
    selectRoleId
} from '../../slices/financialReportSlice/accruedInterestSlice';

// Import existing budget slice for cost center data
import {
    fetchCostCentersByTypeByRole,
    selectCostCentersByTypeByRole
} from '../../slices/budgetSlice/budgetReportSlice';

// Import CustomDatePicker
import CustomDatePicker from '../../components/CustomDatePicker';

// Utility functions for date handling
const formatDateForAPI = (date) => {
    if (!date) return '';
    // If it's already a string in the correct format, return it
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
    }
    // If it's a Date object or a string that can be parsed as a date
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
};

const formatDateForDisplay = (date) => {
    if (!date) return null;
    // If it's already a Date object, return it
    if (date instanceof Date) return date;
    // If it's a string, convert to Date
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

// Modal Component for Drill-down Details
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
                                <X className="h-6 w-6" />
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

// Transaction Details Modal Component
const TransactionDetailsModal = ({ isOpen, onClose, transactionData, loading, modalData }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const transactions = transactionData?.DateTransactionsList || transactionData?.Data || transactionData || [];
    const isDebitType = modalData.selectedType === '1';

    const getModalTitle = () => {
        return isDebitType 
            ? "CASH/BANK DEBIT DETAILS OF THE DAY" 
            : "CASH/BANK CREDIT DETAILS OF THE DAY";
    };

    const getDebitColumns = () => [
        { key: 'InvoiceDate', label: 'Invoice Date' },
        { key: 'PaidDate', label: 'Paid Date' },
        { key: 'TransactionFrom', label: 'Transaction From' },
        { key: 'DCA', label: 'DCA' },
        { key: 'SubDCA', label: 'SubDCA' },
        { key: 'ITHead', label: 'ITHead' },
        { key: 'Description', label: 'Description With Transaction ID/Voucher ID' },
        { key: 'Cash', label: 'Cash', align: 'right' },
        { key: 'Bank', label: 'Bank', align: 'right' },
        { key: 'TotalExpense', label: 'Total Expense', align: 'right' }
    ];

    const getCreditColumns = () => [
        { key: 'InvoiceDate', label: 'Invoice Date' },
        { key: 'CreditDate', label: 'Credit Date' },
        { key: 'TransactionFrom', label: 'Transaction From' },
        { key: 'CustomerPoNo', label: 'Customer PO' },
        { key: 'CreditedBank', label: 'Credited Bank' },
        { key: 'Description', label: 'Description With Transaction ID/Voucher ID' },
        { key: 'Credit', label: 'Credit', align: 'right' }
    ];

    const columns = isDebitType ? getDebitColumns() : getCreditColumns();

    const calculateTotals = () => {
        if (!Array.isArray(transactions) || transactions.length === 0) return {};
        
        return transactions.reduce((totals, transaction) => {
            if (isDebitType) {
                totals.cash = (totals.cash || 0) + parseFloat(transaction.Cash || 0);
                totals.bank = (totals.bank || 0) + parseFloat(transaction.Bank || 0);
                totals.totalExpense = (totals.totalExpense || 0) + parseFloat(transaction.TotalExpense || 0);
            } else {
                totals.credit = (totals.credit || 0) + parseFloat(transaction.Credit || 0);
            }
            return totals;
        }, {});
    };

    const totals = calculateTotals();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="full">
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <RotateCcw className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                    <p className="text-indigo-700 dark:text-indigo-300">Loading transaction details...</p>
                </div>
            ) : (
                <>
                    <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Date:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{modalData.selectedDate}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Cost Center:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{modalData.selectedCCCode}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Type:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{isDebitType ? 'Debit' : 'Credit'}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Amount:</span>
                                <span className="ml-2 text-gray-900 dark:text-white font-bold">{formatCurrency(modalData.selectedAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    {columns.map((column) => (
                                        <th 
                                            key={column.key}
                                            className={clsx(
                                                "px-4 py-3 text-xs font-bold text-white uppercase",
                                                column.align === 'right' ? 'text-right' : 'text-left'
                                            )}
                                        >
                                            {column.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {transactions.length > 0 ? transactions.map((transaction, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        {columns.map((column) => (
                                            <td 
                                                key={column.key}
                                                className={clsx(
                                                    "px-4 py-3 text-sm text-gray-900 dark:text-white",
                                                    column.align === 'right' ? 'text-right font-medium' : 'text-left'
                                                )}
                                            >
                                                {column.align === 'right' && ['Cash', 'Bank', 'TotalExpense', 'Credit'].includes(column.key)
                                                    ? formatCurrency(transaction[column.key] || 0)
                                                    : transaction[column.key] || '-'
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No transaction details available for this date
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {transactions.length > 0 && (
                                <tfoot className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40">
                                    <tr>
                                        <td colSpan={isDebitType ? 7 : 6} className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-center">
                                            {isDebitType ? 'Total Debit Of the Day:' : 'Total Credit Of the Day:'}
                                        </td>
                                        {isDebitType ? (
                                            <>
                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                    {formatCurrency(totals.cash || 0)}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                    {formatCurrency(totals.bank || 0)}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                    {formatCurrency(totals.totalExpense || 0)}
                                                </td>
                                            </>
                                        ) : (
                                            <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                {formatCurrency(totals.credit || 0)}
                                            </td>
                                        )}
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </>
            )}
        </Modal>
    );
};

// Report Summary Cards Component
const ReportSummaryCards = ({ reportSummary, reportType }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!reportSummary) return null;

    // Different cards for Summary vs Detail reports
    const getSummaryCards = () => {
        if (reportType === 'Summary') {
            return [
                {
                    title: 'Total Cumulative Received',
                    value: reportSummary.totalNetReceived,
                    icon: TrendingUp,
                    color: 'from-green-500 to-emerald-600',
                    bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                },
                {
                    title: 'Total Cumulative Net Paid',
                    value: reportSummary.totalNetPaid,
                    icon: TrendingDown,
                    color: 'from-red-500 to-pink-600',
                    bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
                },
                {
                    title: 'Total Cumulative Paid Amount',
                    value: reportSummary.totalCumulativePaidAmount,
                    icon: BanknoteIcon,
                    color: 'from-blue-500 to-cyan-600',
                    bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
                },
                {
                    title: 'Total Net Cash Status',
                    value: reportSummary.finalCashStatus,
                    icon: reportSummary.hasNegativeCashFlow ? AlertTriangle : DollarSign,
                    color: reportSummary.hasNegativeCashFlow ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600',
                    bgColor: reportSummary.hasNegativeCashFlow 
                        ? 'from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20'
                        : 'from-green-50 to-green-50 dark:from-green-900/20 dark:to-green-900/20'
                },
                {
                    title: 'Total Accumulated Interest',
                    value: reportSummary.totalAccumulatedInterest,
                    icon: Calculator,
                    color: 'from-purple-500 to-indigo-600',
                    bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
                }
            ];
        } else {
            // Detail report cards (original)
            return [
                {
                    title: 'Total Net Received',
                    value: reportSummary.totalNetReceived,
                    icon: TrendingUp,
                    color: 'from-green-500 to-emerald-600',
                    bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                },
                {
                    title: 'Total Net Paid',
                    value: reportSummary.totalNetPaid,
                    icon: TrendingDown,
                    color: 'from-red-500 to-pink-600',
                    bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
                },
                {
                    title: 'Final Cash Status',
                    value: reportSummary.finalCashStatus,
                    icon: reportSummary.hasNegativeCashFlow ? AlertTriangle : DollarSign,
                    color: reportSummary.hasNegativeCashFlow ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600',
                    bgColor: reportSummary.hasNegativeCashFlow 
                        ? 'from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20'
                        : 'from-green-50 to-green-50 dark:from-green-900/20 dark:to-green-900/20'
                },
                {
                    title: 'Accumulated Interest',
                    value: reportSummary.totalAccumulatedInterest,
                    icon: Calculator,
                    color: 'from-purple-500 to-indigo-600',
                    bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
                }
            ];
        }
    };

    const cards = getSummaryCards();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-6">
            {cards.map((card, index) => (
                <div key={index} className={`bg-gradient-to-r ${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                {card.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(card.value)}
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
        // Convert data to CSV format
        const csvContent = convertToCSV(data);
        
        // Create blob and download
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
        alert('Error downloading Excel file');
    }
};

// Helper function to convert data to CSV
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

const AccruedInterestReport = ({ menuData }) => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const reportType = useSelector(selectReportType);
    const canShowSummaryReport = useSelector(selectCanShowSummaryReport);
    const currentReportData = useSelector(selectCurrentReportData);
    const currentReportLoading = useSelector(selectCurrentReportLoading);
    const currentReportError = useSelector(selectCurrentReportError);
    const reportSummary = useSelector(selectReportSummary);
    const modalData = useSelector(selectModalData);
    const isModalOpen = useSelector(selectIsModalOpen);
    const accruedInterestReportSummary = useSelector(selectAccruedInterestReportSummary);
    const costCentersByTypeByRole = useSelector(selectCostCentersByTypeByRole);

    // Get userData from auth state (includes UID and roleId)
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Local state for form inputs - STORE DATES AS STRINGS
    const [localFilters, setLocalFilters] = useState({
        reportType: 'Detail',
        costCenterType: 'Performing',
        subType: '',
        ccStatus: '',
        costCenter: '',
        fromDate: '', // Store as string instead of Date object
        toDate: ''    // Store as string instead of Date object
    });

    // Static options for dropdowns
    const subTypeOptions = [
        { value: 'Manufacturing', label: 'Manufacturing' },
        { value: 'Service', label: 'Service' },
        { value: 'Trading', label: 'Trading' }
    ];

    const costCenterStatusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Closed', label: 'Closed' }
    ];

    // Initial data load and role-based setup
    useEffect(() => {
        console.log('🚀 Accrued Interest Report - User Data:', userData);
        console.log('🚀 Role ID:', roleId, 'UID:', uid);
        
        // Set role-based initial state
        if (roleId) {
            dispatch(setFilters({ roleId }));
            
            // Set initial report type based on role
            if (roleId !== '100' && roleId !== 100) {
                setLocalFilters(prev => ({ ...prev, reportType: 'Detail' }));
                dispatch(setReportType('Detail'));
            }
        }
    }, [dispatch, roleId, uid, userData]);

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Fetch cost centers when required filters are selected (only for Detail report)
    useEffect(() => {
        const shouldFetchCostCenters = () => {
            return localFilters.reportType === 'Detail' &&
                   localFilters.costCenterType && 
                   localFilters.subType && 
                   localFilters.ccStatus && 
                   roleId && 
                   uid;
        };

        if (shouldFetchCostCenters()) {
            const params = {
                ccType: localFilters.costCenterType,
                subType: localFilters.subType,
                uid: uid,
                rid: roleId,
                ccStatus: localFilters.ccStatus === 'Active' ? 'Active' : 'Closed'
            };

            dispatch(fetchCostCentersByTypeByRole(params));
        }
    }, [dispatch, localFilters.reportType, localFilters.costCenterType, localFilters.subType, localFilters.ccStatus, roleId, uid]);

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setLocalFilters(prev => {
            const newFilters = {
                ...prev,
                [filterName]: value
            };

            // Reset dependent fields
            if (filterName === 'reportType') {
                dispatch(setReportType(value));
                // Reset other fields when report type changes
                newFilters.subType = '';
                newFilters.costCenter = '';
                newFilters.ccStatus = '';
            }

            if (filterName === 'subType' || filterName === 'ccStatus') {
                newFilters.costCenter = '';
            }

            return newFilters;
        });
        
        // Reset report data when filters change
        dispatch(resetSelectedCCData());
    };

    // Handle date changes - convert Date objects to strings before storing
    const handleDateChange = (filterName, dateValue) => {
        const dateString = convertDateToString(dateValue);
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: dateString
        }));
        
        // Reset report data when filters change
        dispatch(resetSelectedCCData());
    };

    // Helper function to get default dates for API when user doesn't select dates
    const getAPIDateWithDefaults = (dateString, isFromDate = false) => {
        if (dateString && dateString.trim() !== '') {
            return dateString;
        }
        
        if (isFromDate) {
            // Default from date: April 1st, 1900
            return '1900-04-01';
        } else {
            // Default to date: Today
            return new Date().toISOString().split('T')[0];
        }
    };

    // Handle view button click
    const handleView = async () => {
        // Validation based on report type
        if (localFilters.reportType === 'Detail') {
            if (!localFilters.costCenter) {
                alert('Please select a Cost Center');
                return;
            }
        } else if (localFilters.reportType === 'Summary') {
            if (!localFilters.ccStatus) {
                alert('Please select CC Status');
                return;
            }
        }

        try {
            // Update Redux filters - ensure dates are strings but don't set defaults here
            const updatedFilters = {
                ...localFilters,
                roleId,
                fromDate: localFilters.fromDate || '', // Keep as empty string for UI state
                toDate: localFilters.toDate || ''      // Keep as empty string for UI state
            };
            dispatch(setFilters(updatedFilters));
            
            if (localFilters.reportType === 'Summary') {
                // Fetch liquidity status report for Summary view
                const liquidityParams = {
                    ccStatus: localFilters.ccStatus,
                    fromDate: getAPIDateWithDefaults(localFilters.fromDate, true),  // Default to 1900-04-01
                    toDate: getAPIDateWithDefaults(localFilters.toDate, false)      // Default to today
                };
                await dispatch(fetchLiquidityStatusReport(liquidityParams)).unwrap();
            } else {
                // Fetch accrued interest report (detail view)
                const params = {
                    ccCode: localFilters.costCenter,
                    fromDate: getAPIDateWithDefaults(localFilters.fromDate, true),  // Default to 1900-04-01
                    toDate: getAPIDateWithDefaults(localFilters.toDate, false)      // Default to today
                };
                await dispatch(fetchAccruedInterestReport(params)).unwrap();
            }

        } catch (error) {
            console.error('❌ Error fetching report data:', error);
            alert('Failed to fetch report data. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            reportType: canShowSummaryReport ? 'Detail' : 'Detail',
            costCenterType: 'Performing',
            subType: '',
            ccStatus: '',
            costCenter: '',
            fromDate: '', // Reset as empty string
            toDate: ''    // Reset as empty string
        });
        dispatch(clearFilters());
        dispatch(resetReportData());
        if (roleId) {
            dispatch(setFilters({ roleId }));
        }
    };

    // Handle clickable amount in the main grid
    const handleAmountClick = async (ccCode, date, type, amount) => {
        if (amount <= 0) return; // Don't open modal for zero amounts
        
        try {
            // Open modal with loading state
            dispatch(openModal({ 
                date, 
                ccCode, 
                type, 
                amount 
            }));

            // Fetch drill-down data
            const params = {
                ccCode,
                date,
                type
            };
            
            await dispatch(fetchAccruedInterestReportSummary(params)).unwrap();
            
        } catch (error) {
            console.error('❌ Error fetching transaction details:', error);
            dispatch(closeModal());
            alert('Failed to load transaction details');
        }
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            if (!Array.isArray(currentReportData) || currentReportData.length === 0) {
                alert('No data available to download');
                return;
            }

            const excelData = currentReportData.map(item => {
                if (localFilters.reportType === 'Summary') {
                    // Summary Report columns
                    return {
                        'Cost Center': item.CC || item.CCCode || item.cc || '-',
                        'Date': item.date || item.Date,
                        'Cumulative Received': item.cumrec || item.CumulativeReceived || 0,
                        'Cumulative Net Paid Amount': item.cumpaid || item.CumulativePaid || 0,
                        'Cumulative Paid Amount': item.Cupaidamount || item.CumulativePaidAmount || 0,
                        'Net Cash Status': item.cashstatus || item.CashStatus || 0,
                        'Accumulated Interest': item.NewAccumulatedInterst || item.AccumulatedInterest || 0
                    };
                } else {
                    // Detail Report columns
                    return {
                        'Date': item.date || item.Date,
                        'Net Received Amount': item.netrecieved || item.NetReceived || 0,
                        'Cumulative Received': item.cumrec || item.CumulativeReceived || 0,
                        'Net Paid Amount': item.netpaid || item.NetPaid || 0,
                        'Cumulative Net Paid Amount': item.cumpaid || item.CumulativePaid || 0,
                        'Paid Amount': item.paidAmount || item.PaidAmount || 0,
                        'Cumulative Paid Amount': item.Cupaidamount || item.CumulativePaidAmount || 0,
                        'Net Cash Status': item.cashstatus || item.CashStatus || 0,
                        'Interest On (-Ve) Cash Flow': item.incf || item.Interest || 0,
                        'Accumulated Interest': item.NewAccumulatedInterst || item.AccumulatedInterest || 0
                    };
                }
            });

            const filename = `${localFilters.reportType}_Report_${localFilters.reportType === 'Detail' ? localFilters.costCenter : localFilters.ccStatus}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            alert('Excel download failed. Please try again.');
        }
    };

    // Get cash status color class
    const getCashStatusColorClass = (cashStatus) => {
        if (cashStatus >= 0) return 'text-green-600 dark:text-green-400';
        return 'text-red-600 dark:text-red-400';
    };

    // Determine required validation
    const getValidationState = () => {
        if (localFilters.reportType === 'Summary') {
            return localFilters.ccStatus; // Only CC Status required
        } else {
            return localFilters.costCenter && localFilters.ccStatus && localFilters.subType; // All required for Detail
        }
    };

    // Calculate summary totals for Summary reports
    const calculateSummaryTotals = () => {
        if (!Array.isArray(currentReportData) || currentReportData.length === 0 || localFilters.reportType !== 'Summary') {
            return null;
        }

        const totals = currentReportData.reduce((acc, item) => {
            acc.totalCumulativeReceived += parseFloat(item.cumrec || item.CumulativeReceived || 0);
            acc.totalCumulativeNetPaid += parseFloat(item.cumpaid || item.CumulativePaid || 0);
            acc.totalCumulativePaidAmount += parseFloat(item.Cupaidamount || item.CumulativePaidAmount || 0);
            acc.totalNetCashStatus += parseFloat(item.cashstatus || item.CashStatus || 0);
            acc.totalAccumulatedInterest += parseFloat(item.NewAccumulatedInterest || item.AccumulatedInterest || 0);
            return acc;
        }, {
            totalCumulativeReceived: 0,
            totalCumulativeNetPaid: 0,
            totalCumulativePaidAmount: 0,
            totalNetCashStatus: 0,
            totalAccumulatedInterest: 0
        });

        return {
            totalNetReceived: totals.totalCumulativeReceived,
            totalNetPaid: totals.totalCumulativeNetPaid,
            finalCashStatus: totals.totalNetCashStatus,
            totalAccumulatedInterest: totals.totalAccumulatedInterest,
            hasNegativeCashFlow: totals.totalNetCashStatus < 0,
            totalCumulativePaidAmount: totals.totalCumulativePaidAmount
        };
    };

    // Get the appropriate summary data
    const getSummaryData = () => {
        if (localFilters.reportType === 'Summary') {
            return calculateSummaryTotals();
        }
        return reportSummary;
    };

    // Check if any loading is happening
    const isLoading = currentReportLoading || loading.costCentersByTypeByRole;

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Activity className="h-8 w-8 text-indigo-600" />
                            Summary Report of Liquidity Status And Accrued Interest
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Monitor cash flow, liquidity status, and accrued interest calculations with detailed transaction breakdowns
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Financial Reports
                        </div>
                        {roleId && (
                            <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                                Role: {roleId}
                            </div>
                        )}
                        {canShowSummaryReport && (
                            <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-800 dark:text-green-200 text-sm rounded-full transition-colors">
                                Summary Access
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Report Type - Only for Role 100 */}
                    {canShowSummaryReport && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Report Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.reportType}
                                onChange={(e) => handleFilterChange('reportType', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                            >
                                <option value="Detail">Detail Report</option>
                                <option value="Summary">Summary Report</option>
                            </select>
                        </div>
                    )}

                    {/* Show different fields based on report type */}
                    {localFilters.reportType === 'Detail' ? (
                        <>
                            {/* Sub Type - Required for Detail Report */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Sub Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={localFilters.subType}
                                    onChange={(e) => handleFilterChange('subType', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                                >
                                    <option value="">Select Sub Type</option>
                                    {subTypeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Cost Center Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    CC Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={localFilters.ccStatus}
                                    onChange={(e) => handleFilterChange('ccStatus', e.target.value)}
                                    disabled={!localFilters.subType}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <option value="">Select Status</option>
                                    {costCenterStatusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Cost Center */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Cost Center <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={localFilters.costCenter}
                                    onChange={(e) => handleFilterChange('costCenter', e.target.value)}
                                    disabled={!localFilters.ccStatus || loading.costCentersByTypeByRole}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <option value="">Select Cost Center</option>
                                    {costCentersByTypeByRole?.Data && Array.isArray(costCentersByTypeByRole.Data) && costCentersByTypeByRole.Data.map((cc, index) => {
                                        const ccCode = cc?.CC_Code || cc?.ccCode || cc?.code || cc?.CCCode;
                                        const ccName = cc?.CC_Name || cc?.ccName || cc?.name || cc?.CCName;
                                        
                                        if (!ccCode) return null;
                                        
                                        return (
                                            <option key={cc?.CC_Id || cc?.id || cc?.CCId || index} value={ccCode}>
                                                {ccCode} - {ccName || 'Unknown Name'}
                                            </option>
                                        );
                                    })}
                                </select>
                                
                                {loading.costCentersByTypeByRole && (
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                        Loading cost centers...
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Summary Report - Only show CC Status */
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                CC Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.ccStatus}
                                onChange={(e) => handleFilterChange('ccStatus', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                            >
                                <option value="">Select Status</option>
                                {costCenterStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* From Date - Optional for both types */}
                    <div>
                        <CustomDatePicker
                            label="From Date"
                            placeholder="Select from date"
                            value={formatDateForDisplay(localFilters.fromDate)} // Convert string back to Date for display
                            onChange={(date) => handleDateChange('fromDate', date)} // Use special handler
                            maxDate={formatDateForDisplay(localFilters.toDate) || new Date()}
                            size="md"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Leave empty to include data from April 1900 (system start date)
                        </p>
                    </div>

                    {/* To Date - Optional for both types */}
                    <div>
                        <CustomDatePicker
                            label="To Date"
                            placeholder="Select to date"
                            value={formatDateForDisplay(localFilters.toDate)} // Convert string back to Date for display
                            onChange={(date) => handleDateChange('toDate', date)} // Use special handler
                            minDate={formatDateForDisplay(localFilters.fromDate)}
                            maxDate={new Date()}
                            size="md"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Leave empty to include data up to today
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isLoading || !getValidationState()}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? (
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
                        <Tooltip content="Download report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(currentReportData) || currentReportData.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Download className="h-5 w-5" />
                                Excel
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Report Summary Cards */}
            {getSummaryData() && (
                <ReportSummaryCards reportSummary={getSummaryData()} reportType={localFilters.reportType} />
            )}

            {/* Accrued Interest Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(currentReportData) && currentReportData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    {localFilters.reportType === 'Summary' ? (
                                        /* Summary Report Columns */
                                        <>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Cost Center</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Cumulative Received</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Cumulative Net Paid Amount</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Cumulative Paid Amount</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Net Cash Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Accumulated Interest</th>
                                        </>
                                    ) : (
                                        /* Detail Report Columns */
                                        <>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Net Received Amount</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Cumulative Received</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Net Paid Amount</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Cumulative Net Paid Amount</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Paid Amount</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Cumulative Paid Amount</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Net Cash Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Interest On (-Ve) Cash Flow</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Accumulated Interest</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {currentReportData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        {localFilters.reportType === 'Summary' ? (
                                            /* Summary Report Row */
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                                    {item.CC || item.CCCode || item.cc || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {item.date || item.Date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                                    {formatCurrency(item.cumrec || item.CumulativeReceived || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                                    {formatCurrency(item.cumpaid || item.CumulativePaid || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                                    {formatCurrency(item.Cupaidamount || item.CumulativePaidAmount || 0)}
                                                </td>
                                                <td className={clsx(
                                                    "px-6 py-4 whitespace-nowrap text-sm text-right font-bold",
                                                    getCashStatusColorClass(item.cashstatus || item.CashStatus || 0)
                                                )}>
                                                    {formatCurrency(item.cashstatus || item.CashStatus || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                                    {formatCurrency(item.NewAccumulatedInterest || item.AccumulatedInterest || 0)}
                                                </td>
                                            </>
                                        ) : (
                                            /* Detail Report Row */
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {item.date || item.Date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                                    {(item.netrecieved || item.NetReceived || 0) > 0 ? (
                                                        <button
                                                            onClick={() => handleAmountClick(
                                                                localFilters.costCenter,
                                                                item.date || item.Date,
                                                                '2',
                                                                item.netrecieved || item.NetReceived
                                                            )}
                                                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline cursor-pointer transition-colors font-medium"
                                                        >
                                                            {formatCurrency(item.netrecieved || item.NetReceived || 0)}
                                                        </button>
                                                    ) : (
                                                        <span className="font-medium">
                                                            {formatCurrency(item.netrecieved || item.NetReceived || 0)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                                    {formatCurrency(item.cumrec || item.CumulativeReceived || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                                    {(item.netpaid || item.NetPaid || 0) > 0 ? (
                                                        <button
                                                            onClick={() => handleAmountClick(
                                                                localFilters.costCenter,
                                                                item.date || item.Date,
                                                                '1',
                                                                item.netpaid || item.NetPaid
                                                            )}
                                                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline cursor-pointer transition-colors font-medium"
                                                        >
                                                            {formatCurrency(item.netpaid || item.NetPaid || 0)}
                                                        </button>
                                                    ) : (
                                                        <span className="font-medium">
                                                            {formatCurrency(item.netpaid || item.NetPaid || 0)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                                    {formatCurrency(item.cumpaid || item.CumulativePaid || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                                    {formatCurrency(item.paidAmount || item.PaidAmount || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                                    {formatCurrency(item.Cupaidamount || item.CumulativePaidAmount || 0)}
                                                </td>
                                                <td className={clsx(
                                                    "px-6 py-4 whitespace-nowrap text-sm text-right font-bold",
                                                    getCashStatusColorClass(item.cashstatus || item.CashStatus || 0)
                                                )}>
                                                    {formatCurrency(item.cashstatus || item.CashStatus || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                                    {formatCurrency(item.incf || item.Interest || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                                    {formatCurrency(item.NewAccumulatedInterst || item.AccumulatedInterest || 0)}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        {/* Empty State */}
                        {!currentReportLoading && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Report Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select your filters and click "View Report" to load {localFilters.reportType.toLowerCase()} report data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {currentReportLoading && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Report Data</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching {localFilters.reportType.toLowerCase()} report information...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Transaction Details Modal */}
            <TransactionDetailsModal
                isOpen={isModalOpen}
                onClose={() => dispatch(closeModal())}
                transactionData={accruedInterestReportSummary}
                loading={loading.accruedInterestReportSummary}
                modalData={modalData}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Enhanced Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Detail Report:</strong> Click on any non-zero "Net Received" or "Net Paid" amounts to view detailed transaction breakdowns<br/>
                            2. Date range is optional - if not selected, system defaults to April 1900 through today<br/>
                            3. <strong>Summary Report:</strong> Shows Cost Center-wise data with totals in summary cards<br/>
                            4. Export functionality matches the displayed columns for each report type<br/>
                            {canShowSummaryReport && (
                                <>
                                    <strong>5. Role 100 users can access both Detail and Summary reports</strong><br/>
                                    <strong>6. Summary Report:</strong> Requires only CC Status, shows multiple cost centers with aggregated totals<br/>
                                    <strong>7. Detail Report:</strong> Requires Sub Type, CC Status, and Cost Center selection for single CC analysis<br/>
                                    <strong>8. Summary Report columns:</strong> Cost Center, Date, Cumulative Received, Cumulative Net Paid Amount, Cumulative Paid Amount, Net Cash Status, Accumulated Interest<br/>
                                    <strong>9. Detail Report columns:</strong> Date, Net Received Amount, Cumulative Received, Net Paid Amount, Cumulative Net Paid Amount, Paid Amount, Cumulative Paid Amount, Net Cash Status, Interest On (-Ve) Cash Flow, Accumulated Interest<br/>
                                </>
                            )}
                            <strong>Cost Center Type is fixed to "Performing" as per business requirements.</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {(currentReportError || Object.values(errors).some(error => error)) && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                        <span className="text-red-800 dark:text-red-200 text-sm">
                            {currentReportError || Object.values(errors).find(error => error)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccruedInterestReport;