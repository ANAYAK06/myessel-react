import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import {
    Users,
    RotateCcw,
    Eye,
    Search,
    AlertTriangle,
    FileSpreadsheet,
    Info,
    RefreshCw,
    ChevronRight,
    Printer,
    FileDown,
    Building2,
    Wallet,
    CircleDollarSign,
    TrendingDown,
    HardHat,
    Users2
} from 'lucide-react';
import { toast } from 'react-toastify';
import PaySlipModal from './PaySlipModal';


// Import slice actions and selectors
import {
    fetchAllEmpCategories,
    fetchLabourCCForSalaryReport,
    fetchPayRollGroups,
    fetchPayRollEmployees,
    fetchSalaryContractors,
    fetchEmployeeSalaryMonths,
    fetchEmployeeSalaryYears,
    fetchLBMonthsSalaryForReport,
    fetchSingleLBSalaryDataForReport,
    fetchLBPaySlipData,
    setFilters,
    clearFilters,
    setLabourType,
    clearGroupsData,
    clearEmployeesData,
    clearCostCentresData,
    clearMonthsData,
    clearYearsData,
    resetSalaryReportData,
    clearError,
    selectEmpCategories,
    selectLabourCostCentres,
    selectPayrollGroups,
    selectPayrollEmployees,
    selectSalaryContractors,
    selectSalaryMonths,
    selectSalaryYears,
    selectLabourMonthsSalaryReport,
    selectLabourSingleSalaryData,
    selectLabourPaySlipData,
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

// Summary Cards Component for Cost Center View
const CostCenterSummaryCards = ({ reportData }) => {
    if (!reportData || !reportData.Data) {
        return null;
    }

    const data = reportData.Data;
    const salaryData = data.lstSalData || [];

    const summary = {
        totalLabours: salaryData.length,
        totalGross: salaryData.reduce((sum, record) => sum + (parseFloat(record.GrossValue) || 0), 0),
        totalDeductions: salaryData.reduce((sum, record) => sum + (parseFloat(record.Deductions) || 0), 0),
        totalNet: salaryData.reduce((sum, record) => sum + (parseFloat(record.NetValue) || 0), 0),
    };

    const cards = [
        {
            title: 'Total Labours',
            value: summary.totalLabours,
            icon: Users,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
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
            color: 'from-purple-500 to-pink-600',
            bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
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

// Summary Cards Component for Labour View
const LabourSummaryCards = ({ reportData }) => {
    if (!reportData || !reportData.Data) {
        return null;
    }

    const data = reportData.Data;
    const salaryRecords = data.lstSalData || [];

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
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
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
            color: 'from-purple-500 to-pink-600',
            bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
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

const LabourSalaryReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const empCategories = useSelector(selectEmpCategories);
    const labourCostCentres = useSelector(selectLabourCostCentres);
    const payrollGroups = useSelector(selectPayrollGroups);
    const payrollEmployees = useSelector(selectPayrollEmployees);
    const salaryContractors = useSelector(selectSalaryContractors);
    const salaryMonths = useSelector(selectSalaryMonths);
    const salaryYears = useSelector(selectSalaryYears);
    const labourMonthsSalaryReport = useSelector(selectLabourMonthsSalaryReport);
    const labourSingleSalaryData = useSelector(selectLabourSingleSalaryData);
    const labourPaySlipData = useSelector(selectLabourPaySlipData);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // View mode state
    const [viewMode, setViewMode] = useState('costcenter'); // 'costcenter' or 'labour'

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        labourType: '', // "Own Labour" or "Contractor"
        ccCode: '',
        contractorCode: '',
        groupId: '',
        labourId: '',
        year: '',
        fromMonth: '',
        toMonth: ''
    });

    const [showPaySlipModal, setShowPaySlipModal] = useState(false);
    const [selectedLabourForPaySlip, setSelectedLabourForPaySlip] = useState(null);

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

    // Handle view payslip
    const handleViewPaySlip = async (record) => {
        try {
            setSelectedLabourForPaySlip(record);

            const payload = {
                TransactionRefno: record.TransactionRefno || record.TransactionRefNo,
                LabourId: record.LabourId,
                CurrentCC: record.CurrentCC,
                CategoryId: localFilters.empCategory === '0' ? '' : localFilters.empCategory,
                ConslidateTransNo: record.ConslidateTransNo,
                LabourType: record.LabourType || localFilters.labourType,
                ContractorCode: record.ContractorCode || localFilters.contractorCode || ''
            };

            console.log('📄 Fetching Labour Pay Slip Data with params:', payload);
            console.log('📄 Record data:', record);

            await dispatch(fetchLBPaySlipData(payload)).unwrap();
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

    // Handle labour type change
    const handleLabourTypeChange = async (e) => {
        const labourType = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            labourType: labourType,
            ccCode: '',
            contractorCode: '',
            groupId: '',
            labourId: '',
            year: '',
            fromMonth: '',
            toMonth: ''
        }));

        dispatch(clearCostCentresData());
        dispatch(clearGroupsData());
        dispatch(clearEmployeesData());
        dispatch(clearYearsData());
        dispatch(clearMonthsData());

        // Fetch contractors if Contractor type is selected
        if (labourType === 'Contractor') {
            try {
                await dispatch(fetchSalaryContractors()).unwrap();
            } catch (error) {
                console.error('❌ Error fetching contractors:', error);
            }
        }

        // ✅ Fetch cost centres if Own Labour is selected
        if (labourType === 'Own Labour') {
            try {
                await dispatch(fetchLabourCCForSalaryReport({
                    labourType: labourType,
                    contractor: 'NA'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching cost centres:', error);
            }
        }
    };


    // Handle contractor change (only for Contractor labour type)
    const handleContractorChange = async (e) => {
        const contractorCode = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            contractorCode: contractorCode,
            ccCode: '',
            groupId: '',
            labourId: '',
            year: '',
            fromMonth: '',
            toMonth: ''
        }));

        dispatch(clearCostCentresData());
        dispatch(clearGroupsData());
        dispatch(clearEmployeesData());
        dispatch(clearYearsData());
        dispatch(clearMonthsData());

        // Fetch cost centres for contractor
        if (contractorCode && localFilters.labourType) {
            try {
                await dispatch(fetchLabourCCForSalaryReport({
                    labourType: localFilters.labourType,
                    contractor: contractorCode
                })).unwrap();
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
            labourId: '',
            year: '',
            fromMonth: '',
            toMonth: ''
        }));

        dispatch(clearGroupsData());
        dispatch(clearEmployeesData());
        dispatch(clearYearsData());
        dispatch(clearMonthsData());

        if (ccCode && localFilters.labourType) {
            try {
                await dispatch(fetchPayRollGroups({
                    ccCode: ccCode,
                    labourType: localFilters.labourType,
                    contractor: localFilters.labourType === 'Contractor' ? localFilters.contractorCode : 'NA',
                    empType: 'Labour'
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
            labourId: '',
            year: '',
            fromMonth: '',
            toMonth: ''
        }));

        dispatch(clearEmployeesData());
        dispatch(clearYearsData());
        dispatch(clearMonthsData());

        if (groupId && localFilters.ccCode && localFilters.labourType) {
            try {
                await dispatch(fetchPayRollEmployees({
                    ccCode: localFilters.ccCode,
                    groupId: groupId,
                    labourType: localFilters.labourType,
                    contractor: localFilters.labourType === 'Contractor' ? localFilters.contractorCode : 'NA',
                    empType: 'Labour'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching labours:', error);
            }
        }
    };
    // Handle labour change
    const handleLabourChange = async (e) => {
        const labourId = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            labourId: labourId,
            year: '',
            fromMonth: '',
            toMonth: ''
        }));

        dispatch(clearYearsData());
        dispatch(clearMonthsData());

        // If in labour view mode and labour is selected (not SelectAll), fetch years
        if (viewMode === 'labour' && labourId && labourId !== 'SelectAll') {
            try {
                await dispatch(fetchEmployeeSalaryYears({
                    empCategory: localFilters.empCategoryName,
                    ccCode: localFilters.ccCode,
                    groupId: localFilters.groupId === 'SelectAll' ? '' : localFilters.groupId,
                    empRefNo: labourId,
                    month: '',
                    employeeType: 'Labour',
                    labourType: localFilters.labourType,
                    contractor: localFilters.labourType === 'Contractor' ? localFilters.contractorCode : 'NA'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching years:', error);
            }
        }
    };

    // Handle year change (for labour view)
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
        if (year && year !== 'SelectAll' && localFilters.labourId && viewMode === 'labour') {
            try {
                await dispatch(fetchEmployeeSalaryMonths({
                    empCategory: localFilters.empCategoryName,
                    ccCode: localFilters.ccCode,
                    groupId: localFilters.groupId === 'SelectAll' ? '' : localFilters.groupId,
                    empRefNo: localFilters.labourId,
                    year: year,
                    fromMonth: '',
                    employeeType: 'Labour',
                    labourType: localFilters.labourType,
                    contractorCode: localFilters.labourType === 'Contractor' ? localFilters.contractorCode : 'NA'
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

    // Handle view button click
    const handleView = async () => {
        // Common validations
        if (!localFilters.labourType) {
            toast.warning('Please select Labour Type');
            return;
        }

        if (localFilters.labourType === 'Contractor' && !localFilters.contractorCode) {
            toast.warning('Please select Contractor');
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

        if (!localFilters.labourId) {
            toast.warning('Please select Labour');
            return;
        }

        try {
            dispatch(setFilters(localFilters));

            if (viewMode === 'costcenter') {
                if (!localFilters.fromMonth) {
                    toast.warning('Please select Month');
                    return;
                }

                if (!localFilters.year) {
                    toast.warning('Please select Year');
                    return;
                }

                const params = {
                    ccCode: localFilters.ccCode,
                    labourId: localFilters.labourId,
                    groupId: localFilters.groupId,
                    year: localFilters.year,
                    fromMonth: localFilters.fromMonth,
                    toMonth: localFilters.fromMonth,
                    labourType: localFilters.labourType,
                    contractorCode: localFilters.labourType === 'Contractor' ? localFilters.contractorCode : 'NA'
                };

                console.log('📊 Fetching Labour Salary Report (Cost Center View) with params:', params);

                await dispatch(fetchLBMonthsSalaryForReport(params)).unwrap();
                toast.success('Labour salary report loaded successfully');

            } else {
                if (!localFilters.year) {
                    toast.warning('Please select Year');
                    return;
                }

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

                const params = {
                    ccCode: localFilters.ccCode,
                    groupId: localFilters.groupId === 'SelectAll' ? '' : localFilters.groupId,
                    labourId: localFilters.labourId,
                    year: localFilters.year === 'SelectAll' ? '' : localFilters.year,
                    fromMonth: localFilters.year === 'SelectAll' ? '' : localFilters.fromMonth,
                    toMonth: localFilters.year === 'SelectAll' ? '' : localFilters.toMonth,
                    labourType: localFilters.labourType,
                    contractorCode: localFilters.labourType === 'Contractor' ? localFilters.contractorCode : 'NA'
                };

                console.log('📊 Fetching Single Labour Salary Report with params:', params);

                await dispatch(fetchSingleLBSalaryDataForReport(params)).unwrap();
                toast.success('Labour salary report loaded successfully');
            }

        } catch (error) {
            console.error('❌ Error fetching report:', error);
            toast.error('Failed to fetch report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            labourType: '',
            ccCode: '',
            contractorCode: '',
            groupId: '',
            labourId: '',
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
    const handleExcelDownload = () => {
        try {
            let data, filename;

            if (viewMode === 'costcenter') {
                if (!labourMonthsSalaryReport?.Data) {
                    toast.warning('No data available to download');
                    return;
                }
                data = labourMonthsSalaryReport.Data.lstSalData;
                filename = `Labour_Salary_Report_CC_${localFilters.ccCode}_${getMonthName(localFilters.fromMonth)}_${localFilters.year}`;
            } else {
                if (!labourSingleSalaryData?.Data) {
                    toast.warning('No data available to download');
                    return;
                }
                data = labourSingleSalaryData.Data.lstSalData;
                const labourName = data && data.length > 0 ? data[0].EmployeeName || localFilters.labourId : localFilters.labourId;
                filename = `Labour_Salary_Report_${labourName}_${localFilters.year}`;
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
    const currentReportData = viewMode === 'costcenter' ? labourMonthsSalaryReport : labourSingleSalaryData;

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <HardHat className="h-8 w-8 text-blue-600" />
                            Labour Salary & Wages Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View and manage labour salary reports by cost center or individual labour
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 text-blue-800 dark:text-blue-200 text-sm rounded-full transition-colors">
                            Labour Payroll
                        </div>
                        {isAnyLoading && (
                            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
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
                        <span className="text-gray-900 dark:text-white">Labour Salary Report</span>
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
                                ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        )}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Building2 className={clsx(
                                'h-6 w-6',
                                viewMode === 'costcenter' ? 'text-blue-600' : 'text-gray-500'
                            )} />
                            <div className="text-left">
                                <div className={clsx(
                                    'font-semibold',
                                    viewMode === 'costcenter' ? 'text-blue-900 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300'
                                )}>
                                    View by Cost Center
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    View all labours in a cost center
                                </div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleViewModeChange('labour')}
                        className={clsx(
                            'flex-1 px-6 py-4 rounded-lg border-2 transition-all duration-300',
                            viewMode === 'labour'
                                ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        )}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Users2 className={clsx(
                                'h-6 w-6',
                                viewMode === 'labour' ? 'text-blue-600' : 'text-gray-500'
                            )} />
                            <div className="text-left">
                                <div className={clsx(
                                    'font-semibold',
                                    viewMode === 'labour' ? 'text-blue-900 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300'
                                )}>
                                    View by Labour
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    View specific labour salary history
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Filters Section - Cost Center View */}
            {viewMode === 'costcenter' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {/* Labour Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Labour Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.labourType}
                                onChange={handleLabourTypeChange}
                                disabled={isAnyLoading}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Labour Type</option>
                                <option value="Own Labour">Own Labour</option>
                                <option value="Contractor">Contractor</option>
                            </select>
                        </div>

                        {/* Contractor - Only show if Contractor type is selected */}
                        {localFilters.labourType === 'Contractor' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Contractor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={localFilters.contractorCode}
                                    onChange={handleContractorChange}
                                    disabled={isAnyLoading || !localFilters.labourType}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <option value="">Select Contractor</option>
                                    <option value="SelectAll">Select All</option>
                                    {salaryContractors && salaryContractors.map((contractor, index) => (
                                        <option key={index} value={contractor.ContractorCode}>
                                            {contractor.ContractorName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}



                        {/* Cost Centre */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Cost Centre <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.ccCode}
                                onChange={handleCCCodeChange}
                                disabled={isAnyLoading || !localFilters.labourType || (localFilters.labourType === 'Contractor' && !localFilters.contractorCode)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Cost Centre</option>
                                <option value="SelectAll">Select All</option>
                                {labourCostCentres && labourCostCentres.map((cc, index) => (
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
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

                        {/* Labour Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Labour Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.labourId}
                                onChange={handleLabourChange}
                                disabled={isAnyLoading || !localFilters.groupId}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Labour</option>
                                <option value="SelectAll">Select All</option>
                                {payrollEmployees && payrollEmployees.map((emp, index) => (
                                    <option key={index} value={emp.EmpRefno}>
                                        {emp.Name} ({emp.EmpRefno})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Month */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Payment Month <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.fromMonth}
                                onChange={handleMonthChangeCC}
                                disabled={isAnyLoading || !localFilters.labourId}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Month</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <option key={month} value={month}>
                                        {getMonthName(month)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Year */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Payment Year <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.year}
                                onChange={handleYearChangeCC}
                                disabled={isAnyLoading || !localFilters.labourId}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex gap-3">
                            <button
                                onClick={handleView}
                                disabled={
                                    isAnyLoading ||
                                    !localFilters.labourType ||
                                    (localFilters.labourType === 'Contractor' && !localFilters.contractorCode) ||
                                    
                                    !localFilters.ccCode ||
                                    !localFilters.groupId ||
                                    !localFilters.labourId ||
                                    !localFilters.fromMonth ||
                                    !localFilters.year
                                }
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
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

            {/* Filters Section - Labour View */}
            {viewMode === 'labour' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {/* Labour Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Labour Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.labourType}
                                onChange={handleLabourTypeChange}
                                disabled={isAnyLoading}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Labour Type</option>
                                <option value="Own Labour">Own Labour</option>
                                <option value="Contractor">Contractor</option>
                            </select>
                        </div>

                        {/* Contractor - Only show if Contractor type is selected */}
                        {localFilters.labourType === 'Contractor' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Contractor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={localFilters.contractorCode}
                                    onChange={handleContractorChange}
                                    disabled={isAnyLoading || !localFilters.labourType}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <option value="">Select Contractor</option>
                                    <option value="SelectAll">Select All</option>
                                    {salaryContractors && salaryContractors.map((contractor, index) => (
                                        <option key={index} value={contractor.ContractorCode}>
                                            {contractor.ContractorName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}


                        {/* Cost Centre */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Cost Centre <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.ccCode}
                                onChange={handleCCCodeChange}
                                disabled={isAnyLoading || !localFilters.labourType || (localFilters.labourType === 'Contractor' && !localFilters.contractorCode)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Cost Centre</option>
                                <option value="SelectAll">Select All</option>
                                {labourCostCentres && labourCostCentres.map((cc, index) => (
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
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

                        {/* Labour Name - NO SELECT ALL in labour view */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Labour Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.labourId}
                                onChange={handleLabourChange}
                                disabled={isAnyLoading || !localFilters.groupId}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Labour</option>
                                {payrollEmployees && payrollEmployees.map((emp, index) => (
                                    <option key={index} value={emp.EmpRefno}>
                                        {emp.Name} ({emp.EmpRefno})
                                    </option>
                                ))}
                            </select>
                            {loading.salaryYears && localFilters.labourId && (
                                <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                                    <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                    Loading available years...
                                </div>
                            )}
                        </div>

                        {/* Year - ALWAYS show after labour is selected */}
                        {localFilters.labourId && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Year <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={localFilters.year}
                                    onChange={handleYearChange}
                                    disabled={isAnyLoading || loading.salaryYears || !localFilters.labourId}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                    <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                                        <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                        Loading available months...
                                    </div>
                                )}
                            </div>
                        )}

                        {/* From Month - ONLY show if specific year selected */}
                        {localFilters.year && localFilters.year !== 'SelectAll' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    From Month <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={localFilters.fromMonth}
                                    onChange={handleFromMonthChange}
                                    disabled={isAnyLoading || loading.salaryMonths || !salaryMonths || salaryMonths.length === 0}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

                        {/* To Month - ONLY show if specific year selected and from month is selected */}
                        {localFilters.year && localFilters.year !== 'SelectAll' && localFilters.fromMonth && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    To Month <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={localFilters.toMonth}
                                    onChange={handleToMonthChange}
                                    disabled={isAnyLoading || !localFilters.fromMonth}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <option value="">Select To Month</option>
                                    {salaryMonths && salaryMonths
                                        .filter((monthObj) => {
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

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex gap-3">
                            <button
                                onClick={handleView}
                                disabled={
                                    isAnyLoading ||
                                    !localFilters.labourType ||
                                    (localFilters.labourType === 'Contractor' && !localFilters.contractorCode) ||
                                    
                                    !localFilters.ccCode ||
                                    !localFilters.groupId ||
                                    !localFilters.labourId ||
                                    !localFilters.year ||
                                    (localFilters.year !== 'SelectAll' && (!localFilters.fromMonth || !localFilters.toMonth))
                                }
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
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
                    <LabourSummaryCards reportData={currentReportData} />
                )
            )}

            {/* Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {currentReportData?.Data ? (
                    <div className="overflow-x-auto">
                        {(() => {
                            const salaryData = currentReportData.Data.lstSalData;

                            console.log('📊 Labour Salary Data to display:', salaryData);
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
                                                {viewMode === 'labour' && (
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                        Payment Date
                                                    </th>
                                                )}
                                                {viewMode === 'costcenter' && (
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                        Labour Details
                                                    </th>
                                                )}
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                    Cost Centre
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                    Group
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                    Labour Type
                                                </th>
                                                {localFilters.labourType === 'Contractor' && (
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                        Contractor
                                                    </th>
                                                )}
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
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    {viewMode === 'labour' && (
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
                                                                    {record.Name || currentReportData.Data.EmployeeName || 'N/A'}
                                                                </div>
                                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                    ID: {record.LabourId}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                            {record.CurrentCCName || record.CurrentCC || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                            {record.GroupName}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={clsx(
                                                            'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                                                            record.LabourType === 'Own Labour'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                                        )}>
                                                            {record.LabourType}
                                                        </span>
                                                    </td>
                                                    {localFilters.labourType === 'Contractor' && (
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {record.ContractorName || 'N/A'}
                                                            </div>
                                                        </td>
                                                    )}
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
                                                            {record.TransactionRefno || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={() => handleViewPaySlip(record)}
                                                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2 mx-auto transition-all duration-300"
                                                            disabled={loading.labourPaySlipData}
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
                                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                Total Records: {salaryData.length}
                                            </span>
                                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                                {viewMode === 'costcenter'
                                                    ? `${getMonthName(localFilters.fromMonth)} ${localFilters.year} - Labour Salary Report`
                                                    : `${currentReportData.Data.EmployeeName || 'Labour'} - Salary Report`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-full p-4 mb-4">
                                            <Search className="h-12 w-12 text-blue-600 dark:text-blue-400" />
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
                                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-full p-4 mb-4">
                                        <Search className="h-12 w-12 text-blue-600 dark:text-blue-400" />
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
                                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-full p-4 mb-4">
                                        <RotateCcw className="h-12 w-12 text-blue-500 animate-spin" />
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
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="text-blue-800 dark:text-blue-200 text-sm">
                        <p className="font-semibold mb-1">Labour Salary Report Features:</p>
                        <p className="text-gray-600 dark:text-blue-200">
                            <strong>Labour Types:</strong> Choose between Own Labour or Contractor. For Contractor type, select specific contractor or all contractors.<br />
                            <strong>View by Cost Center:</strong> Select labour type, category, cost center, group, labour (with "Select All" option), payment month and year to view salary report for all labours in that cost center.<br />
                            <strong>View by Labour:</strong> Select labour type, category, cost center, group, specific labour (no "Select All" option), year (with "Select All" option for complete history), and month range to view detailed salary history for that labour.<br />
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
                        setSelectedLabourForPaySlip(null);
                    }}
                    paySlipData={labourPaySlipData}
                    loading={loading.labourPaySlipData}
                    labourData={selectedLabourForPaySlip}
                />
            )}
        </div>
    );
};

export default LabourSalaryReportPage;