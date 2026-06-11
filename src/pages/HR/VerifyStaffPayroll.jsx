import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Clock, Users, Calendar, Hash,
    CheckSquare, Square, Eye,
    XCircle, ChevronRight, Banknote, TrendingDown,
    TrendingUp, Building2, UserCheck, X, AlertCircle
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import RightDetailPanel from '../../components/Inbox/RightDetailPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerificationCCPayroll,
    fetchVerificationCCPayrollByRefNo,
    approvePayRollMulti,
    approvePayRollSingle,
    setSelectedItem,
    clearActionResult,
    resetVerificationData,
    selectVerificationCCPayrollListArray,
    selectVerificationCCPayrollDetails,
    selectVerificationDetailsArray,
    selectVerificationListLoading,
    selectVerificationDetailsLoading,
    selectActionMultiLoading,
    selectActionSingleLoading,
    selectVerificationListError,
    selectVerificationDetailsError,
    selectActionStatus,
} from '../../slices/HRSlice/staffPayrollVerificationSlice';

import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedMOID
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton
} from '../../slices/CommonSlice/getStatusSlice';

// ─── Salary Detail Modal ───────────────────────────────────────────────────────
const SalaryDetailModal = ({ employee, salaryDetails, onClose }) => {
    if (!employee) return null;

    const earnings = salaryDetails.filter(d => d.EmployeeId === employee.EmpRefNo && d.HeadType === 'Earning');
    const deductions = salaryDetails.filter(d => d.EmployeeId === employee.EmpRefNo && d.HeadType === 'Deduction');

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-indigo-200 dark:border-indigo-700">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">{employee.Name}</h3>
                            <p className="text-indigo-200 text-sm">{employee.EmpRefNo} · {employee.DesignationName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>

                <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="p-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gross</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            ₹{employee.GrossValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="p-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Deductions</p>
                        <p className="text-lg font-bold text-red-500">
                            ₹{employee.Deductions?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="p-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Pay</p>
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{employee.NetValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 px-5 py-3 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        <span>Salary Days: <b>{employee.TotalSalaryDays}</b></span>
                    </span>
                    <span className="flex items-center space-x-1 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg">
                        <Clock className="w-3 h-3 text-purple-500" />
                        <span>Absent: <b>{employee.TotalAbsentDays}</b></span>
                    </span>
                    <span className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                        <Building2 className="w-3 h-3 text-green-500" />
                        <span>CC: <b>{employee.JoiningCostCenter}</b></span>
                    </span>
                    <span className="flex items-center space-x-1 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
                        <Hash className="w-3 h-3 text-orange-500" />
                        <span>SalaryId: <b>{employee.SalaryId}</b></span>
                    </span>
                </div>

                <div className="overflow-y-auto" style={{ maxHeight: '40vh' }}>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center space-x-2 mb-3">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Earnings</h4>
                            </div>
                            <div className="space-y-2">
                                {earnings.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No earnings data</p>
                                ) : earnings.map((head, i) => (
                                    <div key={i} className="flex justify-between items-center bg-green-50 dark:bg-green-900/10 rounded-lg px-3 py-2">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">{head.SalaryHead}</span>
                                        <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                            ₹{head.HeadAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 mb-3">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Deductions</h4>
                            </div>
                            <div className="space-y-2">
                                {deductions.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No deductions data</p>
                                ) : deductions.map((head, i) => (
                                    <div key={i} className="flex justify-between items-center bg-red-50 dark:bg-red-900/10 rounded-lg px-3 py-2">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">{head.SalaryHead}</span>
                                        <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                                            ₹{head.HeadAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Reject Confirmation Modal ─────────────────────────────────────────────────
const RejectConfirmModal = ({ employee, onConfirm, onCancel, loading }) => {
    const [rejectNote, setRejectNote] = useState('');

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-red-200 dark:border-red-700">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-5 rounded-t-2xl flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Reject Payroll</h3>
                        <p className="text-red-100 text-sm">{employee?.Name} · {employee?.EmpRefNo}</p>
                    </div>
                </div>
                <div className="p-5">
                    <div className="flex items-start space-x-3 mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-400">
                            This will reject the payroll for <strong>{employee?.Name}</strong>. Please provide a reason below.
                        </p>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                        rows={3}
                        placeholder="Enter reason for rejection..."
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                    />
                    <div className="flex space-x-3 mt-4">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(rejectNote)}
                            disabled={!rejectNote.trim() || loading}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                                <>
                                    <XCircle className="w-4 h-4" />
                                    <span>Confirm Reject</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Empty Detail State ────────────────────────────────────────────────────────
const EmptyDetailState = ({ message = 'No employees remaining in this payroll record.' }) => (
    <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            All Employees Rejected
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
            {message}
        </p>
        <div className="flex items-center justify-center space-x-2 mt-4 text-indigo-500 text-xs">
            <ChevronRight className="w-4 h-4" />
            <span>Select another record from the left panel</span>
        </div>
    </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const VerifyStaffPayroll = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const payrollInbox = useSelector(selectVerificationCCPayrollListArray);
    const inboxLoading = useSelector(selectVerificationListLoading);
    const inboxError = useSelector(selectVerificationListError);

    const payrollDetails = useSelector(selectVerificationCCPayrollDetails);
    const detailsArray = useSelector(selectVerificationDetailsArray);
    const detailsLoading = useSelector(selectVerificationDetailsLoading);
    const detailsError = useSelector(selectVerificationDetailsError);

    const actionMultiLoading = useSelector(selectActionMultiLoading);
    const actionSingleLoading = useSelector(selectActionSingleLoading);
    const actionStatus = useSelector(selectActionStatus);

    const remarks = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    const [selectedItem, setSelectedItemLocal] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationComment, setVerificationComment] = useState('');
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMonth, setFilterMonth] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);

    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
    const [modalEmployee, setModalEmployee] = useState(null);
    const [rejectEmployee, setRejectEmployee] = useState(null);
    // ✅ Track how many employees have been rejected in the current selection
    const [rejectedCount, setRejectedCount] = useState(0);

    const mainGridData = useMemo(() => payrollDetails?.MainGridData || [], [payrollDetails]);
    const salaryDetailsData = useMemo(() => payrollDetails?.MonthlySalaryDetailsData || [], [payrollDetails]);

    // ✅ Remaining employees after rejections
    const remainingCount = mainGridData.length - rejectedCount;
    const allRejected = selectedItem && !detailsLoading && mainGridData.length > 0 && remainingCount <= 0;

    const months = [...new Set(payrollInbox.map(i => i.Month))].filter(Boolean);
    const years = [...new Set(payrollInbox.map(i => i.Year))].filter(Boolean);

    const getCurrentUser = () => userData?.userName || userData?.UID || 'system';

    useEffect(() => {
        if (roleId) dispatch(fetchVerificationCCPayroll({ roleId }));
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetVerificationData());
            dispatch(resetApprovalData());
            dispatch(clearActionResult());
        };
    }, [dispatch]);

    useEffect(() => {
        if (selectedItem) {
            dispatch(fetchVerificationCCPayrollByRefNo({
                transactionRefno: selectedItem.TransactionRefno,
                conslidateTransNo: selectedItem.ConslidateTransNo,
                refno: selectedItem.Refno,
                ccCodes: selectedItem.CCCodes,
                payRoleDate: selectedItem.PayRoleDate,
                month: selectedItem.Month,
                year: selectedItem.Year,
                roleId
            }));
            setSelectedEmployeeIds([]);
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
            setRejectedCount(0); // ✅ Reset rejected count on new selection
        }
    }, [selectedItem, dispatch, roleId]);

    useEffect(() => {
        if (selectedItem && roleId && payrollDetails) {
            const moid = mainGridData[0]?.MOID || 378;
            dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({
                trno: selectedItem.TransactionRefno?.toString(),
                moid
            }));
        }
    }, [selectedItem, roleId, payrollDetails, dispatch, mainGridData]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    const handleRefresh = () => {
        if (roleId) {
            dispatch(fetchVerificationCCPayroll({ roleId }));
            if (selectedItem) {
                dispatch(fetchVerificationCCPayrollByRefNo({
                    transactionRefno: selectedItem.TransactionRefno,
                    conslidateTransNo: selectedItem.ConslidateTransNo,
                    refno: selectedItem.Refno,
                    ccCodes: selectedItem.CCCodes,
                    payRoleDate: selectedItem.PayRoleDate,
                    month: selectedItem.Month,
                    year: selectedItem.Year,
                    roleId
                }));
            }
        }
    };

    const handleItemSelect = (item) => {
        setSelectedItemLocal(item);
        dispatch(setSelectedItem(item));
    };

    const handleSelectAll = () => {
        if (selectedEmployeeIds.length === mainGridData.length) {
            setSelectedEmployeeIds([]);
        } else {
            setSelectedEmployeeIds(mainGridData.map(e => e.SalaryId));
        }
    };

    const handleToggleEmployee = (salaryId) => {
        setSelectedEmployeeIds(prev =>
            prev.includes(salaryId) ? prev.filter(id => id !== salaryId) : [...prev, salaryId]
        );
    };

    const buildMultiPayload = (actionValue) => {
        const selected = mainGridData.filter(e => selectedEmployeeIds.includes(e.SalaryId));
        const salaryIds = selected.map(e => e.SalaryId).join('|') + '|';
        const empRefNos = selected.map(e => e.EmpRefNo).join('|') + '|';

        return {
            action: actionValue,
            payRoleDate: selectedItem.PayRoleDate,
            transactionRefno: selectedItem.TransactionRefno,
            roleId,
            createdBy: getCurrentUser(),
            conslidateTransNo: selectedItem.ConslidateTransNo,
            refno: selectedItem.Refno,
            note: verificationComment.trim(),
            salaryIds,
            empRefNos,
            ccCode: selectedItem.CCCodes
        };
    };

    const buildSinglePayload = (employee, actionValue, note) => ({
        action: actionValue,
        transactionRefno: selectedItem.TransactionRefno,
        roleId,
        payRoleDate: selectedItem.PayRoleDate,
        createdBy: getCurrentUser(),
        conslidateTransNo: selectedItem.ConslidateTransNo,
        refno: selectedItem.Refno,
        note: note || verificationComment.trim(),
        salaryId: employee.SalaryId,
        empRefNo: employee.EmpRefNo,
        ccCode: selectedItem.CCCodes
    });

    const handleActionClick = async (action) => {
        if (!selectedItem) return toast.error('No payroll record selected');
        if (!verificationComment.trim()) return toast.error('Verification comment is mandatory');
        if (!isVerified) return toast.error('Please check the verification checkbox to proceed');
        if (selectedEmployeeIds.length === 0) return toast.error('Please select at least one employee to process');

        const actionValue = action.value || action.text || 'Verify';

        try {
            const payload = buildMultiPayload(actionValue);
            await dispatch(approvePayRollMulti(payload)).unwrap();
            toast.success(`${actionValue} completed successfully!`);

            setTimeout(() => {
                dispatch(fetchVerificationCCPayroll({ roleId }));
                setSelectedItemLocal(null);
                dispatch(setSelectedItem(null));
                setVerificationComment('');
                setIsVerified(false);
                setSelectedEmployeeIds([]);
                setRejectedCount(0);
                setIsLeftPanelCollapsed(false);
                dispatch(resetApprovalData());
                dispatch(clearActionResult());
            }, 1000);
        } catch (error) {
            toast.error(typeof error === 'string' ? error : error?.message || 'Action failed', { autoClose: 8000 });
        }
    };

    // ✅ FIXED: After single reject, check if all employees are now rejected
    const handleSingleReject = async (note) => {
        if (!rejectEmployee || !selectedItem) return;

        try {
            const payload = buildSinglePayload(rejectEmployee, 'Reject', note);
            await dispatch(approvePayRollSingle(payload)).unwrap();
            toast.success(`Payroll rejected for ${rejectEmployee.Name}`);
            setRejectEmployee(null);

            const newRejectedCount = rejectedCount + 1;
            setRejectedCount(newRejectedCount);

            // ✅ If all employees are now rejected, clear the entire detail area
            if (newRejectedCount >= mainGridData.length) {
                dispatch(fetchVerificationCCPayroll({ roleId }));
                setTimeout(() => {
                    setSelectedItemLocal(null);
                    dispatch(setSelectedItem(null));
                    setVerificationComment('');
                    setIsVerified(false);
                    setSelectedEmployeeIds([]);
                    setRejectedCount(0);
                    setIsLeftPanelCollapsed(false);
                    dispatch(resetApprovalData());
                    dispatch(clearActionResult());
                }, 800);
            } else {
                // Still more employees — just refresh the details
                handleRefresh();
            }
        } catch (error) {
            toast.error(typeof error === 'string' ? error : error?.message || 'Rejection failed');
        }
    };

    const filteredItems = payrollInbox.filter(item => {
        const search = searchQuery.toLowerCase();
        const matchesSearch = !search ||
            item.TransactionRefno?.toString().includes(search) ||
            item.ConslidateTransNo?.toString().includes(search) ||
            item.CCCodes?.toLowerCase().includes(search) ||
            item.Refno?.toString().includes(search);
        const matchesMonth = filterMonth === 'All' || item.Month?.toString() === filterMonth?.toString();
        const matchesYear = filterYear === 'All' || item.Year?.toString() === filterYear?.toString();
        return matchesSearch && matchesMonth && matchesYear;
    });

    const totalNetSelected = mainGridData
        .filter(e => selectedEmployeeIds.includes(e.SalaryId))
        .reduce((sum, e) => sum + (e.NetValue || 0), 0);

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        Ref: {item.TransactionRefno}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">CC: {item.CCCodes}</p>
                </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                        <Hash className="w-3 h-3" />
                        <span>Consolidate: {item.ConslidateTransNo}</span>
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.Month}/{item.Year}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                        {item.PayRoleDate}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <Banknote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    const renderDetailContent = (isPopup = false) => {
        if (!selectedItem) return null;

        // ✅ Show empty state if all employees have been rejected
        if (allRejected) {
            return <EmptyDetailState />;
        }

        return (
            <div className="space-y-6">
                {detailsLoading && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700 flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                        <span className="text-indigo-700 dark:text-indigo-400 text-sm">Loading payroll details...</span>
                    </div>
                )}

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-start space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Banknote className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    Payroll Verification
                                </h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                                    Ref: {selectedItem.TransactionRefno} · CC: {selectedItem.CCCodes}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        {selectedItem.PayRoleDate}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                        Consolidate: {selectedItem.ConslidateTransNo}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                        {mainGridData.length} Employees
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Net Pay</p>
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                ₹{mainGridData.reduce((s, e) => s + (e.NetValue || 0), 0)
                                    .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                {mainGridData.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                    <Users className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Employee Payroll Details
                                </h3>
                            </div>
                            <button
                                onClick={handleSelectAll}
                                className="flex items-center space-x-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-600 px-3 py-1.5 rounded-lg"
                            >
                                {selectedEmployeeIds.length === mainGridData.length ? (
                                    <CheckSquare className="w-4 h-4" />
                                ) : (
                                    <Square className="w-4 h-4" />
                                )}
                                <span>{selectedEmployeeIds.length === mainGridData.length ? 'Deselect All' : 'Select All'}</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="w-8 px-2 py-2"></th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Emp ID</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Designation</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Gross</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Deductions</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Net Pay</th>
                                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Days</th>
                                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {mainGridData.map((emp, idx) => {
                                        const isSelected = selectedEmployeeIds.includes(emp.SalaryId);
                                        return (
                                            <tr
                                                key={emp.SalaryId || idx}
                                                className={`transition-colors ${isSelected
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                                    }`}
                                            >
                                                <td className="px-2 py-1.5">
                                                    <button onClick={() => handleToggleEmployee(emp.SalaryId)} className="flex items-center justify-center">
                                                        {isSelected ? (
                                                            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                        ) : (
                                                            <Square className="w-4 h-4 text-gray-400 hover:text-indigo-500 transition-colors" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-1.5 font-mono text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                                                    {emp.EmpRefNo}
                                                </td>
                                                <td className="px-3 py-1.5 min-w-[160px]">
                                                    <p className="font-semibold text-gray-900 dark:text-white leading-snug break-words">{emp.Name}</p>
                                                </td>
                                                <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">
                                                    {emp.DesignationName}
                                                </td>
                                                <td className="px-3 py-1.5 text-right font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                                                    ₹{emp.GrossValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-1.5 text-right font-medium text-red-500 whitespace-nowrap">
                                                    ₹{emp.Deductions?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-1.5 text-right whitespace-nowrap">
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                        ₹{emp.NetValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-1.5 text-center whitespace-nowrap">
                                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                                                        {emp.TotalSalaryDays}/{emp.WorkingDays}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-1.5">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <button
                                                            onClick={() => setModalEmployee(emp)}
                                                            title="View Salary Details"
                                                            className="p-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectEmployee(emp)}
                                                            title="Reject this employee"
                                                            className="p-1 rounded bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                                <tfoot className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                                    <tr>
                                        <td colSpan="4" className="px-3 py-2 text-right text-xs font-bold text-gray-900 dark:text-white">
                                            Total ({mainGridData.length} employees):
                                        </td>
                                        <td className="px-3 py-2 text-right text-xs font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                                            ₹{mainGridData.reduce((s, e) => s + (e.GrossValue || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-3 py-2 text-right text-xs font-bold text-red-500 whitespace-nowrap">
                                            ₹{mainGridData.reduce((s, e) => s + (e.Deductions || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-3 py-2 text-right text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                            ₹{mainGridData.reduce((s, e) => s + (e.NetValue || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td colSpan="2"></td>
                                    </tr>
                                    {selectedEmployeeIds.length > 0 && selectedEmployeeIds.length < mainGridData.length && (
                                        <tr className="border-t border-indigo-200 dark:border-indigo-700">
                                            <td colSpan="4" className="px-3 py-1.5 text-right text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                                Selected ({selectedEmployeeIds.length}):
                                            </td>
                                            <td className="px-3 py-1.5 text-right text-xs font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                                                ₹{mainGridData.filter(e => selectedEmployeeIds.includes(e.SalaryId)).reduce((s, e) => s + (e.GrossValue || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-3 py-1.5 text-right text-xs font-semibold text-red-500 whitespace-nowrap">
                                                ₹{mainGridData.filter(e => selectedEmployeeIds.includes(e.SalaryId)).reduce((s, e) => s + (e.Deductions || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-3 py-1.5 text-right text-xs font-semibold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                                                ₹{totalNetSelected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td colSpan="2"></td>
                                        </tr>
                                    )}
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(!showRemarksHistory)}
                    remarks={remarks}
                    loading={remarksLoading}
                    title="Approval History"
                />

                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel: '✓ I have verified the payroll details and employee salary information',
                        checkboxDescription: 'Including salary heads, deductions, attendance days, net amounts, and cost center allocations',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Please verify payroll details, salary heads, attendance records, and any discrepancies...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        commentBorder: 'border-indigo-200 dark:border-indigo-700'
                    }}
                />

                {selectedEmployeeIds.length === 0 && mainGridData.length > 0 && (
                    <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Select employees above to include them in the bulk action.</span>
                    </div>
                )}

                {statusLoading ? (
                    <div className="flex items-center justify-center space-x-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                        <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                    </div>
                ) : !hasActions || !enabledActions?.length ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700 text-center">
                        <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                            ℹ️ No actions available for this payroll record
                        </p>
                    </div>
                ) : (
                    <ActionButtons
                        actions={enabledActions}
                        onActionClick={handleActionClick}
                        loading={actionMultiLoading}
                        isVerified={isVerified}
                        comment={verificationComment}
                        showValidation={true}
                        excludeActions={['send back']}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {modalEmployee && (
                <SalaryDetailModal
                    employee={modalEmployee}
                    salaryDetails={salaryDetailsData}
                    onClose={() => setModalEmployee(null)}
                />
            )}
            {rejectEmployee && (
                <RejectConfirmModal
                    employee={rejectEmployee}
                    onConfirm={handleSingleReject}
                    onCancel={() => setRejectEmployee(null)}
                    loading={actionSingleLoading}
                />
            )}

            <InboxHeader
                title={`${InboxTitle || 'Staff Payroll Verification'} (${payrollInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={payrollInbox.length}
                onBackClick={() => onNavigate?.('dashboard', { name: 'Dashboard', type: 'dashboard' })}
                HeaderIcon={Banknote}
                badgeText="Payroll Verification"
                badgeCount={payrollInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by transaction ref, consolidate no, CC code...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    { value: filterMonth, onChange: (e) => setFilterMonth(e.target.value), defaultLabel: 'All Months', options: months },
                    { value: filterYear, onChange: (e) => setFilterYear(e.target.value), defaultLabel: 'All Years', options: years }
                ]}
            />

            <div
                    className={`grid transition-all duration-300 ${isLeftPanelCollapsed && !isLeftPanelHovered
                        ? 'grid-cols-1 lg:grid-cols-12 gap-2'
                        : 'grid-cols-1 lg:grid-cols-3 gap-6'
                        }`}
                    onMouseLeave={() => {
                        if (selectedItem && isLeftPanelCollapsed) setIsLeftPanelHovered(false);
                    }}
                >
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-1' : 'lg:col-span-1'}>
                        <LeftPanel
                            items={filteredItems}
                            selectedItem={selectedItem}
                            onItemSelect={handleItemSelect}
                            renderItem={renderItemCard}
                            renderCollapsedItem={renderCollapsedItem}
                            isCollapsed={isLeftPanelCollapsed}
                            onCollapseToggle={setIsLeftPanelCollapsed}
                            isHovered={isLeftPanelHovered}
                            onHoverChange={setIsLeftPanelHovered}
                            loading={inboxLoading}
                            error={inboxError}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending Verification',
                                icon: Clock,
                                emptyMessage: 'No payroll records pending verification',
                                itemKey: 'TransactionRefno',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
                            }}
                            renderPopupContent={(_item) => renderDetailContent(true)}
                            popupConfig={{
                                title: 'Payroll Verification',
                                icon: Banknote,
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                            }}
                        />
                    </div>

                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <RightDetailPanel
                            selectedItem={selectedItem}
                            loading={detailsLoading}
                            renderContent={renderDetailContent}
                            config={{
                                title: 'Payroll Verification',
                                icon: Banknote,
                                selectedTitle: 'Payroll Verification',
                                emptyTitle: 'No Payroll Record Selected',
                                emptyMessage: 'Select a payroll record from the list to view employee details and process verification.',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                                maxHeight: 'calc(100vh - 200px)',
                                sticky: true,
                                stickyTop: '1.5rem',
                            }}
                        />
                    </div>
                </div>
        </div>
    );
};

export default VerifyStaffPayroll;