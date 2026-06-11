import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Clock, Users, Calendar, Hash,
    DollarSign, CheckSquare, Square, Eye,
    XCircle, ChevronRight, TrendingDown, TrendingUp,
    Building2, UserCheck, X, AlertCircle, Layers,
    CreditCard, ArrowDownCircle, BarChart2, Wallet,
    RefreshCw, Tag, Minus, Plus
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchVerifySalaryDeductions,
    fetchMonthDeductionForVerify,
    approveSingleSalaryDeduction,
    fetchVerifySalaryArear,
    fetchArearCCAmount,
    approveSalaryArear,
    setSelectedDeductionItem,
    setSelectedArearItem,
    setActiveTab,
    clearDeductionActionResult,
    clearArearActionResult,
    resetAllData,
    selectSalaryDeductionListArray,
    selectSalaryArearListArray,
    selectMonthDeductionDetails,
    selectMonthDeductionDetailsArray,
    selectArearCCAmount,
    selectArearCCAmountArray,
    selectDeductionListLoading,
    selectArearListLoading,
    selectMonthDeductionDetailsLoading,
    selectArearCCAmountLoading,
    selectDeductionActionLoading,
    selectArearActionLoading,
    selectDeductionListError,
    selectArearListError,
    selectDeductionActionStatus,
    selectArearActionStatus,
    selectActiveTab,
} from '../../slices/HRSlice/salaryDeductionArearVerificationSlice';

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

