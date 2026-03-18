import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import {
    Users,
    Calendar,
    Download,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    RefreshCw,
    ChevronRight,
    CalendarDays,
    TrendingUp,
    Printer,
    FileDown,
    Clock,
    Building2,
    DollarSign,
    Wallet,
    CreditCard,
    IndianRupee,
    UserSquare2,
    BriefcaseBusiness,
    CircleDollarSign,
    TrendingDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import PaySlipModal from './PaySlipModal';

// Import slice actions and selectors
import {
    fetchAllEmpCategories,
    fetchPayRollCCbyCategory,
    fetchPayRollGroups,
    fetchPayRollEmployees,
    fetchEmployeeSalaryMonths,
    fetchEmpSalaryYearsByMonth,
    fetchMonthsSalaryForReport,
    fetchSingleEmpSalaryDataForReport,
    fetchEmpPaySlipData,
    fetchEmployeeSalaryYears,
    selectStaffPaySlipData,
    selectStaffPaySlipDataLoading,
    setFilters,
    clearFilters,
    setEmployeeType,
    clearGroupsData,
    clearEmployeesData,
    clearCostCentresData,
    clearMonthsData,
    clearYearsData,
    resetSalaryReportData,
    clearError,
    selectEmpCategories,
    selectCostCentres,
    selectPayrollGroups,
    selectPayrollEmployees,
    selectSalaryMonths,
    selectSalaryYears,
    selectStaffMonthsSalaryReport,
    selectStaffSingleEmpSalaryData,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading
} from '../../slices/HrReportSlice/salaryReportSlice';

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

// Summary Cards Component for Cost Center View - FIXED
const CostCenterSummaryCards = ({ reportData }) => {
    if (!reportData || !reportData.Data) {
        return null;
    }

    const data = reportData.Data;
    const salaryData = data.lstSalData || [];

    // Calculate totals from actual data
    const summary = {
        totalEmployees: salaryData.length,
        totalGross: salaryData.reduce((sum, record) => sum + (parseFloat(record.GrossValue) || 0), 0),
        totalDeductions: salaryData.reduce((sum, record) => sum + (parseFloat(record.Deductions) || 0), 0),
        totalNet: salaryData.reduce((sum, record) => sum + (parseFloat(record.NetValue) || 0), 0),
    };

    const cards = [
        {
            title: 'Total Employees',
            value: summary.totalEmployees,
            icon: Users,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        },
        {
            title: 'Total Gross Amount',
            value: `₹${summary.totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: CircleDollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Total Deductions',
            value: `₹${summary.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: TrendingDown,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        },
        {
            title: 'Total Net Amount',
            value: `₹${summary.totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: Wallet,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
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
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {card.value}
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


// Summary Cards Component for Employee View - FIXED
const EmployeeSummaryCards = ({ reportData }) => {
    if (!reportData || !reportData.Data) {
        return null;
    }

    const data = reportData.Data;
    // ✅ Use EmpSalaryData for employee view
    const salaryRecords = data.EmpSalaryData || data.lstSalData || [];

    const summary = {
        totalRecords: salaryRecords.length,
        totalGross: salaryRecords.reduce((sum, record) => sum + (parseFloat(record.GrossValue) || 0), 0),
        totalDeductions: salaryRecords.reduce((sum, record) => sum + (parseFloat(record.Deductions) || 0), 0),
        totalNet: salaryRecords.reduce((sum, record) => sum + (parseFloat(record.NetValue) || 0), 0),
    };

    const cards = [
        {
            title: 'Total Salary Records',
            value: summary.totalRecords,
            icon: FileSpreadsheet,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        },
        {
            title: 'Total Gross Amount',
            value: `₹${summary.totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: CircleDollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Total Deductions',
            value: `₹${summary.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: TrendingDown,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        },
        {
            title: 'Total Net Amount',
            value: `₹${summary.totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: Wallet,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
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
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {card.value}
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

// Print function
const handlePrint = () => {
    window.print();
};

// Get month name from month number
const getMonthName = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(monthNum) - 1] || monthNum;
};

const StaffSalaryReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const empCategories = useSelector(selectEmpCategories);
    const costCentres = useSelector(selectCostCentres);
    const payrollGroups = useSelector(selectPayrollGroups);
    const payrollEmployees = useSelector(selectPayrollEmployees);
    const salaryMonths = useSelector(selectSalaryMonths);
    const salaryYears = useSelector(selectSalaryYears);
    const staffMonthsSalaryReport = useSelector(selectStaffMonthsSalaryReport);
    const staffSingleEmpSalaryData = useSelector(selectStaffSingleEmpSalaryData);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // View mode state
    const [viewMode, setViewMode] = useState('costcenter'); // 'costcenter' or 'employee'

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        empCategory: '',
        empCategoryName: '', // Store the category name
        ccCode: '',
        groupId: '',
        empRefNo: '',
        year: '',
        fromMonth: '',
        toMonth: ''
    });

    const [showPaySlipModal, setShowPaySlipModal] = useState(false);
    const [selectedEmployeeForPaySlip, setSelectedEmployeeForPaySlip] = useState(null);
    const paySlipLoading = useSelector(selectStaffPaySlipDataLoading);
    const staffPaySlipData = useSelector(selectStaffPaySlipData);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await dispatch(fetchAllEmpCategories()).unwrap();
            } catch (error) {
                console.error('❌ Error fetching categories:', error);
            }
        };

        fetchInitialData();
    }, [dispatch]);


    // Handle view payslip - SIMPLIFIED VERSION
    // Handle view payslip - FIXED for both view modes
    const handleViewPaySlip = async (record) => {
        try {
            setSelectedEmployeeForPaySlip(record);

            // ✅ Prepare payload with correct field names from the record
            const payload = {
                TransactionRefno: record.TransactionRefNo || record.TransactionRefno, // Handle both capitalizations
                EmpRefno: record.EmpRefno,
                CurrentCC: record.JoiningCostCenter || record.CurrentCC, // Use JoiningCostCenter for employee view
                CategoryId: localFilters.empCategory === '0'
                    ? '' // If "Select All" was chosen, send empty string
                    : localFilters.empCategory, // Otherwise use selected category
                ConslidateTransNo: record.ConslidateTransNo
            };

            console.log('📄 Fetching Pay Slip Data with params:', payload);
            console.log('📄 Record data:', record);

            await dispatch(fetchEmpPaySlipData(payload)).unwrap();
            setShowPaySlipModal(true);

        } catch (error) {
            console.error('❌ Error fetching pay slip:', error);
            toast.error('Failed to fetch pay slip. Please try again.');
        }
    };
    // Show error messages via toast
    useEffect(() => {
        Object.entries(errors).forEach(([key, error]) => {
            if (error && error !== null) {
                toast.error(`Error with ${key}: ${error}`);
                dispatch(clearError({ errorType: key }));
            }
        });
    }, [errors, dispatch]);

    // Handle view mode change
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        handleReset();
    };

    // Handle category change
    const handleCategoryChange = async (e) => {
        const categoryId = e.target.value;
        const selectedOption = e.target.options[e.target.selectedIndex];
        const categoryName = selectedOption.getAttribute('data-name') || '';
        console.log('Selected Category:', categoryId, 'Name:', categoryName);

        setLocalFilters(prev => ({
            ...prev,
            empCategory: categoryId,
            empCategoryName: categoryName,
            ccCode: '',
            groupId: '',
            empRefNo: '',
            year: '',
            fromMonth: '',
            toMonth: ''
        }));

        dispatch(clearCostCentresData());
        dispatch(clearGroupsData());
        dispatch(clearEmployeesData());
        dispatch(clearYearsData());
        dispatch(clearMonthsData());

        if (categoryId) {
            try {
                await dispatch(fetchPayRollCCbyCategory(categoryId)).unwrap();
            } catch (error) {
                console.error('❌ Error fetching cost centres:', error);
            }
        }
    };

    // Handle cost centre change
    const handleCCCodeChange = async (e) => {
        const ccCode = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            ccCode: ccCode,
            groupId: '',
            empRefNo: '',
            year: '',
            fromMonth: '',
            toMonth: ''
        }));

        dispatch(clearGroupsData());
        dispatch(clearEmployeesData());
        dispatch(clearYearsData());
        dispatch(clearMonthsData());

        if (ccCode && localFilters.empCategoryName) {
            try {
                await dispatch(fetchPayRollGroups({
                    category: localFilters.empCategoryName,
                    ccCode: ccCode,
                    labourType: 'NA',
                    contractor: 'NA',
                    empType: 'Staff'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching groups:', error);
            }
        }
    };

    // Handle group change
    const handleGroupChange = async (e) => {
        const groupId = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            groupId: groupId,
            empRefNo: '',
            year: '',
            fromMonth: '',
            toMonth: ''
        }));

        dispatch(clearEmployeesData());
        dispatch(clearYearsData());
        dispatch(clearMonthsData());

        if (groupId && localFilters.empCategoryName && localFilters.ccCode) {
            try {
                await dispatch(fetchPayRollEmployees({
                    category: localFilters.empCategoryName,
                    ccCode: localFilters.ccCode,
                    groupId: groupId,
                    labourType: 'NA',
                    contractor: 'NA',
                    empType: 'Staff'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching employees:', error);
            }
        }
    };

    // Handle employee change
    const handleEmployeeChange = async (e) => {
        const empRefNo = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            empRefNo: empRefNo,
            year: '',
            fromMonth: '',
            toMonth: ''

        }));

        dispatch(clearYearsData());
        dispatch(clearMonthsData());

        // If in employee view mode and employee is selected (not SelectAll), fetch years
        if (viewMode === 'employee' && empRefNo && empRefNo !== 'SelectAll') {
            try {
                // Fetch available years for this employee
                await dispatch(fetchEmployeeSalaryYears({
                    empCategory: localFilters.empCategoryName,
                    ccCode: localFilters.ccCode,
                    groupId: localFilters.groupId === 'SelectAll' ? '' : localFilters.groupId,
                    empRefNo: empRefNo,
                    month: '',
                    employeeType: 'Staff',
                    labourType: 'NA',
                    contractor: 'NA'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching years:', error);
            }
        }
    };

    // Handle year change (for employee view)
    const handleYearChange = async (e) => {
        const year = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            year: year,
            fromMonth: '',
            toMonth: ''
        }));

        dispatch(clearMonthsData());

        // If specific year selected (not "SelectAll"), fetch months
        if (year && year !== 'SelectAll' && localFilters.empRefNo && viewMode === 'employee') {
            try {
                await dispatch(fetchEmployeeSalaryMonths({
                    empCategory: localFilters.empCategoryName,
                    ccCode: localFilters.ccCode,
                    groupId: localFilters.groupId === 'SelectAll' ? '' : localFilters.groupId,
                    empRefNo: localFilters.empRefNo,
                    year: year,
                    fromMonth: '',
                    employeeType: 'Staff',
                    labourType: 'NA',
                    contractorCode: 'NA'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching months:', error);
            }
        }
    };

    // Handle from month change
    const handleFromMonthChange = (e) => {
        const fromMonth = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            fromMonth: fromMonth
        }));
    };

    // Handle to month change
    const handleToMonthChange = (e) => {
        const toMonth = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            toMonth: toMonth
        }));
    };

    // Handle month/year change for cost center view
    const handleMonthChangeCC = (e) => {
        const month = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            fromMonth: month
        }));
    };

    const handleYearChangeCC = (e) => {
        const year = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            year: year
        }));
    };

    // Handle view button click - FIXED with SelectAll handling
    const handleView = async () => {
        // Common validations
        if (!localFilters.empCategory) {
            toast.warning('Please select Employee Category');
            return;
        }

        if (!localFilters.ccCode) {
            toast.warning('Please select Cost Centre');
            return;
        }

        if (!localFilters.groupId) {
            toast.warning('Please select Group');
            return;
        }

        if (!localFilters.empRefNo) {
            toast.warning('Please select Employee');
            return;
        }

        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));

            if (viewMode === 'costcenter') {
                // Cost Center View - Validate month and year
                if (!localFilters.fromMonth) {
                    toast.warning('Please select Month');
                    return;
                }

                if (!localFilters.year) {
                    toast.warning('Please select Year');
                    return;
                }

                const params = {
                    empCategory: localFilters.empCategoryName,
                    ccCode: localFilters.ccCode,
                    empRefNo: localFilters.empRefNo,
                    groupId: localFilters.groupId,
                    year: localFilters.year,
                    fromMonth: localFilters.fromMonth,
                    toMonth: localFilters.fromMonth // Same month for cost center view
                };

                console.log('📊 Fetching Staff Salary Report (Cost Center View) with params:', params);

                await dispatch(fetchMonthsSalaryForReport(params)).unwrap();
                toast.success('Staff salary report loaded successfully');

            } else {
                // Employee View - Validate year and months
                if (!localFilters.year) {
                    toast.warning('Please select Year');
                    return;
                }

                // If specific year selected (not "SelectAll"), validate months
                if (localFilters.year !== 'SelectAll') {
                    if (!localFilters.fromMonth) {
                        toast.warning('Please select From Month');
                        return;
                    }

                    if (!localFilters.toMonth) {
                        toast.warning('Please select To Month');
                        return;
                    }
                }


                // Convert "SelectAll" to empty string for API
                const params = {
                    empCategory: localFilters.empCategoryName,
                    ccCode: localFilters.ccCode,
                    groupId: localFilters.groupId === 'SelectAll' ? '' : localFilters.groupId,
                    empRefNo: localFilters.empRefNo, // No SelectAll for employee in employee view
                    year: localFilters.year === 'SelectAll' ? '' : localFilters.year,
                    fromMonth: localFilters.year === 'SelectAll' ? '' : localFilters.fromMonth,
                    toMonth: localFilters.year === 'SelectAll' ? '' : localFilters.toMonth
                };

                console.log('📊 Fetching Single Employee Salary Report with params:', params);

                await dispatch(fetchSingleEmpSalaryDataForReport(params)).unwrap();
                toast.success('Employee salary report loaded successfully');
            }

        } catch (error) {
            console.error('❌ Error fetching report:', error);
            toast.error('Failed to fetch report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            empCategory: '',
            empCategoryName: '',
            ccCode: '',
            groupId: '',
            empRefNo: '',
            year: '',
            fromMonth: '',
            toMonth: ''
        });

        dispatch(clearFilters());
        dispatch(resetSalaryReportData());
        dispatch(clearCostCentresData());
        dispatch(clearGroupsData());
        dispatch(clearEmployeesData());
        dispatch(clearMonthsData());
        dispatch(clearYearsData());
    };

    // Handle Excel download
    // Handle Excel download - FIXED
    const handleExcelDownload = () => {
        try {
            let data, filename;

            if (viewMode === 'costcenter') {
                if (!staffMonthsSalaryReport?.Data) {
                    toast.warning('No data available to download');
                    return;
                }
                data = staffMonthsSalaryReport.Data.lstSalData;
                filename = `Staff_Salary_Report_CC_${localFilters.ccCode}_${getMonthName(localFilters.fromMonth)}_${localFilters.year}`;
            } else {
                if (!staffSingleEmpSalaryData?.Data) {
                    toast.warning('No data available to download');
                    return;
                }
                // ✅ Use EmpSalaryData for employee view
                data = staffSingleEmpSalaryData.Data.EmpSalaryData || staffSingleEmpSalaryData.Data.lstSalData;
                const empName = data && data.length > 0 ? data[0].Name : localFilters.empRefNo;
                filename = `Staff_Salary_Report_${empName}_${localFilters.year}`;
            }

            if (!data || data.length === 0) {
                toast.warning('No records available to download');
                return;
            }

            downloadAsExcel(data, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get current report data based on view mode
    const currentReportData = viewMode === 'costcenter' ? staffMonthsSalaryReport : staffSingleEmpSalaryData;

    return (
        <div className="space-y-6 p-6">
            {/* Page Header - Same as before */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <BriefcaseBusiness className="h-8 w-8 text-indigo-600" />
                            Staff Salary & Wages Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View and manage staff salary reports by cost center or individual employee
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Staff Payroll
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
                        <span>Salary Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Staff Salary Report</span>
                    </div>
                </nav>
            </div>

            {/* View Mode Selection - Same as before */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Select View Mode <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleViewModeChange('costcenter')}
                        className={clsx(
                            'flex-1 px-6 py-4 rounded-lg border-2 transition-all duration-300',
                            viewMode === 'costcenter'
                                ? 'border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40'
                                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                        )}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Building2 className={clsx(
                                'h-6 w-6',
                                viewMode === 'costcenter' ? 'text-indigo-600' : 'text-gray-500'
                            )} />
                            <div className="text-left">
                                <div className={clsx(
                                    'font-semibold',
                                    viewMode === 'costcenter' ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'
                                )}>
                                    View by Cost Center
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    View all employees in a cost center
                                </div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleViewModeChange('employee')}
                        className={clsx(
                            'flex-1 px-6 py-4 rounded-lg border-2 transition-all duration-300',
                            viewMode === 'employee'
                                ? 'border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40'
                                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                        )}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <UserSquare2 className={clsx(
                                'h-6 w-6',
                                viewMode === 'employee' ? 'text-indigo-600' : 'text-gray-500'
                            )} />
                            <div className="text-left">
                                <div className={clsx(
                                    'font-semibold',
                                    viewMode === 'employee' ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'
                                )}>
                                    View by Employee
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    View specific employee salary history
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Filters Section - Cost Center View - FIXED with SelectAll */}
            {viewMode === 'costcenter' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Employee Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.empCategory}
                                onChange={handleCategoryChange}
                                disabled={isAnyLoading}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Category</option>
                                <option value="0" data-name='SelectAll'>Select All</option>
                                {empCategories && empCategories.map((category) => (
                                    <option key={category.CategoryId} value={category.CategoryId} data-name={category.CategoryName}>
                                        {category.CategoryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Cost Centre */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Cost Centre <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.ccCode}
                                onChange={handleCCCodeChange}
                                disabled={isAnyLoading || !localFilters.empCategory}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Cost Centre</option>
                                <option value="SelectAll">Select All</option>
                                {costCentres && costCentres.map((cc, index) => (
                                    <option key={index} value={cc.CC_Code}>
                                        {cc.CC_Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Group */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Group Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.groupId}
                                onChange={handleGroupChange}
                                disabled={isAnyLoading || !localFilters.ccCode}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Group</option>
                                <option value="0">Select All</option>
                                {payrollGroups && payrollGroups.map((group) => (
                                    <option key={group.GroupId} value={group.GroupId}>
                                        {group.GroupName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Employee Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Employee Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.empRefNo}
                                onChange={handleEmployeeChange}
                                disabled={isAnyLoading || !localFilters.groupId}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Employee</option>
                                <option value="SelectAll">Select All</option>
                                {payrollEmployees && payrollEmployees.map((emp, index) => (
                                    <option key={index} value={emp.EmpRefno}>
                                        {emp.Name} ({emp.EmpRefno})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Month - NO SELECT ALL */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Payment Month <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.fromMonth}
                                onChange={handleMonthChangeCC}
                                disabled={isAnyLoading || !localFilters.empRefNo}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Month</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <option key={month} value={month}>
                                        {getMonthName(month)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Year - NO SELECT ALL */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Payment Year <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.year}
                                onChange={handleYearChangeCC}
                                disabled={isAnyLoading || !localFilters.empRefNo}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Year</option>
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons - Same as before */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex gap-3">
                            <button
                                onClick={handleView}
                                disabled={isAnyLoading || !localFilters.empCategory || !localFilters.ccCode || !localFilters.groupId || !localFilters.empRefNo || !localFilters.fromMonth || !localFilters.year}
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

                            {/* Print Button */}
                            <Tooltip content="Print report">
                                <button
                                    onClick={handlePrint}
                                    disabled={!currentReportData?.Data}
                                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <Printer className="h-5 w-5" />
                                    Print
                                </button>
                            </Tooltip>

                            {/* Excel Download Button */}
                            <Tooltip content="Download report as Excel file">
                                <button
                                    onClick={handleExcelDownload}
                                    disabled={!currentReportData?.Data}
                                    className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <FileDown className="h-5 w-5" />
                                    Export Excel
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Section - Employee View - FIXED with SelectAll logic */}
            {/* Filters Section - Employee View - UPDATED */}
            {viewMode === 'employee' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Employee Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.empCategory}
                                onChange={handleCategoryChange}
                                disabled={isAnyLoading}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Category</option>
                                <option value="0" data-name="SelectAll">Select All</option>
                                {empCategories && empCategories.map((category) => (
                                    <option key={category.CategoryId} value={category.CategoryId} data-name={category.CategoryName}>
                                        {category.CategoryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Cost Centre */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Cost Centre <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.ccCode}
                                onChange={handleCCCodeChange}
                                disabled={isAnyLoading || !localFilters.empCategory}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Cost Centre</option>
                                <option value="SelectAll">Select All</option>
                                {costCentres && costCentres.map((cc, index) => (
                                    <option key={index} value={cc.CC_Code}>
                                        {cc.CC_Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Group */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Group Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.groupId}
                                onChange={handleGroupChange}
                                disabled={isAnyLoading || !localFilters.ccCode}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Group</option>
                                <option value="0">Select All</option>
                                {payrollGroups && payrollGroups.map((group) => (
                                    <option key={group.GroupId} value={group.GroupId}>
                                        {group.GroupName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Employee Name - NO SELECT ALL in employee view */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Employee Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.empRefNo}
                                onChange={handleEmployeeChange}
                                disabled={isAnyLoading || !localFilters.groupId}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Employee</option>
                                {/* NO "Select All" option in employee view */}
                                {payrollEmployees && payrollEmployees.map((emp, index) => (
                                    <option key={index} value={emp.EmpRefno}>
                                        {emp.Name} ({emp.EmpRefno})
                                    </option>
                                ))}
                            </select>
                            {loading.salaryYears && localFilters.empRefNo && (
                                <div className="mt-2 flex items-center text-xs text-indigo-600 dark:text-indigo-400">
                                    <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                    Loading available years...
                                </div>
                            )}
                        </div>

                        {/* ✅ Year - ALWAYS show after employee is selected */}
                        {localFilters.empRefNo && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Year <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={localFilters.year}
                                    onChange={handleYearChange}
                                    disabled={isAnyLoading || loading.salaryYears || !localFilters.empRefNo}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <option value="">Select Year</option>
                                    <option value="SelectAll">Select All</option>
                                    {salaryYears && salaryYears.map((yearObj, index) => {
                                        const yearValue = yearObj?.Year || yearObj?.YearValue || yearObj;
                                        return (
                                            <option key={index} value={yearValue}>
                                                {yearValue}
                                            </option>
                                        );
                                    })}
                                </select>
                                {loading.salaryMonths && localFilters.year && localFilters.year !== 'SelectAll' && (
                                    <div className="mt-2 flex items-center text-xs text-indigo-600 dark:text-indigo-400">
                                        <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                        Loading available months...
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ✅ From Month - ONLY show if specific year selected (not "Select All") */}
                        {localFilters.year && localFilters.year !== 'SelectAll' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    From Month <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={localFilters.fromMonth}
                                    onChange={handleFromMonthChange}
                                    disabled={isAnyLoading || loading.salaryMonths || !salaryMonths || salaryMonths.length === 0}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <option value="">Select From Month</option>
                                    {salaryMonths && salaryMonths.map((monthObj, index) => {
                                        const monthValue = monthObj?.MonthNo || monthObj?.Month || monthObj;
                                        const monthName = monthObj?.MonthName || getMonthName(monthValue);
                                        return (
                                            <option key={index} value={monthValue}>
                                                {monthName}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        )}

                        {/* ✅ To Month - ONLY show if specific year selected and from month is selected */}
                        {localFilters.year && localFilters.year !== 'SelectAll' && localFilters.fromMonth && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    To Month <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={localFilters.toMonth}
                                    onChange={handleToMonthChange}
                                    disabled={isAnyLoading || !localFilters.fromMonth}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <option value="">Select To Month</option>
                                    {salaryMonths && salaryMonths
                                        .filter((monthObj) => {
                                            // Only show months >= fromMonth
                                            const monthValue = monthObj?.MonthNo || monthObj?.Month || monthObj;
                                            return parseInt(monthValue) >= parseInt(localFilters.fromMonth);
                                        })
                                        .map((monthObj, index) => {
                                            const monthValue = monthObj?.MonthNo || monthObj?.Month || monthObj;
                                            const monthName = monthObj?.MonthName || getMonthName(monthValue);
                                            return (
                                                <option key={index} value={monthValue}>
                                                    {monthName}
                                                </option>
                                            );
                                        })}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons - SAME AS BEFORE */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex gap-3">
                            <button
                                onClick={handleView}
                                disabled={
                                    isAnyLoading ||
                                    !localFilters.empCategory ||
                                    !localFilters.ccCode ||
                                    !localFilters.groupId ||
                                    !localFilters.empRefNo ||
                                    !localFilters.year ||
                                    (localFilters.year !== 'SelectAll' && (!localFilters.fromMonth || !localFilters.toMonth))
                                }
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

                            {/* Print Button */}
                            <Tooltip content="Print report">
                                <button
                                    onClick={handlePrint}
                                    disabled={!currentReportData?.Data}
                                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <Printer className="h-5 w-5" />
                                    Print
                                </button>
                            </Tooltip>

                            {/* Excel Download Button */}
                            <Tooltip content="Download report as Excel file">
                                <button
                                    onClick={handleExcelDownload}
                                    disabled={!currentReportData?.Data}
                                    className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <FileDown className="h-5 w-5" />
                                    Export Excel
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            {currentReportData?.Data && (
                viewMode === 'costcenter' ? (
                    <CostCenterSummaryCards reportData={currentReportData} />
                ) : (
                    <EmployeeSummaryCards reportData={currentReportData} />
                )
            )}

            {/* Report Table */}
            {/* Report Table - FIXED to handle both lstSalData and EmpSalaryData */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {currentReportData?.Data ? (
                    <div className="overflow-x-auto">
                        {(() => {
                            // ✅ Get the correct data array based on view mode
                            const salaryData = viewMode === 'costcenter'
                                ? currentReportData.Data.lstSalData
                                : currentReportData.Data.EmpSalaryData;

                            console.log('📊 Salary Data to display:', salaryData);
                            console.log('📊 View Mode:', viewMode);
                            console.log('📊 Full Data:', currentReportData.Data);

                            return salaryData && salaryData.length > 0 ? (
                                <>
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                    #
                                                </th>
                                                {viewMode === 'employee' && (
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                        Payment Date
                                                    </th>
                                                )}
                                                {viewMode === 'costcenter' && (
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                        Employee Details
                                                    </th>
                                                )}
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                    Cost Centre
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                    Group
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Salary Days
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Gross Amount
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Deductions
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Net Amount
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Transaction Ref
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {salaryData.map((record, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    {viewMode === 'employee' && (
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                {record.PayRollFortheDate}
                                                            </div>
                                                        </td>
                                                    )}
                                                    {viewMode === 'costcenter' && (
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                                    {record.Name || 'N/A'}
                                                                </div>
                                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                    ID: {record.EmpRefno}
                                                                </div>
                                                                <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                                                    {record.DesignationName}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                            {record.JoiningCostCenter || record.CurrentCC || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                                            {record.GroupName}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {record.TotalSalaryDays ? parseFloat(record.TotalSalaryDays).toFixed(2) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                            ₹{record.GrossValue ? parseFloat(record.GrossValue).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                            ₹{record.Deductions ? parseFloat(record.Deductions).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                            ₹{record.NetValue ? parseFloat(record.NetValue).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                                            {record.TransactionRefno || record.TransactionRefNo || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={() => handleViewPaySlip(record)}
                                                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center gap-2 mx-auto transition-all duration-300"
                                                            disabled={paySlipLoading}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Footer with totals */}
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                Total Records: {salaryData.length}
                                            </span>
                                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                                {viewMode === 'costcenter'
                                                    ? `${getMonthName(localFilters.fromMonth)} ${localFilters.year} - Staff Salary Report`
                                                    : `${salaryData[0]?.Name || 'Employee'} - Salary Report`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                            <Search className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Salary Data Found</h3>
                                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                            No salary records available for the selected filters.
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}
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
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Report Data Found</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                        Select filters and click "View Report" to load salary data.
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
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Report</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Fetching salary data for the selected filters...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Staff Salary Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            <strong>View by Cost Center:</strong> Select category, cost center, group, employee (with "Select All" option), payment month and year to view salary report for all employees in that cost center.<br />
                            <strong>View by Employee:</strong> Select category, cost center, group, specific employee (no "Select All" option), year (with "Select All" option for complete history), and month range to view detailed salary history for that employee.<br />
                            <strong>Summary Statistics:</strong> View totals for gross amounts, deductions, and net payments.<br />
                            <strong>Export Options:</strong> Download the report as Excel or print for records.
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

            {/* PaySlip Modal */}
            {showPaySlipModal && (
                <PaySlipModal
                    isOpen={showPaySlipModal}
                    onClose={() => {
                        setShowPaySlipModal(false);
                        setSelectedEmployeeForPaySlip(null);
                    }}
                    paySlipData={staffPaySlipData}
                    loading={paySlipLoading}
                    employeeData={selectedEmployeeForPaySlip}
                />
            )}
        </div>
    );
};

export default StaffSalaryReportPage;