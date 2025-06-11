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
    ArrowRightLeft
} from 'lucide-react';
import {
    fetchAllFinancialYears,
    fetchCostCenterBudgetReportTypes,
    fetchCostCentersByTypeByRole,
    fetchCCBudgetDetailsByCodeForReport,
    fetchDCABudgetDetailsForReport,
    fetchDCABudgetDetailedSummary,
    fetchCCDepreciationOverHead,
    fetchCCInvoiceSummary,
    fetchCCUploadDocsExists,
    fetchAllInvoiceByCCCode,
    fetchBudgetTransferSummaryPopup,
    saveBudgetExcelRequest,
    setFilters,
    clearFilters,
    resetBudgetData,
    resetSelectedCCData,
    selectAllFinancialYears,
    selectCostCenterBudgetReportTypes,
    selectCostCentersByTypeByRole,
    selectCCBudgetDetailsByCodeForReport,
    selectDCABudgetDetailsForReport,
    selectDCABudgetDetailedSummary,
    selectCCDepreciationOverHead,
    selectCCInvoiceSummary,
    selectCCUploadDocsExists,
    selectAllInvoiceByCCCode,
    selectBudgetTransferSummaryPopup,
    selectBudgetExcelRequestResult,
    selectLoading,
    selectErrors,
    selectFilters,
    selectBudgetSummary
} from '../../slices/budgetSlice/budgetReportSlice';

