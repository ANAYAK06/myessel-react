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
    Shield,
    HardHat
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Import slice actions and selectors
import {
    fetchPFESIPaidYears,
    fetchPfEsiPaidMonthsByYear,
    fetchPFESIPaidCC,
    fetchLBPaidPFData,
    fetchLBPaidESIData,
    setFilters,
    clearFilters,
    setReportType,
    setLabourType,
    setContractorCode,
    resetPFESIReportData,
    clearError,
    clearMonthsData,
    clearCostCentreData,
    selectPFESIYears,
    selectPFESIMonths,
    selectPFESICostCentres,
    selectLabourPFData,
    selectLabourESIData,
    selectLoading,
    selectErrors,
    selectFilters,
    selectIsAnyLoading,
    selectCurrentReportData,
    selectIsEPFReport
} from '../../slices/HrReportSlice/pfandesiReportSlice';

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

// Summary Cards Component for EPF Report
const EPFSummaryCards = ({ reportData }) => {
    if (!reportData || !reportData.Data) {
        return null;
    }

    const data = reportData.Data;
    const pfData = data.lstPaidPFData || [];

    const summary = {
        totalLabourers: pfData.length,
        totalWorkdays: data.TotalWorkdays || 0,
        totalGross: data.TotalGross || 0,
        totalEmpContribution: data.TotalPFEmpCont || 0,
        totalEmplrContribution: data.TotalPFEmplrCont || 0,
        totalAdmin: data.TotalPFAdmin || 0,
    };

    const cards = [
        {
            title: 'Total Labourers',
            value: summary.totalLabourers,
            icon: HardHat,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        },
        {
            title: 'Total Working Days',
            value: summary.totalWorkdays.toFixed(1),
            icon: Calendar,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
        },
        {
            title: 'Total Gross Amount',
            value: `₹${summary.totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Employee Contribution',
            value: `₹${summary.totalEmpContribution.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: Wallet,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        },
        {
            title: 'Employer Contribution',
            value: `₹${summary.totalEmplrContribution.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: CreditCard,
            color: 'from-pink-500 to-rose-600',
            bgColor: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20'
        },
        {
            title: 'Admin Charges',
            value: `₹${summary.totalAdmin.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: Shield,
            color: 'from-violet-500 to-purple-600',
            bgColor: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
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

// Summary Cards Component for ESI Report
const ESISummaryCards = ({ reportData }) => {
    if (!reportData || !reportData.Data) {
        return null;
    }

    const data = reportData.Data;
    const esiData = data.lstPaidEsiData || [];

    const summary = {
        totalLabourers: esiData.length,
        totalWorkdays: data.TotalWorkdays || 0,
        totalGross: data.TotalGross || 0,
        totalEmpContribution: data.TotalEsiEmpCont || 0,
        totalEmplrContribution: data.TotalEsiEmplrCont || 0,
    };

    const cards = [
        {
            title: 'Total Labourers',
            value: summary.totalLabourers,
            icon: HardHat,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        },
        {
            title: 'Total Working Days',
            value: summary.totalWorkdays.toFixed(1),
            icon: Calendar,
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
        },
        {
            title: 'Total Gross Amount',
            value: `₹${summary.totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        },
        {
            title: 'Employee Contribution',
            value: `₹${summary.totalEmpContribution.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: Wallet,
            color: 'from-orange-500 to-red-600',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
        },
        {
            title: 'Employer Contribution',
            value: `₹${summary.totalEmplrContribution.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: CreditCard,
            color: 'from-pink-500 to-rose-600',
            bgColor: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20'
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

const LabourPFESIReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const pfesiYears = useSelector(selectPFESIYears);
    const pfesiMonths = useSelector(selectPFESIMonths);
    const pfesiCostCentres = useSelector(selectPFESICostCentres);
    const labourPFData = useSelector(selectLabourPFData);
    const labourESIData = useSelector(selectLabourESIData);
    const loading = useSelector(selectLoading);
    const errors = useSelector(selectErrors);
    const filters = useSelector(selectFilters);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const currentReportData = useSelector(selectCurrentReportData);
    const isEPFReport = useSelector(selectIsEPFReport);

    // Local state for form inputs
    const [localFilters, setLocalFilters] = useState({
        reportType: 'EPF',
        selectedYear: '',
        selectedMonth: '',
        selectedCCCode: '',
        labourType: 'Own Labour',
        contractorCode: 'NA',
        employeeType: 'Labour'
    });

    // State for contractors list
    const [contractors, setContractors] = useState([]);
    const [loadingContractors, setLoadingContractors] = useState(false);

    // Fetch years on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await dispatch(fetchPFESIPaidYears({
                    reportType: 'EPF',
                    lType: 'Own Labour',
                    contraCode: 'NA',
                    employeeType: 'Labour'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching initial years:', error);
            }
        };

        fetchInitialData();
    }, [dispatch]);

    // Fetch contractors when labour type changes to Contractor
    useEffect(() => {
        const fetchContractors = async () => {
            if (localFilters.labourType === 'Contractor') {
                setLoadingContractors(true);
                try {
                    console.log('📋 Fetching contractors...');
                    const response = await axios.get(`${API_BASE_URL}/HR/GetSalaryContractors`, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log('✅ Contractors Response:', response.data);
                    setContractors(response.data?.Data || response.data || []);
                } catch (error) {
                    console.error('❌ Error fetching contractors:', error);
                    toast.error('Failed to fetch contractors');
                    setContractors([]);
                } finally {
                    setLoadingContractors(false);
                }
            }
        };

        fetchContractors();
    }, [localFilters.labourType]);

    // Sync local filters with Redux filters
    useEffect(() => {
        if (filters.reportType || filters.selectedYear || filters.selectedMonth || filters.selectedCCCode) {
            setLocalFilters(prev => ({
                ...prev,
                reportType: filters.reportType || 'EPF',
                selectedYear: filters.selectedYear || '',
                selectedMonth: filters.selectedMonth || '',
                selectedCCCode: filters.selectedCCCode || '',
                labourType: filters.labourType || 'Own Labour',
                contractorCode: filters.contractorCode || 'NA'
            }));
        }
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

    // Handle report type change
    const handleReportTypeChange = async (e) => {
        const newReportType = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            reportType: newReportType,
            selectedYear: '',
            selectedMonth: '',
            selectedCCCode: ''
        }));

        dispatch(setReportType(newReportType));
        dispatch(resetPFESIReportData());

        try {
            await dispatch(fetchPFESIPaidYears({
                reportType: newReportType,
                lType: localFilters.labourType,
                contraCode: localFilters.contractorCode,
                eType: 'Labour'
            })).unwrap();
        } catch (error) {
            console.error('❌ Error fetching years:', error);
        }
    };

    // Handle labour type change
    const handleLabourTypeChange = async (e) => {
        const newLabourType = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            labourType: newLabourType,
            contractorCode: newLabourType === 'Own Labour' ? 'NA' : '',
            selectedYear: '',
            selectedMonth: '',
            selectedCCCode: ''
        }));

        dispatch(setLabourType(newLabourType));
        dispatch(setContractorCode(newLabourType === 'Own Labour' ? 'NA' : ''));
        dispatch(resetPFESIReportData());

        try {
            await dispatch(fetchPFESIPaidYears({
                reportType: localFilters.reportType,
                lType: newLabourType,
                contraCode: newLabourType === 'Own Labour' ? 'NA' : '',
                eType: 'Labour'
            })).unwrap();
        } catch (error) {
            console.error('❌ Error fetching years:', error);
        }
    };

    // Handle contractor change
    const handleContractorChange = async (e) => {
        const contractorCode = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            contractorCode: contractorCode,
            selectedYear: '',
            selectedMonth: '',
            selectedCCCode: ''
        }));

        dispatch(setContractorCode(contractorCode));
        dispatch(resetPFESIReportData());

        if (contractorCode) {
            try {
                await dispatch(fetchPFESIPaidYears({
                    reportType: localFilters.reportType,
                    lType: localFilters.labourType,
                    contraCode: contractorCode,
                    eType: 'Labour'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching years:', error);
            }
        }
    };

    // Handle year change
    const handleYearChange = async (e) => {
        const year = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            selectedYear: year,
            selectedMonth: '',
            selectedCCCode: ''
        }));

        dispatch(clearMonthsData());

        if (year) {
            try {
                await dispatch(fetchPfEsiPaidMonthsByYear({
                    year: year,
                    reportType: localFilters.reportType,
                    lType: localFilters.labourType,
                    contraCode: localFilters.contractorCode,
                    eType: 'Labour'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching months:', error);
            }
        }
    };

    // Handle month change
    const handleMonthChange = async (e) => {
        const month = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            selectedMonth: month,
            selectedCCCode: ''
        }));

        dispatch(clearCostCentreData());

        if (month && localFilters.selectedYear) {
            try {
                await dispatch(fetchPFESIPaidCC({
                    month: month,
                    year: localFilters.selectedYear,
                    reportType: localFilters.reportType,
                    lType: localFilters.labourType,
                    contraCode: localFilters.contractorCode,
                    eType: 'Labour'
                })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching cost centres:', error);
            }
        }
    };

    // Handle cost centre change
    const handleCCCodeChange = (e) => {
        const ccCode = e.target.value;
        setLocalFilters(prev => ({
            ...prev,
            selectedCCCode: ccCode
        }));
    };

    // Handle view button click
    const handleView = async () => {
        // Validation
        if (!localFilters.reportType) {
            toast.warning('Please select Report Type');
            return;
        }

        if (!localFilters.labourType) {
            toast.warning('Please select Labour Type');
            return;
        }

        if (localFilters.labourType === 'Contractor' && !localFilters.contractorCode) {
            toast.warning('Please select Contractor');
            return;
        }

        if (!localFilters.selectedYear) {
            toast.warning('Please select Year');
            return;
        }

        if (!localFilters.selectedMonth) {
            toast.warning('Please select Month');
            return;
        }

        if (!localFilters.selectedCCCode) {
            toast.warning('Please select Cost Centre');
            return;
        }

        try {
            // Update Redux filters
            dispatch(setFilters(localFilters));

            // Prepare parameters for API call
            const params = {
                ReportType: localFilters.reportType,
                CCCode: localFilters.selectedCCCode,
                ContractorCode: localFilters.contractorCode,
                LabourType: localFilters.labourType,
                Month: localFilters.selectedMonth,
                Year: localFilters.selectedYear
            };

            console.log('📊 Fetching Labour PF/ESI report data with params:', params);

            // Call appropriate API based on report type
            if (localFilters.reportType === 'EPF') {
                await dispatch(fetchLBPaidPFData(params)).unwrap();
                toast.success('Labour PF report loaded successfully');
            } else {
                await dispatch(fetchLBPaidESIData(params)).unwrap();
                toast.success('Labour ESI report loaded successfully');
            }

        } catch (error) {
            console.error('❌ Error fetching report:', error);
            toast.error('Failed to fetch report. Please try again.');
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            reportType: 'EPF',
            selectedYear: '',
            selectedMonth: '',
            selectedCCCode: '',
            labourType: 'Own Labour',
            contractorCode: 'NA'
        });

        dispatch(clearFilters());
        dispatch(resetPFESIReportData());
        dispatch(setReportType('EPF'));
        dispatch(setLabourType('Own Labour'));
        dispatch(setContractorCode('NA'));

        // Refetch years for EPF with Own Labour
        dispatch(fetchPFESIPaidYears({
            reportType: 'EPF',
            lType: 'Own Labour',
            contraCode: 'NA',
            eType: 'Labour'
        }));
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            if (!currentReportData?.Data) {
                toast.warning('No data available to download');
                return;
            }

            const data = localFilters.reportType === 'EPF'
                ? currentReportData.Data.lstPaidPFData
                : currentReportData.Data.lstPaidEsiData;

            if (!data || data.length === 0) {
                toast.warning('No records available to download');
                return;
            }

            const monthName = currentReportData.Data.MonthName || localFilters.selectedMonth;
            const labourTypeStr = localFilters.labourType.replace(' ', '_');
            const filename = `Labour_${labourTypeStr}_${localFilters.reportType}_Report_${monthName}_${localFilters.selectedYear}`;

            downloadAsExcel(data, filename);
            toast.success('Excel file downloaded successfully');

        } catch (error) {
            console.error('❌ Excel Download Error:', error);
            toast.error('Excel download failed. Please try again.');
        }
    };

    // Get month name from month number
    const getMonthName = (monthNum) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[parseInt(monthNum) - 1] || monthNum;
    };

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <HardHat className="h-8 w-8 text-indigo-600" />
                            Labour {localFilters.reportType} Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            View and manage labour {localFilters.reportType === 'EPF' ? 'Provident Fund' : 'ESI'} contribution reports
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full transition-colors">
                            Labour Reports
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
                        <span>PF & ESI Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Labour {localFilters.reportType} Report</span>
                    </div>
                </nav>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {/* Report Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Report Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.reportType}
                            onChange={handleReportTypeChange}
                            disabled={isAnyLoading}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="EPF">Provident Fund (EPF)</option>
                            <option value="ESIC">ESI Corporation (ESIC)</option>
                        </select>
                    </div>

                    {/* Labour Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Labour Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.labourType}
                            onChange={handleLabourTypeChange}
                            disabled={isAnyLoading}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="Own Labour">Own Labour</option>
                            <option value="Contractor">Contractor</option>
                        </select>
                    </div>

                    {/* Contractor - Only show when Labour Type is Contractor */}
                    {localFilters.labourType === 'Contractor' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Contractor <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.contractorCode}
                                onChange={handleContractorChange}
                                disabled={isAnyLoading || loadingContractors}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Contractor</option>
                                {contractors && Array.isArray(contractors) && contractors.map((contractor, index) => {
                                    const contractorCode = contractor?.ContractorCode || contractor?.contractorCode || contractor;
                                    const contractorName = contractor?.ContractorName || contractor?.contractorName || contractorCode;
                                    return (
                                        <option key={index} value={contractorCode}>
                                            {contractorName}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}

                    {/* Year */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.selectedYear}
                            onChange={handleYearChange}
                            disabled={isAnyLoading || !pfesiYears || pfesiYears.length === 0}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Year</option>
                            {pfesiYears && Array.isArray(pfesiYears) && pfesiYears.map((yearObj, index) => {
                                let yearValue;
                                if (typeof yearObj === 'object' && yearObj !== null) {
                                    yearValue = yearObj.Year || yearObj.YearValue || yearObj.year;
                                } else {
                                    yearValue = yearObj;
                                }
                                return (
                                    <option key={index} value={yearValue}>
                                        {yearValue}
                                    </option>
                                );
                            })}
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
                            disabled={isAnyLoading || !localFilters.selectedYear || !pfesiMonths || pfesiMonths.length === 0}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Month</option>
                            {pfesiMonths && Array.isArray(pfesiMonths) && pfesiMonths.map((monthObj, index) => {
                                let monthValue, monthName;
                                if (typeof monthObj === 'object' && monthObj !== null) {
                                    monthValue = monthObj.MonthNo || monthObj.Month || monthObj.month;
                                    monthName = monthObj.MonthName || getMonthName(monthValue);
                                } else {
                                    monthValue = monthObj;
                                    monthName = getMonthName(monthValue);
                                }
                                return (
                                    <option key={index} value={monthValue}>
                                        {monthName}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Cost Centre */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Cost Centre <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFilters.selectedCCCode}
                            onChange={handleCCCodeChange}
                            disabled={isAnyLoading || !localFilters.selectedMonth || !pfesiCostCentres || pfesiCostCentres.length === 0}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Cost Centre</option>
                            <option value="0">All Cost Centres</option>
                            {pfesiCostCentres && Array.isArray(pfesiCostCentres) && pfesiCostCentres.map((ccObj, index) => {
                                let ccValue, ccDisplay;
                                if (typeof ccObj === 'object' && ccObj !== null) {
                                    ccValue = ccObj.CC_Code || ccObj.ccCode || ccObj.CC;
                                    ccDisplay = ccObj.CC_Name || ccObj.ccName || ccValue;
                                } else {
                                    ccValue = ccObj;
                                    ccDisplay = ccObj;
                                }
                                return (
                                    <option key={index} value={ccValue}>
                                        {ccDisplay}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-3">
                        <button
                            onClick={handleView}
                            disabled={isAnyLoading || !localFilters.reportType || !localFilters.labourType ||
                                (localFilters.labourType === 'Contractor' && !localFilters.contractorCode) ||
                                !localFilters.selectedYear || !localFilters.selectedMonth || !localFilters.selectedCCCode}
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

            {/* Summary Cards */}
            {currentReportData?.Data && (
                localFilters.reportType === 'EPF' ? (
                    <EPFSummaryCards reportData={currentReportData} />
                ) : (
                    <ESISummaryCards reportData={currentReportData} />
                )
            )}

            {/* Report Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {currentReportData?.Data ? (
                    <div className="overflow-x-auto">
                        {localFilters.reportType === 'EPF' ? (
                            /* EPF Table */
                            currentReportData.Data.lstPaidPFData && currentReportData.Data.lstPaidPFData.length > 0 ? (
                                <>
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                    #
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                    Labour Details
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Labour ID
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    UAN No
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Working Days
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    PF Gross
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Employee Cont.
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Employer Cont.
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Admin
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Transaction Ref
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {currentReportData.Data.lstPaidPFData.map((labour, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                            {labour.EmpRowno || index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {labour.Name}
                                                            </div>
                                                            <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                                                CC: {labour.CCCode}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {labour.SalaryType === 'M' ? 'Monthly' : 'Daily'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-xs text-gray-900 dark:text-white font-mono">
                                                            {labour.LabourId || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                                                            {labour.UANNo || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                            {labour.NoofWorkingDays ? parseFloat(labour.NoofWorkingDays).toFixed(1) : '0.0'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            ₹{labour.PFGrossamt ? parseFloat(labour.PFGrossamt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                            ₹{labour.EmployeeContAmt ? parseFloat(labour.EmployeeContAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                                                            ₹{labour.EmployerContAmt ? parseFloat(labour.EmployerContAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                            ₹{labour.Admin ? parseFloat(labour.Admin).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                                            {labour.PayRollRefno || 'N/A'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Footer with totals */}
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                Total Labourers: {currentReportData.Data.lstPaidPFData.length}
                                            </span>
                                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                                {currentReportData.Data.MonthName} {localFilters.selectedYear} - Labour ({localFilters.labourType}) EPF Report
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
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No EPF Data Found</h3>
                                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                            No EPF records available for the selected filters.
                                        </p>
                                    </div>
                                </div>
                            )
                        ) : (
                            /* ESI Table */
                            currentReportData.Data.lstPaidEsiData && currentReportData.Data.lstPaidEsiData.length > 0 ? (
                                <>
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-700">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                    #
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                    Labour Details
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Labour ID
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    ESI IP No
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Working Days
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    ESI Gross
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Employee Cont.
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                    Employer Cont.
                                                </th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                    Transaction Ref
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {currentReportData.Data.lstPaidEsiData.map((labour, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                            {labour.EmpRowno || index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {labour.Name}
                                                            </div>
                                                            <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                                                CC: {labour.CCCode}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {labour.SalaryType === 'M' ? 'Monthly' : 'Daily'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-xs text-gray-900 dark:text-white font-mono">
                                                            {labour.LabourId || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                                                            {labour.ESIIPNo || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                            {labour.NoofWorkingDays ? parseFloat(labour.NoofWorkingDays).toFixed(1) : '0.0'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            ₹{labour.ESIGorssAmount ? parseFloat(labour.ESIGorssAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                            ₹{labour.EmployeeContAmt ? parseFloat(labour.EmployeeContAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                                                            ₹{labour.EmployerContAmt ? parseFloat(labour.EmployerContAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                                            {labour.PayRollRefno || 'N/A'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Footer with totals */}
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                Total Labourers: {currentReportData.Data.lstPaidEsiData.length}
                                            </span>
                                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                                {currentReportData.Data.MonthName} {localFilters.selectedYear} - Labour ({localFilters.labourType}) ESI Report
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
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No ESI Data Found</h3>
                                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                            No ESI records available for the selected filters.
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
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
                                        Select report type, labour type, year, month, and cost centre, then click "View Report" to load data.
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
                                        Fetching {localFilters.reportType} data for the selected filters...
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
                        <p className="font-semibold mb-1">Labour PF & ESI Report Features:</p>
                        <p className="text-gray-600 dark:text-indigo-200">
                            1. <strong>Report Type:</strong> Switch between EPF (Provident Fund) and ESIC (ESI Corporation) reports<br />
                            2. <strong>Labour Type:</strong> Choose between Own Labour and Contractor labour<br />
                            3. <strong>Contractor Selection:</strong> When Contractor is selected, choose the specific contractor from the dropdown<br />
                            4. <strong>Year & Month Selection:</strong> Select the year and month for the report<br />
                            5. <strong>Cost Centre Filter:</strong> Select specific cost centre or "All Cost Centres" for comprehensive view<br />
                            6. <strong>Summary Statistics:</strong> View totals for labourers, working days, gross amounts, and contributions<br />
                            7. <strong>Detailed Records:</strong> See labour-wise breakdown with Labour ID, UAN/ESI IP numbers, and contribution amounts<br />
                            8. <strong>Export Options:</strong> Download the report as Excel or print for records
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

export default LabourPFESIReportPage;