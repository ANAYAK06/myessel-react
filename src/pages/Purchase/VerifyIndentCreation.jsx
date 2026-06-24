import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ShoppingCart, Clock, Hash, Calendar, Building2,
    User, Package, ChevronDown, ChevronUp, Tag,
    FileText, Layers, CheckSquare, AlertCircle, BarChart2, X,
    ArrowRightLeft, RefreshCw, Ban,
} from 'lucide-react';

import { getIndentItemSummaryPopup } from '../../api/PurchaseAPI/indentCreationAPI';
import { getTradeItemCodes, getTradeItemDetails } from '../../api/PurchaseAPI/indentVerificationAPI';

import InboxHeader      from '../../components/Inbox/InboxHeader';
import StatsCards       from '../../components/Inbox/StatsCards';
import ActionButtons    from '../../components/Inbox/ActionButtons';
import RemarksHistory   from '../../components/Inbox/RemarksHistory';
import LeftPanel        from '../../components/Inbox/LeftPanel';
import VerificationInput from '../../components/Inbox/VerificationInput';

import {
    fetchIndentInbox,
    fetchIndentDetail,
    fetchIndentLevels,
    fetchItemsByCSKRole,
    fetchItemsByPUMRole,
    fetchItemsByOtherRole,
    fetchIndentSubtotal,
    fetchAssetItemCodes,
    fetchPumCCList,
    submitIndentVerification,
    submitSaveTradeItem,
    submitRejectTradeItem,
    submitRejectTradeItemAll,
    clearDetail,
    resetAll,
    selectIndentInbox,
    selectIndentDetail,
    selectIndentLevels,
    selectRoleType,
    selectIndentItems,
    selectIndentSubtotal,
    selectIndentLoading,
    selectIndentErrors,
    selectAssetItemCodes,
    selectPumCCList,
} from '../../slices/purchaseSlice/indentVerificationSlice';

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

const cn = (...c) => c.filter(Boolean).join(' ');

// ── Tiny shared UI ─────────────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value, valueClass }) => (
    <div className="flex items-start gap-2 py-1.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
        <Icon className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
        <span className="text-xs text-gray-500 dark:text-gray-400 w-32 shrink-0">{label}</span>
        <span className={cn('text-xs font-semibold text-gray-800 dark:text-gray-100 flex-1', valueClass)}>
            {value || '—'}
        </span>
    </div>
);

const StatusBadge = ({ status }) => {
    const s = (status || '').toLowerCase();
    const cls = s.includes('approv') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : s.includes('reject') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              : s.includes('pend')   ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    return (
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold', cls)}>
            {status || 'Pending'}
        </span>
    );
};

