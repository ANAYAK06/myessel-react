import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import {
    Users,
    Building2,
    Calendar,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    ArrowRightLeft,
    TrendingUp,
    DollarSign,
    X,
    Filter,
    RefreshCw,
    ChevronRight,
    Activity,
    Banknote,
    CreditCard,
    UserCheck,
    Building,
    CalendarDays,
    Receipt
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchCMSYears,
    fetchCMSMonthsByYear,
    fetchCMSPaidEmployee,
    fetchCMSPayReportEmployeeData,
    fetchEmpPaySlipData,
    fetchCMSPaidCCbyMonth,
    setFilters,
    clearFilters,
    setReportType,
    setPaySlipParams,
    clearPaySlipParams,
    resetCMSPaymentData,
    clearError,
    resetSelectedData,
    clearMonthsData,
    selectCMSYears,
    selectCMSMonths,
    selectCMSPaidEmployees,
    selectCMSPayReportEmployeeData,
    selectEmpPaySlipData,
    selectCMSPaidCostCentres,
    selectLoading,
    selectErrors,
    selectFilters,
    selectPaySlipParams,
    selectReportType,
    selectIsAnyLoading,
    selectHasAnyError
} from '../../slices/HrReportSlice/cmsPaymentReportSlice';

import PaySlipModal from './PaySlipModal';

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

// Modal Component for Pay Slip Details
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

