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
    Activity,
    XCircle,
    Building,
    IndianRupee,
    Package2,
    Coins,
    FileText,
    Calendar,
    ShoppingCart,
    BarChart3
} from 'lucide-react';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';

// Import the PDF download component
import { MaterialIssueSlipDownloadButton } from './MaterialIssueSlipDocument';

// Import slice actions and selectors
import {
    fetchViewCostCenterCodes,
    fetchIssueGridData,
    fetchIssueItemsDetails,
    setFilters,
    clearFilters,
    resetGridData,
    resetAllData,
    clearError,
    selectViewCostCenterCodes,
    selectIssueGridData,
    selectIssueItemsDetails,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectIssueSummary
} from '../../slices/stockSlice/dailyIssueItemsReportSlice';

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

// Modal Component for Issue Details
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

// Issue Items Details Modal Component
const IssueItemsModal = ({ isOpen, onClose, issueData, issueno }) => {
    const dispatch = useDispatch();
    const issueItemsDetails = useSelector(selectIssueItemsDetails);
    const loading = useSelector(selectLoading);

    useEffect(() => {
        if (isOpen && issueno) {
            dispatch(fetchIssueItemsDetails({ Issueno: issueno }));
        }
    }, [isOpen, issueno, dispatch]);

    const formatQuantity = (qty) => {
        if (!qty && qty !== 0) return '0.0000';
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 4
        }).format(qty);
    };

    const itemsData = issueItemsDetails?.Data || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Issue Items Details - ${issueno}`} size="full">
            {loading.issueItemsDetails ? (
                <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Loading issue items...</p>
                </div>
            ) : Array.isArray(itemsData) && itemsData.length > 0 ? (
                <div className="space-y-6">
                    {/* Issue Information */}
                    {issueData && (
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Issue Information</h4>
                                
                                {/* PDF Download Button */}
                                <div className="flex items-center gap-4">
                                    <MaterialIssueSlipDownloadButton 
                                        issueData={issueData}
                                        itemsData={itemsData}
                                        disabled={!itemsData || itemsData.length === 0}
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction ID</p>
                                    <p className="text-base text-gray-900 dark:text-white">{issueData.TansactionId || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Date</p>
                                    <p className="text-base text-gray-900 dark:text-white">{issueData.Date || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost Center</p>
                                    <p className="text-base text-gray-900 dark:text-white">{issueData.CCCode || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reference ID</p>
                                    <p className="text-base text-gray-900 dark:text-white">{issueData.RId || '-'}</p>
                                </div>
                            </div>
                            {issueData.Description && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</p>
                                    <p className="text-sm text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">{issueData.Description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PDF Download Info Card
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <div className="text-red-800 dark:text-red-200">
                                <p className="font-semibold mb-1">Material Issue Slip PDF Features:</p>
                                <p className="text-sm">
                                    ✓ Professional format with company branding • ✓ Complete item details with quantities • ✓ Signature sections for authorization • ✓ Automatic calculations and summary
                                </p>
                            </div>
                        </div>
                    </div> */}

                    {/* Items Table */}
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
                                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        DCA Code
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Sub DCA Code
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                                        Units
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Issue Date
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
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            <div className="font-medium">{item.DcaCode || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            <div className="font-medium">{item.SubDcaCode || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-center">
                                            <span className="text-purple-600 dark:text-purple-400 font-medium">
                                                {item.Units || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">
                                            <span className="text-indigo-600 dark:text-indigo-400">
                                                {formatQuantity(item.Quantity || 0)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            <div className="truncate">{item.IssueDate || '-'}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No issue items found</p>
                </div>
            )}
        </Modal>
    );
};

// Summary Cards Component
const SummaryCards = ({ summary }) => {
    const formatQuantity = (qty) => {
        if (!qty && qty !== 0) return '0.0000';
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 4
        }).format(qty);
    };

    const cards = [
        {
            title: 'Total Issues',
            value: summary.totalIssues,
            icon: ShoppingCart,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20',
            isCount: true,
            subtitle: 'Issue transactions'
        },
        {
            title: 'Total Quantity',
            value: summary.totalQuantity,
            icon: Package2,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            isCount: false,
            subtitle: 'Items issued',
            isQuantity: true
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
            title: 'Average Quantity',
            value: summary.averageAmount,
            icon: BarChart3,
            color: 'from-orange-500 to-orange-600',
            bgColor: 'from-orange-50 to-orange-50 dark:from-orange-900/20 dark:to-orange-900/20',
            isCount: false,
            subtitle: 'Per issue average',
            isQuantity: true
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
                                {card.isCount ? card.value : 
                                 card.isQuantity ? formatQuantity(card.value) : 
                                 card.value}
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

const DailyIssuedItemsReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const viewCostCenterCodes = useSelector(selectViewCostCenterCodes);
    const issueGridData = useSelector(selectIssueGridData);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const issueSummary = useSelector(selectIssueSummary);

    // Get userData from auth state (includes UID and roleId)
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        StoreStatus: 'Active',
        CCode: '',
        fromDate: '',
        toDate: ''
    });

    // Modal state
    const [isIssueItemsModalOpen, setIsIssueItemsModalOpen] = useState(false);
    const [selectedIssueData, setSelectedIssueData] = useState(null);
    const [selectedIssueno, setSelectedIssueno] = useState('');

    // Track initialization
    const [hasInitialized, setHasInitialized] = useState(false);

    // Load cost center codes when userData is available and status is selected
    useEffect(() => {
        if (uid && roleId && localFilters.StoreStatus && !hasInitialized) {
            const params = {
                UID: uid,
                RID: roleId,
                StoreStatus: localFilters.StoreStatus
            };

            dispatch(fetchViewCostCenterCodes(params))
                .unwrap()
                .then((response) => {
                    console.log('✅ View Cost Center Codes loaded successfully');
                    setHasInitialized(true);
                })
                .catch((error) => {
                    console.error('❌ Failed to load View Cost Center Codes:', error);
                    toast.error('Failed to load cost center codes');
                    setHasInitialized(true);
                });
        }
    }, [dispatch, uid, roleId, localFilters.StoreStatus, hasInitialized]);

    // Reload cost center codes when store status changes
    useEffect(() => {
        if (uid && roleId && localFilters.StoreStatus && hasInitialized) {
            const params = {
                UID: uid,
                RID: roleId,
                StoreStatus: localFilters.StoreStatus
            };

            dispatch(fetchViewCostCenterCodes(params))
                .unwrap()
                .then((response) => {
                    console.log('✅ View Cost Center Codes reloaded for status:', localFilters.StoreStatus);
                    // Clear selected cost center when status changes
                    setLocalFilters(prev => ({ ...prev, CCode: '' }));
                })
                .catch((error) => {
                    console.error('❌ Failed to reload View Cost Center Codes:', error);
                    toast.error('Failed to reload cost center codes');
                });
        }
    }, [localFilters.StoreStatus, dispatch, uid, roleId, hasInitialized]);

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
            if (uid && roleId && localFilters.StoreStatus) {
                const params = {
                    UID: uid,
                    RID: roleId,
                    StoreStatus: localFilters.StoreStatus
                };

                await dispatch(fetchViewCostCenterCodes(params)).unwrap();
                toast.success('Cost center codes refreshed successfully');
            } else {
                toast.warning('Please select store status and ensure user credentials are available.');
            }

        } catch (error) {
            console.error('❌ Failed to refresh View Cost Center Codes:', error);
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

            // Convert dates to API format (assuming YYYY-MM-DD) - dates are optional
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
                StoreStatus: localFilters.StoreStatus,
                CCode: localFilters.CCode,
                fromDate: formatDateForAPI(localFilters.fromDate), // Convert to string
                toDate: formatDateForAPI(localFilters.toDate),     // Convert to string
                Fdate: formatDateForAPI(localFilters.fromDate),
                TDate: formatDateForAPI(localFilters.toDate)
            };

            dispatch(setFilters(apiFilters));

            // Prepare params for issue grid - dates are optional
            const params = {
                CCode: localFilters.CCode
            };
            
            // Add dates only if they are not empty
            const fdate = formatDateForAPI(localFilters.fromDate);
            const tdate = formatDateForAPI(localFilters.toDate);
            
            if (fdate && fdate.trim() !== '') {
                params.Fdate = fdate;
            }
            if (tdate && tdate.trim() !== '') {
                params.TDate = tdate;
            }

            await dispatch(fetchIssueGridData(params)).unwrap();
            toast.success('Issue report loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching issue report:', error);
            toast.error('Failed to fetch issue report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            StoreStatus: 'Active',
            CCode: '',
            fromDate: '', // Empty string instead of Date
            toDate: ''    // Empty string instead of Date
        });
        dispatch(resetAllData());
    };

    // Handle row click to view issue items
    const handleRowClick = (issueData) => {
        const issueno = issueData.TansactionId;
        if (issueno) {
            setSelectedIssueData(issueData);
            setSelectedIssueno(issueno);
            setIsIssueItemsModalOpen(true);
        } else {
            toast.warning('Transaction ID not available for this issue');
        }
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = issueGridData?.Data || [];
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Transaction ID': item.TansactionId || '-',
                'Date': item.Date || '-',
                'Cost Center': item.CCCode || '-',
                'Reference ID': item.RId || '-',
                'Description': item.Description || '-'
            }));

            // Format dates for filename
            const formatDateForFilename = (date) => {
                if (!date) return '';
                if (typeof date === 'string') return date;
                if (date instanceof Date) return date.toISOString().split('T')[0];
                return convertDateToString(date);
            };

            const filename = `Daily_Issued_Items_Report_${localFilters.CCode || 'All'}_${formatDateForFilename(localFilters.fromDate)}_to_${formatDateForFilename(localFilters.toDate)}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get issue data for display
    const issueData = issueGridData?.Data || [];

    // Helper function to check if form is valid for submission
    const isFormValid = () => {
        return !!(uid && roleId && localFilters.CCode && !isAnyLoading);
    };

    // Helper function to get cost center options
    const getCostCenterOptions = () => {
        if (!viewCostCenterCodes) {
            return [];
        }

        // Handle different response structures
        let data = [];
        if (Array.isArray(viewCostCenterCodes)) {
            data = viewCostCenterCodes;
        } else if (viewCostCenterCodes.Data && Array.isArray(viewCostCenterCodes.Data)) {
            data = viewCostCenterCodes.Data;
        } else if (viewCostCenterCodes.data && Array.isArray(viewCostCenterCodes.data)) {
            data = viewCostCenterCodes.data;
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
                            <ShoppingCart className="h-8 w-8 text-indigo-600" />
                            Daily Issued Items Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Monitor daily issue of consumables, raw materials, and bought-out items
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-indigo-100 dark:from-indigo-900 dark:to-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Issue Management
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
                        <span className="text-gray-900 dark:text-white">Daily Issued Items Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Store Status Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Activity className="w-4 h-4 inline mr-2" />
                            Store Status
                        </label>
                        <select
                            value={localFilters.StoreStatus}
                            onChange={(e) => handleFilterChange('StoreStatus', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="Active">Active</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    {/* Cost Center Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            <Building className="w-4 h-4 inline mr-2" />
                            Cost Center
                            <button
                                onClick={handleRefreshCostCenterCodes}
                                disabled={loading.viewCostCenterCodes}
                                className="ml-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                                title="Refresh Cost Center Codes"
                            >
                                <RefreshCw className={`w-4 h-4 inline ${loading.viewCostCenterCodes ? 'animate-spin' : ''}`} />
                            </button>
                        </label>
                        <select
                            value={localFilters.CCode}
                            onChange={(e) => handleFilterChange('CCode', e.target.value)}
                            disabled={loading.viewCostCenterCodes || !localFilters.StoreStatus}
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

                        {loading.viewCostCenterCodes && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2 flex items-center">
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                Loading cost centers...
                            </p>
                        )}

                        {errors.viewCostCenterCodes && (
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
                            Status: {localFilters.StoreStatus} | Options: {getCostCenterOptions().length}
                            {localFilters.CCode && <span className="text-green-600"> | Selected: {localFilters.CCode}</span>}
                        </div>
                    </div>

                    {/* From Date (Optional) */}
                    <div>
                        <CustomDatePicker
                            label="From Date (Optional)"
                            placeholder="Select from date"
                            value={formatDateForDisplay(localFilters.fromDate)}
                            onChange={(date) => handleDateChange('fromDate', date)}
                            maxDate={formatDateForDisplay(localFilters.toDate) || new Date()}
                            size="md"
                            required={false}
                        />
                    </div>

                    {/* To Date (Optional) */}
                    <div>
                        <CustomDatePicker
                            label="To Date (Optional)"
                            placeholder="Select to date"
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
                            disabled={!isFormValid()}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-600 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.issueGridData ? (
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
                        <Tooltip content="Download issue report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(issueData) || issueData.length === 0}
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
            <SummaryCards summary={issueSummary} />

            {/* Issue Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(issueData) && issueData.length > 0 ? (
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-indigo-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Transaction ID
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-28">
                                        Date
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-32">
                                        Cost Center
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-24">
                                        Reference ID
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-96">
                                        Description
                                    </th>
                                    <th className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider w-20">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {issueData.map((issue, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-32">
                                            <div className="truncate font-medium" title={issue.TansactionId}>
                                                {issue.TansactionId || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-28">
                                            <div className="truncate" title={formatDate(issue.Date)}>
                                                {formatDate(issue.Date)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-32">
                                            <div className="truncate font-medium" title={issue.CCCode}>
                                                <span className="text-indigo-600 dark:text-indigo-400">
                                                    {issue.CCCode || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-24">
                                            <div className="truncate" title={issue.RId}>
                                                {issue.RId || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white w-96">
                                            <div className="truncate" title={issue.Description}>
                                                {issue.Description || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center w-20">
                                            <button
                                                onClick={() => handleRowClick(issue)}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                title="View Issue Items"
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
                        {!loading.issueGridData && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-indigo-100 dark:from-indigo-900 dark:to-indigo-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Issue Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select store status and cost center, then click "View Report" to load issue data. Dates are optional.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading.issueGridData && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-indigo-100 dark:from-indigo-900 dark:to-indigo-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Issue Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching issue data...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Issue Items Modal */}
            <IssueItemsModal
                isOpen={isIssueItemsModalOpen}
                onClose={() => setIsIssueItemsModalOpen(false)}
                issueData={selectedIssueData}
                issueno={selectedIssueno}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200">
                        <p className="font-semibold mb-1">Daily Issued Items Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Store Status Filter:</strong> Choose between Active or Closed stores to load relevant cost centers<br />
                            2. <strong>Cost Center Filter:</strong> Select specific cost centers based on selected store status<br />
                            3. <strong>Optional Date Range:</strong> Filter issues within specific date periods - dates can be left blank<br />
                            4. <strong>Issue Details:</strong> Click the eye icon to view detailed issued items with quantities and specifications<br />
                            5. <strong>Summary Analytics:</strong> Overview of total issues, quantities, cost centers, and averages<br />
                            6. <strong>Flexible Filtering:</strong> Cost center is required, but date filters are optional for broader searches<br />
                            7. <strong>Export Functionality:</strong> Download complete issue data as Excel file<br />
                            8. <strong>PDF Issue Slip:</strong> Generate professional Material Issue Slip with company branding and signatures<br />
                            9. <strong>Real-time Data:</strong> Current issue status with approval workflow tracking<br />
                            10. <strong>Consumables Tracking:</strong> Monitor raw materials, consumables, and bought-out items issued daily
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

export default DailyIssuedItemsReportPage;