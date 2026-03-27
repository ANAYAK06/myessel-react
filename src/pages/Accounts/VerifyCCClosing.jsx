import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    XCircle, Building2, Calendar, Hash, FileText, Clock,
    IndianRupee, BarChart2, CheckCircle2, AlertTriangle,
} from 'lucide-react';

// ─── Shared Inbox Components ──────────────────────────────────────────────────
import InboxHeader       from '../../components/Inbox/InboxHeader';
import StatsCards        from '../../components/Inbox/StatsCards';
import ActionButtons     from '../../components/Inbox/ActionButtons';
import RemarksHistory    from '../../components/Inbox/RemarksHistory';
import LeftPanel         from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

// ─── CC Closing slice ─────────────────────────────────────────────────────────
import {
    fetchVerifyCCClosingGrid,
    fetchVerifyCCClosingView,
    submitApproveCCClose,
    clearApproveResult,
    clearVerifyDetail,
    resetCCClosing,
    selectVerifyList,
    selectVerifyDetail,
    selectVerifyListLoading,
    selectVerifyDetailLoading,
    selectApproveLoading,
    selectApproveResult,
} from '../../slices/accountsSlice/ccClosingSlice';

// ─── Shared: remarks history ──────────────────────────────────────────────────
import {
    fetchRemarks,
    selectRemarks,
    selectRemarksLoading,
    setSelectedMOID,
} from '../../slices/supplierPOSlice/purcahseHelperSlice';

// ─── Shared: status / action buttons ─────────────────────────────────────────
import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton,
} from '../../slices/CommonSlice/getStatusSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const CLOSING_TYPE_LABELS = {
    5: 'Temporary Close',
    6: 'Permanent Close',
    7: 'Re-Open CC',
    8: 'Complete Close',
};

