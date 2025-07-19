import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    Package,
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
    TrendingUp,
    TrendingDown,
    DollarSign,
    X,
    Building2,
    Layers,
    ShoppingCart,
    Archive,
    PieChart,
    BarChart3,
    Activity,
    Boxes,
    IndianRupee
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchStockSummary,
    resetAllData,
    clearError,
    resetStockSummaryData,
    selectStockSummary,
    selectLoading,
    selectErrors,
    selectIsAnyLoading,
    selectHasAnyError,
    selectConsolidateStockSummaryData,
    selectStockSummaryDate,
    selectStockSummaryCCCode,
    selectStockSummaryStats,
    selectStockCategoryBreakdown,
    selectTopCostCentersByAmount,
    selectCostCentersWithZeroAmounts,
    selectIsDataFresh
} from '../../slices/financialReportSlice/stockSummarySlice';

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

// Modal Component for Detailed View
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

// Stock Category Details Modal
const StockCategoryModal = ({ isOpen, onClose, categoryData, categoryType }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getCategoryTitle = (type) => {
        const titles = {
            assetCenters: 'Asset Centers',
            semiAssetCenters: 'Semi-Asset Centers',
            semiConsumableCenters: 'Consumable Centers',
            boughtOutCenters: 'Bought-Out Centers',
            mixedCenters: 'Mixed Category Centers'
        };
        return titles[type] || 'Category Details';
    };

    const getCategoryIcon = (type) => {
        const icons = {
            assetCenters: Building2,
            semiAssetCenters: Layers,
            semiConsumableCenters: ShoppingCart,
            boughtOutCenters: Archive,
            mixedCenters: Boxes
        };
        const IconComponent = icons[type] || Package;
        return <IconComponent className="h-5 w-5" />;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getCategoryTitle(categoryType)} size="full">
            <div className="overflow-x-auto">
                <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                    {getCategoryIcon(categoryType)}
                    <span className="font-semibold">{categoryData?.length || 0} Cost Centers</span>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">CC Code</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">CC Name</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase">Asset Amount</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase">Semi-Asset</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase">Consumable</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase">Bought-Out</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {categoryData?.length > 0 ? categoryData.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                    {item.CCCode}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    <div className="max-w-xs truncate" title={item.CCName}>
                                        {item.CCName}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                    {formatCurrency(item.AssetAmount)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                    {formatCurrency(item.SemiAssetAmount)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                    {formatCurrency(item.SemiConsumbleAmount)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                    {formatCurrency(item.BoughtOutAmount)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-bold">
                                    {formatCurrency(item.TotalAmount)}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No data available for this category
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
};

// Summary Cards Component
const SummaryCards = ({ stockStats, onCategoryClick }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatCompact = (amount) => {
        if (!amount && amount !== 0) return '0';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount.toFixed(0)}`;
    };

    const cards = [
        {
            title: 'Total Cost Centers',
            value: stockStats.totalCostCenters,
            icon: Building2,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
            isCount: true
        },
        {
            title: 'Asset Amount',
            value: stockStats.totalAssetAmount,
            icon: Archive,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            compact: formatCompact(stockStats.totalAssetAmount)
        },
        {
            title: 'Semi-Asset Amount',
            value: stockStats.totalSemiAssetAmount,
            icon: Layers,
            color: 'from-yellow-500 to-orange-600',
            bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
            compact: formatCompact(stockStats.totalSemiAssetAmount)
        },
        {
            title: 'Consumable',
            value: stockStats.totalSemiConsumableAmount,
            icon: ShoppingCart,
            color: 'from-purple-500 to-indigo-600',
            bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
            compact: formatCompact(stockStats.totalSemiConsumableAmount)
        },
        {
            title: 'Bought-Out Amount',
            value: stockStats.totalBoughtOutAmount,
            icon: Package,
            color: 'from-pink-500 to-rose-600',
            bgColor: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
            compact: formatCompact(stockStats.totalBoughtOutAmount)
        },
        {
            title: 'Grand Total',
            value: stockStats.grandTotalAmount,
            icon: IndianRupee,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            compact: formatCompact(stockStats.grandTotalAmount),
            highlight: false
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
            {cards.map((card, index) => (
                <div 
                    key={index} 
                    className={clsx(
                        `bg-gradient-to-r ${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300`,
                        card.highlight && 'ring-2 ring-indigo-300 dark:ring-indigo-600'
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                {card.title}
                            </p>
                            {card.isCount ? (
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {card.value}
                                </p>
                            ) : (
                                <div>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {card.compact}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        ₹{formatCurrency(card.value)}
                                    </p>
                                </div>
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

// Category Breakdown Cards
const CategoryBreakdownCards = ({ categoryBreakdown, onCategoryClick }) => {
    const categories = [
        {
            key: 'assetCenters',
            title: 'Asset Only',
            data: categoryBreakdown.assetCenters,
            icon: Building2,
            color: 'from-green-500 to-green-600',
            bgColor: 'from-green-50 to-green-50 dark:from-green-900/20'
        },
        {
            key: 'semiAssetCenters',
            title: 'Semi-Asset Only',
            data: categoryBreakdown.semiAssetCenters,
            icon: Layers,
            color: 'from-yellow-500 to-yellow-600',
            bgColor: 'from-yellow-50 to-yellow-50 dark:from-yellow-900/20'
        },
        {
            key: 'semiConsumableCenters',
            title: 'Consumable Only',
            data: categoryBreakdown.semiConsumableCenters,
            icon: ShoppingCart,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'from-purple-50 to-purple-50 dark:from-purple-900/20'
        },
        {
            key: 'boughtOutCenters',
            title: 'Bought-Out Only',
            data: categoryBreakdown.boughtOutCenters,
            icon: Archive,
            color: 'from-pink-500 to-pink-600',
            bgColor: 'from-pink-50 to-pink-50 dark:from-pink-900/20'
        },
        {
            key: 'mixedCenters',
            title: 'Mixed Categories',
            data: categoryBreakdown.mixedCenters,
            icon: Boxes,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20'
        }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-indigo-600" />
                Stock Category Breakdown
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {categories.map((category) => (
                    <div
                        key={category.key}
                        onClick={() => onCategoryClick(category.data, category.key)}
                        className={clsx(
                            `bg-gradient-to-r ${category.bgColor} rounded-lg p-4 border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105`
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                    {category.title}
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {category.data?.length || 0}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Cost Centers
                                </p>
                            </div>
                            <div className={`bg-gradient-to-r ${category.color} p-2 rounded-lg`}>
                                <category.icon className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
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

const StockSummaryPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const stockSummary = useSelector(selectStockSummary);
    const stockData = useSelector(selectConsolidateStockSummaryData);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const stockDate = useSelector(selectStockSummaryDate);
    const stockStats = useSelector(selectStockSummaryStats);
    const categoryBreakdown = useSelector(selectStockCategoryBreakdown);
    const topCostCenters = useSelector((state) => selectTopCostCentersByAmount(state, 10));
    const zeroCostCenters = useSelector(selectCostCentersWithZeroAmounts);
    const isDataFresh = useSelector((state) => selectIsDataFresh(state, 5));

    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('TotalAmount');
    const [sortDirection, setSortDirection] = useState('desc');
    const [showZeroAmounts, setShowZeroAmounts] = useState(true); // Changed to true by default
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    // Modal state
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedCategoryData, setSelectedCategoryData] = useState([]);
    const [selectedCategoryType, setSelectedCategoryType] = useState('');

    // Load initial data
    useEffect(() => {
        if (!isDataFresh) {
            dispatch(fetchStockSummary());
        }
    }, [dispatch, isDataFresh]);

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

    // Handle refresh
    const handleRefresh = async () => {
        try {
            await dispatch(fetchStockSummary()).unwrap();
            toast.success('Stock summary refreshed successfully');
        } catch (error) {
            console.error('Error refreshing stock summary:', error);
            toast.error('Failed to refresh stock summary');
        }
    };

    // Handle reset
    const handleReset = () => {
        setSearchTerm('');
        setSortField('TotalAmount');
        setSortDirection('desc');
        setShowZeroAmounts(true); // Changed to true to show all data
        setSelectedCategory('all');
        // Don't reset data, just clear filters
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            if (!Array.isArray(stockData) || stockData.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = stockData.map(item => ({
                'CC Code': item.CCCode,
                'CC Name': item.CCName,
                'Asset Amount': item.AssetAmount,
                'Semi-Asset Amount': item.SemiAssetAmount,
                'Consumable Amount': item.SemiConsumbleAmount,
                'Bought-Out Amount': item.BoughtOutAmount,
                'Total Amount': item.TotalAmount
            }));

            const filename = `Stock_Summary_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Handle category click
    const handleCategoryClick = (categoryData, categoryType) => {
        setSelectedCategoryData(categoryData);
        setSelectedCategoryType(categoryType);
        setIsCategoryModalOpen(true);
    };

    // Filter and sort data
    const filteredAndSortedData = React.useMemo(() => {
        let filtered = [...stockData];
        
        // Debug: Log initial data count
        console.log('Initial stock data count:', filtered.length);
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.CCCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.CCName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            console.log('After search filter:', filtered.length);
        }
        
        // Apply zero amounts filter
        if (!showZeroAmounts) {
            const beforeFilter = filtered.length;
            filtered = filtered.filter(item => parseFloat(item.TotalAmount || 0) > 0);
            console.log(`After zero amounts filter: ${filtered.length} (removed ${beforeFilter - filtered.length} zero amount items)`);
        }
        
        // Apply category filter
        if (selectedCategory !== 'all') {
            const beforeFilter = filtered.length;
            filtered = filtered.filter(item => {
                const hasAsset = parseFloat(item.AssetAmount || 0) > 0;
                const hasSemiAsset = parseFloat(item.SemiAssetAmount || 0) > 0;
                const hasSemiConsumable = parseFloat(item.SemiConsumbleAmount || 0) > 0;
                const hasBoughtOut = parseFloat(item.BoughtOutAmount || 0) > 0;
                
                switch (selectedCategory) {
                    case 'asset': return hasAsset && !hasSemiAsset && !hasSemiConsumable && !hasBoughtOut;
                    case 'semiAsset': return hasSemiAsset && !hasAsset && !hasSemiConsumable && !hasBoughtOut;
                    case 'semiConsumable': return hasSemiConsumable && !hasAsset && !hasSemiAsset && !hasBoughtOut;
                    case 'boughtOut': return hasBoughtOut && !hasAsset && !hasSemiAsset && !hasSemiConsumable;
                    case 'mixed': return [hasAsset, hasSemiAsset, hasSemiConsumable, hasBoughtOut].filter(Boolean).length > 1;
                    default: return true;
                }
            });
            console.log(`After category filter (${selectedCategory}): ${filtered.length} (removed ${beforeFilter - filtered.length} items)`);
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = parseFloat(a[sortField] || 0);
            const bValue = parseFloat(b[sortField] || 0);
            
            if (sortDirection === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });
        
        console.log('Final filtered data count:', filtered.length);
        return filtered;
    }, [stockData, searchTerm, showZeroAmounts, selectedCategory, sortField, sortDirection]);

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Package className="h-8 w-8 text-indigo-600" />
                            Stock Summary Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Comprehensive overview of stock across all cost centers with detailed analytics
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Inventory Reports
                        </div>
                        {loading.stockSummary && (
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
                        <span>Inventory Management</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Stock Summary</span>
                    </div>
                </nav>
                
                {/* Last Updated */}
                {stockDate && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Activity className="h-4 w-4" />
                        <span>Last Updated: {stockDate}</span>
                        {isDataFresh && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                                Fresh Data
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <SummaryCards stockStats={stockStats} onCategoryClick={handleCategoryClick} />

            {/* Category Breakdown */}
            <CategoryBreakdownCards categoryBreakdown={categoryBreakdown} onCategoryClick={handleCategoryClick} />

            {/* Filters and Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by CC Code or Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Categories</option>
                            <option value="asset">Asset Only</option>
                            <option value="semiAsset">Semi-Asset Only</option>
                            <option value="semiConsumable">Consumable Only</option>
                            <option value="boughtOut">Bought-Out Only</option>
                            <option value="mixed">Mixed Categories</option>
                        </select>

                        {/* Show Zero Toggle */}
                        <label className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showZeroAmounts}
                                onChange={(e) => setShowZeroAmounts(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Show Zero Amounts</span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isAnyLoading}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.stockSummary ? (
                                <RotateCcw className="h-5 w-5 animate-spin" />
                            ) : (
                                <RefreshCw className="h-5 w-5" />
                            )}
                            Refresh
                        </button>
                        
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Reset
                        </button>

                        <Tooltip content="Download stock summary as Excel file">
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

                {/* Results Count with Debug Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-4">
                        <span>
                            Showing {filteredAndSortedData.length} of {stockData.length} cost centers
                        </span>
                        {(searchTerm || selectedCategory !== 'all' || !showZeroAmounts) && (
                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full">
                                Filters Applied
                            </span>
                        )}
                        {!showZeroAmounts && (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                                Zero amounts hidden
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Sort by:</span>
                        <select
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value)}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                        >
                            <option value="TotalAmount">Total Amount</option>
                            <option value="AssetAmount">Asset Amount</option>
                            <option value="SemiAssetAmount">Semi-Asset Amount</option>
                            <option value="SemiConsumbleAmount">Consumable Amount</option>
                            <option value="BoughtOutAmount">Bought-Out Amount</option>
                            <option value="CCCode">CC Code</option>
                            <option value="CCName">CC Name</option>
                        </select>
                        <button
                            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {sortDirection === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stock Summary Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(filteredAndSortedData) && filteredAndSortedData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">SL No</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">CC Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">CC Name</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Asset Amount</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Semi-Asset</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Consumable</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Bought-Out</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredAndSortedData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.SlNo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {item.CCCode}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.CCName}>
                                                {item.CCName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            <span className={clsx(
                                                parseFloat(item.AssetAmount) > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                                            )}>
                                                {formatCurrency(item.AssetAmount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            <span className={clsx(
                                                parseFloat(item.SemiAssetAmount) > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'
                                            )}>
                                                {formatCurrency(item.SemiAssetAmount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            <span className={clsx(
                                                parseFloat(item.SemiConsumbleAmount) > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'
                                            )}>
                                                {formatCurrency(item.SemiConsumbleAmount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                            <span className={clsx(
                                                parseFloat(item.BoughtOutAmount) > 0 ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'
                                            )}>
                                                {formatCurrency(item.BoughtOutAmount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                            <span className="text-indigo-600 dark:text-indigo-400">
                                                {formatCurrency(item.TotalAmount)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        {/* Empty State */}
                        {!loading.stockSummary && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Stock Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        {searchTerm || selectedCategory !== 'all' || !showZeroAmounts
                                            ? "No data matches your current filters. Try adjusting your search criteria."
                                            : "Click 'Refresh' to load the latest stock summary data from your system."
                                        }
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.stockSummary && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Stock Summary</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching the latest stock data across all cost centers...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Category Details Modal */}
            <StockCategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categoryData={selectedCategoryData}
                categoryType={selectedCategoryType}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Stock Summary Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Summary Analytics:</strong> View total amounts across all categories with advanced statistics<br/>
                            2. <strong>Category Breakdown:</strong> Click on category cards to view detailed cost center information<br/>
                            3. <strong>Advanced Filtering:</strong> Search by code/name, filter by category, show/hide zero amounts<br/>
                            4. <strong>Smart Sorting:</strong> Sort by any column with ascending/descending options<br/>
                            5. <strong>Data Export:</strong> Download filtered results as Excel for offline analysis<br/>
                            6. <strong>Real-time Data:</strong> Automatic refresh indicators and fresh data validation<br/>
                            7. <strong>Responsive Design:</strong> Optimized for all screen sizes with dark mode support<br/>
                            8. <strong>Performance Optimized:</strong> Efficient data processing with memoized calculations
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

export default StockSummaryPage;