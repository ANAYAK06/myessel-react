import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ChevronDown, Loader2, CheckCircle, RotateCcw, Send, FileText, Receipt,
    Navigation, Eye, CreditCard, Layers, Plus, Trash2, Wallet,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchClientReceiptInvTypes,
    fetchClientReceiptPaymentTypes,
    fetchInvServiceCCCodes, fetchInvServicePOs, fetchInvServiceInvoiceNos,
    fetchClientInvDetails, fetchClientInvTax,
    fetchDeductionCCOptions, fetchDedDCAOptions, fetchDedSubDCAOptions,
    submitInvoiceServiceReceipt,
    fetchRetClients, fetchRetSubClients, fetchRetCC, fetchRetPOs, fetchRetDetails,
    submitRetentionPayment,
    fetchHoldClients, fetchHoldSubClients, fetchHoldCC, fetchHoldPOs, fetchHoldDetails,
    submitHoldPayment,
    fetchAdvClients, fetchAdvSubClients, fetchAdvCC, fetchAdvPOs,
    submitAdvancePayment,
    clearCCCodes, clearClients, clearSubClients, clearPOList,
    clearInvoiceNos, clearInvoiceDetail, clearInvoiceTax, clearPODetail,
    clearDedCCOptions, clearDedRow, clearSaveResult, resetClientReceipt,
    selectCRInvTypes, selectCRInvTypesLoading,
    selectCRPaymentTypes,
    selectCRCCCodes, selectCRCCCodesLoading,
    selectCRClients, selectCRClientsLoading,
    selectCRSubClients, selectCRSubClientsLoading,
    selectCRPOList, selectCRPOListLoading,
    selectCRInvoiceNos, selectCRInvoiceNosLoading,
    selectCRInvoiceDetail, selectCRInvoiceDetailLoading,
    selectCRInvoiceTax,
    selectCRPODetail, selectCRPODetailLoading,
    selectCRDedCCOptions, selectCRDedCCOptionsLoading,
    selectCRDedDcaByRow, selectCRDedDcaLoading,
    selectCRDedSubDcaByRow, selectCRDedSubDcaLoading,
    selectCRSaveStatus, selectCRSaveLoading, selectCRSaveError,
} from '../../slices/accountsSlice/clientReceiptSlice';

import {
    fetchBankDetailsWithAvailableBalance,
    resetBankDetailsData,
    selectBankDetailsArray,
    selectBankDetailsLoading,
} from '../../slices/CommonSlice/bankDetailsSlice';

// ── Constants ──────────────────────────────────────────────────────────────────

const STEPS = ['Type & Selection', 'Details & Deduction', 'Review & Submit'];

const INVOICE_TYPES = [
    { id: 'invoice_service', label: 'Invoice Service' },
    { id: 'advance',         label: 'Advance' },
    { id: 'retention',       label: 'Retention' },
    { id: 'hold',            label: 'Hold' },
];

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

let dedRowCounter = 1;
const makeDedRow = (id, mainCC = '') => ({
    id, sameCC: true, cc: mainCC, dcaCode: '', dcaLabel: '', subDcaCode: '', subDcaLabel: '', amount: '', included: true,
});

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtDate = (val) => {
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

const fmt = (n) =>
    n || n === 0 ? `₹ ${parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹ 0.00';

// Defensive field lookup — exact backend field casing for a few of these endpoints
// (Client/SubClient/PO lists, PO-detail auto-fill) was not confirmed against a live
// response, so each getter tries several likely names before falling back.
const pick = (obj, ...keys) => {
    for (const k of keys) {
        if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
    }
    return '';
};

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed appearance-none';

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

const SectionCard = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        {children}
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

const ReviewRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        <span className={`text-xs font-semibold text-right max-w-[60%] ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-200'}`}>
            {value || <span className="text-gray-300 dark:text-gray-600">—</span>}
        </span>
    </div>
);

const YesNoToggle = ({ value, onChange, disabled }) => (
    <div className="flex gap-2">
        {['Yes', 'No'].map((opt) => {
            const active = (value === true && opt === 'Yes') || (value === false && opt === 'No');
            return (
                <button
                    key={opt}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(opt === 'Yes')}
                    className={`px-4 py-2 rounded-xl border-2 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                        ${active
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500 text-white shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 bg-white dark:bg-gray-800'}`}
                >
                    {opt}
                </button>
            );
        })}
    </div>
);

// ── Step Indicator ─────────────────────────────────────────────────────────────

