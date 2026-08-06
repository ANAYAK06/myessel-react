import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Wallet, Landmark, Building2, StickyNote, CheckCircle,
    Loader2, ChevronDown, RotateCcw, Send, Navigation, ArrowLeftRight, Layers,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchCCCashBalance,
    fetchCashAmounts,
    submitCentralDayBook,
    clearCentralDayBookSaveResult,
    resetCentralDayBook,
    selectCCBalanceList,
    selectCCBalanceListLoading,
    selectCashAmounts,
    selectCashAmountsLoading,
    selectCentralDayBookSaveStatus,
    selectCentralDayBookSaveLoading,
    selectCentralDayBookSaveError,
} from '../../slices/accountsSlice/centralDayBookSlice';

import {
    fetchBankDetailsWithAvailableBalance,
    resetBankDetailsData,
    selectBankDetailsArray,
    selectBankDetailsLoading,
} from '../../slices/CommonSlice/bankDetailsSlice';

// ── Constants ──────────────────────────────────────────────────────────────────
const TRANSFER_TYPE_OPTIONS = [
    { value: 'CostCenter', label: 'Cost Center', icon: Building2, description: 'Distribute cash to a cost centre' },
    { value: 'Bank',       label: 'Bank',         icon: Landmark,  description: 'Return cash back to a bank' },
];

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatDateForAPI = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{2}-[A-Za-z]{3}-\d{4}$/.test(val)) return val;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        const [yyyy, mm, dd] = val.split('T')[0].split('-');
        return `${dd}-${MONTH_ABBR[parseInt(mm, 10) - 1]}-${yyyy}`;
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2,'0')}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
};