const RoleBadge = ({ roleType }) => {
    if (!roleType) return null;
    const config = {
        CSK:   { label: 'Stock Keeper (CSK)',     cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
        PUM:   { label: 'Purchase Manager (PUM)', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
        CC:    { label: 'Cost Centre Approval',   cls: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
        OTHER: { label: 'Senior Approver',        cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    }[roleType] || { label: roleType, cls: 'bg-gray-100 text-gray-600' };
    return (
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', config.cls)}>
            <CheckSquare className="w-3 h-3" />
            {config.label}
        </span>
    );
};

// ── Table helpers ─────────────────────────────────────────────────────────────

const Th = ({ children, right }) => (
    <th className={cn('px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 whitespace-nowrap', right ? 'text-right' : 'text-left')}>
        {children}
    </th>
);

const Td = ({ children, right, mono, className }) => (
    <td className={cn('px-2 py-2 text-xs text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700/50', right ? 'text-right' : 'text-left', mono && 'font-mono', className)}>
        {children}
    </td>
);

const fmtAmt = (v) => v != null ? Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—';

// ── Role-specific tables ───────────────────────────────────────────────────────

// CC / OTHER — read-only with row checkboxes
const ReadOnlyTable = ({ items, checkedItems, onToggle, roleType, onStockClick }) => {
    const allChecked = items.length > 0 && checkedItems.size === items.length;
    const isPUM_OTHER = roleType === 'OTHER';

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr>
                        <Th>
                            <input
                                type="checkbox"
                                checked={allChecked}
                                onChange={() => {
                                    if (allChecked) onToggle(null, true);
                                    else onToggle(null, false);
                                }}
                                className="w-3.5 h-3.5 accent-indigo-600"
                            />
                        </Th>
                        <Th>#</Th>
                        <Th>Item Code</Th>
                        <Th>Item Name</Th>
                        <Th>Specification</Th>
                        <Th>DCA / Sub DCA</Th>
                        <Th right>Basic Price</Th>
                        <Th>Units</Th>
                        <Th right>Indent Qty</Th>
                        {isPUM_OTHER && <Th right>Issued CS</Th>}
                        {isPUM_OTHER && <Th right>Issued New Stock</Th>}
                        {isPUM_OTHER && <Th right>Purchase Qty</Th>}
                        <Th right>Amount</Th>
                        <Th right>Avl at CC</Th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={item.IndentListId || idx}
                            className={cn('hover:bg-gray-50 dark:hover:bg-gray-700/30', checkedItems.has(item.IndentListId) && 'bg-green-50 dark:bg-green-900/10')}>
                            <Td>
                                <input
                                    type="checkbox"
                                    checked={checkedItems.has(item.IndentListId)}
                                    onChange={() => onToggle(item.IndentListId)}
                                    className="w-3.5 h-3.5 accent-indigo-600"
                                />
                            </Td>
                            <Td>{idx + 1}</Td>
                            <Td mono className="text-indigo-600 dark:text-indigo-400">{item.ItemCode?.trim()}</Td>
                            <Td>
                                <p className="truncate max-w-[160px]" title={item.ItemName}>{item.ItemName}</p>
                            </Td>
                            <Td>
                                <p className="truncate max-w-[140px] text-gray-500 dark:text-gray-400 text-[10px]" title={item.Specification}>{item.Specification || '—'}</p>
                            </Td>
                            <Td>
                                <span className="text-indigo-600 dark:text-indigo-400">{item.DcaCode}</span>
                                {item.SubDcaCode && <span className="text-gray-400"> / {item.SubDcaCode}</span>}
                            </Td>
                            <Td right>{fmtAmt(item.BasicPrice)}</Td>
                            <Td>{item.Units}</Td>
                            <Td right className="font-semibold">{item.Quantity}</Td>
                            {isPUM_OTHER && <Td right>{item.Stock || '0'}</Td>}
                            {isPUM_OTHER && <Td right>{item.NewStock || '0'}</Td>}
                            {isPUM_OTHER && <Td right>{item.PurchasedQty || '—'}</Td>}
                            <Td right className="font-semibold text-indigo-700 dark:text-indigo-300">
                                {fmtAmt(item.sumamt || item.Amount)}
                            </Td>
                            <Td right>
                                <button
                                    onClick={() => onStockClick?.(item)}
                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-800 dark:hover:text-indigo-200 flex items-center gap-1 ml-auto"
                                    title="View stock summary"
                                >
                                    <BarChart2 className="w-3 h-3" />
                                    {item.AvlQtyAtCC || item.AvailableQty || '0'}
                                </button>
                            </Td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// CSK — interactive issued qty inputs per row
const CSKTable = ({ items, rowInputs, onQtyChange, onAssetCodesToggle, checkedItems, onToggle, onStockClick, assetItemCodes }) => {
    const allChecked = items.length > 0 && checkedItems.size === items.length;
    const [openDropdown, setOpenDropdown] = useState(null);
    const [dropdownPos, setDropdownPos]   = useState({ top: 0, right: 0 });

    const openItem         = openDropdown ? items.find((i) => i.IndentListId === openDropdown) : null;
    const openOptions      = openItem ? (assetItemCodes?.[openItem.IndentListId]?.options ?? []) : [];
    const openSelectedCodes = openItem ? (rowInputs[openItem.IndentListId]?.selectedAssetCodes ?? []) : [];
    const openMaxQty       = openItem ? Math.max(1, Math.floor(parseFloat(openItem.Quantity) || 0)) : 1;

    const validateQty = (item, val) => {
        const v = parseFloat(val);
        const raised = parseFloat(item.Quantity) || 0;
        const avl = parseFloat(item.Stock || 0) + parseFloat(item.NewStock || 0);
        if (isNaN(v) || v < 0) return '0';
        if (v > raised) { toast.warn(`Issued qty cannot exceed raised qty (${raised})`); return String(raised); }
        return val;
    };

    return (
        <>
        <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr>
                        <Th>
                            <input type="checkbox" checked={allChecked}
                                onChange={() => onToggle(null, allChecked)}
                                className="w-3.5 h-3.5 accent-indigo-600" />
                        </Th>
                        <Th>#</Th>
                        <Th>Item Code</Th>
                        <Th>Item Name</Th>
                        <Th>Specification</Th>
                        <Th>DCA / Sub DCA</Th>
                        <Th right>Basic Price</Th>
                        <Th>Units</Th>
                        <Th right>Raised Qty</Th>
                        <Th right>Old Stock</Th>
                        <Th right>New Stock</Th>
                        <Th right>Avl Qty</Th>
                        <Th right>Issued Qty</Th>
                        <Th right>Amount</Th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => {
                        const isAsset = (item.ItemCode?.trim() || '').startsWith('1');
                        const qty = rowInputs[item.IndentListId]?.issuedQty ?? '0';
                        const basic = parseFloat(item.BasicPrice) || 0;
                        const raised = parseFloat(item.Quantity) || 0;
                        const issued = parseFloat(qty) || 0;
                        const remainAmt = basic * Math.max(0, raised - issued);

                        return (
                            <tr key={item.IndentListId || idx}
                                className={cn('hover:bg-gray-50 dark:hover:bg-gray-700/30', checkedItems.has(item.IndentListId) && 'bg-blue-50 dark:bg-blue-900/10')}>
                                <Td>
                                    <input type="checkbox" checked={checkedItems.has(item.IndentListId)}
                                        onChange={() => onToggle(item.IndentListId)}
                                        className="w-3.5 h-3.5 accent-indigo-600" />
                                </Td>
                                <Td>{idx + 1}</Td>
                                <Td mono className="text-indigo-600 dark:text-indigo-400">{item.ItemCode?.trim()}</Td>
                                <Td>
                                    <p className="truncate max-w-[150px]" title={item.ItemName}>{item.ItemName}</p>
                                </Td>
                                <Td>
                                    <p className="truncate max-w-[120px] text-[10px] text-gray-500 dark:text-gray-400" title={item.Specification}>{item.Specification || '—'}</p>
                                </Td>
                                <Td>
                                    <span className="text-indigo-600 dark:text-indigo-400">{item.DcaCode}</span>
                                    {item.SubDcaCode && <span className="text-gray-400"> / {item.SubDcaCode}</span>}
                                </Td>
                                <Td right>{fmtAmt(item.BasicPrice)}</Td>
                                <Td>{item.Units}</Td>
                                <Td right className="font-semibold">{item.Quantity}</Td>
                                <Td right className="text-amber-600 dark:text-amber-400">{item.Stock || '0'}</Td>
                                <Td right className="text-green-600 dark:text-green-400">{item.NewStock || '0'}</Td>
                                <Td right>
                                    <button
                                        onClick={() => onStockClick?.(item)}
                                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-800 dark:hover:text-indigo-200 flex items-center gap-1 ml-auto"
                                        title="View stock summary"
                                    >
                                        <BarChart2 className="w-3 h-3" />
                                        {item.AvailableQty || '0'}
                                    </button>
                                </Td>
                                <Td right>
                                    {isAsset ? (() => {
                                        const assetData     = assetItemCodes?.[item.IndentListId];
                                        const selectedCodes = rowInputs[item.IndentListId]?.selectedAssetCodes ?? [];
                                        const maxQty        = Math.max(1, Math.floor(raised));
                                        const isOpen        = openDropdown === item.IndentListId;

                                        if (assetData?.loading) {
                                            return <span className="text-[10px] text-gray-400 italic">Loading…</span>;
                                        }
                                        const options = assetData?.options || [];
                                        if (!options.length) {
                                            return <span className="text-[10px] text-gray-400 italic">No serials available</span>;
                                        }
                                        return (
                                            <button
                                                onClick={(e) => {
                                                    if (openDropdown === item.IndentListId) { setOpenDropdown(null); return; }
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                                                    setOpenDropdown(item.IndentListId);
                                                }}
                                                className={cn(
                                                    'flex items-center justify-between gap-1.5 text-xs border rounded px-2 py-1 min-w-[120px] focus:outline-none focus:ring-1 focus:ring-indigo-500',
                                                    selectedCodes.length
                                                        ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                                                        : 'border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                                )}
                                            >
                                                <span className="truncate">
                                                    {selectedCodes.length
                                                        ? `${selectedCodes.length} / ${maxQty} selected`
                                                        : '— Select Serial —'}
                                                </span>
                                                <ChevronDown className="w-3 h-3 shrink-0" />
                                            </button>
                                        );
                                    })() : (
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.0001"
                                            value={qty}
                                            onChange={(e) => {
                                                const validated = validateQty(item, e.target.value);
                                                onQtyChange(item.IndentListId, validated);
                                            }}
                                            className="w-20 px-2 py-1 text-right border border-indigo-300 dark:border-indigo-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    )}
                                </Td>
                                <Td right className="font-semibold text-indigo-700 dark:text-indigo-300">
                                    {fmtAmt(remainAmt)}
                                </Td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {/* Asset serial dropdown — rendered via portal so it escapes overflow:hidden/auto */}
        {openDropdown && openItem && createPortal(
            <>
                <div className="fixed inset-0 z-[9998]" onClick={() => setOpenDropdown(null)} />
                <div
                    className="z-[9999] bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-600 rounded-lg shadow-2xl"
                    style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, minWidth: 180, maxWidth: 240 }}
                >
                    <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                            Select up to {openMaxQty} serial(s)
                        </span>
                        <span className="text-[10px] text-gray-400">{openSelectedCodes.length}/{openMaxQty}</span>
                    </div>
                    <div className="p-1.5 space-y-0.5 max-h-52 overflow-y-auto">
                        {openOptions.map((opt) => {
                            const checked    = openSelectedCodes.includes(opt.ItemId);
                            const maxReached = !checked && openSelectedCodes.length >= openMaxQty;
                            return (
                                <label
                                    key={opt.ItemId}
                                    className={cn(
                                        'flex items-center gap-2 py-1 px-1.5 rounded select-none',
                                        maxReached ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
                                        checked && 'bg-indigo-50 dark:bg-indigo-900/30'
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        disabled={maxReached}
                                        onChange={() => onAssetCodesToggle(openItem.IndentListId, opt.ItemId, openMaxQty)}
                                        className="w-3.5 h-3.5 accent-indigo-600 shrink-0"
                                    />
                                    <span className="text-[11px] font-mono text-gray-700 dark:text-gray-200 truncate">
                                        {opt.Itemtext}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </>,
            document.body
        )}
        </>
    );
};

// PUM — issued new stock inputs + CC dropdown + trade item popup trigger
const PUMTable = ({ items, rowInputs, onQtyChange, checkedItems, onToggle, pumCCType, pumCCCode, pumCCList, pumCCLoading, onCCTypeChange, onCCCodeChange, onStockClick, onTradeItemClick }) => {
    const allChecked = items.length > 0 && checkedItems.size === items.length;

    const validateQty = (item, val) => {
        const v = parseFloat(val);
        const newStock = parseFloat(item.AvailableQty || 0);
        const issuedOld = parseFloat(item.IssuedQty || 0);
        const balance = Math.max(0, (parseFloat(item.Quantity) || 0) - issuedOld);
        if (isNaN(v) || v < 0) return '0';
        if (v > balance) { toast.warn(`Cannot exceed balance qty (${balance})`); return String(balance); }
        if (newStock > 0 && v > newStock) { toast.warn(`Exceeds available new stock (${newStock})`); return String(newStock); }
        return val;
    };

    return (
        <div className="space-y-3">
            {/* CC selector — dropdown populated from API */}
            <div className="flex flex-wrap gap-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-purple-700 dark:text-purple-300 whitespace-nowrap">CC Type</label>
                    <select
                        value={pumCCType}
                        onChange={(e) => onCCTypeChange(e.target.value)}
                        className="text-xs border border-purple-300 dark:border-purple-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                        <option value="">Select Type</option>
                        <option value="PCC">Performing</option>
                        <option value="NPCC">Non-Performing</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-purple-700 dark:text-purple-300 whitespace-nowrap">Issue From CC</label>
                    {pumCCLoading ? (
                        <span className="text-xs text-purple-500 dark:text-purple-400 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Loading…
                        </span>
                    ) : (
                        <select
                            value={pumCCCode}
                            onChange={(e) => onCCCodeChange(e.target.value)}
                            disabled={!pumCCType || pumCCList.length === 0}
                            className="text-xs border border-purple-300 dark:border-purple-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">{pumCCType ? (pumCCList.length === 0 ? 'No CC available' : '— Select CC —') : '— Select CC Type first —'}</option>
                            {pumCCList.map((cc, i) => (
                                <option key={cc.CCID || i} value={cc.CCID || ''}>
                                    {cc.CCVAL || cc.CCID}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                {pumCCCode && (
                    <div className="flex items-center">
                        <span className="text-[10px] text-purple-500 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                            New stock loaded for: <strong>{pumCCCode}</strong>
                        </span>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr>
                            <Th>
                                <input type="checkbox" checked={allChecked}
                                    onChange={() => onToggle(null, allChecked)}
                                    className="w-3.5 h-3.5 accent-indigo-600" />
                            </Th>
                            <Th>#</Th>
                            <Th>Item Code</Th>
                            <Th>Item Name</Th>
                            <Th>Specification</Th>
                            <Th>DCA / Sub DCA</Th>
                            <Th right>Basic Price</Th>
                            <Th>Units</Th>
                            <Th right>Indent Qty</Th>
                            <Th right>Old Issued</Th>
                            <Th right>Purchase Qty</Th>
                            <Th right>Issued New Stock</Th>
                            <Th right>Amount</Th>
                            <Th right>New Stock</Th>
                            <Th right>Avl at CC</Th>
                            <Th>Trade Issue</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => {
                            const isAsset   = (item.ItemCode?.trim() || '').startsWith('1');
                            const qty       = rowInputs[item.IndentListId]?.issuedQty ?? '0';
                            const noStock   = parseFloat(item.AvailableQty || 0) === 0;

                            return (
                                <tr key={item.IndentListId || idx}
                                    className={cn('hover:bg-gray-50 dark:hover:bg-gray-700/30', checkedItems.has(item.IndentListId) && 'bg-purple-50 dark:bg-purple-900/10')}>
                                    <Td>
                                        <input type="checkbox" checked={checkedItems.has(item.IndentListId)}
                                            onChange={() => onToggle(item.IndentListId)}
                                            className="w-3.5 h-3.5 accent-indigo-600" />
                                    </Td>
                                    <Td>{idx + 1}</Td>
                                    <Td mono className="text-indigo-600 dark:text-indigo-400">{item.ItemCode?.trim()}</Td>
                                    <Td><p className="truncate max-w-[150px]" title={item.ItemName}>{item.ItemName}</p></Td>
                                    <Td><p className="truncate max-w-[120px] text-[10px] text-gray-500 dark:text-gray-400" title={item.Specification}>{item.Specification || '—'}</p></Td>
                                    <Td>
                                        <span className="text-indigo-600 dark:text-indigo-400">{item.DcaCode}</span>
                                        {item.SubDcaCode && <span className="text-gray-400"> / {item.SubDcaCode}</span>}
                                    </Td>
                                    <Td right>{fmtAmt(item.BasicPrice)}</Td>
                                    <Td>{item.Units}</Td>
                                    <Td right className="font-semibold">{item.Quantity}</Td>
                                    <Td right className="text-amber-600 dark:text-amber-400">{item.IssuedQty || '0'}</Td>
                                    <Td right className="text-green-600 dark:text-green-400">{item.PurchasedQty || '0'}</Td>
                                    <Td right>
                                        {isAsset ? (
                                            <span className="text-[10px] text-gray-400 italic">Asset</span>
                                        ) : (
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.0001"
                                                value={qty}
                                                disabled={noStock}
                                                onChange={(e) => {
                                                    const v = validateQty(item, e.target.value);
                                                    onQtyChange(item.IndentListId, v);
                                                }}
                                                title={noStock ? 'No new stock available' : undefined}
                                                className={cn(
                                                    'w-20 px-2 py-1 text-right border rounded text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500',
                                                    noStock
                                                        ? 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-50'
                                                        : 'border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-800'
                                                )}
                                            />
                                        )}
                                    </Td>
                                    <Td right className="font-semibold text-indigo-700 dark:text-indigo-300">{fmtAmt(item.sumamt)}</Td>
                                    <Td right className={parseFloat(item.AvailableQty || 0) > 0 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-400'}>
                                        {item.AvailableQty || '0'}
                                    </Td>
                                    <Td right>
                                        <button
                                            onClick={() => onStockClick?.(item)}
                                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 ml-auto"
                                            title="View stock summary"
                                        >
                                            <BarChart2 className="w-3 h-3" />
                                            {item.AvlQtyAtCC || '0'}
                                        </button>
                                    </Td>
                                    <Td>
                                        <button
                                            onClick={() => onTradeItemClick?.(item)}
                                            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800/40 transition-colors whitespace-nowrap"
                                            title="Issue 5-series trade item"
                                        >
                                            <ArrowRightLeft className="w-3 h-3" />
                                            Trade Issue
                                        </button>
                                    </Td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ── Stock Summary Popup ────────────────────────────────────────────────────────

const typeStyle = (type) => {
    if (type === 'D') return 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-600';
    if (type === 'B') return 'bg-green-50 dark:bg-green-900/20 border-t border-gray-200 dark:border-gray-700';
    return '';
};
const typeQtyClass = (type) => {
    if (type === 'A') return 'text-blue-700 dark:text-blue-300';
    if (type === 'B') return 'text-green-700 dark:text-green-300 font-bold';
    if (type === 'C') return 'text-orange-600 dark:text-orange-400';
    if (type === 'D') return 'text-indigo-700 dark:text-indigo-200 font-extrabold text-base';
    return 'text-gray-700 dark:text-gray-300';
};

const StockSummaryPopup = ({ popup, onClose }) => {
    if (!popup.isOpen) return null;

    const first = popup.data?.[0];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-t-2xl p-4 flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart2 className="w-4 h-4 text-white/80 shrink-0" />
                            <span className="text-xs text-indigo-100 font-mono">{first?.PopItemCode}</span>
                            {first?.PopUnits && (
                                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">{first.PopUnits}</span>
                            )}
                        </div>
                        <h3 className="text-white font-bold text-sm leading-tight truncate">{first?.PopItemName}</h3>
                        {first?.PopSpec && (
                            <p className="text-indigo-200 text-[11px] mt-0.5 truncate">{first.PopSpec}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-3 p-1 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-colors shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4">
                    {popup.loading ? (
                        <div className="flex items-center justify-center py-10 gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Loading stock summary…</span>
                        </div>
                    ) : popup.error ? (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {popup.error}
                        </div>
                    ) : popup.data.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">No stock data available.</p>
                    ) : (
                        <div className="space-y-0.5 max-h-80 overflow-y-auto">
                            {popup.data.map((row, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'flex items-center justify-between px-3 py-2 rounded-lg',
                                        typeStyle(row.PopType)
                                    )}
                                >
                                    <span className={cn(
                                        'text-xs flex-1 pr-3',
                                        row.PopType === 'D' ? 'font-bold text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300'
                                    )}>
                                        {row.PopFor}
                                    </span>
                                    <span className={cn('text-sm tabular-nums shrink-0', typeQtyClass(row.PopType))}>
                                        {parseFloat(row.PopQuantity || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 pb-3 text-right">
                    <button
                        onClick={onClose}
                        className="text-xs px-4 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Trade Item Popup (5-series issue) ─────────────────────────────────────────

const TradeItemPopup = ({ isOpen, onClose, item, indentno, indentId, costcenter, tradeCC, userName, onQtyFilled, onAllQtyCleared, dispatch }) => {
    const [tradeList,        setTradeList]        = useState([]);
    const [loadingList,      setLoadingList]      = useState(false);
    const [selectedCode,     setSelectedCode]     = useState('');
    const [tradeDetail,      setTradeDetail]      = useState(null);
    const [loadingDetail,    setLoadingDetail]    = useState(false);
    const [tradeQty,         setTradeQty]         = useState('');
    const [saving,           setSaving]           = useState(false);

    useEffect(() => {
        if (!isOpen || !item) return;
        setTradeList([]);
        setSelectedCode('');
        setTradeDetail(null);
        setTradeQty('');
        setLoadingList(true);
        getTradeItemCodes(
            item.ItemCode?.trim() || '',
            item.Units || '',
            item.Quantity || '0',
            '1'
        )
            .then((res) => setTradeList(res?.Data || []))
            .catch(() => toast.error('Failed to fetch trade items'))
            .finally(() => setLoadingList(false));
    }, [isOpen, item]);

    const handleSelectCode = async (code) => {
        setSelectedCode(code);
        setTradeDetail(null);
        setTradeQty('');
        if (!code) return;
        setLoadingDetail(true);
        try {
            const res  = await getTradeItemDetails(code);
            const data = res?.Data;
            const d    = Array.isArray(data) ? data[0] : data;
            setTradeDetail(d);
            setTradeQty(String(d?.TradeItemQuantity ?? '0'));
        } catch {
            toast.error('Failed to fetch trade item details');
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleAdd = async () => {
        if (!selectedCode || !tradeDetail) { toast.warn('Select a trade item first'); return; }
        if (!tradeCC) { toast.warn('Select "Issue From CC" before adding trade item'); return; }
        setSaving(true);
        try {
            const result = await dispatch(submitSaveTradeItem({
                OldItemCode:   item.ItemCode?.trim(),
                TradeItemCode: selectedCode,
                Costcenter:    costcenter,
                TradeCC:       tradeCC,
                TradeQty:      String(tradeQty),
                IndentId:      String(indentId || ''),
                Createdby:     userName,
            })).unwrap();

            const parts = typeof result === 'string' ? result.split(',') : [];
            if (parts[0] === 'Submited') {
                toast.success(`Trade item issued${parts[1] ? `. Ref: ${parts[1]}` : ''}`);
                onQtyFilled(item.IndentListId, parseFloat(tradeQty) || 0);
                onClose();
            } else {
                toast.error(result || 'Save failed');
            }
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleReject = async () => {
        if (!tradeCC) { toast.warn('Select "Issue From CC" first'); return; }
        setSaving(true);
        try {
            await dispatch(submitRejectTradeItem({
                OldItemCode: item.ItemCode?.trim(),
                Costcenter:  costcenter,
                TradeCC:     tradeCC,
                TradeQty:    String(item.Quantity || '0'),
                IndentId:    String(indentId || ''),
                Createdby:   userName,
            })).unwrap();
            toast.success('Trade item rejected');
            onQtyFilled(item.IndentListId, 0);
            onClose();
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Reject failed');
        } finally {
            setSaving(false);
        }
    };

    const handleRejectAll = async () => {
        setSaving(true);
        try {
            await dispatch(submitRejectTradeItemAll({ Createdby: userName })).unwrap();
            toast.success('All trade items rejected');
            onAllQtyCleared();
            onClose();
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Reject all failed');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-t-2xl p-4 flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <ArrowRightLeft className="w-4 h-4 text-white/80 shrink-0" />
                            <span className="text-xs text-violet-200 font-mono">{item.ItemCode?.trim()}</span>
                            {item.Units && (
                                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">{item.Units}</span>
                            )}
                        </div>
                        <h3 className="text-white font-bold text-sm leading-tight">{item.ItemName}</h3>
                        <p className="text-violet-200 text-[11px] mt-1">
                            Indent Qty: <strong>{item.Quantity}</strong>
                            {tradeCC && <> &nbsp;·&nbsp; Issue From: <strong>{tradeCC}</strong></>}
                        </p>
                    </div>
                    <button onClick={onClose} className="ml-3 p-1 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-colors shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Step 1: Select trade item */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                            Select 5-Series Trade Item
                        </label>
                        {loadingList ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-2">
                                <RefreshCw className="w-4 h-4 animate-spin" /> Fetching matching trade items…
                            </div>
                        ) : tradeList.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500 italic">No matching trade items found for this item.</p>
                        ) : (
                            <select
                                value={selectedCode}
                                onChange={(e) => handleSelectCode(e.target.value)}
                                className="w-full text-xs border border-violet-300 dark:border-violet-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                                <option value="">— Select trade item —</option>
                                {tradeList.map((t, i) => (
                                    <option key={t.TItemCode || i} value={t.TItemCode || ''}>
                                        {t.TItemName || t.TItemCode}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Step 2: Trade item details */}
                    {loadingDetail && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <RefreshCw className="w-4 h-4 animate-spin" /> Loading details…
                        </div>
                    )}
                    {tradeDetail && !loadingDetail && (
                        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3 border border-violet-200 dark:border-violet-700 space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {tradeDetail.TradeItemSpecs && (
                                    <div className="col-span-2">
                                        <span className="text-violet-500 block text-[10px] uppercase tracking-wide">Specification</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-100">{tradeDetail.TradeItemSpecs}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-violet-500 block text-[10px] uppercase tracking-wide">Available Qty</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">{tradeDetail.TradeItemQuantity ?? '—'}</span>
                                </div>
                                <div>
                                    <span className="text-violet-500 block text-[10px] uppercase tracking-wide">Units</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-100">{item.Units || '—'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide block mb-1">
                                    Issue Qty
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={tradeQty}
                                    onChange={(e) => setTradeQty(e.target.value)}
                                    className="w-32 px-2 py-1 text-right text-sm border border-violet-300 dark:border-violet-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="px-4 pb-4 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-2">
                        <button
                            onClick={handleReject}
                            disabled={saving}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/40 font-semibold disabled:opacity-50"
                        >
                            <Ban className="w-3 h-3" /> Reject This
                        </button>
                        <button
                            onClick={handleRejectAll}
                            disabled={saving}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/40 font-semibold disabled:opacity-50"
                        >
                            <Ban className="w-3 h-3" /> Reject All
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="text-xs px-4 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium">
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={saving || !selectedCode || !tradeDetail}
                            className="flex items-center gap-1 text-xs px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ArrowRightLeft className="w-3 h-3" />}
                            {saving ? 'Saving…' : 'Add to Issued'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const VerifyIndentCreation = ({ notificationData, onNavigate }) => {
    const dispatch = useDispatch();

    const inbox        = useSelector(selectIndentInbox);
    const indentDetail = useSelector(selectIndentDetail);
    const levels       = useSelector(selectIndentLevels);
    const roleType     = useSelector(selectRoleType);
    const items        = useSelector(selectIndentItems);
    const remarks         = useSelector(selectRemarks);
    const remarksLoading  = useSelector(selectRemarksLoading);
    const subtotal       = useSelector(selectIndentSubtotal);
    const assetItemCodes = useSelector(selectAssetItemCodes);
    const pumCCList      = useSelector(selectPumCCList);
    const loading        = useSelector(selectIndentLoading);
    const errors         = useSelector(selectIndentErrors);

    const statusLoading  = useSelector(selectStatusListLoading);
    const statusError    = useSelector(selectStatusListError);
    const enabledActions = useSelector(selectEnabledActions);
    const hasActions     = useSelector(selectHasActions);

    const { userData } = useSelector((s) => s.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    const [selectedItem,         setSelectedItem]         = useState(null);
    const [rowInputs,            setRowInputs]            = useState({});
    const [checkedItems,         setCheckedItems]         = useState(new Set());
    const [pumCCType,            setPumCCType]            = useState('');
    const [pumCCCode,            setPumCCCode]            = useState('');
    const [verificationComment,  setVerificationComment]  = useState('');
    const [isVerified,           setIsVerified]           = useState(false);
    const [showRemarksHistory,   setShowRemarksHistory]   = useState(false);
    const [showItemsTable,       setShowItemsTable]       = useState(true);
    const [searchQuery,          setSearchQuery]          = useState('');
    const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
    const [isLeftPanelHovered,   setIsLeftPanelHovered]   = useState(false);
    const [stockPopup,           setStockPopup]           = useState({ isOpen: false, loading: false, data: [], error: null });
    const [tradePopup,           setTradePopup]           = useState({ isOpen: false, item: null });

    const { InboxTitle, ModuleDisplayName } = notificationData || {};

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    useEffect(() => {
        if (roleId) dispatch(fetchIndentInbox({ roleId, created: userName, userId }));
        dispatch(setShowReturnButton('Yes'));
        return () => { dispatch(resetAll()); dispatch(resetApprovalData()); };
    }, [roleId, userId, userName, dispatch]);

    // On item select: fetch detail + levels (if MOID available) + remarks + subtotal in parallel
    useEffect(() => {
        if (!selectedItem) return;
        const moid = selectedItem.MOID || selectedItem.Moid || 0;

        dispatch(fetchIndentDetail({ indentno: selectedItem.Indentno, roleId }));
        dispatch(setSelectedMOID(moid));
        dispatch(fetchRemarks({ trno: selectedItem.Indentno, moid }));
        dispatch(fetchIndentSubtotal(selectedItem.Indentno));

        if (moid) {
            dispatch(fetchIndentLevels({ MOID: moid, roleId }));
            dispatch(fetchStatusList({ MOID: moid, ROID: roleId, ChkAmt: selectedItem.ChkAmt || 0 }));
        }

        setRowInputs({});
        setCheckedItems(new Set());
        setPumCCType('');
        setPumCCCode('');
        setIsVerified(false);
        setVerificationComment('');
        setShowRemarksHistory(false);
        setShowItemsTable(true);
        setIsLeftPanelCollapsed(true);
    }, [selectedItem, roleId, dispatch]);

    // Fallback: if inbox item had no MOID, use MOID from indentDetail once it arrives
    useEffect(() => {
        if (!indentDetail?.MOID || !selectedItem) return;
        const inboxMoid = selectedItem.MOID || selectedItem.Moid || 0;
        if (!inboxMoid) {
            dispatch(fetchIndentLevels({ MOID: indentDetail.MOID, roleId }));
            dispatch(fetchStatusList({ MOID: indentDetail.MOID, ROID: roleId, ChkAmt: 0 }));
        }
    }, [indentDetail, selectedItem, roleId, dispatch]);

    // When levels arrive → fetch role-specific items
    useEffect(() => {
        if (!levels || !selectedItem) return;
        const { IndentPresentLevel: p, IndentDefineLevel: d, NewItemDefineLevel: n } = levels;
        const indent = selectedItem.Indentno;

        if (p === d) {
            dispatch(fetchItemsByCSKRole({ Indent: indent, Role: roleId }));
        } else if (n && p === n) {
            dispatch(fetchItemsByPUMRole({ Indent: indent, CCCode: '', CType: '' }));
        } else {
            dispatch(fetchItemsByOtherRole({ Indent: indent, Role: roleId }));
        }
    }, [levels, selectedItem, roleId, dispatch]);

    // Initialise row inputs when items arrive for interactive roles
    useEffect(() => {
        if (!items.length) return;
        if (roleType === 'CSK' || roleType === 'PUM') {
            const init = {};
            items.forEach((item) => { init[item.IndentListId] = { issuedQty: '0', selectedAssetCodes: [] }; });
            setRowInputs(init);
        }
        setCheckedItems(new Set());
    }, [items, roleType]);

    // Fetch asset serial codes for every asset row in CSK view
    useEffect(() => {
        if (roleType !== 'CSK' || !items.length || !selectedItem?.Costcenter) return;
        const cccode = selectedItem.Costcenter;
        items.forEach((item) => {
            const isAsset = (item.ItemCode?.trim() || '').startsWith('1');
            if (isAsset) {
                dispatch(fetchAssetItemCodes({ itemcode: item.ItemCode.trim(), cccode, indentListId: item.IndentListId }));
            }
        });
    }, [items, roleType, selectedItem, dispatch]);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleRefresh = useCallback(() => {
        if (roleId) dispatch(fetchIndentInbox({ roleId, created: userName, userId }));
    }, [roleId, userName, userId, dispatch]);

    const handleBackToInbox = () => {
        if (onNavigate) onNavigate('dashboard', { name: 'Dashboard', type: 'dashboard' });
    };

    const handleQtyChange = useCallback((indentListId, val) => {
        setRowInputs((prev) => ({ ...prev, [indentListId]: { ...prev[indentListId], issuedQty: val } }));
    }, []);

    const handleAssetCodesToggle = useCallback((indentListId, code, maxQty) => {
        setRowInputs((prev) => {
            const current = prev[indentListId]?.selectedAssetCodes || [];
            let updated;
            if (current.includes(code)) {
                updated = current.filter((c) => c !== code);
            } else if (current.length < maxQty) {
                updated = [...current, code];
            } else {
                toast.warn(`Only ${maxQty} serial(s) can be selected for this item`);
                return prev;
            }
            return { ...prev, [indentListId]: { ...prev[indentListId], selectedAssetCodes: updated } };
        });
    }, []);

    const handleToggleCheck = useCallback((id, clearAll = false) => {
        if (id === null) {
            // toggle-all
            setCheckedItems(clearAll ? new Set() : new Set(items.map((i) => i.IndentListId)));
            return;
        }
        setCheckedItems((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, [items]);

    // CC Type changes → fetch CC dropdown list, clear selected CC code
    const handlePumCCTypeChange = useCallback((cctype) => {
        setPumCCType(cctype);
        setPumCCCode('');
        if (cctype && selectedItem?.Indentno) {
            dispatch(fetchPumCCList({ Indentno: selectedItem.Indentno, cctype }));
        }
    }, [selectedItem, dispatch]);

    // CC Code selected from dropdown → auto-reload items with new CC
    const handlePumCCCodeChange = useCallback((cccode) => {
        setPumCCCode(cccode);
        if (cccode && selectedItem?.Indentno) {
            dispatch(fetchItemsByPUMRole({ Indent: selectedItem.Indentno, CCCode: cccode, CType: pumCCType }));
        }
    }, [selectedItem, pumCCType, dispatch]);

    // Trade item popup handlers
    const handleOpenTradePopup = useCallback((item) => {
        setTradePopup({ isOpen: true, item });
    }, []);

    const handleTradeQtyFilled = useCallback((indentListId, qty) => {
        setRowInputs((prev) => ({ ...prev, [indentListId]: { ...prev[indentListId], issuedQty: String(qty) } }));
    }, []);

    const handleAllTradeQtyCleared = useCallback(() => {
        setRowInputs((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((id) => { next[id] = { ...next[id], issuedQty: '0' }; });
            return next;
        });
    }, []);

    const handleOpenStockPopup = useCallback(async (itemCode, ccCode) => {
        if (!itemCode || !ccCode) return;
        setStockPopup({ isOpen: true, loading: true, data: [], error: null });
        try {
            const res = await getIndentItemSummaryPopup(itemCode, ccCode);
            setStockPopup({ isOpen: true, loading: false, data: res?.Data || [], error: null });
        } catch {
            setStockPopup({ isOpen: true, loading: false, data: [], error: 'Failed to load stock summary' });
        }
    }, []);

    const handleActionClick = async (action) => {
        if (!selectedItem || !indentDetail) { toast.error('No indent selected.'); return; }
        if (!verificationComment.trim()) { toast.error('Verification comment is required.'); return; }
        if (!isVerified) { toast.error('Please check the verification checkbox.'); return; }

        if ((roleType === 'CC' || roleType === 'OTHER') && checkedItems.size < items.length) {
            toast.error('Please verify all items by checking their checkboxes.'); return;
        }
        if (roleType === 'CSK' && checkedItems.size < items.length) {
            toast.error('Please verify all items by checking their checkboxes.'); return;
        }

        const actionText = action.value || action.text || action.type || '';
        const Action = actionText.toLowerCase().includes('reject') ? 'Reject'
                     : actionText.toLowerCase().includes('return') ? 'Return'
                     : actionText.toLowerCase().includes('approv') ? 'Approve'
                     : 'Verify';

        // Payload uses C# Indent model property names (not SP param names)
        // IC.Rowid → @Rid + @Nids + @Newids | IC.Remarks → @AprovalRemarks | IC.Appstatus → @Action
        // IC.RoleID → @RoleId | IC.Indentno → @IndentNo | IC.Qtys → @NQty + @NewQtys
        // IC.Amts → @Amounts | IC.TotalQtys → @Totalqty | IC.FromCC → @IssueNewStockCCCode
        const base = {
            Rowid:     indentDetail.Rowid || '',
            Indentno:  selectedItem.Indentno,
            Remarks:   verificationComment.trim(),
            Appstatus: Action,
            RoleID:    String(roleId),
            Createdby: userName,
        };

        let payload = base;

        if ((roleType === 'CSK' || roleType === 'PUM') && Action === 'Verify') {
            let Rowid = '', Qtys = '', Basics = '', Amts = '';
            let TotalQtys = 0;

            items.forEach((item) => {
                const isAsset = (item.ItemCode?.trim() || '').startsWith('1');
                if (!isAsset) {
                    const issued = parseFloat(rowInputs[item.IndentListId]?.issuedQty || 0);
                    const basic  = parseFloat(item.BasicPrice) || 0;
                    const raised = parseFloat(item.Quantity) || 0;
                    const remain = Math.max(0, raised - issued);
                    Rowid     += item.IndentListId + ',';
                    Qtys      += issued + ',';
                    Basics    += basic + ',';
                    Amts      += (basic * remain).toFixed(2) + ',';
                    TotalQtys += issued;
                }
            });

            // Rowid carries comma-sep IndentListIds for CSK/PUM (@Nids + @Newids both receive it)
            payload = { ...base, Rowid, Qtys, Basics, Amts, TotalQtys: String(TotalQtys) };

            if (roleType === 'PUM') {
                payload.FromCC = pumCCCode || '';
            }
        }

        try {
            await dispatch(submitIndentVerification(payload)).unwrap();
            const verb = { Reject: 'Rejected', Return: 'Returned', Approve: 'Approved', Verify: 'Verified' }[Action] || Action + 'd';
            toast.success(`Indent ${verb} successfully!`);

            setTimeout(() => {
                dispatch(fetchIndentInbox({ roleId, created: userName, userId }));
                setSelectedItem(null);
                setRowInputs({});
                setCheckedItems(new Set());
                setVerificationComment('');
                setIsVerified(false);
                setIsLeftPanelCollapsed(false);
                dispatch(clearDetail());
                dispatch(resetApprovalData());
            }, 800);
        } catch (err) {
            const msg = typeof err === 'string' ? err : err?.message || `Failed to ${Action.toLowerCase()} indent`;
            toast.error(msg, { autoClose: 10000 });
        }
    };

    // ── Filtered inbox ─────────────────────────────────────────────────────────

    const filteredItems = inbox.filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.Indentno?.toLowerCase().includes(q)   ||
            item.Costcenter?.toLowerCase().includes(q) ||
            item.Status?.toLowerCase().includes(q)     ||
            item.Date?.toLowerCase().includes(q)
        );
    });

    // ── Left panel card ────────────────────────────────────────────────────────

    const renderItemCard = (item) => (
        <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                    <div className="w-11 h-11 rounded-full border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono truncate">{item.Indentno}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.Costcenter}</p>
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <StatusBadge status={item.Status} />
                    {item.TotalAmount != null && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            ₹{Number(item.TotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                    )}
                </div>
                {item.Date && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{item.Date}</span>
                    </div>
                )}
                {item.CCType && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.CCType}</span>
                    </div>
                )}
            </div>
        </div>
    );

    const renderCollapsedItem = () => (
        <div className="w-full h-full rounded-lg border-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-800/40 dark:to-violet-800/40 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
    );

    // ── Right panel ────────────────────────────────────────────────────────────

    const renderItemsSection = () => {
        if (loading.levels || loading.items) {
            return (
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span className="text-sm text-blue-700 dark:text-blue-400">
                        {loading.levels ? 'Determining role level…' : 'Loading items…'}
                    </span>
                </div>
            );
        }

        if (!roleType && !loading.levels) {
            return (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700 text-sm text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Role level configuration not loaded yet.
                </div>
            );
        }

        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                    onClick={() => setShowItemsTable(!showItemsTable)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-b border-gray-200 dark:border-gray-700"
                >
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Indent Items {items.length > 0 && `(${items.length})`}
                        {roleType && <RoleBadge roleType={roleType} />}
                    </span>
                    {showItemsTable ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </button>

                {showItemsTable && (
                    <div className="p-1">
                        {items.length === 0 ? (
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                                No items found for this indent.
                            </p>
                        ) : roleType === 'CSK' ? (
                            <CSKTable
                                items={items}
                                rowInputs={rowInputs}
                                onQtyChange={handleQtyChange}
                                onAssetCodesToggle={handleAssetCodesToggle}
                                checkedItems={checkedItems}
                                onToggle={handleToggleCheck}
                                onStockClick={(item) => handleOpenStockPopup(item.ItemCode?.trim(), selectedItem?.Costcenter)}
                                assetItemCodes={assetItemCodes}
                            />
                        ) : roleType === 'PUM' ? (
                            <PUMTable
                                items={items}
                                rowInputs={rowInputs}
                                onQtyChange={handleQtyChange}
                                checkedItems={checkedItems}
                                onToggle={handleToggleCheck}
                                pumCCType={pumCCType}
                                pumCCCode={pumCCCode}
                                pumCCList={pumCCList}
                                pumCCLoading={loading.pumCCList}
                                onCCTypeChange={handlePumCCTypeChange}
                                onCCCodeChange={handlePumCCCodeChange}
                                onStockClick={(item) => handleOpenStockPopup(item.ItemCode?.trim(), selectedItem?.Costcenter)}
                                onTradeItemClick={handleOpenTradePopup}
                            />
                        ) : (
                            <ReadOnlyTable
                                items={items}
                                checkedItems={checkedItems}
                                onToggle={handleToggleCheck}
                                roleType={roleType}
                                onStockClick={(item) => handleOpenStockPopup(item.ItemCode?.trim(), selectedItem?.Costcenter)}
                            />
                        )}

                        {/* Subtotal row */}
                        {subtotal.length > 0 && (
                            <div className="flex flex-wrap gap-6 p-3 mt-1 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 text-xs">
                                {subtotal.map((s, i) => (
                                    <React.Fragment key={i}>
                                        {s.TotalAmount != null && (
                                            <span className="text-gray-600 dark:text-gray-300">
                                                Sub Total: <strong className="text-indigo-700 dark:text-indigo-300">₹{fmtAmt(s.TotalAmount)}</strong>
                                            </span>
                                        )}
                                        {s.IssueOldstockAmount > 0 && (
                                            <span className="text-gray-600 dark:text-gray-300">
                                                Issue CS: <strong className="text-amber-600 dark:text-amber-400">₹{fmtAmt(s.IssueOldstockAmount)}</strong>
                                            </span>
                                        )}
                                        {s.IssueNewStockAmount > 0 && (
                                            <span className="text-gray-600 dark:text-gray-300">
                                                Issue New Stock: <strong className="text-green-600 dark:text-green-400">₹{fmtAmt(s.IssueNewStockAmount)}</strong>
                                            </span>
                                        )}
                                        {s.NewPurchaseAmount > 0 && (
                                            <span className="text-gray-600 dark:text-gray-300">
                                                Purchase: <strong className="text-purple-700 dark:text-purple-400">₹{fmtAmt(s.NewPurchaseAmount)}</strong>
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderDetailContent = () => {
        if (!selectedItem) return null;

        return (
            <div className="space-y-5">
                {(loading.detail || loading.levels) && (
                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading indent details…</span>
                    </div>
                )}

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl p-5 border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
                            <ShoppingCart className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                                {selectedItem.Indentno}
                            </h2>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-0.5">
                                {selectedItem.Costcenter}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <StatusBadge status={selectedItem.Status} />
                                {roleType && <RoleBadge roleType={roleType} />}
                                {levels && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                        Level {levels.IndentPresentLevel} / {levels.IndentDefineLevel}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border p-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-indigo-200 dark:border-indigo-700">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-indigo-500">
                                <FileText className="h-3.5 w-3.5 text-white" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Indent Info</h4>
                        </div>
                        <InfoRow icon={Hash}     label="Indent No"  value={selectedItem.Indentno} />
                        <InfoRow icon={Calendar} label="Date"       value={selectedItem.Date} />
                        <InfoRow icon={Tag}      label="Status"     value={selectedItem.Status} />
                        <InfoRow icon={Package}  label="Material"   value={selectedItem.CapitalMaterialType?.trim()} />
                        {indentDetail?.IndentTypeDefine && (
                            <InfoRow icon={Layers} label="Type Define" value={indentDetail.IndentTypeDefine} />
                        )}
                    </div>

                    <div className="rounded-xl border p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-700">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-teal-500">
                                <Building2 className="h-3.5 w-3.5 text-white" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wide text-teal-600 dark:text-teal-400">Cost Centre</h4>
                        </div>
                        <InfoRow icon={Building2} label="Cost Centre"  value={selectedItem.Costcenter} />
                        <InfoRow icon={Layers}    label="CC Type"      value={selectedItem.CCType} />
                        <InfoRow icon={Hash}      label="Total Amount" value={selectedItem.TotalAmount != null ? `₹${Number(selectedItem.TotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : undefined} />
                        {levels && (
                            <InfoRow icon={User} label="Role Level" value={`Present: ${levels.IndentPresentLevel} | CSK: ${levels.IndentDefineLevel} | PUM: ${levels.NewItemDefineLevel}`} />
                        )}
                    </div>
                </div>

                {/* Items table — role-based */}
                {renderItemsSection()}

                {/* Remarks history */}
                <RemarksHistory
                    isOpen={showRemarksHistory}
                    onToggle={() => setShowRemarksHistory(!showRemarksHistory)}
                    remarks={remarks}
                    loading={remarksLoading}
                    title="Approval History"
                />

                {/* Verification input */}
                <VerificationInput
                    isVerified={isVerified}
                    onVerifiedChange={setIsVerified}
                    comment={verificationComment}
                    onCommentChange={(e) => setVerificationComment(e.target.value)}
                    config={{
                        checkboxLabel:       '✓ I have reviewed this indent request',
                        checkboxDescription: 'Confirm all items, quantities, and department details are correct',
                        commentLabel:        'Verification Comments',
                        commentPlaceholder:  'Enter your verification remarks…',
                        commentRequired:     true,
                        commentRows:         3,
                        commentMaxLength:    500,
                        showCharCount:       true,
                        validationStyle:     'dynamic',
                        checkboxGradient:    'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
                        commentGradient:     'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        commentBorder:       'border-indigo-200 dark:border-indigo-700',
                    }}
                />

                {/* Action buttons */}
                {statusLoading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                        <span className="text-gray-600 dark:text-gray-400">Loading actions…</span>
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
                    />
                )}
            </div>
        );
    };

    // ── Stats ──────────────────────────────────────────────────────────────────

    const statsCards = [
        { icon: ShoppingCart, value: inbox.length,  label: 'Total Pending',   color: 'indigo' },
        { icon: Clock,        value: inbox.length,  label: 'Awaiting Action', color: 'purple' },
        { icon: Package,      value: selectedItem?.TotalAmount != null ? `₹${Number(selectedItem.TotalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—', label: 'Total Amount', color: 'teal' },
        { icon: User,         value: selectedItem?.Costcenter || '—',          label: 'Cost Centre',     color: 'cyan' },
    ];

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <>
        <div className="space-y-6">
            <InboxHeader
                title={`${InboxTitle || 'Indent Verification'} (${inbox.length})`}
                subtitle={ModuleDisplayName}
                itemCount={inbox.length}
                onBackClick={handleBackToInbox}
                HeaderIcon={ShoppingCart}
                badgeText="Indent"
                badgeCount={inbox.length}
                searchConfig={{
                    enabled:     true,
                    placeholder: 'Search by indent no, cost centre, date…',
                    value:       searchQuery,
                    onChange:    (e) => setSearchQuery(e.target.value),
                }}
            />

            <div className="px-6 -mt-auto mb-6">
                <StatsCards
                    cards={statsCards}
                    variant="simple"
                    gridCols="grid-cols-1 md:grid-cols-4"
                    gap="gap-4"
                />
            </div>

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
                            title:          'Pending Verification',
                            icon:           Clock,
                            emptyMessage:   'No indent requests pending verification.',
                            itemKey:        'Indentno',
                            enableCollapse: true,
                            enableRefresh:  true,
                            enableHover:    true,
                            maxHeight:      '100%',
                            headerGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
                        }}
                    />
                </div>

                <div className={isLeftPanelCollapsed && !isLeftPanelHovered ? 'lg:col-span-11' : 'lg:col-span-2'}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-xl flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg">
                                <ShoppingCart className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                {selectedItem ? `Indent: ${selectedItem.Indentno}` : 'Select an Indent'}
                            </h2>
                        </div>

                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                            {selectedItem ? renderDetailContent() : (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingCart className="w-12 h-12 text-indigo-400 dark:text-indigo-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Indent Selected</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Select an indent from the list to review items and verify.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <StockSummaryPopup
            popup={stockPopup}
            onClose={() => setStockPopup({ isOpen: false, loading: false, data: [], error: null })}
        />

        <TradeItemPopup
            isOpen={tradePopup.isOpen}
            onClose={() => setTradePopup({ isOpen: false, item: null })}
            item={tradePopup.item}
            indentno={selectedItem?.Indentno}
            indentId={indentDetail?.MOID}
            costcenter={selectedItem?.Costcenter}
            tradeCC={pumCCCode}
            userName={userName}
            onQtyFilled={handleTradeQtyFilled}
            onAllQtyCleared={handleAllTradeQtyCleared}
            dispatch={dispatch}
        />
        </>
    );
};

export default VerifyIndentCreation;
