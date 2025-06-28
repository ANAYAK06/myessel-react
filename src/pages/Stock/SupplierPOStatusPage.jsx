import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    Building2,
    Package,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    Calendar,
    Truck,
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
    Building,
    IndianRupee
    
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchViewPurchaseStatusGrid,
    fetchPurchaseCostCenterCodes,
    setFilters,
    clearFilters,
    resetPurchaseData,
    resetAllData,
    clearError,
    selectViewPurchaseStatusGrid,
    selectPurchaseCostCenterCodes,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectPurchaseSummary
} from '../../slices/stockSlice/supplierPOStatusSlice';

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

// Modal Component for PO Details
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

// PO Details Modal Component
const PODetailsModal = ({ isOpen, onClose, poData }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatQuantity = (qty) => {
        if (!qty && qty !== 0) return '0.0000';
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 4
        }).format(qty);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Purchase Order Details" size="lg">
            {poData ? (
                <div className="space-y-6">
                    {/* PO Information */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Purchase Order Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">PO Number</p>
                                <p className="text-base text-gray-900 dark:text-white">{poData.PoNo || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Supplier Name</p>
                                <p className="text-base text-gray-900 dark:text-white">{poData.SupplierName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">HSN Code</p>
                                <p className="text-base text-gray-900 dark:text-white">{poData.HSNCode || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">PO Status</p>
                                <span className={clsx(
                                    "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                                    poData.PoStatus === 'Running' 
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        : poData.PoStatus === 'Closed' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                )}>
                                    {poData.PoStatus || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Item Details */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Item Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Item Code</p>
                                <p className="text-base text-gray-900 dark:text-white">{poData.Itemcode || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Item Name</p>
                                <p className="text-base text-gray-900 dark:text-white">{poData.ItemName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unit</p>
                                <p className="text-base text-gray-900 dark:text-white">{poData.Units || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">PO Rate</p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                    ₹{formatCurrency(poData.PORate || 0)}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Specification</p>
                                <p className="text-base text-gray-900 dark:text-white">{poData.Specification || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quantity & Amount Details */}
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quantity & Amount Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Initial PO Quantity</p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {formatQuantity(poData.InitialPOQty || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Total PO Quantity</p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {formatQuantity(poData.CurrentTotalPoQty || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">PO Amount</p>
                                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                    ₹{formatCurrency(poData.POAmount || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Received Quantity</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                    {formatQuantity(poData.RecievedQty || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance Quantity</p>
                                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                    {formatQuantity(poData.BalQty || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance Amount</p>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                    ₹{formatCurrency(poData.BalanceAmount || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Amendment Details */}
                    {(poData.AmendNo > 0 || poData.AmendAddQty > 0 || poData.AmendSubQty > 0) && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Amendment Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Amendment No</p>
                                    <p className="text-base text-gray-900 dark:text-white">{poData.AmendNo || '0'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Amendment Add Qty</p>
                                    <p className="text-base text-gray-900 dark:text-white">{formatQuantity(poData.AmendAddQty || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Amendment Sub Qty</p>
                                    <p className="text-base text-gray-900 dark:text-white">{formatQuantity(poData.AmendSubQty || 0)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No purchase order details available</p>
                </div>
            )}
        </Modal>
    );
};

// Summary Cards Component
// Enhanced Summary Cards Component with Dynamic Status Counts and Additional Insights
const SummaryCards = ({ purchaseStatusData, summary }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!purchaseStatusData || !Array.isArray(purchaseStatusData.Data) || purchaseStatusData.Data.length === 0) {
        return null;
    }

    // Calculate comprehensive statistics from actual data
    const data = purchaseStatusData.Data;
    const totalOrders = data.length;
    
    // Count orders by status (case-insensitive)
    const runningOrders = data.filter(item => 
        item.PoStatus && item.PoStatus.toLowerCase() === 'running'
    ).length;
    
    const closedOrders = data.filter(item => 
        item.PoStatus && item.PoStatus.toLowerCase() === 'closed'
    ).length;
    
    const otherStatusOrders = totalOrders - runningOrders - closedOrders;
    
    // Calculate amounts
    const totalAmount = data.reduce((sum, item) => {
        const amount = parseFloat(item.POAmount) || 0;
        return sum + amount;
    }, 0);
    
    const runningAmount = data
        .filter(item => item.PoStatus && item.PoStatus.toLowerCase() === 'running')
        .reduce((sum, item) => sum + (parseFloat(item.POAmount) || 0), 0);
    
    const closedAmount = data
        .filter(item => item.PoStatus && item.PoStatus.toLowerCase() === 'closed')
        .reduce((sum, item) => sum + (parseFloat(item.POAmount) || 0), 0);

    // Calculate balance amounts
    const totalBalanceAmount = data.reduce((sum, item) => {
        const balance = parseFloat(item.BalanceAmount) || 0;
        return sum + balance;
    }, 0);

    const cards = [
        {
            title: 'Total Orders',
            value: totalOrders,
            icon: Package,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            isCount: true,
            subtitle: otherStatusOrders > 0 ? `+${otherStatusOrders} other status` : 'All categorized'
        },
        {
            title: 'Total PO Amount',
            value: totalAmount,
            icon: IndianRupee,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            isCount: false,
            subtitle: `Balance: ₹${formatCurrency(totalBalanceAmount)}`
        },
        {
            title: 'Running Orders',
            value: runningOrders,
            icon: Clock,
            color: 'from-yellow-500 to-orange-600',
            bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
            isCount: true,
            subtitle: totalOrders > 0 ? `${((runningOrders / totalOrders) * 100).toFixed(1)}% of total` : '0% of total',
            amount: runningAmount
        },
        {
            title: 'Closed Orders',
            value: closedOrders,
            icon: CheckCircle,
            color: 'from-green-500 to-green-600',
            bgColor: 'from-green-50 to-green-50 dark:from-green-900/20 dark:to-green-900/20',
            isCount: true,
            subtitle: totalOrders > 0 ? `${((closedOrders / totalOrders) * 100).toFixed(1)}% of total` : '0% of total',
            amount: closedAmount
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
                            {/* Show additional info */}
                            {card.subtitle && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {card.subtitle}
                                </p>
                            )}
                            {/* Show amount for status cards */}
                            {card.amount !== undefined && (
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
                                    Amount: ₹{formatCurrency(card.amount)}
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

const SupplierPOStatusPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const viewPurchaseStatusGrid = useSelector(selectViewPurchaseStatusGrid);
    const purchaseCostCenterCodes = useSelector(selectPurchaseCostCenterCodes);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const purchaseSummary = useSelector(selectPurchaseSummary);

    // Get userData from auth state (includes UID and roleId)
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        CCode: '',
        Fromdate: '',
        Todate: ''
    });

    // Modal state
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedPOData, setSelectedPOData] = useState(null);

    // Track initialization
    const [hasInitialized, setHasInitialized] = useState(false);

    // Load cost center codes when userData is available
    useEffect(() => {
        if (uid && roleId && !hasInitialized) {
            const params = {
                UID: uid,
                RID: roleId
            };
            
            dispatch(fetchPurchaseCostCenterCodes(params))
                .unwrap()
                .then((response) => {
                    console.log('✅ Purchase Cost Center Codes loaded successfully');
                    setHasInitialized(true);
                })
                .catch((error) => {
                    console.error('❌ Failed to load Purchase Cost Center Codes:', error);
                    toast.error('Failed to load cost center codes');
                    setHasInitialized(true);
                });
        }
    }, [dispatch, uid, roleId, hasInitialized]);

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

    // Format quantity
    const formatQuantity = (qty) => {
        if (!qty && qty !== 0) return '0.0000';
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 4
        }).format(qty);
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

    // Handle refresh cost center codes
    const handleRefreshCostCenterCodes = async () => {
        try {
            if (uid && roleId) {
                const params = {
                    UID: uid,
                    RID: roleId
                };
                
                await dispatch(fetchPurchaseCostCenterCodes(params)).unwrap();
                toast.success('Cost center codes refreshed successfully');
            } else {
                toast.warning('User credentials not available. Please try logging in again.');
            }
            
        } catch (error) {
            console.error('❌ Failed to refresh Cost Center Codes:', error);
            toast.error('Failed to refresh cost center codes. Please try again.');
        }
    };

    // Handle view button click
    const handleView = async () => {
        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));
            
            // Prepare params with UID and RID
            const params = {
                CCode: localFilters.CCode || '',
                Fromdate: localFilters.Fromdate || '',
                Todate: localFilters.Todate || '',
                UID: uid,
                RID: roleId
            };
            
            await dispatch(fetchViewPurchaseStatusGrid(params)).unwrap();
            toast.success('Supplier PO status loaded successfully');
            
        } catch (error) {
            console.error('❌ Error fetching supplier PO status:', error);
            toast.error('Failed to fetch supplier PO status. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            CCode: '',
            Fromdate: '',
            Todate: ''
        });
        dispatch(resetAllData());
    };

    // Handle row click to view PO details
    const handleRowClick = (poData) => {
        setSelectedPOData(poData);
        setIsDetailsModalOpen(true);
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = viewPurchaseStatusGrid?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Supplier Name': item.SupplierName || '-',
                'PO Number': item.PoNo || '-',
                'HSN Code': item.HSNCode || '-',
                'Item Code': item.Itemcode || '-',
                'Item Name': item.ItemName || '-',
                'Specification': item.Specification || '-',
                'Unit': item.Units || '-',
                'PO Rate': item.PORate || 0,
                'Initial PO Qty': item.InitialPOQty || 0,
                'Current Total PO Qty': item.CurrentTotalPoQty || 0,
                'PO Amount': item.POAmount || 0,
                'Received Qty': item.RecievedQty || 0,
                'Balance Qty': item.BalQty || 0,
                'Balance Amount': item.BalanceAmount || 0,
                'PO Status': item.PoStatus || '-'
            }));

            const filename = `Supplier_PO_Status_${localFilters.CCode || 'All'}_${localFilters.Fromdate || 'NoFromDate'}_to_${localFilters.Todate || 'NoToDate'}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get purchase status data for display
    const purchaseStatusData = viewPurchaseStatusGrid?.Data || [];

    // Helper function to get cost center options
    const getCostCenterOptions = () => {
        if (!purchaseCostCenterCodes) {
            return [];
        }

        // Handle different response structures
        let data = [];
        if (Array.isArray(purchaseCostCenterCodes)) {
            data = purchaseCostCenterCodes;
        } else if (purchaseCostCenterCodes.Data && Array.isArray(purchaseCostCenterCodes.Data)) {
            data = purchaseCostCenterCodes.Data;
        } else if (purchaseCostCenterCodes.data && Array.isArray(purchaseCostCenterCodes.data)) {
            data = purchaseCostCenterCodes.data;
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
                            <Truck className="h-8 w-8 text-indigo-600" />
                            Supplier PO Status
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Monitor and track purchase order status across suppliers with detailed analysis
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Purchase Management
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
                        <span>Purchase</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Supplier PO Status</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Cost Center Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Building className="w-4 h-4 inline mr-2" />
                            Cost Center
                            <button
                                onClick={handleRefreshCostCenterCodes}
                                disabled={loading.purchaseCostCenterCodes}
                                className="ml-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                title="Refresh Cost Center Codes"
                            >
                                <RefreshCw className={`w-4 h-4 inline ${loading.purchaseCostCenterCodes ? 'animate-spin' : ''}`} />
                            </button>
                        </label>
                        <select
                            value={localFilters.CCode}
                            onChange={(e) => handleFilterChange('CCode', e.target.value)}
                            disabled={loading.purchaseCostCenterCodes}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">All Cost Centers</option>
                            {getCostCenterOptions().map((costCenter, index) => {
                                const ccCode = costCenter?.CCID || costCenter?.ccVal || costCenter?.code || costCenter?.CCCode;
                                const ccName = costCenter?.CCVAL || costCenter?.ccName || costCenter?.name || costCenter?.CCName;
                                const ccId = costCenter?.CCID || costCenter?.ccId || costCenter?.id || costCenter?.CCId;
                                
                                if (!ccCode) {
                                    return null;
                                }
                                
                                return (
                                    <option key={ccId || index} value={ccCode}>
                                        {ccCode}{ccName ? ` - ${ccName}` : ''}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.purchaseCostCenterCodes && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 flex items-center">
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Loading cost centers...
                            </p>
                        )}
                        
                        {errors.purchaseCostCenterCodes && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                                Failed to load cost centers. 
                                <button 
                                    onClick={handleRefreshCostCenterCodes}
                                    className="ml-1 underline hover:no-underline"
                                >
                                    Retry
                                </button>
                            </p>
                        )}

                        {/* Status info */}
                        <div className="text-xs text-gray-500 mt-2">
                            Available options: {getCostCenterOptions().length}
                            {localFilters.CCode && <span className="text-green-600"> | Selected: {localFilters.CCode}</span>}
                            {!uid && <span className="text-red-500"> | Missing UID</span>}
                            {!roleId && <span className="text-red-500"> | Missing RoleID</span>}
                        </div>
                    </div>

                    {/* From Date */}
                    <div>
                        <CustomDatePicker
                            label="From Date"
                            placeholder="Select from date (optional)"
                            value={formatDateForDisplay(localFilters.Fromdate)}
                            onChange={(date) => handleDateChange('Fromdate', date)}
                            maxDate={formatDateForDisplay(localFilters.Todate) || new Date()}
                            size="md"
                            required={false}
                        />
                    </div>

                    {/* To Date */}
                    <div>
                        <CustomDatePicker
                            label="To Date"
                            placeholder="Select to date (optional)"
                            value={formatDateForDisplay(localFilters.Todate)}
                            onChange={(date) => handleDateChange('Todate', date)}
                            minDate={formatDateForDisplay(localFilters.Fromdate)}
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
                            disabled={isAnyLoading || !uid || !roleId}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.viewPurchaseStatusGrid ? (
                                <RotateCcw className="h-5 w-5 animate-spin" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                            View PO Status
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
                        <Tooltip content="Download supplier PO status as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(purchaseStatusData) || purchaseStatusData.length === 0}
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
            <SummaryCards purchaseStatusData={viewPurchaseStatusGrid} summary={purchaseSummary} />

            {/* Supplier PO Status Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(purchaseStatusData) && purchaseStatusData.length > 0 ? (
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Supplier Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">PO Number</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Item Details</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">PO Amount</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Received Qty</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Balance Qty</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Balance Amount</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {purchaseStatusData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate font-medium" title={item.SupplierName}>
                                                {item.SupplierName || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                            {item.PoNo || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-sm">
                                                <div className="font-medium truncate" title={item.ItemName}>
                                                    {item.ItemName || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={item.Specification}>
                                                    {item.Specification || '-'}
                                                </div>
                                                <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                                    {item.Itemcode || '-'} | {item.Units || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                            ₹{formatCurrency(item.POAmount || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            <span className="text-green-600 dark:text-green-400">
                                                {formatQuantity(item.RecievedQty || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            <span className="text-orange-600 dark:text-orange-400">
                                                {formatQuantity(item.BalQty || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                            <span className="text-red-600 dark:text-red-400">
                                                ₹{formatCurrency(item.BalanceAmount || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={clsx(
                                                "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                                                item.PoStatus === 'Running' 
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    : item.PoStatus === 'Closed' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                            )}>
                                                {item.PoStatus || 'Unknown'}
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
                        {!loading.viewPurchaseStatusGrid && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Supplier PO Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select your filters and click "View PO Status" to load supplier purchase order data. Date filters are optional.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.viewPurchaseStatusGrid && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Supplier PO Status</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching purchase order status data...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* PO Details Modal */}
            <PODetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                poData={selectedPOData}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Supplier PO Status Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Cost Center Filter:</strong> Select specific cost centers to view targeted purchase orders<br/>
                            2. <strong>Date Range:</strong> Optional from and to date filters (can be left blank)<br/>
                            3. <strong>Purchase Order Details:</strong> Click the eye icon to view complete PO information<br/>
                            4. <strong>Status Tracking:</strong> Monitor Running vs Closed purchase orders<br/>
                            5. <strong>Summary Cards:</strong> Overview of total orders, amounts, running/closed counts<br/>
                            6. <strong>Real-time Data:</strong> Current purchase order status with balance tracking<br/>
                            7. <strong>Export:</strong> Download PO status data as Excel file for analysis<br/>
                            8. <strong>Amendment Tracking:</strong> View amendment details in the detailed modal
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
export default SupplierPOStatusPage;