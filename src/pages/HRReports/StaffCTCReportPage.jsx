import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import {
    Building2,
    UserSquare2,
    Search,
    Eye,
    RotateCcw,
    Download,
    Printer,
    ChevronRight,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    CircleDollarSign,
    Wallet,
    AlertTriangle,
    Info,
    FileSpreadsheet,
    BriefcaseBusiness,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchCTCEmpCostCenter,
    fetchEmployeeCTCbyCC,
    fetchEmployeeCTCbyEmp,
    fetchEmpCTCforReport,
    fetchAutoCompleteCTCEmp,
    setFilters,
    clearFilters,
    setReportType,
    setSelectedCostCenter,
    setSelectedEmployee,
    setSearchPrefix,
    resetCTCReportData,
    clearError,
    resetSelectedData,
    clearAutoCompleteData,
    selectCTCCostCenters,
    selectEmployeeCTCbyCC,
    selectEmployeeCTCbyEmp,
    selectEmpCTCReport,
    selectAutoCompleteEmployees,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading
} from '../../slices/HrReportSlice/staffCTCReportSlice';

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

// Summary Cards Component for Cost Center View
const CostCenterSummaryCards = ({ employeesList }) => {
    if (!employeesList || employeesList.length === 0) {
        return null;
    }

    const summary = {
        totalEmployees: employeesList.length,
        totalRevisions: employeesList.reduce((sum, emp) => sum + (emp.NoofRevision || 0), 0),
        avgRevisions: (employeesList.reduce((sum, emp) => sum + (emp.NoofRevision || 0), 0) / employeesList.length).toFixed(1)
    };

    const cards = [
        {
            title: 'Total Employees',
            value: summary.totalEmployees,
            icon: UserSquare2,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        },
        {
            title: 'Total Revisions',
            value: summary.totalRevisions,
            icon: FileSpreadsheet,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
        },
        {
            title: 'Avg Revisions/Employee',
            value: summary.avgRevisions,
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {cards.map((card, index) => (
                <div key={index} className={`bg-gradient-to-r ${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                {card.title}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
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

// Summary Cards Component for Employee CTC View
const EmployeeCTCSummaryCards = ({ ctcData }) => {
    if (!ctcData || !ctcData.Data || !ctcData.Data.HeadsList) {
        return null;
    }

    const headsList = ctcData.Data.HeadsList;

    // Extract key values
    const grossSalary = headsList.find(h => h.HeadType === 'GROSSSALARY');
    const deductionTotal = headsList.find(h => h.HeadType === 'DEDUCTIONTOTAL');
    const netSalary = headsList.find(h => h.HeadType === 'NETSALARY');
    const ctcTotal = headsList.find(h => h.HeadType === 'CTCTOTAL');

    const cards = [
        {
            title: 'Gross Salary (Yearly)',
            value: `₹${(grossSalary?.YearlyAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            monthlyValue: `₹${(grossSalary?.MonthlyAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/month`,
            icon: CircleDollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Total Deductions (Yearly)',
            value: `₹${(deductionTotal?.YearlyAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            monthlyValue: `₹${(deductionTotal?.MonthlyAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/month`,
            icon: TrendingDown,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        },
        {
            title: 'Net Salary (Yearly)',
            value: `₹${(netSalary?.YearlyAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            monthlyValue: `₹${(netSalary?.MonthlyAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/month`,
            icon: Wallet,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
        },
        {
            title: 'Cost to Company (CTC)',
            value: `₹${(ctcTotal?.YearlyAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            monthlyValue: `₹${(ctcTotal?.MonthlyAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/month`,
            icon: BriefcaseBusiness,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {cards.map((card, index) => (
                <div key={index} className={`bg-gradient-to-r ${card.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className={`bg-gradient-to-r ${card.color} p-3 rounded-lg`}>
                            <card.icon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        {card.title}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {card.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {card.monthlyValue}
                    </p>
                </div>
            ))}
        </div>
    );
};

// Helper function to get change indicator
// Helper function to get change indicator - FIXED TO CALCULATE DIRECTION
const getChangeIndicator = (currentAmount, existingAmount) => {
    const current = parseFloat(currentAmount) || 0;
    const existing = parseFloat(existingAmount) || 0;

    // Calculate the actual difference
    const actualDiff = current - existing;

    if (actualDiff === 0) {
        return <Minus className="h-4 w-4 text-gray-400" />;
    }

    if (actualDiff > 0) {
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    }

    return <ArrowDownRight className="h-4 w-4 text-red-600" />;
};

// Helper function to format change value - FIXED TO CALCULATE DIRECTION
const formatChange = (currentAmount, existingAmount, storedDiff) => {
    const current = parseFloat(currentAmount) || 0;
    const existing = parseFloat(existingAmount) || 0;

    // Calculate the actual difference to determine direction
    const actualDiff = current - existing;

    if (actualDiff === 0) {
        return '-';
    }

    // Use the stored diff value (which is absolute) but with correct sign
    const diffValue = Math.abs(parseFloat(storedDiff)) || Math.abs(actualDiff);
    const prefix = actualDiff > 0 ? '+' : '-';

    return `${prefix}₹${diffValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

// Print function
const handlePrint = () => {
    window.print();
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

const StaffCTCReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const ctcCostCenters = useSelector(selectCTCCostCenters);
    const employeeCTCbyCC = useSelector(selectEmployeeCTCbyCC);
    const employeeCTCbyEmp = useSelector(selectEmployeeCTCbyEmp);
    const empCTCReport = useSelector(selectEmpCTCReport);
    const autoCompleteEmployees = useSelector(selectAutoCompleteEmployees);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Local state
    const [viewMode, setViewMode] = useState('costcenter'); // 'costcenter' or 'employee'
    const [localFilters, setLocalFilters] = useState({
        selectedCostCenter: '',
        selectedEmployee: '',
        empRefNo: '',
        revisionNo: '0',
        searchPrefix: ''
    });

    // Debounce state for search
    const [searchDebounce, setSearchDebounce] = useState(null);

    // Selected employee details
    const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);

    // Fetch cost centers on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await dispatch(fetchCTCEmpCostCenter()).unwrap();
            } catch (error) {
                console.error('❌ Error fetching cost centers:', error);
            }
        };

        fetchInitialData();
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

    // Handle view mode change
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        handleReset();
    };

    // Handle cost center change
    const handleCostCenterChange = async (e) => {
        const ccCode = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            selectedCostCenter: ccCode,
            selectedEmployee: '',
            empRefNo: '',
            revisionNo: '0'
        }));

        dispatch(resetSelectedData());

        if (ccCode) {
            try {
                await dispatch(fetchEmployeeCTCbyCC(ccCode)).unwrap();
            } catch (error) {
                console.error('❌ Error fetching employees by cost center:', error);
            }
        }
    };

    // Handle employee selection from cost center dropdown
    const handleEmployeeSelectFromCC = (e) => {
        const empRefNo = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            selectedEmployee: empRefNo,
            empRefNo: empRefNo,
            revisionNo: '0'
        }));

        // Find selected employee details
        const empDetails = employeeCTCbyCC.find(emp => emp.EmpRefNo === empRefNo);
        setSelectedEmployeeDetails(empDetails);
    };

    // Handle search input change (with debounce)
    const handleSearchChange = (e) => {
        const searchValue = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            searchPrefix: searchValue,
            selectedEmployee: '',
            empRefNo: ''
        }));

        // Clear previous debounce
        if (searchDebounce) {
            clearTimeout(searchDebounce);
        }

        // Set new debounce
        if (searchValue.trim().length >= 1) {
            const timeout = setTimeout(async () => {
                try {
                    await dispatch(fetchAutoCompleteCTCEmp(searchValue.trim())).unwrap();
                } catch (error) {
                    console.error('❌ Error fetching autocomplete employees:', error);
                }
            }, 300);
            setSearchDebounce(timeout);
        } else {
            dispatch(clearAutoCompleteData());
        }
    };

    // Handle employee selection from autocomplete
    const handleEmployeeSelectFromSearch = async (empRefNo, empName) => {
        setLocalFilters(prev => ({
            ...prev,
            selectedEmployee: empName,
            empRefNo: empRefNo,
            searchPrefix: empName,
            revisionNo: '0'
        }));

        dispatch(clearAutoCompleteData());

        // Fetch employee details
        try {
            const response = await dispatch(fetchEmployeeCTCbyEmp(empRefNo)).unwrap();
            if (response.Data && response.Data.length > 0) {
                setSelectedEmployeeDetails(response.Data[0]);
            }
        } catch (error) {
            console.error('❌ Error fetching employee details:', error);
        }
    };

    // Handle revision number change
    const handleRevisionChange = (e) => {
        setLocalFilters(prev => ({
            ...prev,
            revisionNo: e.target.value
        }));
    };

    // Handle view report
    const handleViewReport = async () => {
        if (!localFilters.empRefNo) {
            toast.warning('Please select an employee');
            return;
        }

        try {
            const params = {
                empRefNo: localFilters.empRefNo,
                revisionNo: localFilters.revisionNo
            };

            console.log('📊 Fetching CTC Report with params:', params);

            await dispatch(fetchEmpCTCforReport(params)).unwrap();
            toast.success('CTC report loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching CTC report:', error);
            toast.error('Failed to fetch CTC report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            selectedCostCenter: '',
            selectedEmployee: '',
            empRefNo: '',
            revisionNo: '0',
            searchPrefix: ''
        });

        setSelectedEmployeeDetails(null);
        dispatch(clearFilters());
        dispatch(resetCTCReportData());
        dispatch(clearAutoCompleteData());
    };

    // Handle Excel download for Cost Center View
    const handleExcelDownloadCC = () => {
        try {
            if (!employeeCTCbyCC || employeeCTCbyCC.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const data = employeeCTCbyCC.map(emp => ({
                'Employee Ref No': emp.EmpRefNo,
                'Employee Name': emp.EmpName,
                'Designation': emp.Designation,
                'Cost Center': emp.JoiningCostCenter,
                'CC Name': emp.CCName,
                'Group Name': emp.GroupName,
                'No of Revisions': emp.NoofRevision
            }));

            const filename = `Staff_CTC_Report_${localFilters.selectedCostCenter}`;
            downloadAsExcel(data, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Handle Excel download for Employee CTC View
    const handleExcelDownloadEmp = () => {
        try {
            if (!empCTCReport || !empCTCReport.Data || !empCTCReport.Data.HeadsList) {
                toast.warning('No data available to download');
                return;
            }

            const headsList = empCTCReport.Data.HeadsList;
            const data = headsList.map(head => ({
                'Head Name': head.HeadName,
                'Head Type': head.HeadType,
                'Monthly Amount': head.MonthlyAmount,
                'Yearly Amount': head.YearlyAmount,
                'Existing Monthly': head.ExistingMonthlyAmount,
                'Existing Yearly': head.ExistingYearlyAmount,
                'Monthly Difference': head.MonthlyDiff,
                'Yearly Difference': head.YearlyDiff
            }));

            const filename = `Staff_CTC_Details_${localFilters.empRefNo}_Rev${localFilters.revisionNo}`;
            downloadAsExcel(data, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <BriefcaseBusiness className="h-8 w-8 text-indigo-600" />
                            Staff CTC Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View and manage staff CTC details by cost center or individual employee
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            CTC Management
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
                        <span>CTC Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Staff CTC Report</span>
                    </div>
                </nav>
            </div>

            {/* View Mode Selection */}
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
                                    View detailed CTC for specific employee
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Filters Section - Cost Center View */}
            {viewMode === 'costcenter' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2">
                        {/* Cost Center */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Cost Center <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.selectedCostCenter}
                                onChange={handleCostCenterChange}
                                disabled={isAnyLoading}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Cost Center</option>
                                {ctcCostCenters && ctcCostCenters.Data && ctcCostCenters.Data.map((cc, index) => (
                                    <option key={index} value={cc.CC_Code}>
                                        {cc.CC_Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Show employee count */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Employees in Cost Center
                            </label>
                            <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white">
                                {employeeCTCbyCC && employeeCTCbyCC.Data
                                    ? `${employeeCTCbyCC.Data.length} employees found`
                                    : 'Select a cost center'}
                            </div>
                        </div>
                    </div>

                    {/* Info message */}
                    {localFilters.selectedCostCenter && employeeCTCbyCC && employeeCTCbyCC.Data && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                📋 Select an employee from the table below to view their CTC details
                            </p>
                        </div>
                    )}

                    {/* Selected Employee Info - UPDATED with revision fix */}
                    {selectedEmployeeDetails && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Selected Employee</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEmployeeDetails.EmpName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Designation</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEmployeeDetails.Designation}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Group</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEmployeeDetails.GroupName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Available Revisions</p>
                                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                        {selectedEmployeeDetails.NoofRevision > 0
                                            ? `0 to ${selectedEmployeeDetails.NoofRevision - 1}`
                                            : '0 (Latest only)'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revision Number</p>
                                    <input
                                        type="number"
                                        min="0"
                                        max={selectedEmployeeDetails.NoofRevision > 0 ? selectedEmployeeDetails.NoofRevision - 1 : 0}
                                        value={localFilters.revisionNo}
                                        onChange={handleRevisionChange}
                                        disabled={isAnyLoading}
                                        placeholder="0 for latest"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex gap-3">
                            <button
                                onClick={handleViewReport}
                                disabled={isAnyLoading || !localFilters.empRefNo}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                {isAnyLoading ? (
                                    <RotateCcw className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                                View CTC Details
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <RotateCcw className="h-5 w-5" />
                                Reset
                            </button>
                        </div>

                        {localFilters.selectedCostCenter && employeeCTCbyCC && employeeCTCbyCC.Data && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Export List:</span>

                                <Tooltip content="Print employee list">
                                    <button
                                        onClick={handlePrint}
                                        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        <Printer className="h-5 w-5" />
                                        Print
                                    </button>
                                </Tooltip>

                                <Tooltip content="Download employee list as Excel">
                                    <button
                                        onClick={handleExcelDownloadCC}
                                        className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        <Download className="h-5 w-5" />
                                        Export Excel
                                    </button>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Filters Section - Employee View */}
            {viewMode === 'employee' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-3">
                        {/* Employee Search */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Search Employee <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={localFilters.searchPrefix}
                                    onChange={handleSearchChange}
                                    disabled={isAnyLoading}
                                    placeholder="Type employee name or ref number..."
                                    className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                                {loading.autoCompleteEmployees && (
                                    <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-600 animate-spin" />
                                )}

                                {/* Autocomplete Dropdown */}
                                {autoCompleteEmployees && autoCompleteEmployees.Data && autoCompleteEmployees.Data.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {autoCompleteEmployees.Data.map((emp, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleEmployeeSelectFromSearch(emp.EmpRefNo, emp.EmpName)}
                                                className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/40 dark:hover:to-purple-900/40 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                                            >
                                                <div className="font-semibold text-gray-900 dark:text-white">{emp.EmpName}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{emp.EmpRefNo}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {localFilters.searchPrefix && !localFilters.empRefNo && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Type at least 1 character to search
                                </p>
                            )}
                        </div>

                        {/* Revision Number - UPDATED */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Revision Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                max={selectedEmployeeDetails && selectedEmployeeDetails.NoofRevision > 0
                                    ? selectedEmployeeDetails.NoofRevision - 1
                                    : 0}
                                value={localFilters.revisionNo}
                                onChange={handleRevisionChange}
                                disabled={isAnyLoading || !selectedEmployeeDetails}
                                placeholder="Enter revision number (0 for latest)"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            />
                            {selectedEmployeeDetails && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {selectedEmployeeDetails.NoofRevision > 0
                                        ? `Available: 0 to ${selectedEmployeeDetails.NoofRevision - 1}`
                                        : 'Available: 0 (Latest only)'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Selected Employee Info - UPDATED with revision fix */}
                    {selectedEmployeeDetails && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Employee Name</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEmployeeDetails.EmpName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ref Number</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEmployeeDetails.EmpRefNo}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Designation</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEmployeeDetails.Designation}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cost Center</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedEmployeeDetails.JoiningCostCenter}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Revisions</p>
                                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                        {selectedEmployeeDetails.NoofRevision > 0
                                            ? `0 to ${selectedEmployeeDetails.NoofRevision - 1}`
                                            : '0 (Latest only)'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex gap-3">
                            <button
                                onClick={handleViewReport}
                                disabled={isAnyLoading || !localFilters.empRefNo}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                {isAnyLoading ? (
                                    <RotateCcw className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                                View CTC Details
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <RotateCcw className="h-5 w-5" />
                                Reset
                            </button>
                        </div>

                        {empCTCReport && empCTCReport.Data && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Export:</span>

                                <Tooltip content="Print CTC details">
                                    <button
                                        onClick={handlePrint}
                                        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        <Printer className="h-5 w-5" />
                                        Print
                                    </button>
                                </Tooltip>

                                <Tooltip content="Download CTC details as Excel">
                                    <button
                                        onClick={handleExcelDownloadEmp}
                                        className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        <Download className="h-5 w-5" />
                                        Export Excel
                                    </button>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Summary Cards - Cost Center View */}
            {viewMode === 'costcenter' && localFilters.selectedCostCenter && employeeCTCbyCC && employeeCTCbyCC.Data && (
                <CostCenterSummaryCards employeesList={employeeCTCbyCC.Data} />
            )}

            {/* Summary Cards - Employee CTC View */}
            {viewMode === 'employee' && empCTCReport && empCTCReport.Data && (
                <EmployeeCTCSummaryCards ctcData={empCTCReport} />
            )}

            {/* Report Display Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {/* Cost Center View - Employee List Table */}
                {viewMode === 'costcenter' && localFilters.selectedCostCenter && employeeCTCbyCC && employeeCTCbyCC.Data && !empCTCReport && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Employee Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Designation</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Cost Center</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Group</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Revisions</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {employeeCTCbyCC.Data.map((emp, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {emp.EmpName}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    ID: {emp.EmpRefNo}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                                                {emp.Designation}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                {emp.JoiningCostCenter}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {emp.CCName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-800 dark:text-purple-200">
                                                {emp.GroupName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 text-blue-800 dark:text-blue-200">
                                                {emp.NoofRevision || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => {
                                                    setLocalFilters(prev => ({
                                                        ...prev,
                                                        selectedEmployee: emp.EmpRefNo,
                                                        empRefNo: emp.EmpRefNo,
                                                        revisionNo: '0'
                                                    }));
                                                    setSelectedEmployeeDetails(emp);
                                                }}
                                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center gap-2 mx-auto transition-all duration-300"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Select
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Total Employees: {employeeCTCbyCC.Data.length}
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                    Cost Center: {localFilters.selectedCostCenter}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Employee CTC Details View */}
                {empCTCReport && empCTCReport.Data && empCTCReport.Data.HeadsList && (
                    <div className="p-6">
                        {/* Employee Header Info */}
                        <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {empCTCReport.Data.EmpName}
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Employee Ref: {empCTCReport.Data.Emprefno}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Revision Number</p>
                                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {localFilters.revisionNo}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-indigo-200 dark:border-indigo-700">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Month & Year</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {empCTCReport.Data.MonthName} {empCTCReport.Data.Year}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Group</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {empCTCReport.Data.GroupName || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Transaction Ref</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                                        {empCTCReport.Data.TransactionRefno}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Remarks</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {empCTCReport.Data.Remarks || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTC Breakdown Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                            Salary Component
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                            Monthly Amount
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                            Yearly Amount
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                            Change
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {empCTCReport.Data.HeadsList.map((head, index) => {
                                        // Determine row styling based on head type
                                        let rowClass = '';
                                        let textClass = 'text-gray-900 dark:text-white';

                                        if (head.HeadType === 'GROSSSALARY') {
                                            rowClass = 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20';
                                            textClass = 'text-green-900 dark:text-green-200 font-bold';
                                        } else if (head.HeadType === 'DEDUCTIONTOTAL') {
                                            rowClass = 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20';
                                            textClass = 'text-orange-900 dark:text-orange-200 font-bold';
                                        } else if (head.HeadType === 'NETSALARY') {
                                            rowClass = 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20';
                                            textClass = 'text-blue-900 dark:text-blue-200 font-bold';
                                        } else if (head.HeadType === 'BENEFITTOTAL' || head.HeadType === 'CTCTOTAL') {
                                            rowClass = 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20';
                                            textClass = 'text-indigo-900 dark:text-indigo-200 font-bold';
                                        } else if (head.MainHead === 'EARNINGS' || head.MainHead === 'DEDUCTIONS' || head.MainHead === 'REIMBURSABLE PAYMENTS/BENEFITS') {
                                            rowClass = 'bg-gray-100 dark:bg-gray-700';
                                            textClass = 'text-gray-900 dark:text-white font-bold';
                                        }

                                        return (
                                            <tr key={index} className={clsx(rowClass, 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors')}>
                                                <td className="px-6 py-4">
                                                    <div className={clsx('text-sm', textClass)}>
                                                        {head.MainHead && (
                                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                                                                {head.MainHead}
                                                            </span>
                                                        )}
                                                        {head.HeadName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className={clsx('text-sm', textClass)}>
                                                        {head.MonthlyAmount !== null && head.MonthlyAmount !== undefined
                                                            ? `₹${parseFloat(head.MonthlyAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                                            : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className={clsx('text-sm', textClass)}>
                                                        {head.YearlyAmount !== null && head.YearlyAmount !== undefined
                                                            ? `₹${parseFloat(head.YearlyAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                                            : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {getChangeIndicator(head.MonthlyAmount, head.ExistingMonthlyAmount)}
                                                        <span className={clsx(
                                                            'text-xs font-semibold',
                                                            (parseFloat(head.MonthlyAmount) - parseFloat(head.ExistingMonthlyAmount)) > 0
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : (parseFloat(head.MonthlyAmount) - parseFloat(head.ExistingMonthlyAmount)) < 0
                                                                    ? 'text-red-600 dark:text-red-400'
                                                                    : 'text-gray-500 dark:text-gray-400'
                                                        )}>
                                                            {formatChange(head.MonthlyAmount, head.ExistingMonthlyAmount, head.MonthlyDiff)}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Notes */}
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                <strong>Note:</strong> Change indicators show the difference from the previous revision.
                                Green arrow indicates increase, red arrow indicates decrease, and dash indicates no change.
                            </p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isAnyLoading && !empCTCReport && (viewMode === 'employee' || (viewMode === 'costcenter' && !employeeCTCbyCC)) && (
                    <div className="p-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                <FileSpreadsheet className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No CTC Data Available</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                {viewMode === 'costcenter'
                                    ? 'Select a cost center and employee to view CTC details.'
                                    : 'Search and select an employee to view their CTC details.'}
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Data</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Fetching CTC information...
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Information Note */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        <p className="font-semibold mb-1">Staff CTC Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            <strong>View by Cost Center:</strong> Browse all employees in a cost center and select one to view detailed CTC breakdown.<br />
                            <strong>View by Employee:</strong> Search for a specific employee and view their complete CTC structure.<br />
                            <strong>Revision History:</strong> Each employee may have multiple CTC revisions. Enter the revision number (0 for latest) to view historical data.<br />
                            <strong>Change Tracking:</strong> Green/red arrows indicate increases/decreases from previous revision.
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

export default StaffCTCReportPage;