const CLOSING_TYPE_COLORS = {
    5: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    6: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    7: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    8: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

// ─── Component ────────────────────────────────────────────────────────────────

const VerifyCCClosing = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    // ── Selectors ────────────────────────────────────────────────────────────
    const verifyList    = useSelector(selectVerifyList);
    const verifyDetail  = useSelector(selectVerifyDetail);
    const listLoading   = useSelector(selectVerifyListLoading);
    const detailLoading = useSelector(selectVerifyDetailLoading);
    const approveLoading = useSelector(selectApproveLoading);
    const approveResult  = useSelector(selectApproveResult);

    const remarks        = useSelector(selectRemarks);
    const remarksLoading = useSelector(selectRemarksLoading);

    const statusLoading  = useSelector(selectStatusListLoading);
    const statusError    = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions     = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector(s => s.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    const { InboxTitle, ModuleDisplayName, RoleId } = notificationData || {};
    const effectiveRoleId = RoleId || roleId;

    // ── Local state ──────────────────────────────────────────────────────────
    const [selectedItem,         setSelectedItem]         = useState(null);
    const [isVerified,           setIsVerified]           = useState(false);
    const [verificationComment,  setVerificationComment]  = useState('');
    const [showRemarksHistory,   setShowRemarksHistory]   = useState(false);
    const [searchQuery,          setSearchQuery]          = useState('');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]   = useState(false);

    const getCurrentUser     = () => userData?.userName || userDetails?.userName || userName || 'system';
    const getCurrentRoleName = () =>
        userDetails?.roleName || userData?.roleName ||
        notificationData?.InboxTitle || 'CC Closing Verifier';

    // ── Init ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (effectiveRoleId) {
            dispatch(fetchVerifyCCClosingGrid({
                roleId:  effectiveRoleId,
                created: getCurrentUser(),
                userId,
            }));
        }
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetCCClosing());
            dispatch(resetApprovalData());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, effectiveRoleId]);

    // ── Fetch detail when item selected ──────────────────────────────────────
    useEffect(() => {
        if (selectedItem?.Tranno) {
            dispatch(clearVerifyDetail());
            dispatch(fetchVerifyCCClosingView({
                tranno: selectedItem.Tranno,
                rid:    effectiveRoleId,
                typeid: selectedItem.ClosingTypeid || selectedItem.Typeid || selectedItem.TypeId || '',
            }));
            setIsVerified(false);
            setVerificationComment('');
            setShowRemarksHistory(false);
        }
    }, [selectedItem, dispatch, effectiveRoleId]);

    // ── Fetch status list when detail loads ───────────────────────────────────
    useEffect(() => {
        if (selectedItem && verifyDetail?.MOID && effectiveRoleId) {
            dispatch(fetchStatusList({
                MOID:   verifyDetail.MOID,
                ROID:   effectiveRoleId,
                ChkAmt: verifyDetail.Amount || verifyDetail.TotalCost || 0,
            }));
        }
    }, [selectedItem, verifyDetail?.MOID, effectiveRoleId, dispatch]);

    // ── Fetch remarks history ─────────────────────────────────────────────────
    useEffect(() => {
        if (selectedItem && verifyDetail?.MOID) {
            dispatch(setSelectedMOID(verifyDetail.MOID));
            dispatch(fetchRemarks({
                trno: verifyDetail.Tranno || selectedItem.Tranno || '',
                moid: verifyDetail.MOID,
            }));
        }
    }, [selectedItem, verifyDetail?.MOID, dispatch]);

    // ── Auto-collapse left panel when item selected ───────────────────────────
    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Approve result ────────────────────────────────────────────────────────
    useEffect(() => {
        if (approveResult) {
            dispatch(clearApproveResult());
            setTimeout(() => {
                dispatch(fetchVerifyCCClosingGrid({
                    roleId:  effectiveRoleId,
                    created: getCurrentUser(),
                    userId,
                }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearVerifyDetail());
                dispatch(resetApprovalData());
            }, 1000);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [approveResult, dispatch]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleRefresh = () => {
        dispatch(fetchVerifyCCClosingGrid({
            roleId:  effectiveRoleId,
            created: getCurrentUser(),
            userId,
        }));
        if (selectedItem?.Tranno) {
            dispatch(fetchVerifyCCClosingView({
                tranno: selectedItem.Tranno,
                rid:    effectiveRoleId,
                typeid: selectedItem.ClosingTypeid || selectedItem.Typeid || selectedItem.TypeId || '',
            }));
        }
    };

    const handleItemSelect = (item) => {
        dispatch(clearVerifyDetail());
        setSelectedItem(item);
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No CC closing record selected.'); return; }
        if (!verificationComment.trim()) {
            toast.error('Verification comment is mandatory.');
            return;
        }
        if (!isVerified) {
            toast.error('Please check the verification checkbox before proceeding.');
            return;
        }

        let actionValue = action.value || action.text || action.type;
        if (!actionValue?.trim()) {
            const map = { approve: 'Approve', verify: 'Verify', reject: 'Reject', return: 'Return' };
            actionValue = map[action.type?.toLowerCase()] || 'Verify';
        }

        const d = verifyDetail || {};
        const payload = {
            STranno:        d.Tranno       || selectedItem.Tranno       || '',
            SId:            d.Id           || selectedItem.Id           || 0,
            SCCClosingDate: d.CCClosingDate || d.ClosingDate             || '',
            SAlertnote:     d.Alertnote    || d.AlertNote               || '',
            SRemarks:       verificationComment.trim(),
            Appstatus:      actionValue,
            SRoleID:        effectiveRoleId,
            SCreatedby:     getCurrentUser(),
            SUserId:        userId,
            SCCStartDate:   d.CCStartDate  || d.StartDate               || '',
            SCCEndDate:     d.CCEndDate    || d.EndDate                 || '',
            SClosingTypeid: d.ClosingTypeid || selectedItem.ClosingTypeid || selectedItem.Typeid || '',
            ResourceHead:   d.ResourceHead || '',
            ResDetails:     d.ResDetails   || '',
        };

        try {
            await dispatch(submitApproveCCClose(payload)).unwrap();

            const msg = actionValue.toLowerCase() === 'reject'
                ? 'CC Closing rejected successfully!'
                : 'CC Closing verified successfully!';
            toast.success(msg);

            setTimeout(() => {
                dispatch(fetchVerifyCCClosingGrid({
                    roleId:  effectiveRoleId,
                    created: getCurrentUser(),
                    userId,
                }));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearVerifyDetail());
                dispatch(resetApprovalData());
            }, 1000);
        } catch (err) {
            const msg = typeof err === 'string' ? err : err?.message || `Failed to ${actionValue.toLowerCase()}`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filteredItems = verifyList.filter(t => {
        const q = searchQuery.toLowerCase();
        return !q ||
            t.Tranno?.toLowerCase().includes(q)      ||
            t.CCCode?.toLowerCase().includes(q)       ||
            t.CCName?.toLowerCase().includes(q)       ||
            t.ClosingType?.toLowerCase().includes(q)  ||
            t.CreatedBy?.toLowerCase().includes(q);
    });

    // ── Stats ─────────────────────────────────────────────────────────────────
    const statsCards = [
        { icon: XCircle,      value: verifyList.length,               label: 'Pending Reviews',    color: 'indigo'  },
        { icon: Clock,        value: verifyList.length,               label: 'Awaiting Action',    color: 'purple'  },
        { icon: Building2,    value: verifyDetail?.CCCode || '—',     label: 'Selected CC',        color: 'blue'    },
        { icon: CheckCircle2, value: selectedItem ? '1' : '—',        label: 'In Review',          color: 'violet'  },
    ];

    // ── Left panel: item card ─────────────────────────────────────────────────
    const renderItemCard = (item) => {
        const typeId    = item.ClosingTypeid || item.Typeid || item.TypeId;
        const typeLabel = CLOSING_TYPE_LABELS[typeId] || item.ClosingType || 'CC Closing';
        const typeCls   = CLOSING_TYPE_COLORS[typeId] || 'bg-indigo-100 text-indigo-700';

        return (
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center flex-shrink-0">
                        <XCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {item.CCCode || item.Tranno}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.CCName || '—'}
                        </p>
                    </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                    <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate font-mono">{item.Tranno}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeCls}`}>
                            {typeLabel}
                        </span>
                        {item.ClosingDate && (
                            <span className="flex items-center gap-1 text-gray-400">
                                <Calendar className="w-3 h-3" />{item.ClosingDate}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderCollapsedItem = (item) => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800/50 dark:to-purple-800/50 flex items-center justify-center">
            <XCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail content ────────────────────────────────────────────────────────
    const renderDetailContent = () => {
        if (!selectedItem) return null;

        const d       = verifyDetail || {};
        const typeId  = d.ClosingTypeid || selectedItem?.ClosingTypeid || selectedItem?.Typeid;
        const typeLbl = CLOSING_TYPE_LABELS[typeId] || d.ClosingType || 'CC Closing';
        const typeCls = CLOSING_TYPE_COLORS[typeId] || 'bg-indigo-100 text-indigo-700';

        return (
            <div className="space-y-6">

                {/* Loading shimmer */}
                {detailLoading && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                        <span className="text-indigo-700 dark:text-indigo-400 text-sm">Loading closing details…</span>
                    </div>
                )}

                {/* ── Main Detail Card ──────────────────────────────────────── */}
                {verifyDetail && (
                    <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-700 overflow-hidden shadow-md">

                        {/* Card header */}
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 px-5 py-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <XCircle className="w-5 h-5" />
                                <span className="font-bold text-sm tracking-wide uppercase">
                                    CC Closing Record
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 border border-white/30`}>
                                    {typeLbl}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 border border-white/30 font-mono">
                                    {d.Tranno || selectedItem.Tranno}
                                </span>
                            </div>
                        </div>

                        {/* Card body */}
                        <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-gray-800 dark:to-gray-800 p-5 space-y-5">

                            {/* CC Info */}
                            <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Building2 className="w-3 h-3" /> Cost Center
                                </p>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{d.CCCode || selectedItem.CCCode || '—'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.CCName || selectedItem.CCName || ''}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeCls}`}>
                                        {typeLbl}
                                    </span>
                                </div>
                            </div>

                            {/* Dates grid */}
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                {[
                                    { label: 'Closing Date', value: d.CCClosingDate || d.ClosingDate },
                                    { label: 'CC Start Date', value: d.CCStartDate || d.StartDate },
                                    { label: 'CC End Date',   value: d.CCEndDate   || d.EndDate   },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-white dark:bg-gray-700/50 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800">
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {label}
                                        </p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-xs">{value || '—'}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Financial summary */}
                            {(d.Amount || d.TotalCost || d.TotalRevenue) && (
                                <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white shadow-lg">
                                    <p className="text-xs font-bold uppercase tracking-widest mb-3 text-indigo-200">
                                        Financial Summary
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {d.TotalRevenue != null && (
                                            <div>
                                                <p className="text-[10px] text-indigo-200 uppercase tracking-wide">Total Revenue</p>
                                                <p className="text-lg font-black flex items-center gap-0.5">
                                                    <IndianRupee className="w-4 h-4" />{fmt(d.TotalRevenue)}
                                                </p>
                                            </div>
                                        )}
                                        {d.TotalCost != null && (
                                            <div>
                                                <p className="text-[10px] text-indigo-200 uppercase tracking-wide">Total Cost</p>
                                                <p className="text-lg font-black flex items-center gap-0.5">
                                                    <IndianRupee className="w-4 h-4" />{fmt(d.TotalCost)}
                                                </p>
                                            </div>
                                        )}
                                        {d.Amount != null && (
                                            <div>
                                                <p className="text-[10px] text-indigo-200 uppercase tracking-wide">Amount</p>
                                                <p className="text-lg font-black flex items-center gap-0.5">
                                                    <IndianRupee className="w-4 h-4" />{fmt(d.Amount)}
                                                </p>
                                            </div>
                                        )}
                                        {d.NetProfit != null && (
                                            <div>
                                                <p className="text-[10px] text-indigo-200 uppercase tracking-wide">Net P&L</p>
                                                <p className={`text-lg font-black flex items-center gap-0.5 ${parseFloat(d.NetProfit) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                                                    <IndianRupee className="w-4 h-4" />{fmt(d.NetProfit)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Resource Head */}
                            {(d.ResourceHead || d.ResDetails) && (
                                <div className="grid grid-cols-2 gap-3">
                                    {d.ResourceHead && (
                                        <div className="bg-white dark:bg-gray-700/50 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
                                            <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1">Resource Head</p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{d.ResourceHead}</p>
                                        </div>
                                    )}
                                    {d.ResDetails && (
                                        <div className="bg-white dark:bg-gray-700/50 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
                                            <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1">Resource Details</p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{d.ResDetails}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* DCA Budget data */}
                            {Array.isArray(d.DCABudgetData) && d.DCABudgetData.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <BarChart2 className="w-3 h-3" /> DCA Budget Detail
                                    </p>
                                    <div className="rounded-xl overflow-hidden border border-indigo-200 dark:border-indigo-700">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                                    <th className="px-3 py-2 text-left font-semibold">DCA Head</th>
                                                    <th className="px-3 py-2 text-right font-semibold">Budget</th>
                                                    <th className="px-3 py-2 text-right font-semibold">Actual</th>
                                                    <th className="px-3 py-2 text-right font-semibold">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-indigo-100 dark:divide-indigo-800">
                                                {d.DCABudgetData.map((row, i) => (
                                                    <tr key={i} className="bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10">
                                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.DCAHead || row.DCAName || '—'}</td>
                                                        <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 font-mono">{fmt(row.Budget)}</td>
                                                        <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300 font-mono">{fmt(row.Actual)}</td>
                                                        <td className={`px-3 py-2 text-right font-mono font-semibold ${parseFloat(row.Balance) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {fmt(row.Balance)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Alert note */}
                            {d.Alertnote && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700 flex items-start gap-3">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Alert Note</p>
                                        <p className="text-sm text-amber-800 dark:text-amber-300">{d.Alertnote}</p>
                                    </div>
                                </div>
                            )}

                            {/* Remarks */}
                            {d.Remarks && (
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> Remarks
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800">
                                        {d.Remarks}
                                    </p>
                                </div>
                            )}

                            {/* Created by */}
                            {d.CreatedBy && (
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Hash className="w-3 h-3" />
                                    <span>Created by <span className="font-medium text-gray-700 dark:text-gray-300">{d.CreatedBy}</span></span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Remarks History ───────────────────────────────────────── */}
                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(v => !v)}
                    remarks={remarks}
                    loading={remarksLoading}
                    title="Approval History"
                />

                {/* ── Verification Input ────────────────────────────────────── */}
                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel:       '✓ I have reviewed the CC closing record thoroughly',
                        checkboxDescription: 'Including cost center dates, financial figures, and closing type',
                        commentLabel:        'Verification Comments',
                        commentPlaceholder:  'Please enter your verification remarks…',
                        commentRequired:     true,
                        commentRows:         4,
                        commentMaxLength:    500,
                        showCharCount:       true,
                        validationStyle:     'dynamic',
                        checkboxGradient:    'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient:     'from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
                        commentBorder:       'border-blue-200 dark:border-blue-700',
                    }}
                />

                {/* ── Action Buttons ────────────────────────────────────────── */}
                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                        <span className="text-gray-500 text-sm">Loading actions…</span>
                    </div>
                ) : statusError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-700">
                        <p className="text-red-600 dark:text-red-400 text-center text-sm">⚠️ Error loading actions: {statusError}</p>
                    </div>
                ) : !hasActions || !enabledActions?.length ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700">
                        <p className="text-yellow-700 dark:text-yellow-400 text-center text-sm">ℹ️ No actions available for this record</p>
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

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

            <InboxHeader
                title={`${InboxTitle || 'CC Closing Verification'} (${verifyList.length})`}
                subtitle={ModuleDisplayName}
                itemCount={verifyList.length}
                onBackClick={() => onNavigate?.('dashboard', { name: 'Dashboard', type: 'dashboard' })}
                HeaderIcon={XCircle}
                badgeText="CC Closing"
                badgeCount={verifyList.length}
                searchConfig={{
                    enabled:     true,
                    placeholder: 'Search by CC code, name, transaction no…',
                    value:       searchQuery,
                    onChange:    (e) => setSearchQuery(e.target.value),
                }}
                filters={[]}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600"
            />

            <div className="px-6 mb-6">
                <StatsCards
                    cards={statsCards}
                    variant="simple"
                    gridCols="grid-cols-1 md:grid-cols-4"
                    gap="gap-4"
                />
            </div>

            <div className="container mx-auto px-6">
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
                    {/* Left panel */}
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
                            loading={listLoading}
                            error={null}
                            onRefresh={handleRefresh}
                            config={{
                                title:          'Pending CC Closings',
                                icon:           Clock,
                                emptyMessage:   'No pending CC closing records found!',
                                itemKey:        'Tranno',
                                enableCollapse: true,
                                enableRefresh:  true,
                                enableHover:    true,
                                maxHeight:      '100%',
                                headerGradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
                            }}
                        />
                    </div>

                    {/* Right panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                        <XCircle className="w-4 h-4 text-white" />
                                    </div>
                                    <span>
                                        {selectedItem ? 'CC Closing Verification' : 'Closing Details'}
                                    </span>
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {selectedItem ? (
                                    renderDetailContent()
                                ) : (
                                    <div className="text-center py-14">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <XCircle className="w-12 h-12 text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No Record Selected
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            Select a CC closing record from the list to verify.
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

export default VerifyCCClosing;
