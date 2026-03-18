import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import {
    Building2,
    UserSquare2,
    Eye,
    RotateCcw,
    Download,
    Printer,
    ChevronRight,
    RefreshCw,
    CircleDollarSign,
    Wallet,
    AlertTriangle,
    Info,
    FileSpreadsheet,
    BriefcaseBusiness,
    Users,
    Filter,
    Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import slice actions and selectors
import {
    fetchCMSYears,
    fetchCMSMonthsByYear,
    fetchCMSPaidEmployee,
    fetchCMSPaidEmployeebyCC,
    fetchCMSPaidCCbyMonth,
    fetchEmpPaySlipData,
    setFilters,
    clearFilters,
    resetCMSPaymentData,
    clearError,
    resetSelectedData,
    clearMonthsData,
    selectCMSYears,
    selectCMSMonths,
    selectCMSPaidEmployeesStaff,
    selectCMSPaidEmployeesByCCStaff,
    selectCMSPaidCostCentresStaff,
    selectEmpPaySlipData,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    fetchCMSPayReportEmployeeData
} from '../../slices/HrReportSlice/cmsPaymentReportSlice';

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

// Summary Cards Component for Employee View
const EmployeeSummaryCards = ({ employeesList }) => {
    if (!employeesList || employeesList.length === 0) {
        return null;
    }

    const summary = {
        totalEmployees: employeesList.length,
        totalGrossSalary: employeesList.reduce((sum, emp) => sum + (parseFloat(emp.GrossSalary) || 0), 0),
        totalNetSalary: employeesList.reduce((sum, emp) => sum + (parseFloat(emp.NetSalary) || 0), 0)
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
            title: 'Total Gross Salary',
            value: `₹${summary.totalGrossSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            icon: CircleDollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Total Net Salary',
            value: `₹${summary.totalNetSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            icon: Wallet,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
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

// Summary Cards Component for Cost Centre View
const CostCentreSummaryCards = ({ costCentresList }) => {
    if (!costCentresList || costCentresList.length === 0) {
        return null;
    }

    const summary = {
        totalCostCentres: costCentresList.length,
        totalEmployees: costCentresList.reduce((sum, cc) => sum + (parseInt(cc.EmployeeCount) || 0), 0),
        totalAmount: costCentresList.reduce((sum, cc) => sum + (parseFloat(cc.TotalAmount) || 0), 0)
    };

    const cards = [
        {
            title: 'Total Cost Centres',
            value: summary.totalCostCentres,
            icon: Building2,
            color: 'from-purple-500 to-pink-600',
            bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
        },
        {
            title: 'Total Employees',
            value: summary.totalEmployees,
            icon: Users,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        },
        {
            title: 'Total Payroll Amount',
            value: `₹${summary.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            icon: CircleDollarSign,
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

const StaffCMSPaymentReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors - Staff only
    const cmsYears = useSelector(selectCMSYears) || [];
    const cmsMonths = useSelector(selectCMSMonths) || [];
    const rawStaffEmployees = useSelector(selectCMSPaidEmployeesStaff);
    const rawStaffEmployeesByCC = useSelector(selectCMSPaidEmployeesByCCStaff);
    const rawStaffCostCentres = useSelector(selectCMSPaidCostCentresStaff);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const errors = useSelector(selectErrors);

    // Memoize the staff data to prevent unnecessary re-renders
    const staffEmployees = useMemo(() => {
        if (!rawStaffEmployees) return [];
        // Handle case where data might be in Data property
        if (rawStaffEmployees.Data && Array.isArray(rawStaffEmployees.Data)) {
            return rawStaffEmployees.Data;
        }
        return Array.isArray(rawStaffEmployees) ? rawStaffEmployees : [];
    }, [rawStaffEmployees]);

    const staffEmployeesByCC = useMemo(() => {
        if (!rawStaffEmployeesByCC) return [];
        // Handle case where data might be in Data property
        if (rawStaffEmployeesByCC.Data && Array.isArray(rawStaffEmployeesByCC.Data)) {
            return rawStaffEmployeesByCC.Data;
        }
        return Array.isArray(rawStaffEmployeesByCC) ? rawStaffEmployeesByCC : [];
    }, [rawStaffEmployeesByCC]);

    const staffCostCentres = useMemo(() => {
        if (!rawStaffCostCentres) return [];
        // Handle case where data might be in Data property
        if (rawStaffCostCentres.Data && Array.isArray(rawStaffCostCentres.Data)) {
            return rawStaffCostCentres.Data;
        }
        return Array.isArray(rawStaffCostCentres) ? rawStaffCostCentres : [];
    }, [rawStaffCostCentres]);

    // Local state
    const [viewMode, setViewMode] = useState('employee'); // 'employee', 'costcentre', or 'monthwise'
    const [localFilters, setLocalFilters] = useState({
        selectedYear: '',
        selectedMonth: '',
        selectedEmployee: '',
        selectedCostCentre: '',
        selectAllEmployees: false
    });

    // For storing available employees for dropdown
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    // Fetch years on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await dispatch(fetchCMSYears()).unwrap();
            } catch (error) {
                console.error('❌ Error fetching CMS years:', error);
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

    // Update available employees when staffEmployees changes (Employee view)
    useEffect(() => {
        console.log('🔍 Employee View - staffEmployees updated:', staffEmployees);

        if (viewMode === 'employee' && staffEmployees.length > 0) {
            console.log('✅ Setting available employees for dropdown:', staffEmployees.length);
            setAvailableEmployees(staffEmployees);
        }
    }, [staffEmployees, viewMode]);

    // Update available employees when cost centre employees change (Cost Centre view)
    useEffect(() => {
        console.log('🔍 Cost Centre View - staffEmployeesByCC updated:', staffEmployeesByCC);

        if (viewMode === 'costcentre' && staffEmployeesByCC.length > 0) {
            console.log('✅ Setting available employees from CC:', staffEmployeesByCC.length);
            setAvailableEmployees(staffEmployeesByCC);
        }
    }, [staffEmployeesByCC, viewMode]);

    // Handle view mode change
    const handleViewModeChange = (mode) => {
        console.log('🔄 View mode changed to:', mode);
        setViewMode(mode);
        handleReset();
    };

    // Handle year change
    const handleYearChange = async (e) => {
        const year = e.target.value;
        console.log('📅 Year selected:', year);

        setLocalFilters(prev => ({
            ...prev,
            selectedYear: year,
            selectedMonth: '',
            selectedEmployee: '',
            selectedCostCentre: '',
            selectAllEmployees: false
        }));

        dispatch(clearMonthsData());
        setAvailableEmployees([]);
        setFilteredEmployees([]);

        if (year) {
            try {
                const params = {
                    year: year,
                    lType: 'NA',
                    contraCode: 'NA',
                    eType: 'Staff'
                };
                console.log('📊 Fetching months with params:', params);
                await dispatch(fetchCMSMonthsByYear(params)).unwrap();
            } catch (error) {
                console.error('❌ Error fetching months:', error);
            }
        }
    };

    // Handle month change
    const handleMonthChange = async (e) => {
        const month = e.target.value;
        console.log('📆 Month selected:', month, 'for view mode:', viewMode);

        setLocalFilters(prev => ({
            ...prev,
            selectedMonth: month,
            selectedEmployee: '',
            selectedCostCentre: '',
            selectAllEmployees: false
        }));

        setAvailableEmployees([]);
        setFilteredEmployees([]);

        // For Employee view, fetch employee LIST (not full payment data) for dropdown
        if (viewMode === 'employee' && month && localFilters.selectedYear) {
            try {
                const params = {
                    year: localFilters.selectedYear,
                    month: month,
                    lType: 'NA',
                    contraCode: 'NA',
                    eType: 'Staff'
                };

                console.log('👥 Fetching employee list for dropdown with params:', params);
                const result = await dispatch(fetchCMSPaidEmployee(params)).unwrap();
                console.log('✅ Employee list fetched for dropdown:', result);
                // This just populates the dropdown, not the table
            } catch (error) {
                console.error('❌ Error fetching employee list:', error);
                toast.error('Failed to fetch employee list');
            }
        }

        // For Cost Centre view, fetch cost centres when month is selected
        if (viewMode === 'costcentre' && month && localFilters.selectedYear) {
            try {
                const params = {
                    month: month,
                    year: localFilters.selectedYear,
                    lType: 'NA',
                    contraCode: 'NA',
                    eType: 'Staff'
                };

                console.log('🏢 Fetching cost centres with params:', params);
                await dispatch(fetchCMSPaidCCbyMonth(params)).unwrap();
                console.log('✅ Cost centres fetched');
            } catch (error) {
                console.error('❌ Error fetching cost centres:', error);
                toast.error('Failed to fetch cost centres');
            }
        }
    };

    // Handle employee selection
    const handleEmployeeChange = (e) => {
        const value = e.target.value;
        console.log('👤 Employee selected:', value);
        console.log('📊 Available employees:', availableEmployees);

        if (value === 'all') {
            console.log('✅ Select All - will fetch all employees on View Report');
            setLocalFilters(prev => ({
                ...prev,
                selectAllEmployees: true,
                selectedEmployee: ''
            }));
            // Don't set filteredEmployees here - wait for View Report
            setFilteredEmployees([]);
        } else if (value) {
            setLocalFilters(prev => ({
                ...prev,
                selectedEmployee: value,
                selectAllEmployees: false
            }));
            console.log('✅ Single employee selected - will fetch on View Report');
            // Don't set filteredEmployees here - wait for View Report
            setFilteredEmployees([]);
        } else {
            setLocalFilters(prev => ({
                ...prev,
                selectedEmployee: '',
                selectAllEmployees: false
            }));
            setFilteredEmployees([]);
        }
    };
    // Handle cost centre change
    const handleCostCentreChange = async (e) => {
        const ccCode = e.target.value;
        console.log('🏢 Cost Centre selected:', ccCode);

        setLocalFilters(prev => ({
            ...prev,
            selectedCostCentre: ccCode,
            selectedEmployee: '',
            selectAllEmployees: false
        }));

        setAvailableEmployees([]);
        setFilteredEmployees([]);

        if (ccCode) {
            try {
                const params = {
                    year: localFilters.selectedYear,
                    month: localFilters.selectedMonth,
                    ccCode: ccCode,
                    lType: 'NA',
                    contraCode: 'NA',
                    eType: 'Staff'
                };

                console.log('👥 Fetching employee list by cost centre with params:', params);
                const result = await dispatch(fetchCMSPaidEmployeebyCC(params)).unwrap();
                console.log('✅ Employee list by CC fetched:', result);
                // This just populates the dropdown, not the table
            } catch (error) {
                console.error('❌ Error fetching employee list by cost centre:', error);
                toast.error('Failed to fetch employee list');
            }
        }
    };
    const handleViewReport = async () => {
        console.log('🔍 View Report clicked - View Mode:', viewMode);
        console.log('📋 Current filters:', localFilters);

        if (!localFilters.selectedYear || !localFilters.selectedMonth) {
            toast.warning('Please select year and month');
            return;
        }

        try {
            let params = {};

            // Employee view
            if (viewMode === 'employee') {
                if (!localFilters.selectAllEmployees && !localFilters.selectedEmployee) {
                    toast.warning('Please select an employee or Select All');
                    return;
                }

                params = {
                    year: localFilters.selectedYear,
                    month: localFilters.selectedMonth,
                    emprefNo: localFilters.selectAllEmployees ? '' : localFilters.selectedEmployee,
                    ccCode: '0',  // ✅ Send '0' when no cost centre selected in Employee view
                    lType: 'NA',
                    contraCode: 'NA',
                    eType: 'Staff'
                };
            }
            // Cost Centre view
            else if (viewMode === 'costcentre') {
                if (!localFilters.selectedCostCentre) {
                    toast.warning('Please select a cost centre');
                    return;
                }

                if (!localFilters.selectAllEmployees && !localFilters.selectedEmployee) {
                    toast.warning('Please select an employee or Select All');
                    return;
                }

                params = {
                    year: localFilters.selectedYear,
                    month: localFilters.selectedMonth,
                    ccCode: localFilters.selectedCostCentre,  // ✅ Use selected cost centre
                    emprefNo: localFilters.selectAllEmployees ? '' : localFilters.selectedEmployee,
                    lType: 'NA',
                    contraCode: 'NA',
                    eType: 'Staff'
                };
            }
            // Month Wise view - All employees, all cost centres
            else if (viewMode === 'monthwise') {
                params = {
                    year: localFilters.selectedYear,
                    month: localFilters.selectedMonth,
                    emprefNo: '',  // ✅ Empty for all employees
                    ccCode: '0',   // ✅ '0' for all cost centres
                    lType: 'NA',
                    contraCode: 'NA',
                    eType: 'Staff'
                };
            }

            console.log(`📊 Fetching payment data for ${viewMode} view with params:`, params);
            const result = await dispatch(fetchCMSPayReportEmployeeData(params)).unwrap();
            console.log('✅ Payment data fetched:', result);

            // Extract data properly
            const data = result?.Data || result || [];
            const dataArray = Array.isArray(data) ? data : [];

            if (dataArray.length === 0) {
                toast.error('No payment data found for the selected criteria');
                setFilteredEmployees([]);
                return;
            }

            // ✅ Map the API response to match expected structure with CMS fields
            const mappedData = dataArray.map(emp => ({
                ...emp,
                // Standardize field names
                EmpRefNo: emp.EmpRefNo || emp.EmprefNo,
                EmprefNo: emp.EmpRefNo || emp.EmprefNo,
                EmpName: emp.EmpName || emp.EmployeeName,
                EmployeeName: emp.EmpName || emp.EmployeeName,
                CCCode: emp.CCCode || emp.CurrentCC,
                CurrentCC: emp.CCCode || emp.CurrentCC,
                CCName: emp.CCName || '',
                // Map Amount to NetSalary if not present
                NetSalary: emp.NetSalary || emp.Amount || 0,
                Amount: emp.Amount || emp.NetSalary || 0,
                // If GrossSalary doesn't exist, use Amount as fallback
                GrossSalary: emp.GrossSalary || emp.Amount || 0,
                // Deductions - calculate if not provided
                Deductions: emp.Deductions || 0,
                // Other fields
                Designation: emp.Designation || 'N/A',
                BankName: emp.Bank || emp.BankName || 'N/A',
                AccountNumber: emp.BankAccountNo || emp.AccountNumber || 'N/A',
                // CMS-specific fields
                BankAccountNo: emp.BankAccountNo || '',
                IFSCCode: emp.IFSCCode || '',
                CMSTransactionNo: emp.CMSTransactionNo || '',
                PayrollRefno: emp.PayrollRefno || '',
                PayRollFortheDate: emp.PayRollFortheDate || '',
                PayRollDate: emp.PayRollDate || '',
                PaymentDate: emp.PaymentDate || '',
                CMSConsolidateNo: emp.CMSConsolidateNo || '',
                // Preserve original fields for pay slip
                TransactionRefno: emp.CMSTransactionNo || emp.TransactionRefno,
                ConsolidateTransNo: emp.ConslidateTransNo || emp.ConsolidateTransNo || emp.CMSConsolidateNo,
                CategoryId: emp.CategoryId || 0
            }));

            console.log('✅ Mapped payment data:', mappedData);
            setFilteredEmployees(mappedData);

            const successMessage = viewMode === 'employee'
                ? `Displaying ${mappedData.length} employee(s) with payment details`
                : viewMode === 'costcentre'
                    ? `Displaying ${mappedData.length} employee(s) from ${localFilters.selectedCostCentre}`
                    : `Displaying ${mappedData.length} employee(s) for ${localFilters.selectedMonth} ${localFilters.selectedYear}`;

            toast.success(successMessage);

        } catch (error) {
            console.error('❌ Error fetching payment data:', error);
            toast.error('Failed to fetch payment data. Please try again.');
            setFilteredEmployees([]);
        }
    };
    // Handle view pay slip
    const handleViewPaySlip = async (employee) => {
        try {
            const paySlipData = {
                TransactionRefno: employee.TransactionRefno || '',
                EmpRefno: employee.EmpRefNo || employee.EmprefNo || '',
                CurrentCC: employee.CCCode || employee.CurrentCC || '',
                CategoryId: employee.CategoryId || 0,
                ConslidateTransNo: employee.ConsolidateTransNo || employee.ConslidateTransNo || ''
            };

            console.log('💰 Fetching Pay Slip Data with params:', paySlipData);

            await dispatch(fetchEmpPaySlipData(paySlipData)).unwrap();
            toast.success('Pay slip loaded successfully');

        } catch (error) {
            console.error('❌ Error fetching pay slip:', error);
            toast.error('Failed to fetch pay slip. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        console.log('🔄 Reset clicked');

        setLocalFilters({
            selectedYear: '',
            selectedMonth: '',
            selectedEmployee: '',
            selectedCostCentre: '',
            selectAllEmployees: false
        });

        setAvailableEmployees([]);
        setFilteredEmployees([]);
        dispatch(clearFilters());
        dispatch(resetCMSPaymentData());
    };

    // Handle Excel download
    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            if (filteredEmployees.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const data = filteredEmployees.map(emp => ({
                'Employee Ref No': emp.EmpRefNo || emp.EmprefNo,
                'Employee Name': emp.EmpName || emp.EmployeeName,
                'Designation': emp.Designation || '',
                'Cost Center Code': emp.CCCode || emp.CurrentCC || '',
                'Cost Center Name': emp.CCName || '',
                'Bank Name': emp.BankName || emp.Bank || '',
                'Account Number': emp.BankAccountNo || '',
                'IFSC Code': emp.IFSCCode || '',
                'Amount': emp.Amount || emp.NetSalary || 0,
                'CMS Transaction No': emp.CMSTransactionNo || '',
                'Payroll Ref No': emp.PayrollRefno || '',
                'CMS Consolidate No': emp.CMSConsolidateNo || '',
                'Payroll Date': emp.PayRollFortheDate || emp.PayRollDate || '',
                'Payment Date': emp.PaymentDate || ''
            }));

            const viewModeText = viewMode === 'employee'
                ? 'Employee_View'
                : viewMode === 'costcentre'
                    ? `CostCentre_${localFilters.selectedCostCentre}`
                    : 'MonthWise';

            const filename = `Staff_CMS_Payment_Report_${viewModeText}_${localFilters.selectedMonth}_${localFilters.selectedYear}`;

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
                            Staff CMS Payment Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Salary paid through Bank Report - View staff payment details by employee, cost centre, or month
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 text-blue-800 dark:text-blue-200 text-sm rounded-full transition-colors">
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
                        <span>Payment Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Staff CMS Payment Report</span>
                    </div>
                </nav>
            </div>

            {/* View Mode Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Select View Mode <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => handleViewModeChange('employee')}
                        className={clsx(
                            'px-6 py-4 rounded-lg border-2 transition-all duration-300',
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
                                    Employees
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Year → Month → Employee
                                </div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleViewModeChange('costcentre')}
                        className={clsx(
                            'px-6 py-4 rounded-lg border-2 transition-all duration-300',
                            viewMode === 'costcentre'
                                ? 'border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40'
                                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                        )}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Building2 className={clsx(
                                'h-6 w-6',
                                viewMode === 'costcentre' ? 'text-indigo-600' : 'text-gray-500'
                            )} />
                            <div className="text-left">
                                <div className={clsx(
                                    'font-semibold',
                                    viewMode === 'costcentre' ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'
                                )}>
                                    Cost Center Wise
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Year → Month → CC → Employee
                                </div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleViewModeChange('monthwise')}
                        className={clsx(
                            'px-6 py-4 rounded-lg border-2 transition-all duration-300',
                            viewMode === 'monthwise'
                                ? 'border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40'
                                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                        )}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Calendar className={clsx(
                                'h-6 w-6',
                                viewMode === 'monthwise' ? 'text-indigo-600' : 'text-gray-500'
                            )} />
                            <div className="text-left">
                                <div className={clsx(
                                    'font-semibold',
                                    viewMode === 'monthwise' ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'
                                )}>
                                    Month Wise
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Year → Month
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                </div>

                <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {/* Year */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.selectedYear}
                            onChange={handleYearChange}
                            disabled={isAnyLoading}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Year</option>
                            {Array.isArray(cmsYears) && cmsYears.map((year, index) => (
                                <option key={index} value={year.Year || year}>
                                    {year.Year || year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Month */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Month <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.selectedMonth}
                            onChange={handleMonthChange}
                            disabled={isAnyLoading || !localFilters.selectedYear}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Month</option>
                            {Array.isArray(cmsMonths) && cmsMonths.map((month, index) => (
                                <option key={index} value={month.Month || month.MonthNo}>
                                    {month.MonthName || month.Month}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Cost Centre - Only for Cost Centre View */}
                    {viewMode === 'costcentre' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Cost Centre <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.selectedCostCentre}
                                onChange={handleCostCentreChange}
                                disabled={isAnyLoading || !localFilters.selectedMonth}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Cost Centre</option>
                                {staffCostCentres.map((cc, index) => (
                                    <option key={index} value={cc.CCCode || cc.CC_Code}>
                                        {cc.CCCode || cc.CC_Code} - {cc.CCName || cc.CC_Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Employee - For Employee and Cost Centre Views */}
                    {(viewMode === 'employee' || viewMode === 'costcentre') && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Employee <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.selectAllEmployees ? 'all' : localFilters.selectedEmployee}
                                onChange={handleEmployeeChange}
                                disabled={
                                    isAnyLoading ||
                                    !localFilters.selectedMonth ||
                                    (viewMode === 'costcentre' && !localFilters.selectedCostCentre) ||
                                    availableEmployees.length === 0
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Employee</option>
                                <option value="all">Select All Employees</option>
                                {availableEmployees.map((emp, index) => (
                                    <option key={index} value={emp.EmpRefNo || emp.EmprefNo}>
                                        {emp.EmpRefNo || emp.EmprefNo} - {emp.EmpName || emp.EmployeeName}
                                    </option>
                                ))}
                            </select>
                            {availableEmployees.length > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {availableEmployees.length} employees available
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleViewReport}
                            disabled={
                                isAnyLoading ||
                                !localFilters.selectedYear ||
                                !localFilters.selectedMonth ||
                                (viewMode === 'employee' && !localFilters.selectAllEmployees && !localFilters.selectedEmployee) ||
                                (viewMode === 'costcentre' && (!localFilters.selectedCostCentre || (!localFilters.selectAllEmployees && !localFilters.selectedEmployee)))
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

                    {((filteredEmployees && filteredEmployees.length > 0) ||
                        (viewMode === 'monthwise' && staffCostCentres.length > 0)) && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Export:</span>

                                <Tooltip content="Print report">
                                    <button
                                        onClick={handlePrint}
                                        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        <Printer className="h-5 w-5" />
                                        Print
                                    </button>
                                </Tooltip>

                                <Tooltip content="Download as Excel">
                                    <button
                                        onClick={handleExcelDownload}
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


            {/* Summary Cards - Works for all view modes */}
            {filteredEmployees && filteredEmployees.length > 0 && (
                <EmployeeSummaryCards employeesList={filteredEmployees} />
            )}

            {viewMode === 'monthwise' && staffCostCentres.length > 0 && (
                <CostCentreSummaryCards costCentresList={staffCostCentres} />
            )}

            {/* Report Display Section */}
            {/* Report Display Section - UNIFIED TABLE FOR ALL VIEW MODES */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {/* Unified Employee Payment Table */}
                {filteredEmployees && filteredEmployees.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Employee Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Cost Center</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Bank Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Info</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Dates</th>
                                    
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredEmployees.map((emp, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {emp.EmpName || emp.EmployeeName}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    ID: {emp.EmpRefNo || emp.EmprefNo}
                                                </div>
                                                <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                                    {emp.Designation || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {emp.CCCode || emp.CurrentCC || 'N/A'}
                                                </div>
                                                {emp.CCName && (
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {emp.CCName}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {emp.BankName || emp.Bank || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    A/C: {emp.BankAccountNo || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    IFSC: {emp.IFSCCode || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    CMS Trans: {emp.CMSTransactionNo || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    Payroll: {emp.PayrollRefno || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    Consolidate: {emp.CMSConsolidateNo || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                ₹{(parseFloat(emp.Amount || emp.NetSalary) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    Payroll: {emp.PayRollFortheDate || emp.PayRollDate || 'N/A'}
                                                </div>
                                                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                    Payment: {emp.PaymentDate || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        {/* <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleViewPaySlip(emp)}
                                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center gap-2 mx-auto transition-all duration-300"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Slip
                                            </button>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Total Employees: {filteredEmployees.length}
                                </span>
                                <div className="flex flex-col items-end">
                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                        {localFilters.selectedMonth} {localFilters.selectedYear} - Staff {viewMode === 'costcentre' && `(${localFilters.selectedCostCentre})`}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Total Amount: ₹{filteredEmployees.reduce((sum, emp) => sum + (parseFloat(emp.Amount || emp.NetSalary) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isAnyLoading && (!filteredEmployees || filteredEmployees.length === 0) && (
                    <div className="p-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-4 mb-4">
                                <FileSpreadsheet className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Payment Data Available</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                {viewMode === 'employee' && 'Select year, month, and employee to view payment details.'}
                                {viewMode === 'costcentre' && 'Select year, month, cost centre, and employee to view payment details.'}
                                {viewMode === 'monthwise' && 'Select year and month, then click "View Report" to view all employee payments.'}
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
                                Fetching staff payment information...
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
                        <p className="font-semibold mb-1">Staff CMS Payment Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            <strong>Employees:</strong> Select year → month → employee (or Select All) to view individual payment details.<br />
                            <strong>Cost Center Wise:</strong> Select year → month → cost centre → employee (or Select All) to view department-wise payments.<br />
                            <strong>Month Wise:</strong> Select year → month to view cost centre summary for the entire month.<br />
                            <strong>Pay Slip:</strong> Click "View Slip" on any employee to see their detailed pay slip.<br />
                            <strong>Export:</strong> Download the data as Excel or print the report for documentation.
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

export default StaffCMSPaymentReportPage;