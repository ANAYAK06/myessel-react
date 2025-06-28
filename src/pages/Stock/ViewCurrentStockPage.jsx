import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    Package,
    Boxes,
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
    Warehouse,
    BarChart3,
    Layers,
    ShoppingCart,
    AlertCircle,
    CheckCircle,
    Package2,
    Building,
    IndianRupee
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchViewStockGrid,
    fetchViewStockGridNew,
    fetchItemCategories,
    fetchStockCostCenterCodes,
    setFilters,
    clearFilters,
    resetStockData,
    resetViewStockGridData,
    resetViewStockGridNewData,
    clearError,
    selectViewStockGrid,
    selectViewStockGridNew,
    selectItemCategories,
    selectStockCostCenterCodes,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectHasStockData,
    selectHasCategoriesData,
    selectHasCostCenterCodesData
} from '../../slices/stockSlice/viewCurrentStockSlice';
// No auth actions needed - direct Redux access only

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

// Modal Component for Stock Details
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

// Stock Details Modal Component
const StockDetailsModal = ({ isOpen, onClose, stockItem }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatQuantity = (qty) => {
        if (!qty && qty !== 0) return '0';
        return new Intl.NumberFormat('en-IN').format(qty);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Stock Item Details" size="lg">
            {stockItem ? (
                <div className="space-y-6">
                    {/* Item Information */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Item Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Item Name</p>
                                <p className="text-base text-gray-900 dark:text-white">{stockItem.ItemName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Item Code</p>
                                <p className="text-base text-gray-900 dark:text-white">{stockItem.Itemcode || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost Center</p>
                                <p className="text-base text-gray-900 dark:text-white">{stockItem.Costcenter || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unit</p>
                                <p className="text-base text-gray-900 dark:text-white">{stockItem.Units || '-'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Specification</p>
                                <p className="text-base text-gray-900 dark:text-white">{stockItem.Specification || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stock Details */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Stock Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Quantity</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                    {formatQuantity(stockItem.Qty || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Basic Rate</p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                    ₹{formatCurrency(stockItem.Basic || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                    ₹{formatCurrency(stockItem.TotalValue || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Additional Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">DCA</p>
                                <p className="text-base text-gray-900 dark:text-white">
                                    {stockItem.DCA || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sub DCA</p>
                                <p className="text-base text-gray-900 dark:text-white">
                                    {stockItem.SubDca || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Item Category Code</p>
                                <p className="text-base text-gray-900 dark:text-white">{stockItem.ItemCategoryCode || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CC List</p>
                                <p className="text-base text-gray-900 dark:text-white">
                                    {Array.isArray(stockItem.CCList) && stockItem.CCList.length > 0 
                                        ? stockItem.CCList.join(', ') 
                                        : 'None'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No stock details available</p>
                </div>
            )}
        </Modal>
    );
};

// Summary Cards Component
const SummaryCards = ({ stockData, viewType }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatQuantity = (qty) => {
        if (!qty && qty !== 0) return '0';
        return new Intl.NumberFormat('en-IN').format(qty);
    };

    if (!stockData || !Array.isArray(stockData.Data) || stockData.Data.length === 0) {
        return null;
    }

    // Calculate summary from stock data
    const summary = stockData.Data.reduce((acc, item) => {
        const qty = parseFloat(item.Qty || 0);
        const rate = parseFloat(item.Basic || 0);
        const value = parseFloat(item.TotalValue || 0);
        
        acc.totalItems += 1;
        acc.totalQuantity += qty;
        acc.totalValue += value;
        
        return acc;
    }, {
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0
    });

    const cards = [
        {
            title: 'Total Items',
            value: summary.totalItems,
            icon: Package2,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            isCount: true
        },
        {
            title: 'Total Quantity',
            value: summary.totalQuantity,
            icon: Boxes,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            isCount: true,
            formatter: formatQuantity
        },
        {
            title: 'Total Stock Value',
            value: summary.totalValue,
            icon: IndianRupee,
            color: 'from-purple-500 to-indigo-600',
            bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
        },
        {
            title: 'Average Item Value',
            value: summary.totalItems > 0 ? summary.totalValue / summary.totalItems : 0,
            icon: TrendingUp,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20'
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
                                {card.isCount 
                                    ? (card.formatter ? card.formatter(card.value) : card.value)
                                    : formatCurrency(card.value)
                                }
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

const ViewCurrentStockPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const viewStockGrid = useSelector(selectViewStockGrid);
    const viewStockGridNew = useSelector(selectViewStockGridNew);
    const itemCategories = useSelector(selectItemCategories);
    const stockCostCenterCodes = useSelector(selectStockCostCenterCodes);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const hasStockData = useSelector(selectHasStockData);
    const hasCategoriesData = useSelector(selectHasCategoriesData);
    const hasCostCenterCodesData = useSelector(selectHasCostCenterCodesData);

    // Get userData from auth state (includes UID and roleId)
    const { userData, isAuthenticated } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        CCode: '',
        Cattype: ''
    });

    // View type state (regular vs new)
    const [viewType, setViewType] = useState('regular'); // 'regular' or 'new'

    // Modal state
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedStockItem, setSelectedStockItem] = useState(null);

    // Track initialization states
    const [hasInitialized, setHasInitialized] = useState(false);

    // Initial data load - following BudgetReport pattern
    useEffect(() => {
        console.log('🚀 Initial load - User Data:', userData);
        console.log('🚀 Role ID:', roleId, 'UID:', uid);
        
        if (!hasInitialized) {
            console.log('🔄 Loading item categories...');
            dispatch(fetchItemCategories());
            setHasInitialized(true);
        }
    }, [dispatch, hasInitialized, userData, roleId, uid]);

    // Load cost center codes when userData is available - BudgetReport style
    useEffect(() => {
        if (uid && roleId && hasInitialized) {
            console.log('🔄 Loading Cost Center Codes with:', { uid, roleId });
            
            const params = {
                UID: uid,
                RID: roleId
            };
            
            dispatch(fetchStockCostCenterCodes(params))
                .unwrap()
                .then((response) => {
                    console.log('✅ Cost Center Codes loaded successfully:', response);
                })
                .catch((error) => {
                    console.error('❌ Failed to load Cost Center Codes:', error);
                    toast.error('Failed to load cost center codes');
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

    // Debug userData
    useEffect(() => {   
        console.log('👤 User Data Updated:', { 
            userData, 
            uid, 
            roleId, 
            isAuthenticated,
            hasInitialized 
        });
    }, [userData, uid, roleId, isAuthenticated, hasInitialized]);

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
        if (!qty && qty !== 0) return '0';
        return new Intl.NumberFormat('en-IN').format(qty);
    };

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
        
        // Reset data when filters change
        dispatch(resetStockData());
    };

    // Handle refresh cost center codes - BudgetReport style
    const handleRefreshCostCenterCodes = async () => {
        try {
            console.log('🔄 Refreshing cost center codes...');
            
            if (uid && roleId) {
                const params = {
                    UID: uid,
                    RID: roleId
                };
                
                await dispatch(fetchStockCostCenterCodes(params)).unwrap();
                console.log('✅ Cost Center Codes refreshed successfully');
                toast.success('Cost center codes refreshed successfully');
            } else {
                console.warn('⚠️ User credentials not available');
                toast.warning('User credentials not available. Please try logging in again.');
            }
            
        } catch (error) {
            console.error('❌ Failed to refresh Cost Center Codes:', error);
            toast.error('Failed to refresh cost center codes. Please try again.');
        }
    };

    // Handle view button click - BudgetReport style
    const handleView = async () => {
        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));
            
            // Prepare params
            const params = {
                CCode: localFilters.CCode || '',
                Cattype: localFilters.Cattype || ''
            };
            
            // Fetch appropriate stock grid based on view type
            if (viewType === 'new') {
                await dispatch(fetchViewStockGridNew(params)).unwrap();
                toast.success('Stock data (new view) loaded successfully');
            } else {
                await dispatch(fetchViewStockGrid(params)).unwrap();
                toast.success('Stock data loaded successfully');
            }
            
        } catch (error) {
            console.error('❌ Error fetching stock data:', error);
            toast.error('Failed to fetch stock data. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            CCode: '',
            Cattype: ''
        });
        dispatch(clearFilters());
        dispatch(resetStockData());
    };

    // Handle view type toggle
    const handleViewTypeChange = (newViewType) => {
        setViewType(newViewType);
        // Reset data when switching view types
        dispatch(resetStockData());
    };

    // Handle row click to view stock details
    const handleRowClick = (stockItem) => {
        setSelectedStockItem(stockItem);
        setIsDetailsModalOpen(true);
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const currentData = viewType === 'new' ? viewStockGridNew : viewStockGrid;
            const data = currentData?.Data || [];
            
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Item Code': item.Itemcode || '-',
                'Item Name': item.ItemName || '-',
                'Cost Center': item.Costcenter || '-',
                'DCA': item.DCA || '-',
                'Sub DCA': item.SubDca || '-',
                'Quantity': item.Qty || 0,
                'Unit': item.Units || '-',
                'Basic Rate': item.Basic || 0,
                'Total Value': item.TotalValue || 0,
                'Specification': item.Specification || '-'
            }));

            const filename = `Current_Stock_${viewType}_${localFilters.CCode || 'All'}_${localFilters.Cattype || 'All'}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get current stock data for display
    const currentStockData = viewType === 'new' ? viewStockGridNew : viewStockGrid;
    const stockData = currentStockData?.Data || [];

    // Helper function to get cost center options
    const getCostCenterOptions = () => {
        console.log('📋 Getting Cost Center Options:', { stockCostCenterCodes });
        
        if (!stockCostCenterCodes) {
            console.log('❌ stockCostCenterCodes is null/undefined');
            return [];
        }

        // Handle different response structures
        let data = [];
        if (Array.isArray(stockCostCenterCodes)) {
            // If stockCostCenterCodes is directly an array
            data = stockCostCenterCodes;
        } else if (stockCostCenterCodes.Data && Array.isArray(stockCostCenterCodes.Data)) {
            // If stockCostCenterCodes has a Data property
            data = stockCostCenterCodes.Data;
        } else if (stockCostCenterCodes.data && Array.isArray(stockCostCenterCodes.data)) {
            // If stockCostCenterCodes has a data property (lowercase)
            data = stockCostCenterCodes.data;
        }

        console.log('📋 Processed Cost Center Data:', data);
        return data;
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Warehouse className="h-8 w-8 text-indigo-600" />
                            View Current Stock
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Monitor and analyze current inventory levels across all categories
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Inventory Management
                        </div>
                        {(isAnyLoading) && (
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
                        <span>Inventory</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">View Current Stock</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Cost Center Dropdown */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Building className="w-4 h-4 inline mr-2" />
                            Cost Center
                            <button
                                onClick={handleRefreshCostCenterCodes}
                                disabled={loading.stockCostCenterCodes}
                                className="ml-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                title="Refresh Cost Center Codes"
                            >
                                <RefreshCw className={`w-4 h-4 inline ${loading.stockCostCenterCodes ? 'animate-spin' : ''}`} />
                            </button>
                        </label>
                        <select
                            value={localFilters.CCode}
                            onChange={(e) => handleFilterChange('CCode', e.target.value)}
                            disabled={loading.stockCostCenterCodes}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">All Cost Centers</option>
                            {getCostCenterOptions().map((costCenter, index) => {
                                const ccId = costCenter?.CCID || costCenter?.ccId || costCenter?.id;
                                const ccVal = costCenter?.CCVAL || costCenter?.ccVal || costCenter?.name || costCenter?.value;
                                
                                if (!ccId) {
                                    console.warn('⚠️ Cost Center missing ID:', costCenter);
                                    return null;
                                }
                                
                                return (
                                    <option key={ccId || index} value={ccId}>
                                        {ccVal || ccId}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.stockCostCenterCodes && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 flex items-center">
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Loading cost centers...
                            </p>
                        )}
                        
                        {errors.stockCostCenterCodes && (
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
                            {!uid && <span className="text-red-500"> | Missing UID</span>}
                            {!roleId && <span className="text-red-500"> | Missing RoleID</span>}
                        </div>
                    </div>

                    {/* Category Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Category Type
                        </label>
                        <select
                            value={localFilters.Cattype}
                            onChange={(e) => handleFilterChange('Cattype', e.target.value)}
                            disabled={loading.itemCategories}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">All Categories</option>
                            {Array.isArray(itemCategories?.Data) && itemCategories.Data.map((category, index) => {
                                const categoryId = category?.Categoryid || category?.categoryId || category?.id;
                                const categoryName = category?.CategoryValue || category?.categoryName || category?.name;
                                
                                if (!categoryId) return null;
                                
                                return (
                                    <option key={index} value={categoryId}>
                                        {categoryName || `Category ${categoryId}`}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.itemCategories && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading categories...
                            </p>
                        )}
                    </div>

                    {/* View Type Toggle */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            View Type
                        </label>
                        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                            <button
                                onClick={() => handleViewTypeChange('regular')}
                                className={clsx(
                                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                                    viewType === 'regular'
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                )}
                            >
                                Regular View
                            </button>
                            <button
                                onClick={() => handleViewTypeChange('new')}
                                className={clsx(
                                    "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                                    viewType === 'new'
                                        ? "bg-indigo-600 text-white"
                                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                )}
                            >
                                Enhanced View
                            </button>
                        </div>
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
                            {(loading.viewStockGrid || loading.viewStockGridNew) ? (
                                <RotateCcw className="h-5 w-5 animate-spin" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                            View Stock
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
                        <Tooltip content="Download stock data as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(stockData) || stockData.length === 0}
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
            <SummaryCards stockData={currentStockData} viewType={viewType} />

            {/* Stock Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(stockData) && stockData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Item Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Item Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Specification</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Cost Center</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Unit</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Basic Rate</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Total Value</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {stockData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {item.Itemcode || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.ItemName}>
                                                {item.ItemName || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.Specification}>
                                                {item.Specification || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.Costcenter || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            {formatQuantity(item.Qty || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.Units || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            ₹{formatCurrency(item.Basic || 0)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                            ₹{formatCurrency(item.TotalValue || 0)}
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
                        {!(loading.viewStockGrid || loading.viewStockGridNew) && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Stock Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Set your filters and click "View Stock" to load current inventory data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {(loading.viewStockGrid || loading.viewStockGridNew) && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Stock Data</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching current inventory information...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Stock Details Modal */}
            <StockDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                stockItem={selectedStockItem}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Current Stock Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Cost Center Filter:</strong> Select specific cost centers to view targeted inventory<br/>
                            2. <strong>Category Filter:</strong> Filter by item categories for focused analysis<br/>
                            3. <strong>View Types:</strong> Toggle between regular and enhanced stock views<br/>
                            4. <strong>Stock Information:</strong> View current quantities, basic rates, and total values for in-stock items<br/>
                            5. <strong>Summary Cards:</strong> Overview of total items, quantities, values, and average item value<br/>
                            6. <strong>Detailed View:</strong> Click the eye icon to view complete item information including DCA, specifications<br/>
                            7. <strong>Export:</strong> Download stock data as Excel file for offline analysis<br/>
                            8. <strong>Real-time Data:</strong> Current inventory levels showing only items currently in stock
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
export default ViewCurrentStockPage;