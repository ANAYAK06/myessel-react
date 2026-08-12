import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
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
} from '../../slices/HRSlice/staffCMSPayCreationSlice';
import CustomDatePicker from '../../components/CustomDatePicker';
import {
    Calendar, Building, Users, FileText, IndianRupee,
    Loader2, Save, RefreshCw, ChevronDown, ChevronUp,
    User, Phone, Home, CheckCircle,
    Filter, Search, Download, Banknote,
    TrendingUp, AlertCircle, RotateCcw, X
} from 'lucide-react';

// ── Bank-transfer Excel export (same 27-column layout used across the CMS
// verification/report screens) ──────────────────────────────────────────

const BANK_HEADERS = [
    'Transaction Type', 'Beneficiary Code', 'Beneficiary Account Number',
    'Instrument Amount', 'Beneficiary Name', 'Drawee Location', 'Print Location',
    'Bene Address 1', 'Bene Address 2', 'Bene Address 3', 'Bene Address 4', 'Bene Address 5',
    'Instruction Reference Number', 'Customer Reference Number',
    'Payment details 1', 'Payment details 2', 'Payment details 3', 'Payment details 4',
    'Payment details 5', 'Payment details 6', 'Payment details 7',
    'Cheque Number', 'Chq / Trn Date', 'MICR Number', 'IFSC Code',
    'Bene Bank Name', 'Bene Bank Branch Name', 'Beneficiary email id',
];

// Unlike the verification/report screens, this page already has the
// beneficiary's email directly on the employee record (BeneficiaryEmail),
// so no extra lookup is needed here.
const resolveCreationBeneficiaryEmail = (emp) =>
    emp.BeneficiaryEmail || emp.Email || emp.EmailId || emp.WorkEmail || emp.MailId || '';

