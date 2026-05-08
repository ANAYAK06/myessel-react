import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Building2, CreditCard, Loader2, RotateCcw, Send,
    ChevronDown, IndianRupee, StickyNote, User, Layers,
    Hash, CalendarDays, Landmark,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchSelfCCList,
    fetchDCAList,
    fetchSDCAList,
    clearSDCAList,
    clearDCAAndBelow,
    resetCashVoucher,
    selectSelfCCList,
    selectDCAList,
    selectSDCAList,
    selectSelfCCLoading,
    selectDCALoading,
    selectSDCALoading,
} from '../../slices/accountsSlice/cashVoucherSlice';

import {
    fetchBankDetailsWithAvailableBalance,
    resetBankDetailsData,
    selectBankDetailsArray,
    selectBankDetailsLoading,
} from '../../slices/CommonSlice/bankDetailsSlice';

import {
    submitGeneralPayment,
    clearSaveResult,
    resetGeneralPayment,
    selectGpSaveStatus,
    selectGpSaveLoading,
    selectGpSaveError,
} from '../../slices/accountsSlice/generalPaymentSlice';

// ── Constants ──────────────────────────────────────────────────────────────────
const MODE_OPTIONS = ['Cheque', 'NEFT', 'RTGS', 'IMPS', 'UPI'];

const fmt = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ── Shared UI helpers ──────────────────────────────────────────────────────────
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

const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl flex items-center gap-3">
            <Icon className="h-4 w-4 text-indigo-500" />
            <div>
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
            </div>
        </div>
        <div className="p-6 md:p-8">{children}</div>
    </div>
);

