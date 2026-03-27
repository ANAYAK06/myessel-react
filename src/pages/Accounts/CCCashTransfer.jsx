import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    IndianRupee, Building2, Loader2, AlertCircle,
    RotateCcw, Send, ChevronDown, Navigation,
    CalendarDays, StickyNote, ArrowRight, CheckCircle,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

// CC lists + balance from cashVoucherSlice
import {
    fetchSelfCCList,
    fetchOtherCCList,
    fetchCCBalance,
    resetCashVoucher,
    selectSelfCCList,
    selectOtherCCList,
    selectCCBalance,
    selectSelfCCLoading,
    selectOtherCCLoading,
    selectCCBalanceLoading,
} from '../../slices/accountsSlice/cashVoucherSlice';

// Save from ccCashTransferSlice
import {
    saveCCCashTransfer,
    clearSaveResult,
    resetCCCashTransfer,
    selectCCSaveStatus,
    selectCCSaveError,
    selectCCSaveLoading,
} from '../../slices/accountsSlice/ccCashTransferSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

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

// ─── Component ────────────────────────────────────────────────────────────────

const CCCashTransfer = ({ menuData }) => {
    const dispatch = useDispatch();

    // Auth
    const { userData } = useSelector(s => s.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    // CC lists + balance
    const selfCCList     = useSelector(selectSelfCCList);
    const otherCCList    = useSelector(selectOtherCCList);
    const ccBalance      = useSelector(selectCCBalance);
    const selfCCLoading  = useSelector(selectSelfCCLoading);
    const otherCCLoading = useSelector(selectOtherCCLoading);
    const balanceLoading = useSelector(selectCCBalanceLoading);

    // Save
    const saveStatus  = useSelector(selectCCSaveStatus);
    const saveError   = useSelector(selectCCSaveError);
    const saveLoading = useSelector(selectCCSaveLoading);

    // Form state
    const [selfCC,       setSelfCC]       = useState('');
    const [transferCC,   setTransferCC]   = useState('');
    const [amount,       setAmount]       = useState('');
    const [transferDate, setTransferDate] = useState(null);
    const [remarks,      setRemarks]      = useState('');

    // ── Init ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (userId && roleId) {
            dispatch(fetchSelfCCList({ uid: userId, rid: roleId }));
            dispatch(fetchOtherCCList({ id: userId, type: '' }));
        }
        return () => {
            dispatch(resetCashVoucher());
            dispatch(resetCCCashTransfer());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, userId, roleId]);

    // ── Fetch balance when self CC changes ──────────────────────────────────
    useEffect(() => {
        if (selfCC) {
            dispatch(fetchCCBalance(selfCC));
            setTransferCC('');
            setAmount('');
        }
    }, [selfCC, dispatch]);

    // ── Handle save result ──────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('CC Cash Transfer saved successfully!');
            dispatch(clearSaveResult());
            handleReset();
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError);
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus, saveError, dispatch]);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleReset = () => {
        setSelfCC('');
        setTransferCC('');
        setAmount('');
        setTransferDate(null);
        setRemarks('');
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) setAmount(val);
    };

    const handleSubmit = () => {
        if (!selfCC)       { toast.warn('Please select Self Cost Center.');    return; }
        if (!transferCC)   { toast.warn('Please select Transfer Cost Center.'); return; }
        if (!amount || parseFloat(amount) <= 0) { toast.warn('Please enter a valid amount.'); return; }
        if (!transferDate) { toast.warn('Please select Transfer Date.');        return; }

        const numAmount = parseFloat(amount);
        const balance   = parseFloat(ccBalance) || 0;
        if (numAmount > balance) {
            toast.warn(`Amount ₹${fmt(numAmount)} exceeds available balance ₹${fmt(balance)}.`);
            return;
        }

        const txnDate = new Date(transferDate)
            .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            .replace(/ /g, '-');

        dispatch(saveCCCashTransfer({
            GPSessionCCCode:    selfCC,
            CashTransferCCCode: transferCC,
            CCTransferDate:     txnDate,
            CCTransferRemarks:  remarks,
            CCTransferAmount:   numAmount,
            RoleID:             roleId,
            Createdby:          userName,
        }));
    };

    // ── Derived ─────────────────────────────────────────────────────────────
    const filteredOtherCC   = otherCCList.filter(cc => cc.CC_Code?.split(',')[0].trim() !== selfCC);
    const selfCCLabel       = selfCC     ? selfCCList.find(c => c.CC_Code?.split(',')[0].trim() === selfCC)?.CC_Code    || selfCC     : '—';
    const transferCCLabel   = transferCC ? otherCCList.find(c => c.CC_Code?.split(',')[0].trim() === transferCC)?.CC_Code || transferCC : '—';
    const numAmount         = parseFloat(amount) || 0;
    const balance           = parseFloat(ccBalance) || 0;
    const exceedsBalance    = selfCC && ccBalance != null && numAmount > balance;
    const canSubmit         = selfCC && transferCC && numAmount > 0 && transferDate && !exceedsBalance && !saveLoading;
    const txnDateDisplay    = transferDate
        ? new Date(transferDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
        : '—';
    const isBusy = saveLoading || selfCCLoading || otherCCLoading;

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <ArrowRight className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'CC Cash Transfer'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Transfer cash balance between cost centers</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / Cash</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Cost Center Selection ────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Cost Center Selection</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Select the source and destination cost centers</p>
                            </div>
                        </div>
                        <button
                            onClick={handleReset}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50"
                        >
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">From → To Cost Center</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Self CC balance will be shown after selection</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Self CC */}
                            <div>
                                <Label required>Self Cost Center (From)</Label>
                                <div className="relative">
                                    <select
                                        value={selfCC}
                                        onChange={e => setSelfCC(e.target.value)}
                                        disabled={selfCCLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">
                                            {selfCCLoading ? 'Loading…' : '— Select Self CC —'}
                                        </option>
                                        {selfCCList.map(cc => (
                                            <option key={cc.CC_Id} value={cc.CC_Code?.split(',')[0].trim()}>
                                                {cc.CC_Code}
                                            </option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={selfCCLoading} />
                                </div>

                                {/* Balance chip */}
                                {selfCC && (
                                    <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700">
                                        <IndianRupee className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Available Balance</p>
                                            {balanceLoading ? (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Loader2 className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                                                    <span className="text-xs text-indigo-400">Loading…</span>
                                                </div>
                                            ) : (
                                                <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                                                    ₹{fmt(ccBalance)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Transfer CC */}
                            <div>
                                <Label required>Transfer Cost Center (To)</Label>
                                <div className="relative">
                                    <select
                                        value={transferCC}
                                        onChange={e => setTransferCC(e.target.value)}
                                        disabled={!selfCC || otherCCLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">
                                            {!selfCC ? 'Select Self CC first' : otherCCLoading ? 'Loading…' : '— Select Transfer CC —'}
                                        </option>
                                        {filteredOtherCC.map(cc => (
                                            <option key={cc.CC_Id} value={cc.CC_Code?.split(',')[0].trim()}>
                                                {cc.CC_Code}
                                            </option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={otherCCLoading} />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── Transfer Details ─────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl flex items-center gap-3">
                        <IndianRupee className="h-4 w-4 text-indigo-500" />
                        <div>
                            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Transfer Details</h2>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Enter amount, date and remarks for the transfer</p>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                <IndianRupee className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Amount & Date</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Amount cannot exceed the available balance</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Amount */}
                            <div>
                                <Label required>Transfer Amount (₹)</Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        disabled={!selfCC || isBusy}
                                        className={`${inputCls} pl-9 ${exceedsBalance ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                                    />
                                </div>
                                {exceedsBalance && (
                                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Exceeds balance of ₹{fmt(balance)}
                                    </p>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <Label required>Transfer Date</Label>
                                <CustomDatePicker
                                    value={transferDate}
                                    onChange={setTransferDate}
                                    disabled={isBusy}
                                    maxDate={new Date()}
                                />
                            </div>

                            {/* Remarks */}
                            <div>
                                <Label>Remarks</Label>
                                <textarea
                                    rows={3}
                                    placeholder="Add remarks (optional)…"
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                    disabled={isBusy}
                                    className={`${inputCls} resize-none`}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── Summary ──────────────────────────────────────────────── */}
                {selfCC && transferCC && numAmount > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-indigo-500" />
                            <div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Transfer Summary</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Review before submitting</p>
                            </div>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                {[
                                    { label: 'From CC',    value: selfCCLabel },
                                    { label: 'To CC',      value: transferCCLabel },
                                    { label: 'Amount',     value: `₹${fmt(numAmount)}` },
                                    { label: 'Date',       value: txnDateDisplay },
                                    { label: 'Remarks',    value: remarks || '—' },
                                    { label: 'Created By', value: userName },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Action Buttons ───────────────────────────────────────── */}
                <div className="flex items-center justify-end gap-3 pb-6">
                    <button
                        onClick={handleReset}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50"
                    >
                        <RotateCcw className="h-4 w-4" /> Reset
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {saveLoading
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                            : <><Send className="h-4 w-4" /> Submit Transfer</>
                        }
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CCCashTransfer;
