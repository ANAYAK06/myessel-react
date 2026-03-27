import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Receipt, Wallet, Building2, FileText, Loader2,
    AlertCircle, RotateCcw, Send, ChevronDown,
    IndianRupee, Navigation, BadgePercent, CreditCard,
    StickyNote, User, Layers,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchSelfCCList,
    fetchOtherCCList,
    fetchCCBalance,
    fetchDCAList,
    fetchSDCAList,
    fetchGSTNumbers,
    saveCashVoucher,
    clearSDCAList,
    clearDCAAndBelow,
    clearSaveResult,
    resetCashVoucher,
    selectSelfCCList,
    selectOtherCCList,
    selectCCBalance,
    selectDCAList,
    selectSDCAList,
    selectGSTNumbers,
    selectSaveStatus,
    selectSaveLoading,
    selectSaveError,
    selectSelfCCLoading,
    selectOtherCCLoading,
    selectCCBalanceLoading,
    selectDCALoading,
    selectSDCALoading,
    selectGSTLoading,
    selectDCAError,
    selectOtherCCError,
} from '../../slices/accountsSlice/cashVoucherSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

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

const RadioGroup = ({ options, value, onChange, disabled }) => (
    <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
            <button
                key={opt.value}
                type="button"
                onClick={() => !disabled && onChange(opt.value)}
                disabled={disabled}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                    ${value === opt.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 bg-white dark:bg-gray-800'}
                    disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${value === opt.value ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}>
                    {value === opt.value && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                </span>
                {opt.label}
            </button>
        ))}
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const CashVoucherCreation = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'User';

    // ── Selectors ──────────────────────────────────────────────────────────────
    const selfCCList       = useSelector(selectSelfCCList);
    const otherCCList      = useSelector(selectOtherCCList);
    const ccBalance        = useSelector(selectCCBalance);
    const dcaList          = useSelector(selectDCAList);
    const sdcaList         = useSelector(selectSDCAList);
    const gstNumbers       = useSelector(selectGSTNumbers);
    const saveStatus       = useSelector(selectSaveStatus);
    const saveLoading      = useSelector(selectSaveLoading);
    const saveError        = useSelector(selectSaveError);
    const selfCCLoading    = useSelector(selectSelfCCLoading);
    const otherCCLoading   = useSelector(selectOtherCCLoading);
    const ccBalanceLoading = useSelector(selectCCBalanceLoading);
    const dcaLoading       = useSelector(selectDCALoading);
    const sdcaLoading      = useSelector(selectSDCALoading);
    const gstLoading       = useSelector(selectGSTLoading);
    const dcaError         = useSelector(selectDCAError);
    const otherCCError     = useSelector(selectOtherCCError);

    // ── Local state ────────────────────────────────────────────────────────────
    const [voucherType,   setVoucherType]   = useState('Normal');    // 'Normal' | 'GST'
    const [gstType,       setGstType]       = useState('CGST_SGST'); // 'CGST_SGST' | 'IGST'
    const [gstNumber,     setGstNumber]     = useState('');
    const [cgstAmount,    setCgstAmount]    = useState('');
    const [sgstAmount,    setSgstAmount]    = useState('');
    const [igstAmount,    setIgstAmount]    = useState('');

    const [txnMode,       setTxnMode]       = useState('');          // 'Self Debit' | 'Debit from Other CC'
    const [selfCC,        setSelfCC]        = useState('');
    const [otherCC,       setOtherCC]       = useState('');

    const [voucherDate,   setVoucherDate]   = useState(null);
    const [paidDate,      setPaidDate]      = useState(null);

    const [selectedDCA,   setSelectedDCA]   = useState('');
    const [selectedSDCA,  setSelectedSDCA]  = useState('');
    const [name,          setName]          = useState('');
    const [remarks,       setRemarks]       = useState('');
    const [invoiceAmount, setInvoiceAmount] = useState('');

    // ── Computed total ─────────────────────────────────────────────────────────
    const totalAmount = (() => {
        const base = parseFloat(invoiceAmount) || 0;
        if (voucherType === 'Normal') return base;
        if (gstType === 'IGST')       return base + (parseFloat(igstAmount)  || 0);
        return base + (parseFloat(cgstAmount) || 0) + (parseFloat(sgstAmount) || 0);
    })();

    // ── On mount ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (userId && roleId) dispatch(fetchSelfCCList({ uid: userId, rid: roleId }));
        return () => { dispatch(resetCashVoucher()); };
    }, [dispatch, userId, roleId]);

    // ── GST numbers — fetch once when GST voucher selected ────────────────────
    useEffect(() => {
        if (voucherType === 'GST' && gstNumbers.length === 0) dispatch(fetchGSTNumbers());
    }, [voucherType, dispatch, gstNumbers.length]);

    // ── Other CC list — fetch once when mode changes ───────────────────────────
    useEffect(() => {
        if (txnMode === 'Debit from Other CC' && otherCCList.length === 0) {
            dispatch(fetchOtherCCList({ id: userId, type: '' }));
        }
    }, [txnMode, dispatch, userId, otherCCList.length]);

    // ── Save result handler ────────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Cash voucher created successfully!');
            dispatch(clearSaveResult());
            handleReset();
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError);
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus, saveError, dispatch]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleVoucherTypeChange = (val) => {
        setVoucherType(val);
        setGstNumber(''); setCgstAmount(''); setSgstAmount(''); setIgstAmount('');
        setGstType('CGST_SGST');
    };

    const handleTxnModeChange = (val) => {
        setTxnMode(val);
        setSelfCC(''); setOtherCC('');
        dispatch(clearDCAAndBelow());
        setSelectedDCA(''); setSelectedSDCA('');
    };

    const handleSelfCCChange = useCallback((val) => {
        setSelfCC(val);
        setSelectedDCA(''); setSelectedSDCA('');
        dispatch(clearDCAAndBelow());
        if (val) {
            dispatch(fetchCCBalance(val));
            dispatch(fetchDCAList(val));
        }
    }, [dispatch]);

    const handleDCAChange = useCallback((val) => {
        setSelectedDCA(val);
        setSelectedSDCA('');
        dispatch(clearSDCAList());
        if (val) dispatch(fetchSDCAList(val));
    }, [dispatch]);

    const handleReset = () => {
        setVoucherType('Normal'); setGstType('CGST_SGST');
        setGstNumber(''); setCgstAmount(''); setSgstAmount(''); setIgstAmount('');
        setTxnMode(''); setSelfCC(''); setOtherCC('');
        setVoucherDate(null); setPaidDate(null);
        setSelectedDCA(''); setSelectedSDCA('');
        setName(''); setRemarks(''); setInvoiceAmount('');
        dispatch(clearDCAAndBelow());
    };

    const handleSubmit = () => {
        if (!txnMode)         { toast.warn('Please select Transaction Mode.');      return; }
        if (!selfCC)          { toast.warn('Please select Self Cost Center.');      return; }
        if (txnMode === 'Debit from Other CC' && !otherCC) {
            toast.warn('Please select Other Cost Center.'); return;
        }
        if (!voucherDate)     { toast.warn('Please select Voucher Date.');          return; }
        if (!paidDate)        { toast.warn('Please select Paid Date.');             return; }
        if (!selectedDCA)     { toast.warn('Please select Account Head.');          return; }
        if (!name.trim())     { toast.warn('Please enter Name.');                   return; }
        if (!invoiceAmount || parseFloat(invoiceAmount) <= 0) {
            toast.warn('Please enter a valid Invoice Amount.'); return;
        }
        if (voucherType === 'GST') {
            if (!gstNumber)   { toast.warn('Please select GST Number.');            return; }
            if (gstType === 'IGST' && (!igstAmount || parseFloat(igstAmount) <= 0)) {
                toast.warn('Please enter IGST Amount.'); return;
            }
            if (gstType === 'CGST_SGST') {
                if (!cgstAmount || parseFloat(cgstAmount) <= 0) { toast.warn('Please enter CGST Amount.'); return; }
                if (!sgstAmount || parseFloat(sgstAmount) <= 0) { toast.warn('Please enter SGST Amount.'); return; }
            }
        }

        dispatch(saveCashVoucher({
            transactionMode: txnMode,
            selfCCCode:      selfCC,
            otherCCCode:     txnMode === 'Debit from Other CC' ? otherCC : '',
            voucherDate,
            paidDate,
            dcaCode:         selectedDCA,
            sdcaCode:        selectedSDCA,
            name:            name.trim(),
            remarks:         remarks.trim(),
            invoiceAmount:   parseFloat(invoiceAmount) || 0,
            totalAmount,
            paymentType:     voucherType,
            companyGST:      voucherType === 'GST' ? gstNumber : '',
            igstAmount:      voucherType === 'GST' && gstType === 'IGST'       ? parseFloat(igstAmount)  || 0 : 0,
            cgstAmount:      voucherType === 'GST' && gstType === 'CGST_SGST'  ? parseFloat(cgstAmount)  || 0 : 0,
            sgstAmount:      voucherType === 'GST' && gstType === 'CGST_SGST'  ? parseFloat(sgstAmount)  || 0 : 0,
            roleId,
            createdBy: userName,
        }));
    };

    const isBusy = saveLoading || dcaLoading || ccBalanceLoading;

    // ──────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <Receipt className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Cash Voucher Creation</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Create general cash payment voucher</p>
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

            <div className="max-w-5xl mx-auto space-y-6">

                {/* ── Top row: reset button ──────────────────────────────────── */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                    >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </button>
                </div>

                {/* ── Section 1: Voucher Type ─────────────────────────────────── */}
                <SectionCard icon={CreditCard} title="Voucher Type" subtitle="Select the type of cash voucher">
                    <RadioGroup
                        options={[
                            { value: 'Normal', label: 'Normal Voucher' },
                            { value: 'GST',    label: 'GST Voucher' },
                        ]}
                        value={voucherType}
                        onChange={handleVoucherTypeChange}
                        disabled={isBusy}
                    />

                    {voucherType === 'GST' && (
                        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* GST Number */}
                                <div>
                                    <Label required>GST Number</Label>
                                    <div className="relative">
                                        <select value={gstNumber} onChange={(e) => setGstNumber(e.target.value)}
                                            disabled={gstLoading || isBusy} className={selectCls}>
                                            <option value="">{gstLoading ? 'Loading...' : '— Select GST Number —'}</option>
                                            {gstNumbers.map((g) => (
                                                <option key={g.GSTNo || g.Id} value={g.GSTNo || g.Id}>{g.GSTNo || g.Id}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={gstLoading} />
                                    </div>
                                </div>
                                {/* GST Type */}
                                <div>
                                    <Label required>GST Type</Label>
                                    <RadioGroup
                                        options={[
                                            { value: 'CGST_SGST', label: 'CGST & SGST' },
                                            { value: 'IGST',      label: 'IGST' },
                                        ]}
                                        value={gstType}
                                        onChange={(v) => { setGstType(v); setCgstAmount(''); setSgstAmount(''); setIgstAmount(''); }}
                                        disabled={isBusy}
                                    />
                                </div>
                            </div>

                            {/* GST amounts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {gstType === 'CGST_SGST' ? (
                                    <>
                                        <div>
                                            <Label required>CGST Amount (₹)</Label>
                                            <input type="number" min="0" step="0.01" placeholder="0.00"
                                                value={cgstAmount} onChange={(e) => setCgstAmount(e.target.value)}
                                                disabled={isBusy} className={inputCls} />
                                        </div>
                                        <div>
                                            <Label required>SGST Amount (₹)</Label>
                                            <input type="number" min="0" step="0.01" placeholder="0.00"
                                                value={sgstAmount} onChange={(e) => setSgstAmount(e.target.value)}
                                                disabled={isBusy} className={inputCls} />
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <Label required>IGST Amount (₹)</Label>
                                        <input type="number" min="0" step="0.01" placeholder="0.00"
                                            value={igstAmount} onChange={(e) => setIgstAmount(e.target.value)}
                                            disabled={isBusy} className={inputCls} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* ── Section 2: Mode of Transaction ─────────────────────────── */}
                <SectionCard icon={Building2} title="Mode of Transaction" subtitle="Choose how the payment will be debited">
                    <RadioGroup
                        options={[
                            { value: 'Self Debit',          label: 'Self Debit' },
                            { value: 'Debit from Other CC', label: 'Debit from Other CC' },
                        ]}
                        value={txnMode}
                        onChange={handleTxnModeChange}
                        disabled={isBusy}
                    />

                    {txnMode && (
                        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">

                                {/* Self CC */}
                                <div>
                                    <Label required>Self Cost Center</Label>
                                    <div className="relative">
                                        <select value={selfCC} onChange={(e) => handleSelfCCChange(e.target.value)}
                                            disabled={selfCCLoading || isBusy} className={selectCls}>
                                            <option value="">{selfCCLoading ? 'Loading...' : '— Select Self CC —'}</option>
                                            {selfCCList.map((cc) => (
                                                <option key={cc.CC_Id} value={cc.CC_Id}>{cc.CC_Code}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={selfCCLoading} />
                                    </div>
                                </div>

                                {/* Cash Balance */}
                                {selfCC && (
                                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                                        <Wallet className="h-5 w-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase font-semibold tracking-wide">Cash Balance</p>
                                            {ccBalanceLoading
                                                ? <Loader2 className="h-4 w-4 animate-spin text-indigo-500 mt-0.5" />
                                                : <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">₹{fmt(ccBalance)}</p>
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Other CC */}
                                {txnMode === 'Debit from Other CC' && (
                                    <div>
                                        <Label required>Other Cost Center</Label>
                                        <div className="relative">
                                            <select value={otherCC} onChange={(e) => setOtherCC(e.target.value)}
                                                disabled={otherCCLoading || isBusy} className={selectCls}>
                                                <option value="">{otherCCLoading ? 'Loading...' : '— Select Other CC —'}</option>
                                                {otherCCList.map((cc) => (
                                                    <option key={cc.CC_Id} value={cc.CC_Id}>{cc.CC_Code}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={otherCCLoading} />
                                        </div>
                                        {otherCCError && (
                                            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />{otherCCError}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* ── Sections 3 & 4 — shown only after CC selected ──────────── */}
                {selfCC && (
                    <>
                        {/* ── Section 3: Voucher Details ─────────────────────── */}
                        <SectionCard icon={FileText} title="Voucher Details" subtitle="Dates, account heads and payment information">

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label required>Voucher Date</Label>
                                    <CustomDatePicker value={voucherDate} onChange={setVoucherDate}
                                        placeholder="Select voucher date" format="DD/MM/YYYY" />
                                </div>
                                <div>
                                    <Label required>Paid Date</Label>
                                    <CustomDatePicker value={paidDate} onChange={setPaidDate}
                                        placeholder="Select paid date" format="DD/MM/YYYY" />
                                </div>
                            </div>

                            {/* Account Head / Sub Account Head */}
                            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label required>Account Head (DCA)</Label>
                                    <div className="relative">
                                        <select value={selectedDCA} onChange={(e) => handleDCAChange(e.target.value)}
                                            disabled={dcaLoading || isBusy} className={selectCls}>
                                            <option value="">{dcaLoading ? 'Loading...' : '— Select Account Head —'}</option>
                                            {dcaList.map((d) => (
                                                <option key={d.CashDCA_Id} value={d.CashDCA_Id}>{d.CashDCA_Code}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={dcaLoading} />
                                    </div>
                                    {dcaError && (
                                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />{dcaError}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label>Sub Account Head (SDCA)</Label>
                                    <div className="relative">
                                        <select value={selectedSDCA} onChange={(e) => setSelectedSDCA(e.target.value)}
                                            disabled={sdcaLoading || !selectedDCA || isBusy} className={selectCls}>
                                            <option value="">
                                                {sdcaLoading ? 'Loading...'
                                                    : sdcaList.length === 0 && selectedDCA ? 'No sub heads'
                                                    : '— Select Sub Account Head —'}
                                            </option>
                                            {sdcaList.map((s) => (
                                                <option key={s.CashSDCA_Id} value={s.CashSDCA_Id}>{s.CashSDCA_Code}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={sdcaLoading} />
                                    </div>
                                </div>
                            </div>

                            {/* Name & Remarks */}
                            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <Label required>Name</Label>
                                    <div className="relative">
                                        <input type="text" placeholder="Enter payee name"
                                            value={name} onChange={(e) => setName(e.target.value)}
                                            disabled={isBusy} className={inputCls} />
                                        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <Label>Remarks</Label>
                                    <div className="relative">
                                        <input type="text" placeholder="Optional remarks"
                                            value={remarks} onChange={(e) => setRemarks(e.target.value)}
                                            disabled={isBusy} className={inputCls} />
                                        <StickyNote className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── Section 4: Amount Details ───────────────────────── */}
                        <SectionCard icon={IndianRupee} title="Amount Details" subtitle="Invoice amount and totals">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">

                                {/* Invoice Amount */}
                                <div>
                                    <Label required>Invoice Amount (₹)</Label>
                                    <input type="number" min="0" step="0.01" placeholder="0.00"
                                        value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)}
                                        disabled={isBusy} className={inputCls} />
                                </div>

                                {/* GST breakdown (read-only summary) */}
                                {voucherType === 'GST' && (
                                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-sm space-y-1.5">
                                        <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide flex items-center gap-1.5">
                                            <BadgePercent className="h-3.5 w-3.5" />GST Breakdown
                                        </p>
                                        {gstType === 'CGST_SGST' ? (
                                            <>
                                                <div className="flex justify-between text-purple-800 dark:text-purple-300">
                                                    <span>CGST</span><span className="font-semibold">₹{fmt(cgstAmount)}</span>
                                                </div>
                                                <div className="flex justify-between text-purple-800 dark:text-purple-300">
                                                    <span>SGST</span><span className="font-semibold">₹{fmt(sgstAmount)}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex justify-between text-purple-800 dark:text-purple-300">
                                                <span>IGST</span><span className="font-semibold">₹{fmt(igstAmount)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Total Amount */}
                                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                                    <p className="text-xs font-bold text-indigo-200 uppercase tracking-wide">Total Amount</p>
                                    <p className="text-2xl font-black mt-1">₹{fmt(totalAmount)}</p>
                                    {voucherType === 'GST' && (
                                        <p className="text-xs text-indigo-200 mt-0.5">Invoice + GST</p>
                                    )}
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── Selection Summary ───────────────────────────────── */}
                        {(() => {
                            const selfCCLabel  = selfCCList.find(c => c.CC_Id === selfCC)?.CC_Code   || selfCC  || '—';
                            const otherCCLabel = otherCCList.find(c => c.CC_Id === otherCC)?.CC_Code || otherCC || '—';
                            const dcaLabel     = dcaList.find(d => d.CashDCA_Id === selectedDCA)?.CashDCA_Code   || selectedDCA  || '—';
                            const sdcaLabel    = sdcaList.find(s => s.CashSDCA_Id === selectedSDCA)?.CashSDCA_Code || selectedSDCA || '—';

                            const rows = [
                                { label: 'Voucher Type',    value: voucherType === 'GST' ? `GST Voucher (${gstType === 'CGST_SGST' ? 'CGST & SGST' : 'IGST'})` : 'Normal Voucher' },
                                { label: 'Transaction Mode', value: txnMode || '—' },
                                { label: 'Self Cost Center', value: selfCCLabel },
                                ...(txnMode === 'Debit from Other CC' ? [{ label: 'Other Cost Center', value: otherCCLabel }] : []),
                                { label: 'Cash Balance',    value: ccBalance ? `₹${fmt(ccBalance)}` : '—' },
                                { label: 'Voucher Date',    value: voucherDate ? new Date(voucherDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                                { label: 'Paid Date',       value: paidDate    ? new Date(paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                                { label: 'Account Head',    value: dcaLabel },
                                { label: 'Sub Account Head', value: sdcaLabel },
                                { label: 'Name',            value: name.trim()    || '—' },
                                { label: 'Remarks',         value: remarks.trim() || '—' },
                                ...(voucherType === 'GST' ? [{ label: 'GST Number', value: gstNumber || '—' }] : []),
                                { label: 'Invoice Amount',  value: invoiceAmount ? `₹${fmt(invoiceAmount)}` : '—' },
                                ...(voucherType === 'GST' && gstType === 'CGST_SGST' ? [
                                    { label: 'CGST Amount', value: cgstAmount ? `₹${fmt(cgstAmount)}` : '—' },
                                    { label: 'SGST Amount', value: sgstAmount ? `₹${fmt(sgstAmount)}` : '—' },
                                ] : []),
                                ...(voucherType === 'GST' && gstType === 'IGST' ? [
                                    { label: 'IGST Amount', value: igstAmount ? `₹${fmt(igstAmount)}` : '—' },
                                ] : []),
                                { label: 'Total Amount',    value: `₹${fmt(totalAmount)}`, highlight: true },
                            ];

                            return (
                                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/10 overflow-hidden">
                                    {/* Header */}
                                    <div className="px-5 py-3 bg-indigo-100/80 dark:bg-indigo-900/30 border-b border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-indigo-500" />
                                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Selection Summary</p>
                                        <span className="ml-auto text-xs text-indigo-500 dark:text-indigo-400">Review before submitting</span>
                                    </div>
                                    {/* Grid */}
                                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-3">
                                        {rows.map(({ label, value, highlight }) => (
                                            <div key={label} className={`min-w-0 ${highlight ? 'col-span-2 sm:col-span-1' : ''}`}>
                                                <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider truncate">{label}</p>
                                                <p className={`text-xs mt-0.5 font-semibold truncate ${
                                                    highlight
                                                        ? 'text-indigo-700 dark:text-indigo-300 text-sm font-black'
                                                        : value === '—'
                                                            ? 'text-gray-400 dark:text-gray-600'
                                                            : 'text-gray-800 dark:text-gray-200'
                                                }`} title={value}>{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ── Submit ──────────────────────────────────────────── */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isBusy}
                                className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {saveLoading
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                                    : <><Send className="h-4 w-4" /> Submit Voucher</>
                                }
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CashVoucherCreation;
