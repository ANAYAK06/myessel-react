import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    AlertTriangle, ChevronDown, Loader2, CheckCircle, RotateCcw,
    Send, FileText, Receipt, Building2, Navigation, Eye,
    CreditCard, Layers,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchBDPaymentTypes, fetchBDInvTypes,
    fetchInvServiceCCCodes, fetchRetentionCCCodes, fetchHoldCCCodes,
    fetchClientByCC, fetchClientByCCHold,
    fetchRetentionSubClients, fetchHoldSubClients,
    fetchRetentionPOs, fetchHoldPOs,
    fetchRetentionInvoices, fetchHoldInvoices,
    submitInvoiceServiceBD, submitRetentionBD, submitHoldBD,
    clearCCCodes, clearClients, clearSubClients, clearPOList,
    clearInvoices, clearSaveResult, resetBadDebt,
    selectBDPaymentTypes, selectBDPaymentTypesLoading,
    selectBDInvTypes, selectBDInvTypesLoading,
    selectBDCCCodes, selectBDCCCodesLoading,
    selectBDClients, selectBDClientsLoading,
    selectBDSubClients, selectBDSubClientsLoading,
    selectBDPOList, selectBDPOListLoading,
    selectBDInvoices, selectBDInvoicesLoading,
    selectBDSaveStatus, selectBDSaveLoading, selectBDSaveError,
} from '../../slices/accountsSlice/clientBadDebtSlice';

// ── Constants ──────────────────────────────────────────────────────────────────

