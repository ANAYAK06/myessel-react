import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    FileText,
    Receipt,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    Calendar,
    Building,
    TrendingUp,
    TrendingDown,
    DollarSign,
    X,
    Filter,
    RefreshCw,
    ChevronRight,
    Activity,
    CheckCircle,
    Clock,
    XCircle,
    IndianRupee,
    Hash,
    Truck
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchGstPurchaseConsolidateTaxNos,
    fetchGstPurchaseConsolidateReportGrid,
    setFilters,
    clearFilters,
    resetReportData,
    resetAllData,
    clearError,
    selectGstPurchaseConsolidateTaxNos,
    selectGstPurchaseConsolidateReportGrid,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading
} from '../../slices/gstSlice/gstReportSlice';

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

// Modal Component for Invoice Details
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

// Invoice Details Modal Component
const InvoiceDetailsModal = ({ isOpen, onClose, invoiceData }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN');
        } catch {
            return dateString;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invoice Details" size="lg">
            {invoiceData ? (
                <div className="space-y-6">
                    {/* Invoice Information */}
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Invoice Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Invoice Number</p>
                                <p className="text-base text-gray-900 dark:text-white">{invoiceData.InvoiceNo || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Invoice Date</p>
                                <p className="text-base text-gray-900 dark:text-white">{formatDate(invoiceData.InvoiceDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Supplier Name</p>
                                <p className="text-base text-gray-900 dark:text-white">{invoiceData.SupplierName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Supplier GSTIN</p>
                                <p className="text-base text-gray-900 dark:text-white">{invoiceData.SupplierGSTIN || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Company Information */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Company Information</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Company GSTIN</p>
                                <p className="text-base text-gray-900 dark:text-white">{invoiceData.CompanyGSTIN || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Amount Details */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Amount & Tax Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Invoice Amount</p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                    ₹{formatCurrency(invoiceData.InvoiceAmount || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                    ₹{formatCurrency(invoiceData.Total || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">IGST Rate</p>
                                <p className="text-base text-green-600 dark:text-green-400 font-medium">
                                    ₹{formatCurrency(invoiceData.IGSTRate || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CGST Rate</p>
                                <p className="text-base text-green-600 dark:text-green-400 font-medium">
                                    ₹{formatCurrency(invoiceData.CGSTRate || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SGST Rate</p>
                                <p className="text-base text-green-600 dark:text-green-400 font-medium">
                                    ₹{formatCurrency(invoiceData.SGSTRate || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Other Charges</p>
                                <p className="text-base text-orange-600 dark:text-orange-400 font-medium">
                                    ₹{formatCurrency(invoiceData.Other || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Deduction</p>
                                <p className="text-base text-red-600 dark:text-red-400 font-medium">
                                    ₹{formatCurrency(invoiceData.Deduction || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Freight</p>
                                <p className="text-base text-indigo-600 dark:text-indigo-400 font-medium">
                                    ₹{formatCurrency(invoiceData.Frieght || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No invoice details available</p>
                </div>
            )}
        </Modal>
    );
};

// Summary Cards Component
const SummaryCards = ({ consolidatedData }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!consolidatedData || !Array.isArray(consolidatedData.Data) || consolidatedData.Data.length === 0) {
        return null;
    }

    const data = consolidatedData.Data;
    const totalInvoices = data.length;
    
    // Calculate totals
    const totalInvoiceAmount = data.reduce((sum, item) => sum + (parseFloat(item.InvoiceAmount) || 0), 0);
    const totalAmount = data.reduce((sum, item) => sum + (parseFloat(item.Total) || 0), 0);
    const totalIGST = data.reduce((sum, item) => sum + (parseFloat(item.IGSTRate) || 0), 0);
    const totalCGST = data.reduce((sum, item) => sum + (parseFloat(item.CGSTRate) || 0), 0);
    const totalSGST = data.reduce((sum, item) => sum + (parseFloat(item.SGSTRate) || 0), 0);
    const totalTax = totalIGST + totalCGST + totalSGST;

    const cards = [
        {
            title: 'Total Invoices',
            value: totalInvoices,
            icon: Receipt,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            isCount: true,
            subtitle: 'Purchase invoices'
        },
        {
            title: 'Total Invoice Amount',
            value: totalInvoiceAmount,
            icon: IndianRupee,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            isCount: false,
            subtitle: 'Before taxes'
        },
        {
            title: 'Total Tax Amount',
            value: totalTax,
            icon: FileText,
            color: 'from-yellow-500 to-orange-600',
            bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
            isCount: false,
            subtitle: 'IGST + CGST + SGST'
        },
        {
            title: 'Final Total Amount',
            value: totalAmount,
            icon: CheckCircle,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'from-purple-50 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/20',
            isCount: false,
            subtitle: 'Including all charges'
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

const ConsolidatedGSTReportPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const gstPurchaseConsolidateTaxNos = useSelector(selectGstPurchaseConsolidateTaxNos);
    const gstPurchaseConsolidateReportGrid = useSelector(selectGstPurchaseConsolidateReportGrid);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        taxno: '',
        fromDate: '',
        toDate: ''
    });

    // Modal state
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);

    // Track initialization
    const [hasInitialized, setHasInitialized] = useState(false);

    // Load tax numbers on component mount
    useEffect(() => {
        if (!hasInitialized) {
            dispatch(fetchGstPurchaseConsolidateTaxNos())
                .unwrap()
                .then((response) => {
                    console.log('✅ GST Tax Numbers loaded successfully');
                    setHasInitialized(true);
                })
                .catch((error) => {
                    console.error('❌ Failed to load GST Tax Numbers:', error);
                    toast.error('Failed to load tax numbers');
                    setHasInitialized(true);
                });
        }
    }, [dispatch, hasInitialized]);

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

    // Handle date changes
    const handleDateChange = (filterName, dateValue) => {
        const dateString = convertDateToString(dateValue);
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: dateString
        }));
    };

    // Handle refresh tax numbers
    const handleRefreshTaxNumbers = async () => {
        try {
            await dispatch(fetchGstPurchaseConsolidateTaxNos()).unwrap();
            toast.success('Tax numbers refreshed successfully');
        } catch (error) {
            console.error('❌ Failed to refresh Tax Numbers:', error);
            toast.error('Failed to refresh tax numbers. Please try again.');
        }
    };

    // Handle view button click
    const handleView = async () => {
        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));
            
            // Prepare params
            const params = {
                taxno: localFilters.taxno || '',
                fromDate: localFilters.fromDate || '',
                toDate: localFilters.toDate || ''
            };
            
            await dispatch(fetchGstPurchaseConsolidateReportGrid(params)).unwrap();
            toast.success('Consolidated GST report loaded successfully');
            
        } catch (error) {
            console.error('❌ Error fetching consolidated GST report:', error);
            toast.error('Failed to fetch consolidated GST report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            taxno: '',
            fromDate: '',
            toDate: ''
        });
        dispatch(resetAllData());
    };

    // Handle row click to view invoice details
    const handleRowClick = (invoiceData) => {
        setSelectedInvoiceData(invoiceData);
        setIsDetailsModalOpen(true);
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = gstPurchaseConsolidateReportGrid?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Company GSTIN': item.CompanyGSTIN || '-',
                'Supplier Name': item.SupplierName || '-',
                'Supplier GSTIN': item.SupplierGSTIN || '-',
                'Invoice Number': item.InvoiceNo || '-',
                'Invoice Date': item.InvoiceDate || '-',
                'Invoice Amount': item.InvoiceAmount || 0,
                'IGST Rate': item.IGSTRate || 0,
                'CGST Rate': item.CGSTRate || 0,
                'SGST Rate': item.SGSTRate || 0,
                'Other': item.Other || 0,
                'Deduction': item.Deduction || 0,
                'Freight': item.Frieght || 0,
                'Total': item.Total || 0
            }));

            const filename = `Consolidated_GST_Report_${localFilters.taxno || 'All'}_${localFilters.fromDate || 'NoFromDate'}_to_${localFilters.toDate || 'NoToDate'}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get consolidated report data for display
    const consolidatedReportData = gstPurchaseConsolidateReportGrid?.Data || [];

    // Helper function to get tax number options
    const getTaxNumberOptions = () => {
        if (!gstPurchaseConsolidateTaxNos) {
            return [];
        }

        // Handle different response structures
        let data = [];
        if (Array.isArray(gstPurchaseConsolidateTaxNos)) {
            data = gstPurchaseConsolidateTaxNos;
        } else if (gstPurchaseConsolidateTaxNos.Data && Array.isArray(gstPurchaseConsolidateTaxNos.Data)) {
            data = gstPurchaseConsolidateTaxNos.Data;
        } else if (gstPurchaseConsolidateTaxNos.data && Array.isArray(gstPurchaseConsolidateTaxNos.data)) {
            data = gstPurchaseConsolidateTaxNos.data;
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
                            <Receipt className="h-8 w-8 text-indigo-600" />
                            Consolidated GST Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View consolidated GST purchase report with invoice-wise tax details
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            GST Reports
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
                        <span>GST Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Consolidated Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Tax Number Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Hash className="w-4 h-4 inline mr-2" />
                            Tax Number
                            <button
                                onClick={handleRefreshTaxNumbers}
                                disabled={loading.gstPurchaseConsolidateTaxNos}
                                className="ml-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                title="Refresh Tax Numbers"
                            >
                                <RefreshCw className={`w-4 h-4 inline ${loading.gstPurchaseConsolidateTaxNos ? 'animate-spin' : ''}`} />
                            </button>
                        </label>
                        <select
                            value={localFilters.taxno}
                            onChange={(e) => handleFilterChange('taxno', e.target.value)}
                            disabled={loading.gstPurchaseConsolidateTaxNos}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">All Tax Numbers</option>
                            {getTaxNumberOptions().map((taxItem, index) => {
                                const taxNo = taxItem?.Tax_Id || taxItem?.taxno || taxItem?.TaxNumber || taxItem?.tax_no;
                                const taxName = taxItem?.Tax_Name || taxItem?.name || taxItem?.description;

                                if (!taxNo) {
                                    return null;
                                }
                                
                                return (
                                    <option key={index} value={taxNo}>
                                        {taxName ? `  ${taxName}` : ''}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.gstPurchaseConsolidateTaxNos && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 flex items-center">
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Loading tax numbers...
                            </p>
                        )}
                        
                        {errors.gstPurchaseConsolidateTaxNos && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                                Failed to load tax numbers. 
                                <button 
                                    onClick={handleRefreshTaxNumbers}
                                    className="ml-1 underline hover:no-underline"
                                >
                                    Retry
                                </button>
                            </p>
                        )}

                        {/* Status info */}
                        <div className="text-xs text-gray-500 mt-2">
                            Available options: {getTaxNumberOptions().length}
                            {localFilters.taxno && <span className="text-green-600"> | Selected: {localFilters.taxno}</span>}
                        </div>
                    </div>

                    {/* From Date */}
                    <div>
                        <CustomDatePicker
                            label="From Date"
                            placeholder="Select from date (optional)"
                            value={formatDateForDisplay(localFilters.fromDate)}
                            onChange={(date) => handleDateChange('fromDate', date)}
                            maxDate={formatDateForDisplay(localFilters.toDate) || new Date()}
                            size="md"
                            required={false}
                        />
                    </div>

                    {/* To Date */}
                    <div>
                        <CustomDatePicker
                            label="To Date"
                            placeholder="Select to date (optional)"
                            value={formatDateForDisplay(localFilters.toDate)}
                            onChange={(date) => handleDateChange('toDate', date)}
                            minDate={formatDateForDisplay(localFilters.fromDate)}
                            maxDate={new Date()}
                            size="md"
                            required={false}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isAnyLoading}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.gstPurchaseConsolidateReportGrid ? (
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
                        <Tooltip content="Download consolidated GST report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(consolidatedReportData) || consolidatedReportData.length === 0}
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
            <SummaryCards consolidatedData={gstPurchaseConsolidateReportGrid} />

            {/* Consolidated GST Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(consolidatedReportData) && consolidatedReportData.length > 0 ? (
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Supplier Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Invoice Details</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Invoice Amount</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">IGST</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">CGST</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">SGST</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Other Charges</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Total Amount</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {consolidatedReportData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs">
                                                <div className="font-medium truncate" title={item.SupplierName}>
                                                    {item.SupplierName || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={item.SupplierGSTIN}>
                                                    GSTIN: {item.SupplierGSTIN || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-sm">
                                                <div className="font-medium truncate" title={item.InvoiceNo}>
                                                    {item.InvoiceNo || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(item.InvoiceDate)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                            ₹{formatCurrency(item.InvoiceAmount || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                                ₹{formatCurrency(item.IGSTRate || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                            <span className="text-green-600 dark:text-green-400 font-medium">
                                                ₹{formatCurrency(item.CGSTRate || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                            <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                                ₹{formatCurrency(item.SGSTRate || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                            <div className="text-xs space-y-1">
                                                <div className="text-orange-600 dark:text-orange-400">
                                                    Other: ₹{formatCurrency(item.Other || 0)}
                                                </div>
                                                <div className="text-red-600 dark:text-red-400">
                                                    Deduction: ₹{formatCurrency(item.Deduction || 0)}
                                                </div>
                                                <div className="text-indigo-600 dark:text-indigo-400">
                                                    Freight: ₹{formatCurrency(item.Frieght || 0)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                            <span className="text-purple-600 dark:text-purple-400 text-lg">
                                                ₹{formatCurrency(item.Total || 0)}
                                            </span>
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
                        {!loading.gstPurchaseConsolidateReportGrid && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Consolidated GST Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select your filters and click "View Report" to load the consolidated GST report. Date filters are optional.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.gstPurchaseConsolidateReportGrid && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Consolidated GST Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching consolidated GST report data...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Invoice Details Modal */}
            <InvoiceDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                invoiceData={selectedInvoiceData}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Consolidated GST Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Tax Number Filter:</strong> Select specific tax numbers or view all consolidated data<br/>
                            2. <strong>Date Range:</strong> Optional from and to date filters for targeted reporting<br/>
                            3. <strong>Invoice Details:</strong> Click the eye icon to view complete invoice information<br/>
                            4. <strong>Tax Breakdown:</strong> View IGST, CGST, SGST amounts separately<br/>
                            5. <strong>Summary Cards:</strong> Overview of total invoices, amounts, and tax calculations<br/>
                            6. <strong>Additional Charges:</strong> Track other charges, deductions, and freight<br/>
                            7. <strong>Export:</strong> Download consolidated GST data as Excel file for analysis<br/>
                            8. <strong>Supplier Information:</strong> View supplier GSTIN and company details
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

export default ConsolidatedGSTReportPage;