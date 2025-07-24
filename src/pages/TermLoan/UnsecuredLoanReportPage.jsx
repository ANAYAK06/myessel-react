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
    BanknoteArrowUp,
    Receipt,
    Landmark,
    PieChart,
    Target,
    Clock,
    Percent,
    CreditCard as CardIcon,
    Lock,
    Unlock,
    IndianRupee
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchAllUnsecuredLoans,
    fetchUnsecuredLoanYears,
    fetchUnsecuredLoanBanks,
    fetchUnsecuredLoanReportData,
    setFilters,
    clearFilters,
    resetUnsecuredLoanReportData,
    resetLoanYears,
    resetLoanMonths,
    resetLoanBanks,
    clearError,
    clearAllData,
    selectUnsecuredLoans,
    selectLoanYears,
    selectLoanBanks,
    selectUnsecuredLoanReportData,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectHasAnyError
} from '../../slices/termLoanSlice/unsecuredLoanReportSlice';

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

// Enhanced Summary Cards Component with Dynamic Insights
const UnsecuredLoanSummaryCards = ({ loanData, summary }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!Array.isArray(loanData) || loanData.length === 0) {
        return null;
    }

    // Calculate comprehensive statistics from actual data
    const totalRecords = loanData.length;
    
    // Get balances
    const openingAmount = loanData.find(item => item.Type === 'Opening')?.Amount || 0;
    const closingAmount = loanData.find(item => item.Type === 'Closing')?.Amount || 0;
    const transactionTotal = summary.totalTransactionAmount || 0;
    const transactionCount = summary.transactionCount || 0;
    
    // Calculate transaction types
    const basicTransactions = loanData.filter(item => item.Type === 'Basic').length;
    const existingTransactions = loanData.filter(item => item.Type === 'Existing').length;
    
    // Calculate balance change
    const balanceChange = openingAmount - closingAmount;
    const balanceChangePercent = openingAmount > 0 ? ((balanceChange / openingAmount) * 100) : 0;

    const cards = [
        {
            title: 'Opening Balance',
            value: openingAmount,
            icon: BanknoteArrowUp,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            isCount: false,
            subtitle: 'Initial loan amount'
        },
        {
            title: 'Closing Balance',
            value: closingAmount,
            icon: BanknoteArrowDown,
            color: 'from-red-500 to-red-600',
            bgColor: 'from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20',
            isCount: false,
            subtitle: 'Remaining balance'
        },
        {
            title: 'Total Transactions',
            value: transactionTotal,
            icon: Activity,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'from-purple-50 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/20',
            isCount: false,
            subtitle: `${transactionCount} payments made`
        },
        {
            title: 'Balance Reduction',
            value: balanceChange,
            icon: balanceChange > 0 ? TrendingDown : TrendingUp,
            color: balanceChange > 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600',
            bgColor: balanceChange > 0 
                ? 'from-green-50 to-green-50 dark:from-green-900/20 dark:to-green-900/20'
                : 'from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20',
            isCount: false,
            subtitle: `${balanceChangePercent.toFixed(1)}% ${balanceChange > 0 ? 'reduction' : 'increase'}`
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
                                {card.isCount ? card.value : `₹${formatCurrency(Math.abs(card.value))}`}
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

// Enhanced Loan Details Card Component
const UnsecuredLoanDetailsCard = ({ loanData, summary }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getFirstLoanData = () => {
        return Array.isArray(loanData) && loanData.length > 0 ? loanData[0] : {};
    };

    const firstLoan = getFirstLoanData();

    // Calculate totals from opening, transactions, and closing
    const openingAmount = loanData.find(item => item.Type === 'Opening')?.Amount || 0;
    const closingAmount = loanData.find(item => item.Type === 'Closing')?.Amount || 0;
    const transactionTotal = summary.totalTransactionAmount;

    return (
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Loan Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <CardIcon className="h-5 w-5 text-indigo-600 mr-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Loan Details</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <span className="font-medium">Number:</span> {firstLoan.LoanNo || '-'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Type:</span> Unsecured Loan
                    </p>
                </div>

                {/* Opening Balance */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <BanknoteArrowUp className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Opening Balance</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₹{formatCurrency(openingAmount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Starting Amount</p>
                </div>

                {/* Closing Balance */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <BanknoteArrowDown className="h-5 w-5 text-red-600 mr-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Closing Balance</h4>
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ₹{formatCurrency(closingAmount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Remaining Balance</p>
                </div>

                {/* Transaction Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <Activity className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Total Transactions</h4>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        ₹{formatCurrency(transactionTotal)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {summary.transactionCount} transactions made
                    </p>
                </div>
            </div>
        </div>
    );
};

// Individual Unsecured Loan Statement Component
const UnsecuredLoanStatement = ({ loanData, summary }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!Array.isArray(loanData) || loanData.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Transaction History</h3>
                <p className="text-gray-500 dark:text-gray-400">No transactions found for this loan</p>
            </div>
        );
    };

    const getTransactionTypeColor = (type) => {
        switch (type) {
            case 'Opening':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Closing':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'Basic':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
            case 'Existing':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Receipt className="h-5 w-5 mr-2 text-indigo-600" />
                    Unsecured Loan Transaction Statement
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Detailed transaction history for this unsecured loan
                </p>
            </div>

            <div className="overflow-x-auto max-h-[600px]">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Transaction Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Bank Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Mode</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Reference No</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loanData.map((transaction, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {transaction.Date || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {transaction.TransactionDate || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    <div className="max-w-xs truncate font-medium" title={transaction.BankName}>
                                        {transaction.BankName || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    <div className="flex items-center">
                                        <span className="mr-2">{transaction.ModeOfPay || '-'}</span>
                                        {transaction.ModeOfPay === 'RTGS/E-Trans' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Online
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                                    {transaction.TransactionRefno || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.Type)}`}>
                                        {transaction.Type || 'Unknown'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                    <span className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                        ₹{formatCurrency(transaction.Amount || 0)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <td colSpan={6} className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                TOTAL TRANSACTION AMOUNT
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 px-2 py-1 rounded">
                                    ₹{formatCurrency(summary.totalTransactionAmount)}
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
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

// Main Unsecured Loan Report Component
const UnsecuredLoanReportPage = () => {
    const dispatch = useDispatch();

    // Get userData from auth state (includes UID and roleId)
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Redux selectors
    const unsecuredLoans = useSelector(selectUnsecuredLoans);
    const loanYears = useSelector(selectLoanYears);
    const loanBanks = useSelector(selectLoanBanks);
    const unsecuredLoanReportData = useSelector(selectUnsecuredLoanReportData);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Static months array
    const staticMonths = [
        { value: 0, label: 'All Months' },
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        roleId: roleId || '',
        loanNo: '',
        year: '',
        month: 0,
        bankId: ''
    });

    // Load initial data
    useEffect(() => {
        if (roleId) {
            dispatch(fetchAllUnsecuredLoans(roleId));
            setLocalFilters(prev => ({ ...prev, roleId }));
        }
    }, [dispatch, roleId]);

    // Sync local filters with Redux filters
    useEffect(() => {
        setLocalFilters(prev => ({ ...prev, ...filters }));
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
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: value
        }));

        if (filterName === 'loanNo') {
            dispatch(resetLoanYears());
            dispatch(resetLoanMonths());
            dispatch(resetLoanBanks());
            
            if (value && value !== 'SelectAll') {
                dispatch(fetchUnsecuredLoanYears(value));
                // Activate bank dropdown once loan number is selected
                dispatch(fetchUnsecuredLoanBanks(value));
            }
        }

        if (filterName === 'year') {
            dispatch(resetLoanBanks());
            
            // Special logic for "Any Year" selection
            if (value === 'Any') {
                setLocalFilters(prev => ({
                    ...prev,
                    year: 'Any',
                    month: 0, // Lock month to 0 (All Months)
                    bankId: 0  // Lock bank to 0 (All Banks)
                }));
            }
        }

        dispatch(resetUnsecuredLoanReportData());
    };

    // Handle view button click
    const handleView = async () => {
        if (!localFilters.loanNo) {
            toast.warning('Please select a loan number');
            return;
        }

        try {
            dispatch(setFilters(localFilters));

            const params = {
                loanNo: localFilters.loanNo,
                year: localFilters.year || '',
                month: localFilters.month || 0,
                bankId: localFilters.bankId || 0
            };

            console.log('Sending API params:', params); // For debugging

            await dispatch(fetchUnsecuredLoanReportData(params)).unwrap();
            toast.success('Unsecured loan report loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching unsecured loan report:', error);
            toast.error('Failed to fetch unsecured loan report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            roleId: roleId || '',
            loanNo: '',
            year: '',
            month: 0,
            bankId: ''
        });
        dispatch(clearFilters());
        dispatch(clearAllData());
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = unsecuredLoanReportData?.Data?.lstLoanData || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const loanLabel = localFilters.loanNo === 'SelectAll' ? 'All' : localFilters.loanNo || 'All';
            const yearLabel = localFilters.year === 'Any' ? 'Any_Year' : localFilters.year || 'All';
            const monthLabel = localFilters.month === 0 ? 'All_Months' : localFilters.month || 'All';

            const excelData = data.map(item => ({
                'Date': item.Date || '-',
                'Transaction Date': item.TransactionDate || '-',
                'Bank Name': item.BankName || '-',
                'Payment Mode': item.ModeOfPay || '-',
                'Transaction Reference': item.TransactionRefno || '-',
                'Transaction Number': item.TransNo || '-',
                'Type': item.Type || '-',
                'Amount': item.Amount || 0,
                'Loan Number': item.LoanNo || '-'
            }));

            const filename = `Unsecured_Loan_Report_${loanLabel}_${yearLabel}_${monthLabel}_${new Date().toISOString().split('T')[0]}`;

            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Calculate summary for loan view
    const calculateSummary = (data) => {
        if (!Array.isArray(data)) return { totalTransactionAmount: 0, transactionCount: 0 };

        // Filter out Opening and Closing transactions for the summary
        const transactionData = data.filter(item => 
            item.Type !== 'Opening' && item.Type !== 'Closing'
        );

        return transactionData.reduce((acc, item) => {
            acc.totalTransactionAmount += parseFloat(item.Amount || 0);
            acc.transactionCount += 1;
            return acc;
        }, { totalTransactionAmount: 0, transactionCount: 0 });
    };

    // Get loan data for display
    const loanData = unsecuredLoanReportData?.Data?.lstLoanData || [];
    const summary = calculateSummary(loanData);

    // Check if year is locked (Any Year selected)
    const isYearLocked = localFilters.year === 'Any';

    // Render main content
    const renderMainContent = () => {
        if (Array.isArray(loanData) && loanData.length > 0) {
            return (
                <div className="space-y-6">
                    <UnsecuredLoanSummaryCards loanData={loanData} summary={summary} />
                    <UnsecuredLoanDetailsCard loanData={loanData} summary={summary} />
                    <UnsecuredLoanStatement loanData={loanData} summary={summary} />
                </div>
            );
        }

        // Loading states
        if (loading.unsecuredLoanReportData) {
            return (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                            <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Unsecured Loan Report</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Fetching unsecured loan data for the selected criteria...
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        No Loan Data Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                        Select a loan number and other filters to view detailed transaction history
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <CreditCard className="h-8 w-8 text-indigo-600" />
                            Unsecured Loan Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Comprehensive unsecured loan transaction history and analysis with detailed insights
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Loan Management
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
                        <span className="text-gray-900 dark:text-white">Unsecured Loan Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Loan Number Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <CreditCard className="w-4 h-4 inline mr-2" />
                            Unsecured Loan Number <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.loanNo}
                            onChange={(e) => handleFilterChange('loanNo', e.target.value)}
                            disabled={loading.unsecuredLoans}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Loan Number</option>
                            <option value="SelectAll">📊 Select All Loans</option>
                            {Array.isArray(unsecuredLoans?.Data) && unsecuredLoans.Data.map((loan, index) => (
                                <option key={loan?.LoanNo || index} value={loan?.LoanNo}>
                                    🏦 {loan?.LoanNo} - {loan?.Name}
                                </option>
                            ))}
                        </select>

                        {loading.unsecuredLoans && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 flex items-center">
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Loading loan numbers...
                            </p>
                        )}
                    </div>

                    {/* Year Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Year
                        </label>
                        <select
                            value={localFilters.year}
                            onChange={(e) => handleFilterChange('year', e.target.value)}
                            disabled={loading.loanYears || !localFilters.loanNo || localFilters.loanNo === 'SelectAll'}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Year</option>
                            <option value="Any">📅 Any Year</option>
                            {Array.isArray(loanYears?.Data) && loanYears.Data.map((year, index) => (
                                <option key={year?.YearValue || index} value={year?.YearValue}>
                                    {year?.Year}
                                </option>
                            ))}
                        </select>

                        {loading.loanYears && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 flex items-center">
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Loading years...
                            </p>
                        )}
                    </div>

                    {/* Month Selection */}
                    <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Calendar className="w-4 h-4 mr-2" />
                            Month
                            {isYearLocked && (
                                <Tooltip content="Locked because 'Any Year' is selected">
                                    <Lock className="h-4 w-4 ml-2 text-amber-500" />
                                </Tooltip>
                            )}
                        </label>
                        <select
                            value={localFilters.month}
                            onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                            disabled={!localFilters.year || isYearLocked}
                            className={clsx(
                                "w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors",
                                isYearLocked 
                                    ? "border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20" 
                                    : "border-gray-300 dark:border-gray-600",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            {staticMonths.map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>

                        {isYearLocked && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                Locked due to "Any Year" selection
                            </p>
                        )}
                    </div>

                    {/* Bank Selection */}
                    <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Landmark className="w-4 h-4 mr-2" />
                            Bank
                            {isYearLocked && (
                                <Tooltip content="Locked because 'Any Year' is selected">
                                    <Lock className="h-4 w-4 ml-2 text-amber-500" />
                                </Tooltip>
                            )}
                        </label>
                        <select
                            value={localFilters.bankId}
                            onChange={(e) => handleFilterChange('bankId', e.target.value)}
                            disabled={loading.loanBanks || !localFilters.loanNo || localFilters.loanNo === 'SelectAll' || isYearLocked}
                            className={clsx(
                                "w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors",
                                isYearLocked 
                                    ? "border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20" 
                                    : "border-gray-300 dark:border-gray-600",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            <option value="">Select Bank</option>
                            <option value="0">🏦 Select All Banks</option>
                            {Array.isArray(loanBanks?.Data) && loanBanks.Data.map((bank, index) => (
                                <option key={bank?.Bank_Id || index} value={bank?.Bank_Id}>
                                    🏧 {bank?.Bank_Name}
                                </option>
                            ))}
                        </select>

                        {loading.loanBanks && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 flex items-center">
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Loading banks...
                            </p>
                        )}
                        {isYearLocked && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                Locked due to "Any Year" selection
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isAnyLoading || !localFilters.loanNo}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.unsecuredLoanReportData ? (
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
                        <Tooltip content="Download loan report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(loanData) || loanData.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Download className="h-5 w-5" />
                                Excel
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {renderMainContent()}

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Unsecured Loan Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Enhanced Summary:</strong> Comprehensive loan analytics with balance reduction tracking<br />
                            2. <strong>Transaction History:</strong> Detailed transaction records with dates, banks, and payment modes<br />
                            3. <strong>Smart Filtering:</strong> Cascading dropdowns with "Any Year" option that locks dependent filters<br />
                            4. <strong>Transaction Types:</strong> Color-coded transaction types (Opening, Closing, Basic, Existing)<br />
                            5. <strong>Auto-lock Logic:</strong> When "Any Year" is selected, month and bank are automatically set to "All"<br />
                            6. <strong>Visual Insights:</strong> Balance reduction percentage and transaction count analytics<br />
                            7. <strong>Export Capability:</strong> Download complete loan data as Excel for external analysis
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

export default UnsecuredLoanReportPage;