// Modern Progress Bar Component
const BudgetProgressBar = ({ assigned, consumed, dcaName }) => {
    const percentage = assigned > 0 ? (consumed / assigned) * 100 : 0;
    
    const getProgressColor = () => {
        if (percentage <= 50) return 'from-green-400 to-green-600';
        if (percentage <= 90) return 'from-yellow-400 to-orange-500';
        return 'from-red-400 to-red-600';
    };
    
    const getProgressBg = () => {
        if (percentage <= 50) return 'bg-green-50 dark:bg-green-900/20';
        if (percentage <= 90) return 'bg-yellow-50 dark:bg-yellow-900/20';
        return 'bg-red-50 dark:bg-red-900/20';
    };

    const getIconColor = () => {
        if (percentage <= 50) return 'text-green-600 dark:text-green-400';
        if (percentage <= 90) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getIcon = () => {
        if (percentage <= 50) return <TrendingUp className="h-4 w-4" />;
        if (percentage <= 90) return <Activity className="h-4 w-4" />;
        return <TrendingDown className="h-4 w-4" />;
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className={`rounded-lg p-3 ${getProgressBg()} border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className={getIconColor()}>
                        {getIcon()}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {percentage.toFixed(1)}% Consumed
                    </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(consumed)} / {formatCurrency(assigned)}
                </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                    className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out rounded-full relative`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                >
                    {percentage > 0 && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    )}
                </div>
            </div>
        </div>
    );
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

// Modal Component for Invoice and Transfer Budget Popups
const Modal = ({ isOpen, onClose, title, children, size = 'lg' }) => {
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

// Invoice Modal Component
const InvoiceModal = ({ isOpen, onClose, invoiceData, loading }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const invoices = invoiceData?.Data || invoiceData || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invoice Details" size="xl">
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <RotateCcw className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                    <p className="text-indigo-700 dark:text-indigo-300">Loading invoice data...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Invoice No</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Invoice Date</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Client Name</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">PO Number</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {invoices.length > 0 ? invoices.map((invoice, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {invoice.ClientInvoiceNo || invoice.invoiceNumber || invoice.InvoiceNo || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {invoice.InvoiceDate || invoice.invoiceDate || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {invoice.ClientName || invoice.vendorName || invoice.Vendor || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                        {invoice.PONumber || invoice.description || invoice.Particulars || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                        {formatCurrency(invoice.InvoiceAmount || invoice.Invoiceamount || invoice.InvoiceAmount || 0)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={clsx(
                                            "px-2 py-1 text-xs rounded-full",
                                            {
                                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': 
                                                    (invoice.Status || invoice.status || '').toLowerCase() === 'paid',
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': 
                                                    (invoice.Status || invoice.status || '').toLowerCase() === 'pending',
                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': 
                                                    (invoice.Status || invoice.status || '').toLowerCase() === 'cancelled',
                                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200': 
                                                    true
                                            }
                                        )}>
                                            {invoice.Status || invoice.status || 'Unknown'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No invoice data available
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

// Transfer Budget Modal Component
const TransferBudgetModal = ({ isOpen, onClose, transferData, loading }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const transfers = transferData?.Data || transferData || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Budget Transfer Details" size="xl">
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <RotateCcw className="h-6 w-6 text-purple-500 animate-spin mr-3" />
                    <p className="text-purple-700 dark:text-purple-300">Loading transfer budget data...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gradient-to-r from-purple-600 to-pink-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Transfer Date</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">From Cost Center</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">To Cost Center</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">DCA Code</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase">Transfer Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {transfers.length > 0 ? transfers.map((transfer, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {transfer.TransferDate || transfer.transferDate || transfer.Date || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {transfer.FromCostCenter || transfer.fromCC || transfer.FromCC || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {transfer.ToCostCenter || transfer.toCC || transfer.ToCC || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {transfer.DCACode || transfer.dcaCode || transfer.DCA || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                        {formatCurrency(transfer.TransferAmount || transfer.transferAmount || transfer.Amount || 0)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                        {transfer.Remarks || transfer.remarks || transfer.Description || '-'}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No transfer budget data available
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

// Upload Documents Button Component
const UploadDocsButton = ({ ccCode, uid, ccUploadDocsData }) => {
    const hasUploadDocs = ccUploadDocsData?.Data?.[0]?.contractscopeisexists === 'Yes' || 
                         ccUploadDocsData?.contractscopeisexists === 'Yes';

    if (!hasUploadDocs) return null;

    const handleViewDocs = () => {
        // Here you would implement the logic to view uploaded documents
        // This could open a new window, modal, or navigate to a documents page
        console.log('Viewing uploaded documents for:', ccCode);
        alert('Document viewing functionality would be implemented here');
    };

    return (
        <Tooltip content="View uploaded documents">
            <button
                onClick={handleViewDocs}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-cyan-600 text-white rounded-lg hover:from-indigo-600 hover:to-cyan-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
                <FileText className="h-4 w-4" />
                <span className="text-sm">View Docs</span>
            </button>
        </Tooltip>
    );
};

// Enhanced Invoice Status Component with clickable options
const InvoiceStatusSection = ({ 
    costCenter, 
    ccInvoiceSummaryData,
    loading,
    totalConsumedDCABudget,
    onInvoiceClick,
    onTransferBudgetClick
}) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const invoiceSummaryData = ccInvoiceSummaryData?.Data || {};
    const invoiceStatusDetails = invoiceSummaryData.InvoiceStatusDetails || [];
    const invoiceAndBudgetConsumed = invoiceSummaryData.InvoiceAndBudgetConsumed || [];

    if (loading.ccInvoiceSummary) {
        return (
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center justify-center">
                    <RotateCcw className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                    <p className="text-indigo-700 dark:text-indigo-300 font-medium">Loading invoice summary with calculated totals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 space-y-6">
            {/* Invoice and Receipt Status Section */}
            {invoiceStatusDetails.length > 0 ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-lg">
                            <Receipt className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Invoice And Receipt Status Of Cost Center
                        </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <thead className="bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-700 dark:to-emerald-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                        Invoice/Receipt Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {invoiceStatusDetails.map((item, index) => {
                                    const invoiceReceiptValue = parseFloat(item.Status || 0);
                                    const description = item.Description || '';
                                    
                                    let realStatus = 0;
                                    if (description.includes('CUMULATIVE INVOICE') || description.includes('CUMULATIVE RECIEPT')) {
                                        realStatus = invoiceReceiptValue - (totalConsumedDCABudget || 0);
                                    } else {
                                        realStatus = invoiceReceiptValue;
                                    }

                                    const isInvoiceClickable = description.includes('CONSUMED BUDGET STATUS WITH CUMULATIVE INVOICE');
                                    const isTransferClickable = description.includes('BUDGET RECIEVED FROM OTHER CC TO MANAGE THE COST/LOST');

                                    return (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                                {item.Rowno || index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                                {isInvoiceClickable ? (
                                                    <button
                                                        onClick={() => onInvoiceClick(costCenter.ccCode)}
                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline cursor-pointer transition-colors flex items-center gap-2"
                                                    >
                                                        <DollarSign className="h-4 w-4" />
                                                        {description}
                                                    </button>
                                                ) : isTransferClickable ? (
                                                    <button
                                                        onClick={() => onTransferBudgetClick(costCenter.ccCode)}
                                                        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 underline cursor-pointer transition-colors flex items-center gap-2"
                                                    >
                                                        <ArrowRightLeft className="h-4 w-4" />
                                                        {description}
                                                    </button>
                                                ) : (
                                                    description
                                                )}
                                            </td>
                                            <td className={clsx(
                                                "px-6 py-4 whitespace-nowrap text-sm text-right font-bold",
                                                {
                                                    'text-green-600 dark:text-green-400': realStatus > 0,
                                                    'text-red-600 dark:text-red-400': realStatus < 0,
                                                    'text-gray-600 dark:text-gray-400': realStatus === 0
                                                }
                                            )}>
                                                {formatCurrency(realStatus)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-semibold">
                                                {formatCurrency(invoiceReceiptValue)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}

            {/* Percentage Statistics Section */}
            {invoiceAndBudgetConsumed.length > 0 ? (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-lg">
                            <Percent className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Percentage Of Invoice And Budget Consumption
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {invoiceAndBudgetConsumed.map((stat, index) => {
                            const percentageValue = parseFloat(stat.ProjectbudgetCunsumption.replace('%', ''));
                            
                            return (
                                <div key={index} className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg p-6 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {stat.Desc}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className={clsx(
                                                    "text-3xl font-bold",
                                                    {
                                                        'text-red-600 dark:text-red-400': percentageValue > 100,
                                                        'text-yellow-600 dark:text-yellow-400': percentageValue > 80 && percentageValue <= 100,
                                                        'text-green-600 dark:text-green-400': percentageValue <= 80
                                                    }
                                                )}>
                                                    {stat.ProjectbudgetCunsumption}
                                                </span>
                                                {percentageValue > 100 && (
                                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative w-20 h-20">
                                            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-gray-200 dark:text-gray-700"
                                                    d="M18 2.0845
                                                       a 15.9155 15.9155 0 0 1 0 31.831
                                                       a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                                <path
                                                    className={clsx({
                                                        'text-red-500': percentageValue > 100,
                                                        'text-yellow-500': percentageValue > 80 && percentageValue <= 100,
                                                        'text-green-500': percentageValue <= 80
                                                    })}
                                                    d="M18 2.0845
                                                       a 15.9155 15.9155 0 0 1 0 31.831
                                                       a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeDasharray={`${Math.min(percentageValue, 100)}, 100`}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Percent className="h-8 w-8 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

// Modified Report Header Component
const ReportHeader = ({ costCenter, showStatusButton, onStatusClick, isPerformingType, statusLoaded, ccUploadDocsData, uid }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-800 text-white p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <BarChart3 className="h-6 w-6" />
                        {costCenter.ccCode} - {costCenter.ccName}
                    </h3>
                    {!costCenter.isClosedStatus && (
                        <div className="flex gap-6 text-sm opacity-90">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                <span>Budget Amount: {formatCurrency(costCenter.budgetAmount)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                <span>Budget Balance: {formatCurrency(costCenter.budgetBalance)}</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {/* Upload Documents Button */}
                    <UploadDocsButton 
                        ccCode={costCenter.ccCode} 
                        uid={uid} 
                        ccUploadDocsData={ccUploadDocsData} 
                    />
                    
                    {/* Status Button */}
                    {showStatusButton && isPerformingType && (
                        <Tooltip content={statusLoaded ? "Refresh Status Details" : "Load Status Details with Depreciation & Invoice Information"}>
                            <button
                                onClick={onStatusClick}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 hover:shadow-lg"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                {statusLoaded ? 'Refresh Status' : 'Load Status Details'}
                            </button>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
};

// Enhanced DCA Detail View with Totals
const DCADetailView = ({ hasDetails, detailData, loading, dcaCode }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <span className="flex items-center justify-center gap-2">
                    <RotateCcw className="h-5 w-5 animate-spin" />
                    Loading transaction details...
                </span>
            </div>
        );
    }

    if (!hasDetails || hasDetails.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    No transaction details available for this DCA
                </p>
            </div>
        );
    }

    // Calculate totals for each column
    const totals = hasDetails.reduce((acc, transaction) => {
        acc.credit += parseFloat(transaction.credit || 0);
        acc.cashDebit += parseFloat(transaction.cashDebit || 0);
        acc.indent += parseFloat(transaction.indent || 0);
        acc.po += parseFloat(transaction.po || 0);
        acc.invoiceDebit += parseFloat(transaction.invoiceDebit || 0);
        acc.internalDebit += parseFloat(transaction.internalDebit || 0);
        acc.bankDebit += parseFloat(transaction.bankDebit || 0);
        acc.totalDebit += parseFloat(transaction.totalDebit || 0);
        return acc;
    }, {
        credit: 0,
        cashDebit: 0,
        indent: 0,
        po: 0,
        invoiceDebit: 0,
        internalDebit: 0,
        bankDebit: 0,
        totalDebit: 0
    });

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600 rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Invoice Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Paid Date</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Credit</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Cash Debit</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Indent</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">PO</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Invoice Debit</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Internal Debit</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Bank Debit</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Total Debit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                    {hasDetails.map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300">{transaction.invoiceDate}</td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300">{transaction.paidDate}</td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300 max-w-xs truncate" title={transaction.description}>
                                {transaction.description}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300 text-right font-medium">{formatCurrency(transaction.credit)}</td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300 text-right font-medium">{formatCurrency(transaction.cashDebit)}</td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300 text-right font-medium">{formatCurrency(transaction.indent)}</td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300 text-right font-medium">{formatCurrency(transaction.po)}</td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300 text-right font-medium">{formatCurrency(transaction.invoiceDebit)}</td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300 text-right font-medium">{formatCurrency(transaction.internalDebit)}</td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300 text-right font-medium">{formatCurrency(transaction.bankDebit)}</td>
                            <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300 text-right font-bold">{formatCurrency(transaction.totalDebit)}</td>
                        </tr>
                    ))}
                </tbody>
                {/* Totals Footer */}
                <tfoot className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                    <tr>
                        <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white" colSpan="3">
                            TOTAL:
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white text-right">{formatCurrency(totals.credit)}</td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white text-right">{formatCurrency(totals.cashDebit)}</td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white text-right">{formatCurrency(totals.indent)}</td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white text-right">{formatCurrency(totals.po)}</td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white text-right">{formatCurrency(totals.invoiceDebit)}</td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white text-right">{formatCurrency(totals.internalDebit)}</td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white text-right">{formatCurrency(totals.bankDebit)}</td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-900 dark:text-white text-right">{formatCurrency(totals.totalDebit)}</td>
                    </tr>
                </tfoot>
            </table>
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

const BudgetReport = ({ menuData }) => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const allFinancialYears = useSelector(selectAllFinancialYears) || [];
    const costCenterBudgetReportTypes = useSelector(selectCostCenterBudgetReportTypes) || [];
    const costCentersByTypeByRole = useSelector(selectCostCentersByTypeByRole) || [];
    const ccDepreciationOverHead = useSelector(selectCCDepreciationOverHead) || [];
    const ccInvoiceSummary = useSelector(selectCCInvoiceSummary);
    const ccUploadDocsExists = useSelector(selectCCUploadDocsExists);
    const allInvoiceByCCCode = useSelector(selectAllInvoiceByCCCode);
    const budgetTransferSummaryPopup = useSelector(selectBudgetTransferSummaryPopup);

    // Get userData from auth state (includes UID and roleId)
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Local state
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [detailData, setDetailData] = useState({});
    const [statusDataLoaded, setStatusDataLoaded] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        costCenterType: '',
        subType: '',
        costCenterStatus: '',
        costCenter: '',
        financialYear: ''
    });
    const [reportData, setReportData] = useState([]);
    const [totalConsumedForInvoice, setTotalConsumedForInvoice] = useState(0);
    
    // Modal states
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [transferBudgetModalOpen, setTransferBudgetModalOpen] = useState(false);

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

    // Initial data load
    useEffect(() => {
        console.log('🚀 Initial load - User Data:', userData);
        console.log('🚀 Role ID:', roleId, 'UID:', uid);
        
        dispatch(fetchAllFinancialYears());
        
        if (roleId) {
            dispatch(fetchCostCenterBudgetReportTypes(roleId));
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

    // Fetch cost centers when required filters are selected
    useEffect(() => {
        const shouldFetchCostCenters = () => {
            if (!localFilters.costCenterType || !localFilters.costCenterStatus || !roleId || !uid) {
                return false;
            }

            if (localFilters.costCenterType === 'Performing' && !localFilters.subType) {
                return false;
            }

            const needsFinancialYear = ['Capital', 'Non-Performing', 'Other Capital'].includes(localFilters.costCenterType);
            if (needsFinancialYear && !localFilters.financialYear) {
                return false;
            }

            return true;
        };

        if (shouldFetchCostCenters()) {
            const params = {
                ccType: localFilters.costCenterType,
                subType: localFilters.subType || '',
                uid: uid,
                rid: roleId,
                ccStatus: localFilters.costCenterStatus === 'Active' ? 'Active' : 'Closed'
            };

            dispatch(fetchCostCentersByTypeByRole(params));
        }
    }, [dispatch, localFilters.costCenterType, localFilters.subType, localFilters.costCenterStatus, localFilters.financialYear, roleId, uid]);

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setLocalFilters(prev => {
            const newFilters = {
                ...prev,
                [filterName]: value
            };

            if (filterName === 'costCenterType') {
                newFilters.subType = '';
                newFilters.costCenter = '';
                
                const needsFinancialYear = ['Capital', 'Non-Performing', 'Other Capital'].includes(value);
                if (!needsFinancialYear) {
                    newFilters.financialYear = '';
                }
            }

            if (filterName === 'subType' || filterName === 'costCenterStatus' || filterName === 'financialYear') {
                newFilters.costCenter = '';
            }

            return newFilters;
        });
        
        setStatusDataLoaded(false);
        dispatch(resetSelectedCCData());
        setReportData([]);
    };

    // Handle cost center selection to check for upload documents
    const handleCostCenterChange = async (value) => {
        handleFilterChange('costCenter', value);
        
        if (value && uid) {
            try {
                await dispatch(fetchCCUploadDocsExists({ 
                    ccCode: value, 
                    uid: uid 
                })).unwrap();
            } catch (error) {
                console.error('❌ Error checking upload docs:', error);
            }
        }
    };

    // Handle view button click
    const handleView = async () => {
        if (!localFilters.costCenter) {
            console.warn('⚠️ Cost Center is required');
            return;
        }

        const needsFinancialYear = ['Capital', 'Non-Performing', 'Other Capital'].includes(localFilters.costCenterType);
        if (needsFinancialYear && !localFilters.financialYear) {
            console.warn('⚠️ Financial Year is required for this Cost Center Type');
            return;
        }

        try {
            dispatch(setFilters(localFilters));
            
            const ccCode = localFilters.costCenter;
            const year = localFilters.financialYear || new Date().getFullYear();

            const [ccBudgetResponse, dcaBudgetResponse] = await Promise.all([
                dispatch(fetchCCBudgetDetailsByCodeForReport({ ccCode, year })).unwrap(),
                dispatch(fetchDCABudgetDetailsForReport({ ccCode, year })).unwrap()
            ]);

            processReportData(ccBudgetResponse, dcaBudgetResponse, ccCode);

        } catch (error) {
            console.error('❌ Error fetching budget data:', error);
        }
    };

    // Process the API response data
    const processReportData = (ccData, dcaData, ccCode) => {
        if (!ccData || !dcaData) {
            setReportData([]);
            return;
        }

        const isClosedStatus = localFilters.costCenterStatus === 'Inactive';
        
        const ccInfo = ccData?.Data?.[0] || ccData?.[0] || ccData;
        const dcaArray = dcaData?.Data || dcaData || [];

        const processedData = [{
            ccCode: ccCode,
            ccName: ccInfo?.CC_Name || ccInfo?.ccName || ccInfo?.CostCenterName || ccInfo?.CCName || 'Cost Center',
            budgetAmount: parseFloat(ccInfo?.BudgetValue || ccInfo?.totalBudgetAmount || ccInfo?.BudgetAmount || ccInfo?.TotalBudgetAmount || 0),
            budgetBalance: parseFloat(ccInfo?.BalanceBudget || ccInfo?.totalBudgetBalance || ccInfo?.BudgetBalance || ccInfo?.TotalBudgetBalance || 0),
            isClosedStatus: isClosedStatus,
            dcaBreakdown: Array.isArray(dcaArray) ? dcaArray.map(dca => ({
                code: dca.DCACode || dca.dcaCode || dca.Code || dca.AccountHeadCode,
                name: dca.DCAName || dca.dcaName || dca.Name || dca.AccountHeadName,
                assignedBudget: isClosedStatus ? 0 : parseFloat(dca.DCABudgetValue || dca.assignedBudget || dca.AssignedBudget || dca.BudgetAmount || 0),
                consumedBudget: parseFloat(dca.ConsumedBudget || dca.consumedBudget ||0),
                balance: isClosedStatus ? 0 : parseFloat(dca.DCABudgetBalance || dca.balance || dca.Balance || 
                        ((dca.DCABudgetValue || dca.assignedBudget || dca.AssignedBudget || dca.BudgetAmount || 0) - 
                         (dca.ConsumedBudget || dca.consumedBudget || 0)))
            })) : [],
            depreciationData: []
        }];

        setReportData(processedData);
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            costCenterType: '',
            subType: '',
            costCenterStatus: '',
            costCenter: '',
            financialYear: ''
        });
        dispatch(clearFilters());
        dispatch(resetBudgetData());
        setExpandedRows(new Set());
        setDetailData({});
        setReportData([]);
        setStatusDataLoaded(false);
    };

    // Handle Load Status Details button click
    const handleLoadStatusDetails = async (ccCode, year) => {
        try {
            const depreciationResponse = await dispatch(fetchCCDepreciationOverHead({ 
                ccCode, 
                year: year 
            })).unwrap();

            const depreciationArray = depreciationResponse?.Data || [];
            const currentCostCenter = reportData.find(cc => cc.ccCode === ccCode);
            
            if (!currentCostCenter) {
                console.error('❌ Cost center data not found. Please load the main report first.');
                return;
            }
            
            const dcaTotalBudget = currentCostCenter.dcaBreakdown.reduce((sum, dca) => sum + dca.assignedBudget, 0);
            const dcaTotalConsumed = currentCostCenter.dcaBreakdown.reduce((sum, dca) => sum + dca.consumedBudget, 0);
            
            let depreciationTotalBudget = 0;
            let depreciationTotalConsumed = 0;
            
            if (Array.isArray(depreciationArray) && depreciationArray.length > 0) {
                depreciationTotalBudget = depreciationArray.reduce((sum, item) => {
                    return sum + parseFloat(item.DCABudgetValue || item.BudgetValue || 0);
                }, 0);
                
                depreciationTotalConsumed = depreciationArray.reduce((sum, item) => {
                    return sum + parseFloat(item.ConsumedBudget || 0);
                }, 0);
            }
            
            const totalDCABudget = dcaTotalBudget + depreciationTotalBudget;
            const totalConsumedDCABudget = dcaTotalConsumed + depreciationTotalConsumed;
            
            setTotalConsumedForInvoice(totalConsumedDCABudget);
            
            const invoiceResponse = await dispatch(fetchCCInvoiceSummary({ 
                ccCode, 
                year: year,
                totalDCABudget: totalDCABudget,
                totalConsumedDCABudget: totalConsumedDCABudget
            })).unwrap();

            const processedDepreciationData = Array.isArray(depreciationArray) ? depreciationArray.map(item => ({
                code: item.DCACode || item.Code || '',
                name: item.DCACode || item.Description || item.Name || '',
                assignedBudget: parseFloat(item.DCABudgetValue || item.BudgetValue || 0),
                consumedBudget: parseFloat(item.ConsumedBudget || 0),
                balance: parseFloat(item.DCABudgetBalance || item.Balance || 0),
                isDepreciation: true
            })) : [];

            setReportData(prevData => {
                return prevData.map(costCenter => {
                    if (costCenter.ccCode === ccCode) {
                        return {
                            ...costCenter,
                            depreciationData: processedDepreciationData
                        };
                    }
                    return costCenter;
                });
            });

            setStatusDataLoaded(true);
            
        } catch (error) {
            console.error('❌ Error fetching Status details:', error);
        }
    };

    // Handle row expansion
    const toggleRowExpansion = async (ccCode, dcaCode) => {
        const rowKey = `${ccCode}-${dcaCode}`;
        const newExpandedRows = new Set(expandedRows);
        
        if (newExpandedRows.has(rowKey)) {
            newExpandedRows.delete(rowKey);
            const newDetailData = { ...detailData };
            delete newDetailData[dcaCode];
            setDetailData(newDetailData);
        } else {
            newExpandedRows.add(rowKey);
            
            try {
                const year = localFilters.financialYear || new Date().getFullYear();
                const ccType = localFilters.costCenterType;
                
                const detailParams = {
                    role: roleId,
                    ccType: ccType,
                    ccCode: ccCode,
                    dcaCode: dcaCode,
                    year: ccType === 'Performing' ? '' : year.toString().substring(0, 4),
                    year1: ccType === 'Performing' ? '' : (parseInt(year) + 1).toString()
                };

                const detailResponse = await dispatch(fetchDCABudgetDetailedSummary(detailParams)).unwrap();

                const detailArray = detailResponse?.Data || detailResponse || [];
                const processedDetailData = Array.isArray(detailArray) ? detailArray.map(transaction => ({
                    invoiceDate: transaction.paydate || transaction.invoiceDate || transaction.InvoiceDate || '',
                    paidDate: transaction.PaidDate || transaction.paidDate || transaction.PaymentDate || '',
                    description: transaction.Description || transaction.description || transaction.Particulars || '',
                    credit: parseFloat(transaction.credit || transaction.Credit || transaction.CreditAmount || 0),
                    cashDebit: parseFloat(transaction.cashdebit || transaction.CashDebit || transaction.Cash || 0),
                    indent: parseFloat(transaction.indent || transaction.Indent || transaction.IndentAmount || 0),
                    po: parseFloat(transaction.PO || transaction.po || transaction.POAmount || 0),
                    invoiceDebit: parseFloat(transaction.InvoiceDebit || transaction.invoiceDebit || transaction.Invoice || 0),
                    internalDebit: parseFloat(transaction.InternalDebit || transaction.internalDebit || transaction.Internal || 0),
                    bankDebit: parseFloat(transaction.BankDebit || transaction.bankDebit || transaction.Bank || 0),
                    totalDebit: parseFloat(transaction.TotalDebit || transaction.totalDebit || transaction.Total || 0)
                })) : [];

                setDetailData(prev => ({
                    ...prev,
                    [dcaCode]: processedDetailData
                }));

            } catch (error) {
                console.error('❌ Error fetching DCA detail data:', error);
                setDetailData(prev => ({
                    ...prev,
                    [dcaCode]: []
                }));
            }
        }
        
        setExpandedRows(newExpandedRows);
    };

    // Handle email export
    const handleEmailExport = async () => {
        try {
            const exportData = {
                CCCode: localFilters.costCenter,
                Year: localFilters.financialYear || new Date().getFullYear()
            };
            
            const response = await dispatch(saveBudgetExcelRequest(exportData)).unwrap();
            
            if (response?.Data?.saveStatus === "Submited" || response?.saveStatus === "Submited") {
                alert('Excel File will be sent to your Registered Email Within 20 Minutes');
            } else {
                alert('Something Went Wrong');
            }
        } catch (error) {
            console.error('❌ Email Export Error:', error);
            alert('Email export failed. Please try again.');
        }
    };

    // Handle direct Excel download
    const handleExcelDownload = () => {
        try {
            if (reportData.length === 0) {
                alert('No data available to download');
                return;
            }

            // Prepare data for Excel download
            const excelData = [];
            
            reportData.forEach(costCenter => {
                // Add cost center header
                excelData.push({
                   
                    'Budget Amount': costCenter.budgetAmount,
                    'Budget Balance': costCenter.budgetBalance,
                    'DCA Code': '',
                    'DCA Name': '',
                    'Assigned Budget': '',
                    'Consumed Budget': '',
                    'Balance': '',
                    
                });

                // Add DCA breakdown
                costCenter.dcaBreakdown.forEach(dca => {
                    excelData.push({
                        
                        'Budget Amount': '',
                        'Budget Balance': '',
                        'DCA Code': dca.code,
                        'DCA Name': dca.name,
                        'Assigned Budget': dca.assignedBudget,
                        'Consumed Budget': dca.consumedBudget,
                        'Balance': dca.balance,
                        
                    });
                });

                // Add depreciation data if available
                if (costCenter.depreciationData && costCenter.depreciationData.length > 0) {
                    costCenter.depreciationData.forEach(dep => {
                        excelData.push({
                            'Cost Center Code': costCenter.ccCode,
                            'Cost Center Name': costCenter.ccName,
                            'Budget Amount': '',
                            'Budget Balance': '',
                            'DCA Code': dep.code,
                            'DCA Name': dep.name,
                            'Assigned Budget': dep.assignedBudget,
                            'Consumed Budget': dep.consumedBudget,
                            'Balance': dep.balance,
                            'Type': 'Depreciation'
                        });
                    });
                }
            });

            const filename = `Budget_Report_${localFilters.costCenter}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            alert('Excel download failed. Please try again.');
        }
    };

    // Handle invoice modal
    const handleInvoiceClick = async (ccCode) => {
        const type = 1
        try {
            const year = localFilters.financialYear || new Date().getFullYear();
            await dispatch(fetchAllInvoiceByCCCode({ ccCode, type })).unwrap();
            setInvoiceModalOpen(true);
        } catch (error) {
            console.error('❌ Error fetching invoice data:', error);
            alert('Failed to load invoice data');
        }
    };

    // Handle transfer budget modal
    const handleTransferBudgetClick = async (ccCode) => {
        try {
            await dispatch(fetchBudgetTransferSummaryPopup(ccCode)).unwrap();
            setTransferBudgetModalOpen(true);
        } catch (error) {
            console.error('❌ Error fetching transfer budget data:', error);
            alert('Failed to load transfer budget data');
        }
    };

    // Get balance color class
    const getBalanceColorClass = (balance) => {
        if (balance > 0) return 'text-green-600 dark:text-green-400';
        if (balance < 0) return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    // Check if any loading is happening
    const isLoading = loading.ccBudgetDetailsByCodeForReport || 
                     loading.dcaBudgetDetailsForReport || 
                     loading.dcaBudgetDetailedSummary ||
                     loading.costCentersByTypeByRole ||
                     loading.costCenterBudgetReportTypes;

    // Check if financial year is required
    const isFinancialYearRequired = ['Capital', 'Non-Performing', 'Other Capital'].includes(localFilters.costCenterType);

    // Check if subtype is required
    const isSubTypeRequired = localFilters.costCenterType === 'Performing';

    // Check if performing type for Status Details
    const isPerformingType = localFilters.costCenterType === 'Performing';

    // Check if Status loading
    const isStatusLoading = loading.ccDepreciationOverHead || loading.ccInvoiceSummary;

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <BarChart3 className="h-8 w-8 text-indigo-600" />
                            Budget Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View and analyze budget allocation and consumption reports with advanced insights
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Advanced Reports
                        </div>
                        {roleId && (
                            <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                                Role: {roleId}
                            </div>
                        )}
                        {isPerformingType && (
                            <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-800 dark:text-green-200 text-sm rounded-full transition-colors">
                                Status Details Available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Cost Center Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Cost Center Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.costCenterType}
                            onChange={(e) => handleFilterChange('costCenterType', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">Select Type</option>
                            {costCenterBudgetReportTypes?.Data && Array.isArray(costCenterBudgetReportTypes.Data) && costCenterBudgetReportTypes.Data.map((type) => {
                                const typeId = type?.CCTypeID || type?.id;
                                const typeDesc = type?.CCTypeDescription || type?.description || type?.name;
                                
                                return (
                                    <option key={typeId} value={typeDesc}>
                                        {typeDesc}
                                    </option>
                                );
                            })}
                        </select>
                        {loading.costCenterBudgetReportTypes && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading available types...
                            </p>
                        )}
                    </div>

                    {/* Sub Type - Only for Performing */}
                    {isSubTypeRequired && (
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
                    )}

                    {/* Financial Year - Show for specific cost center types */}
                    {isFinancialYearRequired && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Financial Year <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.financialYear}
                                onChange={(e) => handleFilterChange('financialYear', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                            >
                                <option value="">Select Financial Year</option>
                                {allFinancialYears?.Data && Array.isArray(allFinancialYears.Data) && allFinancialYears.Data.map((year) => {
                                    const yearValue = year?.Year || year?.year || year?.FinancialYear || year?.YearValue;
                                    
                                    if (!yearValue) return null;
                                    
                                    return (
                                        <option key={yearValue} value={yearValue}>
                                            {yearValue}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}

                    {/* Cost Center Status */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Cost Center Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.costCenterStatus}
                            onChange={(e) => handleFilterChange('costCenterStatus', e.target.value)}
                            disabled={!localFilters.costCenterType || (isSubTypeRequired && !localFilters.subType)}
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
                            onChange={(e) => handleCostCenterChange(e.target.value)}
                            disabled={!localFilters.costCenterStatus || loading.costCentersByTypeByRole}
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
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isLoading || !localFilters.costCenter || !localFilters.costCenterStatus || (isFinancialYearRequired && !localFilters.financialYear) || (isSubTypeRequired && !localFilters.subType)}
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
                        
                        {/* Email Export Button */}
                        <Tooltip content="Send budget report to your email">
                            <button
                                onClick={handleEmailExport}
                                disabled={reportData.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Mail className="h-5 w-5" />
                                Email
                            </button>
                        </Tooltip>
                        
                        {/* Direct Excel Download Button */}
                        <Tooltip content="Download budget report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={reportData.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Download className="h-5 w-5" />
                                Excel
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Budget Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {reportData.map((costCenter) => (
                    <div key={costCenter.ccCode}>
                        {/* Enhanced Report Header with Upload Docs */}
                        <ReportHeader 
                            costCenter={costCenter}
                            showStatusButton={costCenter.isClosedStatus === false}
                            onStatusClick={() => handleLoadStatusDetails(costCenter.ccCode, localFilters.financialYear || new Date().getFullYear())}
                            isPerformingType={isPerformingType}
                            statusLoaded={statusDataLoaded}
                            ccUploadDocsData={ccUploadDocsExists}
                            uid={uid}
                        />

                        {/* Combined Budget Table (DCA + Depreciation) */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                            Account Head Code
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                            Account Head Name & Progress
                                        </th>
                                        {!costCenter.isClosedStatus && (
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                Assigned Budget
                                            </th>
                                        )}
                                        <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                            Consumed Budget
                                        </th>
                                        {!costCenter.isClosedStatus && (
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                Balance
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {/* DCA Budget Rows */}
                                    {costCenter.dcaBreakdown.map((dca) => {
                                        const rowKey = `${costCenter.ccCode}-${dca.code}`;
                                        const isExpanded = expandedRows.has(rowKey);
                                        const hasDetails = detailData[dca.code];

                                        return (
                                            <React.Fragment key={`dca-${dca.code}`}>
                                                <tr 
                                                    className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 cursor-pointer transition-all duration-300"
                                                    onClick={() => toggleRowExpansion(costCenter.ccCode, dca.code)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                                        <div className="flex items-center">
                                                            {isExpanded ? (
                                                                <ChevronUp className="h-5 w-5 mr-3 text-indigo-500" />
                                                            ) : (
                                                                <ChevronDown className="h-5 w-5 mr-3 text-indigo-500" />
                                                            )}
                                                            <span className="font-mono">{dca.code}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                        <div className="space-y-2">
                                                            <div className="font-medium">{dca.name}</div>
                                                            {!costCenter.isClosedStatus && dca.assignedBudget > 0 && (
                                                                <BudgetProgressBar 
                                                                    assigned={dca.assignedBudget}
                                                                    consumed={dca.consumedBudget}
                                                                    dcaName={dca.name}
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                    {!costCenter.isClosedStatus && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-semibold">
                                                            {formatCurrency(dca.assignedBudget)}
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-semibold">
                                                        {formatCurrency(dca.consumedBudget)}
                                                    </td>
                                                    {!costCenter.isClosedStatus && (
                                                        <td className={clsx(
                                                            "px-6 py-4 whitespace-nowrap text-sm text-right font-bold",
                                                            getBalanceColorClass(dca.balance)
                                                        )}>
                                                            {formatCurrency(dca.balance)}
                                                        </td>
                                                    )}
                                                </tr>

                                                {/* Enhanced Expanded Detail Rows with Totals */}
                                                {isExpanded && (
                                                    <tr>
                                                        <td colSpan={costCenter.isClosedStatus ? "3" : "5"} className="px-6 py-6 bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                                                            <DCADetailView 
                                                                hasDetails={hasDetails}
                                                                detailData={detailData}
                                                                loading={loading.dcaBudgetDetailedSummary}
                                                                dcaCode={dca.code}
                                                            />
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* Depreciation Section Header Row */}
                                    {costCenter.depreciationData && costCenter.depreciationData.length > 0 && (
                                        <tr className="bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900/40 dark:to-cyan-900/40">
                                            <td colSpan={costCenter.isClosedStatus ? "3" : "5"} className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gradient-to-r from-indigo-500 to-cyan-600 p-2 rounded-lg">
                                                        <Calculator className="h-5 w-5 text-white" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                                        Depreciation, Interest & Budget Transfer
                                                    </h4>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {/* Depreciation Rows */}
                                    {costCenter.depreciationData && costCenter.depreciationData.map((depreciation) => (
                                        <tr key={`dep-${depreciation.code}`} className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 hover:from-indigo-100 hover:to-cyan-100 dark:hover:from-indigo-800/30 dark:hover:to-cyan-800/30 transition-all duration-300">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                                <div className="flex items-center">
                                                    <Calculator className="h-4 w-4 mr-3 text-indigo-500" />
                                                    <span className="font-mono">{depreciation.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                <div className="font-medium">{depreciation.name}</div>
                                            </td>
                                            {!costCenter.isClosedStatus && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-semibold">
                                                    {formatCurrency(depreciation.assignedBudget)}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-semibold">
                                                {formatCurrency(depreciation.consumedBudget)}
                                            </td>
                                            {!costCenter.isClosedStatus && (
                                                <td className={clsx(
                                                    "px-6 py-4 whitespace-nowrap text-sm text-right font-bold",
                                                    getBalanceColorClass(depreciation.balance)
                                                )}>
                                                    {formatCurrency(depreciation.balance)}
                                                </td>
                                            )}
                                        </tr>
                                    ))}

                                    {/* Loading State for Depreciation */}
                                    {isStatusLoading && loading.ccDepreciationOverHead && (
                                        <tr className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20">
                                            <td colSpan={costCenter.isClosedStatus ? "3" : "5"} className="px-6 py-8 text-center">
                                                <div className="flex items-center justify-center">
                                                    <RotateCcw className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                                                    <p className="text-indigo-700 dark:text-indigo-300 font-medium">Loading depreciation data...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                                {/* Combined Total Footer */}
                                {!costCenter.isClosedStatus && (
                                    <tfoot className="bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                                        <tr>
                                            <td className="px-6 py-4"></td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">Total (DCA + Depreciation):</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                {formatCurrency(
                                                    costCenter.dcaBreakdown.reduce((sum, dca) => sum + dca.assignedBudget, 0) +
                                                    (costCenter.depreciationData || []).reduce((sum, dep) => sum + dep.assignedBudget, 0)
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                {formatCurrency(
                                                    costCenter.dcaBreakdown.reduce((sum, dca) => sum + dca.consumedBudget, 0) +
                                                    (costCenter.depreciationData || []).reduce((sum, dep) => sum + dep.consumedBudget, 0)
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                {formatCurrency(
                                                    costCenter.dcaBreakdown.reduce((sum, dca) => sum + dca.balance, 0) +
                                                    (costCenter.depreciationData || []).reduce((sum, dep) => sum + dep.balance, 0)
                                                )}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        {/* Enhanced Invoice Status Section with Clickable Options */}
                        {statusDataLoaded && isPerformingType && (
                            <InvoiceStatusSection 
                                costCenter={costCenter}
                                ccInvoiceSummaryData={ccInvoiceSummary}
                                loading={loading}
                                totalConsumedDCABudget={totalConsumedForInvoice}
                                onInvoiceClick={handleInvoiceClick}
                                onTransferBudgetClick={handleTransferBudgetClick}
                            />
                        )}
                    </div>
                ))}

                {/* Empty State */}
                {reportData.length === 0 && !isLoading && (
                    <div className="p-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Budget Data Found</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                Select your filters and click "View Report" to load comprehensive budget analysis data.
                            </p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && reportData.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Budget Data</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Fetching comprehensive budget report information...
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Modal */}
            <InvoiceModal
                isOpen={invoiceModalOpen}
                onClose={() => setInvoiceModalOpen(false)}
                invoiceData={allInvoiceByCCCode}
                loading={loading.allInvoiceByCCCode}
            />

            {/* Transfer Budget Modal */}
            <TransferBudgetModal
                isOpen={transferBudgetModalOpen}
                onClose={() => setTransferBudgetModalOpen(false)}
                transferData={budgetTransferSummaryPopup}
                loading={loading.budgetTransferSummaryPopup}
            />

            {/* Information Note */}
            {isPerformingType && (
                <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                            <p className="font-semibold mb-1 dark:text-indigo-200">Enhanced Features:</p>
                            <p className="dark:text-indigo-200 text-gray-600">
                                1. Click "Load Status Details" to load depreciation & invoice data<br/>
                                2. Click on clickable descriptions in invoice status to view detailed data<br/>
                                3. DCA detail view includes totals for all columns<br/>
                                4. Upload documents button appears when documents are available<br/>
                                5. Export options: Email (sends to registered email) and Direct Excel download<br/>
                                <strong>Available for Performing cost center types only.</strong>
                            </p>
                        </div>
                    </div>
                </div>
            )}

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

export default BudgetReport;