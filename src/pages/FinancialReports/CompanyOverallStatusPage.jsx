import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    Building2,
    TrendingUp,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    Calendar,
    ArrowRightLeft,
    TrendingDown,
    DollarSign,
    X,
    Filter,
    RefreshCw,
    ChevronRight,
    Activity,
    Banknote,
    BarChart3,
    PieChart,
    Calculator,
    Layers,
    Target,
    Briefcase,
    IndianRupee
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchConsolidateCompanyOverflowReportGrid,
    fetchConsolidateCompanyOverflowReportDetail,
    setFinancialYear,
    clearFilters,
    resetReportGridData,
    resetReportDetailData,
    clearError,
    selectConsolidateCompanyOverflowReportGrid,
    selectConsolidateCompanyOverflowReportDetail,
    selectLoading,
    selectErrors,
    selectSelectedFinancialYear,
    selectIsAnyLoading,
    selectHasAnyError
} from '../../slices/financialReportSlice/companyOverallStatusSlice';

// Import financial years from budget slice
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

// Modal Component for DCA Detail View
const Modal = ({ isOpen, onClose, title, children, size = 'full' }) => {
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

// DCA Detail Modal Component
const DCADetailModal = ({ isOpen, onClose, dcaData, detailData, loading }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const details = Array.isArray(detailData?.Data) ? detailData.Data : 
                   Array.isArray(detailData) ? detailData : [];

    const columns = [
        { key: 'InvoiceDate', label: 'Invoice Date' },
        { key: 'PaidDate', label: 'Paid Date' },
        { key: 'Description', label: 'Description' },
        { key: 'CashDebitPaid', label: 'Cash Debit Paid', align: 'right', format: 'currency' },
        { key: 'InvoiceBankDebitPaid', label: 'Bank Debit Paid', align: 'right', format: 'currency' },
        { key: 'InvoiceBankDebitPayable', label: 'Bank Debit Payable', align: 'right', format: 'currency' },
        { key: 'Total', label: 'Total Amount', align: 'right', format: 'currency' }
    ];

    const getCellValue = (data, column) => {
        const value = data[column.key];
        if (value !== undefined && value !== null) {
            if (column.format === 'currency') {
                return formatCurrency(value);
            }
            return value || '-';
        }
        return '-';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`DCA Detail: ${dcaData?.DCAName || 'Unknown'} (${dcaData?.DCACode || 'N/A'})`} size="full">
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <RotateCcw className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                    <p className="text-indigo-700 dark:text-indigo-300">Loading DCA details...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* DCA Summary Card */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                        <h4 className="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-3">DCA Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Cash Payments</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(dcaData?.GeneralPaymentCash || 0)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Bank Payments</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(dcaData?.GeneralPaymentBank || 0)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Gross Expenses</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(dcaData?.GrossExpenses || 0)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Net Expenses</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(dcaData?.NetExpenses || 0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Transactions */}
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
                                {details.length > 0 ? details.map((detail, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        {columns.map((column) => (
                                            <td 
                                                key={column.key}
                                                className={clsx(
                                                    "px-4 py-3 text-sm",
                                                    column.align === 'right' ? 'text-right font-medium' : 'text-left',
                                                    column.format === 'currency' ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
                                                )}
                                            >
                                                {column.key === 'Description' ? (
                                                    <div className="max-w-xs truncate" title={getCellValue(detail, column)}>
                                                        {getCellValue(detail, column)}
                                                    </div>
                                                ) : (
                                                    getCellValue(detail, column)
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No detailed transactions available for this DCA
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Modal>
    );
};

// Company Overhead (P&L) Summary Component
const CompanyOverheadSummary = ({ overheadData }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!overheadData || !Array.isArray(overheadData) || overheadData.length === 0) {
        return null;
    }

    const data = overheadData[0]; // Taking first element as per structure

    const incomeItems = [
        { label: 'Basic Invoice Current FY', value: data.BasicInvoiceCurrentFY, icon: FileSpreadsheet },
        { label: 'Interest Received', value: data.InterestReceived, icon: TrendingUp },
        { label: 'Sale of Asset on Profit', value: data.SaleofAssetonProfit, icon: Briefcase },
        { label: 'Write off Payables', value: data.WriteoffPayables, icon: X },
        { label: 'Debit Note to Vendor', value: data.DebitNotetoVendor, icon: FileSpreadsheet }
    ];

    const expenseItems = [
        { label: 'Closing Stock of Last FY', value: data.ClosingStockofLastFY, icon: Layers },
        { label: 'Work in Progress Last FY', value: data.WorkinProgressLastFY, icon: Activity },
        { label: 'Expenses DCA', value: data.ExpensesDCA, icon: Calculator },
        { label: 'Depreciation', value: data.Depreciation, icon: TrendingDown },
        { label: 'Bad Debts', value: data.BadDebts, icon: AlertTriangle },
        { label: 'Receivables Write Off', value: data.Receivableswriteoff, icon: X },
        { label: 'Debit Note from Vendor', value: data.DebitNotefromVendor, icon: FileSpreadsheet },
        { label: 'Loss on Sale of Asset', value: data.LossonsaleofAsset, icon: TrendingDown }
    ];

    const adjustmentItems = [
        { label: 'Closing Stock Current FY', value: data.ClosingStockCurrentFY, icon: Layers },
        { label: 'Work in Progress Current FY', value: data.WorkinProgressCurrentFY, icon: Activity },
        { label: 'Sale of Scrap and Old Items', value: data.SaleofScrapandOlditems, icon: RotateCcw },
        { label: 'Debit Note from Client', value: data.DebitNotefromClient, icon: FileSpreadsheet },
        { label: 'Debit Note to Client', value: data.DebitNotetoClient, icon: FileSpreadsheet }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors mt-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <PieChart className="h-6 w-6" />
                    Company Overall Status (P&L) Summary
                </h3>
            </div>

            <div className="p-6 space-y-8">
                {/* Key Performance Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">Total Sales</p>
                                <p className="text-2xl font-bold text-green-900 dark:text-white">{formatCurrency(data.Sales)}</p>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg">
                                <IndianRupee className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Net Income</p>
                                <p className="text-2xl font-bold text-indigo-900 dark:text-white">{formatCurrency(data.NetIncome)}</p>
                            </div>
                            <div className="bg-gradient-to-r from-indigo-500 to-cyan-600 p-3 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">Net Expenses</p>
                                <p className="text-2xl font-bold text-purple-900 dark:text-white">{formatCurrency(data.NetExpenses)}</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-lg">
                                <Calculator className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className={clsx(
                        "rounded-xl p-6 border",
                        data.NetProfit > 0 
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
                            : "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800"
                    )}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={clsx(
                                    "text-sm font-semibold mb-2",
                                    data.NetProfit > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                )}>
                                    {data.NetProfit > 0 ? 'Net Profit' : 'Net Loss'}
                                </p>
                                <p className={clsx(
                                    "text-2xl font-bold",
                                    data.NetProfit > 0 ? "text-green-900 dark:text-white" : "text-red-900 dark:text-white"
                                )}>
                                    {formatCurrency(Math.abs(data.NetProfit || data.NetLoss || 0))}
                                </p>
                            </div>
                            <div className={clsx(
                                "p-3 rounded-lg",
                                data.NetProfit > 0 
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                    : "bg-gradient-to-r from-red-500 to-pink-600"
                            )}>
                                <Target className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed P&L Structure */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Income Section */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-6 border border-green-200 dark:border-green-800">
                        <h4 className="text-lg font-bold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Income
                        </h4>
                        <div className="space-y-3">
                            {incomeItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-2 border-b border-green-200 dark:border-green-700 last:border-b-0">
                                    <div className="flex items-center gap-2">
                                        <item.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Expenses Section */}
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 rounded-lg p-6 border border-red-200 dark:border-red-800">
                        <h4 className="text-lg font-bold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
                            <TrendingDown className="h-5 w-5" />
                            Expenses
                        </h4>
                        <div className="space-y-3">
                            {expenseItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-2 border-b border-red-200 dark:border-red-700 last:border-b-0">
                                    <div className="flex items-center gap-2">
                                        <item.icon className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Adjustments Section */}
                    <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/10 dark:to-cyan-900/10 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
                        <h4 className="text-lg font-bold text-indigo-800 dark:text-indigo-200 mb-4 flex items-center gap-2">
                            <ArrowRightLeft className="h-5 w-5" />
                            Adjustments
                        </h4>
                        <div className="space-y-3">
                            {adjustmentItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-2 border-b border-indigo-200 dark:border-indigo-700 last:border-b-0">
                                    <div className="flex items-center gap-2">
                                        <item.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
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

const CompanyOverallStatusPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const consolidateReportGrid = useSelector(selectConsolidateCompanyOverflowReportGrid);
    const consolidateReportDetail = useSelector(selectConsolidateCompanyOverflowReportDetail);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const selectedFinancialYear = useSelector(selectSelectedFinancialYear);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    
    // Handle financial years data with proper type checking
    const financialYearsData = useSelector(selectAllFinancialYears);
    const allFinancialYears = React.useMemo(() => {
        // Check if it's already an array
        if (Array.isArray(financialYearsData)) {
            return financialYearsData;
        }
        
        // Check if it's an object with a Data property (common API response structure)
        if (financialYearsData && Array.isArray(financialYearsData.Data)) {
            return financialYearsData.Data;
        }
        
        // Check if it's an object with other common property names
        if (financialYearsData && Array.isArray(financialYearsData.data)) {
            return financialYearsData.data;
        }
        
        if (financialYearsData && Array.isArray(financialYearsData.items)) {
            return financialYearsData.items;
        }
        
        // If none of the above, return empty array
        return [];
    }, [financialYearsData]);

    // Local state
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDCAData, setSelectedDCAData] = useState(null);

    // Load initial data
    useEffect(() => {
        dispatch(fetchAllFinancialYears());
    }, [dispatch]);

    // Debug financial years data structure
    useEffect(() => {
        console.log('🔍 Financial Years Debug:', {
            financialYearsData,
            allFinancialYears,
            isArray: Array.isArray(allFinancialYears),
            length: allFinancialYears?.length,
            sample: allFinancialYears?.[0],
            sampleStructure: allFinancialYears?.[0] ? Object.keys(allFinancialYears[0]) : 'No data'
        });
    }, [financialYearsData, allFinancialYears]);

    // Show error messages via toast
    useEffect(() => {
        Object.entries(errors).forEach(([key, error]) => {
            if (error && error !== null) {
                toast.error(`Error with ${key}: ${error}`);
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

    // Handle financial year change
    const handleFinancialYearChange = (financialYear) => {
        dispatch(setFinancialYear(financialYear));
    };

    // Handle generate report
    const handleGenerateReport = async () => {
        if (!selectedFinancialYear) {
            toast.warning('Please select a financial year');
            return;
        }

        try {
            await dispatch(fetchConsolidateCompanyOverflowReportGrid(selectedFinancialYear)).unwrap();
            toast.success('Company Overall Status report generated successfully');
            
        } catch (error) {
            console.error('❌ Error generating report:', error);
            toast.error('Failed to generate report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        dispatch(clearFilters());
        dispatch(resetReportGridData());
        dispatch(resetReportDetailData());
    };

    // Handle DCA row click
    const handleDCARowClick = async (dcaData) => {
        try {
            setSelectedDCAData(dcaData);
            setIsDetailModalOpen(true);
            
            // For now, we'll use dummy years since we don't have specific parameters for the detail API
            // You may need to modify this based on how the detail API should be called
            const params = {
                DCACode: dcaData.DCACode,
                Year1: '2025', // You might want to extract this from financial year
                Year2: '2026'  // You might want to extract this from financial year
            };
            
            await dispatch(fetchConsolidateCompanyOverflowReportDetail(params)).unwrap();
            
        } catch (error) {
            console.error('❌ Error fetching DCA details:', error);
            toast.error('Failed to load DCA details');
            setIsDetailModalOpen(false);
        }
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = consolidateReportGrid?.Data?.ConsolidateCompanyData || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'DCA Code': item.DCACode || '-',
                'DCA Name': item.DCAName || '-',
                'General Payment Cash': item.GeneralPaymentCash || 0,
                'General Payment Bank': item.GeneralPaymentBank || 0,
                'General Payables': item.GeneralPayables || 0,
                'Vendor Invoices': item.VendorInvoices || 0,
                'Gross Expenses': item.GrossExpenses || 0,
                'Vendor Deductions': item.VendorDeductions || 0,
                'Net Expenses': item.NetExpenses || 0
            }));

            const filename = `Company_Overall_Status_${selectedFinancialYear}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get consolidated data for display
    const consolidateData = consolidateReportGrid?.Data?.ConsolidateCompanyData || [];
    const overheadData = consolidateReportGrid?.Data?.CompanyoverheadData || [];

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-indigo-600" />
                            Company Overall Status Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Comprehensive financial overview with DCA-wise expense analysis and profit & loss summary
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Financial Reports
                        </div>
                        {loading.consolidateCompanyOverflowReportGrid && (
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
                        <span>Finance Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Company Overall Status</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Financial Year Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Financial Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedFinancialYear}
                            onChange={(e) => handleFinancialYearChange(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">Select Financial Year</option>
                            {allFinancialYears && allFinancialYears.length > 0 ? (
                                allFinancialYears.map((fy, index) => (
                                    <option 
                                        key={fy.YearValue || fy.Year || index} 
                                        value={fy.YearValue || fy.Year}
                                    >
                                        {fy.Year || fy.YearValue}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No financial years available</option>
                            )}
                        </select>
                        
                        {/* Loading indicator for financial years */}
                        {loading && loading.allFinancialYears && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading financial years...
                            </p>
                        )}
                    </div>

                    {/* Empty columns for layout */}
                    <div></div>
                    <div></div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerateReport}
                            disabled={isAnyLoading || !selectedFinancialYear}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.consolidateCompanyOverflowReportGrid ? (
                                <RotateCcw className="h-5 w-5 animate-spin" />
                            ) : (
                                <BarChart3 className="h-5 w-5" />
                            )}
                            Generate Report
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
                        
                        <Tooltip content="Download company overall status report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(consolidateData) || consolidateData.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Download className="h-5 w-5" />
                                Excel
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* DCA Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(consolidateData) && consolidateData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">DCA Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">DCA Name</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Cash Payment</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Bank Payment</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Payables</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Vendor Invoices</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Gross Expenses</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Vendor Deductions</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Net Expenses</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {consolidateData.map((item, index) => (
                                    <tr 
                                        key={index} 
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                        onClick={() => handleDCARowClick(item)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                            {item.DCACode || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.DCAName}>
                                                {item.DCAName || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            {formatCurrency(item.GeneralPaymentCash || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            {formatCurrency(item.GeneralPaymentBank || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            {formatCurrency(item.GeneralPayables || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            {formatCurrency(item.VendorInvoices || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                            {formatCurrency(item.GrossExpenses || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 text-right font-medium">
                                            {formatCurrency(item.VendorDeductions || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 text-right font-bold">
                                            {formatCurrency(item.NetExpenses || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDCARowClick(item);
                                                }}
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
                        {!loading.consolidateCompanyOverflowReportGrid && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Report Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select a financial year and click "Generate Report" to view the company overall status report.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.consolidateCompanyOverflowReportGrid && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Generating Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching company overall status data for the selected financial year...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Company Overhead Summary */}
            <CompanyOverheadSummary overheadData={overheadData} />

            {/* DCA Detail Modal */}
            <DCADetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                dcaData={selectedDCAData}
                detailData={consolidateReportDetail}
                loading={loading.consolidateCompanyOverflowReportDetail}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Company Overall Status Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Financial Year Filter:</strong> Select financial year to generate comprehensive status report<br/>
                            2. <strong>DCA Analysis:</strong> View detailed expense breakdown by Department Cost Allocation codes<br/>
                            3. <strong>Profit & Loss Summary:</strong> Complete overhead analysis with income, expenses, and adjustments<br/>
                            4. <strong>Detailed View:</strong> Click any DCA row to view transaction-level details in modal popup<br/>
                            5. <strong>Financial Metrics:</strong> Track cash payments, bank payments, vendor invoices, and net expenses<br/>
                            6. <strong>Export Functionality:</strong> Download complete report data as Excel for offline analysis<br/>
                            7. <strong>Interactive Design:</strong> Hover effects and responsive layout for better user experience<br/>
                            8. <strong>Real-time Updates:</strong> Live loading indicators and error handling with toast notifications
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

export default CompanyOverallStatusPage;