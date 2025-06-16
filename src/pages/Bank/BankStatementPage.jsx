import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    Building2,
    CreditCard,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    Calendar,
    ArrowRightLeft,
    TrendingUp,
    TrendingDown,
    DollarSign,
    X,
    Filter,
    RefreshCw,
    ChevronRight,
    Activity,
    Banknote,
    BanknoteArrowDown,
    BanknoteArrowUp
    
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchAllBankDetails,
    fetchTransactionTypes,
    fetchBankStatementGrid,
    fetchBankTranDetails,
    setFilters,
    clearFilters,
    resetBankStatementData,
    resetSelectedBankData,
    clearError,
    selectAllBankDetails,
    selectTransactionTypes,
    selectBankStatementGrid,
    selectBankTranDetails,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectHasAnyError
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

// Modal Component for Transaction Details
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
const TransactionDetailsModal = ({ isOpen, onClose, transactionData, loading }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const transactions = Array.isArray(transactionData?.Data) ? transactionData.Data : 
                       Array.isArray(transactionData) ? transactionData : [];

    const columns = [
        { 
            key: 'Date',
            fallbackKeys: ['TransactionDate', 'date'],
            label: 'Transaction Date' 
        },
        { 
            key: 'Details', 
            fallbackKeys: ['Bank Name', 'Name','CC Code',''],
            label: 'Description' },
        { 
            key: 'Remarks', 
            fallbackKeys: ['Remarks', 'Description', 'Dca Code','Loan Number'],
            label: 'Remarks' },
        { 
            key: 'Amount', 
            fallbackKeys: ['Debit Amount', 'Credit Amount'],
            label: 'Amount', align: 'right' },
        { 
            key: 'Tran Number', 
            fallbackKeys: ['TranNo', 'ReferenceNo', 'Transaction No'],
            label: 'Reference No' }
    ];

    const getCellValue = (data, column) => {
        let value = data[column.key];
        if ((value === undefined || value === null) && column.fallbackKeys) {
        for (const fallbackKey of column.fallbackKeys) {
            if (data[fallbackKey] !== undefined && data[fallbackKey] !== null) {
                value = data[fallbackKey];
                break;
            }
        }
    }
    if (value !== undefined && value !== null) {
        if (column.format === 'currency') {
            return formatCurrency(value);
        }
        return value;
    }
    
    return '-';
};

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bank Transaction Details" size="full">
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <RotateCcw className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                    <p className="text-indigo-700 dark:text-indigo-300">Loading transaction details...</p>
                </div>
            ) : (
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
                                            {getCellValue(transaction, column)}
                                        </td>
                                    ))}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No transaction details available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </Modal>
    );
};

