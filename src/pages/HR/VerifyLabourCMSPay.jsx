import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    HardHat, Clock, Users,
    Calendar, IndianRupee, Download,
    Banknote, Receipt, Loader2,
} from 'lucide-react';

import InboxHeader from '../../components/Inbox/InboxHeader';
import StatsCards from '../../components/Inbox/StatsCards';
import ActionButtons from '../../components/Inbox/ActionButtons';
import RemarksHistory from '../../components/Inbox/RemarksHistory';
import LeftPanel from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchLabourCMSInbox,
    fetchLabourCMSDetail,
    approveLabourCMSPayment,
    setSelectedTransactionNo,
    resetDetail,
    clearApprovalResult,
    resetVerificationData,
    selectInbox,
    selectDetail,
    selectWorkerGrid,
    selectApprovalResult,
    selectInboxLoading,
    selectDetailLoading,
    selectApproveLoading,
    selectInboxError,
} from '../../slices/HRSlice/labourCMSVerificationSlice';

import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedMOID,
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton,
} from '../../slices/CommonSlice/getStatusSlice';

import * as labourCMSAPI from '../../api/HRAPI/labourCMSPaymentAPI';

const formatCurrency = (v) =>
    parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const VerifyLabourCMSPay = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const inbox = useSelector(selectInbox);
    const inboxLoading = useSelector(selectInboxLoading);
    const inboxError = useSelector(selectInboxError);
    const detail = useSelector(selectDetail);
    const workerGrid = useSelector(selectWorkerGrid);
    const detailLoading = useSelector(selectDetailLoading);
    const approveLoading = useSelector(selectApproveLoading);
    useSelector(selectApprovalResult);

    const remarks = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading = useSelector(selectStatusListLoading);
    const statusError = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((state) => state.auth);
    const roleId = userData?.roleId || userData?.RID;

    const [selectedItem, setSelectedItem] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationComment, setVerificationComment] = useState('');
    const [showRemarksHistory, setShowRemarksHistory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMonth, setFilterMonth] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered, setIsLeftPanelHovered] = useState(false);
    const [excelLoading, setExcelLoading] = useState(false);

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    const getMonth = (i) => i.Month || i.PayrollMonth;
    const getYear  = (i) => i.Year  || i.PayrollYear;

    const months = [...new Set(inbox.map(getMonth))].filter(Boolean);
    const years  = [...new Set(inbox.map(getYear))].filter(Boolean);

    const getCurrentUser = () =>
        userData?.userName || userDetails?.userName || 'system';

    // Init
    useEffect(() => {
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetVerificationData());
            dispatch(resetApprovalData());
            dispatch(clearApprovalResult());
        };
    }, [dispatch]);

    useEffect(() => {
        if (roleId) {
            dispatch(fetchLabourCMSInbox(roleId));
        }
    }, [roleId, dispatch]);

    // Fetch detail when item selected
    useEffect(() => {
        if (selectedItem) {
            const transNo = selectedItem.CMSTransactionNo || selectedItem.TransactionNo;
            dispatch(setSelectedTransactionNo(transNo));
            dispatch(fetchLabourCMSDetail(transNo));
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch]);

    // Fetch status list when detail loads
    useEffect(() => {
        if (selectedItem && roleId && detail) {
            dispatch(fetchStatusList({
                MOID: 658,
                ROID: roleId,
                ChkAmt: detail?.TotalNetPaid || detail?.TotalAmount || detail?.Total || 0,
            }));
        }
    }, [selectedItem, roleId, detail, dispatch]);

    // Fetch remarks
    useEffect(() => {
        if (selectedItem && detail) {
            const trno = (detail?.NotiRefNo || '').toString();
            dispatch(setSelectedMOID(658));
            dispatch(fetchRemarks({ trno, moid: 658 }));
        }
    }, [selectedItem, detail, dispatch]);

    // Collapse left panel when item selected
    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    const handleRefresh = () => {
        if (roleId) {
            dispatch(fetchLabourCMSInbox(roleId));
            if (selectedItem) {
                const transNo = selectedItem.CMSTransactionNo || selectedItem.TransactionNo;
                dispatch(fetchLabourCMSDetail(transNo));
            }
        }
    };

    const buildApprovalPayload = (actionValue) => ({
        CMSTransactionNo: detail?.CMSTransactionNo || selectedItem?.CMSTransactionNo || '',
        RoleId: roleId,
        Action: actionValue,
        Note: verificationComment.trim(),
        CreatedBy: getCurrentUser(),
    });

    const handleActionClick = async (action) => {
        if (!selectedItem) {
            toast.error('No Labour CMS record selected');
            return;
        }
        if (!verificationComment.trim()) {
            toast.error('Please add your verification comment before proceeding');
            return;
        }
        if (!isVerified) {
            toast.error('Please check the verification checkbox before proceeding');
            return;
        }

        const typeMap = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
        const actionValue = action.value || action.text || typeMap[action.type?.toLowerCase()] || 'Verify';

        try {
            const result = await dispatch(approveLabourCMSPayment(buildApprovalPayload(actionValue))).unwrap();
            const msg = typeof result === 'string' ? result : (result?.Data?.Message || result?.Message || '');
            toast.success((msg || '').split('$')[0] || `${actionValue} completed successfully!`);

            setTimeout(() => {
                dispatch(fetchLabourCMSInbox(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(resetDetail());
                dispatch(resetApprovalData());
                dispatch(clearApprovalResult());
            }, 1000);
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Action failed', { autoClose: 8000 });
        }
    };

    const handleDownloadExcel = async () => {
        const transNo = detail?.CMSTransactionNo || selectedItem?.CMSTransactionNo;
        if (!transNo) return;
        setExcelLoading(true);
        try {
            const response = await labourCMSAPI.getExcel(transNo);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `LabourCMS_${transNo}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Excel downloaded');
        } catch {
            toast.error('Failed to download Excel');
        } finally {
            setExcelLoading(false);
        }
    };

    const filteredItems = inbox.filter((item) => {
        const matchSearch = !searchQuery ||
            (item.CMSTransactionNo || '').toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.ContractorCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.CCCode || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchMonth = filterMonth === 'All' || getMonth(item)?.toString() === filterMonth?.toString();
        const matchYear  = filterYear  === 'All' || getYear(item)?.toString()  === filterYear?.toString();
        return matchSearch && matchMonth && matchYear;
    });

    const statsCards = [
        { icon: Receipt, value: inbox.length, label: 'Total Records', color: 'blue' },
        { icon: Clock, value: inbox.length, label: 'Pending', color: 'purple' },
        {
            icon: IndianRupee,
            value: detail?.TotalNetPaid ? `₹${formatCurrency(detail.TotalNetPaid)}` : '-',
            label: 'Total Amount',
            color: 'indigo',
        },
        { icon: Users, value: workerGrid.length || 0, label: 'Workers', color: 'violet' },
    ];

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                    <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
                        <HardHat className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {item.CMSTransactionNo || item.TransactionNo}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {[item.ContractorCode, item.CCCode].filter(Boolean).join(' • ') || '—'}
                    </p>
                </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {getMonth(item)} {getYear(item)}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">
                        ₹{formatCurrency(item.TotalAmount || item.Total || 0)}
                    </span>
                </div>
            </div>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <HardHat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    const renderDetailContent = () => {
        if (!selectedItem) return null;
        const displayData = detail || selectedItem;

        return (
            <div className="space-y-6">
                {detailLoading && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                        <span className="text-indigo-700 dark:text-indigo-400 text-sm">Loading details...</span>
                    </div>
                )}

                {/* Summary banner */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <HardHat className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                    <Banknote className="w-3.5 h-3.5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    Labour CMS Payment
                                </h2>
                                <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
                                    {displayData.CMSTransactionNo || displayData.TransactionNo}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        {displayData.Month || displayData.PayrollMonth} {displayData.Year || displayData.PayrollYear}
                                    </span>
                                    {displayData.ContractorCode && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                            {displayData.ContractorCode}
                                        </span>
                                    )}
                                    {displayData.CCCode && (
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                            {displayData.CCCode}
                                        </span>
                                    )}
                                    {workerGrid.length > 0 && (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                            {workerGrid.length} Workers
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            {(displayData.TotalNetPaid || displayData.TotalAmount || displayData.Total) && (
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        ₹{formatCurrency(displayData.TotalNetPaid || displayData.TotalAmount || displayData.Total)}
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={handleDownloadExcel}
                                disabled={excelLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                            >
                                {excelLoading
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <Download className="h-4 w-4" />
                                }
                                Export Excel
                            </button>
                        </div>
                    </div>

                    {/* Detail cards row */}
                    {detail && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-indigo-200 dark:border-indigo-700">
                            {[
                                { label: 'PO Number', value: detail.PONo || '-' },
                                { label: 'Labour Type', value: detail.LabourType || '-' },
                                { label: 'CC Code', value: detail.CCCode || '-' },
                                { label: 'Workers', value: detail.WorkerCount || workerGrid.length || 0 },
                            ].map((card, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{card.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Worker grid table */}
                {workerGrid.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Worker Payment Details ({workerGrid.length})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                                    <tr>
                                        {['Labour ID', 'Name', 'Bank Name', 'Account No', 'IFSC', 'Basic Pay', 'Allowance Pay', 'Net Amount'].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {workerGrid.map((w, idx) => {
                                        const basic      = parseFloat(w.BasicAmount      || w.BasicPayNow    || w.BasicBalance    || 0);
                                        const allowance  = parseFloat(w.AllowanceAmount  || w.AllowancePayNow || w.AllowanceBalance || 0);
                                        const net        = parseFloat(w.NetAmount || w.Amount || 0) || basic + allowance;
                                        return (
                                            <tr key={idx} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                    {w.LabourId || w.WorkerCode || w.EmpRefNo || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {w.LabourName || w.WorkerName || w.Name || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {w.BankName || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                                                    {w.BankAccountNo || w.AccountNo || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                                                    {w.IFSCCode || w.IFSC || '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                                                    ₹{formatCurrency(basic)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                                                    ₹{formatCurrency(allowance)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right text-green-600 dark:text-green-400">
                                                    ₹{formatCurrency(net)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                    <tr>
                                        <td colSpan="5" className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">Total:</td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-600 dark:text-gray-400">
                                            ₹{formatCurrency(workerGrid.reduce((s, w) => s + parseFloat(w.BasicAmount || w.BasicPayNow || w.BasicBalance || 0), 0))}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-600 dark:text-gray-400">
                                            ₹{formatCurrency(workerGrid.reduce((s, w) => s + parseFloat(w.AllowanceAmount || w.AllowancePayNow || w.AllowanceBalance || 0), 0))}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                                            ₹{formatCurrency(workerGrid.reduce((s, w) => {
                                                const net = parseFloat(w.NetAmount || w.Amount || 0);
                                                const b   = parseFloat(w.BasicAmount || w.BasicPayNow || w.BasicBalance || 0);
                                                const a   = parseFloat(w.AllowanceAmount || w.AllowancePayNow || w.AllowanceBalance || 0);
                                                return s + (net || b + a);
                                            }, 0))}
                                        </td>
                                    </tr>
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
                        checkboxLabel: '✓ I have verified all Labour CMS payment details and worker information',
                        checkboxDescription: 'Including transaction number, contractor details, worker accounts, IFSC codes, and amounts',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Add your remarks regarding the Labour CMS payment...',
                        commentRequired: true,
                        commentRows: 4,
                        commentMaxLength: 1000,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                        commentBorder: 'border-indigo-200 dark:border-indigo-700',
                    }}
                />

                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                        <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                    </div>
                ) : statusError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-center">
                        Error loading actions: {statusError}
                    </div>
                ) : !hasActions || !enabledActions?.length ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 text-center">
                        No actions available for this record
                    </div>
                ) : (
                    <ActionButtons
                        actions={enabledActions}
                        onActionClick={handleActionClick}
                        loading={approveLoading}
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <InboxHeader
                title={`${InboxTitle || 'Labour CMS Payment Verification'} (${inbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={inbox.length}
                onBackClick={() => onNavigate?.('dashboard', { name: 'Dashboard', type: 'dashboard' })}
                HeaderIcon={HardHat}
                badgeText="Labour CMS"
                badgeCount={inbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by transaction no, contractor, CC...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                filters={[
                    {
                        value: filterMonth,
                        onChange: (e) => setFilterMonth(e.target.value),
                        defaultLabel: 'All Months',
                        options: months,
                    },
                    {
                        value: filterYear,
                        onChange: (e) => setFilterYear(e.target.value),
                        defaultLabel: 'All Years',
                        options: years,
                    },
                ]}
                className="bg-gradient-to-r from-indigo-600 via-purple-500 to-purple-600"
            />

            <div className="px-6 -mt-auto mb-6">
                <StatsCards
                    cards={statsCards}
                    variant="simple"
                    gridCols="grid-cols-1 md:grid-cols-4"
                    gap="gap-4"
                />
            </div>

            <div className="container mx-auto px-6">
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
                            onItemSelect={setSelectedItem}
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
                                emptyMessage: 'No Labour CMS records found',
                                itemKey: 'CMSTransactionNo',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                            }}
                            renderPopupContent={renderDetailContent}
                            popupConfig={{
                                title: 'Labour CMS Verification',
                                icon: HardHat,
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                            }}
                        />
                    </div>

                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                        <HardHat className="w-4 h-4 text-white" />
                                    </div>
                                    {selectedItem ? 'Labour CMS Verification' : 'Labour CMS Payment Details'}
                                </h2>
                            </div>
                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <HardHat className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Record Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Select a Labour CMS payment from the list to review and verify.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyLabourCMSPay;
