import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import {
    Building2,
    HardHat,
    Eye,
    RotateCcw,
    Download,
    Printer,
    ChevronRight,
    RefreshCw,
    CircleDollarSign,
    AlertTriangle,
    Info,
    FileSpreadsheet,
    Users,
    Filter,
    Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';

import {
    fetchLBCMSYears,
    fetchLBCMSContractors,
    fetchLBCMSMonthsByYear,
    fetchCMSPaidLabour,
    fetchCMSPaidLabourByCC,
    fetchCMSPaidCCbyMonth,
    fetchCMSPayReportLBData,
    clearFilters,
    resetLBCMSPaymentData,
    clearError,
    clearMonthsData,
    clearYearsData,
    selectLBCMSYears,
    selectLBCMSMonths,
    selectLBCMSContractors,
    selectCMSPaidLabours,
    selectCMSPaidLaboursByCC,
    selectCMSPaidCostCentres,
    selectErrors,
    selectIsAnyLoading
} from '../../slices/HrReportSlice/labourCMSPaymentReportSlice';

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

// Summary Cards Component
const LabourSummaryCards = ({ labourList }) => {
    if (!labourList || labourList.length === 0) {
        return null;
    }

    const summary = {
        totalLabours: labourList.length,
        totalAmount: labourList.reduce((sum, rec) => sum + (parseFloat(rec.Amount) || 0), 0)
    };

    const cards = [
        {
            title: 'Total Labours',
            value: summary.totalLabours,
            icon: Users,
            color: 'from-indigo-500 to-purple-600',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
        },
        {
            title: 'Total Amount Paid',
            value: `₹${summary.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            icon: CircleDollarSign,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

const LabourCMSPaymentReportPage = () => {
    const dispatch = useDispatch();

    // Redux selectors
    const lbCmsYears = useSelector(selectLBCMSYears) || [];
    const lbCmsMonths = useSelector(selectLBCMSMonths) || [];
    const lbCmsContractors = useSelector(selectLBCMSContractors) || [];
    const rawPaidLabours = useSelector(selectCMSPaidLabours);
    const rawPaidLaboursByCC = useSelector(selectCMSPaidLaboursByCC);
    const rawPaidCostCentres = useSelector(selectCMSPaidCostCentres);
    const isAnyLoading = useSelector(selectIsAnyLoading);
    const errors = useSelector(selectErrors);

    const paidLabours = useMemo(() => {
        if (!rawPaidLabours) return [];
        if (rawPaidLabours.Data && Array.isArray(rawPaidLabours.Data)) return rawPaidLabours.Data;
        return Array.isArray(rawPaidLabours) ? rawPaidLabours : [];
    }, [rawPaidLabours]);

    const paidLaboursByCC = useMemo(() => {
        if (!rawPaidLaboursByCC) return [];
        if (rawPaidLaboursByCC.Data && Array.isArray(rawPaidLaboursByCC.Data)) return rawPaidLaboursByCC.Data;
        return Array.isArray(rawPaidLaboursByCC) ? rawPaidLaboursByCC : [];
    }, [rawPaidLaboursByCC]);

    const paidCostCentres = useMemo(() => {
        if (!rawPaidCostCentres) return [];
        if (rawPaidCostCentres.Data && Array.isArray(rawPaidCostCentres.Data)) return rawPaidCostCentres.Data;
        return Array.isArray(rawPaidCostCentres) ? rawPaidCostCentres : [];
    }, [rawPaidCostCentres]);

    // Local state
    const [viewMode, setViewMode] = useState('employee'); // 'employee', 'costcentre', or 'monthwise'
    const [localFilters, setLocalFilters] = useState({
        labourType: '',
        contractorCode: '',
        selectedYear: '',
        selectedMonth: '',
        selectedLabour: '',
        selectedCostCentre: '',
        selectAllLabours: false
    });

    const [availableLabours, setAvailableLabours] = useState([]);
    const [filteredLabours, setFilteredLabours] = useState([]);

    // Show error messages via toast
    useEffect(() => {
        Object.entries(errors).forEach(([key, error]) => {
            if (error && error !== null) {
                toast.error(`Error with ${key}: ${error}`);
                dispatch(clearError({ errorType: key }));
            }
        });
    }, [errors, dispatch]);

    // Update available labours when paidLabours changes (Employee view)
    useEffect(() => {
        if (viewMode === 'employee' && paidLabours.length > 0) {
            setAvailableLabours(paidLabours);
        }
    }, [paidLabours, viewMode]);

    // Update available labours when CC labours change (Cost Centre view)
    useEffect(() => {
        if (viewMode === 'costcentre' && paidLaboursByCC.length > 0) {
            setAvailableLabours(paidLaboursByCC);
        }
    }, [paidLaboursByCC, viewMode]);

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
            labourType,
            contractorCode: '',
            selectedYear: '',
            selectedMonth: '',
            selectedLabour: '',
            selectedCostCentre: '',
            selectAllLabours: false
        }));

        dispatch(clearYearsData());
        setAvailableLabours([]);
        setFilteredLabours([]);

        if (labourType === 'Contractor') {
            try {
                await dispatch(fetchLBCMSContractors()).unwrap();
            } catch (error) {
                console.error('❌ Error fetching contractors:', error);
            }
        } else if (labourType === 'Own Labour') {
            try {
                await dispatch(fetchLBCMSYears({ labourType, contractor: 'NA' })).unwrap();
            } catch (error) {
                console.error('❌ Error fetching years:', error);
            }
        }
    };

    // Handle contractor change
    const handleContractorChange = async (e) => {
        const contractorCode = e.target.value;

        setLocalFilters(prev => ({
            ...prev,
            contractorCode,
            selectedYear: '',
            selectedMonth: '',
            selectedLabour: '',
            selectedCostCentre: '',
            selectAllLabours: false
        }));

        dispatch(clearYearsData());
        setAvailableLabours([]);
        setFilteredLabours([]);

        if (contractorCode) {
            try {
                await dispatch(fetchLBCMSYears({ labourType: 'Contractor', contractor: contractorCode })).unwrap();
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
            selectedLabour: '',
            selectedCostCentre: '',
            selectAllLabours: false
        }));

        dispatch(clearMonthsData());
        setAvailableLabours([]);
        setFilteredLabours([]);

        if (year) {
            try {
                const params = {
                    year,
                    lType: localFilters.labourType,
                    contraCode: localFilters.labourType === 'Contractor' ? localFilters.contractorCode : 'NA'
                };
                await dispatch(fetchLBCMSMonthsByYear(params)).unwrap();
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
            selectedLabour: '',
            selectedCostCentre: '',
            selectAllLabours: false
        }));

        setAvailableLabours([]);
        setFilteredLabours([]);

        const contraCode = localFilters.labourType === 'Contractor' ? localFilters.contractorCode : 'NA';

        if (viewMode === 'employee' && month && localFilters.selectedYear) {
            try {
                const params = {
                    year: localFilters.selectedYear,
                    month,
                    lType: localFilters.labourType,
                    contraCode
                };
                await dispatch(fetchCMSPaidLabour(params)).unwrap();
            } catch (error) {
                console.error('❌ Error fetching labour list:', error);
                toast.error('Failed to fetch labour list');
            }
        }

        if (viewMode === 'costcentre' && month && localFilters.selectedYear) {
            try {
                const params = {
                    month,
                    year: localFilters.selectedYear,
                    lType: localFilters.labourType,
                    contraCode
                };
                await dispatch(fetchCMSPaidCCbyMonth(params)).unwrap();
            } catch (error) {
                console.error('❌ Error fetching cost centres:', error);
                toast.error('Failed to fetch cost centres');
            }
        }
    };

    // Handle labour selection
    const handleLabourChange = (e) => {
        const value = e.target.value;

        if (value === 'all') {
            setLocalFilters(prev => ({ ...prev, selectAllLabours: true, selectedLabour: '' }));
            setFilteredLabours([]);
        } else if (value) {
            setLocalFilters(prev => ({ ...prev, selectedLabour: value, selectAllLabours: false }));
            setFilteredLabours([]);
        } else {
            setLocalFilters(prev => ({ ...prev, selectedLabour: '', selectAllLabours: false }));
            setFilteredLabours([]);
        }
    };

    // Handle cost centre change
    const handleCostCentreChange = async (e) => {
        const ccCode = e.target.value;

        setLocalFilters(prev => ({
            ...prev,
            selectedCostCentre: ccCode,
            selectedLabour: '',
            selectAllLabours: false
        }));

        setAvailableLabours([]);
        setFilteredLabours([]);

        if (ccCode) {
            try {
                const params = {
                    year: localFilters.selectedYear,
                    month: localFilters.selectedMonth,
                    ccCode,
                    lType: localFilters.labourType,
                    contraCode: localFilters.labourType === 'Contractor' ? localFilters.contractorCode : 'NA'
                };
                await dispatch(fetchCMSPaidLabourByCC(params)).unwrap();
            } catch (error) {
                console.error('❌ Error fetching labour list by cost centre:', error);
                toast.error('Failed to fetch labour list');
            }
        }
    };

    const handleViewReport = async () => {
        if (!localFilters.labourType) {
            toast.warning('Please select Labour Type');
            return;
        }

        if (localFilters.labourType === 'Contractor' && !localFilters.contractorCode) {
            toast.warning('Please select Contractor');
            return;
        }

        if (!localFilters.selectedYear || !localFilters.selectedMonth) {
            toast.warning('Please select year and month');
            return;
        }

        const contraCode = localFilters.labourType === 'Contractor' ? localFilters.contractorCode : 'NA';

        try {
            let params = {};

            if (viewMode === 'employee') {
                if (!localFilters.selectAllLabours && !localFilters.selectedLabour) {
                    toast.warning('Please select a labour or Select All');
                    return;
                }

                params = {
                    year: localFilters.selectedYear,
                    month: localFilters.selectedMonth,
                    labourId: localFilters.selectAllLabours ? '' : localFilters.selectedLabour,
                    ccCode: '0',
                    lType: localFilters.labourType,
                    contraCode
                };
            } else if (viewMode === 'costcentre') {
                if (!localFilters.selectedCostCentre) {
                    toast.warning('Please select a cost centre');
                    return;
                }

                if (!localFilters.selectAllLabours && !localFilters.selectedLabour) {
                    toast.warning('Please select a labour or Select All');
                    return;
                }

                params = {
                    year: localFilters.selectedYear,
                    month: localFilters.selectedMonth,
                    ccCode: localFilters.selectedCostCentre,
                    labourId: localFilters.selectAllLabours ? '' : localFilters.selectedLabour,
                    lType: localFilters.labourType,
                    contraCode
                };
            } else if (viewMode === 'monthwise') {
                params = {
                    year: localFilters.selectedYear,
                    month: localFilters.selectedMonth,
                    labourId: '',
                    ccCode: '0',
                    lType: localFilters.labourType,
                    contraCode
                };
            }

            const result = await dispatch(fetchCMSPayReportLBData(params)).unwrap();

            const data = result?.Data || result || [];
            const dataArray = Array.isArray(data) ? data : [];

            if (dataArray.length === 0) {
                toast.error('No payment data found for the selected criteria');
                setFilteredLabours([]);
                return;
            }

            setFilteredLabours(dataArray);

            const successMessage = viewMode === 'employee'
                ? `Displaying ${dataArray.length} labour(s) with payment details`
                : viewMode === 'costcentre'
                    ? `Displaying ${dataArray.length} labour(s) from ${localFilters.selectedCostCentre}`
                    : `Displaying ${dataArray.length} labour(s) for ${localFilters.selectedMonth} ${localFilters.selectedYear}`;

            toast.success(successMessage);

        } catch (error) {
            console.error('❌ Error fetching payment data:', error);
            toast.error('Failed to fetch payment data. Please try again.');
            setFilteredLabours([]);
        }
    };

    // Handle reset
    const handleReset = () => {
        setLocalFilters({
            labourType: '',
            contractorCode: '',
            selectedYear: '',
            selectedMonth: '',
            selectedLabour: '',
            selectedCostCentre: '',
            selectAllLabours: false
        });

        setAvailableLabours([]);
        setFilteredLabours([]);
        dispatch(clearFilters());
        dispatch(resetLBCMSPaymentData());
    };

    // Handle Excel download
    const handleExcelDownload = () => {
        try {
            if (filteredLabours.length === 0) {
                toast.warning('No data available to download');
                return;
            }

            const data = filteredLabours.map(rec => ({
                'Labour ID': rec.LabourId,
                'Labour Name': rec.EmpName,
                'Cost Center Code': rec.CCCode || '',
                'Cost Center Name': rec.CCName || '',
                'Bank Name': rec.Bank || '',
                'Account Number': rec.BankAccountNo || '',
                'IFSC Code': rec.IFSCCode || '',
                'Amount': rec.Amount || 0,
                'CMS Transaction No': rec.CMSTransactionNo || '',
                'Payroll Ref No': rec.PayrollRefno || '',
                'CMS Consolidate No': rec.CMSConsolidateNo || '',
                'Payroll Date': rec.PayRollFortheDate || rec.PayRollDate || '',
                'Payment Date': rec.PaymentDate || '',
                'PO No': rec.LabourPONo || ''
            }));

            const viewModeText = viewMode === 'employee'
                ? 'Labour_View'
                : viewMode === 'costcentre'
                    ? `CostCentre_${localFilters.selectedCostCentre}`
                    : 'MonthWise';

            const filename = `Labour_CMS_Payment_Report_${viewModeText}_${localFilters.selectedMonth}_${localFilters.selectedYear}`;

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
                            <HardHat className="h-8 w-8 text-blue-600" />
                            Labour CMS Payment Report
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Labour salary paid through Bank Report - View payment details by labour, cost centre, or month
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
                        <span>Payment Reports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 dark:text-white">Labour CMS Payment Report</span>
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
                                ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        )}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Users className={clsx('h-6 w-6', viewMode === 'employee' ? 'text-blue-600' : 'text-gray-500')} />
                            <div className="text-left">
                                <div className={clsx('font-semibold', viewMode === 'employee' ? 'text-blue-900 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300')}>
                                    Labours
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Year → Month → Labour
                                </div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleViewModeChange('costcentre')}
                        className={clsx(
                            'px-6 py-4 rounded-lg border-2 transition-all duration-300',
                            viewMode === 'costcentre'
                                ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        )}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Building2 className={clsx('h-6 w-6', viewMode === 'costcentre' ? 'text-blue-600' : 'text-gray-500')} />
                            <div className="text-left">
                                <div className={clsx('font-semibold', viewMode === 'costcentre' ? 'text-blue-900 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300')}>
                                    Cost Center Wise
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Year → Month → CC → Labour
                                </div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleViewModeChange('monthwise')}
                        className={clsx(
                            'px-6 py-4 rounded-lg border-2 transition-all duration-300',
                            viewMode === 'monthwise'
                                ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        )}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <Calendar className={clsx('h-6 w-6', viewMode === 'monthwise' ? 'text-blue-600' : 'text-gray-500')} />
                            <div className="text-left">
                                <div className={clsx('font-semibold', viewMode === 'monthwise' ? 'text-blue-900 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300')}>
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
                    <Filter className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                </div>

                <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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

                    {/* Contractor - Only for Contractor type */}
                    {localFilters.labourType === 'Contractor' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Contractor <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.contractorCode}
                                onChange={handleContractorChange}
                                disabled={isAnyLoading}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Contractor</option>
                                {lbCmsContractors.map((c, index) => (
                                    <option key={index} value={c.Contractorcode || c.ContractorCode}>
                                        {c.ContractorName}
                                    </option>
                                ))}
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
                            disabled={
                                isAnyLoading ||
                                !localFilters.labourType ||
                                (localFilters.labourType === 'Contractor' && !localFilters.contractorCode)
                            }
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Year</option>
                            {Array.isArray(lbCmsYears) && lbCmsYears.map((year, index) => (
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <option value="">Select Month</option>
                            {Array.isArray(lbCmsMonths) && lbCmsMonths.map((month, index) => (
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
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Cost Centre</option>
                                {paidCostCentres.map((cc, index) => (
                                    <option key={index} value={cc.CC_Code || cc.CCCode}>
                                        {cc.CC_Code || cc.CCCode} - {cc.CC_Name || cc.CCName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Labour - For Employee and Cost Centre Views */}
                    {(viewMode === 'employee' || viewMode === 'costcentre') && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Labour <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={localFilters.selectAllLabours ? 'all' : localFilters.selectedLabour}
                                onChange={handleLabourChange}
                                disabled={
                                    isAnyLoading ||
                                    !localFilters.selectedMonth ||
                                    (viewMode === 'costcentre' && !localFilters.selectedCostCentre) ||
                                    availableLabours.length === 0
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">Select Labour</option>
                                <option value="all">Select All Labours</option>
                                {availableLabours.map((lb, index) => (
                                    <option key={index} value={lb.EmpRefNo}>
                                        {lb.EmpRefNo} - {lb.EmpName}
                                    </option>
                                ))}
                            </select>
                            {availableLabours.length > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {availableLabours.length} labours available
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
                                !localFilters.labourType ||
                                (localFilters.labourType === 'Contractor' && !localFilters.contractorCode) ||
                                !localFilters.selectedYear ||
                                !localFilters.selectedMonth ||
                                (viewMode === 'employee' && !localFilters.selectAllLabours && !localFilters.selectedLabour) ||
                                (viewMode === 'costcentre' && (!localFilters.selectedCostCentre || (!localFilters.selectAllLabours && !localFilters.selectedLabour)))
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

                    {filteredLabours && filteredLabours.length > 0 && (
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

            {/* Summary Cards */}
            {filteredLabours && filteredLabours.length > 0 && (
                <LabourSummaryCards labourList={filteredLabours} />
            )}

            {/* Report Display Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                {filteredLabours && filteredLabours.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-blue-600 to-cyan-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Labour Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Cost Center</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Bank Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Info</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Dates</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredLabours.map((rec, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {rec.EmpName}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    ID: {rec.LabourId}
                                                </div>
                                                {rec.LabourPONo && (
                                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                        PO: {rec.LabourPONo}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {rec.CCCode || 'N/A'}
                                                </div>
                                                {rec.CCName && (
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {rec.CCName}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                    {rec.Bank || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    A/C: {rec.BankAccountNo || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    IFSC: {rec.IFSCCode || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    CMS Trans: {rec.CMSTransactionNo || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    Payroll: {rec.PayrollRefno || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    Consolidate: {rec.CMSConsolidateNo || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                ₹{(parseFloat(rec.Amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    Payroll: {rec.PayRollFortheDate || rec.PayRollDate || 'N/A'}
                                                </div>
                                                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                    Payment: {rec.PaymentDate || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    Total Labours: {filteredLabours.length}
                                </span>
                                <div className="flex flex-col items-end">
                                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                        {localFilters.selectedMonth} {localFilters.selectedYear} - {localFilters.labourType} {viewMode === 'costcentre' && `(${localFilters.selectedCostCentre})`}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Total Amount: ₹{filteredLabours.reduce((sum, rec) => sum + (parseFloat(rec.Amount) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isAnyLoading && (!filteredLabours || filteredLabours.length === 0) && (
                    <div className="p-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-full p-4 mb-4">
                                <FileSpreadsheet className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Payment Data Available</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                {viewMode === 'employee' && 'Select labour type, year, month, and labour to view payment details.'}
                                {viewMode === 'costcentre' && 'Select labour type, year, month, cost centre, and labour to view payment details.'}
                                {viewMode === 'monthwise' && 'Select labour type, year and month, then click "View Report" to view all labour payments.'}
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Loading Data</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Fetching labour payment information...
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Information Note */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="text-blue-800 dark:text-blue-200 text-sm">
                        <p className="font-semibold mb-1">Labour CMS Payment Report Features:</p>
                        <p className="text-gray-600 dark:text-blue-200">
                            <strong>Labours:</strong> Select labour type → year → month → labour (or Select All) to view individual payment details.<br />
                            <strong>Cost Center Wise:</strong> Select labour type → year → month → cost centre → labour (or Select All) to view department-wise payments.<br />
                            <strong>Month Wise:</strong> Select labour type → year → month to view cost centre summary for the entire month.<br />
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

export default LabourCMSPaymentReportPage;
