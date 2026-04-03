import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Wallet, Building2, ArrowRight, Loader2, RotateCcw,
    Send, ChevronDown, IndianRupee, Hash, StickyNote,
    CheckCircle, Navigation, AlertCircle,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';
import { formatIndianCurrency, getAmountDisplay } from '../../utilities/amountToTextHelper';

import {
    fetchAllWallets,
    fetchToLoadWallets,
    submitLoadWallet,
    clearSaveResult,
    resetLoadWallet,
    selectWallets,
    selectWalletsLoading,
    selectToWallets,
    selectToWalletsLoading,
    selectLwSaveStatus,
    selectLwSaveLoading,
    selectLwSaveError,
} from '../../slices/accountsSlice/loadWalletSlice';

import {
    fetchBankDetailsWithAvailableBalance,
    selectBankDetailsArray,
    selectBankDetailsLoading,
} from '../../slices/CommonSlice/bankDetailsSlice';

// ── Constants ─────────────────────────────────────────────────────────────────

const TRANSFER_FROM_OPTIONS = ['Bank', 'Wallet'];
const MODE_OPTIONS = ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Digital Transaction', 'Cheque'];

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

const LoadWallet = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userName = userData?.userName || userData?.UserName || 'system';

    // ── Redux ─────────────────────────────────────────────────────────────────
    const wallets         = useSelector(selectWallets);
    const walletsLoading  = useSelector(selectWalletsLoading);
    const toWallets       = useSelector(selectToWallets);
    const toWalletsLoading = useSelector(selectToWalletsLoading);
    const bankList        = useSelector(selectBankDetailsArray);
    const bankLoading     = useSelector(selectBankDetailsLoading);
    const saveStatus      = useSelector(selectLwSaveStatus);
    const saveLoading     = useSelector(selectLwSaveLoading);
    const saveError       = useSelector(selectLwSaveError);

    // ── Form state ────────────────────────────────────────────────────────────
    const [transferFrom,  setTransferFrom]  = useState('');
    const [fromBank,      setFromBank]      = useState(null);
    const [fromWallet,    setFromWallet]    = useState(null);
    const [toWallet,      setToWallet]      = useState(null);
    const [modeOfPay,     setModeOfPay]     = useState('');
    const [transactionNo, setTransactionNo] = useState('');
    const [date,          setDate]          = useState(null);
    const [amount,        setAmount]        = useState('');
    const [remarks,       setRemarks]       = useState('');

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchAllWallets());
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => { dispatch(resetLoadWallet()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // ── Transfer from change: clear downstream ────────────────────────────────
    useEffect(() => {
        setFromBank(null);
        setFromWallet(null);
        setToWallet(null);
        setModeOfPay('');
        setTransactionNo('');
    }, [transferFrom]);

    // ── From wallet change: fetch to-wallets ──────────────────────────────────
    useEffect(() => {
        if (transferFrom === 'Wallet' && fromWallet) {
            setToWallet(null);
            dispatch(fetchToLoadWallets(fromWallet.WalletId));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromWallet, transferFrom]);

    // ── Save result ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Wallet loaded successfully!');
            dispatch(clearSaveResult());
            handleReset();
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError);
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus, saveError]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleReset = () => {
        setTransferFrom('');
        setFromBank(null);
        setFromWallet(null);
        setToWallet(null);
        setModeOfPay('');
        setTransactionNo('');
        setDate(null);
        setAmount('');
        setRemarks('');
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) setAmount(val);
    };

    const handleSubmit = () => {
        if (!transferFrom)  { toast.warn('Please select transfer from type.');       return; }
        if (transferFrom === 'Bank'   && !fromBank)   { toast.warn('Please select source bank.');     return; }
        if (transferFrom === 'Wallet' && !fromWallet) { toast.warn('Please select source wallet.');   return; }
        if (!toWallet)  { toast.warn('Please select destination wallet.'); return; }
        if (!modeOfPay) { toast.warn('Please select mode of payment.'); return; }
        if (!transactionNo.trim()) { toast.warn('Please enter transaction / reference number.'); return; }
        if (!date)      { toast.warn('Please select transaction date.'); return; }
        if (!amount || parseFloat(amount) <= 0) { toast.warn('Please enter a valid amount.'); return; }
        if (!remarks.trim()) { toast.warn('Please enter remarks.'); return; }

        const formId = transferFrom === 'Bank'
            ? (fromBank?.BankId || 0)
            : (fromWallet?.WalletId || 0);

        dispatch(submitLoadWallet({
            Transferfrom:    transferFrom,
            FormId:          formId,
            ToId:            toWallet.WalletId,
            Modeofpay:       modeOfPay,
            TransactionNo:   transactionNo.trim(),
            TransferAmount:  parseFloat(amount),
            TransactionDate: date,
            Remarks:         remarks.trim(),
            RoleId:          roleId,
            Createdby:       userName,
        }));
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const numAmount     = parseFloat(amount) || 0;
    const amountDisplay = getAmountDisplay(numAmount);

    // To-wallet list for Bank mode = all wallets; for Wallet mode = toWallets from API
    const toWalletList = transferFrom === 'Bank' ? wallets : toWallets;

    const sourceLabel = transferFrom === 'Bank'
        ? (fromBank?.BankName || '—')
        : (fromWallet?.WalletName || '—');

    const showSummary = transferFrom && (fromBank || fromWallet) && toWallet &&
        modeOfPay && transactionNo.trim() && date && numAmount > 0;

    const canSubmit   = showSummary && !saveLoading && remarks.trim();
    const isBusy      = saveLoading || bankLoading || walletsLoading;

    const dateDisplay = date
        ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
        : '—';

    // ── Render ────────────────────────────────────────────────────────────────
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
                                <Wallet className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Load Wallet'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Transfer funds from Bank or Wallet to a GST Wallet</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / Wallet</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Transfer Type & Source ───────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <SectionHeader
                        icon={ArrowRight}
                        title="Transfer Source"
                        subtitle="Choose transfer type and source account"
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
                        <InnerHeader icon={ArrowRight} title="Source Selection" subtitle="Select where the funds are coming from" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

                            {/* Transfer From Type */}
                            <div>
                                <Label required>Transfer From</Label>
                                <div className="relative">
                                    <select
                                        className={`${inputCls} appearance-none pr-10`}
                                        value={transferFrom}
                                        onChange={(e) => setTransferFrom(e.target.value)}
                                        disabled={isBusy}
                                    >
                                        <option value="">— Select Type —</option>
                                        {TRANSFER_FROM_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={false} />
                                </div>
                            </div>

                            {/* From Bank */}
                            {transferFrom === 'Bank' && (
                                <div>
                                    <Label required>Source Bank</Label>
                                    <div className="relative">
                                        <select
                                            className={`${inputCls} appearance-none pr-10`}
                                            value={fromBank?.BankId || ''}
                                            onChange={(e) => {
                                                const bank = bankList.find(b => b.BankId === parseInt(e.target.value));
                                                setFromBank(bank || null);
                                                setToWallet(null);
                                            }}
                                            disabled={bankLoading || isBusy}
                                        >
                                            <option value="">{bankLoading ? 'Loading…' : '— Select Bank —'}</option>
                                            {bankList.map((b) => (
                                                <option key={b.BankId} value={b.BankId}>
                                                    {b.BankName}
                                                </option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={bankLoading} />
                                    </div>
                                </div>
                            )}

                            {/* From Wallet */}
                            {transferFrom === 'Wallet' && (
                                <div>
                                    <Label required>Source Wallet</Label>
                                    <div className="relative">
                                        <select
                                            className={`${inputCls} appearance-none pr-10`}
                                            value={fromWallet?.WalletId || ''}
                                            onChange={(e) => {
                                                const w = wallets.find(x => x.WalletId === parseInt(e.target.value));
                                                setFromWallet(w || null);
                                                setToWallet(null);
                                            }}
                                            disabled={walletsLoading || isBusy}
                                        >
                                            <option value="">{walletsLoading ? 'Loading…' : '— Select Source Wallet —'}</option>
                                            {wallets.map((w) => (
                                                <option key={w.WalletId} value={w.WalletId}>{w.WalletName}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={walletsLoading} />
                                    </div>
                                </div>
                            )}

                            {/* To Wallet */}
                            {transferFrom && (
                                <div>
                                    <Label required>Destination Wallet</Label>
                                    <div className="relative">
                                        <select
                                            className={`${inputCls} appearance-none pr-10`}
                                            value={toWallet?.WalletId || ''}
                                            onChange={(e) => {
                                                const w = toWalletList.find(x => x.WalletId === parseInt(e.target.value));
                                                setToWallet(w || null);
                                            }}
                                            disabled={
                                                walletsLoading || toWalletsLoading || isBusy ||
                                                (transferFrom === 'Bank'   && !fromBank) ||
                                                (transferFrom === 'Wallet' && !fromWallet)
                                            }
                                        >
                                            <option value="">
                                                {toWalletsLoading || walletsLoading
                                                    ? 'Loading…'
                                                    : (transferFrom === 'Bank' && !fromBank) || (transferFrom === 'Wallet' && !fromWallet)
                                                        ? 'Select source first'
                                                        : '— Select Destination Wallet —'}
                                            </option>
                                            {toWalletList.map((w) => (
                                                <option key={w.WalletId} value={w.WalletId}>{w.WalletName}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={toWalletsLoading || walletsLoading} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Transfer arrow */}
                        {((fromBank || fromWallet) && toWallet) && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800">
                                <div className="flex-1 text-center">
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">{sourceLabel}</p>
                                    <p className="text-[10px] text-gray-400">{transferFrom}</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                                <div className="flex-1 text-center">
                                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 truncate">{toWallet.WalletName}</p>
                                    <p className="text-[10px] text-gray-400">Wallet</p>
                                </div>
                            </div>
                        )}

                        {/* Bank balance info */}
                        {transferFrom === 'Bank' && fromBank && (
                            <div className="mt-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Source Bank Details</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account No</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{fromBank.AccountNo || '—'}</p>
                                    </div>
                                    <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Type</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{fromBank.AccountType || '—'}</p>
                                    </div>
                                    <div className="rounded-xl p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Available Balance</p>
                                        <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">₹ {formatIndianCurrency(fromBank.AvailableBalance)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Payment Details ──────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <SectionHeader
                        icon={IndianRupee}
                        title="Payment Details"
                        subtitle="Mode, reference, amount and date"
                    />
                    <div className="p-6 md:p-8">
                        <InnerHeader icon={IndianRupee} title="Transaction Info" subtitle="Provide payment mode and reference details" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                            {/* Mode of Payment */}
                            <div>
                                <Label required>Mode of Payment</Label>
                                <div className="relative">
                                    <select
                                        className={`${inputCls} appearance-none pr-10`}
                                        value={modeOfPay}
                                        onChange={(e) => setModeOfPay(e.target.value)}
                                        disabled={!transferFrom || isBusy}
                                    >
                                        <option value="">— Select Mode —</option>
                                        {MODE_OPTIONS.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={false} />
                                </div>
                            </div>

                            {/* Transaction No */}
                            <div>
                                <Label required>Transaction / Reference No.</Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className={`${inputCls} pl-9`}
                                        placeholder="Enter reference number"
                                        value={transactionNo}
                                        onChange={(e) => setTransactionNo(e.target.value)}
                                        disabled={isBusy}
                                    />
                                </div>
                            </div>

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
                                        disabled={isBusy}
                                        className={`${inputCls} pl-9`}
                                    />
                                </div>
                                {numAmount > 0 && (
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1.5 italic flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {amountDisplay.words}
                                    </p>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <Label required>Transaction Date</Label>
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

                {/* ── Remarks ──────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <SectionHeader icon={StickyNote} title="Remarks" subtitle="Additional notes for this transfer" />
                    <div className="p-6 md:p-8">
                        <InnerHeader icon={StickyNote} title="Narration" subtitle="Describe the purpose of this wallet transfer" />
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

                {/* ── Summary ──────────────────────────────────────────────── */}
                {showSummary && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <SectionHeader icon={CheckCircle} title="Transfer Summary" subtitle="Review before submitting" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                {[
                                    { label: 'Transfer From',   value: transferFrom },
                                    { label: 'Source',          value: sourceLabel },
                                    { label: 'To Wallet',       value: toWallet?.WalletName },
                                    { label: 'Mode',            value: modeOfPay },
                                    { label: 'Reference No',    value: transactionNo || '—' },
                                    { label: 'Date',            value: dateDisplay },
                                    { label: 'Amount',          value: `₹ ${formatIndianCurrency(numAmount)}` },
                                    { label: 'In Words',        value: amountDisplay.words, wide: true },
                                    { label: 'Remarks',         value: remarks || '—', wide: true },
                                    { label: 'Created By',      value: userName },
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

export default LoadWallet;