// ── Component ──────────────────────────────────────────────────────────────────
const GeneralPayment = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    // ── Selectors ──────────────────────────────────────────────────────────────
    const ccList      = useSelector(selectSelfCCList);
    const dcaList     = useSelector(selectDCAList);
    const sdcaList    = useSelector(selectSDCAList);
    const bankList    = useSelector(selectBankDetailsArray);
    const ccLoading   = useSelector(selectSelfCCLoading);
    const dcaLoading  = useSelector(selectDCALoading);
    const sdcaLoading = useSelector(selectSDCALoading);
    const bankLoading = useSelector(selectBankDetailsLoading);
    const saveStatus  = useSelector(selectGpSaveStatus);
    const saving      = useSelector(selectGpSaveLoading);
    const saveError   = useSelector(selectGpSaveError);

    // ── Form state ─────────────────────────────────────────────────────────────
    const [selectedCC,    setSelectedCC]    = useState('');
    const [selectedDCA,   setSelectedDCA]   = useState('');
    const [selectedSDCA,  setSelectedSDCA]  = useState('');
    const [selectedBank,  setSelectedBank]  = useState('');
    const [modeOfPay,     setModeOfPay]     = useState('');
    const [refNumber,     setRefNumber]     = useState('');
    const [txnDate,       setTxnDate]       = useState(null);
    const [amount,        setAmount]        = useState('');
    const [name,          setName]          = useState('');
    const [remarks,       setRemarks]       = useState('');

    const isBusy = saving;

    // ── On mount ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (userId && roleId) dispatch(fetchSelfCCList({ uid: userId, rid: roleId }));
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => {
            dispatch(resetCashVoucher());
            dispatch(resetBankDetailsData());
            dispatch(resetGeneralPayment());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, userId, roleId]);

    // ── Save result handler ────────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('General payment saved successfully!');
            dispatch(clearSaveResult());
            handleReset();
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError);
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus, saveError, dispatch]);

    // ── Cascade handlers ───────────────────────────────────────────────────────
    const handleCCChange = useCallback((val) => {
        setSelectedCC(val);
        setSelectedDCA('');
        setSelectedSDCA('');
        dispatch(clearDCAAndBelow());
        if (val) dispatch(fetchDCAList(val));
    }, [dispatch]);

    const handleDCAChange = useCallback((val) => {
        setSelectedDCA(val);
        setSelectedSDCA('');
        dispatch(clearSDCAList());
        if (val) dispatch(fetchSDCAList(val));
    }, [dispatch]);

    const handleModeChange = (mode) => {
        setModeOfPay(mode);
        setRefNumber('');
    };

    const handleAmountChange = (e) => {
        const v = e.target.value;
        if (v === '' || /^\d*\.?\d*$/.test(v)) setAmount(v);
    };

    // ── Reset ──────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setSelectedCC('');
        setSelectedDCA('');
        setSelectedSDCA('');
        setSelectedBank('');
        setModeOfPay('');
        setRefNumber('');
        setTxnDate(null);
        setAmount('');
        setName('');
        setRemarks('');
        dispatch(clearDCAAndBelow());
    };

    // ── Validation & Submit ────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!selectedCC)                           { toast.warn('Please select a Cost Center.');        return; }
        if (!selectedDCA)                          { toast.warn('Please select an Account Head (DCA).'); return; }
        if (!name.trim())                          { toast.warn('Please enter the payee name.');         return; }
        if (!selectedBank)                         { toast.warn('Please select a Bank.');                return; }
        if (!modeOfPay)                            { toast.warn('Please select Mode of Payment.');       return; }
        if (!refNumber.trim())                     { toast.warn(`Please enter the ${modeOfPay === 'Cheque' ? 'Cheque Number' : 'Reference Number'}.`); return; }
        if (!txnDate)                              { toast.warn('Please select a Transaction Date.');    return; }
        if (!amount || parseFloat(amount) <= 0)    { toast.warn('Please enter a valid Amount.');         return; }

        const bank = bankList.find((b) => String(b.BankId) === String(selectedBank));
        const available = parseFloat(bank?.AvailableBalance) || 0;
        if (parseFloat(amount) > available) {
            toast.warn(`Amount ₹${fmt(amount)} exceeds available bank balance ₹${fmt(available)}.`);
            return;
        }

        dispatch(submitGeneralPayment({
            ccCode:          selectedCC,
            dcaCode:         selectedDCA,
            subDcaCode:      selectedSDCA,
            name:            name.trim(),
            bankId:          selectedBank,
            modeOfPay,
            referenceNumber: refNumber.trim(),
            transactionDate: txnDate,
            amount:          parseFloat(amount),
            remarks:         remarks.trim(),
            createdBy:       userName,
            roleId,
        }));
    };

    // ── Derived ────────────────────────────────────────────────────────────────
    const selectedBankObj = bankList.find((b) => String(b.BankId) === String(selectedBank));
    const refLabel = modeOfPay === 'Cheque' ? 'Cheque Number' : 'Reference / Transaction No.';

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
            {/* Page header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                        <Landmark className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        General Payment from Bank
                    </h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">
                    Create a new bank payment entry
                </p>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">

                {/* ── Section 1: Cost Centre & Account Head ──────────────────── */}
                <SectionCard icon={Layers} title="Cost Centre & Account Head"
                    subtitle="Select CC, DCA and Sub-DCA">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* CC Code */}
                        <div>
                            <Label required>Cost Centre (CC)</Label>
                            <div className="relative">
                                <select
                                    value={selectedCC}
                                    onChange={(e) => handleCCChange(e.target.value)}
                                    disabled={ccLoading || isBusy}
                                    className={selectCls}
                                >
                                    <option value="">
                                        {ccLoading ? 'Loading...' : '— Select Cost Centre —'}
                                    </option>
                                    {ccList.map((cc) => (
                                        <option key={cc.CC_Id} value={cc.CC_Id}>
                                            {cc.CC_Code}
                                        </option>
                                    ))}
                                </select>
                                <SelectIcon loading={ccLoading} />
                            </div>
                        </div>

                        {/* DCA Code */}
                        <div>
                            <Label required>Account Head (DCA)</Label>
                            <div className="relative">
                                <select
                                    value={selectedDCA}
                                    onChange={(e) => handleDCAChange(e.target.value)}
                                    disabled={!selectedCC || dcaLoading || isBusy}
                                    className={selectCls}
                                >
                                    <option value="">
                                        {dcaLoading ? 'Loading...'
                                            : !selectedCC ? '— Select CC first —'
                                            : '— Select Account Head —'}
                                    </option>
                                    {dcaList.map((d) => (
                                        <option key={d.CashDCA_Id} value={d.CashDCA_Id}>
                                            {d.CashDCA_Code}
                                        </option>
                                    ))}
                                </select>
                                <SelectIcon loading={dcaLoading} />
                            </div>
                        </div>

                        {/* Sub DCA */}
                        <div>
                            <Label>Sub Account Head (Sub DCA)</Label>
                            <div className="relative">
                                <select
                                    value={selectedSDCA}
                                    onChange={(e) => setSelectedSDCA(e.target.value)}
                                    disabled={!selectedDCA || sdcaLoading || isBusy}
                                    className={selectCls}
                                >
                                    <option value="">
                                        {sdcaLoading ? 'Loading...'
                                            : !selectedDCA ? '— Select DCA first —'
                                            : sdcaList.length === 0 ? 'No sub heads'
                                            : '— Select Sub Account Head —'}
                                    </option>
                                    {sdcaList.map((s) => (
                                        <option key={s.CashSDCA_Id} value={s.CashSDCA_Id}>
                                            {s.CashSDCA_Code}
                                        </option>
                                    ))}
                                </select>
                                <SelectIcon loading={sdcaLoading} />
                            </div>
                        </div>

                    </div>
                </SectionCard>

                {/* ── Section 2: Bank & Payment Details ─────────────────────── */}
                <SectionCard icon={Building2} title="Bank & Payment Details"
                    subtitle="Select bank, mode of payment and reference">
                    <div className="space-y-6">

                        {/* Bank + Available Balance */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <Label required>Bank Account</Label>
                                <div className="relative">
                                    <select
                                        value={selectedBank}
                                        onChange={(e) => setSelectedBank(e.target.value)}
                                        disabled={bankLoading || isBusy}
                                        className={selectCls}
                                    >
                                        <option value="">
                                            {bankLoading ? 'Loading...' : '— Select Bank —'}
                                        </option>
                                        {bankList.map((b) => (
                                            <option key={b.BankId} value={b.BankId}>
                                                {b.BankName}
                                            </option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={bankLoading} />
                                </div>
                            </div>

                            {selectedBankObj && (
                                <div className="flex flex-col justify-end">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-0.5">
                                            Available Balance
                                        </p>
                                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                                            ₹ {fmt(selectedBankObj.AvailableBalance)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mode of Payment */}
                        <div>
                            <Label required>Mode of Payment</Label>
                            <div className="flex flex-wrap gap-2.5 mt-1">
                                {MODE_OPTIONS.map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => !isBusy && handleModeChange(m)}
                                        disabled={isBusy}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all
                                            ${modeOfPay === m
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 bg-white dark:bg-gray-800'}
                                            disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                            ${modeOfPay === m ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {modeOfPay === m && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            )}
                                        </span>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Ref / Cheque Number */}
                        {modeOfPay && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label required>{refLabel}</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={refNumber}
                                            onChange={(e) => setRefNumber(e.target.value)}
                                            disabled={isBusy}
                                            placeholder={modeOfPay === 'Cheque' ? 'Enter cheque number' : 'Enter reference / UTR number'}
                                            className={`${inputCls} pl-10`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </SectionCard>

                {/* ── Section 3: Payment Info ────────────────────────────────── */}
                <SectionCard icon={CreditCard} title="Payment Information"
                    subtitle="Payee, amount and transaction date">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Payee Name */}
                        <div>
                            <Label required>Payee Name</Label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isBusy}
                                    placeholder="Enter payee / beneficiary name"
                                    className={`${inputCls} pl-10`}
                                />
                            </div>
                        </div>

                        {/* Transaction Date */}
                        <div>
                            <Label required>Transaction Date</Label>
                            <CustomDatePicker
                                value={txnDate}
                                onChange={setTxnDate}
                                disabled={isBusy}
                                placeholder="Select date"
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <Label required>Amount (₹)</Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    disabled={isBusy}
                                    placeholder="0.00"
                                    className={`${inputCls} pl-10`}
                                />
                            </div>
                            {amount && parseFloat(amount) > 0 && (
                                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 font-medium">
                                    ₹ {fmt(amount)}
                                </p>
                            )}
                        </div>

                    </div>
                </SectionCard>

                {/* ── Section 4: Remarks ─────────────────────────────────────── */}
                <SectionCard icon={StickyNote} title="Remarks">
                    <div>
                        <Label>Remarks</Label>
                        <textarea
                            rows={3}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            disabled={isBusy}
                            placeholder="Add any relevant notes or remarks..."
                            className={`${inputCls} resize-none`}
                        />
                    </div>
                </SectionCard>

                {/* ── Action Buttons ─────────────────────────────────────────── */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 pb-6">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isBusy}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isBusy}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Save Payment
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default GeneralPayment;
