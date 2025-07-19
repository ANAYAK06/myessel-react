import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    Package,
    Tags,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    Filter,
    RefreshCw,
    ChevronRight,
    Layers,
    Hash,
    BarChart3,
    TrendingUp,
    X,
    Grid3X3,
    ShoppingCart,
    Box
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchItemCategoryDetailsAll,
    fetchMajorGroupCode,
    fetchItemCodesGridDetail,
    setFilters,
    clearFilters,
    resetItemCodesData,
    resetSelectedCategoryData,
    clearError,
    selectItemCategoryDetails,
    selectMajorGroupCode,
    selectItemCodesGridDetail,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectHasAnyError
} from '../../slices/stockSlice/ItemCodeReportSlice';

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
    if (!itemData) return null;

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Item Code Details" size="lg">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Code</label>
                            <p className="text-sm text-gray-900 dark:text-white font-semibold">{itemData.ItemCode || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name</label>
                            <p className="text-sm text-gray-900 dark:text-white">{itemData.Itemname || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <p className="text-sm text-gray-900 dark:text-white">{itemData.ItemCategoryName || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">DCA Code</label>
                            <p className="text-sm text-gray-900 dark:text-white">{itemData.ItemcodeDca || '-'}</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Major Group</label>
                            <p className="text-sm text-gray-900 dark:text-white">{itemData.Majorgroupname || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
                            <p className="text-sm text-gray-900 dark:text-white">{itemData.Units || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Basic Price</label>
                            <p className="text-sm text-gray-900 dark:text-white font-semibold">₹ {formatCurrency(itemData.Basicprice || 0)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">HSN Code</label>
                            <p className="text-sm text-gray-900 dark:text-white">{itemData.HSNCode || '-'}</p>
                        </div>
                    </div>
                </div>
                {itemData.Specification && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specification</label>
                        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            {itemData.Specification}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

// Summary Cards Component
const SummaryCards = ({ itemCodesData }) => {
    if (!itemCodesData || !Array.isArray(itemCodesData.Data) || itemCodesData.Data.length === 0) {
        return null;
    }

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Calculate summary from item codes data
    const summary = itemCodesData.Data.reduce((acc, item) => {
        acc.totalItems += 1;
        acc.totalValue += parseFloat(item.Basicprice || 0);
        
        // Count by DCA Code
        const dcaCode = item.ItemcodeDca || 'Unknown';
        acc.dcaCounts[dcaCode] = (acc.dcaCounts[dcaCode] || 0) + 1;
        
        // Count by Unit
        const unit = item.Units || 'Unknown';
        acc.unitCounts[unit] = (acc.unitCounts[unit] || 0) + 1;
        
        return acc;
    }, {
        totalItems: 0,
        totalValue: 0,
        dcaCounts: {},
        unitCounts: {}
    });

    const totalDcaCodes = Object.keys(summary.dcaCounts).length;
    const totalUnits = Object.keys(summary.unitCounts).length;

    const cards = [
        {
            title: 'Total Items',
            value: summary.totalItems,
            icon: Package,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
            isCount: true
        },
        {
            title: 'Total Value',
            value: summary.totalValue,
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            isCurrency: true
        },
        {
            title: 'DCA Codes',
            value: totalDcaCodes,
            icon: Hash,
            color: 'from-red-500 to-pink-600',
            bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
            isCount: true
        },
        {
            title: 'Unit Types',
            value: totalUnits,
            icon: Grid3X3,
            color: 'from-cyan-500 to-indigo-600',
            bgColor: 'from-cyan-50 to-indigo-50 dark:from-cyan-900/20 dark:to-indigo-900/20',
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
                                {card.isCount ? card.value : card.isCurrency ? `₹ ${formatCurrency(card.value)}` : formatCurrency(card.value)}
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

const ItemCodeReportPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const itemCategoryDetails = useSelector(selectItemCategoryDetails);
    const majorGroupCode = useSelector(selectMajorGroupCode);
    const itemCodesGridDetail = useSelector(selectItemCodesGridDetail);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        itemCategoryCode: '',
        majorGroupCode: '',
        val: '',
        txt: ''
    });

    // Add state to store selected category details
    const [selectedCategory, setSelectedCategory] = useState({
        id: '',
        name: ''
    });

    // Modal state
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedItemData, setSelectedItemData] = useState(null);

    // Format currency helper function
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Load initial data
    useEffect(() => {
        dispatch(fetchItemCategoryDetailsAll());
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

    // Load major group codes when item category changes - FIXED
    useEffect(() => {
        if (selectedCategory.id && selectedCategory.name) {
            const params = {
                val: selectedCategory.id,
                txt: selectedCategory.name
            };
            console.log('Fetching major groups with params:', params);
            dispatch(fetchMajorGroupCode(params));
        }
    }, [selectedCategory, dispatch]);

    // Handle filter changes - UPDATED
    const handleFilterChange = (filterName, value) => {
        if (filterName === 'itemCategoryCode') {
            // Find the selected category details
            const category = itemCategoryDetails?.Data?.find(cat => {
                const categoryId = cat?.Categoryid || cat?.categoryId || cat?.id;
                return categoryId === value;
            });
            
            if (category) {
                const categoryId = category?.Categoryid || category?.categoryId || category?.id;
                const categoryName = category?.CategoryValue.includes(',')
                ? category?.CategoryValue.split(',')[1].trim() || category?.categoryName || category?.name
                : category?.categoryName || category?.name;

                // Set selected category details
                setSelectedCategory({
                    id: categoryId,
                    name: categoryName
                });
                
                console.log('Selected category:', { id: categoryId, name: categoryName });
            } else if (value === '') {
                // Reset if no category selected
                setSelectedCategory({ id: '', name: '' });
            }
            
            setLocalFilters(prev => ({
                ...prev,
                itemCategoryCode: value,
                majorGroupCode: '', // Reset major group when category changes
            }));
            dispatch(resetSelectedCategoryData());
            dispatch(resetItemCodesData());
        } else {
            setLocalFilters(prev => ({
                ...prev,
                [filterName]: value
            }));
            
            if (filterName !== 'itemCategoryCode') {
                dispatch(resetItemCodesData());
            }
        }
    };

    // Handle view button click
    const handleView = async () => {
        // Validation
        if (!localFilters.itemCategoryCode) {
            toast.warning('Please select an item category');
            return;
        }

        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));
            
            // Fetch item codes grid detail
            const params = {
                icc: localFilters.itemCategoryCode,
                mgc: localFilters.majorGroupCode || 'Select All'
            };
            
            await dispatch(fetchItemCodesGridDetail(params)).unwrap();
            toast.success('Item codes loaded successfully');
            
        } catch (error) {
            console.error('❌ Error fetching item codes:', error);
            toast.error('Failed to fetch item codes. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            itemCategoryCode: '',
            majorGroupCode: '',
            val: '',
            txt: ''
        });
        setSelectedCategory({ id: '', name: '' });
        dispatch(clearFilters());
        dispatch(resetItemCodesData());
        dispatch(resetSelectedCategoryData());
    };

    // Handle row click to view item details
    const handleRowClick = (itemData) => {
        setSelectedItemData(itemData);
        setIsDetailsModalOpen(true);
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = itemCodesGridDetail?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Item Code': item.ItemCode || '-',
                'Item Name': item.Itemname || '-',
                'DCA Code': item.ItemcodeDca || '-',
                'Major Group': item.Majorgroupname || '-',
                'Unit': item.Units || '-',
                'Basic Price': item.Basicprice || '0.00',
                'HSN Code': item.HSNCode || '-',
                'Specification': item.Specification || '-'
            }));

            const filename = `Item_Codes_Report_${localFilters.itemCategoryCode}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get item codes data for display
    const itemCodesData = itemCodesGridDetail?.Data || [];

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Package className="h-8 w-8 text-indigo-600" />
                            Item Code Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View and analyze item codes with category and major group breakdowns
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Inventory Reports
                        </div>
                        {loading.itemCodesGridDetail && (
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
                        <span className="text-gray-900 dark:text-white">Item Code Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
                    {/* Item Category Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Item Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.itemCategoryCode}
                            onChange={(e) => handleFilterChange('itemCategoryCode', e.target.value)}
                            disabled={loading.itemCategoryDetails}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Item Category</option>
                            {Array.isArray(itemCategoryDetails?.Data) && itemCategoryDetails.Data.map((category, index) => {
                                const categoryId = category?.Categoryid || category?.categoryId || category?.id;
                                const categoryName = category?.CategoryValue || category?.categoryName || category?.name;
                                
                                if (!categoryId) return null;
                                
                                return (
                                    <option key={index} value={categoryId}>
                                        {categoryName}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.itemCategoryDetails && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading categories...
                            </p>
                        )}
                    </div>

                    {/* Major Group Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Major Group
                        </label>
                        <select
                            value={localFilters.majorGroupCode}
                            onChange={(e) => handleFilterChange('majorGroupCode', e.target.value)}
                            disabled={loading.majorGroupCode || !localFilters.itemCategoryCode}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select All Major Groups</option>
                            {Array.isArray(majorGroupCode?.Data) && majorGroupCode.Data.map((group, index) => {
                                const groupId = group?.Majorgroupval || group?.groupId || group?.id;
                                const groupName = group?.Majorgrouptext || group?.groupName || group?.name;
                                const groupCode = group?.Majorgroupval || group?.groupCode || group?.code;
                                
                                if (!groupId && !groupCode) return null;
                                
                                return (
                                    <option key={groupCode || index} value={groupCode || groupId}>
                                        {groupName || groupCode || `Group ${groupId}`}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.majorGroupCode && localFilters.itemCategoryCode && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading major groups...
                            </p>
                        )}
                        
                        {!localFilters.itemCategoryCode && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Select an item category first
                            </p>
                        )}
                    </div>
                </div>

               

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isAnyLoading || !localFilters.itemCategoryCode}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.itemCodesGridDetail ? (
                                <RotateCcw className="h-5 w-5 animate-spin" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                            View Item Codes
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
                        <Tooltip content="Download item codes as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(itemCodesData) || itemCodesData.length === 0}
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
            <SummaryCards itemCodesData={itemCodesGridDetail} />

            {/* Item Codes Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(itemCodesData) && itemCodesData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Item Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Item Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Specification</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">DCA Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Major Group</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Unit</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Basic Price</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {itemCodesData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                            {item.ItemCode || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.Itemname}>
                                                {item.Itemname || '-'}
                                            </div>
                                        </td>
                                         <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.Specification}>
                                                {item.Specification || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full text-xs font-medium">
                                                {item.ItemcodeDca || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.Majorgrouptext || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded text-xs font-medium">
                                                {item.Units || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-semibold">
                                            ₹ {formatCurrency(item.Basicprice || 0)}
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
                        {!loading.itemCodesGridDetail && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Item Codes Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select an item category and optionally a major group, then click "View Item Codes" to load the data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.itemCodesGridDetail && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Item Codes</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching item codes for the selected category and major group...
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
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Item Code Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Item Category:</strong> Required field to select the category of items<br/>
                            2. <strong>Major Group:</strong> Optional filter to narrow down items by major group<br/>
                            3. <strong>Dynamic Loading:</strong> Major groups load automatically when category is selected<br/>
                            4. <strong>Click Actions:</strong> Click the eye icon on any row to view detailed item information<br/>
                            5. <strong>Summary Cards:</strong> View total items, total value, DCA codes, and unit types<br/>
                            6. <strong>Export:</strong> Download item codes as Excel file for offline analysis<br/>
                            7. <strong>Price Display:</strong> Indian currency formatting with ₹ symbol<br/>
                            8. <strong>Real-time Feedback:</strong> Loading indicators and error handling with toast notifications
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

export default ItemCodeReportPage;