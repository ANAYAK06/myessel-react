import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    Package,
    ArrowRightLeft,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    TrendingUp,
    TrendingDown,
    DollarSign,
    X,
    Filter,
    RefreshCw,
    ChevronRight,
    Banknote,
    Receipt,
    FileText,
    Clock,
    Archive,
    ShoppingCart,
    Minus,
    Plus,
    AlertCircle,
    Target,
    IndianRupee
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import stock reconciliation slice actions and selectors
import {
    fetchStockReconciliationData,
    fetchStockRecCostCenterCodes,
    fetchStockReconciliationSummaryData,
    setFilters,
    clearFilters,
    resetAllStockReconciliationData,
    clearError,
    setType,
    setStoreStatus,
    setCostCenter,
    setUserCredentials,
    selectStockReconciliationData,
    selectStockRecCostCenterCodes,
    selectStockReconciliationSummaryData,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectBasicFiltersValid,
    selectCostCenterFiltersValid
} from '../../slices/stockSlice/stockReconciliationSlice';

// Detail Modal Component
const DetailModal = ({ isOpen, onClose, data, title }) => {
    if (!isOpen) return null;

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Target className="h-5 w-5 text-indigo-600" />
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {data && Array.isArray(data) && data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reference No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CC/Source</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PO No</th>
                                        
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {data.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {item.Date || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {item.No || item.ReferenceNo || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {item.RecievedCC || item.Source || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">
                                                {formatCurrency(item.quantity || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {item.po_no || '-'}
                                            </td>
                                           
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-500 dark:text-gray-400">
                                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No detailed transactions found for this category.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

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

// Reconciliation Summary Cards Component
const ReconciliationSummaryCards = ({ reconciliationData }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!reconciliationData || !Array.isArray(reconciliationData) || reconciliationData.length === 0) {
        return null;
    }

    // Calculate summary from reconciliation data
    const summary = reconciliationData.reduce((acc, item) => {
        // Received amounts
        const receivedFromCentral = parseFloat(item.rcvfrmcentralamt || 0);
        const receivedFromOtherCC = parseFloat(item.rcvfrmotherccamt || 0);
        const purchasedAtCC = parseFloat(item.purchasedatccAmt || 0);
        
        // Consumed/Issued amounts
        const issuedForConsumption = parseFloat(item.Issue_for_cons || 0) * parseFloat(item.BasicPrice || 0);
        
        // Transfer amounts (using quantities * basic price for estimation)
        const transferredToCentral = parseFloat(item.Trans_to_central || 0) * parseFloat(item.BasicPrice || 0);
        const transferredToOtherCC = parseFloat(item.Trans_to_othercc || 0) * parseFloat(item.BasicPrice || 0);
        
        // Lost/Scrapped/Sold amounts
        const lostAmount = parseFloat(item.lost_rep_accep || 0) * parseFloat(item.BasicPrice || 0);
        const scrappedAmount = parseFloat(item.Scrapped_rep_accep || 0) * parseFloat(item.BasicPrice || 0);
        const soldAmount = parseFloat(item.SoldAmt || 0);
        
        // Current stock amount - Calculate balance stock
        const totalReceived = receivedFromCentral + receivedFromOtherCC + purchasedAtCC;
        const totalTransferredQty = parseFloat(item.Trans_to_central || 0) + parseFloat(item.Trans_to_othercc || 0);
        const totalConsumedLostQty = parseFloat(item.Issue_for_cons || 0) + parseFloat(item.lost_rep_accep || 0) + parseFloat(item.Scrapped_rep_accep || 0);
        const balanceStockQty = (parseFloat(item.rcv_frm_central || 0) + parseFloat(item.rcv_frm_othercc || 0) + parseFloat(item.purchased_at_cc || 0)) - (totalTransferredQty + totalConsumedLostQty);
        const balanceStockAmount = balanceStockQty * parseFloat(item.BasicPrice || 0);
        
        acc.totalReceivedAtCC += totalReceived;
        acc.consumedAtCC += issuedForConsumption;
        acc.transferred += transferredToCentral + transferredToOtherCC;
        acc.balanceStockAtCC += balanceStockAmount;
        acc.lostAmount += lostAmount;
        acc.scrappedAmount += scrappedAmount;
        acc.soldOutAmount += soldAmount;
        acc.totalItems += 1;
        
        return acc;
    }, {
        totalReceivedAtCC: 0,
        consumedAtCC: 0,
        transferred: 0,
        balanceStockAtCC: 0,
        lostAmount: 0,
        scrappedAmount: 0,
        soldOutAmount: 0,
        totalItems: 0
    });

    const cards = [
        {
            title: 'Total Received at CC',
            value: summary.totalReceivedAtCC,
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Consumed at CC',
            value: summary.consumedAtCC,
            icon: Minus,
            color: 'from-red-500 to-pink-600',
            bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
        },
        {
            title: 'Transferred',
            value: summary.transferred,
            icon: ArrowRightLeft,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20'
        },
        {
            title: 'Balance Stock at CC',
            value: summary.balanceStockAtCC,
            icon: Package,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        },
        {
            title: 'Lost Amount',
            value: summary.lostAmount,
            icon: AlertCircle,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        },
        {
            title: 'Scrapped Amount',
            value: summary.scrappedAmount,
            icon: Archive,
            color: 'from-gray-500 to-slate-600',
            bgColor: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20'
        },
        {
            title: 'Sold Out Amount',
            value: summary.soldOutAmount,
            icon: IndianRupee,
            color: 'from-emerald-500 to-green-600',
            bgColor: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
            {cards.map((card, index) => (
                <div key={index} className={`bg-gradient-to-r ${card.bgColor} rounded-xl p-4 border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                {card.title}
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatCurrency(card.value)}
                            </p>
                        </div>
                        <div className={`bg-gradient-to-r ${card.color} p-2 rounded-lg`}>
                            <card.icon className="h-4 w-4 text-white" />
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

const StockReconciliationPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const stockReconciliationData = useSelector(selectStockReconciliationData);
    const stockRecCostCenterCodes = useSelector(selectStockRecCostCenterCodes);
    const stockReconciliationSummaryData = useSelector(selectStockReconciliationSummaryData);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const basicFiltersValid = useSelector(selectBasicFiltersValid);
    const costCenterFiltersValid = useSelector(selectCostCenterFiltersValid);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        CCCode: '',
        Type: '',
        UID: '',
        RID: '',
        StoreStatus: '',
        For: ''
    });

    // Local search state for filtering loaded data
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state for detailed view
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);

    // Static data for dropdowns
    const typeOptions = [
        { label: 'Assets', value: '1' },
        { label: 'Semi Assets', value: '2' },
        { label: 'Consumables', value: '3' },
        { label: 'Boughtout Items', value: '4' }
    ];

    const storeStatusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Closed', value: 'Closed' }
    ];

    // Load cost center codes when store status changes
    useEffect(() => {
        if (localFilters.UID && localFilters.RID && localFilters.StoreStatus) {
            const params = {
                UID: localFilters.UID,
                RID: localFilters.RID,
                StoreStatus: localFilters.StoreStatus
            };
            dispatch(fetchStockRecCostCenterCodes(params));
        }
    }, [localFilters.UID, localFilters.RID, localFilters.StoreStatus, dispatch]);

    // Sync local filters with Redux filters
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // Get userData from auth state (includes UID and roleId)
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Set user credentials from auth state
    useEffect(() => {
        if (uid && roleId) {
            const userCredentials = {
                UID: uid,
                RID: roleId
            };
            setLocalFilters(prev => ({
                ...prev,
                ...userCredentials
            }));
            dispatch(setUserCredentials(userCredentials));
        }
    }, [uid, roleId, dispatch]);

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
        
        // Clear cost center when store status changes
        if (filterName === 'StoreStatus') {
            setLocalFilters(prev => ({
                ...prev,
                CCCode: ''
            }));
        }
    };

    // Local validation for view button
    const isViewButtonEnabled = localFilters.CCCode && localFilters.Type && !isAnyLoading;

    // Handle view button click
    const handleView = async () => {
        // Validation
        if (!localFilters.CCCode || !localFilters.Type) {
            toast.warning('Please select both Cost Center and Type');
            return;
        }

        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));
            
            // Fetch stock reconciliation data
            const params = {
                CCCode: localFilters.CCCode,
                Type: localFilters.Type
            };
            
            await dispatch(fetchStockReconciliationData(params)).unwrap();
            toast.success('Stock reconciliation data loaded successfully');
            
        } catch (error) {
            console.error('❌ Error fetching stock reconciliation data:', error);
            toast.error('Failed to fetch stock reconciliation data. Please try again.');
        }
    };

    // Handle column click for detailed view - FIXED: Trim itemCode to remove blank spaces
    const handleColumnClick = async (forType, itemCode, columnTitle) => {
        try {
            // Fix Issue #3: Trim itemCode to remove blank spaces
            const trimmedItemCode = (itemCode || '').trim();
            
            if (!trimmedItemCode) {
                toast.warning('Invalid item code');
                return;
            }

            const params = {
                CCCode: localFilters.CCCode,
                Type: localFilters.Type,
                For: forType,
                ItemCode: trimmedItemCode // Use trimmed item code
            };
            
            const response = await dispatch(fetchStockReconciliationSummaryData(params)).unwrap();
            
            // Set modal data
            setSelectedDetail({
                title: `${columnTitle} - ${trimmedItemCode}`,
                data: response?.Data || []
            });
            setShowDetailModal(true);
            
        } catch (error) {
            console.error('❌ Error fetching summary data:', error);
            toast.error('Failed to fetch detailed data. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        const userCredentials = {
            UID: uid,
            RID: roleId
        };
        
        setLocalFilters({
            CCCode: '',
            Type: '',
            UID: userCredentials.UID, // Keep user credentials
            RID: userCredentials.RID,
            StoreStatus: '',
            For: ''
        });
        setSearchTerm(''); // Clear search term
        setShowDetailModal(false); // Close any open modals
        setSelectedDetail(null);
        dispatch(clearFilters());
        dispatch(resetAllStockReconciliationData());
        
        // Re-set user credentials to ensure they're available for cost center loading
        dispatch(setUserCredentials(userCredentials));
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const dataToExport = filteredReconciliationData.length > 0 ? filteredReconciliationData : reconciliationData;
            
            if (dataToExport.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = dataToExport.map(item => {
                // Calculate balance stock for each item
                const totalReceived = (parseFloat(item.rcv_frm_central || 0) + parseFloat(item.rcv_frm_othercc || 0) + parseFloat(item.purchased_at_cc || 0));
                const totalTransferred = (parseFloat(item.Trans_to_central || 0) + parseFloat(item.Trans_to_othercc || 0));
                const totalConsumedLost = (parseFloat(item.Issue_for_cons || 0) + parseFloat(item.lost_rep_accep || 0) + parseFloat(item.Scrapped_rep_accep || 0));
                const balanceStock = totalReceived - (totalTransferred + totalConsumedLost);
                const balanceStockAmount = balanceStock * (parseFloat(item.BasicPrice || 0));
                
                return {
                    'Item Code': item.ItemCode || '-',
                    'Item Name': item.itemname || '-',
                    'Specification': item.Specification || '-',
                    'Units': item.Units || '-',
                    'Basic Price': item.BasicPrice || 0,
                    'Received from Central': item.rcv_frm_central || 0,
                    'Received from Other CC': item.rcv_frm_othercc || 0,
                    'Purchased at CC': item.purchased_at_cc || 0,
                    'Transferred to Central': item.Trans_to_central || 0,
                    'Transferred to Other CC': item.Trans_to_othercc || 0,
                    'Issued for Consumption': item.Issue_for_cons || 0,
                    'Lost Amount': item.lost_rep_accep || 0,
                    'Scrapped Amount': item.Scrapped_rep_accep || 0,
                    'Sold Amount': item.SoldAmt || 0,
                    'Balance Stock Quantity': balanceStock,
                    'Balance Stock Amount': balanceStockAmount
                };
            });

            const typeLabel = typeOptions.find(t => t.value === localFilters.Type)?.label || 'All';
            const searchSuffix = searchTerm ? `_Filtered_${searchTerm.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
            const filename = `Stock_Reconciliation_${typeLabel}_${localFilters.CCCode}${searchSuffix}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get reconciliation data for display
    const reconciliationData = Array.isArray(stockReconciliationData?.Data) ? stockReconciliationData.Data : 
                              Array.isArray(stockReconciliationData) ? stockReconciliationData : [];

    // Filter data based on search term
    const filteredReconciliationData = reconciliationData.filter(item => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        const itemCode = (item.ItemCode || '').toLowerCase();
        const itemName = (item.itemname || '').toLowerCase();
        
        return itemCode.includes(searchLower) || itemName.includes(searchLower);
    });

    // Get cost center options
    const costCenterOptions = Array.isArray(stockRecCostCenterCodes?.Data) ? stockRecCostCenterCodes.Data : [];

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Package className="h-8 w-8 text-indigo-600" />
                            Stock Reconciliation Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Comprehensive stock reconciliation analysis with detailed transaction breakdown
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Stock Reports
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
                        <span className="text-gray-900 dark:text-white">Stock Reconciliation</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.Type}
                            onChange={(e) => handleFilterChange('Type', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">Select Type</option>
                            {typeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Store Status */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Store Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.StoreStatus}
                            onChange={(e) => handleFilterChange('StoreStatus', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">Select Store Status</option>
                            {storeStatusOptions.map((option) => (
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
                            value={localFilters.CCCode}
                            onChange={(e) => handleFilterChange('CCCode', e.target.value)}
                            disabled={loading.stockRecCostCenterCodes || !localFilters.StoreStatus}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Cost Center</option>
                            {costCenterOptions.map((center, index) => {
                                const centerCode = center?.CC_Code || center?.costCenterCode || center?.code;
                                const centerName = center?.CC_Name || center?.costCenterName || center?.name;
                                
                                if (!centerCode) return null;
                                
                                return (
                                    <option key={centerCode || index} value={centerCode}>
                                        {centerName || 'Unnamed Center'}
                                    </option>
                                );
                            })}
                        </select>
                        
                        {loading.stockRecCostCenterCodes && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading cost centers...
                            </p>
                        )}
                        
                        {!localFilters.StoreStatus && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Please select store status first
                            </p>
                        )}
                    </div>

                    
                   
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={!isViewButtonEnabled}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.stockReconciliationData ? (
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
                        <Tooltip content="Download stock reconciliation as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(reconciliationData) || reconciliationData.length === 0}
                                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <Download className="h-5 w-5" />
                                Excel
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Search Section - Only show when data is loaded */}
            {Array.isArray(reconciliationData) && reconciliationData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                        <Search className="h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by item code or item name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {filteredReconciliationData.length} of {reconciliationData.length} items
                        </div>
                    </div>
                </div>
            )}

            {/* Reconciliation Summary Cards */}
            <ReconciliationSummaryCards reconciliationData={filteredReconciliationData} />

            {/* Stock Reconciliation Table - FIXED: Added sticky header and removed header interactions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(filteredReconciliationData) && filteredReconciliationData.length > 0 ? (
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Fix Issue #1: Sticky Header */}
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider" rowSpan="2">Item Details</th>
                                    <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider" colSpan="3">Received</th>
                                    <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider" colSpan="2">Transferred</th>
                                    <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider" colSpan="3">Consumed/Lost</th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider" rowSpan="2">Balance Stock</th>
                                </tr>
                                <tr>
                                    {/* Fix Issue #2: Removed onClick, Eye icons and Tooltips from headers */}
                                    <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider">From Central</th>
                                    <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider">From Other CC</th>
                                    <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider">Purchased</th>
                                    <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider">To Central</th>
                                    <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider">To Other CC</th>
                                    <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider">Consumed</th>
                                    <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider">Lost</th>
                                    <th className="px-2 py-2 text-center text-xs font-bold text-white uppercase tracking-wider">Scrapped</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredReconciliationData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                <div className="font-medium">{item.ItemCode || '-'}</div>
                                                <div className="text-gray-500 dark:text-gray-400 text-xs">{item.itemname || '-'}</div>
                                                <div className="text-gray-400 dark:text-gray-500 text-xs">{item.Specification || '-'}</div>
                                                <div className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                                                    Unit: {item.Units || '-'} | Price: ₹{formatCurrency(item.BasicPrice || 0)}
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Fix Issue #2: Added tooltips to data cells instead of headers */}
                                        {/* Received from Central */}
                                        <td className="px-2 py-4 text-center">
                                            <Tooltip content="Click to view detailed transactions for Received from Central">
                                                <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded p-1"
                                                     onClick={() => handleColumnClick("RecivedFromCentralStore", item.ItemCode, "Received from Central")}>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.rcv_frm_central || 0}
                                                    </div>
                                                    <div className="text-xs text-green-600 dark:text-green-400">
                                                        ₹{formatCurrency(item.rcvfrmcentralamt || 0)}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </td>
                                        
                                        {/* Received from Other CC */}
                                        <td className="px-2 py-4 text-center">
                                            <Tooltip content="Click to view detailed transactions for Received from Other CC">
                                                <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded p-1"
                                                     onClick={() => handleColumnClick("RECEIVEDFROMOTHERCC", item.ItemCode, "Received from Other CC")}>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.rcv_frm_othercc || 0}
                                                    </div>
                                                    <div className="text-xs text-green-600 dark:text-green-400">
                                                        ₹{formatCurrency(item.rcvfrmotherccamt || 0)}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </td>
                                        
                                        {/* Purchased at CC */}
                                        <td className="px-2 py-4 text-center">
                                            <Tooltip content="Click to view detailed transactions for Purchased at CC">
                                                <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded p-1"
                                                     onClick={() => handleColumnClick("PURCHASEDATCC", item.ItemCode, "Purchased at CC")}>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.purchased_at_cc || 0}
                                                    </div>
                                                    <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                                        ₹{formatCurrency(item.purchasedatccAmt || 0)}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </td>
                                        
                                        {/* Transferred to Central */}
                                        <td className="px-2 py-4 text-center">
                                            <Tooltip content="Click to view detailed transactions for Transferred to Central">
                                                <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded p-1"
                                                     onClick={() => handleColumnClick("TRANSFEREDTOCENTRALSTORE", item.ItemCode, "Transferred to Central")}>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.Trans_to_central || 0}
                                                    </div>
                                                    <div className="text-xs text-purple-600 dark:text-purple-400">
                                                        ₹{formatCurrency((item.Trans_to_central || 0) * (item.BasicPrice || 0))}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </td>
                                        
                                        {/* Transferred to Other CC */}
                                        <td className="px-2 py-4 text-center">
                                            <Tooltip content="Click to view detailed transactions for Transferred to Other CC">
                                                <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded p-1"
                                                     onClick={() => handleColumnClick("TRANSFERTOOTHERCC", item.ItemCode, "Transferred to Other CC")}>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.Trans_to_othercc || 0}
                                                    </div>
                                                    <div className="text-xs text-purple-600 dark:text-purple-400">
                                                        ₹{formatCurrency((item.Trans_to_othercc || 0) * (item.BasicPrice || 0))}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </td>
                                        
                                        {/* Issued for Consumption */}
                                        <td className="px-2 py-4 text-center">
                                            <Tooltip content="Click to view detailed transactions for Issued for Consumption">
                                                <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded p-1"
                                                     onClick={() => handleColumnClick("IssuedForCCConsumption", item.ItemCode, "Issued for Consumption")}>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.Issue_for_cons || 0}
                                                    </div>
                                                    <div className="text-xs text-red-600 dark:text-red-400">
                                                        ₹{formatCurrency((item.Issue_for_cons || 0) * (item.BasicPrice || 0))}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </td>
                                        
                                        {/* Lost & Damaged */}
                                        <td className="px-2 py-4 text-center">
                                            <Tooltip content="Click to view detailed transactions for Lost & Damaged">
                                                <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded p-1"
                                                     onClick={() => handleColumnClick("LOSTANDDAMAGESREPORTACCPETED", item.ItemCode, "Lost & Damaged")}>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.lost_rep_accep || 0}
                                                    </div>
                                                    <div className="text-xs text-orange-600 dark:text-orange-400">
                                                        ₹{formatCurrency((item.lost_rep_accep || 0) * (item.BasicPrice || 0))}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </td>
                                        
                                        {/* Scrapped */}
                                        <td className="px-2 py-4 text-center">
                                            <Tooltip content="Click to view detailed transactions for Scrapped Items">
                                                <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded p-1"
                                                     onClick={() => handleColumnClick("SCRAPPEDREPORTACCEPTED", item.ItemCode, "Scrapped Items")}>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.Scrapped_rep_accep || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        ₹{formatCurrency((item.Scrapped_rep_accep || 0) * (item.BasicPrice || 0))}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </td>
                                        
                                        {/* Balance Stock */}
                                        <td className="px-4 py-4 text-center">
                                            <Tooltip content="Click to view balance stock calculation details">
                                                <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors rounded p-1"
                                                     onClick={() => {
                                                         // Calculate balance stock
                                                         const totalReceived = (parseFloat(item.rcv_frm_central || 0) + parseFloat(item.rcv_frm_othercc || 0) + parseFloat(item.purchased_at_cc || 0));
                                                         const totalTransferred = (parseFloat(item.Trans_to_central || 0) + parseFloat(item.Trans_to_othercc || 0));
                                                         const totalConsumedLost = (parseFloat(item.Issue_for_cons || 0) + parseFloat(item.lost_rep_accep || 0) + parseFloat(item.Scrapped_rep_accep || 0));
                                                         const balanceStock = totalReceived - (totalTransferred + totalConsumedLost);
                                                         
                                                         const calculationData = [{
                                                             'Description': 'Total Received',
                                                             'Quantity': totalReceived,
                                                             'Amount': `₹${formatCurrency(((parseFloat(item.rcvfrmcentralamt || 0) + parseFloat(item.rcvfrmotherccamt || 0) + parseFloat(item.purchasedatccAmt || 0))))}`
                                                         }, {
                                                             'Description': 'Total Transferred',
                                                             'Quantity': totalTransferred,
                                                             'Amount': `₹${formatCurrency(totalTransferred * (parseFloat(item.BasicPrice || 0)))}`
                                                         }, {
                                                             'Description': 'Total Consumed/Lost',
                                                             'Quantity': totalConsumedLost,
                                                             'Amount': `₹${formatCurrency(totalConsumedLost * (parseFloat(item.BasicPrice || 0)))}`
                                                         }, {
                                                             'Description': 'Balance Stock',
                                                             'Quantity': balanceStock,
                                                             'Amount': `₹${formatCurrency(balanceStock * (parseFloat(item.BasicPrice || 0)))}`
                                                         }];
                                                         
                                                         setSelectedDetail({
                                                             title: `Balance Stock Calculation - ${item.ItemCode}`,
                                                             data: calculationData
                                                         });
                                                         setShowDetailModal(true);
                                                     }}>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {(() => {
                                                            const totalReceived = (parseFloat(item.rcv_frm_central || 0) + parseFloat(item.rcv_frm_othercc || 0) + parseFloat(item.purchased_at_cc || 0));
                                                            const totalTransferred = (parseFloat(item.Trans_to_central || 0) + parseFloat(item.Trans_to_othercc || 0));
                                                            const totalConsumedLost = (parseFloat(item.Issue_for_cons || 0) + parseFloat(item.lost_rep_accep || 0) + parseFloat(item.Scrapped_rep_accep || 0));
                                                            const balanceStock = totalReceived - (totalTransferred + totalConsumedLost);
                                                            return balanceStock;
                                                        })()}
                                                    </div>
                                                    <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                                        ₹{(() => {
                                                            const totalReceived = (parseFloat(item.rcv_frm_central || 0) + parseFloat(item.rcv_frm_othercc || 0) + parseFloat(item.purchased_at_cc || 0));
                                                            const totalTransferred = (parseFloat(item.Trans_to_central || 0) + parseFloat(item.Trans_to_othercc || 0));
                                                            const totalConsumedLost = (parseFloat(item.Issue_for_cons || 0) + parseFloat(item.lost_rep_accep || 0) + parseFloat(item.Scrapped_rep_accep || 0));
                                                            const balanceStock = totalReceived - (totalTransferred + totalConsumedLost);
                                                            return formatCurrency(balanceStock * (parseFloat(item.BasicPrice || 0)));
                                                        })()}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        {/* No Search Results State */}
                        {reconciliationData.length > 0 && filteredReconciliationData.length === 0 && searchTerm && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Items Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        No items match your search "{searchTerm}". Try searching with different keywords or clear the search to see all items.
                                    </p>
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {reconciliationData.length === 0 && !loading.stockReconciliationData && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Stock Reconciliation Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select your type, store status, and cost center, then click "View Report" to load your stock reconciliation data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.stockReconciliationData && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Stock Reconciliation</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching stock reconciliation data for the selected criteria...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Detail Modal */}
            <DetailModal 
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                data={selectedDetail?.data}
                title={selectedDetail?.title}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Stock Reconciliation Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Sticky Header:</strong> Table headers remain visible while scrolling through data<br/>
                            2. <strong>Interactive Data Cells:</strong> Click on any quantity cell to view detailed transaction history<br/>
                            3. <strong>Smart Item Code Handling:</strong> Automatically trims whitespace from item codes for accurate data retrieval<br/>
                            4. <strong>Balance Stock Calculation:</strong> Automatically calculated as Total Received - (Total Transferred + Consumed/Lost) with clickable drill-down<br/>
                            5. <strong>Comprehensive Columns:</strong> Received, Transferred, Consumed, Lost, Scrapped, and Balance Stock categories with drill-down capability<br/>
                            6. <strong>Real-time Search:</strong> Filter by item code or name after data is loaded<br/>
                            7. <strong>Summary Cards:</strong> Overview of total received, consumed, transferred, balance, lost, scrapped, and sold amounts<br/>
                            8. <strong>Export Functionality:</strong> Download filtered or complete data as Excel file with balance stock calculations<br/>
                            9. <strong>Detailed Modal View:</strong> Popup showing transaction details or balance stock calculations with breakdown<br/>
                            10. <strong>Responsive Design:</strong> Works seamlessly across all devices with proper validation<br/>
                            11. <strong>Enhanced UX:</strong> Tooltips on data cells, hover effects, and clear visual feedback
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

export default StockReconciliationPage;