// Summary Cards Component
const SummaryCards = ({ bankStatementData }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!bankStatementData || !Array.isArray(bankStatementData.Data) || bankStatementData.Data.length === 0) {
        return null;
    }

    // Calculate summary from bank statement data
    const summary = bankStatementData.Data.reduce((acc, item) => {
        acc.totalDebit += parseFloat(item.WithDraw || 0);
        acc.totalCredit += parseFloat(item.Deposit || 0);
        acc.transactionCount += 1;
        if (item.Balance) {
            acc.closingBalance = parseFloat(item.Balance || 0);
        }
        return acc;
    }, {
        totalDebit: 0,
        totalCredit: 0,
        transactionCount: 0,
        closingBalance: 0
    });

    const netFlow = summary.totalCredit - summary.totalDebit;

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
            title: 'Net Cash Flow',
            value: netFlow,
            icon: netFlow >= 0 ? BanknoteArrowUp : BanknoteArrowDown,
            color: netFlow >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600',
            bgColor: netFlow >= 0 
                ? 'from-green-50 to-green-50 dark:from-green-900/20 dark:to-green-900/20'
                : 'from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20'
        },
        {
            title: 'Closing Balance',
            value: summary.closingBalance,
            icon: Banknote,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20'
        },
        {
            title: 'Total Transactions',
            value: summary.transactionCount,
            icon: ArrowRightLeft,
            color: 'from-purple-500 to-indigo-600',
            bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
            isCount: true
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
                                {card.isCount ? card.value : formatCurrency(card.value)}
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

const BankStatementPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const allBankDetails = useSelector(selectAllBankDetails);
    const transactionTypes = useSelector(selectTransactionTypes);
    const bankStatementGrid = useSelector(selectBankStatementGrid);
    const bankTranDetails = useSelector(selectBankTranDetails);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        bankVal: '',
        fromDate: '',
        toDate: '',
        tranType: ''
    });

    // Modal state
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);

    // Load initial data
    useEffect(() => {
        dispatch(fetchAllBankDetails());
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
        
        // Reset data when filters change
        dispatch(resetSelectedBankData());
    };

    // Handle date changes
    const handleDateChange = (filterName, dateValue) => {
        const dateString = convertDateToString(dateValue);
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: dateString
        }));
        
        dispatch(resetSelectedBankData());
    };

    // Handle view button click
    const handleView = async () => {
        // Validation
        if (!localFilters.bankVal) {
            toast.warning('Please select a bank');
            return;
        }

        if (!localFilters.fromDate || !localFilters.toDate) {
            toast.warning('Please select both from and to dates');
            return;
        }

        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));
            
            // Fetch bank statement grid
            const params = {
                bankVal: localFilters.bankVal,
                fromDate: localFilters.fromDate,
                toDate: localFilters.toDate,
                tranType: localFilters.tranType || ''
            };
            
            await dispatch(fetchBankStatementGrid(params)).unwrap();
            toast.success('Bank statement loaded successfully');
            
        } catch (error) {
            console.error('❌ Error fetching bank statement:', error);
            toast.error('Failed to fetch bank statement. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            bankVal: '',
            fromDate: '',
            toDate: '',
            tranType: ''
        });
        dispatch(clearFilters());
        dispatch(resetBankStatementData());
    };

    // Handle row click to view transaction details
    const handleRowClick = async (rowData) => {
        try {
            setSelectedRowData(rowData);
            setIsDetailsModalOpen(true);
            
            // Fetch transaction details using reference number and transaction type ID
            const params = {
                transId: rowData.TranNo || rowData.ReferenceNo || '', // ✅ Use 'transId' (matches API)
                typeId: rowData.Type || rowData.PaymentTypeId || rowData.TransactionTypeId || '', // ✅ Use 'typeId' and correct field names
            };
            
            await dispatch(fetchBankTranDetails(params)).unwrap();
            
        } catch (error) {
            console.error('❌ Error fetching transaction details:', error);
            toast.error('Failed to load transaction details');
            setIsDetailsModalOpen(false);
        }
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = bankStatementGrid?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Transaction Date': item.Date || item.TransactionDate || '-',
                'Description': item.Name || '-',
                'Transaction Type': item.PaymentTypeName || item.TransactionType || '-',
                'Debit Amount': item.WithDraw || 0,
                'Credit Amount': item.Deposit || 0,
                'Balance': item.Balance || 0,
                'Reference No': item.TranNo || item.ReferenceNo || '-'
            }));

            const filename = `Bank_Statement_${localFilters.bankVal}_${localFilters.fromDate}_to_${localFilters.toDate}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get bank statement data for display
    const bankStatementData = bankStatementGrid?.Data || [];

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <CreditCard className="h-8 w-8 text-indigo-600" />
                            Bank Statement Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View and analyze bank statements with detailed transaction breakdowns
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Financial Reports
                        </div>
                        {loading.bankStatementGrid && (
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
                        <span>Bank and Cash</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Bank Statement</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Bank Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Bank <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.bankVal}
                            onChange={(e) => handleFilterChange('bankVal', e.target.value)}
                            disabled={loading.allBankDetails}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Bank</option>
                            {Array.isArray(allBankDetails?.Data) && allBankDetails.Data.map((bank, index) => {
                                const bankId = bank?.Bankid || bank?.bankId || bank?.id;
                                const bankName = bank?.BankName || bank?.bankName || bank?.name;
                                
                                if (!bankId) return null;
                                
                                return (
                                    <option key={bankId || index} value={bankId}>
                                        {bankName || `Bank ${bankId}`}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.allBankDetails && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading banks...
                            </p>
                        )}
                    </div>

                    {/* Transaction Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Transaction Type
                        </label>
                        <select
                            value={localFilters.tranType}
                            onChange={(e) => handleFilterChange('tranType', e.target.value)}
                            disabled={loading.transactionTypes}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Transaction Types</option>
                            {Array.isArray(transactionTypes?.Data) && transactionTypes.Data.map((type, index) => {
                                const typeId = type?.Tranid || type?.typeId || type?.id;
                                const typeName = type?.TranVal || type?.typeName || type?.name;
                                
                                if (!typeId) return null;
                                
                                return (
                                    <option key={typeId || index} value={typeId}>
                                        {typeName || `Type ${typeId}`}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.transactionTypes && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading transaction types...
                            </p>
                        )}
                    </div>

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
                            disabled={isAnyLoading || !localFilters.bankVal || !localFilters.fromDate || !localFilters.toDate}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.bankStatementGrid ? (
                                <RotateCcw className="h-5 w-5 animate-spin" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                            View Statement
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
                        <Tooltip content="Download bank statement as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(bankStatementData) || bankStatementData.length === 0}
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
            <SummaryCards bankStatementData={bankStatementGrid} />

            {/* Bank Statement Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(bankStatementData) && bankStatementData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Transaction Type</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Debit Amount</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Credit Amount</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Balance</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Transaction No</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {bankStatementData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.Date || item.TransactionDate || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.Name}>
                                                {item.Name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.PaymentTypeName || item.TransactionType || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            <span className="text-red-600 dark:text-red-400">
                                                {formatCurrency(item.WithDraw || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            <span className="text-green-600 dark:text-green-400">
                                                {formatCurrency(item.Deposit || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                            {formatCurrency(item.Balance || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.TranNo || item.ReferenceNo || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleRowClick(item)}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
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
                        {!loading.bankStatementGrid && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Bank Statement Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select your bank, date range, and optional transaction type, then click "View Statement" to load your bank statement data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.bankStatementGrid && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Bank Statement</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching bank statement data for the selected period...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Transaction Details Modal */}
            <TransactionDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                transactionData={bankTranDetails}
                loading={loading.bankTranDetails}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Bank Statement Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Bank Selection:</strong> Choose from available banks in your system<br/>
                            2. <strong>Date Range:</strong> Both from and to dates are required for statement generation<br/>
                            3. <strong>Transaction Type:</strong> Optional filter to view specific transaction types<br/>
                            4. <strong>Click Actions:</strong> Click the eye icon on any row to view detailed transaction information<br/>
                            5. <strong>Summary Cards:</strong> View total debits, credits, net cash flow, closing balance, and transaction count<br/>
                            6. <strong>Export:</strong> Download bank statement data as Excel file for offline analysis<br/>
                            7. <strong>Real-time Loading:</strong> Visual feedback during data fetching operations<br/>
                            8. <strong>Error Handling:</strong> Toast notifications for errors with automatic error clearing
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

// Named export
export { BankStatementPage };

// Default export  
export default BankStatementPage;