import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Package, Clock, Hash, Tag, ExternalLink,
    ShoppingCart, Link2, ChevronDown, ChevronUp,
    Pencil
} from 'lucide-react';

import InboxHeader      from '../../components/Inbox/InboxHeader';
import ActionButtons    from '../../components/Inbox/ActionButtons';
import RemarksHistory   from '../../components/Inbox/RemarksHistory';
import LeftPanel        from '../../components/Inbox/LeftPanel';
import RightDetailPanel  from '../../components/Inbox/RightDetailPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchItemCodeInbox,
    fetchItemCodeDetail,
    fetchItemCodeTraders,
    fetchItemCodeLinks,
    fetchItemCodeRemarks,
    submitItemCodeVerification,
    clearDetail,
    clearApprovalResult,
    resetAll,
    selectItemCodeInbox,
    selectItemCodeDetail,
    selectItemCodeTraders,
    selectItemCodeLinks,
    selectItemCodeRemarks,
    selectICLoading,
    selectICErrors,
} from '../../slices/purchaseSlice/itemCodeVerificationSlice';

import {
    fetchStatusList,
    selectEnabledActions,
    selectHasActions,
    selectStatusListLoading,
    selectStatusListError,
    resetApprovalData,
    setShowReturnButton,
} from '../../slices/CommonSlice/getStatusSlice';

// ── Component ─────────────────────────────────────────────────────────────────

