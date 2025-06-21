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
    CreditCard as CardIcon
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchAgencyCodes,
    fetchLoanNumbersByAgency,
    fetchTermLoanReportGrid,
    setFilters,
    clearFilters,
    resetTermLoanReportData,
    resetLoanNumbers,
    clearError,
    clearAllData,
    selectAgencyCodes,
    selectLoanNumbers,
    selectTermLoanReportGrid,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectHasAnyError
} from '../../slices/termLoanSlice/termLoanReportSlice';

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

// Enhanced Loan Details Card Component
const LoanDetailsCard = ({ loanData, summary }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const calculateLoanProgress = () => {
        const totalPaid = summary.totalPrinciple;
        const originalAmount = 1000000; // This should come from loan details API
        return ((totalPaid / originalAmount) * 100).toFixed(1);
    };

    const getFirstLoanData = () => {
        return Array.isArray(loanData) && loanData.length > 0 ? loanData[0] : {};
    };

    const firstLoan = getFirstLoanData();
    const progress = calculateLoanProgress();

    return (
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Agency Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <Building2 className="h-5 w-5 text-indigo-600 mr-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Agency Details</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <span className="font-medium">Code:</span> {firstLoan.AgencyCode || '-'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Name:</span> {firstLoan.AgencyName || '-'}
                    </p>
                </div>

                {/* Loan Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <CardIcon className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Loan Details</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <span className="font-medium">Number:</span> {firstLoan.LoanNo || '-'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Original Amount:</span> ₹{formatCurrency(1000000)}
                    </p>
                </div>

                {/* Outstanding Balance */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <Banknote className="h-5 w-5 text-red-600 mr-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Outstanding</h4>
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ₹{formatCurrency(1000000 - summary.totalPrinciple)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Remaining Balance</p>
                </div>

                {/* Loan Progress */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <Target className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Progress</h4>
                    </div>
                    <div className="mb-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Repaid</span>
                            <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {loanData.length} payments made
                    </p>
                </div>
            </div>
        </div>
    );
};

// Portfolio Summary View Component (for Select All scenarios)
const PortfolioSummaryView = ({ termLoanData }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!termLoanData || !Array.isArray(termLoanData.Data) || termLoanData.Data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Portfolio Data</h3>
                <p className="text-gray-500 dark:text-gray-400">Select filters to view portfolio summary</p>
            </div>
        );
    }

    // Calculate portfolio summary
    const portfolioSummary = termLoanData.Data.reduce((acc, item) => {
        const loanNo = item.LoanNo;
        if (!acc.loans[loanNo]) {
            acc.loans[loanNo] = {
                agencyName: item.AgencyName,
                agencyCode: item.AgencyCode,
                loanNo: item.LoanNo,
                totalPrincipalPaid: 0,
                totalInterestPaid: 0,
                paymentCount: 0,
                lastPaymentDate: item.PaymentDate
            };
            acc.uniqueLoans++;
        }

        acc.loans[loanNo].totalPrincipalPaid += parseFloat(item.Principle || 0);
        acc.loans[loanNo].totalInterestPaid += parseFloat(item.Interest || 0);
        acc.loans[loanNo].paymentCount++;

        acc.totalPrincipalPaid += parseFloat(item.Principle || 0);
        acc.totalInterestPaid += parseFloat(item.Interest || 0);
        acc.totalPayments++;

        return acc;
    }, {
        loans: {},
        uniqueLoans: 0,
        totalPrincipalPaid: 0,
        totalInterestPaid: 0,
        totalPayments: 0
    });

    const estimatedPortfolioValue = portfolioSummary.uniqueLoans * 1000000; // Estimated original loan amounts
    const totalOutstanding = estimatedPortfolioValue - portfolioSummary.totalPrincipalPaid;
    const portfolioProgress = ((portfolioSummary.totalPrincipalPaid / estimatedPortfolioValue) * 100).toFixed(1);

    const summaryCards = [
        {
            title: 'Total Active Loans',
            value: portfolioSummary.uniqueLoans,
            icon: CardIcon,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
            isCount: true
        },
        {
            title: 'Portfolio Value',
            value: estimatedPortfolioValue,
            icon: Landmark,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Total Principal Repaid',
            value: portfolioSummary.totalPrincipalPaid,
            icon: TrendingUp,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        },
        {
            title: 'Total Interest Paid',
            value: portfolioSummary.totalInterestPaid,
            icon: Receipt,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        },
        {
            title: 'Outstanding Balance',
            value: totalOutstanding,
            icon: BanknoteArrowDown,
            color: 'from-red-500 to-pink-600',
            bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
        },
        {
            title: 'Portfolio Progress',
            value: `${portfolioProgress}%`,
            icon: Target,
            color: 'from-purple-500 to-indigo-600',
            bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
            isPercentage: true
        }
    ];

    return (
        <div className="space-y-6">
            {/* Portfolio Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summaryCards.map((card, index) => (
                    <div key={index} className={`bg-gradient-to-r ${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    {card.title}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {card.isCount ? card.value :
                                        card.isPercentage ? card.value :
                                            `₹${formatCurrency(card.value)}`}
                                </p>
                            </div>
                            <div className={`bg-gradient-to-r ${card.color} p-3 rounded-lg`}>
                                <card.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loans Summary Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                        Portfolio Summary by Loan
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Overview of all loans in your portfolio
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Agency</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Loan Number</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Principal Repaid</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Interest Paid</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Payments</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Last Payment</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {Object.values(portfolioSummary.loans).map((loan, index) => {
                                const loanProgress = ((loan.totalPrincipalPaid / 1000000) * 100).toFixed(1);
                                return (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div>
                                                <div className="font-medium">{loan.agencyName}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{loan.agencyCode}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {loan.loanNo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                            <span className="text-indigo-600 dark:text-indigo-400">
                                                ₹{formatCurrency(loan.totalPrincipalPaid)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                            <span className="text-orange-600 dark:text-orange-400">
                                                ₹{formatCurrency(loan.totalInterestPaid)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                {loan.paymentCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {loan.lastPaymentDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                                                        style={{ width: `${loanProgress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-medium text-gray-900 dark:text-white">
                                                    {loanProgress}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Individual Loan Repayment Statement Component
const LoanRepaymentStatement = ({ termLoanData, summary }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!Array.isArray(termLoanData) || termLoanData.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Payment History</h3>
                <p className="text-gray-500 dark:text-gray-400">No payments found for this loan</p>
            </div>
        );
    }

    // Calculate running balance
    let runningBalance = 1000000; // Original loan amount - should come from API
    const paymentsWithBalance = termLoanData.map((payment, index) => {
        const totalPayment = parseFloat(payment.Principle || 0) + parseFloat(payment.Interest || 0);
        runningBalance -= parseFloat(payment.Principle || 0);
        return {
            ...payment,
            totalPayment,
            outstandingBalance: runningBalance
        };
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Receipt className="h-5 w-5 mr-2 text-indigo-600" />
                    Loan Repayment Statement
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Detailed payment history for this loan
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Bank Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Mode</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Reference No</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Principal Paid</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Interest Paid</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Total Payment</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Outstanding Balance</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paymentsWithBalance.map((payment, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {payment.PaymentDate || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {payment.BankName || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    <div className="flex items-center">
                                        <span className="mr-2">{payment.ModeofPay || '-'}</span>
                                        {payment.ModeofPay === 'Cheque' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                                Cheque
                                            </span>
                                        )}
                                        {payment.ModeofPay === 'RTGS/E-transfer' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Online
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                                    {payment.ChequeNo || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                    <span className="text-indigo-600 dark:text-indigo-400">
                                        ₹{formatCurrency(payment.Principle || 0)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                    <span className="text-red-600 dark:text-red-400">
                                        ₹{formatCurrency(payment.Interest || 0)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                    <span className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                        ₹{formatCurrency(payment.totalPayment)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                    <span className="text-orange-600 dark:text-orange-400">
                                        ₹{formatCurrency(payment.outstandingBalance)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                TOTALS
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                <span className="text-indigo-600 dark:text-indigo-400">
                                    ₹{formatCurrency(summary.totalPrinciple)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                <span className="text-red-600 dark:text-red-400">
                                    ₹{formatCurrency(summary.totalInterest)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                <span className="text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                    ₹{formatCurrency(summary.totalPrinciple + summary.totalInterest)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                <span className="text-orange-600 dark:text-orange-400">
                                    ₹{formatCurrency(1000000 - summary.totalPrinciple)}
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

// Main Enhanced Term Loan Report Component
const TermLoanReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const agencyCodes = useSelector(selectAgencyCodes);
    const loanNumbers = useSelector(selectLoanNumbers);
    const termLoanReportGrid = useSelector(selectTermLoanReportGrid);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        agency: '',
        loanNo: '',
        fromDate: '',
        toDate: ''
    });

    // Load initial data
    useEffect(() => {
        dispatch(fetchAgencyCodes());
    }, [dispatch]);

    // Sync local filters with Redux filters
    useEffect(() => {
        setLocalFilters(filters);

        // If agency is SelectAll and loanNo is empty, default to SelectAll
        if (filters.agency === 'SelectAll' && !filters.loanNo) {
            setLocalFilters(prev => ({
                ...prev,
                loanNo: 'SelectAll'
            }));
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

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: value
        }));

        if (filterName === 'agency') {
            dispatch(resetLoanNumbers());

            // Only reset loan number if not selecting 'SelectAll' for agency
            if (value !== 'SelectAll') {
                setLocalFilters(prev => ({
                    ...prev,
                    loanNo: ''
                }));
            } else {
                // When SelectAll agency is selected, default to SelectAll for loan number
                setLocalFilters(prev => ({
                    ...prev,
                    loanNo: 'SelectAll'
                }));
            }

            // Only fetch loan numbers for specific agencies, not for SelectAll
            if (value && value !== 'SelectAll') {
                dispatch(fetchLoanNumbersByAgency(value));
            }
        }

        dispatch(resetTermLoanReportData());
    };


    // Handle date changes
    const handleDateChange = (filterName, dateValue) => {
        const dateString = convertDateToString(dateValue);
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: dateString
        }));

        dispatch(resetTermLoanReportData());
    };

    // Handle view button click
    const handleView = async () => {
        if (!localFilters.agency) {
            toast.warning('Please select an agency');
            return;
        }

        try {
            dispatch(setFilters(localFilters));

            const params = {
                agency: localFilters.agency, // This will be 'SelectAll' or specific agency code
                loanNo: localFilters.loanNo || '', // This will be 'SelectAll', specific loan number, or empty
                fromDate: localFilters.fromDate || '', // Optional - empty if not selected
                toDate: localFilters.toDate || '' // Optional - empty if not selected
            };

            console.log('Sending API params:', params); // For debugging

            await dispatch(fetchTermLoanReportGrid(params)).unwrap();
            toast.success('Term loan report loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching term loan report:', error);
            toast.error('Failed to fetch term loan report. Please try again.');
        }
    };
    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            agency: '',
            loanNo: '',
            fromDate: '',
            toDate: ''
        });
        dispatch(clearFilters());
        dispatch(clearAllData());
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = termLoanReportGrid?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const agencyLabel = localFilters.agency === 'SelectAll' ? 'All' : localFilters.agency;
            const loanLabel = localFilters.loanNo === 'SelectAll' ? 'All' : localFilters.loanNo || 'All';
            const fromDate = localFilters.fromDate || 'All';
            const toDate = localFilters.toDate || 'All';

            let excelData;
            let filename;

            if (isPortfolioView) {
                // Portfolio Excel format
                const portfolioSummary = data.reduce((acc, item) => {
                    const loanNo = item.LoanNo;
                    if (!acc.loans[loanNo]) {
                        acc.loans[loanNo] = {
                            agencyCode: item.AgencyCode,
                            agencyName: item.AgencyName,
                            loanNo: item.LoanNo,
                            totalPrincipalPaid: 0,
                            totalInterestPaid: 0,
                            paymentCount: 0,
                            lastPaymentDate: item.PaymentDate
                        };
                    }
                    acc.loans[loanNo].totalPrincipalPaid += parseFloat(item.Principle || 0);
                    acc.loans[loanNo].totalInterestPaid += parseFloat(item.Interest || 0);
                    acc.loans[loanNo].paymentCount++;
                    return acc;
                }, { loans: {} });

                excelData = Object.values(portfolioSummary.loans).map(loan => ({
                    'Agency Code': loan.agencyCode,
                    'Agency Name': loan.agencyName,
                    'Loan Number': loan.loanNo,
                    'Principal Repaid': loan.totalPrincipalPaid,
                    'Interest Paid': loan.totalInterestPaid,
                    'Total Payments': loan.paymentCount,
                    'Last Payment Date': loan.lastPaymentDate,
                    'Progress %': ((loan.totalPrincipalPaid / 1000000) * 100).toFixed(1)
                }));

                filename = `Term_Loan_Portfolio_Summary_${agencyLabel}_${new Date().toISOString().split('T')[0]}`;
            } else {
                // Individual loan Excel format
                excelData = data.map(item => ({
                    'Payment Date': item.PaymentDate || '-',
                    'Bank Name': item.BankName || '-',
                    'Payment Mode': item.ModeofPay || '-',
                    'Reference Number': item.ChequeNo || '-',
                    'Principal Paid': item.Principle || 0,
                    'Interest Paid': item.Interest || 0,
                    'Total Payment': (parseFloat(item.Principle || 0) + parseFloat(item.Interest || 0))
                }));

                filename = `Term_Loan_Repayment_Statement_${agencyLabel}_${loanLabel}_${fromDate}_to_${toDate}_${new Date().toISOString().split('T')[0]}`;
            }

            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Determine view type based on filters
    const isPortfolioView = localFilters.agency === 'SelectAll' ||
        localFilters.loanNo === 'SelectAll' ||
        (localFilters.agency && !localFilters.loanNo);

    // Calculate summary for individual loan view
    const calculateSummary = (data) => {
        if (!Array.isArray(data)) return { totalPrinciple: 0, totalInterest: 0, transactionCount: 0 };

        return data.reduce((acc, item) => {
            acc.totalPrinciple += parseFloat(item.Principle || 0);
            acc.totalInterest += parseFloat(item.Interest || 0);
            acc.transactionCount += 1;
            return acc;
        }, { totalPrinciple: 0, totalInterest: 0, transactionCount: 0 });
    };

    // Get term loan data for display
    const termLoanData = termLoanReportGrid?.Data || [];
    const summary = calculateSummary(termLoanData);

    // Render main content based on view type
    const renderMainContent = () => {
        if (Array.isArray(termLoanData) && termLoanData.length > 0) {
            if (isPortfolioView) {
                return <PortfolioSummaryView termLoanData={termLoanReportGrid} />;
            } else {
                return (
                    <div className="space-y-6">
                        <LoanDetailsCard loanData={termLoanData} summary={summary} />
                        <LoanRepaymentStatement termLoanData={termLoanData} summary={summary} />
                    </div>
                );
            }
        }

        // Empty/Loading states
        if (loading.termLoanReportGrid) {
            return (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                            <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Term Loan Report</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Fetching term loan data for the selected criteria...
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
                        {isPortfolioView ? 'No Portfolio Data Found' : 'No Loan Data Found'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                        {isPortfolioView
                            ? 'Select filters to view your loan portfolio summary'
                            : 'Select an agency and loan number to view detailed payment history'
                        }
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
                            <Landmark className="h-8 w-8 text-indigo-600" />
                            {isPortfolioView ? 'Term Loan Portfolio' : 'Term Loan Report'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {isPortfolioView
                                ? 'Comprehensive portfolio analysis with multi-loan overview'
                                : 'Detailed loan repayment statement and transaction history'
                            }
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className={`px-4 py-2 bg-gradient-to-r ${isPortfolioView ? 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-800 dark:text-green-200' : 'from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200'} text-sm rounded-full transition-colors`}>
                            {isPortfolioView ? 'Portfolio View' : 'Individual Loan'}
                        </div>
                        {loading.termLoanReportGrid && (
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
                        <span className="text-gray-900 dark:text-white">
                            {isPortfolioView ? 'Portfolio Summary' : 'Term Loan Report'}
                        </span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Agency Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Agency <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.agency}
                            onChange={(e) => handleFilterChange('agency', e.target.value)}
                            disabled={loading.agencyCodes}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Agency</option>
                            <option value="SelectAll">📊 All Agencies (Portfolio View)</option>
                            {Array.isArray(agencyCodes?.Data) && agencyCodes.Data.map((agency, index) => {
                                const agencyCode = agency?.AgencyCode || agency?.Code || agency?.id;
                                const agencyName = agency?.AgencyName || agency?.Name || agency?.name;

                                if (!agencyCode) return null;

                                return (
                                    <option key={agencyCode || index} value={agencyCode}>
                                        {agencyName ? `${agencyCode} - ${agencyName}` : agencyCode}
                                    </option>
                                );
                            })}
                        </select>

                        {loading.agencyCodes && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading agencies...
                            </p>
                        )}
                    </div>

                    {/* Loan Number Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Loan Number
                        </label>
                        <select
                            value={localFilters.loanNo}
                            onChange={(e) => handleFilterChange('loanNo', e.target.value)}
                            disabled={loading.loanNumbers || !localFilters.agency}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Loan Number</option>
                            <option value="SelectAll">📈 All Loans (Summary View)</option>
                            {/* Only show individual loans when a specific agency is selected */}
                            {localFilters.agency && localFilters.agency !== 'SelectAll' && Array.isArray(loanNumbers?.Data) && loanNumbers.Data.map((loan, index) => {
                                const loanNo = loan?.LoanNo || loan?.No || loan?.id;
                                const loanDesc = loan?.LoanDesc || loan?.Desc || loan?.description;

                                if (!loanNo) return null;

                                return (
                                    <option key={loanNo || index} value={loanNo}>
                                        📋 {loanDesc || loanNo}
                                    </option>
                                );
                            })}
                        </select>

                        {loading.loanNumbers && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading loan numbers...
                            </p>
                        )}
                        {localFilters.agency === 'SelectAll' && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                Portfolio view - showing all loans
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
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isAnyLoading || !localFilters.agency}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.termLoanReportGrid ? (
                                <RotateCcw className="h-5 w-5 animate-spin" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                            {isPortfolioView ? 'View Portfolio' : 'View Report'}
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
                        <button
                            onClick={handleExcelDownload}
                            disabled={!Array.isArray(termLoanData) || termLoanData.length === 0}
                            className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <Download className="h-5 w-5" />
                            Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {renderMainContent()}

            {/* Smart Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">
                            {isPortfolioView ? 'Portfolio View Features:' : 'Individual Loan View Features:'}
                        </p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            {isPortfolioView ? (
                                <>
                                    1. <strong>Portfolio Overview:</strong> Total loans, portfolio value, and aggregate performance metrics<br />
                                    2. <strong>Loan Summary Table:</strong> Individual loan performance with progress indicators<br />
                                    3. <strong>Multi-Agency Support:</strong> View loans across all agencies or filter by specific agency<br />
                                    4. <strong>Progress Tracking:</strong> Visual progress bars showing loan completion percentage
                                </>
                            ) : (
                                <>
                                    1. <strong>Loan Details Card:</strong> Agency info, loan details, outstanding balance, and progress tracking<br />
                                    2. <strong>Repayment Statement:</strong> Detailed payment history with running balance calculations<br />
                                    3. <strong>Payment Categorization:</strong> Clear distinction between principal and interest payments<br />
                                    4. <strong>Running Balance:</strong> Track outstanding balance after each payment
                                </>
                            )}
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

export default TermLoanReportPage;