// ─── Type Badge ────────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
    const isDeduction = type === 'deduction';
    return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            isDeduction
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
        }`}>
            {isDeduction ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            <span>{isDeduction ? 'Deduction' : 'Arear'}</span>
        </span>
    );
};

// ─── Deduction Detail View ─────────────────────────────────────────────────────
const DeductionDetailView = ({ selectedItem, deductionDetails, detailsLoading, detailsError }) => {
    const detailsArray = Array.isArray(deductionDetails) ? deductionDetails : [];
    const totalDeduction = detailsArray.reduce((sum, d) => sum + (d.Amount || 0), 0);

    return (
        <div className="space-y-5">
            {/* Header Card — indigo/purple theme */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <TrendingDown className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Salary Deduction</h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-2">
                                {selectedItem.EmpName} · {selectedItem.EmpRefno}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                    {selectedItem.PayRollForTheDate}
                                </span>
                                <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                    {selectedItem.CCName}
                                </span>
                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                                    Ref: {selectedItem.TransactionRefno}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Deduction</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{totalDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {selectedItem.Month}/{selectedItem.Year}
                        </p>
                    </div>
                </div>
            </div>

            {/* Deduction Heads Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                            <Minus className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Deduction Heads</h3>
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                            {detailsArray.length} heads
                        </span>
                    </div>
                </div>

                {detailsLoading ? (
                    <div className="flex items-center justify-center p-8 space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Loading deduction details...</span>
                    </div>
                ) : detailsArray.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-400 text-sm italic">No deduction heads found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Deduction Head</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {detailsArray.map((head, idx) => (
                                    <tr key={head.Id || idx} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{head.HeadName}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-sm font-bold ${head.Amount > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                                ₹{(head.Amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                head.Amount > 0
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {head.Amount > 0 ? 'Active' : 'Nil'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                                <tr>
                                    <td colSpan="2" className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                                        Total Deduction:
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                        ₹{totalDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Arear Detail View ─────────────────────────────────────────────────────────
const ArearDetailView = ({ selectedItem, ccAmountData, ccLoading }) => {
    const ccArray = Array.isArray(ccAmountData) ? ccAmountData : [];
    const totalAmount = ccArray.reduce((sum, cc) => sum + (cc.Amount || 0), 0);

    return (
        <div className="space-y-5">
            {/* Header Card — indigo/violet theme */}
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Salary Arear</h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-2">
                                {selectedItem.EmpName} · {selectedItem.EmpRefno}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                    {selectedItem.PayRollForTheDate}
                                </span>
                                <span className="px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-medium">
                                    {selectedItem.CCName}
                                </span>
                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                                    Ref: {selectedItem.TransactionRefno}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Arear Amount</p>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{(selectedItem.TotalAmount || totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {selectedItem.Month}/{selectedItem.Year} · {selectedItem.SalaryHead}
                        </p>
                    </div>
                </div>
            </div>

            {/* Arear Info Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Salary Head', value: selectedItem.SalaryHead, icon: Tag, color: 'purple' },
                    { label: 'Group', value: `${selectedItem.GroupName} (${selectedItem.GroupId})`, icon: Users, color: 'blue' },
                    { label: 'EmpTrans Ref', value: selectedItem.EmpTransactionRefNo, icon: Hash, color: 'indigo' },
                    { label: 'CC Code', value: selectedItem.CCCode, icon: Building2, color: 'violet' },
                ].map((info, idx) => (
                    <div key={idx} className={`bg-${info.color}-50 dark:bg-${info.color}-900/20 rounded-xl p-3 border border-${info.color}-200 dark:border-${info.color}-700`}>
                        <div className="flex items-center space-x-2 mb-1">
                            <info.icon className={`w-3.5 h-3.5 text-${info.color}-500`} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{info.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{info.value || '—'}</p>
                    </div>
                ))}
            </div>

            {/* CC Amount Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">CC-wise Amount Distribution</h3>
                        {ccArray.length > 0 && (
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                                {ccArray.length} CC codes
                            </span>
                        )}
                    </div>
                </div>

                {ccLoading ? (
                    <div className="flex items-center justify-center p-8 space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Loading CC amounts...</span>
                    </div>
                ) : ccArray.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-400 text-sm italic">No CC amount distribution available</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">CC Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">CC Name</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Share %</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {ccArray.map((cc, idx) => {
                                    const share = totalAmount > 0 ? ((cc.Amount / totalAmount) * 100).toFixed(1) : 0;
                                    return (
                                        <tr key={idx} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                            <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-medium">
                                                    {cc.CCCode}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cc.CCName}</td>
                                            <td className="px-4 py-3 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                ₹{(cc.Amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full"
                                                            style={{ width: `${share}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">{share}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20">
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                                        Total Amount:
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                        ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Reject Confirm Modal ──────────────────────────────────────────────────────
const RejectConfirmModal = ({ item, type, onConfirm, onCancel, loading }) => {
    const [rejectNote, setRejectNote] = useState('');
    const isDeduction = type === 'deduction';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-red-200 dark:border-red-700">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-5 rounded-t-2xl flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Reject {isDeduction ? 'Deduction' : 'Arear'}</h3>
                        <p className="text-red-100 text-sm">{item?.EmpName} · {item?.EmpRefno}</p>
                    </div>
                </div>
                <div className="p-5">
                    <div className="flex items-start space-x-3 mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-400">
                            This will reject the salary {isDeduction ? 'deduction' : 'arear'} for <strong>{item?.EmpName}</strong>. Please provide a reason below.
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
                        <button onClick={onCancel} disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button onClick={() => onConfirm(rejectNote)} disabled={!rejectNote.trim() || loading}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2">
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                                <><XCircle className="w-4 h-4" /><span>Confirm Reject</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const VerifySalaryDeductionArear = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // Deduction state
    const deductionInbox = useSelector(selectSalaryDeductionListArray);
    const deductionListLoading = useSelector(selectDeductionListLoading);
    const deductionListError = useSelector(selectDeductionListError);
    const monthDeductionDetails = useSelector(selectMonthDeductionDetails);
    const monthDeductionDetailsArray = useSelector(selectMonthDeductionDetailsArray);
    const deductionDetailsLoading = useSelector(selectMonthDeductionDetailsLoading);
    const deductionActionLoading = useSelector(selectDeductionActionLoading);
    const deductionActionStatus = useSelector(selectDeductionActionStatus);

    // Arear state
    const arearInbox = useSelector(selectSalaryArearListArray);
    const arearListLoading = useSelector(selectArearListLoading);
    const arearListError = useSelector(selectArearListError);
    const arearCCAmount = useSelector(selectArearCCAmount);
    const arearCCAmountArray = useSelector(selectArearCCAmountArray);
    const arearCCAmountLoading = useSelector(selectArearCCAmountLoading);
    const arearActionLoading = useSelector(selectArearActionLoading);
    const arearActionStatus = useSelector(selectArearActionStatus);

    // Shared
    const activeTab = useSelector(selectActiveTab);
    const remarks = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);
    const statusLoading = useSelector(selectStatusListLoading);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;
    const uid = userData?.UID || userData?.uid;

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // Local UI state
    const [selectedDeductionItemLocal, setSelectedDeductionItemLocal] = useState(null);
    const [selectedArearItemLocal, setSelectedArearItemLocal] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationComment, setVerificationComment] = useState('');
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMonth, setFilterMonth] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [rejectItem, setRejectItem] = useState(null);

    const selectedItem = activeTab === 'deduction' ? selectedDeductionItemLocal : selectedArearItemLocal;
    const isActionLoading = activeTab === 'deduction' ? deductionActionLoading : arearActionLoading;

    // Combined inbox (tagged)
    const combinedInbox = useMemo(() => {
        const withDeductionTag = deductionInbox.map(item => ({ ...item, _type: 'deduction' }));
        const withArearTag = arearInbox.map(item => ({ ...item, _type: 'arear' }));
        return [...withDeductionTag, ...withArearTag];
    }, [deductionInbox, arearInbox]);

    const filteredInbox = useMemo(() => {
        return combinedInbox.filter(item => {
            const search = searchQuery.toLowerCase();
            const matchesSearch = !search ||
                item.EmpRefno?.toLowerCase().includes(search) ||
                item.EmpName?.toLowerCase().includes(search) ||
                item.TransactionRefno?.toString().includes(search) ||
                item.CCCode?.toLowerCase().includes(search);
            const matchesMonth = filterMonth === 'All' || item.Month?.toString() === filterMonth?.toString();
            const matchesYear = filterYear === 'All' || item.Year?.toString() === filterYear?.toString();
            return matchesSearch && matchesMonth && matchesYear;
        });
    }, [combinedInbox, searchQuery, filterMonth, filterYear]);

    const months = [...new Set(combinedInbox.map(i => i.Month))].filter(Boolean).sort((a, b) => a - b);
    const years = [...new Set(combinedInbox.map(i => i.Year))].filter(Boolean).sort((a, b) => b - a);

    const getCurrentUser = () => userData?.userName || userData?.UID || 'system';

    // Initial load
    useEffect(() => {
        if (roleId) {
            dispatch(fetchVerifySalaryDeductions({ roleId }));
            dispatch(fetchVerifySalaryArear({ roleId }));
        }
    }, [roleId, dispatch]);

    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetAllData());
            dispatch(resetApprovalData());
            dispatch(clearDeductionActionResult());
            dispatch(clearArearActionResult());
        };
    }, [dispatch]);

    // Load details when deduction item selected
    useEffect(() => {
        if (selectedDeductionItemLocal && activeTab === 'deduction') {
            dispatch(fetchMonthDeductionForVerify({
                empTransactionRefNo: selectedDeductionItemLocal.EmpTransactionRefNo,
                empRefNo: selectedDeductionItemLocal.EmpRefno
            }));
            const moid = selectedDeductionItemLocal.MOID || 564;
            dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({ trno: selectedDeductionItemLocal.EmpTransactionRefNo?.toString(), moid }));
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedDeductionItemLocal, activeTab, dispatch, roleId]);

    // Load details when arear item selected
    useEffect(() => {
        if (selectedArearItemLocal && activeTab === 'arear') {
            dispatch(fetchArearCCAmount({
                empRefno: selectedArearItemLocal.EmpRefno,
                empTransno: selectedArearItemLocal.EmpTransactionRefNo,
                head: selectedArearItemLocal.SalaryHead
            }));
            const moid = selectedArearItemLocal.MOID || 564;
            dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));
            dispatch(setSelectedMOID(moid));
            dispatch(fetchRemarks({ trno: selectedArearItemLocal.TransactionRefno?.toString(), moid }));
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedArearItemLocal, activeTab, dispatch, roleId]);

    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    const handleRefresh = () => {
        if (roleId) {
            dispatch(fetchVerifySalaryDeductions({ roleId }));
            dispatch(fetchVerifySalaryArear({ roleId }));
        }
    };

    const handleItemSelect = (item) => {
        const type = item._type;
        dispatch(setActiveTab(type));
        if (type === 'deduction') {
            setSelectedDeductionItemLocal(item);
            setSelectedArearItemLocal(null);
            dispatch(setSelectedDeductionItem(item));
        } else {
            setSelectedArearItemLocal(item);
            setSelectedDeductionItemLocal(null);
            dispatch(setSelectedArearItem(item));
        }
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) return toast.error('No record selected');
        if (!verificationComment.trim()) return toast.error('Verification comment is mandatory');
        if (!isVerified) return toast.error('Please check the verification checkbox to proceed');

        const actionValue = action.value || action.text || 'Verify';

        try {
            if (activeTab === 'deduction') {
                const deductionHeads = monthDeductionDetailsArray.map(d => d.HeadName).join('|') + '|';
                const deductionAmounts = monthDeductionDetailsArray.map(d => d.Amount).join('|') + '|';
                const deductionHeadIds = monthDeductionDetailsArray.map(d => d.Id).join('|') + '|';

                const payload = {
                    empRefno: selectedItem.EmpRefno,
                    empTransactionRefNo: selectedItem.EmpTransactionRefNo,
                    deductionHeads,
                    deductionAmounts,
                    deductionHeadIds,
                    ccCode: selectedItem.CCCode,
                    roleId,
                    createdBy: getCurrentUser(),
                    action: actionValue,
                    note: verificationComment.trim(),
                    transactionRefno: selectedItem.TransactionRefno
                };
                await dispatch(approveSingleSalaryDeduction(payload)).unwrap();
            } else {
                const ccJsonstring = JSON.stringify(arearCCAmountArray);
                const totalAmount = arearCCAmountArray.reduce((s, cc) => s + (cc.Amount || 0), 0);

                const payload = {
                    empRefno: selectedItem.EmpRefno,
                    empTransactionRefNo: selectedItem.EmpTransactionRefNo,
                    totalAmount: totalAmount.toString(),
                    ccJsonstring,
                    ccCode: selectedItem.CCCode,
                    roleId,
                    createdBy: getCurrentUser(),
                    action: actionValue,
                    note: verificationComment.trim(),
                    transactionRefno: selectedItem.TransactionRefno,
                    id: selectedItem.Id
                };
                await dispatch(approveSalaryArear(payload)).unwrap();
            }

            toast.success(`${actionValue} completed successfully!`);
            setTimeout(() => {
                dispatch(fetchVerifySalaryDeductions({ roleId }));
                dispatch(fetchVerifySalaryArear({ roleId }));
                if (activeTab === 'deduction') {
                    setSelectedDeductionItemLocal(null);
                    dispatch(setSelectedDeductionItem(null));
                } else {
                    setSelectedArearItemLocal(null);
                    dispatch(setSelectedArearItem(null));
                }
                setVerificationComment('');
                setIsVerified(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetApprovalData());
                dispatch(clearDeductionActionResult());
                dispatch(clearArearActionResult());
            }, 1000);
        } catch (error) {
            toast.error(typeof error === 'string' ? error : error?.message || 'Action failed', { autoClose: 8000 });
        }
    };

    const handleRejectConfirm = async (note) => {
        if (!rejectItem || !selectedItem) return;
        try {
            if (activeTab === 'deduction') {
                const deductionHeads = monthDeductionDetailsArray.map(d => d.HeadName).join('|') + '|';
                const deductionAmounts = monthDeductionDetailsArray.map(d => d.Amount).join('|') + '|';
                const deductionHeadIds = monthDeductionDetailsArray.map(d => d.Id).join('|') + '|';
                const payload = {
                    empRefno: selectedItem.EmpRefno,
                    empTransactionRefNo: selectedItem.EmpTransactionRefNo,
                    deductionHeads, deductionAmounts, deductionHeadIds,
                    ccCode: selectedItem.CCCode,
                    roleId, createdBy: getCurrentUser(),
                    action: 'Reject', note,
                    transactionRefno: selectedItem.TransactionRefno
                };
                await dispatch(approveSingleSalaryDeduction(payload)).unwrap();
            } else {
                const ccJsonstring = JSON.stringify(arearCCAmountArray);
                const totalAmount = arearCCAmountArray.reduce((s, cc) => s + (cc.Amount || 0), 0);
                const payload = {
                    empRefno: selectedItem.EmpRefno,
                    empTransactionRefNo: selectedItem.EmpTransactionRefNo,
                    totalAmount: totalAmount.toString(), ccJsonstring,
                    ccCode: selectedItem.CCCode,
                    roleId, createdBy: getCurrentUser(),
                    action: 'Reject', note,
                    transactionRefno: selectedItem.TransactionRefno,
                    id: selectedItem.Id
                };
                await dispatch(approveSalaryArear(payload)).unwrap();
            }
            toast.success(`Rejected successfully`);
            setRejectItem(null);
            dispatch(fetchVerifySalaryDeductions({ roleId }));
            dispatch(fetchVerifySalaryArear({ roleId }));
            if (activeTab === 'deduction') {
                setSelectedDeductionItemLocal(null);
                dispatch(setSelectedDeductionItem(null));
            } else {
                setSelectedArearItemLocal(null);
                dispatch(setSelectedArearItem(null));
            }
            setIsLeftPanelCollapsed(false);
            dispatch(resetApprovalData());
        } catch (error) {
            toast.error(typeof error === 'string' ? error : error?.message || 'Rejection failed');
        }
    };

    const statsCards = [
        { icon: ArrowDownCircle, value: deductionInbox.length, label: 'Deductions Pending', color: 'indigo' },
        { icon: TrendingUp, value: arearInbox.length, label: 'Arears Pending', color: 'purple' },
        { icon: Users, value: combinedInbox.length, label: 'Total Pending', color: 'violet' },
        {
            icon: DollarSign,
            value: selectedItem
                ? activeTab === 'deduction'
                    ? `₹${monthDeductionDetailsArray.reduce((s, d) => s + (d.Amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : `₹${arearCCAmountArray.reduce((s, cc) => s + (cc.Amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                : '—',
            label: 'Selected Amount',
            color: 'blue'
        }
    ];

    // Left Panel Item Renderer
    const renderItemCard = (item) => {
        const isDeduction = item._type === 'deduction';
        return (
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center flex-shrink-0">
                        {isDeduction
                            ? <TrendingDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            : <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-0.5">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.EmpName}</h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.EmpRefno}</p>
                    </div>
                    <TypeBadge type={item._type} />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mt-2">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{item.CCCode}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.Month}/{item.Year}</span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">{item.PayRollForTheDate}</span>
                        <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 rounded text-xs font-medium text-indigo-600 dark:text-indigo-300">
                            #{item.Id}
                        </span>
                    </div>
                    {item._type === 'arear' && item.SalaryHead && (
                        <div className="flex items-center space-x-1 mt-1">
                            <Tag className="w-3 h-3 text-purple-500" />
                            <span className="truncate text-purple-600 dark:text-purple-400 text-xs">{item.SalaryHead}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item) => {
        if (!item) return null;
        const isDeduction = item._type === 'deduction';
        return (
            <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
                {isDeduction
                    ? <TrendingDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    : <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                }
            </div>
        );
    };

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const isDeduction = activeTab === 'deduction';

        return (
            <div className="space-y-6">
                {/* Detail View by type */}
                {isDeduction ? (
                    <DeductionDetailView
                        selectedItem={selectedItem}
                        deductionDetails={monthDeductionDetailsArray}
                        detailsLoading={deductionDetailsLoading}
                    />
                ) : (
                    <ArearDetailView
                        selectedItem={selectedItem}
                        ccAmountData={arearCCAmountArray}
                        ccLoading={arearCCAmountLoading}
                    />
                )}

                {/* Remarks History */}
                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(!showRemarksHistory)}
                    remarks={remarks}
                    loading={remarksLoading}
                    title="Approval History"
                />

                {/* Verification Input */}
                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel: `✓ I have verified the salary ${isDeduction ? 'deduction details' : 'arear details'} for ${selectedItem.EmpName}`,
                        checkboxDescription: isDeduction
                            ? 'Including deduction heads, amounts, and CC code allocations'
                            : 'Including arear amount, salary head, and CC-wise distribution',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: isDeduction
                            ? 'Please verify deduction heads, amounts, and any discrepancies...'
                            : 'Please verify arear amount, CC allocation, and any discrepancies...',
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

                {/* Reject Button */}
                {/* <div className="flex justify-end">
                    <button
                        onClick={() => setRejectItem(selectedItem)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                    </button>
                </div> */}

                {/* Action Buttons */}
                {statusLoading ? (
                    <div className="flex items-center justify-center space-x-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                        <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                    </div>
                ) : !hasActions || !enabledActions?.length ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700 text-center">
                        <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                            ℹ️ No actions available for this record
                        </p>
                    </div>
                ) : (
                    <ActionButtons
                        actions={enabledActions}
                        onActionClick={handleActionClick}
                        loading={isActionLoading}
                        isVerified={isVerified}
                        comment={verificationComment}
                        showValidation={true}
                        excludeActions={['send back']}
                    />
                )}
            </div>
        );
    };

    const inboxLoading = deductionListLoading || arearListLoading;
    const inboxError = deductionListError || arearListError;

    return (
        <div className="space-y-6">
            {/* Reject Modal */}
            {rejectItem && (
                <RejectConfirmModal
                    item={rejectItem}
                    type={activeTab}
                    onConfirm={handleRejectConfirm}
                    onCancel={() => setRejectItem(null)}
                    loading={isActionLoading}
                />
            )}

            {/* ── Header — matches VerifyStaffPayroll indigo/purple/violet gradient ── */}
            <InboxHeader
                title={`${InboxTitle || 'Salary Deduction & Arear Verification'} (${combinedInbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={combinedInbox.length}
                onBackClick={() => onNavigate?.('dashboard', { name: 'Dashboard', type: 'dashboard' })}
                HeaderIcon={Layers}
                badgeText="Deduction & Arear"
                badgeCount={combinedInbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by employee, ref no, CC code...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value)
                }}
                filters={[
                    { value: filterMonth, onChange: (e) => setFilterMonth(e.target.value), defaultLabel: 'All Months', options: months },
                    { value: filterYear, onChange: (e) => setFilterYear(e.target.value), defaultLabel: 'All Years', options: years }
                ]}
            />

            {/* Stats */}
            <div className="px-6 mb-6">
                <StatsCards
                    cards={statsCards}
                    variant="simple"
                    gridCols="grid-cols-1 md:grid-cols-4"
                    gap="gap-4"
                />
            </div>

            {/* Body */}
            <div
                    className={`grid transition-all duration-300 ${
                        isLeftPanelCollapsed && !isLeftPanelHovered
                            ? 'grid-cols-1 lg:grid-cols-12 gap-2'
                            : 'grid-cols-1 lg:grid-cols-3 gap-6'
                    }`}
                    onMouseLeave={() => {
                        if (selectedItem && isLeftPanelCollapsed) setIsLeftPanelHovered(false);
                    }}
                >
                    {/* Left Panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-1' : 'lg:col-span-1'}>
                        <LeftPanel
                            items={filteredInbox}
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
                                emptyMessage: 'No deduction or arear records pending verification',
                                itemKey: 'EmpTransactionRefNo',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
                            }}
                        />
                    </div>

                    {/* Detail Panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            {/* Detail Header */}
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl flex items-center space-x-2">
                                <div className={`p-2 rounded-lg ${
                                    selectedItem
                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                }`}>
                                    {selectedItem
                                        ? activeTab === 'deduction'
                                            ? <TrendingDown className="w-4 h-4 text-white" />
                                            : <TrendingUp className="w-4 h-4 text-white" />
                                        : <Layers className="w-4 h-4 text-white" />
                                    }
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {selectedItem
                                        ? `${activeTab === 'deduction' ? 'Deduction' : 'Arear'} Verification`
                                        : 'Verification Details'
                                    }
                                </h2>
                                {selectedItem && (
                                    <TypeBadge type={activeTab} />
                                )}
                            </div>

                            {/* Detail Body */}
                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Layers className="w-12 h-12 text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Record Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                                            Select a salary deduction or arear record from the left panel to view details and process verification.
                                        </p>
                                        <div className="flex items-center justify-center space-x-4 mt-6">
                                            <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                                <TrendingDown className="w-4 h-4 text-indigo-500" />
                                                <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">{deductionInbox.length} Deductions</span>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-700">
                                                <TrendingUp className="w-4 h-4 text-purple-500" />
                                                <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">{arearInbox.length} Arears</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center space-x-2 mt-4 text-indigo-500 text-xs">
                                            <ChevronRight className="w-4 h-4" />
                                            <span>Select from the left panel</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default VerifySalaryDeductionArear;