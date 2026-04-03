import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Wallet, Building2, CreditCard, Loader2,
    RotateCcw, Send, ChevronDown, IndianRupee,
    Hash, CheckCircle, Navigation,
    ShieldAlert, Plus, Trash2, Table2,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';
import { formatIndianCurrency, getAmountDisplay } from '../../utilities/amountToTextHelper';

import {
    checkSEPBudget,
    submitCCSEPPayment,
    clearBudgetResult,
    clearSaveResult,
    resetCCSepPayment,
    selectSEPBudgetResult,
    selectSEPBudgetLoading,
    selectSEPSaveStatus,
    selectSEPSaveLoading,
    selectSEPSaveError,
} from '../../slices/accountsSlice/ccSepPaymentSlice';

import {
    fetchAllCostCenters,
    selectCostCentersArray,
    selectCostCentersLoading,
} from '../../slices/HRSlice/staffJoinSlice';

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

const PAYMENT_FOR_OPTIONS = [
    { value: 'Salary',     label: 'Salary' },
    { value: 'Wages',      label: 'Wages' },
    { value: 'StaffPF',    label: 'Staff PF' },
    { value: 'LabourPF',   label: 'Labour PF' },
    { value: 'StaffESI',   label: 'Staff ESI' },
    { value: 'LabourESI',  label: 'Labour ESI' },
    { value: 'TDSonSalary',label: 'TDS on Salary' },
];

const CONTRIBUTION_TYPES = ['Employee', 'Employer'];
const MODE_OPTIONS        = ['Cheque', 'NEFT', 'RTGS', 'IMPS', 'UPI'];
const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
];

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PF_ESI_TYPES = ['StaffPF','LabourPF','StaffESI','LabourESI'];
const requiresContributionType = (payFor) => PF_ESI_TYPES.includes(payFor);

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

// ── Shared UI ─────────────────────────────────────────────────────────────────

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

