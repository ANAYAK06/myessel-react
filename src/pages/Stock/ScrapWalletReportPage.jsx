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
    Recycle,
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
    IndianRupee,
    ShoppingCart,
    Package2,
    Coins
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchScrapWalletBalanceItemsReportData,
    fetchSWRCostCenterCodes,
    setFilters,
    clearFilters,
    resetReportData,
    resetAllData,
    clearError,
    selectScrapWalletBalanceItemsReportData,
    selectSWRCostCenterCodes,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectScrapWalletSummary
} from '../../slices/stockSlice/scrapWalletReportSlice';

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

// Modal Component for Item Details
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

// Item Details Modal Component
const ItemDetailsModal = ({ isOpen, onClose, itemData }) => {
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
        <Modal isOpen={isOpen} onClose={onClose} title="Scrap Item Details" size="lg">
            {itemData ? (
                <div className="space-y-6">
                    {/* Item Information */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Item Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Item Code</p>
                                <p className="text-base text-gray-900 dark:text-white">{itemData.ItemCode || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Item Name</p>
                                <p className="text-base text-gray-900 dark:text-white">{itemData.ItemName || '-'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Specification</p>
                                <p className="text-base text-gray-900 dark:text-white">{itemData.Specification || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Basic Price</p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                    ₹{formatCurrency(itemData.Basicprice || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Scrap Details */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Scrap Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scrap Quantity</p>
                                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {formatQuantity(itemData.ScrapQty || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scrap Amount</p>
                                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                    ₹{formatCurrency(itemData.ScrapAmt || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sales Details */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sales Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sold Quantity</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                    {formatQuantity(itemData.SoldQty || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sold Amount</p>
                                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                    ₹{formatCurrency(itemData.SoldAmt || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Balance Details */}
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Balance Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance Quantity</p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {formatQuantity(itemData.BalanceQty || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance Amount</p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                    ₹{formatCurrency(itemData.BalanceAmt || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No item details available</p>
                </div>
            )}
        </Modal>
    );
};

// Summary Cards Component
const SummaryCards = ({ scrapWalletData }) => {
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

    if (!scrapWalletData || !Array.isArray(scrapWalletData.Data) || scrapWalletData.Data.length === 0) {
        return null;
    }

    // Calculate comprehensive statistics from actual data
    const data = scrapWalletData.Data;
    const totalItems = data.length;
    
    // Calculate totals
    const totalScrapAmount = data.reduce((sum, item) => sum + (parseFloat(item.ScrapAmt) || 0), 0);
    const totalSoldAmount = data.reduce((sum, item) => sum + (parseFloat(item.SoldAmt) || 0), 0);
    const totalBalanceAmount = data.reduce((sum, item) => sum + (parseFloat(item.BalanceAmt) || 0), 0);
    const totalBalanceQty = data.reduce((sum, item) => sum + (parseFloat(item.BalanceQty) || 0), 0);

    const cards = [
        {
            title: 'Total Items',
            value: totalItems,
            icon: Package2,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            isCount: true,
            subtitle: 'Scrap items tracked'
        },
        {
            title: 'Total Scrap Amount',
            value: totalScrapAmount,
            icon: Recycle,
            color: 'from-yellow-500 to-orange-600',
            bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
            isCount: false,
            subtitle: 'Total scrap value'
        },
        {
            title: 'Total Sold Amount',
            value: totalSoldAmount,
            icon: ShoppingCart,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            isCount: false,
            subtitle: 'Revenue generated'
        },
        {
            title: 'Balance Amount',
            value: totalBalanceAmount,
            icon: Coins,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
            isCount: false,
            subtitle: `Qty: ${formatQuantity(totalBalanceQty)}`
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

const ScrapWalletReportPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const scrapWalletBalanceItemsReportData = useSelector(selectScrapWalletBalanceItemsReportData);
    const swrCostCenterCodes = useSelector(selectSWRCostCenterCodes);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const scrapWalletSummary = useSelector(selectScrapWalletSummary);

    // Get userData from auth state (includes UID and roleId)
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        CCCode: ''
    });

    // Modal state
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedItemData, setSelectedItemData] = useState(null);

    // Track initialization
    const [hasInitialized, setHasInitialized] = useState(false);

    // Load cost center codes when userData is available
    useEffect(() => {
        if (uid && roleId && !hasInitialized) {
            const params = {
                UID: uid,
                RID: roleId
            };
            
            dispatch(fetchSWRCostCenterCodes(params))
                .unwrap()
                .then((response) => {
                    console.log('✅ SWR Cost Center Codes loaded successfully');
                    setHasInitialized(true);
                })
                .catch((error) => {
                    console.error('❌ Failed to load SWR Cost Center Codes:', error);
                    toast.error('Failed to load cost center codes');
                    setHasInitialized(true);
                });
        }
    }, [dispatch, uid, roleId, hasInitialized]);

    // Sync local filters with Redux filters
    useEffect(() => {
        setLocalFilters({ CCCode: filters.CCCode || '' });
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

    // Handle refresh cost center codes
    const handleRefreshCostCenterCodes = async () => {
        try {
            if (uid && roleId) {
                const params = {
                    UID: uid,
                    RID: roleId
                };
                
                await dispatch(fetchSWRCostCenterCodes(params)).unwrap();
                toast.success('Cost center codes refreshed successfully');
            } else {
                toast.warning('User credentials not available. Please try logging in again.');
            }
            
        } catch (error) {
            console.error('❌ Failed to refresh SWR Cost Center Codes:', error);
            toast.error('Failed to refresh cost center codes. Please try again.');
        }
    };

    // Handle view button click
    const handleView = async () => {
        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));
            
            // Prepare params
            const params = {
                CCCode: localFilters.CCCode || '',
                UID: uid,
                Roleid: roleId
            };
            
            await dispatch(fetchScrapWalletBalanceItemsReportData(params)).unwrap();
            toast.success('Scrap wallet report loaded successfully');
            
        } catch (error) {
            console.error('❌ Error fetching scrap wallet report:', error);
            toast.error('Failed to fetch scrap wallet report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            CCCode: ''
        });
        dispatch(resetAllData());
    };

    // Handle row click to view item details
    const handleRowClick = (itemData) => {
        setSelectedItemData(itemData);
        setIsDetailsModalOpen(true);
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = scrapWalletBalanceItemsReportData?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Item Code': item.ItemCode || '-',
                'Item Name': item.ItemName || '-',
                'Specification': item.Specification || '-',
                'Basic Price': item.Basicprice || 0,
                'Scrap Qty': item.ScrapQty || 0,
                'Scrap Amount': item.ScrapAmt || 0,
                'Sold Qty': item.SoldQty || 0,
                'Sold Amount': item.SoldAmt || 0,
                'Balance Qty': item.BalanceQty || 0,
                'Balance Amount': item.BalanceAmt || 0
            }));

            const filename = `Scrap_Wallet_Report_${localFilters.CCCode || 'All'}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get scrap wallet data for display
    const scrapWalletData = scrapWalletBalanceItemsReportData?.Data || [];

    // Helper function to get cost center options
    const getCostCenterOptions = () => {
        if (!swrCostCenterCodes) {
            return [];
        }

        // Handle different response structures
        let data = [];
        if (Array.isArray(swrCostCenterCodes)) {
            data = swrCostCenterCodes;
        } else if (swrCostCenterCodes.Data && Array.isArray(swrCostCenterCodes.Data)) {
            data = swrCostCenterCodes.Data;
        } else if (swrCostCenterCodes.data && Array.isArray(swrCostCenterCodes.data)) {
            data = swrCostCenterCodes.data;
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
                            <Recycle className="h-8 w-8 text-indigo-600" />
                            Scrap Wallet Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Monitor and track scrap wallet balance items with detailed inventory analysis
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 text-emerald-800 dark:text-emerald-200 text-sm rounded-full transition-colors">
                            Scrap Management
                        </div>
                        {isAnyLoading && (
                            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
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
                        <span className="text-gray-900 dark:text-white">Scrap Wallet Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Cost Center Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Building className="w-4 h-4 inline mr-2" />
                            Cost Center
                            <button
                                onClick={handleRefreshCostCenterCodes}
                                disabled={loading.swrCostCenterCodes}
                                className="ml-2 text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                                title="Refresh Cost Center Codes"
                            >
                                <RefreshCw className={`w-4 h-4 inline ${loading.swrCostCenterCodes ? 'animate-spin' : ''}`} />
                            </button>
                        </label>
                        <select
                            value={localFilters.CCCode}
                            onChange={(e) => handleFilterChange('CCCode', e.target.value)}
                            disabled={loading.swrCostCenterCodes}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        
                        {loading.swrCostCenterCodes && (
                            <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-2 flex items-center">
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Loading cost centers...
                            </p>
                        )}
                        
                        {errors.swrCostCenterCodes && (
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
                            {localFilters.CCCode && <span className="text-green-600"> | Selected: {localFilters.CCCode}</span>}
                            {!uid && <span className="text-red-500"> | Missing UID</span>}
                            {!roleId && <span className="text-red-500"> | Missing RoleID</span>}
                        </div>
                    </div>

                    {/* Empty columns for spacing */}
                    <div></div>
                    <div></div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isAnyLoading || !uid || !roleId}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.scrapWalletBalanceItemsReportData ? (
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
                        <Tooltip content="Download scrap wallet report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(scrapWalletData) || scrapWalletData.length === 0}
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
            <SummaryCards scrapWalletData={scrapWalletBalanceItemsReportData} />

            {/* Scrap Wallet Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(scrapWalletData) && scrapWalletData.length > 0 ? (
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Item Code
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-56">
                                        Item Details
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-28">
                                        Basic Price
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-28">
                                        Scrap Qty
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Scrap Amount
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-28">
                                        Sold Qty
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Sold Amount
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-28">
                                        Balance Qty
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Balance Amount
                                    </th>
                                    <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider w-20">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {scrapWalletData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-32">
                                            <div className="truncate font-medium" title={item.ItemCode}>
                                                {item.ItemCode || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-56">
                                            <div className="max-w-full">
                                                <div className="font-medium truncate text-sm" title={item.ItemName}>
                                                    {item.ItemName || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={item.Specification}>
                                                    {item.Specification || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold w-28">
                                            <div className="truncate" title={`₹${formatCurrency(item.Basicprice || 0)}`}>
                                                ₹{formatCurrency(item.Basicprice || 0)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium w-28">
                                            <span className="text-yellow-600 dark:text-yellow-400 truncate block" title={formatQuantity(item.ScrapQty || 0)}>
                                                {formatQuantity(item.ScrapQty || 0)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold w-32">
                                            <div className="truncate" title={`₹${formatCurrency(item.ScrapAmt || 0)}`}>
                                                <span className="text-orange-600 dark:text-orange-400">
                                                    ₹{formatCurrency(item.ScrapAmt || 0)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium w-28">
                                            <span className="text-green-600 dark:text-green-400 truncate block" title={formatQuantity(item.SoldQty || 0)}>
                                                {formatQuantity(item.SoldQty || 0)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold w-32">
                                            <div className="truncate" title={`₹${formatCurrency(item.SoldAmt || 0)}`}>
                                                <span className="text-emerald-600 dark:text-emerald-400">
                                                    ₹{formatCurrency(item.SoldAmt || 0)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium w-28">
                                            <span className="text-indigo-600 dark:text-indigo-400 truncate block" title={formatQuantity(item.BalanceQty || 0)}>
                                                {formatQuantity(item.BalanceQty || 0)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold w-32">
                                            <div className="truncate" title={`₹${formatCurrency(item.BalanceAmt || 0)}`}>
                                                <span className="text-indigo-600 dark:text-indigo-400">
                                                    ₹{formatCurrency(item.BalanceAmt || 0)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center w-20">
                                            <button
                                                onClick={() => handleRowClick(item)}
                                                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors p-1 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                                title="View Item Details"
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
                        {!loading.scrapWalletBalanceItemsReportData && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Scrap Wallet Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select a cost center and click "View Report" to load scrap wallet balance items data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.scrapWalletBalanceItemsReportData && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-emerald-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Scrap Wallet Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching scrap wallet balance items data...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Item Details Modal */}
            <ItemDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                itemData={selectedItemData}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200">
                        <p className="font-semibold mb-1">Scrap Wallet Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Cost Center Filter:</strong> Select specific cost centers to view targeted scrap items<br/>
                            2. <strong>Item Details:</strong> Click the eye icon to view complete item information<br/>
                            3. <strong>Balance Tracking:</strong> Monitor scrap quantities and amounts with balance calculations<br/>
                            4. <strong>Sales Analysis:</strong> Track sold quantities and revenues from scrap items<br/>
                            5. <strong>Summary Cards:</strong> Overview of total items, amounts, and balance metrics<br/>
                            6. <strong>Real-time Data:</strong> Current scrap wallet status with inventory tracking<br/>
                            7. <strong>Export:</strong> Download scrap wallet data as Excel file for analysis<br/>
                            8. <strong>Responsive Design:</strong> Optimized table layout with sticky headers for better navigation
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
export default ScrapWalletReportPage;