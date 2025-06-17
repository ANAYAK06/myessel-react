import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    FileText,
    Building2,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    Info,
    Calendar,
    DollarSign,
    X,
    Filter,
    RefreshCw,
    ChevronRight,
    Activity,
    TrendingUp,
    TrendingDown,
    User,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    Building,
    Wallet,
    Grid3X3,
    List,
    SortAsc,
    SortDesc,
    FileBarChart,
    Users,
    Package,
    CalendarDays,
    IndianRupee,
    Percent,
    Target,
    Briefcase,
    MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchAllCostCentersClient,
    fetchClientPObyCC,
    fetchClientPOForReport,
    setFilters,
    clearFilters,
    clearError,
    selectAllCostCentersClient,
    selectClientPObyCC,
    selectClientPOForReport,
    selectLoading,
    selectErrors,
    selectIsAnyLoading,
    selectFilters,
    selectSelectedCCCode,
    selectSelectedPONO
} from '../../slices/clientPOSlice/clientPOReportSlice';

// **FIX: Data normalization function to correct the backend field mapping**
const normalizePoData = (po) => {
    if (!po) return po;
    
    return {
        ...po,
        // Swap the incorrectly mapped fields
        ActualPOValue: po.Basicvalue,    // Backend's Basicvalue is actually PO Value
        ActualBasicValue: po.POValue,    // Backend's POValue is actually Basic Value
        // Keep original fields for compatibility but use normalized ones for display
        OriginalPOValue: po.POValue,
        OriginalBasicvalue: po.Basicvalue
    };
};

// **FIX: Normalize array of PO data**
const normalizePoDataArray = (dataArray) => {
    if (!Array.isArray(dataArray)) return dataArray;
    return dataArray.map(normalizePoData);
};

// Utility functions for formatting
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
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return dateString;
    }
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

