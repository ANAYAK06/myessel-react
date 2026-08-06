import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Landmark, Layers, CreditCard, StickyNote, CheckCircle,
    Loader2, ChevronDown, RotateCcw, Send, Navigation,
    User, Hash, PlusCircle, X, RefreshCcw,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchRefundCCList,
    fetchRefundDCAList,
    fetchRefundSDCAList,
    fetchRefundIntDCAList,
    fetchRefundIntSDCAList,
    submitRefund,
    clearRefundDCAAndBelow,
    clearRefundSDCAList,
    clearRefundIntDCAAndBelow,
    clearRefundIntSDCAList,
    clearRefundSaveResult,
    resetRefund,
    selectRefundCCList,
    selectRefundDCAList,
    selectRefundSDCAList,
    selectRefundIntDCAList,
    selectRefundIntSDCAList,
    selectRefundCCLoading,
    selectRefundDCALoading,
    selectRefundSDCALoading,
    selectRefundIntDCALoading,
    selectRefundIntSDCALoading,
    selectRefundSaveStatus,
    selectRefundSaveLoading,
    selectRefundSaveError,
} from '../../slices/accountsSlice/refundSlice';

import {
    fetchBankDetailsWithAvailableBalance,
    resetBankDetailsData,
    selectBankDetailsArray,
    selectBankDetailsLoading,
} from '../../slices/CommonSlice/bankDetailsSlice';