const StepIndicator = ({ current }) => (
    <div className="flex items-center">
        {STEPS.map((label, i) => {
            const idx    = i + 1;
            const done   = idx < current;
            const active = idx === current;
            return (
                <React.Fragment key={idx}>
                    <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                            ${done   ? 'bg-white border-white text-indigo-600'
                            : active ? 'bg-white/20 border-white text-white'
                            :          'bg-white/10 border-white/30 text-white/50'}`}>
                            {done ? <CheckCircle className="h-4 w-4" /> : idx}
                        </div>
                        <span className={`mt-1 text-xs font-medium hidden sm:block ${active ? 'text-white' : done ? 'text-indigo-200' : 'text-white/40'}`}>
                            {label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-4 rounded ${done ? 'bg-white/60' : 'bg-white/20'}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ── Deduction Row ──────────────────────────────────────────────────────────────

const DeductionRow = ({ row, mainCC, mainCCLabel, ccOptions, ccLoading, onSameCCChange, onCCChange, onDcaChange, onSubDcaChange, onAmountChange, onIncludedChange, onRemove, canRemove }) => {
    const dcaOpts       = useSelector(selectCRDedDcaByRow(row.id));
    const dcaLoading    = useSelector(selectCRDedDcaLoading(row.id));
    const subDcaOpts    = useSelector(selectCRDedSubDcaByRow(row.id));
    const subDcaLoading = useSelector(selectCRDedSubDcaLoading(row.id));

    const effectiveCC = row.sameCC ? mainCC : row.cc;

    return (
        <tr className="border-t border-gray-100 dark:border-gray-700 align-top">
            <td className="px-3 py-3 text-center">
                <input
                    type="checkbox"
                    checked={row.included}
                    onChange={(e) => onIncludedChange(row.id, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
            </td>
            <td className="px-3 py-2 min-w-[210px]">
                <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={() => onSameCCChange(row.id, true)}
                            className={`flex-1 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all
                                ${row.sameCC
                                    ? 'bg-indigo-500 border-indigo-500 text-white'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300'}`}
                        >
                            Same CC
                        </button>
                        <button
                            type="button"
                            onClick={() => onSameCCChange(row.id, false)}
                            className={`flex-1 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all
                                ${!row.sameCC
                                    ? 'bg-indigo-500 border-indigo-500 text-white'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-300'}`}
                        >
                            Other CC
                        </button>
                    </div>
                    {row.sameCC ? (
                        <input type="text" className={`${inputCls} py-2 text-xs bg-gray-50 dark:bg-gray-900/30`} value={mainCCLabel} disabled />
                    ) : (
                        <div className="relative">
                            <select
                                className={`${inputCls} py-2 text-xs`}
                                value={row.cc}
                                onChange={(e) => onCCChange(row.id, e.target.value)}
                                disabled={ccLoading}
                            >
                                <option value="">— Select CC —</option>
                                {ccOptions.map((c, i) => (
                                    <option key={i} value={c.CC_Code}>{c.CC_Name}</option>
                                ))}
                            </select>
                            <SelectIcon loading={ccLoading} />
                        </div>
                    )}
                </div>
            </td>
            <td className="px-3 py-2 min-w-[200px]">
                <div className="relative">
                    <select
                        className={`${inputCls} py-2 text-xs`}
                        value={row.dcaCode}
                        onChange={(e) => onDcaChange(row.id, e.target.value, e.target.selectedOptions[0]?.text || '')}
                        disabled={!effectiveCC || dcaLoading}
                    >
                        <option value="">— Account Head —</option>
                        {dcaOpts.map((d) => (
                            <option key={d.DCAID} value={d.DCACode}>{d.DCAIDSTR}</option>
                        ))}
                    </select>
                    <SelectIcon loading={dcaLoading} />
                </div>
            </td>
            <td className="px-3 py-2 min-w-[200px]">
                <div className="relative">
                    <select
                        className={`${inputCls} py-2 text-xs`}
                        value={row.subDcaCode}
                        onChange={(e) => onSubDcaChange(row.id, e.target.value, e.target.selectedOptions[0]?.text || '')}
                        disabled={!row.dcaCode || subDcaLoading}
                    >
                        <option value="">— Sub Account Head —</option>
                        {subDcaOpts.map((d) => (
                            <option key={d.SubDCAID} value={d.SubDCACode}>{d.SubDCAIDSTR}</option>
                        ))}
                    </select>
                    <SelectIcon loading={subDcaLoading} />
                </div>
            </td>
            <td className="px-3 py-2 min-w-[130px]">
                <input
                    type="number" min="0" step="0.01"
                    className={`${inputCls} py-2 text-xs text-right`}
                    placeholder="0.00"
                    value={row.amount}
                    onChange={(e) => onAmountChange(row.id, e.target.value)}
                />
            </td>
            <td className="px-2 py-2 text-center">
                <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    disabled={!canRemove}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </td>
        </tr>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const ClientReceipt = ({ menuData }) => {
    const dispatch     = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userName = userData?.userName || userData?.UserName || 'system';

    // ── Redux ─────────────────────────────────────────────────────────────────
    const invTypes            = useSelector(selectCRInvTypes);
    const invTypesLoading     = useSelector(selectCRInvTypesLoading);
    const paymentTypes        = useSelector(selectCRPaymentTypes);
    const ccCodes             = useSelector(selectCRCCCodes);
    const ccCodesLoading      = useSelector(selectCRCCCodesLoading);
    const clients             = useSelector(selectCRClients);
    const clientsLoading      = useSelector(selectCRClientsLoading);
    const subClients          = useSelector(selectCRSubClients);
    const subClientsLoading   = useSelector(selectCRSubClientsLoading);
    const poList              = useSelector(selectCRPOList);
    const poListLoading       = useSelector(selectCRPOListLoading);
    const invoiceNos          = useSelector(selectCRInvoiceNos);
    const invoiceNosLoading   = useSelector(selectCRInvoiceNosLoading);
    const invoiceDetail       = useSelector(selectCRInvoiceDetail);
    const invoiceDetailLoading= useSelector(selectCRInvoiceDetailLoading);
    const invoiceTax          = useSelector(selectCRInvoiceTax);
    const poDetailRows        = useSelector(selectCRPODetail);
    const poDetailLoading     = useSelector(selectCRPODetailLoading);
    const dedCCOptions        = useSelector(selectCRDedCCOptions);
    const dedCCOptionsLoading = useSelector(selectCRDedCCOptionsLoading);
    const saveStatus          = useSelector(selectCRSaveStatus);
    const saveLoading         = useSelector(selectCRSaveLoading);
    const saveError           = useSelector(selectCRSaveError);

    const bankList    = useSelector(selectBankDetailsArray);
    const bankLoading = useSelector(selectBankDetailsLoading);

    // ── Local state ───────────────────────────────────────────────────────────
    const [step, setStep] = useState(1);

    const [invoiceType,    setInvoiceType]    = useState('');   // invoice_service | advance | retention | hold
    const [selectedSubType,setSelectedSubType]= useState('');   // Invoice Service sub-type (CCInvoiceTypeId)
    const [selectedCC,     setSelectedCC]     = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedSubClient, setSelectedSubClient] = useState('');
    const [selectedPO,     setSelectedPO]     = useState('');

    const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
    const [selectedInvoiceNoText, setSelectedInvoiceNoText] = useState('');

    const [selectedAdvRow, setSelectedAdvRow] = useState(null);        // for Advance, row picked client-side from poList

    // Retention/Hold: multiple invoices can be returned (esp. with CC/PO = "SelectAll") and
    // multiple can be paid in one receipt — keyed by ClientInvoiceNo, checked = included
    const [selectedInvoiceRows, setSelectedInvoiceRows] = useState({});

    // Advance: request date & basic value are not returned by the PO list, so they're entered manually
    const [advRequestDate, setAdvRequestDate] = useState(null);
    const [advBasicValue,  setAdvBasicValue]  = useState('');

    // Deduction
    const [dedYes,     setDedYes]     = useState(null);  // null | true | false
    const [dedRows,    setDedRows]    = useState([]);

    // Advance/Retention/Hold withholding (Invoice Service only)
    const [advanceAmt,   setAdvanceAmt]   = useState('');
    const [retentionAmt, setRetentionAmt] = useState('');
    const [holdAmt,       setHoldAmt]     = useState('');

    // Payment details (shared)
    const [selectedBank,    setSelectedBank]    = useState('');
    const [refNumber,       setRefNumber]       = useState('');
    const [transactionDate, setTransactionDate] = useState(null);
    const [remarks,         setRemarks]         = useState('');

    // ── On mount ──────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchBankDetailsWithAvailableBalance());
        dispatch(fetchClientReceiptPaymentTypes());
        return () => {
            dispatch(resetClientReceipt());
            dispatch(resetBankDetailsData());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // Default newly-fetched Retention/Hold invoices to checked (opt-out selection)
    useEffect(() => {
        if (poDetailRows.length === 0) return;
        setSelectedInvoiceRows((prev) => {
            const next = { ...prev };
            poDetailRows.forEach((row) => {
                const key = pick(row, 'ClientInvoiceNo');
                if (key && !(key in next)) next[key] = true;
            });
            return next;
        });
    }, [poDetailRows]);

    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Client receipt saved successfully!');
            handleReset();
        } else if (saveStatus === 'failed') {
            toast.error(saveError || 'Save failed. Please try again.');
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const isInvService = invoiceType === 'invoice_service';
    const isRetention  = invoiceType === 'retention';
    const isHold       = invoiceType === 'hold';
    const isAdvance    = invoiceType === 'advance';
    const isPOFlow      = isRetention || isHold || isAdvance;

    const poDetail = isAdvance ? selectedAdvRow : null; // Retention/Hold use multi-invoice selection below instead

    // Retention/Hold: invoices checked in the Step-2 selection table
    const selectedInvoiceDetailRows = (isRetention || isHold)
        ? poDetailRows.filter((row) => selectedInvoiceRows[pick(row, 'ClientInvoiceNo')])
        : [];

    const detailRA = isInvService
        ? pick(invoiceDetail, 'RANO', 'RA')
        : pick(poDetail, 'RANO', 'RA'); // Advance only — Retention/Hold show RA per-row in the table

    const detailDate = isInvService
        ? pick(invoiceDetail, 'InvoiceDate')
        : isAdvance
            ? advRequestDate
            : ''; // Retention/Hold show dates per-row in the table

    const baseAmount = isInvService
        ? parseFloat(pick(invoiceDetail, 'Total') || pick(invoiceDetail, 'BasicValue') || 0)
        : isAdvance
            ? (parseFloat(advBasicValue) || 0)
            : selectedInvoiceDetailRows.reduce((sum, row) =>
                sum + (parseFloat(pick(row, isRetention ? 'RetentionBalance' : 'HoldBalance', 'Amount', 'Total')) || 0), 0);

    const includedDedRows = useMemo(
        () => (dedYes ? dedRows.filter(r => r.included && r.cc && r.dcaCode && r.subDcaCode && parseFloat(r.amount) > 0) : []),
        [dedYes, dedRows]
    );
    const dedTotal = includedDedRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

    // Label shown for "Same CC" deduction rows
    const selectedCCName = pick(ccCodes.find((c) => pick(c, 'CC_Code', 'CCCode') === selectedCC), 'CC_Name', 'CCName') || selectedCC;

    const finalAmount = isInvService
        ? baseAmount - dedTotal - (parseFloat(advanceAmt) || 0) - (parseFloat(retentionAmt) || 0) - (parseFloat(holdAmt) || 0)
        : baseAmount - dedTotal;

    // ── Reset helpers ─────────────────────────────────────────────────────────

    const clearDownstreamOfCC = useCallback(() => {
        setSelectedPO('');
        setSelectedInvoiceId('');
        setSelectedInvoiceNoText('');
        setSelectedInvoiceRows({});
        setSelectedAdvRow(null);
        setAdvRequestDate(null);
        setAdvBasicValue('');
        dispatch(clearPOList());
        dispatch(clearInvoiceNos());
        dispatch(clearInvoiceDetail());
        dispatch(clearInvoiceTax());
        dispatch(clearPODetail());
    }, [dispatch]);

    // ── Handlers — Type & Selection cascade ───────────────────────────────────

    const handleInvoiceTypeChange = useCallback((type) => {
        setInvoiceType(type);
        setSelectedSubType('');
        setSelectedCC('');
        setSelectedClient('');
        setSelectedSubClient('');
        setSelectedPO('');
        setSelectedInvoiceId('');
        setSelectedInvoiceNoText('');
        setSelectedInvoiceRows({});
        setSelectedAdvRow(null);
        setDedYes(null);
        setDedRows([]);
        dispatch(clearCCCodes());
        dispatch(clearClients());
        dispatch(clearSubClients());
        dispatch(clearPOList());
        dispatch(clearInvoiceNos());
        dispatch(clearInvoiceDetail());
        dispatch(clearInvoiceTax());
        dispatch(clearPODetail());
        dispatch(clearDedCCOptions());

        if (type === 'invoice_service') dispatch(fetchClientReceiptInvTypes());
        else if (type === 'retention')  dispatch(fetchRetClients());
        else if (type === 'hold')       dispatch(fetchHoldClients());
        else if (type === 'advance')    dispatch(fetchAdvClients());
    }, [dispatch]);

    const handleSubTypeChange = useCallback((subTypeId) => {
        setSelectedSubType(subTypeId);
        setSelectedCC('');
        clearDownstreamOfCC();
        dispatch(clearCCCodes());
        if (subTypeId) {
            const subTypeDesc = invTypes.find((t) => String(t.CCInvoiceTypeId) === String(subTypeId))?.CCInvoiceTypeDescription;
            if (subTypeDesc) dispatch(fetchInvServiceCCCodes({ SubType: subTypeDesc }));
        }
    }, [dispatch, clearDownstreamOfCC, invTypes]);

    const handleClientChange = useCallback((clientCode) => {
        setSelectedClient(clientCode);
        setSelectedSubClient('');
        setSelectedCC('');
        clearDownstreamOfCC();
        dispatch(clearSubClients());
        dispatch(clearCCCodes());

        if (!clientCode) return;
        if (isRetention) dispatch(fetchRetSubClients({ clientcode: clientCode }));
        if (isHold)      dispatch(fetchHoldSubClients({ clientcode: clientCode }));
        if (isAdvance)   dispatch(fetchAdvSubClients({ ClientCode: clientCode }));
    }, [dispatch, isRetention, isHold, isAdvance, clearDownstreamOfCC]);

    const handleSubClientChange = useCallback((subCode) => {
        setSelectedSubClient(subCode);
        setSelectedCC('');
        clearDownstreamOfCC();
        dispatch(clearCCCodes());

        if (!subCode) return;
        if (isRetention) dispatch(fetchRetCC({ ClientCode: selectedClient, SClientcode: subCode }));
        if (isHold)      dispatch(fetchHoldCC({ ClientCode: selectedClient, SClientcode: subCode }));
        if (isAdvance)   dispatch(fetchAdvCC({ SubClientCode: subCode }));
    }, [dispatch, isRetention, isHold, isAdvance, selectedClient, clearDownstreamOfCC]);

    const handleCCChange = useCallback((ccCode) => {
        setSelectedCC(ccCode);
        clearDownstreamOfCC();

        if (!ccCode) return;
        if (isInvService) dispatch(fetchInvServicePOs({ CCCode: ccCode }));
        if (isRetention)  dispatch(fetchRetPOs({ ClientCode: selectedClient, SClientcode: selectedSubClient, CCCode: ccCode }));
        if (isHold)       dispatch(fetchHoldPOs({ ClientCode: selectedClient, SClientcode: selectedSubClient, CCCode: ccCode }));
        if (isAdvance)    dispatch(fetchAdvPOs({ ClientCode: selectedClient, SubClientCode: selectedSubClient, CCcode: ccCode }));
    }, [dispatch, isInvService, isRetention, isHold, isAdvance, selectedClient, selectedSubClient, clearDownstreamOfCC]);

    const handlePOChange = useCallback((po) => {
        setSelectedPO(po);
        setSelectedInvoiceId('');
        setSelectedInvoiceNoText('');
        setSelectedInvoiceRows({});
        setSelectedAdvRow(null);
        setAdvRequestDate(null);
        setAdvBasicValue('');
        dispatch(clearInvoiceNos());
        dispatch(clearInvoiceDetail());
        dispatch(clearInvoiceTax());
        dispatch(clearPODetail());

        if (!po) return;
        if (isInvService) {
            dispatch(fetchInvServiceInvoiceNos({ CCCode: selectedCC, PONo: po }));
        } else if (isRetention) {
            dispatch(fetchRetDetails({ ClientCode: selectedClient, SClientcode: selectedSubClient, CCCode: selectedCC, PO: po }));
        } else if (isHold) {
            dispatch(fetchHoldDetails({ ClientCode: selectedClient, SClientcode: selectedSubClient, CCCode: selectedCC, PO: po }));
        } else if (isAdvance) {
            const row = poList.find((r) => pick(r, 'PONumber', 'PO') === po) || null;
            setSelectedAdvRow(row);
        }
    }, [dispatch, isInvService, isRetention, isHold, isAdvance, selectedCC, selectedClient, selectedSubClient, poList]);

    const handleInvoiceNoChange = useCallback((invId) => {
        setSelectedInvoiceId(invId);
        const match = invoiceNos.find((i) => String(i.ClientInvoiceId) === String(invId));
        setSelectedInvoiceNoText(match?.ClientInvoiceNo || '');
        dispatch(clearInvoiceDetail());
        dispatch(clearInvoiceTax());
        if (!invId) return;
        dispatch(fetchClientInvDetails({ InvId: invId }));
        dispatch(fetchClientInvTax({ InvId: invId }));
    }, [dispatch, invoiceNos]);

    // ── Deduction handlers ────────────────────────────────────────────────────

    const handleDedYesChange = (val) => {
        setDedYes(val);
        dispatch(clearDedCCOptions());
        if (val) {
            dispatch(fetchDeductionCCOptions({ CCCode: selectedCC }));
            const id = dedRowCounter++;
            setDedRows([makeDedRow(id, selectedCC)]);
            if (selectedCC) dispatch(fetchDedDCAOptions({ rowId: id, CcCode: selectedCC }));
        } else {
            setDedRows([]);
        }
    };

    const addDedRow = () => {
        const id = dedRowCounter++;
        setDedRows((prev) => [...prev, makeDedRow(id, selectedCC)]);
        if (selectedCC) {
            dispatch(fetchDedDCAOptions({ rowId: id, CcCode: selectedCC }));
        }
    };

    const removeDedRow = (id) => {
        setDedRows((prev) => prev.filter((r) => r.id !== id));
        dispatch(clearDedRow(id));
    };

    const handleDedRowSameCCChange = (rowId, sameCC) => {
        setDedRows((prev) => prev.map((r) => r.id === rowId
            ? { ...r, sameCC, cc: sameCC ? selectedCC : '', dcaCode: '', dcaLabel: '', subDcaCode: '', subDcaLabel: '' }
            : r));
        dispatch(clearDedRow(rowId));
        if (sameCC && selectedCC) dispatch(fetchDedDCAOptions({ rowId, CcCode: selectedCC }));
    };

    const handleDedRowCCChange = (rowId, cc) => {
        setDedRows((prev) => prev.map((r) => r.id === rowId ? { ...r, cc, dcaCode: '', dcaLabel: '', subDcaCode: '', subDcaLabel: '' } : r));
        dispatch(clearDedRow(rowId));
        if (cc) dispatch(fetchDedDCAOptions({ rowId, CcCode: cc }));
    };

    const handleDedRowDcaChange = (rowId, dcaCode, dcaLabel) => {
        setDedRows((prev) => prev.map((r) => r.id === rowId ? { ...r, dcaCode, dcaLabel, subDcaCode: '', subDcaLabel: '' } : r));
        if (dcaCode) dispatch(fetchDedSubDCAOptions({ rowId, DCACode: dcaCode }));
    };

    const handleDedRowSubDcaChange = (rowId, subDcaCode, subDcaLabel) => {
        setDedRows((prev) => prev.map((r) => r.id === rowId ? { ...r, subDcaCode, subDcaLabel } : r));
    };

    const handleDedRowAmountChange = (rowId, amount) => {
        setDedRows((prev) => prev.map((r) => r.id === rowId ? { ...r, amount } : r));
    };

    const handleDedRowIncludedChange = (rowId, included) => {
        setDedRows((prev) => prev.map((r) => r.id === rowId ? { ...r, included } : r));
    };

    // ── Validation ────────────────────────────────────────────────────────────

    const validateStep1 = useCallback(() => {
        if (!invoiceType) { toast.warn('Please select an invoice type.'); return false; }
        if (isInvService) {
            if (!selectedSubType) { toast.warn('Please select an invoice sub-type.'); return false; }
            if (!selectedCC)      { toast.warn('Please select a CC code.');          return false; }
            if (!selectedPO)      { toast.warn('Please select a PO.');               return false; }
            if (!selectedInvoiceId) { toast.warn('Please select an invoice number.'); return false; }
        } else {
            if (!selectedClient)    { toast.warn('Please select a client.');     return false; }
            if (!selectedSubClient) { toast.warn('Please select a sub-client.'); return false; }
            if (!selectedCC)        { toast.warn('Please select a CC code.');    return false; }
            if (!selectedPO)        { toast.warn('Please select a PO.');         return false; }
        }
        return true;
    }, [invoiceType, isInvService, selectedSubType, selectedCC, selectedPO, selectedInvoiceId, selectedClient, selectedSubClient]);

    const validateStep2 = useCallback(() => {
        if (isAdvance) {
            if (!advRequestDate)                { toast.warn('Please select the advance request date.'); return false; }
            if (!advBasicValue || parseFloat(advBasicValue) <= 0) { toast.warn('Please enter the advance amount.'); return false; }
        }
        if (isRetention || isHold) {
            if (selectedInvoiceDetailRows.length === 0) { toast.warn('Select at least one invoice to receive.'); return false; }
        }
        if ((isInvService || isAdvance) && dedYes === null) { toast.warn('Please specify whether there is a deduction.'); return false; }
        if (dedYes && includedDedRows.length === 0) { toast.warn('Add at least one valid deduction row.'); return false; }
        if (!selectedBank)       { toast.warn('Please select a bank.');            return false; }
        if (!refNumber.trim())   { toast.warn('Please enter reference number.');   return false; }
        if (!transactionDate)    { toast.warn('Please select transaction date.');  return false; }
        if (!remarks.trim())     { toast.warn('Please enter remarks.');            return false; }
        if (finalAmount < 0)     { toast.warn('Deductions exceed the available amount.'); return false; }
        return true;
    }, [isAdvance, isRetention, isHold, isInvService, advRequestDate, advBasicValue, selectedInvoiceDetailRows, dedYes, includedDedRows, selectedBank, refNumber, transactionDate, remarks, finalAmount]);

    const goNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep((s) => s + 1);
    };

    const goBack = () => setStep((s) => s - 1);

    // ── Submit ────────────────────────────────────────────────────────────────

    // All 4 save procedures parse their comma-lists (deductions, and for
    // Retention/Hold also InvoiceNos/Invdates) with `WHILE (charindex(',',@Str) <> 0)`,
    // which drops the last entry unless the string ends with a trailing comma —
    // so one must always be appended (only when rows exist; an empty string must stay empty).
    const joinWithTrailingComma = (arr) => (arr.length ? `${arr.join(',')},` : '');

    const buildDeductionArrays = () => ({
        DedCcs:     joinWithTrailingComma(includedDedRows.map((r) => r.cc)),
        DedDcas:    joinWithTrailingComma(includedDedRows.map((r) => r.dcaCode)),
        DedSubdcas: joinWithTrailingComma(includedDedRows.map((r) => r.subDcaCode)),
        DedAmounts: joinWithTrailingComma(includedDedRows.map((r) => r.amount)),
    });

    // BankTransactions.TypeOfTransactionId per flow — from GetPaymentTypes, matched by description
    // (NOT the CCInvoiceTypeId sub-type selected in Step 1, which is a different ID space)
    const getPaymentTypeId = (description) =>
        paymentTypes.find((p) => p.PaymentTypeDescription?.toLowerCase() === description.toLowerCase())?.PaymentTypeID || 0;

    const handleSubmit = () => {
        const ded = buildDeductionArrays();
        const common = {
            BankId:          parseInt(selectedBank, 10) || 0,
            TransactionDate: fmtDate(transactionDate),
            Number:          refNumber,
            Remarks:         remarks,
            Roleid:          parseInt(roleId, 10),
            Createdby:       userName,
            Action:          'New',
        };

        if (isInvService) {
            dispatch(submitInvoiceServiceReceipt({
                DedDcas: ded.DedDcas, DedSubdcas: ded.DedSubdcas, DedCcs: ded.DedCcs, DedAmounts: ded.DedAmounts,
                Advance:   parseFloat(advanceAmt)   || 0,
                Rentention: parseFloat(retentionAmt) || 0,
                Hold:      parseFloat(holdAmt)       || 0,
                Amount:    finalAmount,
                InvoiceNo: selectedInvoiceNoText,
                CCCode:    selectedCC,
                PaytypeId: getPaymentTypeId('Invoice Service'),
                InvoiceDate: fmtDate(pick(invoiceDetail, 'InvoiceDate')),
                ...common,
            }));
        } else if (isRetention) {
            dispatch(submitRetentionPayment({
                InvoiceNos:    joinWithTrailingComma(selectedInvoiceDetailRows.map((r) => pick(r, 'ClientInvoiceNo'))),
                InvoiceDates:  joinWithTrailingComma(selectedInvoiceDetailRows.map((r) => fmtDate(pick(r, 'InvoiceDate')))),
                PaymentAmount: finalAmount,
                ModeOfPay:     'RTGS/E-transfer',
                BankID:        parseInt(selectedBank, 10) || 0,
                PaymentDate:   fmtDate(transactionDate),
                No:            refNumber,
                Remarks:       remarks,
                Roleid:        parseInt(roleId, 10),
                Createdby:     userName,
                Action:        'New',
            }));
        } else if (isHold) {
            dispatch(submitHoldPayment({
                InvoiceNos:    joinWithTrailingComma(selectedInvoiceDetailRows.map((r) => pick(r, 'ClientInvoiceNo'))),
                InvoiceDates:  joinWithTrailingComma(selectedInvoiceDetailRows.map((r) => fmtDate(pick(r, 'InvoiceDate')))),
                PaymentAmount: finalAmount,
                ModeOfPay:     'RTGS/E-transfer',
                BankID:        parseInt(selectedBank, 10) || 0,
                PaymentDate:   fmtDate(transactionDate),
                No:            refNumber,
                Remarks:       remarks,
                Roleid:        parseInt(roleId, 10),
                Createdby:     userName,
                Action:        'New',
            }));
        } else if (isAdvance) {
            dispatch(submitAdvancePayment({
                Client: selectedClient, SubClient: selectedSubClient, CCCode: selectedCC, PONo: selectedPO,
                RANo: detailRA, Amount: finalAmount, InvTotalValue: finalAmount,
                RequestDate: fmtDate(advRequestDate), BasicValue: parseFloat(advBasicValue) || 0,
                PaytypeId: getPaymentTypeId('Advance'),
                DedDcas: ded.DedDcas, DedSubdcas: ded.DedSubdcas, DedCcs: ded.DedCcs, DedAmounts: ded.DedAmounts,
                ...common,
            }));
        }
    };

    const handleReset = () => {
        setStep(1);
        setInvoiceType('');
        setSelectedSubType('');
        setSelectedCC('');
        setSelectedClient('');
        setSelectedSubClient('');
        setSelectedPO('');
        setSelectedInvoiceId('');
        setSelectedInvoiceNoText('');
        setSelectedInvoiceRows({});
        setSelectedAdvRow(null);
        setAdvRequestDate(null);
        setAdvBasicValue('');
        setDedYes(null);
        setDedRows([]);
        setAdvanceAmt('');
        setRetentionAmt('');
        setHoldAmt('');
        setSelectedBank('');
        setRefNumber('');
        setTransactionDate(null);
        setRemarks('');
        dispatch(resetClientReceipt());
        dispatch(fetchBankDetailsWithAvailableBalance());
        dispatch(fetchClientReceiptPaymentTypes());
    };

    // ── Derived labels ────────────────────────────────────────────────────────
    const selectedClientName    = pick(clients.find((c) => pick(c, 'ClientCode', 'Clientcode') === selectedClient), 'ClientName', 'Clientname') || selectedClient;
    const selectedSubClientName = pick(subClients.find((sc) => pick(sc, 'SubClientCode', 'SubClientcode') === selectedSubClient), 'SubClientCodename', 'SubClientName') || selectedSubClient;
    const selectedBankObj       = bankList.find((b) => String(b.BankId) === String(selectedBank));

    const invoiceTypeLabel = INVOICE_TYPES.find((t) => t.id === invoiceType)?.label || '';
    const subTypeLabel     = invTypes.find((t) => String(t.CCInvoiceTypeId) === String(selectedSubType))?.CCInvoiceTypeDescription || '';

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />

                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <Receipt className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Client Receipt'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Record client receipts against invoices, advance, retention and hold</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-all"
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                            <div className="hidden sm:flex items-center gap-2 text-indigo-200">
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wider">Module</p>
                                    <p className="text-sm font-bold text-white">Accounts / Receipt</p>
                                </div>
                                <Navigation className="h-5 w-5 opacity-60" />
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <StepIndicator current={step} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ══════════════════════════════════════════════════════════ */}
                {/* STEP 1 — Type & Selection                                 */}
                {/* ══════════════════════════════════════════════════════════ */}
                {step === 1 && (
                    <SectionCard>
                        <SectionHeader icon={FileText} title="Type & Selection" subtitle="Select the invoice type and filter criteria" />
                        <div className="p-6">
                            <InnerHeader icon={Receipt} title="Invoice Type" subtitle="Choose what this receipt is against" />

                            <div className="flex flex-wrap gap-3 mb-7">
                                {INVOICE_TYPES.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => handleInvoiceTypeChange(t.id)}
                                        className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                                            ${invoiceType === t.id
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-800'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* ── Invoice Service filters ── */}
                            {isInvService && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <Label required>Invoice Type</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedSubType} onChange={(e) => handleSubTypeChange(e.target.value)} disabled={invTypesLoading}>
                                                <option value="">— Select Invoice Type —</option>
                                                {invTypes.map((t) => (
                                                    <option key={t.CCInvoiceTypeId} value={t.CCInvoiceTypeId}>{t.CCInvoiceTypeDescription}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={invTypesLoading} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label required>CC Code</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedCC} onChange={(e) => handleCCChange(e.target.value)} disabled={!selectedSubType || ccCodesLoading}>
                                                <option value="">— Select CC Code —</option>
                                                {ccCodes.map((c, i) => (
                                                    <option key={i} value={c.CC_Code}>{c.CC_Name}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={ccCodesLoading} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label required>PO Number</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedPO} onChange={(e) => handlePOChange(e.target.value)} disabled={!selectedCC || poListLoading}>
                                                <option value="">— Select PO —</option>
                                                {poList.map((p) => (
                                                    <option key={p.ClientPOId} value={p.PONumber}>{p.PONumber}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={poListLoading} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label required>Invoice Number</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedInvoiceId} onChange={(e) => handleInvoiceNoChange(e.target.value)} disabled={!selectedPO || invoiceNosLoading}>
                                                <option value="">— Select Invoice —</option>
                                                {invoiceNos.map((inv) => (
                                                    <option key={inv.ClientInvoiceId} value={inv.ClientInvoiceId}>{inv.ClientInvoiceNo}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={invoiceNosLoading} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Advance / Retention / Hold filters ── */}
                            {isPOFlow && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <Label required>Client</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedClient} onChange={(e) => handleClientChange(e.target.value)} disabled={clientsLoading}>
                                                <option value="">— Select Client —</option>
                                                {clients.map((c, i) => (
                                                    <option key={i} value={pick(c, 'ClientCode', 'Clientcode')}>{pick(c, 'ClientName', 'Clientname') || pick(c, 'ClientCode', 'Clientcode')}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={clientsLoading} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label required>Sub-Client</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedSubClient} onChange={(e) => handleSubClientChange(e.target.value)} disabled={!selectedClient || subClientsLoading}>
                                                <option value="">— Select Sub-Client —</option>
                                                {subClients.map((s, i) => (
                                                    <option key={i} value={pick(s, 'SubClientCode', 'SubClientcode')}>{pick(s, 'SubClientCodename', 'SubClientName') || pick(s, 'SubClientCode', 'SubClientcode')}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={subClientsLoading} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label required>CC Code</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedCC} onChange={(e) => handleCCChange(e.target.value)} disabled={!selectedSubClient || ccCodesLoading}>
                                                <option value="">— Select CC Code —</option>
                                                {(isRetention || isHold) && <option value="SelectAll">— All Cost Centers —</option>}
                                                {ccCodes.map((c, i) => (
                                                    <option key={i} value={pick(c, 'CC_Code', 'CCCode')}>{pick(c, 'CC_Name', 'CCName') || pick(c, 'CC_Code', 'CCCode')}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={ccCodesLoading} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label required>Purchase Order Number</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedPO} onChange={(e) => handlePOChange(e.target.value)} disabled={!selectedCC || poListLoading}>
                                                <option value="">— Select PO —</option>
                                                {(isRetention || isHold) && <option value="SelectAll">— All POs —</option>}
                                                {poList.map((p, i) => (
                                                    <option key={i} value={pick(p, 'PONumber', 'PO')}>{pick(p, 'PONumber', 'PO')}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={poListLoading} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </SectionCard>
                )}

                {/* ══════════════════════════════════════════════════════════ */}
                {/* STEP 2 — Details & Deduction                              */}
                {/* ══════════════════════════════════════════════════════════ */}
                {step === 2 && (
                    <>
                        {/* ── Auto-filled details ── */}
                        <SectionCard>
                            <SectionHeader icon={Receipt} title={isInvService ? 'Invoice Details' : 'Advance / Retention / Hold Details'} subtitle="Auto-filled from selection" />
                            <div className="p-6">
                                {(invoiceDetailLoading || poDetailLoading) ? (
                                    <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Loading details…
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <ReviewRow label="Invoice Type" value={invoiceTypeLabel} />
                                        {isInvService && <ReviewRow label="Sub-Type" value={subTypeLabel} />}
                                        {isInvService && (
                                            <>
                                                <ReviewRow label="Client Code" value={pick(invoiceDetail, 'ClientCode', 'Clientcode')} />
                                                <ReviewRow label="Sub-Client Code" value={pick(invoiceDetail, 'SubClientCode', 'SubClientcode')} />
                                            </>
                                        )}
                                        {isInvService
                                            ? <ReviewRow label="Invoice No" value={selectedInvoiceNoText} />
                                            : <ReviewRow label="PO Number" value={selectedPO} />}
                                        {(isInvService || isAdvance) && <ReviewRow label="RA" value={detailRA} />}
                                        {isAdvance ? (
                                            <div>
                                                <Label required>Advance Request Date</Label>
                                                <CustomDatePicker value={advRequestDate} onChange={setAdvRequestDate} placeholder="Select request date" />
                                            </div>
                                        ) : isInvService ? (
                                            <ReviewRow label="Invoice Date" value={fmtDate(detailDate)} />
                                        ) : null}
                                        {isAdvance ? (
                                            <div>
                                                <Label required>Advance Amount</Label>
                                                <input
                                                    type="number" min="0" step="0.01"
                                                    className={inputCls}
                                                    placeholder="0.00"
                                                    value={advBasicValue}
                                                    onChange={(e) => setAdvBasicValue(e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            <ReviewRow label={(isRetention || isHold) ? 'Total Selected Amount' : 'Amount'} value={fmt(baseAmount)} highlight />
                                        )}
                                    </div>
                                )}

                                {(isRetention || isHold) && (
                                    <div className="mt-6">
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            Select Invoices to Receive
                                        </p>
                                        {poDetailRows.length === 0 ? (
                                            <p className="text-xs text-gray-400">No invoices found for this selection.</p>
                                        ) : (
                                            <>
                                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                                <th className="px-3 py-2 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Incl.</th>
                                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Invoice No</th>
                                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">RA</th>
                                                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                                                <th className="px-3 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                                                    {isRetention ? 'Retention Balance' : 'Hold Balance'}
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {poDetailRows.map((row, i) => {
                                                                const invNo = pick(row, 'ClientInvoiceNo');
                                                                const amt = pick(row, isRetention ? 'RetentionBalance' : 'HoldBalance', 'Amount', 'Total');
                                                                return (
                                                                    <tr key={invNo || i} className="border-t border-gray-100 dark:border-gray-700">
                                                                        <td className="px-3 py-2 text-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!selectedInvoiceRows[invNo]}
                                                                                onChange={(e) => setSelectedInvoiceRows((prev) => ({ ...prev, [invNo]: e.target.checked }))}
                                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                            />
                                                                        </td>
                                                                        <td className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200">{invNo}</td>
                                                                        <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300">{pick(row, 'RANO', 'RA')}</td>
                                                                        <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300">{fmtDate(pick(row, 'InvoiceDate'))}</td>
                                                                        <td className="px-3 py-2 text-xs text-right font-semibold text-gray-800 dark:text-gray-100">{fmt(amt)}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {selectedInvoiceDetailRows.length > 0 && (
                                                    <div className="mt-3 flex justify-end">
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500">
                                                                Total Selected ({selectedInvoiceDetailRows.length} invoice{selectedInvoiceDetailRows.length > 1 ? 's' : ''})
                                                            </p>
                                                            <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">{fmt(baseAmount)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {isInvService && invoiceTax.length > 0 && (
                                    <div className="mt-6">
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tax Breakup</p>
                                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                        <th className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                                                        <th className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400 uppercase">DCA</th>
                                                        <th className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400 uppercase">Sub DCA</th>
                                                        <th className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400 uppercase">Tax No</th>
                                                        <th className="px-3 py-2 text-right font-bold text-gray-500 dark:text-gray-400 uppercase">Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {invoiceTax.map((t, i) => (
                                                        <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                                                            <td className="px-3 py-2">{t.TypesOfTaxName}</td>
                                                            <td className="px-3 py-2">{t.DCACode}</td>
                                                            <td className="px-3 py-2">{t.SubDCACode}</td>
                                                            <td className="px-3 py-2">{t.TaxNo}</td>
                                                            <td className="px-3 py-2 text-right">{fmt(t.TaxValue)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* ── Deduction (Invoice Service / Advance only — Retention & Hold payouts don't route through DCA deductions) ── */}
                        {(isInvService || isAdvance) && (
                        <SectionCard>
                            <SectionHeader icon={Layers} title="Deduction" subtitle="Optionally deduct amounts against other account heads" />
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-5">
                                    <Label required>Deduction?</Label>
                                    <YesNoToggle value={dedYes} onChange={handleDedYesChange} />
                                </div>

                                {dedYes && (
                                    <>
                                        <p className="text-xs text-gray-400 mb-3">Choose Same CC or Other CC for each deduction row.</p>
                                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                        <th className="px-3 py-2 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Incl.</th>
                                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">CC</th>
                                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Account Head</th>
                                                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sub Account Head</th>
                                                        <th className="px-3 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                                                        <th className="px-2 py-2"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dedRows.map((row) => (
                                                        <DeductionRow
                                                            key={row.id}
                                                            row={row}
                                                            mainCC={selectedCC}
                                                            mainCCLabel={selectedCCName}
                                                            ccOptions={dedCCOptions}
                                                            ccLoading={dedCCOptionsLoading}
                                                            onSameCCChange={handleDedRowSameCCChange}
                                                            onCCChange={handleDedRowCCChange}
                                                            onDcaChange={handleDedRowDcaChange}
                                                            onSubDcaChange={handleDedRowSubDcaChange}
                                                            onAmountChange={handleDedRowAmountChange}
                                                            onIncludedChange={handleDedRowIncludedChange}
                                                            onRemove={removeDedRow}
                                                            canRemove
                                                        />
                                                    ))}
                                                    {dedRows.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="px-3 py-6 text-center text-xs text-gray-400">No deduction rows yet.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addDedRow}
                                            className="mt-3 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                                        >
                                            <Plus className="h-3.5 w-3.5" /> Add more
                                        </button>

                                        {includedDedRows.length > 0 && (
                                            <div className="mt-4 flex justify-end">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Total Deduction</p>
                                                    <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">{fmt(dedTotal)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </SectionCard>
                        )}

                        {/* ── Advance/Retention/Hold split (Invoice Service only) ── */}
                        {isInvService && (
                            <SectionCard>
                                <SectionHeader icon={Wallet} title="Withholding" subtitle="Amounts to withhold from this invoice payment" />
                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <Label>Advance</Label>
                                        <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={advanceAmt} onChange={(e) => setAdvanceAmt(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Retention</Label>
                                        <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={retentionAmt} onChange={(e) => setRetentionAmt(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Hold</Label>
                                        <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={holdAmt} onChange={(e) => setHoldAmt(e.target.value)} />
                                    </div>
                                </div>
                            </SectionCard>
                        )}

                        {/* ── Payment details ── */}
                        <SectionCard>
                            <SectionHeader icon={CreditCard} title="Payment Details" />
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <Label required>Bank Account</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} disabled={bankLoading}>
                                                <option value="">{bankLoading ? 'Loading…' : '— Select Bank —'}</option>
                                                {bankList.map((b) => (
                                                    <option key={b.BankId} value={b.BankId}>{b.BankName}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={bankLoading} />
                                        </div>
                                        {selectedBankObj && (
                                            <p className="text-xs text-gray-400 mt-1.5">Available Balance: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmt(selectedBankObj.AvailableBalance)}</span></p>
                                        )}
                                    </div>
                                    <div>
                                        <Label required>Number</Label>
                                        <input type="text" className={inputCls} placeholder="Reference / cheque number" value={refNumber} onChange={(e) => setRefNumber(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label required>Transaction Date</Label>
                                        <CustomDatePicker value={transactionDate} onChange={setTransactionDate} placeholder="Select transaction date" />
                                    </div>
                                    <div>
                                        <Label>Final Amount (After Deduction)</Label>
                                        <div className={`${inputCls} bg-gray-50 dark:bg-gray-900/30 font-bold text-indigo-600 dark:text-indigo-400 flex items-center`}>
                                            {fmt(finalAmount)}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label required>Remarks</Label>
                                        <textarea rows={3} className={`${inputCls} resize-none`} placeholder="Enter remarks…" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </>
                )}

                {/* ══════════════════════════════════════════════════════════ */}
                {/* STEP 3 — Review & Submit                                  */}
                {/* ══════════════════════════════════════════════════════════ */}
                {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SectionCard>
                            <SectionHeader icon={Eye} title="Transaction Summary" subtitle="Review before submitting" />
                            <div className="p-6">
                                <ReviewRow label="Invoice Type" value={invoiceTypeLabel} />
                                {isInvService ? (
                                    <>
                                        <ReviewRow label="Sub-Type"     value={subTypeLabel} />
                                        <ReviewRow label="Client Code"     value={pick(invoiceDetail, 'ClientCode', 'Clientcode')} />
                                        <ReviewRow label="Sub-Client Code" value={pick(invoiceDetail, 'SubClientCode', 'SubClientcode')} />
                                        <ReviewRow label="CC Code"      value={selectedCC} />
                                        <ReviewRow label="PO Number"    value={selectedPO} />
                                        <ReviewRow label="Invoice No"   value={selectedInvoiceNoText} />
                                        <ReviewRow label="Invoice Date" value={fmtDate(pick(invoiceDetail, 'InvoiceDate'))} />
                                    </>
                                ) : (
                                    <>
                                        <ReviewRow label="Client"     value={selectedClientName} />
                                        <ReviewRow label="Sub-Client" value={selectedSubClientName} />
                                        <ReviewRow label="CC Code"    value={selectedCC} />
                                        <ReviewRow label="PO Number"  value={selectedPO} />
                                        {isAdvance && (
                                            <>
                                                <ReviewRow label="RA" value={detailRA} />
                                                <ReviewRow label="Advance Request Date" value={fmtDate(advRequestDate)} />
                                            </>
                                        )}
                                        {(isRetention || isHold) && (
                                            <ReviewRow label="Invoices Selected" value={String(selectedInvoiceDetailRows.length)} />
                                        )}
                                    </>
                                )}
                                <ReviewRow label={(isRetention || isHold) ? 'Total Amount' : 'Amount'} value={fmt(baseAmount)} />
                                {isInvService && (
                                    <>
                                        <ReviewRow label="Advance"   value={fmt(advanceAmt)} />
                                        <ReviewRow label="Retention" value={fmt(retentionAmt)} />
                                        <ReviewRow label="Hold"      value={fmt(holdAmt)} />
                                    </>
                                )}
                                <ReviewRow label="Total Deduction" value={fmt(dedTotal)} />
                                <ReviewRow label="Final Amount"    value={fmt(finalAmount)} highlight />
                                <ReviewRow label="Bank"            value={selectedBankObj?.BankName} />
                                <ReviewRow label="Number"          value={refNumber} />
                                <ReviewRow label="Transaction Date" value={fmtDate(transactionDate)} />
                                <ReviewRow label="Remarks"         value={remarks} />
                            </div>
                        </SectionCard>

                        {dedYes && includedDedRows.length > 0 && (
                            <SectionCard>
                                <SectionHeader icon={Layers} title="Deduction Breakdown" subtitle="Rows included in this receipt" />
                                <div className="p-6">
                                    {includedDedRows.map((r, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            <div>
                                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{r.cc} — {r.dcaLabel || r.dcaCode}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{r.subDcaLabel || r.subDcaCode}</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{fmt(r.amount)}</p>
                                        </div>
                                    ))}
                                    <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 flex justify-between items-center">
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Total Deduction</span>
                                        <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">{fmt(dedTotal)}</span>
                                    </div>
                                </div>
                            </SectionCard>
                        )}

                        {(isRetention || isHold) && selectedInvoiceDetailRows.length > 0 && (
                            <SectionCard>
                                <SectionHeader icon={Receipt} title="Selected Invoices" subtitle="Invoices included in this receipt" />
                                <div className="p-6">
                                    {selectedInvoiceDetailRows.map((row, i) => {
                                        const amt = pick(row, isRetention ? 'RetentionBalance' : 'HoldBalance', 'Amount', 'Total');
                                        return (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                                <div>
                                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{pick(row, 'ClientInvoiceNo')}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(pick(row, 'InvoiceDate'))}</p>
                                                </div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{fmt(amt)}</p>
                                            </div>
                                        );
                                    })}
                                    <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 flex justify-between items-center">
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Total Amount</span>
                                        <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">{fmt(baseAmount)}</span>
                                    </div>
                                </div>
                            </SectionCard>
                        )}
                    </div>
                )}

                {/* ── Navigation Buttons ───────────────────────────────────── */}
                <div className="flex items-center justify-between pt-2 pb-6">
                    <button
                        type="button"
                        onClick={goBack}
                        disabled={step === 1}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-gray-800"
                    >
                        ← Back
                    </button>

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={goNext}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saveLoading}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-md shadow-emerald-200 dark:shadow-emerald-900/30 hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saveLoading
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                : <><Send className="h-4 w-4" /> Submit Receipt</>}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ClientReceipt;
