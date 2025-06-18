import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    Activity,
    ArrowRightLeft,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    X,
    Filter,
    RefreshCw,
    ChevronRight,
    Banknote,
    Receipt,
    FileText,
    Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import transaction log slice actions and selectors
import {
    fetchTransactionLogReport,
    setFilters,
    clearFilters,
    resetAllTransactionData,
    clearError,
    selectTransactionLogReport,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading
} from '../../slices/financialReportSlice/transactionLogSlice';

// Import transaction types from bank statement slice
import {
    fetchTransactionTypes,
    selectTransactionTypes,
    selectTransactionTypesLoading
} from '../../slices/bankSlice/bankStatementSlice';

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

// Summary Cards Component
const SummaryCards = ({ transactionLogData }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!transactionLogData || !Array.isArray(transactionLogData) || transactionLogData.length === 0) {
        return null;
    }

    // Calculate summary from transaction log data
    const summary = transactionLogData.reduce((acc, item) => {
        const debitAmount = parseFloat(item.DebitValue || item.Debit || 0);
        const creditAmount = parseFloat(item.CreditValue || item.Credit || 0);
        
        acc.totalDebit += debitAmount;
        acc.totalCredit += creditAmount;
        acc.transactionCount += 1;
        
        // Count by voucher type
        const voucherType = item.VoucherType || item.TranType || item.TransactionType || 'Unknown';
        acc.typeCount[voucherType] = (acc.typeCount[voucherType] || 0) + 1;
        
        return acc;
    }, {
        totalDebit: 0,
        totalCredit: 0,
        transactionCount: 0,
        typeCount: {}
    });

    // Get top voucher type
    const topVoucherType = Object.keys(summary.typeCount).reduce((a, b) => 
        summary.typeCount[a] > summary.typeCount[b] ? a : b, 'N/A'
    );

    // Net amount (Credit - Debit)
    const netAmount = summary.totalCredit - summary.totalDebit;

    const cards = [
        {
            title: 'Total Debit',
            value: summary.totalDebit,
            icon: TrendingDown,
            color: 'from-red-500 to-pink-600',
            bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
        },
        {
            title: 'Total Credit',
            value: summary.totalCredit,
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Net Amount',
            value: netAmount,
            icon: netAmount >= 0 ? TrendingUp : TrendingDown,
            color: netAmount >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-pink-600',
            bgColor: netAmount >= 0 
                ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                : 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
        },
        {
            title: 'Total Transactions',
            value: summary.transactionCount,
            icon: ArrowRightLeft,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            isCount: true
        },
        {
            title: 'Top Voucher Type',
            value: topVoucherType,
            icon: Receipt,
            color: 'from-purple-500 to-indigo-600',
            bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
            isText: true
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
                            <p className="text-1xl font-bold text-gray-900 dark:text-white">
                                {card.isCount || card.isText ? card.value : formatCurrency(card.value)}
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

const TransactionLogPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const transactionLogReport = useSelector(selectTransactionLogReport);
    const transactionTypes = useSelector(selectTransactionTypes);
    const loading = useSelector(selectLoading);
    const transactionTypesLoading = useSelector(selectTransactionTypesLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        fromDate: '',
        toDate: '',
        tranType: ''
    });

    // Load initial data
    useEffect(() => {
        dispatch(fetchTransactionTypes());
    }, [dispatch]);

    // Sync local filters with Redux filters
    useEffect(() => {
        setLocalFilters(filters);
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

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

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
        if (!localFilters.fromDate || !localFilters.toDate) {
            toast.warning('Please select both from and to dates');
            return;
        }

        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));
            
            // Fetch transaction log report
            const params = {
                fromDate: localFilters.fromDate,
                toDate: localFilters.toDate,
                tranType: localFilters.tranType || ''
            };
            
            await dispatch(fetchTransactionLogReport(params)).unwrap();
            toast.success('Transaction log loaded successfully');
            
        } catch (error) {
            console.error('❌ Error fetching transaction log:', error);
            toast.error('Failed to fetch transaction log. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            fromDate: '',
            toDate: '',
            tranType: ''
        });
        dispatch(clearFilters());
        dispatch(resetAllTransactionData());
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = Array.isArray(transactionLogReport?.Data) ? transactionLogReport.Data : 
                        Array.isArray(transactionLogReport) ? transactionLogReport : [];
            
            if (data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Entry Date': item.EntryDate || item.Date || item.TransactionDate || '-',
                'Voucher Date': item.VoucherDate || item.Date || '-',
                'Name of Account': item.NameofAccount || item.AccountName || item.Description || item.Name || '-',
                'Voucher Type': item.VoucherType || item.TranType || item.TransactionType || '-',
                'Voucher No': item.VoucherNo || item.ReferenceNo || item.TranNo || '-',
                'Debit Value': item.DebitValue || item.Debit || 0,
                'Credit Value': item.CreditValue || item.Credit || 0,
                'Status': item.Status || 'Approved'
            }));

            const filename = `Transaction_Log_${localFilters.fromDate}_to_${localFilters.toDate}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get transaction log data for display
    const transactionLogData = Array.isArray(transactionLogReport?.Data) ? transactionLogReport.Data : 
                              Array.isArray(transactionLogReport) ? transactionLogReport : [];

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Activity className="h-8 w-8 text-indigo-600" />
                            Transaction Log Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View and analyze transaction logs with detailed filtering options
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Transaction Reports
                        </div>
                        {loading.transactionLogReport && (
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
                        <span className="text-gray-900 dark:text-white">Transaction Log</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

                    {/* Transaction Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Transaction Type
                        </label>
                        <select
                            value={localFilters.tranType}
                            onChange={(e) => handleFilterChange('tranType', e.target.value)}
                            disabled={transactionTypesLoading}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select All Transaction Types</option>
                            {Array.isArray(transactionTypes?.Data) && transactionTypes.Data.map((type, index) => {
                                const typeId = type?.TranVal || type?.typeId || type?.id;
                                const typeName = type?.TranVal || type?.typeName || type?.name;
                                
                                if (!typeId) return null;
                                
                                return (
                                    <option key={typeId || index} value={typeId}>
                                        {typeName || `Type ${typeId}`}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {transactionTypesLoading && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading transaction types...
                            </p>
                        )}
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
                            {loading.transactionLogReport ? (
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
                        <Tooltip content="Download transaction log as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(transactionLogData) || transactionLogData.length === 0}
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
            <SummaryCards transactionLogData={transactionLogData} />

            {/* Transaction Log Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(transactionLogData) && transactionLogData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Entry Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Voucher Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Name of Account</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Voucher Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Voucher No</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Debit Value</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Credit Value</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {transactionLogData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.EntryDate || item.Date || item.TransactionDate || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.VoucherDate || item.Date || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.NameofAccount || item.AccountName || item.Description || item.Name}>
                                                {item.NameofAccount || item.AccountName || item.Description || item.Name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <span className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                                                {item.VoucherType || item.TranType || item.TransactionType || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.VoucherNo || item.ReferenceNo || item.TranNo || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            <span className="text-red-600 dark:text-red-400">
                                                {formatCurrency(item.DebitValue || item.Debit || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            <span className="text-green-600 dark:text-green-400">
                                                {formatCurrency(item.CreditValue || item.Credit || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={clsx(
                                                "px-2 py-1 text-xs font-medium rounded-full",
                                                (item.Status || 'Approved').toLowerCase() === 'approved' 
                                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                            )}>
                                                {item.Status || 'Approved'}
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
                        {!loading.transactionLogReport && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Transaction Log Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select your date range and optional transaction type, then click "View Report" to load your transaction log data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.transactionLogReport && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Transaction Log</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching transaction log data for the selected period...
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
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Transaction Log Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Date Range:</strong> Both from and to dates are required for report generation<br/>
                            2. <strong>Transaction Type:</strong> Optional filter to view specific transaction types<br/>
                            3. <strong>Summary Cards:</strong> View total amount, transaction count, and transaction type breakdown<br/>
                            4. <strong>Export:</strong> Download transaction log data as Excel file for offline analysis<br/>
                            5. <strong>Real-time Loading:</strong> Visual feedback during data fetching operations<br/>
                            6. <strong>Error Handling:</strong> Toast notifications for errors with automatic error clearing<br/>
                            7. <strong>Status Indicators:</strong> Color-coded status badges for easy identification
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



// Default export  
export default TransactionLogPage;