const fmt = (v) => {
    const n = parseFloat(v);
    if ((!v && v !== 0) || isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ── Shared UI primitives (matches Refund / RecieptAgainstScrapSale) ────────────
const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

const selectCls = `${inputCls} appearance-none pr-10 cursor-pointer`;

const Label = ({ children, required }) => (
    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const SelectIcon = ({ loading }) => (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        {loading
            ? <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
            : <ChevronDown className="h-4 w-4 text-gray-400" />}
    </div>
);

const CardHeader = ({ icon: Icon, title, subtitle, action }) => (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
        <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-indigo-500" />
            <div>
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
            </div>
        </div>
        {action}
    </div>
);

const BalanceTile = ({ label, value, accent }) => (
    <div className={`rounded-xl px-4 py-3 border ${accent}`}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-0.5 opacity-80">{label}</p>
        <p className="text-lg font-bold">₹ {fmt(value)}</p>
    </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const CentralDayBook = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    // ── Selectors ──────────────────────────────────────────────────────────────
    const ccBalanceList  = useSelector(selectCCBalanceList);
    const ccListLoading  = useSelector(selectCCBalanceListLoading);
    const cashAmounts    = useSelector(selectCashAmounts);
    const cashAmtLoading = useSelector(selectCashAmountsLoading);

    const bankList    = useSelector(selectBankDetailsArray);
    const bankLoading = useSelector(selectBankDetailsLoading);

    const saveStatus = useSelector(selectCentralDayBookSaveStatus);
    const saving     = useSelector(selectCentralDayBookSaveLoading);
    const saveError  = useSelector(selectCentralDayBookSaveError);

    // ── Form state ─────────────────────────────────────────────────────────────
    const [date,         setDate]         = useState(null);
    const [transferType, setTransferType] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [selectedCC,   setSelectedCC]   = useState('');
    const [amount,       setAmount]       = useState('');
    const [remarks,      setRemarks]      = useState('');

    const isBusy = saving;

    // ── Init / refresh ────────────────────────────────────────────────────────
    const loadBalances = () => {
        if (userId && roleId) dispatch(fetchCCCashBalance({ roleId, uid: userId }));
        dispatch(fetchCashAmounts());
    };

    useEffect(() => {
        loadBalances();
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => {
            dispatch(resetCentralDayBook());
            dispatch(resetBankDetailsData());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, userId, roleId]);

    // ── Save result ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Central day book entry saved successfully!');
            dispatch(clearCentralDayBookSaveResult());
            handleReset();
            loadBalances();
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError);
            dispatch(clearCentralDayBookSaveResult());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus, saveError, dispatch]);

    // ── Transfer type change ──────────────────────────────────────────────────
    const handleTransferTypeChange = (val) => {
        setTransferType(val);
        setSelectedBank('');
        setSelectedCC('');
    };

    // ── Reset ──────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setDate(null);
        setTransferType('');
        setSelectedBank('');
        setSelectedCC('');
        setAmount('');
        setRemarks('');
    };

    // ── Derived ────────────────────────────────────────────────────────────────
    const selectedCCObj   = ccBalanceList.find((c) => c.CCCode === selectedCC);
    const selectedBankObj = bankList.find((b) => String(b.BankId) === String(selectedBank));

    const canSubmit = date && transferType &&
        (transferType === 'Bank' ? !!selectedBank : !!selectedCC) &&
        parseFloat(amount) > 0 && remarks.trim();

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!date)                          { toast.warn('Please select a date.');                    return; }
        if (!transferType)                  { toast.warn('Please select Transfer To — Bank or Cost Center.'); return; }
        if (transferType === 'Bank' && !selectedBank)     { toast.warn('Please select a bank.');       return; }
        if (transferType === 'CostCenter' && !selectedCC) { toast.warn('Please select a cost centre.'); return; }
        if (!(parseFloat(amount) > 0))      { toast.warn('Please enter a valid amount.');              return; }
        if (!remarks.trim())                { toast.warn('Please enter remarks.');                     return; }

        dispatch(submitCentralDayBook({
            transferDate: formatDateForAPI(date),
            transferType,
            bankId:       selectedBank,
            ccCode:       selectedCC,
            amount:       parseFloat(amount) || 0,
            remarks:      remarks.trim(),
            createdBy:    userName,
            roleId,
        }));
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <ArrowLeftRight className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Central Day Book'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Distribute cash drawn from bank to cost centres, or return it back to bank</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / Central Day Book</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Section 1: Date & Transfer To ─────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Layers} title="Date & Transfer To" subtitle="Select the entry date and where the cash should go" action={
                        <button onClick={handleReset} disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    } />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label required>Date</Label>
                                <CustomDatePicker
                                    value={date}
                                    onChange={setDate}
                                    disabled={isBusy}
                                    maxDate={new Date()}
                                    placeholder="Select date"
                                />
                            </div>
                            <div>
                                <Label required>Transfer To</Label>
                                <div className="flex flex-wrap gap-2.5 mt-1">
                                    {TRANSFER_TYPE_OPTIONS.map((t) => (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => !isBusy && handleTransferTypeChange(t.value)}
                                            disabled={isBusy}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                                                ${transferType === t.value
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 bg-white dark:bg-gray-800'}
                                                disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <t.icon className="h-4 w-4" />
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Destination & Balance ──────────────────────── */}
                {transferType && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader
                            icon={transferType === 'Bank' ? Landmark : Building2}
                            title={transferType === 'Bank' ? 'Bank Details' : 'Cost Centre Details'}
                            subtitle={TRANSFER_TYPE_OPTIONS.find((t) => t.value === transferType)?.description}
                        />
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {transferType === 'Bank' ? (
                                    <div>
                                        <Label required>Bank</Label>
                                        <div className="relative">
                                            <select
                                                value={selectedBank}
                                                onChange={(e) => setSelectedBank(e.target.value)}
                                                disabled={bankLoading || isBusy}
                                                className={selectCls}
                                            >
                                                <option value="">{bankLoading ? 'Loading…' : '— Select Bank —'}</option>
                                                {bankList.map((b) => (
                                                    <option key={b.BankId} value={b.BankId}>{b.BankName}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={bankLoading} />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Label required>Cost Centre</Label>
                                        <div className="relative">
                                            <select
                                                value={selectedCC}
                                                onChange={(e) => setSelectedCC(e.target.value)}
                                                disabled={ccListLoading || isBusy}
                                                className={selectCls}
                                            >
                                                <option value="">{ccListLoading ? 'Loading…' : '— Select Cost Centre —'}</option>
                                                {ccBalanceList.map((cc) => (
                                                    <option key={cc.CCCode} value={cc.CCCode}>{cc.CCCode} — {cc.CCName}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={ccListLoading} />
                                        </div>
                                    </div>
                                )}

                                {(selectedBankObj || selectedCCObj) && (
                                    <div className="flex flex-col justify-end">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-0.5">
                                                {transferType === 'Bank' ? 'Available Balance' : 'Current Cost Centre Balance'}
                                            </p>
                                            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                                                ₹ {fmt(transferType === 'Bank' ? selectedBankObj?.AvailableBalance : selectedCCObj?.CCAmount)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Balance summary ────────────────────────────────── */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Balance Overview</p>
                                {cashAmtLoading ? (
                                    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                        <span className="text-sm text-blue-700 dark:text-blue-400">Loading balances…</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <BalanceTile
                                            label="Unassigned"
                                            value={cashAmounts?.Unassignedbalance}
                                            accent="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                                        />
                                        <BalanceTile
                                            label="With Cost Centres"
                                            value={cashAmounts?.Allccbalance}
                                            accent="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                                        />
                                        <BalanceTile
                                            label="Debit Pending"
                                            value={cashAmounts?.Pendingbalance}
                                            accent="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Section 3: Amount & Remarks ───────────────────────────── */}
                {transferType && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={StickyNote} title="Amount & Remarks" subtitle="Transfer amount and description" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label required>Amount (₹)</Label>
                                    <input
                                        type="number" min="0" step="0.01" placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        disabled={isBusy}
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                            <div className="mt-5">
                                <Label required>Remarks</Label>
                                <textarea
                                    rows={3}
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    disabled={isBusy}
                                    placeholder="Enter remarks…"
                                    className={`${inputCls} resize-none`}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Section 4: Summary ────────────────────────────────────── */}
                {canSubmit && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={CheckCircle} title="Transfer Summary" subtitle="Review before submission" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                {[
                                    { label: 'Date',        value: formatDateForAPI(date) },
                                    { label: 'Transfer To', value: TRANSFER_TYPE_OPTIONS.find((t) => t.value === transferType)?.label },
                                    { label: transferType === 'Bank' ? 'Bank' : 'Cost Centre', value: transferType === 'Bank' ? selectedBankObj?.BankName : (selectedCCObj ? `${selectedCCObj.CCCode} — ${selectedCCObj.CCName}` : selectedCC) },
                                    { label: 'Amount',      value: `₹ ${fmt(amount)}` },
                                    { label: 'Remarks',     value: remarks, wide: true },
                                ].map(({ label, value, wide }) => (
                                    <div
                                        key={label}
                                        className={`bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 ${wide ? 'md:col-span-4' : ''}`}
                                    >
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 break-words">{value || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Action Buttons ─────────────────────────────────────────── */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isBusy}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RotateCcw className="h-4 w-4" /> Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isBusy}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                        ) : (
                            <><Send className="h-4 w-4" /> Submit</>
                        )}
                    </button>
                </div>

                {/* ── Section 5: All Cost Centre Balances ───────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Wallet} title="All Cost Centre Balances" subtitle="Current cash balance held by every cost centre" action={
                        <button onClick={loadBalances} disabled={ccListLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                            <RotateCcw className={`h-3.5 w-3.5 ${ccListLoading ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                    } />
                    <div className="p-6 md:p-8">
                        {ccListLoading ? (
                            <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                <span className="text-sm text-blue-700 dark:text-blue-400">Loading cost centre balances…</span>
                            </div>
                        ) : ccBalanceList.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500">No cost centre balances found.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900/40">
                                            <th className="px-4 py-2.5 text-left font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Cost Centre Code</th>
                                            <th className="px-4 py-2.5 text-left font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Cost Centre Name</th>
                                            <th className="px-4 py-2.5 text-right font-bold text-gray-500 dark:text-gray-400 uppercase text-xs">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ccBalanceList.map((cc) => (
                                            <tr key={cc.CCCode} className="border-t border-gray-100 dark:border-gray-700">
                                                <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-gray-200">{cc.CCCode}</td>
                                                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{cc.CCName}</td>
                                                <td className="px-4 py-2.5 text-right font-bold text-indigo-600 dark:text-indigo-400">₹ {fmt(cc.CCAmount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CentralDayBook;