const STEPS = ['Type & Selection', 'Invoice Details', 'Review & Submit'];

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
    n ? `₹ ${parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹ 0.00';

// ── Shared UI ──────────────────────────────────────────────────────────────────

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

const SectionCard = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
        <Icon className="h-4 w-4 text-indigo-500" />
        <div>
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
        </div>
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

// ── Main Component ─────────────────────────────────────────────────────────────

const ClientBadDebtReceivables = ({ menuData }) => {
    const dispatch     = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'system';

    // ── Redux ─────────────────────────────────────────────────────────────────
    const paymentTypes        = useSelector(selectBDPaymentTypes);
    const paymentTypesLoading = useSelector(selectBDPaymentTypesLoading);
    const invTypes            = useSelector(selectBDInvTypes);
    const invTypesLoading     = useSelector(selectBDInvTypesLoading);
    const ccCodes             = useSelector(selectBDCCCodes);
    const ccCodesLoading      = useSelector(selectBDCCCodesLoading);
    const clients             = useSelector(selectBDClients);
    const clientsLoading      = useSelector(selectBDClientsLoading);
    const subClients          = useSelector(selectBDSubClients);
    const subClientsLoading   = useSelector(selectBDSubClientsLoading);
    const poList              = useSelector(selectBDPOList);
    const poListLoading       = useSelector(selectBDPOListLoading);
    const invoices            = useSelector(selectBDInvoices);
    const invoicesLoading     = useSelector(selectBDInvoicesLoading);
    const saveStatus          = useSelector(selectBDSaveStatus);
    const saveLoading         = useSelector(selectBDSaveLoading);
    const saveError           = useSelector(selectBDSaveError);

    // ── Local state ───────────────────────────────────────────────────────────
    const [step, setStep] = useState(1);

    // Step 1 — Type & cascading selection
    const [selectedPayType,    setSelectedPayType]    = useState(null);  // { PaymentTypeID, PaymentTypeDescription }
    const [selectedInvType,    setSelectedInvType]    = useState('');    // for Invoice Service
    const [selectedCC,         setSelectedCC]         = useState('');
    const [selectedClient,     setSelectedClient]     = useState('');
    const [selectedSubClient,  setSelectedSubClient]  = useState('');
    const [selectedPO,         setSelectedPO]         = useState('');

    // Step 2 — Invoice selection (Retention/Hold)
    const [selectedInvoices, setSelectedInvoices] = useState([]); // array of invoice objects
    const [payAmounts,        setPayAmounts]       = useState({}); // { ClientInvoiceNo: amount }

    // Step 2 — Payment details (all types)
    const [payDate,     setPayDate]     = useState(null);
    const [remarks,     setRemarks]     = useState('');
    // Invoice Service specific
    const [invoiceNo,   setInvoiceNo]   = useState('');
    const [invoiceDate, setInvoiceDate] = useState(null);
    const [amount,      setAmount]      = useState('');

    // ── On mount ──────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchBDPaymentTypes());
        return () => { dispatch(resetBadDebt()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // Handle save result
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Write-off / Bad Debt saved successfully!');
            handleReset();
        } else if (saveStatus === 'failed') {
            toast.error(saveError || 'Save failed. Please try again.');
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const isInvService = selectedPayType?.PaymentTypeID === 13;
    const isRetention  = selectedPayType?.PaymentTypeID === 4;
    const isHold       = selectedPayType?.PaymentTypeID === 5;

    const balanceKey = isRetention ? 'RetentionBalance' : 'HoldBalance';

    const totalSelected = selectedInvoices.reduce(
        (s, inv) => s + parseFloat(payAmounts[inv.ClientInvoiceNo] || 0), 0
    );

    // ── Handlers — Step 1 cascading ───────────────────────────────────────────

    const handlePayTypeChange = useCallback((pt) => {
        setSelectedPayType(pt);
        setSelectedInvType('');
        setSelectedCC('');
        setSelectedClient('');
        setSelectedSubClient('');
        setSelectedPO('');
        setSelectedInvoices([]);
        setPayAmounts({});
        dispatch(clearCCCodes());
        dispatch(clearClients());
        dispatch(clearSubClients());
        dispatch(clearPOList());
        dispatch(clearInvoices());

        if (pt?.PaymentTypeID === 13) {
            // Invoice Service — also fetch invoice types
            dispatch(fetchBDInvTypes());
        } else if (pt?.PaymentTypeID === 4) {
            dispatch(fetchRetentionCCCodes({ Userid: userId, RoleId: roleId, Type: 4 }));
        } else if (pt?.PaymentTypeID === 5) {
            dispatch(fetchHoldCCCodes({ Userid: userId, RoleId: roleId, Type: 5 }));
        }
    }, [dispatch, userId, roleId]);

    const handleInvTypeChange = useCallback((invTypeId) => {
        setSelectedInvType(invTypeId);
        setSelectedCC('');
        dispatch(clearCCCodes());
        if (invTypeId) dispatch(fetchInvServiceCCCodes({ InvType: invTypeId }));
    }, [dispatch]);

    const handleCCChange = useCallback((ccCode) => {
        setSelectedCC(ccCode);
        setSelectedClient('');
        setSelectedSubClient('');
        setSelectedPO('');
        setSelectedInvoices([]);
        setPayAmounts({});
        dispatch(clearClients());
        dispatch(clearSubClients());
        dispatch(clearPOList());
        dispatch(clearInvoices());

        if (!ccCode) return;
        if (isRetention) dispatch(fetchClientByCC({ CCCode: ccCode }));
        if (isHold)      dispatch(fetchClientByCCHold({ CCCode: ccCode }));
    }, [dispatch, isRetention, isHold]);

    const handleClientChange = useCallback((clientCode) => {
        setSelectedClient(clientCode);
        setSelectedSubClient('');
        setSelectedPO('');
        setSelectedInvoices([]);
        setPayAmounts({});
        dispatch(clearSubClients());
        dispatch(clearPOList());
        dispatch(clearInvoices());

        if (!clientCode) return;
        if (isRetention) dispatch(fetchRetentionSubClients({ ClientCode: clientCode, CCcode: selectedCC }));
        if (isHold)      dispatch(fetchHoldSubClients({ clientcode: clientCode, CCcode: selectedCC }));
    }, [dispatch, isRetention, isHold, selectedCC]);

    const handleSubClientChange = useCallback((subCode) => {
        setSelectedSubClient(subCode);
        setSelectedPO('');
        setSelectedInvoices([]);
        setPayAmounts({});
        dispatch(clearPOList());
        dispatch(clearInvoices());

        if (!subCode) return;
        if (isRetention) dispatch(fetchRetentionPOs({ ClientCode: selectedClient, SClientcode: subCode, CCCode: selectedCC }));
        if (isHold)      dispatch(fetchHoldPOs({ ClientCode: selectedClient, SClientcode: subCode, CCCode: selectedCC }));
    }, [dispatch, isRetention, isHold, selectedClient, selectedCC]);

    const handlePOChange = useCallback((po) => {
        setSelectedPO(po);
        setSelectedInvoices([]);
        setPayAmounts({});
        dispatch(clearInvoices());

        if (!po) return;
        if (isRetention) dispatch(fetchRetentionInvoices({ ClientCode: selectedClient, SClientcode: selectedSubClient, CCCode: selectedCC, PO: po }));
        if (isHold)      dispatch(fetchHoldInvoices({ ClientCode: selectedClient, SClientcode: selectedSubClient, CCCode: selectedCC, PO: po }));
    }, [dispatch, isRetention, isHold, selectedClient, selectedSubClient, selectedCC]);

    // ── Invoice selection (Retention / Hold) ──────────────────────────────────

    const isInvoiceSelected = (invNo) => selectedInvoices.some(i => i.ClientInvoiceNo === invNo);

    const toggleInvoice = (row) => {
        const key = row.ClientInvoiceNo;
        if (isInvoiceSelected(key)) {
            setSelectedInvoices(prev => prev.filter(i => i.ClientInvoiceNo !== key));
            setPayAmounts(prev => { const n = { ...prev }; delete n[key]; return n; });
        } else {
            setSelectedInvoices(prev => [...prev, row]);
            setPayAmounts(prev => ({ ...prev, [key]: String(row[balanceKey] || 0) }));
        }
    };

    const toggleAll = () => {
        if (selectedInvoices.length === invoices.length) {
            setSelectedInvoices([]);
            setPayAmounts({});
        } else {
            setSelectedInvoices([...invoices]);
            const amts = {};
            invoices.forEach(r => { amts[r.ClientInvoiceNo] = String(r[balanceKey] || 0); });
            setPayAmounts(amts);
        }
    };

    const setPayAmt = (key, val) => setPayAmounts(prev => ({ ...prev, [key]: val }));

    // ── Validation ────────────────────────────────────────────────────────────

    const validateStep1 = useCallback(() => {
        if (!selectedPayType) { toast.warn('Please select a payment type.'); return false; }
        if (isInvService && !selectedInvType) { toast.warn('Please select an invoice type.'); return false; }
        if (isInvService && !selectedCC)      { toast.warn('Please select a CC code.'); return false; }
        if ((isRetention || isHold) && !selectedCC)        { toast.warn('Please select a CC code.'); return false; }
        if ((isRetention || isHold) && !selectedClient)    { toast.warn('Please select a client.'); return false; }
        if ((isRetention || isHold) && !selectedSubClient) { toast.warn('Please select a sub-client.'); return false; }
        if ((isRetention || isHold) && !selectedPO)        { toast.warn('Please select a PO.'); return false; }
        return true;
    }, [selectedPayType, isInvService, isRetention, isHold, selectedInvType, selectedCC, selectedClient, selectedSubClient, selectedPO]);

    const validateStep2 = useCallback(() => {
        if (isInvService) {
            if (!invoiceNo.trim())  { toast.warn('Please enter invoice number.'); return false; }
            if (!invoiceDate)       { toast.warn('Please select invoice date.'); return false; }
            if (!payDate)           { toast.warn('Please select transaction date.'); return false; }
            if (!amount || parseFloat(amount) <= 0) { toast.warn('Please enter a valid amount.'); return false; }
            if (!remarks.trim())    { toast.warn('Please enter remarks.'); return false; }
        } else {
            if (selectedInvoices.length === 0) { toast.warn('Please select at least one invoice.'); return false; }
            if (totalSelected <= 0)             { toast.warn('Total amount must be greater than 0.'); return false; }
            if (!payDate)                       { toast.warn('Please select a payment date.'); return false; }
            if (!remarks.trim())                { toast.warn('Please enter remarks.'); return false; }
        }
        return true;
    }, [isInvService, invoiceNo, invoiceDate, payDate, amount, remarks, selectedInvoices, totalSelected]);

    const goNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep(s => s + 1);
    };

    const goBack = () => setStep(s => s - 1);

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = () => {
        if (isInvService) {
            dispatch(submitInvoiceServiceBD({
                TransactionDate: fmtDate(payDate),
                Remarks:         remarks,
                Amount:          parseFloat(amount),
                InvoiceNo:       invoiceNo,
                CCCode:          selectedCC,
                Createdby:       userName,
                PaytypeId:       selectedPayType.PaymentTypeID,
                InvoiceDate:     fmtDate(invoiceDate),
                Roleid:          parseInt(roleId, 10),
                Action:          'Save',
            }));
        } else if (isRetention) {
            dispatch(submitRetentionBD({
                PaymentDate:  fmtDate(payDate),
                Remarks:      remarks,
                PaymentAmount: totalSelected,
                InvoiceNos:   selectedInvoices.map(i => i.ClientInvoiceNo).join(','),
                Createdby:    userName,
                InvoiceDates: selectedInvoices.map(i => i.InvoiceDate).join(','),
                Roleid:       parseInt(roleId, 10),
                Action:       'Save',
            }));
        } else if (isHold) {
            dispatch(submitHoldBD({
                PaymentDate:  fmtDate(payDate),
                Remarks:      remarks,
                PaymentAmount: totalSelected,
                InvoiceNos:   selectedInvoices.map(i => i.ClientInvoiceNo).join(','),
                Createdby:    userName,
                InvoiceDates: selectedInvoices.map(i => i.InvoiceDate).join(','),
                Roleid:       parseInt(roleId, 10),
                Action:       'Save',
            }));
        }
    };

    const handleReset = () => {
        setStep(1);
        setSelectedPayType(null);
        setSelectedInvType('');
        setSelectedCC('');
        setSelectedClient('');
        setSelectedSubClient('');
        setSelectedPO('');
        setSelectedInvoices([]);
        setPayAmounts({});
        setPayDate(null);
        setRemarks('');
        setInvoiceNo('');
        setInvoiceDate(null);
        setAmount('');
        dispatch(resetBadDebt());
        dispatch(fetchBDPaymentTypes());
    };

    // ── Derived labels ────────────────────────────────────────────────────────
    const selectedClientName    = clients.find(c => c.ClientCode === selectedClient)?.ClientName || selectedClient;
    const selectedSubClientName = subClients.find(s => s.SubClientCode === selectedSubClient)?.SubClientCodename || selectedSubClient;

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
                                <AlertTriangle className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Write-off Receivables / Bad Debts'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Client bad debt write-off and receivables management</p>
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
                                    <p className="text-sm font-bold text-white">Accounts / BD</p>
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
                        <SectionHeader icon={FileText} title="Type & Selection" subtitle="Select write-off type and filter criteria" />
                        <div className="p-6">
                            <InnerHeader icon={AlertTriangle} title="Payment Type" subtitle="Choose the type of receivable to write off" />

                            {/* Payment Type selector */}
                            {paymentTypesLoading ? (
                                <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
                                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Loading types…
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-3 mb-7">
                                    {paymentTypes.map(pt => (
                                        <button
                                            key={pt.PaymentTypeID}
                                            type="button"
                                            onClick={() => handlePayTypeChange(pt)}
                                            className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                                                ${selectedPayType?.PaymentTypeID === pt.PaymentTypeID
                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-gray-800'}`}
                                        >
                                            {pt.PaymentTypeDescription}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ── Invoice Service filters ── */}
                            {isInvService && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Invoice Type */}
                                    <div>
                                        <Label required>Invoice Type</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedInvType} onChange={e => handleInvTypeChange(e.target.value)} disabled={invTypesLoading}>
                                                <option value="">— Select Invoice Type —</option>
                                                {invTypes.map(t => (
                                                    <option key={t.CCInvoiceTypeId} value={t.CCInvoiceTypeId}>{t.CCInvoiceTypeDescription}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={invTypesLoading} />
                                        </div>
                                    </div>
                                    {/* CC Code */}
                                    <div>
                                        <Label required>CC Code</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedCC} onChange={e => setSelectedCC(e.target.value)} disabled={!selectedInvType || ccCodesLoading}>
                                                <option value="">— Select CC Code —</option>
                                                {ccCodes.map((c, i) => {
                                                    const id   = c.CC_Id   || c.CCId   || c.cc_id   || i;
                                                    const code = c.CC_Code || c.CCCode || c.cc_code || c.CCCodeNo || '';
                                                    const name = c.CC_Name || c.CCName || c.cc_name || c.CCDescription || code;
                                                    return <option key={id} value={code}>{name}</option>;
                                                })}
                                            </select>
                                            <SelectIcon loading={ccCodesLoading} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Retention / Hold filters ── */}
                            {(isRetention || isHold) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* CC Code */}
                                    <div>
                                        <Label required>CC Code</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedCC} onChange={e => handleCCChange(e.target.value)} disabled={ccCodesLoading}>
                                                <option value="">— Select CC Code —</option>
                                                {ccCodes.map((c, i) => (
                                                    <option key={i} value={c.CC_Code}>{c.CC_Name}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={ccCodesLoading} />
                                        </div>
                                    </div>
                                    {/* Client */}
                                    <div>
                                        <Label required>Client</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedClient} onChange={e => handleClientChange(e.target.value)} disabled={!selectedCC || clientsLoading}>
                                                <option value="">— Select Client —</option>
                                                {clients.map(c => (
                                                    <option key={c.ClientID} value={c.ClientCode}>{c.ClientName}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={clientsLoading} />
                                        </div>
                                    </div>
                                    {/* Sub-client */}
                                    <div>
                                        <Label required>Sub-Client</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedSubClient} onChange={e => handleSubClientChange(e.target.value)} disabled={!selectedClient || subClientsLoading}>
                                                <option value="">— Select Sub-Client —</option>
                                                {subClients.map(s => (
                                                    <option key={s.SubClientId} value={s.SubClientCode}>{s.SubClientCodename}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={subClientsLoading} />
                                        </div>
                                    </div>
                                    {/* PO */}
                                    <div>
                                        <Label required>PO Number</Label>
                                        <div className="relative">
                                            <select className={inputCls} value={selectedPO} onChange={e => handlePOChange(e.target.value)} disabled={!selectedSubClient || poListLoading}>
                                                <option value="">— Select PO —</option>
                                                {poList.map(p => (
                                                    <option key={p.ClientPOId} value={p.PONumber}>{p.PONumber}</option>
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
                {/* STEP 2 — Invoice Details                                  */}
                {/* ══════════════════════════════════════════════════════════ */}
                {step === 2 && (
                    <>
                        {/* ── Invoice Service: entry form ── */}
                        {isInvService && (
                            <SectionCard>
                                <SectionHeader icon={Receipt} title="Invoice Details" subtitle="Enter invoice and write-off amount" />
                                <div className="p-6">
                                    <InnerHeader icon={CreditCard} title="Write-off Entry" subtitle={`Type: ${selectedPayType?.PaymentTypeDescription} | CC: ${selectedCC}`} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <Label required>Invoice Number</Label>
                                            <input type="text" className={inputCls} placeholder="Enter invoice number" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label required>Invoice Date</Label>
                                            <CustomDatePicker value={invoiceDate} onChange={setInvoiceDate} placeholder="Select invoice date" />
                                        </div>
                                        <div>
                                            <Label required>Transaction Date</Label>
                                            <CustomDatePicker value={payDate} onChange={setPayDate} placeholder="Select transaction date" />
                                        </div>
                                        <div>
                                            <Label required>Write-off Amount</Label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                                <input type="number" className={`${inputCls} pl-7`} placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label required>Remarks</Label>
                                            <textarea rows={3} className={`${inputCls} resize-none`} placeholder="Enter remarks…" value={remarks} onChange={e => setRemarks(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        )}

                        {/* ── Retention / Hold: invoice table + payment details ── */}
                        {(isRetention || isHold) && (
                            <>
                                <SectionCard>
                                    <SectionHeader icon={Layers} title="Invoice Selection" subtitle={`Select ${isRetention ? 'retention' : 'hold'} invoices to write off`} />
                                    <div className="p-6">
                                        <InnerHeader
                                            icon={Building2}
                                            title="Invoice List"
                                            subtitle={`CC: ${selectedCC} | Client: ${selectedClient} | PO: ${selectedPO}`}
                                        />

                                        {invoicesLoading ? (
                                            <div className="flex items-center justify-center py-10 gap-2 text-sm text-gray-400">
                                                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" /> Loading invoices…
                                            </div>
                                        ) : invoices.length === 0 ? (
                                            <div className="py-10 text-center text-sm text-gray-400">No invoices found.</div>
                                        ) : (
                                            <>
                                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                                <th className="px-4 py-3 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                                                                        onChange={toggleAll}
                                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                    />
                                                                </th>
                                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">#</th>
                                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Invoice No</th>
                                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Invoice Date</th>
                                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">PO No</th>
                                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                                    {isRetention ? 'Retention Bal' : 'Hold Bal'}
                                                                </th>
                                                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">Write-off Amt</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {invoices.map((row, i) => {
                                                                const sel  = isInvoiceSelected(row.ClientInvoiceNo);
                                                                const bal  = row[balanceKey] || 0;
                                                                const paying = parseFloat(payAmounts[row.ClientInvoiceNo] || 0);
                                                                const exceeds = sel && paying > bal;
                                                                return (
                                                                    <tr key={i} className={`border-t border-gray-100 dark:border-gray-700 transition-colors
                                                                        ${sel ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}>
                                                                        <td className="px-4 py-2.5 text-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={sel}
                                                                                onChange={() => toggleInvoice(row)}
                                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                disabled={bal <= 0}
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap">{i + 1}</td>
                                                                        <td className="px-4 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{row.ClientInvoiceNo || '—'}</td>
                                                                        <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{row.InvoiceDate || '—'}</td>
                                                                        <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{row.PONumber || '—'}</td>
                                                                        <td className="px-4 py-2.5 text-xs text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                                            {fmt(bal)}
                                                                        </td>
                                                                        <td className="px-3 py-2 min-w-[130px]">
                                                                            <input
                                                                                type="number"
                                                                                value={payAmounts[row.ClientInvoiceNo] ?? ''}
                                                                                onChange={e => setPayAmt(row.ClientInvoiceNo, e.target.value)}
                                                                                disabled={!sel}
                                                                                min="0"
                                                                                step="0.01"
                                                                                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs text-right font-semibold focus:outline-none focus:ring-1 transition-all
                                                                                    ${!sel
                                                                                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 cursor-not-allowed'
                                                                                        : exceeds
                                                                                            ? 'border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 focus:ring-rose-400'
                                                                                            : 'border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 focus:ring-indigo-400'}`}
                                                                            />
                                                                            {exceeds && (
                                                                                <p className="text-rose-500 text-[10px] mt-0.5 text-right">Max {fmt(bal)}</p>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className="bg-indigo-50 dark:bg-indigo-900/20 border-t-2 border-indigo-200 dark:border-indigo-700">
                                                                <td colSpan={5} className="px-4 py-3 text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                                                                    Total Write-off
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                                    {fmt(invoices.reduce((s, r) => s + (r[balanceKey] || 0), 0))}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-right font-black text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                                                                    {fmt(totalSelected)}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>

                                                {selectedInvoices.length > 0 && (
                                                    <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Layers className="h-4 w-4 text-indigo-500" />
                                                            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                                                {selectedInvoices.length} Invoice{selectedInvoices.length > 1 ? 's' : ''} Selected
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500">Total Write-off</p>
                                                            <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">{fmt(totalSelected)}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </SectionCard>

                                {/* Payment details form */}
                                <SectionCard>
                                    <SectionHeader icon={CreditCard} title="Payment Details" subtitle="Enter date and remarks for this write-off" />
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <Label required>Payment Date</Label>
                                                <CustomDatePicker value={payDate} onChange={setPayDate} placeholder="Select payment date" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label required>Remarks</Label>
                                                <textarea rows={3} className={`${inputCls} resize-none`} placeholder="Enter remarks…" value={remarks} onChange={e => setRemarks(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>
                            </>
                        )}
                    </>
                )}

                {/* ══════════════════════════════════════════════════════════ */}
                {/* STEP 3 — Review & Submit                                  */}
                {/* ══════════════════════════════════════════════════════════ */}
                {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Transaction summary */}
                        <SectionCard>
                            <SectionHeader icon={Eye} title="Transaction Summary" subtitle="Review before submitting" />
                            <div className="p-6">
                                <ReviewRow label="Payment Type"  value={selectedPayType?.PaymentTypeDescription} />
                                {isInvService && (
                                    <>
                                        <ReviewRow label="Invoice Type"  value={invTypes.find(t => String(t.CCInvoiceTypeId) === String(selectedInvType))?.CCInvoiceTypeDescription} />
                                        <ReviewRow label="CC Code"       value={selectedCC} />
                                        <ReviewRow label="Invoice No"    value={invoiceNo} />
                                        <ReviewRow label="Invoice Date"  value={fmtDate(invoiceDate)} />
                                        <ReviewRow label="Trans. Date"   value={fmtDate(payDate)} />
                                        <ReviewRow label="Amount"        value={fmt(amount)} highlight />
                                        <ReviewRow label="Remarks"       value={remarks} />
                                    </>
                                )}
                                {(isRetention || isHold) && (
                                    <>
                                        <ReviewRow label="CC Code"       value={selectedCC} />
                                        <ReviewRow label="Client"        value={selectedClientName} />
                                        <ReviewRow label="Sub-Client"    value={selectedSubClientName} />
                                        <ReviewRow label="PO Number"     value={selectedPO} />
                                        <ReviewRow label="Invoices"      value={`${selectedInvoices.length} selected`} />
                                        <ReviewRow label="Payment Date"  value={fmtDate(payDate)} />
                                        <ReviewRow label="Total Amount"  value={fmt(totalSelected)} highlight />
                                        <ReviewRow label="Remarks"       value={remarks} />
                                    </>
                                )}
                            </div>
                        </SectionCard>

                        {/* Invoice breakdown (Retention / Hold) */}
                        {(isRetention || isHold) && selectedInvoices.length > 0 && (
                            <SectionCard>
                                <SectionHeader icon={Layers} title="Invoice Breakdown" subtitle="Invoices included in this write-off" />
                                <div className="p-6">
                                    {selectedInvoices.map((inv, i) => (
                                        <div key={i} className="mb-3 last:mb-0">
                                            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                                <div>
                                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{inv.ClientInvoiceNo}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{inv.InvoiceDate}</p>
                                                </div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{fmt(payAmounts[inv.ClientInvoiceNo])}</p>
                                            </div>
                                            {inv.PONumber && (
                                                <p className="text-xs text-gray-400 pl-3 py-1">PO: {inv.PONumber}</p>
                                            )}
                                        </div>
                                    ))}
                                    <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 flex justify-between items-center">
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Grand Total</span>
                                        <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">{fmt(totalSelected)}</span>
                                    </div>
                                </div>
                            </SectionCard>
                        )}

                        {/* For Invoice Service, show an extra right-side summary card */}
                        {isInvService && (
                            <SectionCard>
                                <SectionHeader icon={Building2} title="CC & Invoice Info" />
                                <div className="p-6">
                                    <ReviewRow label="CC Code"         value={selectedCC} />
                                    <ReviewRow label="Invoice Number"  value={invoiceNo} />
                                    <ReviewRow label="Invoice Date"    value={fmtDate(invoiceDate)} />
                                    <ReviewRow label="Write-off Amt"   value={fmt(amount)} highlight />
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
                                : <><Send className="h-4 w-4" /> Submit Write-off</>}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ClientBadDebtReceivables;