// Pay Slip Details Modal Component
// Pay Slip Details Modal Component - FIXED
const PaySlipDetailsModal = ({ isOpen, onClose, paySlipData, loading }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // 🔧 FIX: The API response structure is different than expected
    // Based on the error, the response contains: EmpRefno, SalaryHead, HeadType, HeadAmount, PerDayAmount, PayDays

    console.log('💳 Pay Slip Data received:', paySlipData);

    // Extract the actual data - it might be nested
    const actualData = paySlipData?.Data || paySlipData;

    // Check if it's an array or object
    let earnings = [];
    let deductions = [];
    let employeeInfo = {};

    if (Array.isArray(actualData)) {
        // If it's an array, separate earnings and deductions
        earnings = actualData.filter(item => item.HeadType === 'Earning' || item.HeadType === 'E');
        deductions = actualData.filter(item => item.HeadType === 'Deduction' || item.HeadType === 'D');

        // Get employee info from first item
        if (actualData.length > 0) {
            employeeInfo = {
                empRefno: actualData[0].EmpRefno,
                // Add other fields if available
            };
        }
    } else if (typeof actualData === 'object' && actualData !== null) {
        // If it's an object, it might have lstEarnings and lstDeductions
        earnings = actualData.lstEarnings || actualData.Earnings || [];
        deductions = actualData.lstDeductions || actualData.Deductions || [];
        employeeInfo = {
            empRefno: actualData.EmpRefno || actualData.empRefno,
            ccCode: actualData.CurrentCC || actualData.CCCode,
            transactionRefno: actualData.TransactionRefno
        };
    }

    console.log('👤 Employee Info:', employeeInfo);
    console.log('💰 Earnings:', earnings);
    console.log('💸 Deductions:', deductions);

    // Calculate totals
    const totalEarnings = earnings.reduce((sum, item) => sum + (parseFloat(item.HeadAmount || item.Amount || 0)), 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + (parseFloat(item.HeadAmount || item.Amount || 0)), 0);
    const netPay = totalEarnings - totalDeductions;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Employee Pay Slip Details" size="full">
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <RotateCcw className="h-6 w-6 text-indigo-500 animate-spin mr-3" />
                    <p className="text-indigo-700 dark:text-indigo-300">Loading pay slip details...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Employee Information */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Employee Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Employee Code:</span>
                                <p className="text-gray-900 dark:text-white">{employeeInfo.empRefno || '-'}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Cost Centre:</span>
                                <p className="text-gray-900 dark:text-white">{employeeInfo.ccCode || '-'}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600 dark:text-gray-400">Transaction Reference:</span>
                                <p className="text-gray-900 dark:text-white">{employeeInfo.transactionRefno || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Earnings and Deductions in Two Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Earnings */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
                                <h5 className="text-lg font-bold text-white">Earnings</h5>
                            </div>
                            <div className="p-4">
                                {earnings.length > 0 ? (
                                    <div className="space-y-2">
                                        {earnings.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {item.SalaryHead || item.Description || 'Earning'}
                                                    </p>
                                                    {item.PayDays && (
                                                        <p className="text-xs text-gray-500">
                                                            {item.PayDays} days @ ₹{formatCurrency(item.PerDayAmount || 0)}/day
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="font-bold text-green-600 dark:text-green-400">
                                                    ₹{formatCurrency(item.HeadAmount || item.Amount || 0)}
                                                </p>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-3 border-t-2 border-green-600">
                                            <p className="font-bold text-gray-900 dark:text-white">Total Earnings:</p>
                                            <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                                                ₹{formatCurrency(totalEarnings)}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                        No earnings data available
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3">
                                <h5 className="text-lg font-bold text-white">Deductions</h5>
                            </div>
                            <div className="p-4">
                                {deductions.length > 0 ? (
                                    <div className="space-y-2">
                                        {deductions.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {item.SalaryHead || item.Description || 'Deduction'}
                                                    </p>
                                                    {item.PayDays && (
                                                        <p className="text-xs text-gray-500">
                                                            {item.PayDays} days @ ₹{formatCurrency(item.PerDayAmount || 0)}/day
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="font-bold text-red-600 dark:text-red-400">
                                                    ₹{formatCurrency(item.HeadAmount || item.Amount || 0)}
                                                </p>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-3 border-t-2 border-red-600">
                                            <p className="font-bold text-gray-900 dark:text-white">Total Deductions:</p>
                                            <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                                                ₹{formatCurrency(totalDeductions)}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                        No deductions data available
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Net Pay Summary */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm opacity-90">Net Salary</p>
                                <p className="text-3xl font-bold">₹{formatCurrency(netPay)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-90">Earnings - Deductions</p>
                                <p className="text-lg">₹{formatCurrency(totalEarnings)} - ₹{formatCurrency(totalDeductions)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
// Summary Cards Component
const SummaryCards = ({ reportData, reportType }) => {
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    if (!reportData || !Array.isArray(reportData.Data) || reportData.Data.length === 0) {
        return null;
    }

    // Calculate summary from report data
    const summary = reportData.Data.reduce((acc, item) => {
        acc.totalAmount += parseFloat(item.Amount || 0);
        acc.employeeCount += 1;
        acc.costCentres.add(item.CCCode);
        acc.banks.add(item.Bank);
        return acc;
    }, {
        totalAmount: 0,
        employeeCount: 0,
        costCentres: new Set(),
        banks: new Set()
    });

    const avgSalary = summary.employeeCount > 0 ? summary.totalAmount / summary.employeeCount : 0;

    const cards = [
        {
            title: 'Total Amount Paid',
            value: summary.totalAmount,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Total Employees',
            value: summary.employeeCount,
            icon: Users,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
            isCount: true
        },
        {
            title: 'Average Salary',
            value: avgSalary,
            icon: TrendingUp,
            color: 'from-purple-500 to-indigo-600',
            bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
        },
        {
            title: 'Cost Centres',
            value: summary.costCentres.size,
            icon: Building2,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
            isCount: true
        },
        {
            title: 'Banks Involved',
            value: summary.banks.size,
            icon: Banknote,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
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
                                {card.isCount ? card.value : formatCurrency(card.value)}
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

const CMSPaymentReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const cmsYears = useSelector(selectCMSYears);
    const cmsMonths = useSelector(selectCMSMonths);
    const cmsPaidEmployees = useSelector(selectCMSPaidEmployees);
    const cmsPayReportEmployeeData = useSelector(selectCMSPayReportEmployeeData);
    const empPaySlipData = useSelector(selectEmpPaySlipData);
    const cmsPaidCostCentres = useSelector(selectCMSPaidCostCentres);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const reportType = useSelector(selectReportType);
    const paySlipParams = useSelector(selectPaySlipParams);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        selectedYear: '',
        selectedMonth: '',
        emprefNo: '',
        ccCode: ''
    });

    // Modal state
    const [isPaySlipModalOpen, setIsPaySlipModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);

    // Report type options
    const reportTypeOptions = [
        { value: 'employee', label: 'Employee Wise', icon: Users },
        { value: 'costcentre', label: 'Cost Centre Wise', icon: Building2 },
        { value: 'month', label: 'Month Wise', icon: Calendar }
    ];

    // Load initial data
    useEffect(() => {
        dispatch(fetchCMSYears());
    }, [dispatch]);

    // Fetch months when year changes
    useEffect(() => {
        if (localFilters.selectedYear && localFilters.selectedYear !== '0') {
            dispatch(fetchCMSMonthsByYear(localFilters.selectedYear));
        } else {
            dispatch(clearMonthsData());
        }
    }, [localFilters.selectedYear, dispatch]);

    // 🔧 FIX: Automatically fetch employee list when year AND month are selected
    useEffect(() => {
        const shouldFetchEmployees =
            localFilters.selectedYear &&
            localFilters.selectedYear !== '0' &&
            localFilters.selectedYear !== '' &&
            localFilters.selectedMonth &&
            localFilters.selectedMonth !== '0' &&
            localFilters.selectedMonth !== '';

        console.log('🔍 Employee Fetch Check:', {
            year: localFilters.selectedYear,
            month: localFilters.selectedMonth,
            shouldFetch: shouldFetchEmployees,
            reportType
        });

        if (shouldFetchEmployees) {
            const params = {
                year: localFilters.selectedYear,
                month: localFilters.selectedMonth
            };

            console.log('🚀 Fetching employees with params:', params);
            dispatch(fetchCMSPaidEmployee(params));
        }
    }, [localFilters.selectedYear, localFilters.selectedMonth, dispatch, reportType]);

    // 🔧 FIX: Fetch cost centres when year and month are selected for costcentre report
    useEffect(() => {
        const shouldFetchCostCentres =
            reportType === 'costcentre' &&
            localFilters.selectedYear &&
            localFilters.selectedYear !== '0' &&
            localFilters.selectedYear !== '' &&
            localFilters.selectedMonth &&
            localFilters.selectedMonth !== '0' &&
            localFilters.selectedMonth !== '';

        console.log('🔍 Cost Centre Fetch Check:', {
            year: localFilters.selectedYear,
            month: localFilters.selectedMonth,
            shouldFetch: shouldFetchCostCentres,
            reportType
        });

        if (shouldFetchCostCentres) {
            const params = {
                month: localFilters.selectedMonth,
                year: localFilters.selectedYear
            };

            console.log('🚀 Fetching cost centres with params:', params);
            dispatch(fetchCMSPaidCCbyMonth(params));
        }
    }, [localFilters.selectedYear, localFilters.selectedMonth, reportType, dispatch]);

    // Sync local filters with Redux filters
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

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

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        console.log('🔄 Filter Change:', { filterName, value });

        setLocalFilters(prev => ({
            ...prev,
            [filterName]: value
        }));

        // Reset dependent data when key filters change
        if (filterName === 'selectedYear') {
            setLocalFilters(prev => ({
                ...prev,
                selectedMonth: '',
                emprefNo: '',
                ccCode: ''
            }));
            dispatch(resetSelectedData());
        }

        if (filterName === 'selectedMonth') {
            setLocalFilters(prev => ({
                ...prev,
                emprefNo: '',
                ccCode: ''
            }));
            // Don't reset employee data here, it will be fetched automatically by useEffect
        }
    };

    // Handle report type change
    const handleReportTypeChange = (newReportType) => {
        dispatch(setReportType(newReportType));
        setLocalFilters({
            selectedYear: '',
            selectedMonth: '',
            emprefNo: '',
            ccCode: ''
        });
        dispatch(resetCMSPaymentData());
    };

    // Handle view button click
    const handleView = async () => {
        // Validation based on report type
        if (!localFilters.selectedYear) {
            toast.warning('Please select a year');
            return;
        }

        if (!localFilters.selectedMonth) {
            toast.warning('Please select a month');
            return;
        }

        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));

            // Prepare parameters for API calls
            const baseParams = {
                year: localFilters.selectedYear === '0' ? '' : localFilters.selectedYear,
                month: localFilters.selectedMonth === '0' ? '' : localFilters.selectedMonth
            };

            console.log('📊 Viewing report with params:', { reportType, ...baseParams });

            // Call appropriate APIs based on report type and filters
            if (reportType === 'employee') {
                // Employee list already fetched by useEffect

                // Get detailed data if specific employee selected
                if (localFilters.emprefNo && localFilters.emprefNo !== '0' && localFilters.emprefNo !== '') {
                    const detailParams = {
                        ...baseParams,
                        emprefNo: localFilters.emprefNo,
                        ccCode: localFilters.ccCode === '0' ? '' : localFilters.ccCode
                    };
                    console.log('📊 Fetching detailed employee data:', detailParams);
                    await dispatch(fetchCMSPayReportEmployeeData(detailParams)).unwrap();
                }
            } else if (reportType === 'costcentre') {
                // Cost centres already fetched by useEffect

                // Get detailed employee data for the cost centre
                if (localFilters.ccCode && localFilters.ccCode !== '0' && localFilters.ccCode !== '') {
                    const detailParams = {
                        ...baseParams,
                        emprefNo: localFilters.emprefNo === '0' ? '' : localFilters.emprefNo,
                        ccCode: localFilters.ccCode
                    };
                    console.log('📊 Fetching cost centre employee data:', detailParams);
                    await dispatch(fetchCMSPayReportEmployeeData(detailParams)).unwrap();
                }
            } else if (reportType === 'month') {
                // Employee list already fetched by useEffect
            }

            toast.success('CMS Payment Report loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching CMS Payment Report:', error);
            toast.error('Failed to fetch CMS Payment Report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            selectedYear: '',
            selectedMonth: '',
            emprefNo: '',
            ccCode: ''
        });
        dispatch(clearFilters());
        dispatch(resetCMSPaymentData());
    };

    // Handle row click to view pay slip details
    const handleRowClick = async (rowData) => {
        try {
            setSelectedRowData(rowData);
            setIsPaySlipModalOpen(true);

            // Prepare pay slip parameters
            const paySlipData = {
                CCCode: rowData.CCCode || '',
                CategoryId: 0,
                ConslidateTransNo: rowData.ConslidateTransNo || rowData.CMSConsolidateNo || '',
                EmployeeName: rowData.EmpRefNo || '',
                PayRollDate: rowData.PayRollFortheDate || rowData.PayRollDate || '',
                TransactionRefno: rowData.PayrollRefno || ''
            };

            console.log('💰 Fetching pay slip with params:', paySlipData);
            dispatch(setPaySlipParams(paySlipData));
            await dispatch(fetchEmpPaySlipData(paySlipData)).unwrap();

        } catch (error) {
            console.error('❌ Error fetching pay slip details:', error);
            toast.error('Failed to load pay slip details');
            setIsPaySlipModalOpen(false);
        }
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            let data = [];
            let filename = '';

            // Determine which data to export based on report type
            if (reportType === 'employee' && cmsPayReportEmployeeData?.Data) {
                data = cmsPayReportEmployeeData.Data;
                filename = `CMS_Payment_Report_Employee_${localFilters.selectedYear}_${localFilters.selectedMonth}`;
            } else if (reportType === 'costcentre' && cmsPaidCostCentres?.Data) {
                data = cmsPaidCostCentres.Data;
                filename = `CMS_Payment_Report_CostCentre_${localFilters.selectedYear}_${localFilters.selectedMonth}`;
            } else if (reportType === 'month' && cmsPaidEmployees?.Data) {
                data = cmsPaidEmployees.Data;
                filename = `CMS_Payment_Report_Month_${localFilters.selectedYear}_${localFilters.selectedMonth}`;
            }

            if (!Array.isArray(data) || data.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const excelData = data.map(item => ({
                'Employee Ref No': item.EmpRefNo || '-',
                'Employee Name': item.EmpName || '-',
                'Bank Account No': item.BankAccountNo || '-',
                'Amount': item.Amount || 0,
                'CMS Transaction No': item.CMSTransactionNo || '-',
                'Cost Centre Code': item.CCCode || '-',
                'Cost Centre Name': item.CCName || '-',
                'Bank': item.Bank || '-',
                'IFSC Code': item.IFSCCode || '-',
                'Pay Roll Date': item.PayRollDate || '-',
                'Payment Date': item.PaymentDate || '-'
            }));

            downloadAsExcel(excelData, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get current report data for display
    const getCurrentReportData = () => {
        switch (reportType) {
            case 'employee':
                return cmsPayReportEmployeeData?.Data || cmsPaidEmployees?.Data || [];
            case 'costcentre':
                return cmsPayReportEmployeeData?.Data || cmsPaidCostCentres?.Data || [];
            case 'month':
                return cmsPaidEmployees?.Data || [];
            default:
                return [];
        }
    };

    const currentReportData = getCurrentReportData();

    // 🔧 DEBUG: Log employee data
    useEffect(() => {
        console.log('👥 Employee Data Updated:', {
            hasData: !!cmsPaidEmployees,
            dataArray: cmsPaidEmployees?.Data,
            count: cmsPaidEmployees?.Data?.length || 0,
            loading: loading.cmsPaidEmployees
        });
    }, [cmsPaidEmployees, loading.cmsPaidEmployees]);

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Receipt className="h-8 w-8 text-indigo-600" />
                            CMS Payment Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Employee salary payment reports through bank CMS system
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            HR Reports
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
                        <span>HR Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">CMS Payment Report</span>
                    </div>
                </nav>
            </div>

            {/* Report Type Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Report Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reportTypeOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleReportTypeChange(option.value)}
                            className={clsx(
                                "p-4 rounded-lg border-2 transition-all duration-300 flex items-center gap-3",
                                reportType === option.value
                                    ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-700 dark:text-indigo-300"
                                    : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-300"
                            )}
                        >
                            <option.icon className="h-6 w-6" />
                            <span className="font-medium">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className={clsx(
                    "grid gap-6 mb-6",
                    reportType === 'employee' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" :
                        reportType === 'costcentre' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" :
                            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                    {/* Year Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.selectedYear}
                            onChange={(e) => handleFilterChange('selectedYear', e.target.value)}
                            disabled={loading.cmsYears}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Year</option>
                            {Array.isArray(cmsYears?.Data) && cmsYears.Data.map((year, index) => (
                                <option key={year.Year || index} value={year.Year}>
                                    {year.Year}
                                </option>
                            ))}
                        </select>

                        {loading.cmsYears && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading years...
                            </p>
                        )}
                    </div>

                    {/* Month Selection - Now required for all report types */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Month <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.selectedMonth}
                            onChange={(e) => handleFilterChange('selectedMonth', e.target.value)}
                            disabled={loading.cmsMonths || !localFilters.selectedYear}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Month</option>
                            {Array.isArray(cmsMonths?.Data) && cmsMonths.Data.map((month, index) => (
                                <option key={month.MonthNo || index} value={month.MonthNo}>
                                    {month.MonthName || `Month ${month.MonthNo}`}
                                </option>
                            ))}
                        </select>

                        {loading.cmsMonths && (
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Loading months...
                            </p>
                        )}
                    </div>

                    {/* Employee Selection - For all report types */}
                    {(reportType === 'employee' || reportType === 'costcentre' || reportType === 'month') && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Employee {reportType === 'employee' && <span className="text-gray-400">(Optional)</span>}
                            </label>
                            <select
                                value={localFilters.emprefNo}
                                onChange={(e) => handleFilterChange('emprefNo', e.target.value)}
                                disabled={loading.cmsPaidEmployees || !localFilters.selectedMonth}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">All Employees</option>
                                {Array.isArray(cmsPaidEmployees?.Data) && cmsPaidEmployees.Data.length > 0 ? (
                                    cmsPaidEmployees.Data.map((emp, index) => (
                                        <option key={emp.EmpRefNo || index} value={emp.EmpRefNo}>
                                            {emp.EmpName || emp.EmpRefNo}
                                        </option>
                                    ))
                                ) : (
                                    !loading.cmsPaidEmployees && localFilters.selectedMonth && (
                                        <option value="" disabled>No employees found</option>
                                    )
                                )}
                            </select>

                            {loading.cmsPaidEmployees && (
                                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                    Loading employees...
                                </p>
                            )}

                            {!loading.cmsPaidEmployees && localFilters.selectedMonth && cmsPaidEmployees?.Data && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {cmsPaidEmployees.Data.length} employee(s) available
                                </p>
                            )}
                        </div>
                    )}

                    {/* Cost Centre Selection - For Cost Centre wise */}
                    {reportType === 'costcentre' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Cost Centre <span className="text-gray-400">(Optional)</span>
                            </label>
                            <select
                                value={localFilters.ccCode}
                                onChange={(e) => handleFilterChange('ccCode', e.target.value)}
                                disabled={loading.cmsPaidCostCentres || !localFilters.selectedMonth}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">All Cost Centres</option>
                                {Array.isArray(cmsPaidCostCentres?.Data) && cmsPaidCostCentres.Data.map((cc, index) => (
                                    <option key={cc.CC_Code || index} value={cc.CC_Code}>
                                        {cc.CC_Name || cc.CC_Code}
                                    </option>
                                ))}
                            </select>

                            {loading.cmsPaidCostCentres && (
                                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                    Loading cost centres...
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isAnyLoading || !localFilters.selectedYear || !localFilters.selectedMonth}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {isAnyLoading ? (
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
                        <Tooltip content="Download CMS payment report as Excel file">
                            <button
                                onClick={handleExcelDownload}
                                disabled={!Array.isArray(currentReportData) || currentReportData.length === 0}
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
            <SummaryCards reportData={{ Data: currentReportData }} reportType={reportType} />

            {/* CMS Payment Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {Array.isArray(currentReportData) && currentReportData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Employee Ref No</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Employee Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Bank Account</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Cost Centre</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Bank</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Pay Roll Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Date</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {currentReportData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                            {item.EmpRefNo || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.EmpName}>
                                                {item.EmpName || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.BankAccountNo || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-bold">
                                            <span className="text-green-600 dark:text-green-400">
                                                ₹{formatCurrency(item.Amount || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.CCName}>
                                                {item.CCCode || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            <div className="max-w-xs truncate" title={item.Bank}>
                                                {item.Bank || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.PayRollDate || item.PayRollFortheDate || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {item.PaymentDate || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Tooltip content="View pay slip details">
                                                <button
                                                    onClick={() => handleRowClick(item)}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                            </Tooltip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        {/* Empty State */}
                        {!isAnyLoading && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No CMS Payment Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select your report type, year, month, and other filters, then click "View Report" to load your CMS payment data.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {isAnyLoading && (
                            <div className="p-12 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-indigo-500 animate-spin" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading CMS Payment Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching payment data for the selected criteria...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Pay Slip Details Modal */}
          
            <PaySlipModal
                isOpen={isPaySlipModalOpen}
                onClose={() => setIsPaySlipModalOpen(false)}
                paySlipData={empPaySlipData}
                loading={loading.empPaySlipData}
                employeeData={selectedRowData}
            />


            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">CMS Payment Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Year & Month Selection:</strong> Required for all report types - employees will load automatically<br />
                            2. <strong>Employee Selection:</strong> Optional filter to view specific employee data<br />
                            3. <strong>Cost Centre Wise:</strong> Analyze payments by cost centres with employee breakdown<br />
                            4. <strong>Month Wise:</strong> Get monthly payment summaries across all employees<br />
                            5. <strong>Pay Slip Details:</strong> Click the eye icon to view detailed pay slip information<br />
                            6. <strong>Summary Analytics:</strong> View total amounts, employee counts, and cost centre distribution<br />
                            7. <strong>Export Functionality:</strong> Download detailed reports as Excel files<br />
                            8. <strong>Real-time Data:</strong> All data is fetched automatically when you select year and month
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

export default CMSPaymentReportPage;