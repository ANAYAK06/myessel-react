import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { 
    Building2,
    CreditCard,
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
    Banknote,
    BanknoteArrowDown,
    BanknoteArrowUp,
    MapPin,
    User,
    CreditCard as CreditCardIcon,
    Shield,
    CheckCircle,
    XCircle,
    Clock,
    Building,
    Wallet,
    Tabs,
    Grid3X3,
    List,
    SortAsc,
    SortDesc
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchAllBankDetails,
    clearError,
    selectAllBankDetails,
    selectLoading,
    selectErrors,
    selectIsAnyLoading,
} from '../../slices/bankSlice/bankStatementSlice';

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

// Modal Component for Bank Details
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

// Bank Detail Modal Component
const BankDetailModal = ({ isOpen, onClose, bankData }) => {
    if (!bankData) return null;

    const detailSections = [
        {
            title: 'Basic Information',
            icon: Building,
            fields: [
                { label: 'Bank ID', key: 'Bankid' },
                { label: 'Bank Name', key: 'BankName' },
                { label: 'Account Number', key: 'Accountno' },
                { label: 'Account Type', key: 'BankType' },
                { label: 'Status', key: 'Status' }
            ]
        },
        {
            title: 'Account Holder Details',
            icon: User,
            fields: [
                { label: 'Account Holder Name', key: 'AccountHolderName' },
                { label: 'Opening Date', key: 'AccOpeningDate', format: 'date' }
            ]
        },
        {
            title: 'Financial Information',
            icon: Wallet,
            fields: [
                { label: 'Opening Balance', key: 'OpeningBalance', format: 'currency' },
                { label: 'Minimum Balance', key: 'MinimumBalance', format: 'currency' },
                { label: 'Return Balance As On', key: 'ReturnBalanceAsOn', format: 'date' }
            ]
        },
        {
            title: 'Location & Contact',
            icon: MapPin,
            fields: [
                { label: 'Bank Location', key: 'Banklocation' },
                { label: 'Group Name', key: 'GroupName' },
                { label: 'Sub Group Name', key: 'SubGroupName' },
                { label: 'Nature Group Name', key: 'NatureGroupName' }
            ]
        }
    ];

    const formatValue = (value, format) => {
        if (!value && value !== 0) return '-';
        
        switch (format) {
            case 'currency':
                return formatCurrency(value);
            case 'date':
                return formatDate(value);
            default:
                return value;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
            case 'rejected':
                return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
            default:
                return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Bank Details - ${bankData.BankName}`} size="lg">
            <div className="space-y-6">
                {detailSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                            <section.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {section.title}
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {section.fields.map((field, fieldIndex) => (
                                <div key={fieldIndex}>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {field.label}
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {field.key === 'Status' ? (
                                            <span className={clsx(
                                                'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                                                getStatusColor(bankData[field.key])
                                            )}>
                                                {bankData[field.key] || '-'}
                                            </span>
                                        ) : (
                                            formatValue(bankData[field.key], field.format)
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

// Enhanced Summary Cards Component
const SummaryCards = ({ bankDetails, activeTab }) => {
    if (!bankDetails || !Array.isArray(bankDetails.Data) || bankDetails.Data.length === 0) {
        return null;
    }

    const data = bankDetails.Data;
    
    // Helper function to check if bank is LC&BG
    const isLCBGBank = (bankType) => {
        if (!bankType) return false;
        const type = bankType.toLowerCase();
        return type.includes('lc and bg') || 
               type.includes('lc & bg') || 
               type.includes('lc&bg') || 
               type.includes('lcbg');
    };
    
    // Separate normal banks and LC&BG banks
    const normalBanks = data.filter(bank => !isLCBGBank(bank.BankType));
    const lcbgBanks = data.filter(bank => isLCBGBank(bank.BankType));
    
    // Calculate summary statistics based on active tab
    const currentData = activeTab === 'lcbg' ? lcbgBanks : activeTab === 'normal' ? normalBanks : data;
    
    const summary = currentData.reduce((acc, bank) => {
        const openingBalance = parseFloat(bank.OpeningBalance || 0);
        
        acc.totalBanks += 1;
        acc.totalBalance += openingBalance;
        
        if (bank.Status?.toLowerCase() === 'approved') acc.approvedBanks += 1;
        if (openingBalance > 0) acc.positiveBalance += 1;
        if (openingBalance < 0) acc.negativeBalance += 1;
        
        return acc;
    }, {
        totalBanks: 0,
        totalBalance: 0,
        approvedBanks: 0,
        positiveBalance: 0,
        negativeBalance: 0
    });

    // Calculate type-specific balances for overview
    const normalBankBalance = normalBanks.reduce((sum, bank) => sum + parseFloat(bank.OpeningBalance || 0), 0);
    const lcbgBankBalance = lcbgBanks.reduce((sum, bank) => sum + parseFloat(bank.OpeningBalance || 0), 0);

    const cards = activeTab === 'all' ? [
        {
            title: 'Total Banks',
            value: summary.totalBanks,
            icon: Building,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            isCount: true
        },
        {
            title: 'Normal Bank Balance',
            value: normalBankBalance,
            icon: Wallet,
            color: normalBankBalance >= 0 ? 'from-blue-500 to-indigo-600' : 'from-red-500 to-pink-600',
            bgColor: normalBankBalance >= 0 
                ? 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                : 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
        },
        {
            title: 'LC&BG Bank Balance',
            value: lcbgBankBalance,
            icon: Shield,
            color: lcbgBankBalance >= 0 ? 'from-emerald-500 to-green-600' : 'from-orange-500 to-red-600',
            bgColor: lcbgBankBalance >= 0 
                ? 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20'
                : 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        },
        {
            title: 'Approved Banks',
            value: summary.approvedBanks,
            icon: CheckCircle,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            isCount: true
        },
        {
            title: 'Total Balance',
            value: summary.totalBalance,
            icon: TrendingUp,
            color: summary.totalBalance >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-pink-600',
            bgColor: summary.totalBalance >= 0 
                ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                : 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
        }
    ] : [
        {
            title: `${activeTab === 'normal' ? 'Normal' : 'LC&BG'} Banks`,
            value: summary.totalBanks,
            icon: activeTab === 'normal' ? Building : Shield,
            color: 'from-indigo-500 to-cyan-600',
            bgColor: 'from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20',
            isCount: true
        },
        {
            title: 'Total Balance',
            value: summary.totalBalance,
            icon: Wallet,
            color: summary.totalBalance >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-pink-600',
            bgColor: summary.totalBalance >= 0 
                ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                : 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
        },
        {
            title: 'Approved Banks',
            value: summary.approvedBanks,
            icon: CheckCircle,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
            isCount: true
        },
        {
            title: 'Positive Balance',
            value: summary.positiveBalance,
            icon: TrendingUp,
            color: 'from-emerald-500 to-green-600',
            bgColor: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
            isCount: true
        },
        {
            title: 'Negative Balance',
            value: summary.negativeBalance,
            icon: TrendingDown,
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
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
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

// Tab Component
const TabButton = ({ active, onClick, children, icon: Icon, count }) => (
    <button
        onClick={onClick}
        className={clsx(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            active
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
    >
        <Icon className="h-4 w-4" />
        {children}
        {count !== undefined && (
            <span className={clsx(
                'ml-1 px-2 py-0.5 text-xs font-medium rounded-full',
                active
                    ? 'bg-white text-indigo-600'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            )}>
                {count}
            </span>
        )}
    </button>
);

// Bank Table Component
const BankTable = ({ banks, onViewDetails, sortField, sortDirection, onSort }) => {
    const handleSort = (field) => {
        if (sortField === field) {
            onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            onSort(field, 'asc');
        }
    };

    // Helper function to check if bank is LC&BG
    const isLCBGBank = (bankType) => {
        if (!bankType) return false;
        const type = bankType.toLowerCase();
        return type.includes('lc and bg') || 
               type.includes('lc & bg') || 
               type.includes('lc&bg') || 
               type.includes('lcbg');
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
                            onClick={() => handleSort('BankName')}
                        >
                            <div className="flex items-center gap-2">
                                Bank Details
                                <SortIcon field="BankName" />
                            </div>
                        </th>
                        <th 
                            className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors group"
                            onClick={() => handleSort('Accountno')}
                        >
                            <div className="flex items-center gap-2">
                                Account Info
                                <SortIcon field="Accountno" />
                            </div>
                        </th>
                        <th 
                            className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors group"
                            onClick={() => handleSort('BankType')}
                        >
                            <div className="flex items-center gap-2">
                                Type & Status
                                <SortIcon field="BankType" />
                            </div>
                        </th>
                        <th 
                            className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-700 transition-colors group"
                            onClick={() => handleSort('OpeningBalance')}
                        >
                            <div className="flex items-center justify-end gap-2">
                                Balance Info
                                <SortIcon field="OpeningBalance" />
                            </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Group Info</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {banks.map((bank, index) => (
                        <tr key={bank.Bankid || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <div className={clsx(
                                            "h-10 w-10 rounded-full flex items-center justify-center",
                                            isLCBGBank(bank.BankType) 
                                                ? "bg-gradient-to-r from-emerald-500 to-green-600"
                                                : "bg-gradient-to-r from-indigo-500 to-purple-600"
                                        )}>
                                            {isLCBGBank(bank.BankType) ? 
                                                <Shield className="h-5 w-5 text-white" /> :
                                                <Building className="h-5 w-5 text-white" />
                                            }
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {bank.BankName || '-'}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            ID: {bank.Bankid || '-'}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                    <div className="font-medium">{bank.Accountno || '-'}</div>
                                    <div className="text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                        {bank.AccountHolderName || '-'}
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                        Opened: {formatDate(bank.AccOpeningDate)}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                    <div className="mb-2">
                                        <span className={clsx(
                                            'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                                            isLCBGBank(bank.BankType)
                                                ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20'
                                                : 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
                                        )}>
                                            {bank.BankType || '-'}
                                        </span>
                                    </div>
                                    <span className={clsx(
                                        'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                                        bank.Status?.toLowerCase() === 'approved' 
                                            ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                                            : bank.Status?.toLowerCase() === 'pending'
                                            ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
                                            : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
                                    )}>
                                        {bank.Status || 'Unknown'}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="text-sm">
                                    <div className={clsx(
                                        "font-medium",
                                        parseFloat(bank.OpeningBalance || 0) >= 0 
                                            ? "text-green-600 dark:text-green-400" 
                                            : "text-red-600 dark:text-red-400"
                                    )}>
                                        ₹{formatCurrency(bank.OpeningBalance || 0)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Min: ₹{formatCurrency(bank.MinimumBalance || 0)}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                    <div className="font-medium truncate max-w-xs">
                                        {bank.GroupName || '-'}
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-xs">
                                        {bank.SubGroupName || '-'}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button
                                    onClick={() => onViewDetails(bank)}
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

const BankDetailsPage = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const allBankDetails = useSelector(selectAllBankDetails);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'normal', 'lcbg'
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedBankData, setSelectedBankData] = useState(null);

    // Load initial data
    useEffect(() => {
        dispatch(fetchAllBankDetails());
    }, [dispatch]);

    // Show error messages via toast
    useEffect(() => {
        Object.entries(errors).forEach(([key, error]) => {
            if (error && error !== null) {
                toast.error(`Error with ${key}: ${error}`);
                dispatch(clearError({ errorType: key }));
            }
        });
    }, [errors, dispatch]);

    // Separate banks by type
    const separateBanksByType = (banks) => {
        if (!banks || !Array.isArray(banks)) return { normalBanks: [], lcbgBanks: [] };
        
        const isLCBGBank = (bankType) => {
            if (!bankType) return false;
            const type = bankType.toLowerCase();
            return type.includes('lc and bg') || 
                   type.includes('lc & bg') || 
                   type.includes('lc&bg') || 
                   type.includes('lcbg');
        };
        
        const normalBanks = banks.filter(bank => !isLCBGBank(bank.BankType));
        const lcbgBanks = banks.filter(bank => isLCBGBank(bank.BankType));
        
        return { normalBanks, lcbgBanks };
    };

    // Get filtered and sorted banks based on active tab
    const getDisplayBanks = () => {
        if (!allBankDetails?.Data) return [];
        
        const { normalBanks, lcbgBanks } = separateBanksByType(allBankDetails.Data);
        
        let banksToFilter = [];
        switch (activeTab) {
            case 'normal':
                banksToFilter = normalBanks;
                break;
            case 'lcbg':
                banksToFilter = lcbgBanks;
                break;
            default:
                banksToFilter = allBankDetails.Data;
        }
        
        // Apply filters
        let filtered = banksToFilter.filter(bank => {
            const matchesSearch = !searchTerm || 
                Object.values(bank).some(value => 
                    value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
            
            const matchesStatus = !statusFilter || bank.Status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
        
        // Apply sorting
        if (sortField) {
            filtered.sort((a, b) => {
                let aVal = a[sortField] || '';
                let bVal = b[sortField] || '';
                
                // Handle numeric fields
                if (sortField === 'OpeningBalance' || sortField === 'MinimumBalance') {
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

    const displayBanks = getDisplayBanks();
    const { normalBanks, lcbgBanks } = separateBanksByType(allBankDetails?.Data || []);

    // Get unique status options
    const statusOptions = React.useMemo(() => {
        if (!allBankDetails?.Data) return [];
        return [...new Set(allBankDetails.Data.map(bank => bank.Status).filter(Boolean))];
    }, [allBankDetails]);

    // Handle view details
    const handleViewDetails = (bankData) => {
        setSelectedBankData(bankData);
        setIsDetailModalOpen(true);
    };

    // Handle refresh
    const handleRefresh = () => {
        dispatch(fetchAllBankDetails());
        toast.info('Refreshing bank details...');
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            const data = displayBanks;
            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(bank => ({
                'Bank ID': bank.Bankid || '-',
                'Bank Name': bank.BankName || '-',
                'Account Number': bank.Accountno || '-',
                'Account Holder': bank.AccountHolderName || '-',
                'Bank Type': bank.BankType || '-',
                'Opening Balance': bank.OpeningBalance || 0,
                'Minimum Balance': bank.MinimumBalance || 0,
                'Opening Date': bank.AccOpeningDate || '-',
                'Status': bank.Status || '-',
                'Location': bank.Banklocation || '-',
                'Group Name': bank.GroupName || '-',
                'Sub Group': bank.SubGroupName || '-'
            }));

            const tabSuffix = activeTab === 'all' ? 'All_Banks' : activeTab === 'normal' ? 'Normal_Banks' : 'LCBG_Banks';
            const filename = `Bank_Details_${tabSuffix}_${new Date().toISOString().split('T')[0]}`;
            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');
            
        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Reset filters
    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setSortField('');
        setSortDirection('asc');
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
                            <Building2 className="h-8 w-8 text-indigo-600" />
                            Bank Details Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View and manage all bank account details with separate LC&BG tracking
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Bank Management
                        </div>
                        {loading.allBankDetails && (
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
                        <span>Bank and Cash</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Bank Details</span>
                    </div>
                </nav>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex flex-wrap gap-2 mb-6">
                    <TabButton
                        active={activeTab === 'all'}
                        onClick={() => setActiveTab('all')}
                        icon={Grid3X3}
                        count={allBankDetails?.Data?.length || 0}
                    >
                        All Banks
                    </TabButton>
                    <TabButton
                        active={activeTab === 'normal'}
                        onClick={() => setActiveTab('normal')}
                        icon={Building}
                        count={normalBanks.length}
                    >
                        Normal Banks
                    </TabButton>
                    <TabButton
                        active={activeTab === 'lcbg'}
                        onClick={() => setActiveTab('lcbg')}
                        icon={Shield}
                        count={lcbgBanks.length}
                    >
                        LC&BG Banks
                    </TabButton>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Search Banks
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, account, etc..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                        >
                            <option value="">All Status</option>
                            {statusOptions.map((status, index) => (
                                <option key={index} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Current Filters Display */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Current View
                        </label>
                        <div className="text-sm text-gray-600 dark:text-gray-400 py-3">
                            <div className="font-medium">{activeTab === 'all' ? 'All Banks' : activeTab === 'normal' ? 'Normal Banks' : 'LC&BG Banks'}</div>
                            <div className="text-xs">Showing {displayBanks.length} results</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-end gap-3">
                        <button
                            onClick={handleResetFilters}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <RotateCcw className="h-5 w-5" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isAnyLoading}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {loading.allBankDetails ? (
                                <RotateCcw className="h-5 w-5 animate-spin" />
                            ) : (
                                <RefreshCw className="h-5 w-5" />
                            )}
                            Refresh
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Export:</span>
                        
                        <Tooltip content={`Download ${activeTab} bank details as Excel file`}>
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(displayBanks) || displayBanks.length === 0}
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
            <SummaryCards bankDetails={allBankDetails} activeTab={activeTab} />

            {/* Bank Details Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(displayBanks) && displayBanks.length > 0 ? (
                    <BankTable 
                        banks={displayBanks}
                        onViewDetails={handleViewDetails}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />
                ) : (
                    <>
                        {!loading.allBankDetails && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        {activeTab === 'lcbg' ? <Shield className="h-12 w-12 text-indigo-600 dark:text-indigo-400" /> : <Building2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        No {activeTab === 'all' ? 'Bank' : activeTab === 'normal' ? 'Normal Bank' : 'LC&BG Bank'} Details Found
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        {searchTerm || statusFilter 
                                            ? 'No banks match your current filters. Try adjusting your search criteria.'
                                            : `No ${activeTab === 'all' ? '' : activeTab === 'normal' ? 'normal ' : 'LC&BG '}bank details are available. Click refresh to load bank information.`
                                        }
                                    </p>
                                </div>
                            </div>
                        )}

                        {loading.allBankDetails && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Bank Details</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching bank information from the server...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bank Detail Modal */}
            <BankDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                bankData={selectedBankData}
            />

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Enhanced Bank Details Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Separate Bank Types:</strong> View Normal Banks and LC&BG Banks separately with dedicated tabs<br/>
                            2. <strong>Smart Summary Cards:</strong> Type-specific balance tracking for Normal and LC&BG accounts<br/>
                            3. <strong>Advanced Sorting:</strong> Click column headers to sort by Bank Name, Account Number, Type, or Balance<br/>
                            4. <strong>Visual Indicators:</strong> Different icons and colors for Normal (Building) vs LC&BG (Shield) accounts<br/>
                            5. <strong>Targeted Export:</strong> Download data for specific bank types or all banks combined<br/>
                            6. <strong>Enhanced Search:</strong> Search across all fields with real-time filtering and status-based filtering
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

export default BankDetailsPage;