const generateStaffCMSCreationBankExcel = (selectedEmpData, cmsInfo) => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dateStr = `${dd}/${mm}/${today.getFullYear()}`;

    const rows = selectedEmpData.map((emp) => {
        const parts = emp.CCCode?.split('$') || [];
        const consolidateNo = parts.length >= 3 ? parts[2] : '';
        const refNo = `${cmsInfo.month || ''}-${cmsInfo.year || ''}-${consolidateNo}`;

        return [
            'N',                                                        // Transaction Type
            '',                                                          // Beneficiary Code
            emp.BeneficiaryAcNo || '',                                  // Beneficiary Account Number
            parseFloat(emp.BalanceNetValue || 0),                       // Instrument Amount
            emp.BeneficiaryName || '',                                  // Beneficiary Name
            '', '',                                                     // Drawee/Print Location
            '', '', '', '', '',                                         // Bene Address 1-5
            refNo,                                                       // Instruction Reference Number
            refNo,                                                       // Customer Reference Number
            '', '', '', '', '', '', '',                                 // Payment details 1-7
            '',                                                          // Cheque Number
            dateStr,                                                     // Chq / Trn Date
            '',                                                          // MICR Number
            emp.IFSC || '',                                             // IFSC Code
            emp.BeneficiaryBank || emp.BeneficiaryBankName || emp.BankName || emp.Bank || emp.BeneBankName || '',            // Bene Bank Name
            emp.BeneficiaryBranch || emp.BeneficiaryBranchName || emp.BranchName || emp.Branch || emp.BeneBankBranchName || '', // Bene Bank Branch Name
            resolveCreationBeneficiaryEmail(emp),                       // Beneficiary email id
        ];
    });

    const ws = XLSX.utils.aoa_to_sheet([BANK_HEADERS, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bank Transfer');
    XLSX.writeFile(wb, `StaffCMS_BankTransfer_${cmsInfo.payrollTranNo || 'export'}.xlsx`);
};

// ── Compact checkbox-dropdown used for Cost Centers / Groups / Consolidate
// Numbers, replacing the large always-expanded checkbox grids ───────────

const MultiSelectDropdown = ({
    label, icon: Icon, options, selectedValues, onToggle,
    getKey, getLabel, getSubLabel, loading, disabled, placeholder,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <label className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {Icon && <Icon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                {label} <span className="text-red-500">*</span>
            </label>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen((open) => !open)}
                disabled={disabled}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className="truncate text-left">
                    {loading
                        ? 'Loading...'
                        : selectedValues.length === 0
                            ? placeholder
                            : `${selectedValues.length} selected`}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-40 mt-1 w-full max-h-56 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-1.5">
                    {options.length === 0 ? (
                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-3">No options available</p>
                    ) : (
                        options.map((opt) => {
                            const key = getKey(opt);
                            const checked = selectedValues.includes(key);
                            const subLabel = getSubLabel ? getSubLabel(opt) : null;
                            return (
                                <label
                                    key={key}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer text-xs"
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => onToggle(key)}
                                        className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <span className="flex-1 truncate text-gray-800 dark:text-gray-200">
                                        {getLabel(opt)}
                                        {subLabel && <span className="text-gray-400 dark:text-gray-500"> — {subLabel}</span>}
                                    </span>
                                </label>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

const StaffCMSPayCreation = () => {
    const dispatch = useDispatch();

    // Auth State
    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const userName = userData?.userName || userData?.UserName || 'User';

    // Redux State - Data
    const cmsYears = useSelector(selectCMSYearsArray);
    const cmsMonths = useSelector(selectCMSMonthsArray);
    const costCenters = useSelector(selectCostCentersArray);
    const groups = useSelector(selectGroupsArray);
    const consolidateNumbers = useSelector(selectConsolidateNumbersArray);
    const employeesData = useSelector(selectEmployeesData);

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

    // Local State
    const [showFilters, setShowFilters] = useState(true);
    const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date());
    const [transactionRefNo, setTransactionRefNo] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [successInfo, setSuccessInfo] = useState(null);

    // Initial data load
    useEffect(() => {
        dispatch(fetchCMSYears());
        return () => {
            dispatch(resetCMSPayData());
        };
    }, [dispatch]);

    const handleCompleteReset = () => {
        dispatch(setSelectedYear(''));
        dispatch(setSelectedMonth(''));
        dispatch(setSelectedCCCodes([]));
        dispatch(setSelectedGroups([]));
        dispatch(setSelectedConsolidateNos([]));

        setSelectedEmployees([]);
        setSelectAll(false);
        setSearchQuery('');
        setPaymentDate(new Date());
        setExpandedEmployeeId(null);

        dispatch(clearSaveResult());

        toast.info('All filters reset successfully');
    };

    const handleYearChange = (year) => {
        dispatch(setSelectedYear(year));

        if (year) {
            dispatch(fetchCMSMonthsByYear({
                year: year,
                lType: '',
                contraCode: '',
                eType: 'Staff'
            }));
        }
    };

    const handleMonthChange = (month) => {
        dispatch(setSelectedMonth(month));

        if (selectedYear && month) {
            dispatch(fetchCCForCMSPayment({
                year: selectedYear,
                month: month
            }));
        }
    };

    const handleCCSelection = (ccCode) => {
        let updatedCCCodes;
        if (selectedCCCodes.includes(ccCode)) {
            updatedCCCodes = selectedCCCodes.filter(code => code !== ccCode);
        } else {
            updatedCCCodes = [...selectedCCCodes, ccCode];
        }

        dispatch(setSelectedCCCodes(updatedCCCodes));

        if (updatedCCCodes.length > 0 && selectedYear && selectedMonth) {
            dispatch(fetchGroupForCMSPay({
                year: selectedYear,
                month: selectedMonth,
                ccCodes: updatedCCCodes
            }));
        }
    };

    const handleGroupSelection = (groupId) => {
        let updatedGroups;
        if (selectedGroups.includes(groupId)) {
            updatedGroups = selectedGroups.filter(id => id !== groupId);
        } else {
            updatedGroups = [...selectedGroups, groupId];
        }

        dispatch(setSelectedGroups(updatedGroups));

        if (updatedGroups.length > 0 && selectedCCCodes.length > 0 && selectedYear && selectedMonth) {
            dispatch(fetchConsolidateNoForCMSPay({
                year: selectedYear,
                month: selectedMonth,
                ccCodes: selectedCCCodes,
                groups: updatedGroups
            }));
        }
    };

    const handleConsolidateNoSelection = (consolidateNo) => {
        let updatedConsolidateNos;
        if (selectedConsolidateNos.includes(consolidateNo)) {
            updatedConsolidateNos = selectedConsolidateNos.filter(no => no !== consolidateNo);
        } else {
            updatedConsolidateNos = [...selectedConsolidateNos, consolidateNo];
        }

        dispatch(setSelectedConsolidateNos(updatedConsolidateNos));
    };

    const handleViewEmployees = () => {
        if (!selectedYear || !selectedMonth || selectedCCCodes.length === 0 ||
            selectedGroups.length === 0 || selectedConsolidateNos.length === 0) {
            toast.error('Please select Year, Month, Cost Centers, Groups, and Consolidate Numbers');
            return;
        }

        dispatch(fetchEmpForCMSData({
            year: selectedYear,
            month: selectedMonth,
            ccCodes: selectedCCCodes,
            consolidateNos: selectedConsolidateNos,
            groups: selectedGroups
        }));
    };

    const employeesList = employeesData?.CMSReportData || [];

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(employeesList.map(emp => emp.Emprefno));
        }
        setSelectAll(!selectAll);
    };

    const handleEmployeeSelection = (empRefNo) => {
        if (selectedEmployees.includes(empRefNo)) {
            setSelectedEmployees(selectedEmployees.filter(id => id !== empRefNo));
        } else {
            setSelectedEmployees([...selectedEmployees, empRefNo]);
        }
    };

    useEffect(() => {
        if (employeesList.length > 0 && selectedEmployees.length === employeesList.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedEmployees, employeesList]);

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

            const empRefNos = selectedEmpData.map(emp => emp.Emprefno).join('|') + '|';

            const consolidateNos = selectedEmpData.map(emp => {
                const parts = emp.CCCode?.split('$');
                return parts && parts.length >= 3 ? parts[2] : '0';
            }).join('|') + '|';

            const ccCodes = selectedEmpData.map(emp => {
                const parts = emp.CCCode?.split('$');
                return parts && parts.length >= 1 ? parts[0] : '';
            }).join('|') + '|';

            const netAmts = selectedEmpData.map(emp => emp.BalanceNetValue).join('|') + '|';

            const payrollTranNo = selectedEmpData[0]?.TransactionRefno || transactionRefNo;

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

            const responseStr = typeof result === 'string'
                ? result
                : (result?.Data || result?.Message || '');

            const successMessage = responseStr.split('$')[0];

            if (successMessage === 'Submited') {
                const cmsInfo = { month: selectedMonth, year: selectedYear, payrollTranNo };
                generateStaffCMSCreationBankExcel(selectedEmpData, cmsInfo);

                setSuccessInfo({
                    count: selectedEmpData.length,
                    amount: selectedEmpData.reduce((sum, emp) => sum + (emp.BalanceNetValue || 0), 0),
                    empData: selectedEmpData,
                    cmsInfo,
                });

                toast.success('CMS Payment saved successfully! Bank transfer Excel downloaded.');
            } else {
                toast.error(responseStr || 'Failed to save CMS Payment');
            }

        } catch (error) {
            const errorMessage = typeof error === 'string'
                ? error
                : (error?.message || 'Failed to save CMS payment');
            toast.error(errorMessage);
        }
    };

    // Full in-app reset (not a browser reload — a hard reload would drop the
    // session per this app's timeout settings). Puts every selection and
    // fetched list back to the same blank state as a fresh page load.
    const handleClosePopup = () => {
        setSuccessInfo(null);

        dispatch(resetCMSPayData());
        dispatch(fetchCMSYears());

        setSelectedEmployees([]);
        setSelectAll(false);
        setSearchQuery('');
        setPaymentDate(new Date());
        setExpandedEmployeeId(null);
        setShowFilters(true);
    };

    const filteredEmployees = employeesList.filter(emp => {
        const searchLower = searchQuery.toLowerCase();
        return (
            emp.BeneficiaryName?.toLowerCase().includes(searchLower) ||
            emp.Emprefno?.toLowerCase().includes(searchLower) ||
            emp.CCCode?.toLowerCase().includes(searchLower) ||
            emp.BeneficiaryAcNo?.toLowerCase().includes(searchLower)
        );
    });

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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-4">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-xl shadow-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <Banknote className="h-6 w-6" />
                            <div>
                                <h1 className="text-lg font-bold leading-tight">Staff CMS Payment Creation</h1>
                                <p className="text-indigo-100 dark:text-indigo-200 text-xs">
                                    Create and manage CMS payments for staff members
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCompleteReset}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-xs font-semibold"
                                title="Reset All Filters"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Reset All</span>
                            </button>
                            <button
                                onClick={() => dispatch(fetchCMSYears())}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                                title="Refresh"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${cmsYearsLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                <div>
                                    <p className="text-[11px] text-indigo-100 dark:text-indigo-200">Total Employees</p>
                                    <p className="text-base font-bold">{employeesList.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                <div>
                                    <p className="text-[11px] text-indigo-100 dark:text-indigo-200">Selected</p>
                                    <p className="text-base font-bold">{selectedEmployees.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
                            <div className="flex items-center gap-2">
                                <IndianRupee className="h-5 w-5" />
                                <div>
                                    <p className="text-[11px] text-indigo-100 dark:text-indigo-200">Total Amount</p>
                                    <p className="text-base font-bold">₹{formatCurrency(totalEmployeesAmount)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                <div>
                                    <p className="text-[11px] text-indigo-100 dark:text-indigo-200">Selected Amount</p>
                                    <p className="text-base font-bold">₹{formatCurrency(totalSelectedAmount)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Filters Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-4">
                    <div
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700 rounded-t-xl cursor-pointer"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                Filters & Selection
                            </h2>
                            {showFilters ? (
                                <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                {/* Year */}
                                <div>
                                    <label className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                        Year <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedYear || ''}
                                        onChange={(e) => handleYearChange(e.target.value)}
                                        disabled={cmsYearsLoading}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                                    >
                                        <option value="">
                                            {cmsYearsLoading ? 'Loading...' : 'Select Year'}
                                        </option>
                                        {cmsYears.map((year, index) => (
                                            <option key={index} value={year.Year || year}>
                                                {year.Year || year}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Month */}
                                <div>
                                    <label className="flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                        Month <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedMonth || ''}
                                        onChange={(e) => handleMonthChange(e.target.value)}
                                        disabled={!selectedYear || cmsMonthsLoading}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {cmsMonthsLoading ? 'Loading...' : 'Select Month'}
                                        </option>
                                        {cmsMonths.map((month, index) => (
                                            <option key={index} value={month.MonthNo || month.Month}>
                                                {month.MonthName || month.Month}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cost Centers */}
                                <MultiSelectDropdown
                                    label="Cost Centers"
                                    icon={Building}
                                    options={costCenters}
                                    selectedValues={selectedCCCodes}
                                    onToggle={handleCCSelection}
                                    getKey={(cc) => cc.CC_Code}
                                    getLabel={(cc) => cc.CC_Code}
                                    getSubLabel={(cc) => cc.CC_Name}
                                    loading={costCentersLoading}
                                    disabled={!selectedYear || !selectedMonth}
                                    placeholder="Select cost centers"
                                />

                                {/* Groups */}
                                <MultiSelectDropdown
                                    label="Groups"
                                    icon={Users}
                                    options={groups}
                                    selectedValues={selectedGroups}
                                    onToggle={handleGroupSelection}
                                    getKey={(group) => group.GroupId}
                                    getLabel={(group) => group.GroupName}
                                    loading={groupsLoading}
                                    disabled={selectedCCCodes.length === 0}
                                    placeholder="Select groups"
                                />

                                {/* Consolidate Numbers */}
                                <MultiSelectDropdown
                                    label="Consolidate No"
                                    icon={FileText}
                                    options={consolidateNumbers}
                                    selectedValues={selectedConsolidateNos}
                                    onToggle={handleConsolidateNoSelection}
                                    getKey={(consNo) => consNo.No}
                                    getLabel={(consNo) => consNo.Desc}
                                    loading={consolidateNumbersLoading}
                                    disabled={selectedGroups.length === 0}
                                    placeholder="Select consolidate no"
                                />
                            </div>

                            {(costCenters.length === 0 && selectedYear && selectedMonth && !costCentersLoading) && (
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                    No cost centers available for this year/month
                                </div>
                            )}

                            {/* View Employees Button */}
                            <div className="flex justify-end pt-3 border-t dark:border-gray-700">
                                <button
                                    onClick={handleViewEmployees}
                                    disabled={!selectedYear || !selectedMonth || selectedCCCodes.length === 0 ||
                                        selectedGroups.length === 0 || selectedConsolidateNos.length === 0 || employeesDataLoading}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${selectedYear && selectedMonth && selectedCCCodes.length > 0 &&
                                        selectedGroups.length > 0 && selectedConsolidateNos.length > 0 && !employeesDataLoading
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
                                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {employeesDataLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4" />
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                    <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    Employees ({filteredEmployees.length})
                                </h2>

                                <div className="flex flex-col md:flex-row gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search employees..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <label className="flex items-center gap-1.5 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            className="w-3.5 h-3.5 text-indigo-600 rounded"
                                        />
                                        <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">
                                            Select All
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Employee List - ONLY THIS SECTION SCROLLS */}
                        <div className="max-h-[520px] overflow-y-auto">
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredEmployees.map((emp) => (
                                    <div
                                        key={emp.Emprefno}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {/* Summary Row */}
                                        <div className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEmployees.includes(emp.Emprefno)}
                                                        onChange={() => handleEmployeeSelection(emp.Emprefno)}
                                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                    <div className="w-9 h-9 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-800/50 dark:to-indigo-800/50 flex items-center justify-center flex-shrink-0">
                                                        <User className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                                {emp.BeneficiaryName}
                                                            </h3>
                                                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700 flex-shrink-0">
                                                                {emp.Emprefno}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                            <span className="flex items-center gap-1">
                                                                <Building className="w-3 h-3" />
                                                                {emp.CCCode?.split('$')[0] || 'N/A'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Banknote className="w-3 h-3" />
                                                                {emp.BeneficiaryAcNo || 'N/A'}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-sm">
                                                                <IndianRupee className="w-3.5 h-3.5" />
                                                                ₹{formatCurrency(emp.BalanceNetValue)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setExpandedEmployeeId(
                                                        expandedEmployeeId === emp.Emprefno ? null : emp.Emprefno
                                                    )}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                                >
                                                    {expandedEmployeeId === emp.Emprefno ? (
                                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedEmployeeId === emp.Emprefno && (
                                            <div className="px-3 pb-3 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                            <Banknote className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Bank Details</span>
                                                        </div>
                                                        <div className="space-y-1 text-xs">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">A/C No:</span>
                                                                <span className="font-medium dark:text-white">{emp.BeneficiaryAcNo || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">IFSC:</span>
                                                                <span className="font-medium dark:text-white">{emp.IFSC || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Bank:</span>
                                                                <span className="font-medium dark:text-white text-right">
                                                                    {emp.BeneficiaryBank || emp.BeneficiaryBankName || emp.BankName || emp.Bank || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                            <Phone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Contact Info</span>
                                                        </div>
                                                        <div className="space-y-1 text-xs">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Mobile:</span>
                                                                <span className="font-medium dark:text-white">{emp.BeneficiaryMobile || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                                                <span className="font-medium dark:text-white text-[11px] truncate">{emp.BeneficiaryEmail || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                            <IndianRupee className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Payment Info</span>
                                                        </div>
                                                        <div className="space-y-1 text-xs">
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

                                                    <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 md:col-span-2">
                                                        <div className="flex items-center gap-1.5 mb-1.5">
                                                            <Home className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Address</span>
                                                        </div>
                                                        <div className="text-xs">
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
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                                <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
                                    <div className="w-full md:w-auto relative z-50">
                                        <CustomDatePicker
                                            value={paymentDate}
                                            onChange={(date) => setPaymentDate(date)}
                                            placeholder="Select Payment Date"
                                            label="Payment Date"
                                            required={true}
                                            position="top"
                                            size="sm"
                                            className="w-full md:w-56"
                                        />
                                    </div>
                                    <div className="bg-white dark:bg-gray-700 px-4 py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-600">
                                        <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-0.5">Total Selected Amount</p>
                                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                            ₹{formatCurrency(totalSelectedAmount)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveCMSPayment}
                                    disabled={selectedEmployees.length === 0 || !paymentDate || saveCMSDataLoading}
                                    className={`flex items-center gap-1.5 px-6 py-3 rounded-lg text-sm font-semibold transition-all transform ${selectedEmployees.length > 0 && paymentDate && !saveCMSDataLoading
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {saveCMSDataLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>Save CMS Payment</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Success Popup */}
            {successInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-5 relative">
                        <button
                            onClick={handleClosePopup}
                            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            title="Close and reset the form"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Payment Submitted</h3>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            CMS payment for <span className="font-semibold">{successInfo.count}</span> employee(s)
                            totalling <span className="font-semibold">₹{formatCurrency(successInfo.amount)}</span> was submitted successfully.
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                            The bank transfer Excel has already been downloaded automatically.
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => generateStaffCMSCreationBankExcel(successInfo.empData, successInfo.cmsInfo)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all"
                            >
                                <Download className="h-3.5 w-3.5" />
                                Download Again
                            </button>
                            <button
                                onClick={handleClosePopup}
                                className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffCMSPayCreation;