const CCSalEsiPfPayment = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userName = userData?.userName || userData?.UserName || 'system';

    const currentYear  = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-indexed

    // ── Redux ──────────────────────────────────────────────────────────────────
    const costCenters   = useSelector(selectCostCentersArray);
    const ccLoading     = useSelector(selectCostCentersLoading);
    const bankList      = useSelector(selectBankDetailsArray);
    const bankLoading   = useSelector(selectBankDetailsLoading);
    const chequeList    = useSelector(selectChequeNumbersArray);
    const chequeLoading = useSelector(selectChequeNumbersLoading);
    const budgetResult  = useSelector(selectSEPBudgetResult);
    const budgetLoading = useSelector(selectSEPBudgetLoading);
    const saveStatus    = useSelector(selectSEPSaveStatus);
    const saveLoading   = useSelector(selectSEPSaveLoading);
    const saveError     = useSelector(selectSEPSaveError);

    // ── Step 1: Payment config ─────────────────────────────────────────────────
    const [paymentFor,  setPaymentFor]  = useState('');
    const [year,        setYear]        = useState(String(currentYear));
    const [month,       setMonth]       = useState(String(currentMonth));

    // ── Step 2: CC entry row ───────────────────────────────────────────────────
    const [entryCC,          setEntryCC]          = useState('');
    const [entryContribType, setEntryContribType] = useState('');
    const [entryAmount,      setEntryAmount]      = useState('');

    // ── Step 2: Table of CC entries ───────────────────────────────────────────
    const [ccEntries, setCcEntries] = useState([]);
    // each entry: { id, ccCode, ccName, contributionType, amount }

    // ── Step 3: Bank & payment ─────────────────────────────────────────────────
    const [selectedBank, setSelectedBank]  = useState(null);
    const [modeOfPay,    setModeOfPay]     = useState('');
    const [chequeId,     setChequeId]      = useState('');
    const [refNo,        setRefNo]         = useState('');
    const [payDate,      setPayDate]       = useState(null);
    const [remarks,      setRemarks]       = useState('');

    // ── Init ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchAllCostCenters());
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => {
            dispatch(resetCCSepPayment());
            dispatch(resetChequeNumbersData());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // ── Clear budget result when entry fields change ───────────────────────────
    useEffect(() => {
        dispatch(clearBudgetResult());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entryCC, entryContribType, entryAmount]);

    // ── Reset payment config downstream when paymentFor changes ───────────────
    useEffect(() => {
        setCcEntries([]);
        setEntryCC('');
        setEntryContribType('');
        setEntryAmount('');
        dispatch(clearBudgetResult());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentFor]);

    // ── Reset cheques when bank changes ───────────────────────────────────────
    useEffect(() => {
        if (!selectedBank) { dispatch(resetChequeNumbersData()); return; }
        setModeOfPay('');
        setChequeId('');
        setRefNo('');
        dispatch(fetchChequeNumbers(selectedBank.BankName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedBank]);

    // ── Reset ref fields when mode changes ────────────────────────────────────
    useEffect(() => {
        setChequeId('');
        setRefNo('');
    }, [modeOfPay]);

    // ── Save result effect ─────────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('SEP payment saved successfully!');
            dispatch(clearSaveResult());
            handleFullReset();
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError);
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus, saveError]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleFullReset = () => {
        setPaymentFor(''); setYear(String(currentYear)); setMonth(String(currentMonth));
        setEntryCC(''); setEntryContribType(''); setEntryAmount('');
        setCcEntries([]);
        setSelectedBank(null); setModeOfPay(''); setChequeId(''); setRefNo('');
        setPayDate(null); setRemarks('');
        dispatch(resetCCSepPayment());
        dispatch(resetChequeNumbersData());
    };

    const handleEntryAmountChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) setEntryAmount(val);
    };

    const handleAddEntry = async () => {
        if (!paymentFor)  { toast.warn('Select Payment For first.'); return; }
        if (!year || !month) { toast.warn('Select Year and Month.'); return; }
        if (!entryCC)     { toast.warn('Select a Cost Center.'); return; }
        if (requiresContributionType(paymentFor) && !entryContribType) {
            toast.warn('Select Contribution Type.'); return;
        }
        if (!entryAmount || parseFloat(entryAmount) <= 0) {
            toast.warn('Enter a valid amount.'); return;
        }
        const dupKey = requiresContributionType(paymentFor)
            ? `${entryCC}__${entryContribType}` : entryCC;
        const exists = ccEntries.some(e =>
            requiresContributionType(paymentFor)
                ? `${e.ccCode}__${e.contributionType}` === dupKey
                : e.ccCode === entryCC
        );
        if (exists) { toast.warn('This CC (+ contribution type) is already added.'); return; }

        try {
            const result = await dispatch(checkSEPBudget({
                CC:      entryCC,
                Paytype: paymentFor,
                Amount:  entryAmount,
                Year:    year,
                Month:   month,
                Paydate: '',
            })).unwrap();

            const isOk = (result?.Data || '') === 'Exist';
            if (!isOk) {
                toast.error(result?.Data || 'Insufficient budget for this CC.');
                return;
            }

            const cc = costCenters.find(c => c.CC_Code === entryCC);
            setCcEntries(prev => [
                ...prev,
                {
                    id:               Date.now(),
                    ccCode:           entryCC,
                    ccName:           cc ? `${cc.CC_Code} — ${cc.CC_Name}` : entryCC,
                    contributionType: entryContribType,
                    amount:           parseFloat(entryAmount),
                },
            ]);
            setEntryCC('');
            setEntryContribType('');
            setEntryAmount('');
            dispatch(clearBudgetResult());
            toast.success('Entry added to table.');
        } catch {
            toast.error('Budget check failed. Please try again.');
        }
    };

    const handleRemoveEntry = (id) => {
        setCcEntries(prev => prev.filter(e => e.id !== id));
    };

    const handleSubmit = () => {
        if (!paymentFor)        { toast.warn('Select Payment For.');        return; }
        if (!year || !month)    { toast.warn('Select Year and Month.');     return; }
        if (ccEntries.length === 0) { toast.warn('Add at least one CC entry.'); return; }
        if (!selectedBank)      { toast.warn('Select a bank account.');     return; }
        if (!modeOfPay)         { toast.warn('Select mode of payment.');    return; }
        if (modeOfPay === 'Cheque' && !chequeId) {
            toast.warn('Select a cheque number.'); return;
        }
        if (modeOfPay !== 'Cheque' && !refNo.trim()) {
            toast.warn('Enter the reference / transaction number.'); return;
        }
        if (!payDate)           { toast.warn('Select payment date.');       return; }
        if (!remarks.trim())    { toast.warn('Enter remarks.');             return; }

        const ccCodes     = ccEntries.map(e => e.ccCode).join(',');
        const ccAmounts   = ccEntries.map(e => e.amount).join(',');
        const contribs    = ccEntries.map(e => e.contributionType || '').join(',');
        const ccTotal     = ccEntries.reduce((s, e) => s + e.amount, 0);
        const transNo     = modeOfPay === 'Cheque'
            ? (chequeList.find(c => c.Cheque_Id === chequeId)?.Cheque_No || chequeId)
            : refNo;

        dispatch(submitCCSEPPayment({
            PaymentFor:        paymentFor,
            Month:             parseInt(month),
            Year:              year,
            CCCodes:           ccCodes,
            CCAmounts:         ccAmounts,
            BankID:            selectedBank.BankId,
            PaymentAmount:     String(ccTotal),
            ModeofPay:         modeOfPay,
            PaymentNo:         transNo,
            CCTotal:           ccTotal,
            BankTotal:         ccTotal,
            PaymentDate:       formatDateForAPI(payDate),
            Remarks:           remarks,
            RoleId:            roleId,
            Createdby:         userName,
            ContributionTypes: contribs,
        }));
    };

    // ── Derived ────────────────────────────────────────────────────────────────
    const ccTotal       = ccEntries.reduce((s, e) => s + e.amount, 0);
    const isBusy        = saveLoading || ccLoading || budgetLoading;
    const needsContrib  = requiresContributionType(paymentFor);
    const entryNumAmt   = parseFloat(entryAmount) || 0;

    const selectedCheqNo = chequeList.find(c => c.Cheque_Id === chequeId)?.Cheque_No || '—';
    const refDisplay     = modeOfPay === 'Cheque' ? selectedCheqNo : (refNo || '—');

    const showSummary = ccEntries.length > 0 && selectedBank && modeOfPay &&
        (modeOfPay === 'Cheque' ? !!chequeId : !!refNo) && payDate;

    const canSubmit = showSummary && !saveLoading && remarks.trim();

    const dateDisplay = payDate
        ? new Date(payDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }).replace(/ /g,'-')
        : '—';

    const yearOptions = [String(currentYear), String(currentYear - 1)];

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
                                <Wallet className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'CC SEP Payment'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Salary · ESI · PF — CC-wise bank payment</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / SEP</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Section 1: Payment Configuration ─────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <SectionHeader
                        icon={Wallet}
                        title="Payment Configuration"
                        subtitle="Choose payment type, year and month"
                        action={
                            <button
                                onClick={handleFullReset}
                                disabled={isBusy}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Reset All
                            </button>
                        }
                    />
                    <div className="p-6 md:p-8">
                        <InnerHeader icon={Wallet} title="Payment For / Period" subtitle="Changing Payment For will clear all CC entries" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Payment For */}
                            <div>
                                <Label required>Payment For</Label>
                                <div className="relative">
                                    <select
                                        className={`${inputCls} appearance-none pr-10`}
                                        value={paymentFor}
                                        onChange={(e) => setPaymentFor(e.target.value)}
                                        disabled={isBusy}
                                    >
                                        <option value="">— Select Type —</option>
                                        {PAYMENT_FOR_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={false} />
                                </div>
                            </div>

                            {/* Year */}
                            <div>
                                <Label required>Year</Label>
                                <div className="relative">
                                    <select
                                        className={`${inputCls} appearance-none pr-10`}
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        disabled={isBusy}
                                    >
                                        {yearOptions.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={false} />
                                </div>
                            </div>

                            {/* Month */}
                            <div>
                                <Label required>Month</Label>
                                <div className="relative">
                                    <select
                                        className={`${inputCls} appearance-none pr-10`}
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        disabled={isBusy}
                                    >
                                        {MONTHS.map((m, i) => (
                                            <option key={i + 1} value={i + 1}>{m}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={false} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: CC Entry & Table ───────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <SectionHeader
                        icon={Table2}
                        title="Cost Center Entries"
                        subtitle="Add CC-wise amounts (budget is verified before each addition)"
                    />
                    <div className="p-6 md:p-8">
                        <InnerHeader icon={Building2} title="Add CC Entry" subtitle="Budget will be checked before the entry is added to the table" />

                        {/* Entry form row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

                            {/* CC Code */}
                            <div>
                                <Label required>Cost Center</Label>
                                <div className="relative">
                                    <select
                                        className={`${inputCls} appearance-none pr-10`}
                                        value={entryCC}
                                        onChange={(e) => setEntryCC(e.target.value)}
                                        disabled={!paymentFor || ccLoading || isBusy}
                                    >
                                        <option value="">{!paymentFor ? 'Select payment type first' : ccLoading ? 'Loading…' : '— Select CC —'}</option>
                                        {costCenters.map(cc => (
                                            <option key={cc.CC_Code} value={cc.CC_Code}>
                                                {cc.CC_Code} — {cc.CC_Name}
                                            </option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={ccLoading} />
                                </div>
                            </div>

                            {/* Contribution Type (PF/ESI only) */}
                            {needsContrib ? (
                                <div>
                                    <Label required>Contribution Type</Label>
                                    <div className="relative">
                                        <select
                                            className={`${inputCls} appearance-none pr-10`}
                                            value={entryContribType}
                                            onChange={(e) => setEntryContribType(e.target.value)}
                                            disabled={!entryCC || isBusy}
                                        >
                                            <option value="">— Select —</option>
                                            {CONTRIBUTION_TYPES.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={false} />
                                    </div>
                                </div>
                            ) : (
                                <div /> /* spacer when not needed */
                            )}

                            {/* Amount */}
                            <div>
                                <Label required>Amount (₹)</Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={entryAmount}
                                        onChange={handleEntryAmountChange}
                                        disabled={!entryCC || isBusy}
                                        className={`${inputCls} pl-9`}
                                    />
                                </div>
                                {entryNumAmt > 0 && (
                                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-1 italic">
                                        {getAmountDisplay(entryNumAmt).words}
                                    </p>
                                )}
                            </div>

                            {/* Add to Table (checks budget internally) */}
                            <div className="flex flex-col justify-end">
                                <button
                                    onClick={handleAddEntry}
                                    disabled={isBusy || !entryCC || !entryAmount}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {budgetLoading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking…</>
                                        : <><Plus className="h-4 w-4" /> Add to Table</>
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Budget error badge (shown when last check failed) */}
                        {budgetResult && !budgetResult.isOk && (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium mb-4 border bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                                <ShieldAlert className="h-4 w-4 flex-shrink-0" /> {budgetResult.message}
                            </div>
                        )}

                        {/* CC Entries Table */}
                        {ccEntries.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Added Entries</p>
                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
                                                <th className="px-4 py-3 text-left text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">#</th>
                                                <th className="px-4 py-3 text-left text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">Cost Center</th>
                                                {needsContrib && (
                                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">Contribution</th>
                                                )}
                                                <th className="px-4 py-3 text-right text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">Amount (₹)</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ccEntries.map((entry, idx) => (
                                                <tr key={entry.id} className={`border-t border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/30'}`}>
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">{idx + 1}</td>
                                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100 font-medium">{entry.ccName}</td>
                                                    {needsContrib && (
                                                        <td className="px-4 py-3">
                                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                                                {entry.contributionType}
                                                            </span>
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                                                        {formatIndianCurrency(entry.amount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => handleRemoveEntry(entry.id)}
                                                            disabled={isBusy}
                                                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-40"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-indigo-200 dark:border-indigo-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
                                                <td colSpan={needsContrib ? 3 : 2} className="px-4 py-3 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                                                    Total ({ccEntries.length} {ccEntries.length === 1 ? 'entry' : 'entries'})
                                                </td>
                                                <td className="px-4 py-3 text-right text-base font-black text-indigo-700 dark:text-indigo-300">
                                                    ₹ {formatIndianCurrency(ccTotal)}
                                                </td>
                                                <td />
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                {ccTotal > 0 && (
                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1.5 italic text-right">
                                        {getAmountDisplay(ccTotal).words}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section 3: Bank & Payment Details ────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <SectionHeader
                        icon={CreditCard}
                        title="Bank & Payment Details"
                        subtitle="Select bank, mode, date and remarks"
                    />
                    <div className="p-6 md:p-8">
                        <InnerHeader icon={Building2} title="Bank Account" subtitle="Select the bank account for this payment" />

                        {/* Bank */}
                        <div className="mb-6">
                            <Label required>Bank Account</Label>
                            <div className="relative">
                                <select
                                    className={`${inputCls} appearance-none pr-10`}
                                    value={selectedBank?.BankId || ''}
                                    onChange={(e) => {
                                        const b = bankList.find(b => b.BankId === parseInt(e.target.value));
                                        setSelectedBank(b || null);
                                    }}
                                    disabled={bankLoading || isBusy}
                                >
                                    <option value="">{bankLoading ? 'Loading…' : '— Select Bank Account —'}</option>
                                    {bankList.map(b => (
                                        <option key={b.BankId} value={b.BankId}>
                                            {b.BankName} — {b.AccountNo}
                                        </option>
                                    ))}
                                </select>
                                <SelectIcon loading={bankLoading} />
                            </div>
                            {selectedBank && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                    <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Type</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{selectedBank.AccountType}</p>
                                    </div>
                                    <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Holder</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{selectedBank.AccountHolderName}</p>
                                    </div>
                                    <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Actual Balance</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">₹ {formatIndianCurrency(selectedBank.ActualBalance)}</p>
                                    </div>
                                    <div className="rounded-xl p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700">
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Available Balance</p>
                                        <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">₹ {formatIndianCurrency(selectedBank.AvailableBalance)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <InnerHeader icon={CreditCard} title="Mode & Reference" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Mode */}
                            <div>
                                <Label required>Mode of Payment</Label>
                                <div className="relative">
                                    <select
                                        className={`${inputCls} appearance-none pr-10`}
                                        value={modeOfPay}
                                        onChange={(e) => setModeOfPay(e.target.value)}
                                        disabled={!selectedBank || isBusy}
                                    >
                                        <option value="">{!selectedBank ? 'Select bank first' : '— Select Mode —'}</option>
                                        {MODE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <SelectIcon loading={false} />
                                </div>
                            </div>

                            {/* Cheque */}
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
                                            {chequeList.map(c => (
                                                <option key={c.Cheque_Id} value={c.Cheque_Id}>{c.Cheque_No}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={chequeLoading} />
                                    </div>
                                </div>
                            )}

                            {/* Reference */}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date */}
                            <div>
                                <Label required>Payment Date</Label>
                                <CustomDatePicker
                                    value={payDate}
                                    onChange={setPayDate}
                                    disabled={isBusy}
                                    maxDate={new Date()}
                                />
                            </div>

                            {/* Remarks */}
                            <div>
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
                    </div>
                </div>

                {/* ── Summary ───────────────────────────────────────────────── */}
                {showSummary && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <SectionHeader icon={CheckCircle} title="Payment Summary" subtitle="Review before submitting" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                                {[
                                    { label: 'Payment For', value: PAYMENT_FOR_OPTIONS.find(o=>o.value===paymentFor)?.label },
                                    { label: 'Period',      value: `${MONTHS[parseInt(month)-1]} ${year}` },
                                    { label: 'No. of CCs',  value: ccEntries.length },
                                    { label: 'Total Amount',value: `₹ ${formatIndianCurrency(ccTotal)}` },
                                    { label: 'Bank',        value: selectedBank?.BankName },
                                    { label: 'Mode',        value: modeOfPay },
                                    { label: modeOfPay==='Cheque'?'Cheque No':'Reference No', value: refDisplay },
                                    { label: 'Payment Date',value: dateDisplay },
                                    { label: 'Created By',  value: userName },
                                    { label: 'In Words',    value: getAmountDisplay(ccTotal).words, wide: true },
                                    { label: 'Remarks',     value: remarks || '—', wide: true },
                                ].map(({ label, value, wide }) => (
                                    <div key={label} className={`bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 ${wide ? 'md:col-span-3':''}`}>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 break-words">{value ?? '—'}</p>
                                    </div>
                                ))}
                            </div>

                            {/* CC breakdown in summary */}
                            <div className="overflow-x-auto rounded-xl border border-indigo-100 dark:border-indigo-800">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
                                            <th className="px-4 py-2 text-left text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">CC</th>
                                            {needsContrib && <th className="px-4 py-2 text-left text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">Contribution</th>}
                                            <th className="px-4 py-2 text-right text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ccEntries.map((e, i) => (
                                            <tr key={e.id} className={`border-t border-gray-100 dark:border-gray-700 ${i%2===0?'bg-white dark:bg-gray-800':'bg-gray-50/50 dark:bg-gray-700/30'}`}>
                                                <td className="px-4 py-2 text-gray-800 dark:text-gray-100">{e.ccName}</td>
                                                {needsContrib && <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{e.contributionType}</td>}
                                                <td className="px-4 py-2 text-right font-semibold text-gray-800 dark:text-gray-100">{formatIndianCurrency(e.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Action Buttons ────────────────────────────────────────── */}
                <div className="flex items-center justify-end gap-3 pb-6">
                    <button
                        onClick={handleFullReset}
                        disabled={isBusy}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50"
                    >
                        <RotateCcw className="h-4 w-4" /> Reset All
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {saveLoading
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                            : <><Send className="h-4 w-4" /> Submit Payment</>
                        }
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CCSalEsiPfPayment;