const VerifyItemCode = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const inbox          = useSelector(selectItemCodeInbox);
    const detail         = useSelector(selectItemCodeDetail);
    const traders        = useSelector(selectItemCodeTraders);
    const links          = useSelector(selectItemCodeLinks);
    const remarks        = useSelector(selectItemCodeRemarks);
    const loading        = useSelector(selectICLoading);
    const errors         = useSelector(selectICErrors);

    const statusLoading  = useSelector(selectStatusListLoading);
    const statusError    = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions     = useSelector(selectHasActions);

    const { userData, userDetails } = useSelector((s) => s.auth);
    const roleId   = userData?.roleId || userData?.RID;
    const userName = userData?.userName || userDetails?.userName || 'system';

    // Local UI state
    const [selectedItem,         setSelectedItem]         = useState(null);
    const [isVerified,           setIsVerified]           = useState(false);
    const [verificationComment,  setVerificationComment]  = useState('');
    const [showRemarksHistory,   setShowRemarksHistory]   = useState(false);
    const [searchQuery,          setSearchQuery]          = useState('');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]   = useState(false);
    const [showTraders,          setShowTraders]          = useState(false);
    const [showLinks,            setShowLinks]            = useState(false);

    // Editable fields — verifier can update these
    const [editBasicprice,   setEditBasicprice]   = useState('');
    const [editItemname,     setEditItemname]     = useState('');
    const [editSpecification, setEditSpecification] = useState('');

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    const getCurrentRoleName = () =>
        userDetails?.roleName || userData?.roleName ||
        notificationData?.InboxTitle || 'Item Code Verifier';

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (roleId) dispatch(fetchItemCodeInbox(roleId));
        dispatch(setShowReturnButton('Yes'));
        return () => {
            dispatch(resetAll());
            dispatch(resetApprovalData());
        };
    }, [roleId, dispatch]);

    // Fetch detail when item selected
    useEffect(() => {
        if (!selectedItem) return;
        dispatch(fetchItemCodeDetail(selectedItem.Rowid));
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
        setShowTraders(false);
        setShowLinks(false);
        dispatch(clearDetail());
    }, [selectedItem, dispatch]);

    // After detail loads — fetch supplementary data and populate editable fields
    useEffect(() => {
        if (!detail || !roleId) return;

        const moid  = detail.MOID || 270;
        const tranNo = detail.TranNo || '';

        dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: 0 }));

        if (tranNo) {
            dispatch(fetchItemCodeTraders(tranNo));
            dispatch(fetchItemCodeLinks(tranNo));
            dispatch(fetchItemCodeRemarks(tranNo));
        }

        setEditBasicprice(detail.Basicprice || '');
        setEditItemname(detail.Itemname || '');
        setEditSpecification(detail.Specification || '');
    }, [detail, roleId, dispatch]);

    // Collapse left panel when item selected
    useEffect(() => {
        if (selectedItem) setIsLeftPanelCollapsed(true);
    }, [selectedItem]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleRefresh = () => {
        if (roleId) dispatch(fetchItemCodeInbox(roleId));
    };

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const buildPayload = (actionValue) => {
        const roleName = getCurrentRoleName();
        const existingRemarks = detail?.Remarks || '';
        const formatted = `${roleName} : ${userName} : ${verificationComment.trim()}`;
        const updatedRemarks = existingRemarks.trim()
            ? `${existingRemarks.trim()}||${formatted}`
            : formatted;

        return {
            Rowid:         detail?.Rowid || selectedItem?.Rowid || '',
            Remarks:       updatedRemarks,
            Appstatus:     actionValue,
            RoleID:        roleId,
            LastRoleID:    detail?.LastRoleID || null,
            Basicprice:    editBasicprice,
            Itemname:      editItemname,
            Specification: editSpecification,
            Createdby:     userName,
        };
    };

    const handleActionClick = async (action) => {
        if (!selectedItem) { toast.error('No item code selected.'); return; }
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

        try {
            const result = await dispatch(submitItemCodeVerification(buildPayload(actionValue))).unwrap();
            const msg = typeof result === 'string' ? result : JSON.stringify(result);
            toast.success(`${action.text || actionValue} completed successfully!`);
            if (msg.includes('$')) {
                const info = msg.split('$')[1];
                if (info) setTimeout(() => toast.info(info, { autoClose: 6000 }), 500);
            }
            setTimeout(() => {
                dispatch(fetchItemCodeInbox(roleId));
                setSelectedItem(null);
                setVerificationComment('');
                setIsVerified(false);
                setShowRemarksHistory(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearDetail());
                dispatch(resetApprovalData());
                dispatch(clearApprovalResult());
            }, 1000);
        } catch (err) {
            const msg = typeof err === 'string' ? err : err?.message || `Failed to ${actionValue.toLowerCase()}`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    // ── Filtered inbox ────────────────────────────────────────────────────────

    const filteredItems = inbox.filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.Itemname?.toLowerCase().includes(q) ||
            item.ItemCode?.toLowerCase().includes(q) ||
            item.Rowid?.toString().includes(q)
        );
    });

    // ── Left panel renderers ──────────────────────────────────────────────────

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                    <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
                        <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {item.Itemname || '—'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">
                        {item.ItemCode}
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap gap-1 text-xs">
                {item.Basicprice && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                        ₹ {item.Basicprice}
                    </span>
                )}
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                    <Hash className="w-3 h-3" />{item.Rowid}
                </span>
            </div>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Detail panel ──────────────────────────────────────────────────────────

    const Field = ({ label, value, mono }) => {
        if (!value) return null;
        return (
            <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-36 shrink-0 pt-0.5">{label}</span>
                <span className={`text-sm font-medium text-gray-900 dark:text-white ${mono ? 'font-mono tracking-wide' : ''}`}>
                    {value}
                </span>
            </div>
        );
    };

    const SectionToggle = ({ title, count, isOpen, onToggle, icon: Icon }) => (
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
        >
            <span className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                <Icon className="w-4 h-4" />
                {title}
                {count > 0 && (
                    <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-xs">{count}</span>
                )}
            </span>
            {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4 text-indigo-500" />}
        </button>
    );

    const renderDetailContent = (isPopup = false) => {
        if (!selectedItem) return null;

        return (
            <div className="space-y-6">
                {loading.detail && (
                    <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                        <span className="text-sm text-indigo-700 dark:text-indigo-400">Loading item code details...</span>
                    </div>
                )}

                {/* Header card */}
                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                            <Package className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {detail?.Itemname || selectedItem?.Itemname}
                            </h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5 font-mono">
                                {detail?.ItemCode || selectedItem?.ItemCode}
                                {detail?.TranNo && ` · Txn: ${detail.TranNo}`}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {detail?.TransactionType && (
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                        {detail.TransactionType}
                                    </span>
                                )}
                                {detail?.ItemCodeType && (
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                        {detail.ItemCodeType}
                                    </span>
                                )}
                                {detail?.Units && (
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                                        Unit: {detail.Units}
                                    </span>
                                )}
                                {detail?.Basicprice && (
                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                        Basic: ₹ {detail.Basicprice}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Item details grid */}
                {detail && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-indigo-500" /> Item Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                            <Field label="HSN Code"       value={detail.HSNCode}         mono />
                            <Field label="HSN Remarks"    value={detail.HSNRemarks} />
                            <Field label="DCA"            value={detail.ItemcodeDca} />
                            <Field label="Sub DCA"        value={detail.ItemcodeSDca} />
                            <Field label="Major Group"    value={detail.Majorgroupcode ? `${detail.Majorgroupcode}${detail.Majorgroupname ? ' — ' + detail.Majorgroupname : ''}` : null} />
                            <Field label="Sub Group"      value={detail.Subgroupcode ? `${detail.Subgroupcode}${detail.Subgroupname ? ' — ' + detail.Subgroupname : ''}` : null} />
                            <Field label="Spec Code"      value={detail.Specificationcode} mono />
                            <Field label="Row ID"         value={detail.Rowid} mono />
                        </div>

                        {detail.Specification && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Specification</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                                    {detail.Specification}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Editable fields (verifier can update) */}
                {detail && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-700 p-5">
                        <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Pencil className="w-4 h-4" /> Updatable Fields
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Basic Price
                                </label>
                                <input
                                    type="text"
                                    value={editBasicprice}
                                    onChange={(e) => setEditBasicprice(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-amber-300 dark:border-amber-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Item Name
                                </label>
                                <input
                                    type="text"
                                    value={editItemname}
                                    onChange={(e) => setEditItemname(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-amber-300 dark:border-amber-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Specification
                                </label>
                                <textarea
                                    rows={3}
                                    value={editSpecification}
                                    onChange={(e) => setEditSpecification(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-amber-300 dark:border-amber-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Traders section */}
                {detail?.TranNo && (
                    <div className="space-y-2">
                        <SectionToggle
                            title="Trader Quotes"
                            count={traders.length}
                            isOpen={showTraders}
                            onToggle={() => setShowTraders(!showTraders)}
                            icon={ShoppingCart}
                        />
                        {showTraders && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {loading.traders ? (
                                    <div className="p-6 text-center text-sm text-gray-500">Loading traders...</div>
                                ) : traders.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-gray-400">No trader data found.</div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-indigo-50 dark:bg-indigo-900/20">
                                            <tr>
                                                {['Supplier', 'Phone', 'Email', 'Rate', 'Amount', 'Basic'].map((h) => (
                                                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-indigo-700 dark:text-indigo-300">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {traders.map((t, i) => (
                                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                    <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">{t.SupName}</td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{t.Supphone}</td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{t.Supemail}</td>
                                                    <td className="px-4 py-2 text-green-700 dark:text-green-400 font-medium">₹ {t.SupRate}</td>
                                                    <td className="px-4 py-2 text-green-700 dark:text-green-400">₹ {t.SupAmt}</td>
                                                    <td className="px-4 py-2 text-indigo-700 dark:text-indigo-400">₹ {t.Basic}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Links section */}
                {detail?.TranNo && (
                    <div className="space-y-2">
                        <SectionToggle
                            title="Link Data"
                            count={links.length}
                            isOpen={showLinks}
                            onToggle={() => setShowLinks(!showLinks)}
                            icon={Link2}
                        />
                        {showLinks && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {loading.links ? (
                                    <div className="p-6 text-center text-sm text-gray-500">Loading links...</div>
                                ) : links.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-gray-400">No link data found.</div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-indigo-50 dark:bg-indigo-900/20">
                                            <tr>
                                                {['Link', 'Short Link', 'Rate', 'Amount', 'Basic'].map((h) => (
                                                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-indigo-700 dark:text-indigo-300">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {links.map((lk, i) => (
                                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                    <td className="px-4 py-2 max-w-xs truncate">
                                                        {lk.Link ? (
                                                            <a href={lk.Link} target="_blank" rel="noopener noreferrer"
                                                               className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                                                <ExternalLink className="w-3 h-3" /> View
                                                            </a>
                                                        ) : '—'}
                                                    </td>
                                                    <td className="px-4 py-2 max-w-xs truncate">
                                                        {lk.Linkshort ? (
                                                            <a href={lk.Linkshort} target="_blank" rel="noopener noreferrer"
                                                               className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                                                <ExternalLink className="w-3 h-3" /> View
                                                            </a>
                                                        ) : '—'}
                                                    </td>
                                                    <td className="px-4 py-2 text-green-700 dark:text-green-400 font-medium">₹ {lk.LinkRate}</td>
                                                    <td className="px-4 py-2 text-green-700 dark:text-green-400">₹ {lk.LinkAmt}</td>
                                                    <td className="px-4 py-2 text-indigo-700 dark:text-indigo-400">₹ {lk.Basic}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(!showRemarksHistory)}
                    remarks={remarks}
                    loading={loading.remarks}
                    title="Approval History"
                />

                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel: '✓ I have verified the item code details',
                        checkboxDescription: 'Confirm that the item name, HSN code, specification and pricing are correct',
                        commentLabel: 'Verification Comments',
                        commentPlaceholder: 'Enter your verification remarks...',
                        commentRequired: true,
                        commentRows: 3,
                        commentMaxLength: 500,
                        showCharCount: true,
                        validationStyle: 'dynamic',
                        checkboxGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        commentBorder: 'border-indigo-200 dark:border-indigo-700',
                    }}
                />

                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                        <span className="text-gray-600 dark:text-gray-400">Loading actions...</span>
                    </div>
                ) : statusError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-700 text-center text-sm text-red-600 dark:text-red-400">
                        ⚠️ Error loading actions: {statusError}
                    </div>
                ) : !hasActions || !enabledActions?.length ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700 text-center text-sm text-yellow-700 dark:text-yellow-400">
                        ℹ️ No actions available for this record
                    </div>
                ) : (
                    <ActionButtons
                        actions={enabledActions}
                        onActionClick={handleActionClick}
                        loading={loading.submit}
                        isVerified={isVerified}
                        comment={verificationComment}
                        showValidation={true}
                        excludeActions={['send back']}
                    />
                )}
            </div>
        );
    };


    // ── Main render ───────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <InboxHeader
                title={`${InboxTitle || 'Item Code Verification'} (${inbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={inbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={Package}
                badgeText="Item Code"
                badgeCount={inbox.length}
                searchConfig={{
                    enabled: true,
                    placeholder: 'Search by item name, code, row ID...',
                    value: searchQuery,
                    onChange: (e) => setSearchQuery(e.target.value),
                }}
                className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600"
            />

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
                            onItemSelect={setSelectedItem}
                            renderItem={renderItemCard}
                            renderCollapsedItem={renderCollapsedItem}
                            isCollapsed={isLeftPanelCollapsed}
                            onCollapseToggle={setIsLeftPanelCollapsed}
                            isHovered={isLeftPanelHovered}
                            onHoverChange={setIsLeftPanelHovered}
                            loading={loading.inbox}
                            error={errors.inbox}
                            onRefresh={handleRefresh}
                            config={{
                                title: 'Pending Verification',
                                icon: Clock,
                                emptyMessage: 'No item codes pending verification.',
                                itemKey: 'Rowid',
                                enableCollapse: true,
                                enableRefresh: true,
                                enableHover: true,
                                maxHeight: '100%',
                                headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                            }}
                            renderPopupContent={(_item) => renderDetailContent(true)}
                            popupConfig={{
                                title: 'Item Code Verification',
                                icon: Package,
                                headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                            }}
                        />
                    </div>

                    {/* Right panel */}
                    <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                        <RightDetailPanel
                            selectedItem={selectedItem}
                            loading={loading.detail}
                            renderContent={renderDetailContent}
                            config={{
                                title: 'Item Code Verification',
                                icon: Package,
                                selectedTitle: 'Item Code Verification',
                                emptyTitle: 'No Item Code Selected',
                                emptyMessage: 'Select an item code from the list to review and verify.',
                                headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                                maxHeight: 'calc(100vh - 200px)',
                                sticky: true,
                                stickyTop: '1.5rem',
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyItemCode;
