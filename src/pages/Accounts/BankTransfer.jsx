import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Building2, CreditCard, Loader2, AlertCircle,
    RotateCcw, Send, ChevronDown, IndianRupee,
    Hash, CalendarDays, CheckCircle, ArrowLeftRight,
    Navigation, StickyNote,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    formatIndianCurrency,
    getAmountDisplay,
} from '../../utilities/amountToTextHelper';

import {
    submitBankTransfer,
    clearSaveResult,
    resetBankTransfer,
    selectBtSaveStatus,
    selectBtLoading,
    selectBtError,
} from '../../slices/accountsSlice/bankTransferSlice';

import {
    fetchBankDetailsWithAvailableBalance,
    selectBankDetailsArray,
    selectBankDetailsLoading,
} from '../../slices/CommonSlice/bankDetailsSlice';

import {
    fetchChequeNumbers,
    selectChequeNumbersArray,
    selectChequeNumbersLoading,
    resetChequeNumbersData,
} from '../../slices/bankSlice/chequeNumbersSlice';

// ── Constants ─────────────────────────────────────────────────────────────────

const MODE_OPTIONS = ['Cheque', 'NEFT', 'RTGS', 'IMPS', 'UPI'];

// ── Shared styles ─────────────────────────────────────────────────────────────

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

const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
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

const InnerHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
    </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const BankTransfer = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    // ── Redux ──────────────────────────────────────────────────────────────────
    const bankList      = useSelector(selectBankDetailsArray);
    const bankLoading   = useSelector(selectBankDetailsLoading);
    const chequeList    = useSelector(selectChequeNumbersArray);
    const chequeLoading = useSelector(selectChequeNumbersLoading);
    const saveStatus    = useSelector(selectBtSaveStatus);
    const saveLoading   = useSelector(selectBtLoading);
    const saveError     = useSelector(selectBtError);

    // ── Form state ─────────────────────────────────────────────────────────────
    const [fromBank,  setFromBank]  = useState(null);
    const [toBank,    setToBank]    = useState(null);
    const [modeOfPay, setModeOfPay] = useState('');
    const [chequeId,  setChequeId]  = useState('');
    const [refNo,     setRefNo]     = useState('');
    const [date,      setDate]      = useState(null);
    const [remarks,   setRemarks]   = useState('');
    const [amount,    setAmount]    = useState('');

    // ── Init ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => {
            dispatch(resetBankTransfer());
            dispatch(resetChequeNumbersData());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // ── From-bank change: fetch cheques, clear downstream ─────────────────────
    useEffect(() => {
        if (!fromBank) { dispatch(resetChequeNumbersData()); return; }
        setModeOfPay('');
        setChequeId('');
        setRefNo('');
        // Reset To bank if same as From
        if (toBank?.BankId === fromBank.BankId) setToBank(null);
        dispatch(fetchChequeNumbers(fromBank.BankName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromBank]);

    // ── Mode change: clear ref fields ─────────────────────────────────────────
    useEffect(() => {
        setChequeId('');
        setRefNo('');
    }, [modeOfPay]);

    // ── Save result ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Bank transfer saved successfully!');
            dispatch(clearSaveResult());
            handleReset();
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError);
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus, saveError]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleReset = () => {
        setFromBank(null);
        setToBank(null);
        setModeOfPay('');
        setChequeId('');
        setRefNo('');
        setDate(null);
        setRemarks('');
        setAmount('');
        dispatch(resetChequeNumbersData());
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) setAmount(val);
    };

    const handleSubmit = () => {
        if (!fromBank)  { toast.warn('Please select the source bank account.');       return; }
        if (!toBank)    { toast.warn('Please select the destination bank account.');  return; }
        if (fromBank.BankId === toBank.BankId) {
            toast.warn('Source and destination banks must be different.'); return;
        }
        if (!modeOfPay) { toast.warn('Please select mode of payment.');               return; }
        if (modeOfPay === 'Cheque' && !chequeId) {
            toast.warn('Please select a cheque number.'); return;
        }
        if (modeOfPay !== 'Cheque' && !refNo.trim()) {
            toast.warn('Please enter the reference / transaction number.'); return;
        }
        if (!date)   { toast.warn('Please select a transfer date.');                  return; }
        if (!amount || parseFloat(amount) <= 0) {
            toast.warn('Please enter a valid amount.'); return;
        }
        if (!remarks.trim()) { toast.warn('Please enter remarks.');                   return; }

        const numAmount = parseFloat(amount);
        const available = parseFloat(fromBank.AvailableBalance) || 0;
        if (numAmount > available) {
            toast.warn(`Amount ₹${formatIndianCurrency(numAmount)} exceeds available balance ₹${formatIndianCurrency(available)}.`);
            return;
        }

        dispatch(submitBankTransfer({
            From:        fromBank.BankId,
            To:          toBank.BankId,
            Mode_of_Pay: modeOfPay,
            ...(modeOfPay === 'Cheque'
                ? { Chequeid: chequeId }
                : { Chequeid: '0', No: refNo }),
            Date:        date,
            Remarks:     remarks,
            Amount:      numAmount,
            RoleID:      roleId,
            Createdby:   userName,
        }));
    };

    // ── Derived ────────────────────────────────────────────────────────────────
    const numAmount      = parseFloat(amount) || 0;
    const available      = parseFloat(fromBank?.AvailableBalance) || 0;
    const exceedsBalance = fromBank && numAmount > 0 && numAmount > available;
    const amountDisplay  = getAmountDisplay(numAmount);
    const selectedCheqNo = chequeList.find(c => c.Cheque_Id === chequeId)?.Cheque_No || '—';
    const refDisplay     = modeOfPay === 'Cheque' ? selectedCheqNo : (refNo || '—');

    // To-bank list excludes the selected From bank
    const toBankList = bankList.filter(b => b.BankId !== fromBank?.BankId);

    const showSummary = fromBank && toBank && modeOfPay &&
        (modeOfPay === 'Cheque' ? !!chequeId : !!refNo) &&
        date && numAmount > 0;

    const canSubmit = showSummary && !exceedsBalance && !saveLoading && remarks.trim();
    const isBusy    = saveLoading || bankLoading;

    const dateDisplay = date
        ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
        : '—';

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ───────────────────────────────────────────────── */}
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
                                    {menuData?.name || 'Bank to Bank Transfer'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Transfer funds between bank accounts</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / Bank</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Bank Account Selection ────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <SectionHeader
                        icon={Building2}
                        title="Bank Accounts"
                        subtitle="Select source and destination bank accounts"
                        action={
                            <button
                                onClick={handleReset}
                                disabled={isBusy}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                        }
                    />
                    <div className="p-6 md:p-8">
                        <InnerHeader icon={Building2} title="Source & Destination" subtitle="Source available balance will be shown after selection" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">

                            {/* From Bank */}
                            <div>
                                <Label required>From Bank (Source)</Label>
                                <div className="relative">
                                    <select
                                        className={`${inputCls} appearance-none pr-10`}
                                        value={fromBank?.BankId || ''}
                                        onChange={(e) => {
                                            const bank = bankList.find(b => b.BankId === parseInt(e.target.value));
                                            setFromBank(bank || null);
                                        }}
                                        disabled={bankLoading || isBusy}
                                    >
                                        <option value="">{bankLoading ? 'Loading…' : '— Select Source Bank —'}</option>
                                        {bankList.map((b) => (
                                            <option key={b.BankId} value={b.BankId}>
                                                {b.BankName} — {b.AccountNo}
                                            </option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={bankLoading} />
                                </div>
                            </div>

                            {/* To Bank */}
                            <div>
                                <Label required>To Bank (Destination)</Label>
                                <div className="relative">
                                    <select
                                        className={`${inputCls} appearance-none pr-10`}
                                        value={toBank?.BankId || ''}
                                        onChange={(e) => {
                                            const bank = toBankList.find(b => b.BankId === parseInt(e.target.value));
                                            setToBank(bank || null);
                                        }}
                                        disabled={bankLoading || isBusy || !fromBank}
                                    >
                                        <option value="">{!fromBank ? 'Select source bank first' : bankLoading ? 'Loading…' : '— Select Destination Bank —'}</option>
                                        {toBankList.map((b) => (
                                            <option key={b.BankId} value={b.BankId}>
                                                {b.BankName} — {b.AccountNo}
                                            </option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={bankLoading} />
                                </div>
                            </div>
                        </div>

                        {/* From bank balance info */}
                        {fromBank && (
                            <div className="mb-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Source Bank Details</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Type</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{fromBank.AccountType}</p>
                                    </div>
                                    <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Holder</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{fromBank.AccountHolderName}</p>
                                    </div>
                                    <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Actual Balance</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">₹ {formatIndianCurrency(fromBank.ActualBalance)}</p>
                                    </div>
                                    <div className="rounded-xl p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Available Balance</p>
                                        <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">₹ {formatIndianCurrency(fromBank.AvailableBalance)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Transfer arrow indicator */}
                        {fromBank && toBank && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800">
                                <div className="flex-1 text-center">
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">{fromBank.BankName}</p>
                                    <p className="text-[10px] text-gray-400">{fromBank.AccountNo}</p>
                                </div>
                                <ArrowLeftRight className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                                <div className="flex-1 text-center">
                                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 truncate">{toBank.BankName}</p>
                                    <p className="text-[10px] text-gray-400">{toBank.AccountNo}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Payment Details ───────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <SectionHeader
                        icon={CreditCard}
                        title="Payment Details"
                        subtitle="Mode of payment, reference and amount"
                    />
                    <div className="p-6 md:p-8">
                        <InnerHeader icon={CreditCard} title="Mode & Reference" subtitle="Choose payment mode and provide the reference details" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                            {/* Mode of Payment */}
                            <div>
                                <Label required>Mode of Payment</Label>
                                <div className="relative">
                                    <select
                                        className={`${inputCls} appearance-none pr-10`}
                                        value={modeOfPay}
                                        onChange={(e) => setModeOfPay(e.target.value)}
                                        disabled={!fromBank || isBusy}
                                    >
                                        <option value="">{!fromBank ? 'Select source bank first' : '— Select Mode —'}</option>
                                        {MODE_OPTIONS.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={false} />
                                </div>
                            </div>

                            {/* Cheque Number */}
                            {modeOfPay === 'Cheque' && (
                                <div>
                                    <Label required>Cheque Number</Label>
                                    <div className="relative">
                                        <select
                                            className={`${inputCls} appearance-none pr-10`}
                                            value={chequeId}
                                            onChange={(e) => setChequeId(e.target.value)}
                                            disabled={chequeLoading || isBusy}
                                        >
                                            <option value="">{chequeLoading ? 'Loading…' : '— Select Cheque —'}</option>
                                            {chequeList.map((c) => (
                                                <option key={c.Cheque_Id} value={c.Cheque_Id}>
                                                    {c.Cheque_No}
                                                </option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={chequeLoading} />
                                    </div>
                                </div>
                            )}

                            {/* Reference No */}
                            {modeOfPay && modeOfPay !== 'Cheque' && (
                                <div>
                                    <Label required>Transaction / Reference No.</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            className={`${inputCls} pl-9`}
                                            placeholder="Enter reference number"
                                            value={refNo}
                                            onChange={(e) => setRefNo(e.target.value)}
                                            disabled={isBusy}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <InnerHeader icon={IndianRupee} title="Amount & Date" subtitle="Amount cannot exceed the available balance of source bank" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                                        disabled={!fromBank || isBusy}
                                        className={`${inputCls} pl-9 ${exceedsBalance ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                                    />
                                </div>
                                {exceedsBalance && (
                                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Exceeds available balance of ₹{formatIndianCurrency(available)}
                                    </p>
                                )}
                                {numAmount > 0 && !exceedsBalance && (
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1.5 italic">
                                        {amountDisplay.words}
                                    </p>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <Label required>Transfer Date</Label>
                                <CustomDatePicker
                                    value={date}
                                    onChange={setDate}
                                    disabled={isBusy}
                                    maxDate={new Date()}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Remarks ───────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <SectionHeader
                        icon={StickyNote}
                        title="Remarks"
                        subtitle="Additional notes for this transfer"
                    />
                    <div className="p-6 md:p-8">
                        <InnerHeader icon={StickyNote} title="Narration" subtitle="Describe the purpose of this transfer" />
                        <Label required>Remarks</Label>
                        <textarea
                            rows={3}
                            placeholder="Enter remarks…"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            disabled={isBusy}
                            className={`${inputCls} resize-none`}
                        />
                    </div>
                </div>

                {/* ── Summary ───────────────────────────────────────────────── */}
                {showSummary && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <SectionHeader
                            icon={CheckCircle}
                            title="Transfer Summary"
                            subtitle="Review before submitting"
                        />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                {[
                                    { label: 'From Bank',   value: fromBank?.BankName },
                                    { label: 'From Acc No', value: fromBank?.AccountNo },
                                    { label: 'To Bank',     value: toBank?.BankName },
                                    { label: 'To Acc No',   value: toBank?.AccountNo },
                                    { label: 'Mode',        value: modeOfPay },
                                    { label: modeOfPay === 'Cheque' ? 'Cheque No' : 'Reference No', value: refDisplay },
                                    { label: 'Date',        value: dateDisplay },
                                    { label: 'Amount',      value: `₹ ${formatIndianCurrency(numAmount)}` },
                                    { label: 'In Words',    value: amountDisplay.words, wide: true },
                                    { label: 'Remarks',     value: remarks || '—', wide: true },
                                    { label: 'Created By',  value: userName },
                                ].map(({ label, value, wide }) => (
                                    <div
                                        key={label}
                                        className={`bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 ${wide ? 'md:col-span-3' : ''}`}
                                    >
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 break-words">{value || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Action Buttons ────────────────────────────────────────── */}
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

export default BankTransfer;