// ── Constants ──────────────────────────────────────────────────────────────────
const MODE_OPTIONS = ['RTGS/E-Trans', 'NEFT', 'IMPS', 'UPI', 'Cheque', 'Cash'];
const CATEGORY_OPTIONS = [
    { value: 'Refund',      label: 'Refund' },
    { value: 'OtherRefund', label: 'Other Refund' },
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

// ── Shared UI primitives (matches RecieptAgainstScrapSale / GeneralPayment) ────
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

// ── Component ─────────────────────────────────────────────────────────────────
const Refund = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    // ── Selectors ──────────────────────────────────────────────────────────────
    const ccList         = useSelector(selectRefundCCList);
    const dcaList        = useSelector(selectRefundDCAList);
    const sdcaList       = useSelector(selectRefundSDCAList);
    const intDcaList     = useSelector(selectRefundIntDCAList);
    const intSdcaList    = useSelector(selectRefundIntSDCAList);
    const ccLoading      = useSelector(selectRefundCCLoading);
    const dcaLoading     = useSelector(selectRefundDCALoading);
    const sdcaLoading    = useSelector(selectRefundSDCALoading);
    const intDcaLoading  = useSelector(selectRefundIntDCALoading);
    const intSdcaLoading = useSelector(selectRefundIntSDCALoading);

    const bankList    = useSelector(selectBankDetailsArray);
    const bankLoading = useSelector(selectBankDetailsLoading);

    const saveStatus = useSelector(selectRefundSaveStatus);
    const saving     = useSelector(selectRefundSaveLoading);
    const saveError  = useSelector(selectRefundSaveError);

    // ── Form state ─────────────────────────────────────────────────────────────
    const [date,             setDate]             = useState(null);
    const [paymentCategory,  setPaymentCategory]  = useState('');

    const [selectedCC,   setSelectedCC]   = useState('');
    const [selectedDCA,  setSelectedDCA]  = useState('');
    const [selectedSDCA, setSelectedSDCA] = useState('');

    const [addInterest, setAddInterest] = useState(false);
    const [intCC,   setIntCC]   = useState('');
    const [intDCA,  setIntDCA]  = useState('');
    const [intSDCA, setIntSDCA] = useState('');
    const [intAmount, setIntAmount] = useState('');

    const [principleAmount, setPrincipleAmount] = useState('');
    const [name,            setName]            = useState('');

    const [selectedBank, setSelectedBank] = useState('');
    const [modeOfPay,    setModeOfPay]    = useState('');
    const [refNumber,    setRefNumber]    = useState('');
    const [paymentDate,  setPaymentDate]  = useState(null);
    const [remarks,      setRemarks]      = useState('');

    const isBusy = saving;

    // ── Init ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (userId && roleId) dispatch(fetchRefundCCList({ uid: userId, rid: roleId }));
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => {
            dispatch(resetRefund());
            dispatch(resetBankDetailsData());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, userId, roleId]);

    // ── Save result ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Refund saved successfully!');
            dispatch(clearRefundSaveResult());
            handleReset();
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError);
            dispatch(clearRefundSaveResult());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus, saveError, dispatch]);

    // ── Category change: reset dependent fields ───────────────────────────────
    const handleCategoryChange = (val) => {
        setPaymentCategory(val);
        setSelectedCC(''); setSelectedDCA(''); setSelectedSDCA('');
        dispatch(clearRefundDCAAndBelow());
        setAddInterest(false);
        setIntCC(''); setIntDCA(''); setIntSDCA(''); setIntAmount('');
        dispatch(clearRefundIntDCAAndBelow());
    };

    // ── Cascade handlers (principal) ───────────────────────────────────────────
    const handleCCChange = useCallback((code) => {
        setSelectedCC(code);
        setSelectedDCA('');
        setSelectedSDCA('');
        dispatch(clearRefundDCAAndBelow());
        if (code) dispatch(fetchRefundDCAList(code));
    }, [dispatch]);

    const handleDCAChange = useCallback((code) => {
        setSelectedDCA(code);
        setSelectedSDCA('');
        dispatch(clearRefundSDCAList());
        if (code) dispatch(fetchRefundSDCAList(code));
    }, [dispatch]);

    // ── Cascade handlers (interest) ────────────────────────────────────────────
    const handleIntCCChange = useCallback((code) => {
        setIntCC(code);
        setIntDCA('');
        setIntSDCA('');
        dispatch(clearRefundIntDCAAndBelow());
        if (code) dispatch(fetchRefundIntDCAList(code));
    }, [dispatch]);

    const handleIntDCAChange = useCallback((code) => {
        setIntDCA(code);
        setIntSDCA('');
        dispatch(clearRefundIntSDCAList());
        if (code) dispatch(fetchRefundIntSDCAList(code));
    }, [dispatch]);

    const toggleAddInterest = () => {
        const next = !addInterest;
        setAddInterest(next);
        if (!next) {
            setIntCC(''); setIntDCA(''); setIntSDCA(''); setIntAmount('');
            dispatch(clearRefundIntDCAAndBelow());
        }
    };

    // ── Reset ──────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setDate(null);
        setPaymentCategory('');
        setSelectedCC(''); setSelectedDCA(''); setSelectedSDCA('');
        setAddInterest(false);
        setIntCC(''); setIntDCA(''); setIntSDCA(''); setIntAmount('');
        setPrincipleAmount('');
        setName('');
        setSelectedBank('');
        setModeOfPay('');
        setRefNumber('');
        setPaymentDate(null);
        setRemarks('');
        dispatch(clearRefundDCAAndBelow());
        dispatch(clearRefundIntDCAAndBelow());
    };

    // ── Derived ────────────────────────────────────────────────────────────────
    const finalAmount = (parseFloat(principleAmount) || 0) + (addInterest ? (parseFloat(intAmount) || 0) : 0);
    const selectedBankObj = bankList.find((b) => String(b.BankId) === String(selectedBank));

    const canSubmit = date && paymentCategory && selectedCC && selectedDCA &&
        parseFloat(principleAmount) > 0 && name.trim() && selectedBank && modeOfPay &&
        refNumber.trim() && paymentDate && remarks.trim() &&
        (!addInterest || (intCC && intDCA && parseFloat(intAmount) > 0));

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!date)                              { toast.warn('Please select a date.');                        return; }
        if (!paymentCategory)                   { toast.warn('Please select a payment category.');             return; }
        if (!selectedCC)                        { toast.warn('Please select a Cost Centre.');                  return; }
        if (!selectedDCA)                       { toast.warn('Please select an Account Head (DCA).');          return; }
        if (!(parseFloat(principleAmount) > 0)) { toast.warn('Please enter a valid amount.');                  return; }
        if (addInterest) {
            if (!intCC)                          { toast.warn('Please select an Interest Cost Centre.');        return; }
            if (!intDCA)                         { toast.warn('Please select an Interest Account Head.');       return; }
            if (!(parseFloat(intAmount) > 0))    { toast.warn('Please enter a valid interest amount.');         return; }
        }
        if (!name.trim())                       { toast.warn('Please enter the name.');                        return; }
        if (!selectedBank)                      { toast.warn('Please select a bank.');                         return; }
        if (!modeOfPay)                         { toast.warn('Please select mode of payment.');                return; }
        if (!refNumber.trim())                  { toast.warn('Please enter the reference / transaction number.'); return; }
        if (!paymentDate)                       { toast.warn('Please select a payment date.');                 return; }
        if (!remarks.trim())                    { toast.warn('Please enter remarks.');                         return; }

        dispatch(submitRefund({
            date:               formatDateForAPI(date),
            paymentCategory,
            principleCCCode:    selectedCC,
            principleDCACode:   selectedDCA,
            principleSDCACode:  selectedSDCA,
            principleAmount:    parseFloat(principleAmount) || 0,
            intCCCode:          addInterest ? intCC   : '',
            intDCACode:         addInterest ? intDCA  : '',
            intSDCACode:        addInterest ? intSDCA : '',
            intAmount:          addInterest ? (parseFloat(intAmount) || 0) : 0,
            name:               name.trim(),
            bankId:             selectedBank,
            modeOfPay,
            refundNo:           refNumber.trim(),
            paymentDate:        formatDateForAPI(paymentDate),
            remarks:            remarks.trim(),
            finalAmount,
            createdBy:          userName,
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
                                <RefreshCcw className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Refund'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Record a refund payment against a cost centre</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / Refund</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Section 1: Date & Category ────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Layers} title="Date & Payment Category" subtitle="Select the entry date and the type of refund" action={
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
                                <Label required>Payment Category</Label>
                                <div className="flex flex-wrap gap-2.5 mt-1">
                                    {CATEGORY_OPTIONS.map((c) => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => !isBusy && handleCategoryChange(c.value)}
                                            disabled={isBusy}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                                                ${paymentCategory === c.value
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 bg-white dark:bg-gray-800'}
                                                disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                                ${paymentCategory === c.value ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                                {paymentCategory === c.value && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                                            </span>
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {paymentCategory === 'Refund' && (
                            <div className="mt-5 max-w-xs">
                                <Label required>Refund Type</Label>
                                <div className="relative">
                                    <select value="SD" disabled className={`${selectCls} cursor-not-allowed`}>
                                        <option value="SD">SD — Security Deposit</option>
                                    </select>
                                    <SelectIcon loading={false} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section 2: Cost Centre & Account Head ─────────────────── */}
                {paymentCategory && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={Layers} title="Cost Centre & Account Head" subtitle="Select CC, DCA and Sub-DCA for the refund amount" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <Label required>Cost Centre (CC)</Label>
                                    <div className="relative">
                                        <select
                                            value={selectedCC}
                                            onChange={(e) => handleCCChange(e.target.value)}
                                            disabled={ccLoading || isBusy}
                                            className={selectCls}
                                        >
                                            <option value="">{ccLoading ? 'Loading...' : '— Select Cost Centre —'}</option>
                                            {ccList.map((cc) => (
                                                <option key={cc.CC_Id} value={cc.CC_Code}>{cc.CC_Code}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={ccLoading} />
                                    </div>
                                </div>
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
                                                {dcaLoading ? 'Loading...' : !selectedCC ? '— Select CC first —' : '— Select Account Head —'}
                                            </option>
                                            {dcaList.map((d) => (
                                                <option key={d.CashDCA_Id} value={d.CashDCA_Code}>{d.CashDCA_Code}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={dcaLoading} />
                                    </div>
                                </div>
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
                                                {sdcaLoading ? 'Loading...' : !selectedDCA ? '— Select DCA first —' : sdcaList.length === 0 ? 'No sub heads' : '— Select Sub Account Head —'}
                                            </option>
                                            {sdcaList.map((s) => (
                                                <option key={s.CashSDCA_Id} value={s.CashSDCA_Code}>{s.CashSDCA_Code}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={sdcaLoading} />
                                    </div>
                                </div>
                            </div>

                            {/* Add Interest — Other Refund only */}
                            {paymentCategory === 'OtherRefund' && (
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={toggleAddInterest}
                                        disabled={isBusy}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all
                                            ${addInterest
                                                ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 bg-white dark:bg-gray-800'}
                                            disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {addInterest ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                                        {addInterest ? 'Remove Interest' : 'Add Interest'}
                                    </button>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Optional — take the interest part of the refund into a separate CC / DCA</p>

                                    {addInterest && (
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-4">
                                            <div>
                                                <Label required>Interest CC</Label>
                                                <div className="relative">
                                                    <select
                                                        value={intCC}
                                                        onChange={(e) => handleIntCCChange(e.target.value)}
                                                        disabled={ccLoading || isBusy}
                                                        className={selectCls}
                                                    >
                                                        <option value="">— Select CC —</option>
                                                        {ccList.map((cc) => (
                                                            <option key={cc.CC_Id} value={cc.CC_Code}>{cc.CC_Code}</option>
                                                        ))}
                                                    </select>
                                                    <SelectIcon loading={false} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label required>Interest DCA</Label>
                                                <div className="relative">
                                                    <select
                                                        value={intDCA}
                                                        onChange={(e) => handleIntDCAChange(e.target.value)}
                                                        disabled={!intCC || intDcaLoading || isBusy}
                                                        className={selectCls}
                                                    >
                                                        <option value="">{!intCC ? '— Select CC first —' : '— Select DCA —'}</option>
                                                        {intDcaList.map((d) => (
                                                            <option key={d.CashDCA_Id} value={d.CashDCA_Code}>{d.CashDCA_Code}</option>
                                                        ))}
                                                    </select>
                                                    <SelectIcon loading={intDcaLoading} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Interest Sub DCA</Label>
                                                <div className="relative">
                                                    <select
                                                        value={intSDCA}
                                                        onChange={(e) => setIntSDCA(e.target.value)}
                                                        disabled={!intDCA || intSdcaLoading || isBusy}
                                                        className={selectCls}
                                                    >
                                                        <option value="">{!intDCA ? '— Select DCA first —' : 'No sub head'}</option>
                                                        {intSdcaList.map((s) => (
                                                            <option key={s.CashSDCA_Id} value={s.CashSDCA_Code}>{s.CashSDCA_Code}</option>
                                                        ))}
                                                    </select>
                                                    <SelectIcon loading={intSdcaLoading} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label required>Interest Amount (₹)</Label>
                                                <input
                                                    type="number" min="0" step="0.01" placeholder="0.00"
                                                    value={intAmount}
                                                    onChange={(e) => setIntAmount(e.target.value)}
                                                    disabled={isBusy}
                                                    className={inputCls}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Section 3: Amount & Payee ─────────────────────────────── */}
                {paymentCategory && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={CreditCard} title="Amount & Payee" subtitle="Refund amount and recipient name" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label required>Amount (₹)</Label>
                                    <input
                                        type="number" min="0" step="0.01" placeholder="0.00"
                                        value={principleAmount}
                                        onChange={(e) => setPrincipleAmount(e.target.value)}
                                        disabled={isBusy}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <Label required>Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={isBusy}
                                            placeholder="Enter recipient name"
                                            className={`${inputCls} pl-10`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Section 4: Bank & Payment Details ─────────────────────── */}
                {paymentCategory && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={Landmark} title="Bank & Payment Details" subtitle="Select bank, mode of payment and transaction date" />
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <Label required>Mode of Payment</Label>
                                    <div className="relative">
                                        <select
                                            value={modeOfPay}
                                            onChange={(e) => setModeOfPay(e.target.value)}
                                            disabled={isBusy}
                                            className={selectCls}
                                        >
                                            <option value="">— Select Mode —</option>
                                            {MODE_OPTIONS.map((m) => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={false} />
                                    </div>
                                </div>
                                <div>
                                    <Label required>Reference / Transaction No.</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={refNumber}
                                            onChange={(e) => setRefNumber(e.target.value)}
                                            disabled={isBusy}
                                            placeholder="Enter reference number"
                                            className={`${inputCls} pl-10`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label required>Payment Date</Label>
                                    <CustomDatePicker
                                        value={paymentDate}
                                        onChange={setPaymentDate}
                                        disabled={isBusy}
                                        maxDate={new Date()}
                                        placeholder="Select payment date"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label required>Final Amount (₹)</Label>
                                    <div className="px-3.5 py-2.5 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
                                        <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">₹ {fmt(finalAmount)}</p>
                                    </div>
                                    {addInterest && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            Amount ₹{fmt(principleAmount)} + Interest ₹{fmt(intAmount)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Section 5: Remarks ─────────────────────────────────────── */}
                {paymentCategory && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={StickyNote} title="Remarks" />
                        <div className="p-6 md:p-8">
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
                )}

                {/* ── Section 6: Summary ────────────────────────────────────── */}
                {canSubmit && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={CheckCircle} title="Refund Summary" subtitle="Review before submission" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                {[
                                    { label: 'Category',       value: CATEGORY_OPTIONS.find(c => c.value === paymentCategory)?.label },
                                    { label: 'Cost Centre',    value: selectedCC },
                                    { label: 'Name',           value: name },
                                    { label: 'Amount',         value: `₹ ${fmt(principleAmount)}` },
                                    ...(addInterest ? [{ label: 'Interest Amount', value: `₹ ${fmt(intAmount)}` }] : []),
                                    { label: 'Final Amount',   value: `₹ ${fmt(finalAmount)}` },
                                    { label: 'Bank',           value: selectedBankObj?.BankName },
                                    { label: 'Mode',           value: modeOfPay },
                                    { label: 'Reference No',   value: refNumber },
                                    { label: 'Payment Date',   value: formatDateForAPI(paymentDate) },
                                    { label: 'Remarks',        value: remarks, wide: true },
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
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 pb-6">
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
                            <><Send className="h-4 w-4" /> Submit Refund</>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Refund;
