import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    Package2,
    DollarSign,
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
    X,
    Filter,
    RefreshCw,
    ChevronRight,
    Activity,
    ShoppingCart,
    Receipt,
    Building,
    IndianRupee
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchAssetSaleMainGrid,
    fetchAssetSaleInnerDetails,
    setFilters,
    clearFilters,
    resetAssetSalesData,
    resetMainGridData,
    resetInnerDetailsData,
    clearError,
    selectAssetSaleMainGrid,
    selectAssetSaleInnerDetails,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectHasAnyError
} from '../../slices/assetsSlice/assetSalesReportSlice';

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

// Modal Component for Asset Sale Details
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

// Asset Sale Details Modal Component
// Asset Sale Details Modal Component
const AssetSaleDetailsModal = ({ isOpen, onClose, detailsData, loading }) => {
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
            // Handle different date formats
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; // Return original if invalid
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    const details = Array.isArray(detailsData?.Data) ? detailsData.Data : 
                   Array.isArray(detailsData) ? detailsData : [];

    // Updated columns to match the actual API response structure
    const columns = [
        { 
            key: 'RequestNo',
            fallbackKeys: ['Reqno', 'ReferenceNo'],
            label: 'Request No' 
        },
        { 
            key: 'ItemCode', 
            fallbackKeys: ['AssetCode', 'Code'],
            label: 'Item Code' 
        },
        { 
            key: 'ItemName', 
            fallbackKeys: ['AssetName', 'Asset Name', 'Name', 'Description'],
            label: 'Asset Name' 
        },
        { 
            key: 'BuyerName', 
            fallbackKeys: ['CustomerName', 'Customer', 'Buyer'],
            label: 'Buyer Name' 
        },
        { 
            key: 'CreditAmount', 
            fallbackKeys: ['SellingAmt', 'SaleAmount', 'Amount', 'TotalAmount'],
            label: 'Credit Amount', 
            align: 'right',
            format: 'currency' 
        },
        { 
            key: 'BalanceAmt', 
            fallbackKeys: ['Balance', 'RemainingAmount'],
            label: 'Balance Amount', 
            align: 'right',
            format: 'currency' 
        },
        { 
            key: 'PaymentDate', 
            fallbackKeys: ['Date', 'SaleDate', 'TransactionDate'],
            label: 'Payment Date',
            format: 'date'
        },
        { 
            key: 'BankName', 
            fallbackKeys: ['Bank', 'BankAccount'],
            label: 'Bank Details' 
        },
        { 
            key: 'TransactionNo', 
            fallbackKeys: ['TxnNo', 'ReferenceNo'],
            label: 'Transaction No' 
        },
        { 
            key: 'TransactionStatus', 
            fallbackKeys: ['Status', 'PaymentStatus'],
            label: 'Status',
            format: 'status'
        }
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
            } else if (column.format === 'date') {
                return formatDate(value);
            } else if (column.format === 'status') {
                return (
                    <span className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        {
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': 
                                value === 'Approved' || value === 'Completed' || value === 'Success',
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': 
                                value === 'Pending' || value === 'Processing',
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': 
                                value === 'Rejected' || value === 'Failed' || value === 'Cancelled',
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200': 
                                !['Approved', 'Completed', 'Success', 'Pending', 'Processing', 'Rejected', 'Failed', 'Cancelled'].includes(value)
                        }
                    )}>
                        {value}
                    </span>
                );
            }
            return value;
        }
        
        return '-';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Asset Sale Transaction Details" size="full">
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <RotateCcw className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                    <p className="text-indigo-700 dark:text-indigo-300">Loading asset sale details...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Transaction Summary */}
                    {details.length > 0 && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                            <h4 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3">Transaction Summary</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Credit Amount</p>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(details.reduce((sum, item) => sum + (parseFloat(item.CreditAmount) || 0), 0))}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
                                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {details.length}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Status Overview</p>
                                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {details.filter(item => item.TransactionStatus === 'Approved').length} Approved
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Details Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    {columns.map((column) => (
                                        <th 
                                            key={column.key}
                                            className={clsx(
                                                "px-4 py-3 text-xs font-bold text-white uppercase tracking-wider",
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
                                                    "px-4 py-3 text-sm text-gray-900 dark:text-white",
                                                    column.align === 'right' ? 'text-right font-medium' : 'text-left'
                                                )}
                                            >
                                                {getCellValue(detail, column)}
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <Package2 className="h-12 w-12 text-gray-400 mb-4" />
                                                <p className="text-lg font-medium">No transaction details available</p>
                                                <p className="text-sm">The selected asset sale has no detailed transaction records.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Additional Information */}
                    {details.length > 0 && details[0] && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                            <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Additional Information</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {details[0].FromDate && (
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-400">From Date: </span>
                                        <span className="text-gray-900 dark:text-white">{formatDate(details[0].FromDate)}</span>
                                    </div>
                                )}
                                {details[0].ToDate && (
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-400">To Date: </span>
                                        <span className="text-gray-900 dark:text-white">{formatDate(details[0].ToDate)}</span>
                                    </div>
                                )}
                                {details[0].MOID && (
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-400">MO ID: </span>
                                        <span className="text-gray-900 dark:text-white">{details[0].MOID}</span>
                                    </div>
                                )}
                                {details[0].Rid && (
                                    <div>
                                        <span className="font-medium text-gray-600 dark:text-gray-400">Reference ID: </span>
                                        <span className="text-gray-900 dark:text-white">{details[0].Rid}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

// Summary Cards Component
const SummaryCards = ({ assetSaleData }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!assetSaleData || !Array.isArray(assetSaleData.Data) || assetSaleData.Data.length === 0) {
        return null;
    }

    // Calculate summary from asset sale data
    const summary = assetSaleData.Data.reduce((acc, item) => {
        acc.totalSales += parseFloat(item.SellingAmt || item.TotalAmount || item.SaleAmount || 0);
        acc.totalQuantity += 1;
        acc.saleCount += 1;
        
        // Calculate average sale amount
        if (acc.saleCount > 0) {
            acc.averageSale = acc.totalSales / acc.saleCount;
        }
        
        return acc;
    }, {
        totalSales: 0,
        totalQuantity: 0,
        saleCount: 0,
        averageSale: 0
    });

    const cards = [
        {
            title: 'Total Sales Value',
            value: summary.totalSales,
            icon: IndianRupee,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Total Quantity Sold',
            value: summary.totalQuantity,
            icon: Package2,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            isCount: true
        },
        {
            title: 'Average Sale Amount',
            value: summary.averageSale,
            icon: TrendingUp,
            color: 'from-purple-500 to-indigo-600',
            bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
        },
        {
            title: 'Total Transactions',
            value: summary.saleCount,
            icon: ArrowRightLeft,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
            isCount: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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

const AssetSalesReportPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const assetSaleMainGrid = useSelector(selectAssetSaleMainGrid);
    const assetSaleInnerDetails = useSelector(selectAssetSaleInnerDetails);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        Fdate: '',
        TDate: ''
    });

    // Modal state
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);

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
        dispatch(resetMainGridData());
    };

    // Handle date changes
    const handleDateChange = (filterName, dateValue) => {
        const dateString = convertDateToString(dateValue);
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: dateString
        }));
        
        dispatch(resetMainGridData());
    };

    // Handle view button click
    const handleView = async () => {
        // Validation
        if (!localFilters.Fdate || !localFilters.TDate) {
            toast.warning('Please select both from and to dates');
            return;
        }

        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));
            
            // Fetch asset sale main grid
            const params = {
                Fdate: localFilters.Fdate,
                TDate: localFilters.TDate
            };
            
            await dispatch(fetchAssetSaleMainGrid(params)).unwrap();
            toast.success('Asset sales report loaded successfully');
            
        } catch (error) {
            console.error('❌ Error fetching asset sales report:', error);
            toast.error('Failed to fetch asset sales report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            Fdate: '',
            TDate: ''
        });
        dispatch(clearFilters());
        dispatch(resetAssetSalesData());
    };

    // Handle row click to view asset sale details
    const handleRowClick = async (rowData) => {
        try {
            setSelectedRowData(rowData);
            setIsDetailsModalOpen(true);
            
            // Fetch asset sale inner details using request number
            const params = {
                Reqno: rowData.Reqno || rowData.RequestNo || rowData.ReferenceNo || ''
            };
            
            await dispatch(fetchAssetSaleInnerDetails(params)).unwrap();
            
        } catch (error) {
            console.error('❌ Error fetching asset sale details:', error);
            toast.error('Failed to load asset sale details');
            setIsDetailsModalOpen(false);
        }
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = assetSaleMainGrid?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Sale Date': item.Date || item.SaleDate || '-',
                'Request No': item.Reqno || item.RequestNo || '-',
                'Asset Description': item.ItemCode || item.Description || '-',
                'Customer': item.CustomerName || item.Customer || '-',
                'Sale Amount': item.SellingAmt || item.SaleAmount || 0,
                'Quantity': item.Quantity || item.Qty || 0,
                'Status': item.Status || '-',
                'Remarks': item.Remarks || '-'
            }));

            const filename = `Asset_Sales_Report_${localFilters.Fdate}_to_${localFilters.TDate}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get asset sale data for display
    const assetSaleData = assetSaleMainGrid?.Data || [];

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Package2 className="h-8 w-8 text-indigo-600" />
                            Asset Sales Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View and analyze asset sales transactions with detailed breakdowns
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Asset Management
                        </div>
                        {loading.assetSaleMainGrid && (
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
                        <span>Assets</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Asset Sales Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* From Date */}
                    <div>
                        <CustomDatePicker
                            label="From Date"
                            placeholder="Select from date"
                            value={formatDateForDisplay(localFilters.Fdate)}
                            onChange={(date) => handleDateChange('Fdate', date)}
                            maxDate={formatDateForDisplay(localFilters.TDate) || new Date()}
                            size="md"
                            required
                        />
                    </div>

                    {/* To Date */}
                    <div>
                        <CustomDatePicker
                            label="To Date"
                            placeholder="Select to date"
                            value={formatDateForDisplay(localFilters.TDate)}
                            onChange={(date) => handleDateChange('TDate', date)}
                            minDate={formatDateForDisplay(localFilters.Fdate)}
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
                            disabled={isAnyLoading || !localFilters.Fdate || !localFilters.TDate}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.assetSaleMainGrid ? (
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
                        <Tooltip content="Download asset sales report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(assetSaleData) || assetSaleData.length === 0}
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
            <SummaryCards assetSaleData={assetSaleMainGrid} />

            {/* Asset Sales Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(assetSaleData) && assetSaleData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Sale Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Request No</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Item Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Asset Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Sale Amount</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {assetSaleData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.Date || item.SaleDate || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.Reqno || item.RequestNo || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.AssetName || item.Description}>
                                                {item.ItemCode  || item.Description || '-'}
                                            </div>
                                        </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.AssetName || item.Description}>
                                                {item.ItemName  || item.Description || '-'}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {item.BuyerName || item.Customer || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            <span className="text-green-600 dark:text-green-400">
                                                {formatCurrency(item.SellingAmt || item.SaleAmount || 0)}
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
                        {!loading.assetSaleMainGrid && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Asset Sales Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select your date range and click "View Report" to load your asset sales data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.assetSaleMainGrid && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Asset Sales Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching asset sales data for the selected period...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Asset Sale Details Modal */}
            <AssetSaleDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                detailsData={assetSaleInnerDetails}
                loading={loading.assetSaleInnerDetails}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Asset Sales Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Date Range:</strong> Both from and to dates are required for report generation<br/>
                            2. <strong>Click Actions:</strong> Click the eye icon on any row to view detailed asset sale information<br/>
                            3. <strong>Summary Cards:</strong> View total sales value, quantity sold, average sale amount, and transaction count<br/>
                            4. <strong>Export:</strong> Download asset sales data as Excel file for offline analysis<br/>
                            5. <strong>Real-time Loading:</strong> Visual feedback during data fetching operations<br/>
                            6. <strong>Error Handling:</strong> Toast notifications for errors with automatic error clearing<br/>
                            7. <strong>Status Indicators:</strong> Color-coded status badges for easy identification<br/>
                            8. <strong>Responsive Design:</strong> Optimized for both desktop and mobile viewing
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
export default AssetSalesReportPage;