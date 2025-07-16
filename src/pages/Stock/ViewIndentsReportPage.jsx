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
    Info,
    RefreshCw,
    ChevronRight,
    XCircle,
    Building,
    IndianRupee,
    Package2,
    Coins,
    FileText,
    MessageSquare,
    ArrowRightLeft,
    Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';

// Import slice actions and selectors
import {
    fetchCostCenterCodes,
    fetchIndentGridData,
    fetchIndentCompleteDetails,
    setFilters,
    clearFilters,
    resetGridData,
    resetAllData,
    clearError,
    selectCostCenterCodes,
    selectIndentGridData,
    selectCombinedIndentDetails,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectIndentSummary,
    selectProcessedRemarks,
    selectProcessedTransferDetails
} from '../../slices/stockSlice/viewIndentReportSlice';

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

// Modal Component for Indent Details
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
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="max-h-[80vh] overflow-y-auto">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Combined Indent Details Modal Component
const IndentDetailsModal = ({ isOpen, onClose, indentData, indno }) => {
    const dispatch = useDispatch();
    const combinedDetails = useSelector(selectCombinedIndentDetails);
    const processedRemarks = useSelector(selectProcessedRemarks);
    const processedTransferDetails = useSelector(selectProcessedTransferDetails);
    const loading = useSelector(selectLoading);
    
    // Tab state
    const [activeTab, setActiveTab] = useState('items');

    useEffect(() => {
        if (isOpen && indno) {
            dispatch(fetchIndentCompleteDetails({ Indno: indno }));
        }
    }, [isOpen, indno, dispatch]);

    // Reset tab when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab('items');
        }
    }, [isOpen]);

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

    const itemsData = combinedDetails?.itemsDetails?.Data || [];
    const transferData = combinedDetails?.transferDetails?.Data || [];
    const remarksData = combinedDetails?.remarks?.Data || [];

    // Get counts directly from API responses
    const itemsCount = itemsData.length;
    const transferCount = transferData.filter(item => item.Itemcode && item.Itemcode.trim()).length; // Only count items with Itemcode (lowercase 'c')
    const remarksCount = remarksData.filter(item => item.Remarks && item.Remarks.trim()).length;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Indent Details - ${indno}`} size="full">
            {loading.combinedDetails ? (
                <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Loading indent details...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Indent Information */}
                    {indentData && (
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Indent Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Indent Number</p>
                                    <p className="text-base text-gray-900 dark:text-white">{indentData.Indentno || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date</p>
                                    <p className="text-base text-gray-900 dark:text-white">{indentData.Date || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost Center</p>
                                    <p className="text-base text-gray-900 dark:text-white">{indentData.Costcenter || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</p>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{formatCurrency(indentData.Amount)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabbed Content */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                        {/* Tab Headers */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            <button 
                                onClick={() => setActiveTab('items')}
                                className={clsx(
                                    "flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors",
                                    activeTab === 'items' 
                                        ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-600" 
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-transparent hover:border-gray-300"
                                )}
                            >
                                <Package className="h-4 w-4 inline mr-2" />
                                Items Details ({itemsCount})
                            </button>
                            <button 
                                onClick={() => setActiveTab('transfer')}
                                className={clsx(
                                    "flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors",
                                    activeTab === 'transfer' 
                                        ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-600" 
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-transparent hover:border-gray-300"
                                )}
                            >
                                <ArrowRightLeft className="h-4 w-4 inline mr-2" />
                                Transfer Details ({transferCount})
                            </button>
                            <button 
                                onClick={() => setActiveTab('remarks')}
                                className={clsx(
                                    "flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors",
                                    activeTab === 'remarks' 
                                        ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-600" 
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-transparent hover:border-gray-300"
                                )}
                            >
                                <MessageSquare className="h-4 w-4 inline mr-2" />
                                Remarks ({remarksCount})
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-4">
                            {/* Items Details Tab */}
                            {activeTab === 'items' && (
                                <div>
                                    {Array.isArray(itemsData) && itemsData.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                            Item Code
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                            Item Name
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                            Specification
                                                        </th>
                                                        <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                            Basic Rate
                                                        </th>
                                                        <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                            Actual Qty
                                                        </th>
                                                        <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                            Indent Value
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {itemsData.map((item, index) => (
                                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                                <div className="font-medium">{item.Itemcode || '-'}</div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                                <div className="max-w-xs">
                                                                    <div className="font-medium">{item.Itemname || '-'}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                                <div className="max-w-xs truncate" title={item.Specification}>
                                                                    {item.Specification || '-'}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                                                ₹{formatCurrency(item.Basic || 0)}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                                                <span className="text-indigo-600 dark:text-indigo-400">
                                                                    {formatQuantity(item.ActuallQty || 0)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-bold">
                                                                <span className="text-green-600 dark:text-green-400">
                                                                    ₹{formatCurrency(item.IndentValue || 0)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">No items found for this indent</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Transfer Details Tab */}
                            {activeTab === 'transfer' && (
                                <div>
                                    {transferData.filter(item => item.Itemcode && item.Itemcode.trim()).length > 0 ? (
                                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {transferData.filter(item => item.Itemcode && item.Itemcode.trim()).map((transfer, index) => (
                                                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                                        <div className="space-y-2">
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Item Code:</span>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{transfer.Itemcode}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Transferred Qty:</span>
                                                                <p className="text-sm text-indigo-600 dark:text-indigo-400">{transfer.TransferredQty || 0}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">From CC:</span>
                                                                <p className="text-sm text-gray-900 dark:text-white">{transfer.FromCC || '-'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Ref No:</span>
                                                                <p className="text-sm text-gray-900 dark:text-white">{transfer.Refno || '-'}</p>
                                                            </div>
                                                            {transfer.ItemStatus && (
                                                                <div>
                                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Status:</span>
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-2">
                                                                        {transfer.ItemStatus}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">No transfer details found for this indent</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Remarks Tab */}
                            {activeTab === 'remarks' && (
                                <div>
                                    {remarksData.filter(item => item.Remarks && item.Remarks.trim()).length > 0 ? (
                                        <div className="space-y-3">
                                            {remarksData.filter(item => item.Remarks && item.Remarks.trim()).map((remark, index) => (
                                                <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-50 dark:from-gray-900/20 dark:to-gray-900/20 rounded-lg p-4 border-l-4 border-indigo-500">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                                                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{index + 1}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{remark.Remarks}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400">No remarks found for this indent</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Error Display for individual APIs */}
                            {combinedDetails?.errors && (
                                <div className="mt-8">
                                    {Object.entries(combinedDetails.errors).map(([key, error]) => {
                                        if (!error) return null;
                                        return (
                                            <div key={key} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-2">
                                                <div className="flex items-center">
                                                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                                                    <span className="text-red-800 dark:text-red-200 text-sm">
                                                        Error loading {key}: {error}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

// Summary Cards Component
const SummaryCards = ({ summary }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const cards = [
        {
            title: 'Total Indents',
            value: summary.totalIndents,
            icon: FileText,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
            isCount: true,
            subtitle: 'Indent requests'
        },
        {
            title: 'Total Amount',
            value: summary.totalAmount,
            icon: IndianRupee,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            isCount: false,
            subtitle: 'Total indent value'
        },
        {
            title: 'Cost Centers',
            value: summary.uniqueCostCenters,
            icon: Building,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
            isCount: true,
            subtitle: 'Unique locations'
        },
        {
            title: 'Average Amount',
            value: summary.averageAmount,
            icon: Coins,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'from-orange-50 to-orange-50 dark:from-orange-900/20 dark:to-orange-900/20',
            isCount: false,
            subtitle: 'Per indent average'
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

const ViewIndentsReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const costCenterCodes = useSelector(selectCostCenterCodes);
    const indentGridData = useSelector(selectIndentGridData);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const indentSummary = useSelector(selectIndentSummary);

    // Get userData from auth state (includes UID and roleId)
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        CCode: '',
        fromDate: '',
        toDate: ''
    });

    // Modal state
    const [isIndentDetailsModalOpen, setIsIndentDetailsModalOpen] = useState(false);
    const [selectedIndentData, setSelectedIndentData] = useState(null);
    const [selectedIndno, setSelectedIndno] = useState('');

    // Track initialization
    const [hasInitialized, setHasInitialized] = useState(false);

    // Load cost center codes when userData is available
    useEffect(() => {
        if (uid && roleId && !hasInitialized) {
            const params = {
                UID: uid,
                RID: roleId
            };

            dispatch(fetchCostCenterCodes(params))
                .unwrap()
                .then((response) => {
                    console.log('✅ Cost Center Codes loaded successfully');
                    setHasInitialized(true);
                })
                .catch((error) => {
                    console.error('❌ Failed to load Cost Center Codes:', error);
                    toast.error('Failed to load cost center codes');
                    setHasInitialized(true);
                });
        }
    }, [dispatch, uid, roleId, hasInitialized]);

    // Sync local filters with Redux filters
    useEffect(() => {
        setLocalFilters(prev => ({
            ...prev,
            CCode: filters.CCode || '',
            fromDate: filters.fromDate || filters.Fdate || '',
            toDate: filters.toDate || filters.TDate || ''
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

    // Format date for display in date picker
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        try {
            // If it's already a Date object, return it
            if (dateString instanceof Date) return dateString;
            // If it's a string, convert to Date
            if (typeof dateString === 'string') {
                return new Date(dateString);
            }
            return new Date(dateString);
        } catch {
            return '';
        }
    };

    // Format date for display in table
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN');
        } catch {
            return dateString;
        }
    };

    // Helper function to convert date to string for storage
    const convertDateToString = (date) => {
        if (!date) return '';
        if (typeof date === 'string') return date;
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        return date;
    };

    // Handle date changes
    const handleDateChange = (filterName, date) => {
        setLocalFilters(prev => ({
            ...prev,
            [filterName]: convertDateToString(date) // Convert to string immediately
        }));
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

                await dispatch(fetchCostCenterCodes(params)).unwrap();
                toast.success('Cost center codes refreshed successfully');
            } else {
                toast.warning('Please ensure user credentials are available.');
            }

        } catch (error) {
            console.error('❌ Failed to refresh Cost Center Codes:', error);
            toast.error('Failed to refresh cost center codes. Please try again.');
        }
    };

    // Handle view button click
    const handleView = async () => {
        try {
            // Validate required fields
            if (!localFilters.CCode) {
                toast.warning('Please select a cost center');
                return;
            }
            if (!localFilters.fromDate || !localFilters.toDate) {
                toast.warning('Please select both from and to dates');
                return;
            }

            // Convert dates to API format (assuming YYYY-MM-DD)
            const formatDateForAPI = (date) => {
                if (!date) return '';
                if (typeof date === 'string') return date;
                if (date instanceof Date) {
                    return date.toISOString().split('T')[0];
                }
                return date;
            };

            // Update Redux filters with serializable format (strings only)
            const apiFilters = {
                CCode: localFilters.CCode,
                fromDate: formatDateForAPI(localFilters.fromDate), // Convert to string
                toDate: formatDateForAPI(localFilters.toDate),     // Convert to string
                Fdate: formatDateForAPI(localFilters.fromDate),
                TDate: formatDateForAPI(localFilters.toDate)
            };

            dispatch(setFilters(apiFilters));

            // Prepare params for indent grid
            const params = {
                CCode: localFilters.CCode,
                Fdate: formatDateForAPI(localFilters.fromDate),
                TDate: formatDateForAPI(localFilters.toDate)
            };

            await dispatch(fetchIndentGridData(params)).unwrap();
            toast.success('Indent report loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching indent report:', error);
            toast.error('Failed to fetch indent report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            CCode: '',
            fromDate: '', // Empty string instead of Date
            toDate: ''    // Empty string instead of Date
        });
        dispatch(resetAllData());
    };

    // Handle row click to view indent details
    const handleRowClick = (indentData) => {
        const indno = indentData.Indentno;
        if (indno) {
            setSelectedIndentData(indentData);
            setSelectedIndno(indno);
            setIsIndentDetailsModalOpen(true);
        } else {
            toast.warning('Indent number not available for this indent');
        }
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = indentGridData?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Cost Center': item.Costcenter || '-',
                'Indent Number': item.Indentno || '-',
                'Date': item.Date || '-',
                'Amount': item.Amount || 0,
                'Indent ID': item.Indid || '-'
            }));

            // Format dates for filename
            const formatDateForFilename = (date) => {
                if (!date) return '';
                if (typeof date === 'string') return date;
                if (date instanceof Date) return date.toISOString().split('T')[0];
                return convertDateToString(date);
            };

            const filename = `View_Indents_Report_${localFilters.CCode || 'All'}_${formatDateForFilename(localFilters.fromDate)}_to_${formatDateForFilename(localFilters.toDate)}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get indent data for display
    const indentData = indentGridData?.Data || [];

    // Helper function to check if form is valid for submission
    const isFormValid = () => {
        return !!(uid && roleId && localFilters.CCode && localFilters.fromDate && localFilters.toDate && !isAnyLoading);
    };

    // Helper function to get cost center options
    const getCostCenterOptions = () => {
        if (!costCenterCodes) {
            return [];
        }

        // Handle different response structures
        let data = [];
        if (Array.isArray(costCenterCodes)) {
            data = costCenterCodes;
        } else if (costCenterCodes.Data && Array.isArray(costCenterCodes.Data)) {
            data = costCenterCodes.Data;
        } else if (costCenterCodes.data && Array.isArray(costCenterCodes.data)) {
            data = costCenterCodes.data;
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
                            <FileText className="h-8 w-8 text-indigo-600" />
                            View Indents Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Monitor and analyze indent requests with detailed workflow tracking
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-indigo-100 dark:from-indigo-900 dark:to-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Indent Management
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
                        <span className="text-gray-900 dark:text-white">View Indents Report</span>
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
                                disabled={loading.costCenterCodes}
                                className="ml-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                title="Refresh Cost Center Codes"
                            >
                                <RefreshCw className={`w-4 h-4 inline ${loading.costCenterCodes ? 'animate-spin' : ''}`} />
                            </button>
                        </label>
                        <select
                            value={localFilters.CCode}
                            onChange={(e) => handleFilterChange('CCode', e.target.value)}
                            disabled={loading.costCenterCodes}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Cost Center</option>
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

                        {loading.costCenterCodes && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 flex items-center">
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Loading cost centers...
                            </p>
                        )}

                        {errors.costCenterCodes && (
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
                            Options: {getCostCenterOptions().length}
                            {localFilters.CCode && <span className="text-green-600"> | Selected: {localFilters.CCode}</span>}
                        </div>
                    </div>

                    {/* From Date */}
                    <div>
                        <CustomDatePicker
                            label="From Date"
                            placeholder="Select from date"
                            value={formatDateForDisplay(localFilters.fromDate)}
                            onChange={(date) => handleDateChange('fromDate', date)}
                            maxDate={formatDateForDisplay(localFilters.toDate) || new Date()}
                            size="md"
                            required
                        />
                    </div>

                    {/* To Date */}
                    <div>
                        <CustomDatePicker
                            label="To Date"
                            placeholder="Select to date"
                            value={formatDateForDisplay(localFilters.toDate)}
                            onChange={(date) => handleDateChange('toDate', date)}
                            minDate={formatDateForDisplay(localFilters.fromDate)}
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
                            disabled={!isFormValid()}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-600 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.indentGridData ? (
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
                        <Tooltip content="Download indent report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(indentData) || indentData.length === 0}
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
            <SummaryCards summary={indentSummary} />

            {/* Indent Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(indentData) && indentData.length > 0 ? (
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Indent Number
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-28">
                                        Date
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-40">
                                        Cost Center
                                    </th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Amount
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-24">
                                        Indent ID
                                    </th>
                                    <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider w-20">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {indentData.map((indent, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-32">
                                            <div className="truncate font-medium" title={indent.Indentno}>
                                                {indent.Indentno || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-28">
                                            <div className="truncate" title={formatDate(indent.Date)}>
                                                {formatDate(indent.Date)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-40">
                                            <div className="truncate" title={indent.Costcenter}>
                                                {indent.Costcenter || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold w-32">
                                            <div className="truncate" title={`₹${formatCurrency(indent.Amount)}`}>
                                                <span className="text-green-600 dark:text-green-400">
                                                    ₹{formatCurrency(indent.Amount)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-24">
                                            <div className="truncate font-medium" title={indent.Indid}>
                                                <span className="text-indigo-600 dark:text-indigo-400">
                                                    {indent.Indid || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center w-20">
                                            <button
                                                onClick={() => handleRowClick(indent)}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                title="View Indent Details"
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
                        {!loading.indentGridData && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-indigo-100 dark:from-indigo-900 dark:to-indigo-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Indent Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select cost center and date range, then click "View Report" to load indent data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.indentGridData && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-indigo-100 dark:from-indigo-900 dark:to-indigo-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Indent Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching indent data...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Indent Details Modal */}
            <IndentDetailsModal
                isOpen={isIndentDetailsModalOpen}
                onClose={() => setIsIndentDetailsModalOpen(false)}
                indentData={selectedIndentData}
                indno={selectedIndno}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200">
                        <p className="font-semibold mb-1">View Indents Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Cost Center Filter:</strong> Select specific cost centers based on user permissions<br />
                            2. <strong>Date Range:</strong> Filter indents within specific date periods using date pickers<br />
                            3. <strong>Combined Details:</strong> Click the eye icon to view items, transfer details, and approval remarks<br />
                            4. <strong>Summary Analytics:</strong> Overview of total indents, amounts, cost centers, and averages<br />
                            5. <strong>Approval Workflow:</strong> View complete approval chain with remarks from all stakeholders<br />
                            6. <strong>Transfer Tracking:</strong> Monitor transferred items with quantities and reference numbers<br />
                            7. <strong>Export Functionality:</strong> Download complete indent data as Excel file<br />
                            8. <strong>Real-time Data:</strong> Current indent status with comprehensive workflow tracking<br />
                            9. <strong>Responsive Design:</strong> Optimized for all devices with detailed modal views
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

export default ViewIndentsReportPage;