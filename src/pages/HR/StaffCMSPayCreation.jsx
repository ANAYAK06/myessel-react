import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    fetchCMSYears,
    fetchCMSMonthsByYear,
    fetchCCForCMSPayment,
    fetchGroupForCMSPay,
    fetchConsolidateNoForCMSPay,
    fetchEmpForCMSData,
    saveCMSEmployeesData,
    setSelectedYear,
    setSelectedMonth,
    setSelectedLType,
    setSelectedContraCode,
    setSelectedEType,
    setSelectedCCCodes,
    setSelectedGroups,
    setSelectedConsolidateNos,
    resetCMSPayData,
    clearSaveResult,
    selectCMSYearsArray,
    selectCMSMonthsArray,
    selectCostCentersArray,
    selectGroupsArray,
    selectConsolidateNumbersArray,
    selectEmployeesData,
    selectSaveResult,
    selectCMSYearsLoading,
    selectCMSMonthsLoading,
    selectCostCentersLoading,
    selectGroupsLoading,
    selectConsolidateNumbersLoading,
    selectEmployeesDataLoading,
    selectSaveCMSDataLoading,
    selectSelectedYear,
    selectSelectedMonth,
    selectSelectedCCCodes,
    selectSelectedGroups,
    selectSelectedConsolidateNos,
    selectCMSPaySummary,
    selectFilterSelections,
} from '../../slices/HRSlice/staffCMSPayCreationSlice';
import CustomDatePicker from '../../components/CustomDatePicker';
import {
    Calendar, Building, Users, FileText, IndianRupee,
    Loader2, Save, RefreshCw, ChevronDown, ChevronUp,
    User, Mail, Phone, Home, MapPin, CheckCircle,
    XCircle, Filter, Search, Download, Banknote,
    Package, TrendingUp, AlertCircle, RotateCcw
} from 'lucide-react';

