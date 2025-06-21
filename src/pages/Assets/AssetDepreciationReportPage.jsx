import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    Building2,
    TrendingDown,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    Calendar,
    DollarSign,
    X,
    Filter,
    RefreshCw,
    ChevronRight,
    Activity,
    Package,
    Clock,
    Calculator,
    Banknote,
    PieChart,
    BarChart3,
    IndianRupeeIcon
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchAllAssetDepCostCenters,
    fetchAssetsDepreciation,
    setFilters,
    clearFilters,
    resetAssetDepreciationData,
    resetCostCentersData,
    resetDepreciationReportData,
    clearError,
    selectAllAssetDepCostCenters,
    selectAssetsDepreciation,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectHasAnyError
} from '../../slices/assetsSlice/assetDepreciationReportSlice';

// Import from budget slice for financial years
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

// Modal Component for Asset Details
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

// Asset Details Modal Component
const AssetDetailsModal = ({ isOpen, onClose, assetData, loading }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!assetData) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Asset Utilization Cost Details" size="lg">
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <RotateCcw className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                    <p className="text-indigo-700 dark:text-indigo-300">Loading asset utilization details...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Asset Information */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Asset Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Item Code:</span>
                                <p className="text-gray-900 dark:text-white">{assetData.ItemCode || '-'}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Item Name:</span>
                                <p className="text-gray-900 dark:text-white">{assetData.itemname || '-'}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">DCA Code:</span>
                                <p className="text-gray-900 dark:text-white">{assetData.subdcacode || '-'}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Basic Price:</span>
                                <p className="text-gray-900 dark:text-white font-medium">₹{formatCurrency(assetData.basicprice)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Site Utilization Details */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Site Utilization Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current FY Usage Days:</span>
                                <p className="text-gray-900 dark:text-white">{assetData.DaysforCurrentFy || 0} days</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Previous FY Usage Days:</span>
                                <p className="text-gray-900 dark:text-white">{assetData.DaysforPreviousFy || 0} days</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current FY Site Cost:</span>
                                <p className="text-green-600 dark:text-green-400 font-medium">₹{formatCurrency(assetData.DecpreciationValueForCurrentFy)}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Previous FY Site Cost:</span>
                                <p className="text-indigo-600 dark:text-indigo-400 font-medium">₹{formatCurrency(assetData.DecpreciationValueForPreviousFy)}</p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Site Cost Allocated:</span>
                                <p className="text-red-600 dark:text-red-400 font-bold text-lg">₹{formatCurrency(assetData.cudepvalue)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Asset Utilization Costing Method */}
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Utilization Costing Method</h4>
                        <div className="space-y-3">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
                                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-2">Internal Asset Costing: Basic Price × 0.1% per day (Admin Configurable)</p>
                                <div className="text-xs text-indigo-700 dark:text-indigo-400 space-y-1">
                                    <p>• Daily Cost Rate: ₹{formatCurrency((assetData.basicprice || 0) * 0.001)}</p>
                                    <p>• Current FY Site Cost: ₹{formatCurrency((assetData.basicprice || 0) * 0.001)} × {assetData.DaysforCurrentFy || 0} days = ₹{formatCurrency(assetData.DecpreciationValueForCurrentFy || 0)}</p>
                                    <p>• Previous FY Site Cost: ₹{formatCurrency((assetData.basicprice || 0) * 0.001)} × {assetData.DaysforPreviousFy || 0} days = ₹{formatCurrency(assetData.DecpreciationValueForPreviousFy || 0)}</p>
                                    <p className="text-indigo-800 dark:text-indigo-200 font-medium">• Purpose: Track real asset deployment costs per project/site</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Utilization Analysis */}
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Utilization Analysis</h4>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Site Cost:</span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    ₹{formatCurrency((assetData.DecpreciationValueForCurrentFy || 0) + (assetData.DecpreciationValueForPreviousFy || 0))}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usage Days:</span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {(assetData.DaysforCurrentFy || 0) + (assetData.DaysforPreviousFy || 0)} days
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost Allocation %:</span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {assetData.basicprice ? ((assetData.cudepvalue / assetData.basicprice) * 100).toFixed(2) : 0}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining Asset Value:</span>
                                <span className="text-gray-900 dark:text-white font-bold">
                                    ₹{formatCurrency((assetData.basicprice || 0) - (assetData.cudepvalue || 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

// Summary Cards Component
const SummaryCards = ({ depreciationData }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!depreciationData || !Array.isArray(depreciationData.Data) || depreciationData.Data.length === 0) {
        return null;
    }

    // Calculate summary from depreciation data
    const summary = depreciationData.Data.reduce((acc, item) => {
        acc.totalAssets += 1;
        acc.totalBasicPrice += parseFloat(item.basicprice || 0);
        acc.totalCurrentFYDep += parseFloat(item.DecpreciationValueForCurrentFy || 0);
        acc.totalPreviousFYDep += parseFloat(item.DecpreciationValueForPreviousFy || 0);
        acc.totalCumulativeDep += parseFloat(item.cudepvalue || 0);
        acc.totalCurrentFYDays += parseFloat(item.DaysforCurrentFy || 0);
        return acc;
    }, {
        totalAssets: 0,
        totalBasicPrice: 0,
        totalCurrentFYDep: 0,
        totalPreviousFYDep: 0,
        totalCumulativeDep: 0,
        totalCurrentFYDays: 0
    });

    const totalBookValue = summary.totalBasicPrice - summary.totalCumulativeDep;
    
    // Calculate actual allocation rate from the data
    let actualAllocationRate = 0;
    if (depreciationData.Data.length > 0) {
        // Find an item with current FY data, otherwise use previous FY data
        const sampleItem = depreciationData.Data.find(item => 
            item.DaysforCurrentFy > 0 && item.DecpreciationValueForCurrentFy > 0
        ) || depreciationData.Data.find(item => 
            item.DaysforPreviousFy > 0 && item.DecpreciationValueForPreviousFy > 0
        );
        
        if (sampleItem) {
            const cost = sampleItem.DaysforCurrentFy > 0 ? 
                sampleItem.DecpreciationValueForCurrentFy : 
                sampleItem.DecpreciationValueForPreviousFy;
            const days = sampleItem.DaysforCurrentFy > 0 ? 
                sampleItem.DaysforCurrentFy : 
                sampleItem.DaysforPreviousFy;
            const basicPrice = sampleItem.basicprice;
            
            if (days > 0 && basicPrice > 0) {
                const dailyCost = cost / days;
                const dailyRate = dailyCost / basicPrice;
                actualAllocationRate = dailyRate * 100;
            }
        }
    }

    const cards = [
        {
            title: 'Total Assets',
            value: summary.totalAssets,
            icon: Package,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            isCount: true
        },
        {
            title: 'Total Basic Price',
            value: summary.totalBasicPrice,
            icon: IndianRupeeIcon,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Current FY Site Cost',
            value: summary.totalCurrentFYDep,
            icon: TrendingDown,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        },
        {
            title: 'Total Cost Till Date',
            value: summary.totalCumulativeDep,
            icon: Calculator,
            color: 'from-red-500 to-pink-600',
            bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
        },
        // {
        //     title: 'Remaining Asset Value',
        //     value: totalBookValue,
        //     icon: Banknote,
        //     color: 'from-indigo-500 to-purple-600',
        //     bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        // },
        {
            title: 'Cost Allocation Rate',
            value: actualAllocationRate,
            icon: PieChart,
            color: 'from-purple-500 to-indigo-600',
            bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
            isPercent: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
            {cards.map((card, index) => (
                <div key={index} className={`bg-gradient-to-r ${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                {card.title}
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {card.isCount ? card.value : 
                                 card.isPercent ? `${card.value.toFixed(2)}%` : 
                                 formatCurrency(card.value)}
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

const AssetDepreciationReportPage = () => {
    const dispatch = useDispatch();
    
    // Get userData from auth state (includes UID and roleId)
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;
    
    // Redux selectors
    const allAssetDepCostCenters = useSelector(selectAllAssetDepCostCenters);
    const assetsDepreciation = useSelector(selectAssetsDepreciation);
    const allFinancialYears = useSelector(selectAllFinancialYears);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        Status: 'Active',
        CCCode: '',
        Fyear: ''
    });

    // Modal state
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedAssetData, setSelectedAssetData] = useState(null);

    // Load initial data
    useEffect(() => {
        dispatch(fetchAllFinancialYears());
        if (uid && roleId) {
            dispatch(fetchAllAssetDepCostCenters({
                UID: uid,
                RID: roleId,
                StoreStatus: localFilters.Status || 'Active'
            }));
        }
    }, [dispatch, uid, roleId, localFilters.Status]);

    // Sync local filters with Redux filters
    useEffect(() => {
        setLocalFilters(prev => ({
            ...prev,
            ...filters
        }));
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
        dispatch(resetDepreciationReportData());
        
        // Reload cost centers when Status changes
        if (filterName === 'Status' && uid && roleId) {
            // Reset CCCode when status changes
            setLocalFilters(prev => ({
                ...prev,
                [filterName]: value,
                CCCode: ''
            }));
            
            dispatch(fetchAllAssetDepCostCenters({
                UID: uid,
                RID: roleId,
                StoreStatus: value
            }));
        }
    };

    // Handle view button click
    const handleView = async () => {
        // Validation
        if (!localFilters.Status) {
            toast.warning('Please select a Status');
            return;
        }

        if (!localFilters.CCCode) {
            toast.warning('Please select a Cost Center');
            return;
        }

        if (!localFilters.Fyear) {
            toast.warning('Please select a Financial Year');
            return;
        }

        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));
            
            // Fetch assets depreciation report
            const params = {
                CCCode: localFilters.CCCode,
                Fyear: localFilters.Fyear
            };
            
            await dispatch(fetchAssetsDepreciation(params)).unwrap();
            toast.success('Asset utilization cost report loaded successfully');
            
        } catch (error) {
            console.error('❌ Error fetching asset utilization cost report:', error);
            toast.error('Failed to fetch asset utilization cost report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            Status: 'Active',
            CCCode: '',
            Fyear: ''
        });
        dispatch(clearFilters());
        dispatch(resetAssetDepreciationData());
        
        // Reload cost centers with default status
        if (uid && roleId) {
            dispatch(fetchAllAssetDepCostCenters({
                UID: uid,
                RID: roleId,
                StoreStatus: 'Active'
            }));
        }
    };

    // Handle row click to view asset details
    const handleRowClick = async (rowData) => {
        setSelectedAssetData(rowData);
        setIsDetailsModalOpen(true);
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = assetsDepreciation?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Item Code': item.ItemCode || '-',
                'Item Name': item.itemname || '-',
                'DCA Code': item.subdcacode || '-',
                'Basic Price': item.basicprice || 0,
                'Current FY Usage Days': item.DaysforCurrentFy || 0,
                'Previous FY Usage Days': item.DaysforPreviousFy || 0,
                'Current FY Site Cost': item.DecpreciationValueForCurrentFy || 0,
                'Previous FY Site Cost': item.DecpreciationValueForPreviousFy || 0,
                'Total Site Cost Allocated': item.cudepvalue || 0,
                'Remaining Asset Value': (item.basicprice || 0) - (item.cudepvalue || 0)
            }));

            const filename = `Asset_Utilization_Cost_Report_${localFilters.CCCode}_${localFilters.Fyear}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get asset depreciation data for display
    const depreciationData = assetsDepreciation?.Data || [];

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Package className="h-8 w-8 text-indigo-600" />
                            Asset Utilization Cost Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Track asset deployment costs and site utilization for project management
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Financial Reports
                        </div>
                        {loading.assetsDepreciation && (
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
                        <span className="text-gray-900 dark:text-white">Utilization Cost Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.Status}
                            onChange={(e) => handleFilterChange('Status', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="Active">Active</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    {/* Cost Center Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Cost Center <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.CCCode}
                            onChange={(e) => handleFilterChange('CCCode', e.target.value)}
                            disabled={loading.allAssetDepCostCenters}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Cost Center</option>
                            {Array.isArray(allAssetDepCostCenters?.Data) && allAssetDepCostCenters.Data.map((cc, index) => {
                                const ccCode = cc?.CC_Code || cc?.CostCenterCode || cc?.code;
                                const ccName = cc?.CC_Name || cc?.CostCenterName || cc?.name;
                                
                                if (!ccCode) return null;
                                
                                return (
                                    <option key={ccCode || index} value={ccCode}>
                                        {ccCode} - {ccName || 'Unknown'}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.allAssetDepCostCenters && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading cost centers...
                            </p>
                        )}
                    </div>

                    {/* Financial Year Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Financial Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.Fyear}
                            onChange={(e) => handleFilterChange('Fyear', e.target.value)}
                            disabled={loading.allFinancialYears}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Financial Year</option>
                            {Array.isArray(allFinancialYears?.Data) && allFinancialYears.Data.map((year, index) => {
                                const yearValue = year?.YearValue || year?.Year;
                                const yearDisplay = year?.Year || year?.YearValue;
                                
                                if (!yearValue) return null;
                                
                                return (
                                    <option key={yearValue || index} value={yearValue}>
                                        {yearDisplay || `FY ${yearValue}`}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.allFinancialYears && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading financial years...
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isAnyLoading || !localFilters.Status || !localFilters.CCCode || !localFilters.Fyear}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.assetsDepreciation ? (
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
                        <Tooltip content="Download asset utilization cost report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(depreciationData) || depreciationData.length === 0}
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
            <SummaryCards depreciationData={assetsDepreciation} />

            {/* Asset Depreciation Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(depreciationData) && depreciationData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Item Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Item Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">DCA Code</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Basic Price</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Usage Days</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Current FY Cost</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Previous FY Cost</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Total Site Cost</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Remaining Value</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {depreciationData.map((item, index) => {
                                    const bookValue = (item.basicprice || 0) - (item.cudepvalue || 0);
                                    return (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                                {item.ItemCode || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                <div className="max-w-xs truncate" title={item.itemname}>
                                                    {item.itemname || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-xs">
                                                    {item.subdcacode || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                                ₹{formatCurrency(item.basicprice || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                                                <span className="flex items-center justify-center gap-1">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    {item.DaysforCurrentFy || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                                <span className="text-orange-600 dark:text-orange-400">
                                                    ₹{formatCurrency(item.DecpreciationValueForCurrentFy || 0)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                                <span className="text-indigo-600 dark:text-indigo-400">
                                                    ₹{formatCurrency(item.DecpreciationValueForPreviousFy || 0)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                                <span className="text-red-600 dark:text-red-400">
                                                    ₹{formatCurrency(item.cudepvalue || 0)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                                <span className={bookValue >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                                    ₹{formatCurrency(bookValue)}
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
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        {/* Empty State */}
                        {!loading.assetsDepreciation && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Asset Utilization Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select your status, cost center and financial year, then click "View Report" to load your asset utilization cost data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.assetsDepreciation && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Asset Utilization Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching asset utilization cost data for the selected cost center...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Asset Details Modal */}
            <AssetDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                assetData={selectedAssetData}
                loading={false}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Asset Utilization Cost Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200 mb-3">
                            1. <strong>Status Selection:</strong> Choose between Active or Closed status to filter cost centers<br/>
                            2. <strong>Cost Center Selection:</strong> Choose from available cost centers based on your role and selected status<br/>
                            3. <strong>Financial Year:</strong> Required filter to view asset utilization data for specific year<br/>
                            4. <strong>Click Actions:</strong> Click the eye icon on any row to view detailed asset utilization information<br/>
                            5. <strong>Summary Cards:</strong> View total assets, basic price, site costs, and remaining asset values<br/>
                            6. <strong>Export:</strong> Download asset utilization cost report as Excel file for project analysis<br/>
                            7. <strong>Real-time Loading:</strong> Visual feedback during data fetching operations
                        </p>
                        <div className="bg-white dark:bg-indigo-800 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700">
                            <p className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">Asset Utilization Costing Method:</p>
                            <p className="text-indigo-700 dark:text-indigo-200 text-xs">
                                <strong>Purpose:</strong> Track real asset deployment costs per project/site (like rent charging)<br/>
                                <strong>Current Rate:</strong> Basic Price × 0.1% per day (Admin configurable)<br/>
                                <strong>Example:</strong> Asset worth ₹10,500 = ₹10.5 per day × 82 days = ₹861 cost to site<br/>
                                <strong>Business Value:</strong> Understand real usage costs of assets across different projects<br/>
                                <strong>Formula:</strong> Daily Cost Rate = Basic Price × 0.001, Total Site Cost = Daily Rate × Usage Days
                            </p>
                        </div>
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
export default AssetDepreciationReportPage;