// PO Detail Modal Component
const PODetailModal = ({ isOpen, onClose, poData }) => {
    if (!poData) return null;

    // **FIX: Normalize the PO data before displaying**
    const normalizedPO = normalizePoData(poData);

    const detailSections = [
        {
            title: 'Basic PO Information',
            icon: FileText,
            fields: [
                { label: 'PO Number', key: 'PONumber' },
                { label: 'Cost Center Code', key: 'CCCode' },
                { label: 'Cost Center Name', key: 'CCName' },
                { label: 'PO Date', key: 'PODate', format: 'date' },
                { label: 'PO Completion Date', key: 'POComdate', format: 'date' }
            ]
        },
        {
            title: 'Client Information',
            icon: Users,
            fields: [
                { label: 'Client Code', key: 'Clientcode' },
                { label: 'Client Name', key: 'ClientName' },
                { label: 'Sub Client Code', key: 'SubClientCode' },
                { label: 'Sub Client Name', key: 'SubClientName' }
            ]
        },
        {
            title: 'Financial Details',
            icon: IndianRupee,
            fields: [
                { label: 'PO Value', key: 'ActualPOValue', format: 'currency' }, // **FIX: Use corrected field**
                { label: 'PO GST Value', key: 'POGSTValue', format: 'currency' },
                { label: 'Basic Value', key: 'ActualBasicValue', format: 'currency' }, // **FIX: Use corrected field**
                { label: 'Total Basic', key: 'ActualBasicValue', format: 'currency' }, // **FIX: Use corrected field**
                { label: 'Total GST', key: 'POGSTValue', format: 'currency' },
                { label: 'Total PO', key: 'ActualPOValue', format: 'currency' } // **FIX: Use corrected field**
            ]
        },
        {
            title: 'Payment & Billing Terms',
            icon: CreditCard,
            fields: [
                { label: 'Mobilization Advance', key: 'MobilizationAdvance' },
                { label: 'RA Bill Type', key: 'RABill' },
                { label: 'Payment Due of RA Bill', key: 'PaydueofRABill' },
                { label: 'Advance Settlement', key: 'AdvanceSettlement' },
                { label: 'Qty Var Accept Initially', key: 'QtyVarAcceptInitially', format: 'currency' },
                { label: 'Minimum Basic Value', key: 'MinimumBasicValue', format: 'currency' }
            ]
        }
    ];

    const formatValue = (value, format) => {
        if (!value && value !== 0) return '-';
        
        switch (format) {
            case 'currency':
                return `₹${formatCurrency(value)}`;
            case 'date':
                return formatDate(value);
            default:
                return value;
        }
    };

    const getAdvanceColor = (advance) => {
        switch (advance?.toLowerCase()) {
            case 'yes':
                return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
            case 'no':
                return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
            default:
                return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`PO Details - ${normalizedPO.PONumber}`} size="full">
            <div className="space-y-6">
                {detailSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                            <section.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {section.title}
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {section.fields.map((field, fieldIndex) => (
                                <div key={fieldIndex}>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {field.label}
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {field.key === 'MobilizationAdvance' ? (
                                            <span className={clsx(
                                                'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                                                getAdvanceColor(normalizedPO[field.key])
                                            )}>
                                                {normalizedPO[field.key] || '-'}
                                            </span>
                                        ) : (
                                            formatValue(normalizedPO[field.key], field.format)
                                        )}
                                    </dd>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

// Summary Cards Component
const SummaryCards = ({ reportData }) => {
    if (!reportData || !Array.isArray(reportData.Data?.podetails1) || reportData.Data.podetails1.length === 0) {
        return null;
    }

    // **FIX: Normalize the data before processing**
    const data = normalizePoDataArray(reportData.Data.podetails1);
    
    const summary = data.reduce((acc, po) => {
        // **FIX: Use the corrected field mappings**
        const poValue = parseFloat(po.ActualPOValue || 0);
        const gstValue = parseFloat(po.POGSTValue || 0);
        const basicValue = parseFloat(po.ActualBasicValue || 0);
        
        acc.totalPOs += 1;
        acc.totalPOValue += poValue;
        acc.totalGSTValue += gstValue;
        acc.totalBasicValue += basicValue;
        
        if (po.MobilizationAdvance?.toLowerCase() === 'yes') acc.mobilizationPOs += 1;
        
        return acc;
    }, {
        totalPOs: 0,
        totalPOValue: 0,
        totalGSTValue: 0,
        totalBasicValue: 0,
        mobilizationPOs: 0
    });

    const cards = [
        {
            title: 'Total POs',
            value: summary.totalPOs,
            icon: FileText,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            isCount: true
        },
        {
            title: 'Total PO Value',
            value: summary.totalPOValue,
            icon: IndianRupee,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Total GST Value',
            value: summary.totalGSTValue,
            icon: Percent,
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'from-indigo-50 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-900/20'
        },
        {
            title: 'Total Basic Value',
            value: summary.totalBasicValue,
            icon: Wallet,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
        },
        {
            title: 'Mobilization Advance POs',
            value: summary.mobilizationPOs,
            icon: TrendingUp,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
            isCount: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {cards.map((card, index) => (
                <div key={index} className={`bg-gradient-to-r ${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                {card.title}
                            </p>
                            <p className=" font-bold text-gray-900 dark:text-white">
                                {card.isCount ? card.value : `₹${formatCurrency(card.value)}`}
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

// PO Report Table Component
const POReportTable = ({ reportData, onViewDetails, sortField, sortDirection, onSort }) => {
    if (!reportData || !Array.isArray(reportData.Data?.podetails1)) {
        return null;
    }

    // **FIX: Normalize the data before processing**
    const data = normalizePoDataArray(reportData.Data.podetails1);

    const handleSort = (field) => {
        if (sortField === field) {
            onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            onSort(field, 'asc');
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <SortAsc className="h-4 w-4 opacity-0 group-hover:opacity-50" />;
        return sortDirection === 'asc' ? 
            <SortAsc className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> : 
            <SortDesc className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                    <tr>
                        <th 
                            className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors group"
                            onClick={() => handleSort('PONumber')}
                        >
                            <div className="flex items-center gap-2">
                                PO Details
                                <SortIcon field="PONumber" />
                            </div>
                        </th>
                        <th 
                            className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors group"
                            onClick={() => handleSort('ClientName')}
                        >
                            <div className="flex items-center gap-2">
                                Client Info
                                <SortIcon field="ClientName" />
                            </div>
                        </th>
                        <th 
                            className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors group"
                            onClick={() => handleSort('PODate')}
                        >
                            <div className="flex items-center gap-2">
                                Dates
                                <SortIcon field="PODate" />
                            </div>
                        </th>
                        <th 
                            className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors group"
                            onClick={() => handleSort('ActualPOValue')}
                        >
                            <div className="flex items-center justify-end gap-2">
                                Financial Info
                                <SortIcon field="ActualPOValue" />
                            </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Terms</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((po, index) => (
                        <tr key={po.PONumber || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {po.PONumber || '-'}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {po.CCCode || '-'}
                                        </div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">
                                            {po.CCName || '-'}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm">
                                    <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                        {po.ClientName || '-'}
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                                        Code: {po.Clientcode || '-'}
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">
                                        {po.SubClientName || '-'}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                    <div className="flex items-center mb-1">
                                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                                        <span className="font-medium">Start:</span>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                        {formatDate(po.PODate)}
                                    </div>
                                    <div className="flex items-center mb-1">
                                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                                        <span className="font-medium">End:</span>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {formatDate(po.POComdate)}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="text-sm">
                                    {/* **FIX: Use corrected field mappings** */}
                                    <div className="font-medium text-green-600 dark:text-green-400 mb-1">
                                        ₹{formatCurrency(po.ActualPOValue || 0)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        GST: ₹{formatCurrency(po.POGSTValue || 0)}
                                    </div>
                                    <div className="text-xs text-purple-600 dark:text-purple-400">
                                        Basic: ₹{formatCurrency(po.ActualBasicValue || 0)}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm">
                                    <div className="mb-2">
                                        <span className={clsx(
                                            'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                                            po.MobilizationAdvance?.toLowerCase() === 'yes'
                                                ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                                                : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
                                        )}>
                                            {po.MobilizationAdvance === 'YES' ? 'Advance: Yes' : 'Advance: No'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Bill: {po.RABill || '-'}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                        Due: {po.PaydueofRABill || '-'}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button
                                    onClick={() => onViewDetails(po)}
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

const ClientPOReportPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const allCostCenters = useSelector(selectAllCostCentersClient);
    const clientPObyCC = useSelector(selectClientPObyCC);
    const clientPOForReport = useSelector(selectClientPOForReport);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const filters = useSelector(selectFilters);

    // Local state
    const [selectedCC, setSelectedCC] = useState('');
    const [selectedPO, setSelectedPO] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPOData, setSelectedPOData] = useState(null);

    // Load initial data
    useEffect(() => {
        dispatch(fetchAllCostCentersClient());
    }, [dispatch]);

    // Load PO numbers when cost center changes
    useEffect(() => {
        if (selectedCC) {
            dispatch(fetchClientPObyCC(selectedCC));
            // Clear selected PO when CC changes
            setSelectedPO('');
            dispatch(setFilters({ CCCode: selectedCC, PONO: '' }));
        }
    }, [selectedCC, dispatch]);

    // Show error messages via toast
    useEffect(() => {
        Object.entries(errors).forEach(([key, error]) => {
            if (error && error !== null) {
                toast.error(`Error with ${key}: ${error}`);
                dispatch(clearError({ errorType: key }));
            }
        });
    }, [errors, dispatch]);

    // Get cost center options (no "Select All" option needed here)
    const costCenterOptions = React.useMemo(() => {
        if (!allCostCenters?.Data) return [];
        return allCostCenters.Data.map(cc => ({
            value: cc.CC_Code,
            label: `${cc.CC_Code} - ${cc.CC_Name}`
        }));
    }, [allCostCenters]);

    // Get PO options with "Select All" option (value will be blank for API)
    const poOptions = React.useMemo(() => {
        const options = [{ value: '', label: 'Select All POs' }]; // Changed value from 'ALL' to '' (blank)
        if (clientPObyCC?.Data) {
            const poList = clientPObyCC.Data.map(po => ({
                value: po.PONumber,
                label: po.PONumber
            }));
            options.push(...poList);
        }
        return options;
    }, [clientPObyCC]);

    // Get filtered and sorted report data
    const getDisplayData = () => {
        if (!clientPOForReport?.Data?.podetails1) return [];
        
        // **FIX: Normalize data before filtering and sorting**
        let filtered = normalizePoDataArray(clientPOForReport.Data.podetails1).filter(po => {
            const matchesSearch = !searchTerm || 
                Object.values(po).some(value => 
                    value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
            return matchesSearch;
        });
        
        // Apply sorting
        if (sortField) {
            filtered.sort((a, b) => {
                let aVal = a[sortField] || '';
                let bVal = b[sortField] || '';
                
                // Handle numeric fields - **FIX: Updated to use corrected field names**
                if (['ActualPOValue', 'POGSTValue', 'ActualBasicValue'].includes(sortField)) {
                    aVal = parseFloat(aVal) || 0;
                    bVal = parseFloat(bVal) || 0;
                } else {
                    aVal = aVal.toString().toLowerCase();
                    bVal = bVal.toString().toLowerCase();
                }
                
                if (sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }
        
        return filtered;
    };

    const displayData = getDisplayData();

    // Handle generate report
    const handleGenerateReport = () => {
        if (!selectedCC) {
            toast.warning('Please select a Cost Center');
            return;
        }

        const params = {
            CCCode: selectedCC,
            PONO: selectedPO // Will be blank ('') for "Select All POs" or specific PO number
        };

        dispatch(fetchClientPOForReport(params));
        dispatch(setFilters(params));
    };

    // Handle view details
    const handleViewDetails = (poData) => {
        setSelectedPOData(poData);
        setIsDetailModalOpen(true);
    };

    // Handle refresh
    const handleRefresh = () => {
        dispatch(fetchAllCostCentersClient());
        if (selectedCC) {
            dispatch(fetchClientPObyCC(selectedCC));
        }
        toast.info('Refreshing data...');
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = displayData;
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            // **FIX: Use corrected field mappings for Excel export**
            const excelData = data.map(po => ({
                'PO Number': po.PONumber || '-',
                'Cost Center Code': po.CCCode || '-',
                'Cost Center Name': po.CCName || '-',
                'PO Date': po.PODate || '-',
                'PO Completion Date': po.POComdate || '-',
                'Client Code': po.Clientcode || '-',
                'Client Name': po.ClientName || '-',
                'Sub Client Code': po.SubClientCode || '-',
                'Sub Client Name': po.SubClientName || '-',
                'PO Value': po.ActualPOValue || 0,  // **FIX: Use corrected field**
                'PO GST Value': po.POGSTValue || 0,
                'Basic Value': po.ActualBasicValue || 0,  // **FIX: Use corrected field**
                'Mobilization Advance': po.MobilizationAdvance || '-',
                'RA Bill': po.RABill || '-',
                'Payment Due': po.PaydueofRABill || '-',
                'Advance Settlement': po.AdvanceSettlement || '-',
                'Total Basic': po.ActualBasicValue || 0,  // **FIX: Use corrected field**
                'Total GST': po.POGSTValue || 0,
                'Total PO': po.ActualPOValue || 0  // **FIX: Use corrected field**
            }));

            const filename = `Client_PO_Report_${selectedCC}${selectedPO ? `_${selectedPO}` : '_AllPOs'}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Reset filters
    const handleResetFilters = () => {
        setSelectedCC('');
        setSelectedPO('');
        setSearchTerm('');
        setSortField('');
        setSortDirection('asc');
        dispatch(clearFilters());
    };

    // Handle sorting
    const handleSort = (field, direction) => {
        setSortField(field);
        setSortDirection(direction);
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <FileBarChart className="h-8 w-8 text-indigo-600" />
                            Client PO Report Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Generate and manage detailed reports for client purchase orders by cost center
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            PO Report Management
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
                        <span className="text-gray-900 dark:text-white">Client PO Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center mb-6">
                    <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Filters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Cost Center Dropdown */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Cost Center *
                        </label>
                        <select
                            value={selectedCC}
                            onChange={(e) => setSelectedCC(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                            disabled={loading.allCostCentersClient}
                        >
                            <option value="">Select Cost Center</option>
                            {costCenterOptions.map((option, index) => (
                                <option key={index} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {loading.allCostCentersClient && (
                            <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                Loading cost centers...
                            </div>
                        )}
                    </div>

                    {/* PO Number Dropdown */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            PO Number
                        </label>
                        <select
                            value={selectedPO}
                            onChange={(e) => setSelectedPO(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                            disabled={!selectedCC || loading.clientPObyCC}
                        >
                            <option value="">Select PO Number</option>
                            {poOptions.map((option, index) => (
                                <option key={index} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {loading.clientPObyCC && (
                            <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                Loading PO numbers...
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Search Reports
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by PO, client, etc..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-end gap-3">
                        <button
                            onClick={handleGenerateReport}
                            disabled={!selectedCC || loading.clientPOForReport}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.clientPOForReport ? (
                                <RefreshCw className="h-5 w-5 animate-spin" />
                            ) : (
                                <FileBarChart className="h-5 w-5" />
                            )}
                            Generate Report
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isAnyLoading}
                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <RefreshCw className="h-5 w-5" />
                            Refresh
                        </button>
                        
                        <button
                            onClick={handleResetFilters}
                            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Reset All
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Export:</span>
                        
                        <Tooltip content="Download PO report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(displayData) || displayData.length === 0}
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
            {clientPOForReport && <SummaryCards reportData={clientPOForReport} />}

            {/* Report Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(displayData) && displayData.length > 0 ? (
                    <POReportTable 
                        reportData={clientPOForReport}
                        onViewDetails={handleViewDetails}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                ) : (
                    <>
                        {!loading.clientPOForReport && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <FileText className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        No PO Report Data Found
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        {selectedCC 
                                            ? 'No PO reports match your current filters. Try selecting a different cost center or PO number.'
                                            : 'Please select a cost center and click "Generate Report" to view PO details.'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}

                        {loading.clientPOForReport && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Generating Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching PO report data from the server...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* PO Detail Modal */}
            <PODetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                poData={selectedPOData}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Client PO Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Dynamic Filtering:</strong> Select cost center to load relevant PO numbers automatically<br/>
                            2. <strong>Select All Option:</strong> Choose "Select All POs" to generate reports for all POs in the cost center<br/>
                            3. <strong>Comprehensive Details:</strong> View complete PO information including financial details and payment terms<br/>
                            4. <strong>Smart Search:</strong> Search across all PO fields with real-time filtering<br/>
                            5. <strong>Advanced Sorting:</strong> Click column headers to sort by PO number, client, dates, or financial values<br/>
                            6. <strong>Export Capability:</strong> Download filtered data as Excel files for further analysis<br/>
                            7. <strong>🔄 Data Correction:</strong> Backend field mapping has been corrected - POValue now shows Basic Value, BasicValue now shows PO Value
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

export default ClientPOReportPage;