const StaffCMSPayCreation = () => {
    const dispatch = useDispatch();

    // Auth State
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;
    const userName = userData?.userName || userData?.UserName || 'User';

    // Redux State - Data
    const cmsYears = useSelector(selectCMSYearsArray);
    const cmsMonths = useSelector(selectCMSMonthsArray);
    const costCenters = useSelector(selectCostCentersArray);
    const groups = useSelector(selectGroupsArray);
    const consolidateNumbers = useSelector(selectConsolidateNumbersArray);
    const employeesData = useSelector(selectEmployeesData);
    const saveResult = useSelector(selectSaveResult);

    // Redux State - Loading
    const cmsYearsLoading = useSelector(selectCMSYearsLoading);
    const cmsMonthsLoading = useSelector(selectCMSMonthsLoading);
    const costCentersLoading = useSelector(selectCostCentersLoading);
    const groupsLoading = useSelector(selectGroupsLoading);
    const consolidateNumbersLoading = useSelector(selectConsolidateNumbersLoading);
    const employeesDataLoading = useSelector(selectEmployeesDataLoading);
    const saveCMSDataLoading = useSelector(selectSaveCMSDataLoading);

    // Redux State - Selections
    const selectedYear = useSelector(selectSelectedYear);
    const selectedMonth = useSelector(selectSelectedMonth);
    const selectedCCCodes = useSelector(selectSelectedCCCodes);
    const selectedGroups = useSelector(selectSelectedGroups);
    const selectedConsolidateNos = useSelector(selectSelectedConsolidateNos);

    // Redux State - Summary
    const cmsPaySummary = useSelector(selectCMSPaySummary);
    const filterSelections = useSelector(selectFilterSelections);

    // Local State
    const [showFilters, setShowFilters] = useState(true);
    const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date());
    const [transactionRefNo, setTransactionRefNo] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // NEW: Temporary frontend data toggle
    const [useFrontendData, setUseFrontendData] = useState(true);

    // NEW: Generate frontend years (current year and previous year)
    const getFrontendYears = () => {
        const currentYear = new Date().getFullYear();
        return [
            { Year: currentYear },
            { Year: currentYear - 1 }
        ];
    };

    // NEW: Generate frontend months (all 12 months)
    const getFrontendMonths = () => {
        return [
            { Month: '1', MonthName: 'January' },
            { Month: '2', MonthName: 'February' },
            { Month: '3', MonthName: 'March' },
            { Month: '4', MonthName: 'April' },
            { Month: '5', MonthName: 'May' },
            { Month: '6', MonthName: 'June' },
            { Month: '7', MonthName: 'July' },
            { Month: '8', MonthName: 'August' },
            { Month: '9', MonthName: 'September' },
            { Month: '10', MonthName: 'October' },
            { Month: '11', MonthName: 'November' },
            { Month: '12', MonthName: 'December' }
        ];
    };

    // NEW: Determine which years to display
    const displayYears = useFrontendData ? getFrontendYears() : cmsYears;

    // NEW: Determine which months to display
    const displayMonths = useFrontendData ? getFrontendMonths() : cmsMonths;

    // Initial data load
    useEffect(() => {
        console.log('🎯 StaffCMSPayCreation Component Mounted');
        console.log('🎯 User Data:', userData);
        console.log('🎯 Role ID:', roleId, 'UID:', uid);

        // Only fetch from API if not using frontend data
        if (!useFrontendData) {
            dispatch(fetchCMSYears());
        }

        return () => {
            console.log('🔄 Component Unmounting - Resetting State');
            dispatch(resetCMSPayData());
        };
    }, [dispatch, roleId, uid, userData, useFrontendData]);

    // 🆕 FEATURE 1: Complete Reset Function - Resets everything from Year onwards
    const handleCompleteReset = () => {
        console.log('🔄 Complete Reset Triggered');

        // Reset all Redux selections
        dispatch(setSelectedYear(''));
        dispatch(setSelectedMonth(''));
        dispatch(setSelectedCCCodes([]));
        dispatch(setSelectedGroups([]));
        dispatch(setSelectedConsolidateNos([]));

        // Reset local state
        setSelectedEmployees([]);
        setSelectAll(false);
        setSearchQuery('');
        setPaymentDate(new Date());
        setExpandedEmployeeId(null);

        // Clear save result
        dispatch(clearSaveResult());

        toast.info('All filters reset successfully');
    };

    // 🆕 FEATURE 2: Partial Reset Function - Resets only Groups and Consolidate Numbers (keeps Year, Month, CC)
    const handlePartialReset = () => {
        console.log('🔄 Partial Reset Triggered - Keeping Year, Month, and Cost Centers');

        // Reset only Groups and Consolidate Numbers
        dispatch(setSelectedGroups([]));
        dispatch(setSelectedConsolidateNos([]));

        // Reset employee selections
        setSelectedEmployees([]);
        setSelectAll(false);
        setSearchQuery('');
        setExpandedEmployeeId(null);

        // Clear save result
        dispatch(clearSaveResult());
    };

    // Handle Year Selection
    const handleYearChange = (year) => {
        console.log('📅 Year Selected:', year);
        dispatch(setSelectedYear(year));

        // Only fetch months from API if not using frontend data
        if (year && !useFrontendData) {
            dispatch(fetchCMSMonthsByYear({
                year: year,
                lType: '',
                contraCode: '',
                eType: 'Staff'
            }));
        }
    };

    // Handle Month Selection
    const handleMonthChange = (month) => {
        console.log('📆 Month Selected:', month);
        dispatch(setSelectedMonth(month));

        if (selectedYear && month) {
            // Fetch cost centers for selected year and month
            dispatch(fetchCCForCMSPayment({
                year: selectedYear,
                month: month
            }));
        }
    };

    // Handle Cost Center Selection
    const handleCCSelection = (ccCode) => {
        console.log('🏢 Cost Center Selected:', ccCode);

        let updatedCCCodes;
        if (selectedCCCodes.includes(ccCode)) {
            updatedCCCodes = selectedCCCodes.filter(code => code !== ccCode);
        } else {
            updatedCCCodes = [...selectedCCCodes, ccCode];
        }

        dispatch(setSelectedCCCodes(updatedCCCodes));

        // Fetch groups if we have selections
        if (updatedCCCodes.length > 0 && selectedYear && selectedMonth) {
            console.log('🔄 Fetching Groups with payload:', {
                Year: selectedYear,
                EffectiveMonth: selectedMonth,
                SelectedCC: updatedCCCodes
            });

            dispatch(fetchGroupForCMSPay({
                year: selectedYear,
                month: selectedMonth,
                ccCodes: updatedCCCodes  // Send as array
            }));
        }
    };

    // Handle Group Selection
    const handleGroupSelection = (groupId) => {
        console.log('👥 Group Selected:', groupId);

        let updatedGroups;
        if (selectedGroups.includes(groupId)) {
            updatedGroups = selectedGroups.filter(id => id !== groupId);
        } else {
            updatedGroups = [...selectedGroups, groupId];
        }

        dispatch(setSelectedGroups(updatedGroups));

        // Fetch consolidate numbers if we have selections
        if (updatedGroups.length > 0 && selectedCCCodes.length > 0 && selectedYear && selectedMonth) {
            console.log('🔄 Fetching Consolidate Numbers with payload:', {
                Year: selectedYear,
                EffectiveMonth: selectedMonth,
                SelectedCC: selectedCCCodes,
                SelectedGroup: updatedGroups
            });

            dispatch(fetchConsolidateNoForCMSPay({
                year: selectedYear,
                month: selectedMonth,
                ccCodes: selectedCCCodes,  // Send as array
                groups: updatedGroups  // Send as array
            }));
        }
    };

    // Handle Consolidate Number Selection
    const handleConsolidateNoSelection = (consolidateNo) => {
        console.log('📋 Consolidate Number Selected:', consolidateNo);

        let updatedConsolidateNos;
        if (selectedConsolidateNos.includes(consolidateNo)) {
            updatedConsolidateNos = selectedConsolidateNos.filter(no => no !== consolidateNo);
        } else {
            updatedConsolidateNos = [...selectedConsolidateNos, consolidateNo];
        }

        dispatch(setSelectedConsolidateNos(updatedConsolidateNos));
    };

    // Handle View Employees
    const handleViewEmployees = () => {
        if (!selectedYear || !selectedMonth || selectedCCCodes.length === 0 ||
            selectedGroups.length === 0 || selectedConsolidateNos.length === 0) {
            toast.error('Please select Year, Month, Cost Centers, Groups, and Consolidate Numbers');
            return;
        }

        console.log('👁️ Fetching Employees Data with payload:', {
            Year: selectedYear,
            EffectiveMonth: selectedMonth,
            SelectedCC: selectedCCCodes,
            SelectedConsolidateNo: selectedConsolidateNos,
            SelectedGroup: selectedGroups
        });

        dispatch(fetchEmpForCMSData({
            year: selectedYear,
            month: selectedMonth,
            ccCodes: selectedCCCodes,  // Send as array
            consolidateNos: selectedConsolidateNos,  // Send as array
            groups: selectedGroups  // Send as array
        }));
    };

    // Get employees list from API response
    const employeesList = employeesData?.CMSReportData || [];

    // Handle Select All
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(employeesList.map(emp => emp.Emprefno));
        }
        setSelectAll(!selectAll);
    };

    // Handle Individual Employee Selection
    const handleEmployeeSelection = (empRefNo) => {
        if (selectedEmployees.includes(empRefNo)) {
            setSelectedEmployees(selectedEmployees.filter(id => id !== empRefNo));
        } else {
            setSelectedEmployees([...selectedEmployees, empRefNo]);
        }
    };

    // Check if employee is selected
    useEffect(() => {
        if (employeesList.length > 0 && selectedEmployees.length === employeesList.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedEmployees, employeesList]);

    // Handle Save CMS Payment - FIXED TO USE PIPE DELIMITERS
    const handleSaveCMSPayment = async () => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }

        if (!paymentDate) {
            toast.error('Please select payment date');
            return;
        }

        try {
            const selectedEmpData = employeesList.filter(emp =>
                selectedEmployees.includes(emp.Emprefno)
            );

            // ✅ FIX: Use PIPE delimiters and add trailing pipe
            const empRefNos = selectedEmpData.map(emp => emp.Emprefno).join('|') + '|';

            const consolidateNos = selectedEmpData.map(emp => {
                const parts = emp.CCCode?.split('$');
                return parts && parts.length >= 3 ? parts[2] : '0';
            }).join('|') + '|';  // ✅ Add trailing pipe

            const ccCodes = selectedEmpData.map(emp => {
                const parts = emp.CCCode?.split('$');
                return parts && parts.length >= 1 ? parts[0] : '';
            }).join('|') + '|';  // ✅ Add trailing pipe

            const netAmts = selectedEmpData.map(emp => emp.BalanceNetValue).join('|') + '|';  // ✅ Add trailing pipe

            const payrollTranNo = selectedEmpData[0]?.TransactionRefno || transactionRefNo;

            console.log('💾 Saving CMS Payment Data with PIPE delimiters:', {
                year: selectedYear,
                month: selectedMonth,
                empRefNos,           // Now: "DMS00113|DMS00114|"
                consolidateNos,      // Now: "14|15|"
                ccCodes,             // Now: "CC-143|CC-144|"
                netAmts,             // Now: "23538|24500|"
                payrollTranNo,
                roleId,
                createdBy: userName,
                payDate: paymentDate
            });

            const result = await dispatch(saveCMSEmployeesData({
                year: selectedYear,
                month: selectedMonth,
                empRefNos: empRefNos,
                consolidateNos: consolidateNos,
                ccCodes: ccCodes,
                netAmts: netAmts,
                payrollTranNo: payrollTranNo,
                roleId: roleId,
                createdBy: userName,
                payDate: paymentDate
            })).unwrap();

            console.log('✅ Save Result:', result);

            const responseStr = typeof result === 'string'
                ? result
                : (result?.Data || result?.Message || '');

            const successMessage = responseStr.split('$')[0];

            if (successMessage === 'Submited') {
                toast.success('CMS Payment saved successfully! Refreshing data...');
                handlePartialReset();

                if (selectedYear && selectedMonth && selectedCCCodes.length > 0) {
                    dispatch(fetchGroupForCMSPay({
                        year: selectedYear,
                        month: selectedMonth,
                        ccCodes: selectedCCCodes
                    }));
                }
            } else {
                toast.error(responseStr || 'Failed to save CMS Payment');
            }

        } catch (error) {
            console.error('❌ Error saving CMS payment:', error);
            const errorMessage = typeof error === 'string'
                ? error
                : (error?.message || 'Failed to save CMS payment');
            toast.error(errorMessage);
        }
    };

    // Handle Save Result
    useEffect(() => {
        if (saveResult) {
            console.log('💾 Save Result in state:', saveResult);
        }
    }, [saveResult]);

    // Filter employees based on search
    const filteredEmployees = employeesList.filter(emp => {
        const searchLower = searchQuery.toLowerCase();
        return (
            emp.BeneficiaryName?.toLowerCase().includes(searchLower) ||
            emp.Emprefno?.toLowerCase().includes(searchLower) ||
            emp.CCCode?.toLowerCase().includes(searchLower) ||
            emp.BeneficiaryAcNo?.toLowerCase().includes(searchLower)
        );
    });

    // Calculate totals
    const totalSelectedAmount = employeesList
        .filter(emp => selectedEmployees.includes(emp.Emprefno))
        .reduce((sum, emp) => sum + (emp.BalanceNetValue || 0), 0);

    const totalEmployeesAmount = employeesList
        .reduce((sum, emp) => sum + (emp.BalanceNetValue || 0), 0);

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-2xl shadow-xl p-8 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Banknote className="h-10 w-10" />
                            <div>
                                <h1 className="text-3xl font-bold">Staff CMS Payment Creation</h1>
                                <p className="text-indigo-100 dark:text-indigo-200 text-lg mt-1">
                                    Create and manage CMS payments for staff members
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* NEW: Toggle for frontend data */}
                            <label className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl cursor-pointer transition-all">
                                <input
                                    type="checkbox"
                                    checked={useFrontendData}
                                    onChange={(e) => setUseFrontendData(e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm font-semibold">Use Frontend Data</span>
                            </label>
                            {/* 🆕 COMPLETE RESET BUTTON */}
                            <button
                                onClick={handleCompleteReset}
                                className="flex items-center gap-2 p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                                title="Reset All Filters"
                            >
                                <RotateCcw className="h-5 w-5" />
                                <span className="text-sm font-semibold hidden sm:inline">Reset All</span>
                            </button>
                            <button
                                onClick={() => dispatch(fetchCMSYears())}
                                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                                title="Refresh"
                                disabled={useFrontendData}
                            >
                                <RefreshCw className={`h-5 w-5 ${cmsYearsLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Users className="h-8 w-8" />
                                <div>
                                    <p className="text-sm text-indigo-100 dark:text-indigo-200">Total Employees</p>
                                    <p className="text-2xl font-bold">{employeesList.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-8 w-8" />
                                <div>
                                    <p className="text-sm text-indigo-100 dark:text-indigo-200">Selected</p>
                                    <p className="text-2xl font-bold">{selectedEmployees.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <IndianRupee className="h-8 w-8" />
                                <div>
                                    <p className="text-sm text-indigo-100 dark:text-indigo-200">Total Amount</p>
                                    <p className="text-2xl font-bold">₹{formatCurrency(totalEmployeesAmount)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-8 w-8" />
                                <div>
                                    <p className="text-sm text-indigo-100 dark:text-indigo-200">Selected Amount</p>
                                    <p className="text-2xl font-bold">₹{formatCurrency(totalSelectedAmount)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Filters Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Filter className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                Filters & Selection
                                {/* NEW: Show indicator if using frontend data */}
                                {useFrontendData && (
                                    <span className="ml-2 px-3 py-1 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full border border-amber-200 dark:border-amber-700">
                                        Frontend Data Mode
                                    </span>
                                )}
                            </h2>
                            {showFilters ? (
                                <ChevronUp className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <ChevronDown className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="p-8 space-y-6">
                            {/* Year and Month Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Year */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2  items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        Select Year <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedYear || ''}
                                        onChange={(e) => handleYearChange(e.target.value)}
                                        disabled={!useFrontendData && cmsYearsLoading}
                                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">
                                            {!useFrontendData && cmsYearsLoading ? 'Loading years...' : 'Select Year'}
                                        </option>
                                        {displayYears.map((year) => (
                                            <option key={year.Year} value={year.Year}>
                                                {year.Year}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Month */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 items-center gap-2">
                                        <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        Select Month <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedMonth || ''}
                                        onChange={(e) => handleMonthChange(e.target.value)}
                                        disabled={!selectedYear || (!useFrontendData && cmsMonthsLoading)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {!useFrontendData && cmsMonthsLoading ? 'Loading months...' : 'Select Month'}
                                        </option>
                                        {displayMonths.map((month) => (
                                            <option key={month.Month} value={month.Month}>
                                                {month.MonthName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Cost Centers Selection */}
                            {selectedYear && selectedMonth && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3  items-center gap-2">
                                        <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        Select Cost Centers <span className="text-red-500">*</span>
                                    </label>
                                    {costCentersLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 animate-spin mr-2" />
                                            <span className="text-gray-600 dark:text-gray-400">Loading cost centers...</span>
                                        </div>
                                    ) : costCenters.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-gray-500 dark:text-gray-400">No cost centers available</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                            {costCenters.map((cc) => (
                                                <label
                                                    key={cc.CCCode}
                                                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-all"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCCCodes.includes(cc.CC_Code)}
                                                        onChange={() => handleCCSelection(cc.CC_Code)}
                                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">{cc.CC_Code}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{cc.CC_Name}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Groups Selection */}
                            {selectedCCCodes.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3  items-center gap-2">
                                        <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        Select Groups <span className="text-red-500">*</span>
                                    </label>
                                    {groupsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 animate-spin mr-2" />
                                            <span className="text-gray-600 dark:text-gray-400">Loading groups...</span>
                                        </div>
                                    ) : groups.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-gray-500 dark:text-gray-400">No groups available</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                            {groups.map((group) => (
                                                <label
                                                    key={group.GroupId}
                                                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-all"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedGroups.includes(group.GroupId)}
                                                        onChange={() => handleGroupSelection(group.GroupId)}
                                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">{group.GroupName}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Consolidate Numbers Selection */}
                            {selectedGroups.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3  items-center gap-2">
                                        <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        Select Consolidate Numbers <span className="text-red-500">*</span>
                                    </label>
                                    {consolidateNumbersLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400 animate-spin mr-2" />
                                            <span className="text-gray-600 dark:text-gray-400">Loading consolidate numbers...</span>
                                        </div>
                                    ) : consolidateNumbers.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-gray-500 dark:text-gray-400">No consolidate numbers available</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                            {consolidateNumbers.map((consNo) => (
                                                <label
                                                    key={consNo.No}
                                                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-all"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedConsolidateNos.includes(consNo.No)}
                                                        onChange={() => handleConsolidateNoSelection(consNo.No)}
                                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">{consNo.Desc}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* View Employees Button */}
                            <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                                <button
                                    onClick={handleViewEmployees}
                                    disabled={!selectedYear || !selectedMonth || selectedCCCodes.length === 0 ||
                                        selectedGroups.length === 0 || selectedConsolidateNos.length === 0 || employeesDataLoading}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${selectedYear && selectedMonth && selectedCCCodes.length > 0 &&
                                        selectedGroups.length > 0 && selectedConsolidateNos.length > 0 && !employeesDataLoading
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
                                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {employeesDataLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-5 w-5" />
                                            <span>View Employees</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Employees List */}
                {employeesList.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    Employees ({filteredEmployees.length})
                                </h2>

                                {/* Search and Actions */}
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search employees..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                                            Select All
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Employee List - ONLY THIS SECTION SCROLLS */}
                        <div className="max-h-[600px] overflow-y-auto">
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredEmployees.map((emp) => (
                                    <div
                                        key={emp.Emprefno}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {/* Summary Row */}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEmployees.includes(emp.Emprefno)}
                                                        onChange={() => handleEmployeeSelection(emp.Emprefno)}
                                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                    <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-800/50 dark:to-indigo-800/50 flex items-center justify-center">
                                                        <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                                {emp.BeneficiaryName}
                                                            </h3>
                                                            <span className="px-3 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700">
                                                                {emp.Emprefno}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <Building className="w-4 h-4" />
                                                                {emp.CCCode?.split('$')[0] || 'N/A'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Banknote className="w-4 h-4" />
                                                                {emp.BeneficiaryAcNo || 'N/A'}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-base">
                                                                <IndianRupee className="w-5 h-5" />
                                                                ₹{formatCurrency(emp.BalanceNetValue)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setExpandedEmployeeId(
                                                        expandedEmployeeId === emp.Emprefno ? null : emp.Emprefno
                                                    )}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                >
                                                    {expandedEmployeeId === emp.Emprefno ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedEmployeeId === emp.Emprefno && (
                                            <div className="px-6 pb-6 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Banknote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bank Details</span>
                                                        </div>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">A/C No:</span>
                                                                <span className="font-medium dark:text-white">{emp.BeneficiaryAcNo || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">IFSC:</span>
                                                                <span className="font-medium dark:text-white">{emp.IFSC || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Info</span>
                                                        </div>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Mobile:</span>
                                                                <span className="font-medium dark:text-white">{emp.BeneficiaryMobile || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                                                <span className="font-medium dark:text-white text-xs truncate">{emp.BeneficiaryEmail || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <IndianRupee className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Info</span>
                                                        </div>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Balance:</span>
                                                                <span className="font-bold text-green-600 dark:text-green-400">₹{formatCurrency(emp.BalanceNetValue)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Paid:</span>
                                                                <span className="font-medium text-orange-600 dark:text-orange-400">₹{formatCurrency(emp.PaidCMSAmount)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 md:col-span-2">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Address</span>
                                                        </div>
                                                        <div className="text-sm">
                                                            <p className="font-medium dark:text-white">
                                                                {[emp.BeneficiaryAddress1, emp.BeneficiaryAddress2]
                                                                    .filter(Boolean)
                                                                    .join(', ') || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Actions - OUTSIDE SCROLLABLE AREA */}
                        <div className="p-6 bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                                <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                                    <div className="w-full md:w-auto relative z-50">
                                        <CustomDatePicker
                                            value={paymentDate}
                                            onChange={(date) => setPaymentDate(date)}
                                            placeholder="Select Payment Date"
                                            label="Payment Date"
                                            required={true}
                                            position="top"
                                            size="md"
                                            className="w-full md:w-64"
                                        />
                                    </div>
                                    <div className="bg-white dark:bg-gray-700 px-6 py-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-600">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Selected Amount</p>
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                            ₹{formatCurrency(totalSelectedAmount)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveCMSPayment}
                                    disabled={selectedEmployees.length === 0 || !paymentDate || saveCMSDataLoading}
                                    className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all transform ${selectedEmployees.length > 0 && paymentDate && !saveCMSDataLoading
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {saveCMSDataLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5" />
                                            <span>Save CMS Payment</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffCMSPayCreation;