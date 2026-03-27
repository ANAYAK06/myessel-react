import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchCostCentersBySubType,
    fetchClientsByCostCenter,
    fetchSubClientsByClient,
    fetchSubClientPO,
    fetchClientGSTNos,
    fetchCompanyGSTNos,
    fetchTCSDCASDCAS,
    submitClientInvoice,
    clearSaveResult,
    resetClientInvoice,
    selectCostCenters,
    selectClients,
    selectSubClients,
    selectPONumbers,
    selectClientGSTNos,
    selectCompanyGSTNos,
    selectTCSDCASDCAS,
    selectSaveResult,
    selectCostCentersLoading,
    selectClientsLoading,
    selectSubClientsLoading,
    selectPONumbersLoading,
    selectGSTLoading,
    selectSaveLoading,
    selectSaveError,
} from '../../slices/accountsSlice/clientInvoiceSlice';

import {
    ReceiptText, Users, IndianRupee,
    ShieldCheck, Percent, CheckCircle,
    Loader2, ChevronDown, RotateCcw, Send, Navigation,
    MapPin,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const INVOICE_TYPES = [
    { value: 'Invoice Service', label: 'Service Invoice' },
    { value: 'Manufacturing',   label: 'Manufacturing'   },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
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

const serializeDate = (val) => {
    if (!val) return '';
    if (val instanceof Date) {
        return `${val.getFullYear()}-${String(val.getMonth()+1).padStart(2,'0')}-${String(val.getDate()).padStart(2,'0')}`;
    }
    return String(val);
};

const fmt = (v) => {
    const n = parseFloat(v);
    if (!v && v !== 0 || isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const calcTotal = (form) => {
    let total = parseFloat(form.BasicValue) || 0;
    if (form.IsGstApplicable === 'Yes') {
        if (form.Statecheck) {
            total += (parseFloat(form.Cgstsdcaamt) || 0) + (parseFloat(form.Sgstsdcaamt) || 0);
        } else {
            total += parseFloat(form.Igstsdcaamt) || 0;
        }
    }
    if (form.IsTCSApplicable === 'Yes') {
        total += parseFloat(form.TCSAmount) || 0;
    }
    return total;
};

const buildTaxStrings = (form) => {
    if (form.IsGstApplicable !== 'Yes') return { Taxtypes: null, Taxdcas: null, Taxamounts: null };
    if (form.Statecheck) {
        return {
            Taxtypes:   'CGST,SGST',
            Taxdcas:    `${form.CgstDca},${form.SgstDca}`,
            Taxamounts: `${parseFloat(form.Cgstsdcaamt) || 0},${parseFloat(form.Sgstsdcaamt) || 0}`,
        };
    }
    return {
        Taxtypes:   'IGST',
        Taxdcas:    form.IgstDca,
        Taxamounts: String(parseFloat(form.Igstsdcaamt) || 0),
    };
};

// ── Shared UI primitives (matches CCCashTransfer) ─────────────────────────────
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


const YesNoToggle = ({ value, onChange }) => (
    <div className="flex gap-3 mt-1">
        {['Yes', 'No'].map(opt => (
            <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    value === opt
                        ? opt === 'Yes'
                            ? 'bg-green-500 border-green-500 text-white shadow-sm'
                            : 'bg-rose-500 border-rose-500 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                }`}
            >
                {opt}
            </button>
        ))}
    </div>
);

// ── Initial form ──────────────────────────────────────────────────────────────
const INITIAL_FORM = {
    InvoiceType:       '',
    CCCode:            '',
    RANO:              '',
    Clientcode:        '',
    ClientName:        '',
    SubClientcode:     '',
    SubClientName:     '',
    PONumber:          '',
    ClientInvoiceNo:   '',
    InvoiceDate:       '',
    InvoiceMakingDate: '',
    BasicValue:        '',
    InvoiceRemarks:    '',
    IsGstApplicable:   '',
    TaxId:             0,
    ClientGST:         '',
    CompanyGST:        '',
    Statecheck:        false,
    CgstDca:           '',
    Cgstsdca:          '',
    Cgstsdcaamt:       '',
    SgstDca:           '',
    Sgstsdca:          '',
    Sgstsdcaamt:       '',
    IgstDca:           '',
    Igstsdca:          '',
    Igstsdcaamt:       '',
    IsTCSApplicable:   '',
    TCSDCA:            '',
    TCSSDCA:           '',
    TCSAmount:         '',
};

// ── Component ─────────────────────────────────────────────────────────────────
const ClientInvoiceCreation = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';

    const costCenters   = useSelector(selectCostCenters);
    const clients       = useSelector(selectClients);
    const subClients    = useSelector(selectSubClients);
    const poNumbers     = useSelector(selectPONumbers);
    const clientGSTNos  = useSelector(selectClientGSTNos);
    const companyGSTNos = useSelector(selectCompanyGSTNos);
    const tcsDCASDCAS   = useSelector(selectTCSDCASDCAS);
    const saveResult    = useSelector(selectSaveResult);
    const saveLoading   = useSelector(selectSaveLoading);
    const saveError     = useSelector(selectSaveError);

    const ccLoading       = useSelector(selectCostCentersLoading);
    const clientsLoading  = useSelector(selectClientsLoading);
    const subCliLoading   = useSelector(selectSubClientsLoading);
    const poLoading       = useSelector(selectPONumbersLoading);
    const gstLoading      = useSelector(selectGSTLoading);

    const [form, setForm] = useState(INITIAL_FORM);

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchTCSDCASDCAS());
        dispatch(fetchCompanyGSTNos('GST'));
        return () => { dispatch(resetClientInvoice()); };
    }, [dispatch]);

    // Pre-fill TCS DCA/SDCA
    useEffect(() => {
        if (tcsDCASDCAS) {
            setForm(prev => ({
                ...prev,
                TCSDCA:  prev.TCSDCA  || tcsDCASDCAS.TCSDCA  || '',
                TCSSDCA: prev.TCSSDCA || tcsDCASDCAS.TCSSDCA || '',
            }));
        }
    }, [tcsDCASDCAS]);

    // Auto-detect GST state
    useEffect(() => {
        if (form.ClientGST && form.CompanyGST) {
            const clientState  = form.ClientGST.replace(/\s.*/,'').substring(0, 2);
            const companyState = form.CompanyGST.replace(/\s.*/,'').substring(0, 2);
            setForm(prev => ({ ...prev, Statecheck: clientState === companyState }));
        }
    }, [form.ClientGST, form.CompanyGST]);

    // Save result
    useEffect(() => {
        if (saveResult) {
            const msg = typeof saveResult === 'string' ? saveResult : saveResult?.Message || '';
            if (msg === 'Submited' || msg.toLowerCase().includes('success') || msg.toLowerCase().includes('submit')) {
                toast.success('Client invoice submitted successfully!');
                dispatch(clearSaveResult());
                handleReset();
            } else {
                toast.error(msg || 'Save failed');
                dispatch(clearSaveResult());
            }
        }
    }, [saveResult, dispatch]);

    useEffect(() => {
        if (saveError) toast.error(saveError);
    }, [saveError]);

    // ── Cascade handlers ──────────────────────────────────────────────────────
    const handleInvoiceTypeChange = (val) => {
        setForm(prev => ({ ...prev, InvoiceType: val, CCCode: '', Clientcode: '', ClientName: '', SubClientcode: '', SubClientName: '', PONumber: '' }));
        if (val) dispatch(fetchCostCentersBySubType(val));
    };

    const handleCCChange = (ccCode) => {
        setForm(prev => ({ ...prev, CCCode: ccCode, Clientcode: '', ClientName: '', SubClientcode: '', SubClientName: '', PONumber: '' }));
        if (ccCode && form.InvoiceType) dispatch(fetchClientsByCostCenter({ invType: form.InvoiceType, ccCode }));
    };

    const handleClientChange = (clientcode, clientName) => {
        setForm(prev => ({ ...prev, Clientcode: clientcode, ClientName: clientName, SubClientcode: '', SubClientName: '', PONumber: '' }));
        if (clientcode && form.CCCode && form.InvoiceType) {
            dispatch(fetchSubClientsByClient({ invType: form.InvoiceType, ccCode: form.CCCode, clientcode }));
        }
    };

    const handleSubClientChange = (subClientcode, subClientName) => {
        setForm(prev => ({ ...prev, SubClientcode: subClientcode, SubClientName: subClientName, PONumber: '' }));
        if (subClientcode && form.CCCode && form.Clientcode) {
            dispatch(fetchSubClientPO({ subClient: subClientcode, ccCode: form.CCCode, clientcode: form.Clientcode }));
            dispatch(fetchClientGSTNos({ taxtype: 'SubClient', taxfor: subClientcode }));
        }
    };

    // ── Reset ─────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setForm(prev => ({
            ...INITIAL_FORM,
            TCSDCA:  tcsDCASDCAS?.TCSDCA  || '',
            TCSSDCA: tcsDCASDCAS?.TCSSDCA || '',
        }));
        dispatch(fetchTCSDCASDCAS());
        dispatch(fetchCompanyGSTNos('GST'));
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!form.InvoiceType)      { toast.warn('Select an Invoice Type');           return; }
        if (!form.CCCode)           { toast.warn('Select a Cost Center');             return; }
        if (!form.Clientcode)       { toast.warn('Select a Client');                  return; }
        if (!form.SubClientcode)    { toast.warn('Select a Sub-Client');              return; }
        if (!form.PONumber)         { toast.warn('Select a PO Number');               return; }
        if (!form.ClientInvoiceNo)  { toast.warn('Enter Client Invoice Number');      return; }
        if (!form.InvoiceDate)      { toast.warn('Select Invoice Date');              return; }
        if (!form.InvoiceMakingDate){ toast.warn('Select Invoice Making Date');       return; }
        if (!form.BasicValue || parseFloat(form.BasicValue) <= 0) { toast.warn('Enter a valid Basic Value'); return; }
        if (!form.IsGstApplicable)  { toast.warn('Specify if GST is applicable');     return; }
        if (form.IsGstApplicable === 'Yes') {
            if (!form.ClientGST)    { toast.warn('Select Client GST Number');         return; }
            if (!form.CompanyGST)   { toast.warn('Select Company GST Number');        return; }
        }
        if (!form.IsTCSApplicable)  { toast.warn('Specify if TCS is applicable');     return; }

        const taxStrings = buildTaxStrings(form);
        const total      = calcTotal(form);

        dispatch(submitClientInvoice({
            PONumber:          form.PONumber,
            RANO:              form.RANO || null,
            CCCode:            form.CCCode,
            ClientInvoiceNo:   form.ClientInvoiceNo,
            InvoiceDate:       formatDateForAPI(form.InvoiceDate),
            InvoiceMakingDate: formatDateForAPI(form.InvoiceMakingDate),
            BasicValue:        parseFloat(form.BasicValue) || 0,
            Total:             total,
            InvoiceRemarks:    form.InvoiceRemarks || null,
            InvoiceType:       form.InvoiceType,
            Clientcode:        form.Clientcode,
            SubClientcode:     form.SubClientcode,
            InvoiceSubType:    null,
            CreatedBy:         String(userId),
            Taxtypes:          taxStrings.Taxtypes,
            Taxdcas:           taxStrings.Taxdcas,
            Taxamounts:        taxStrings.Taxamounts,
            TaxId:             form.TaxId || 0,
            Roleid:            roleId,
            ClientGST:         form.IsGstApplicable === 'Yes' ? form.ClientGST  : null,
            CompanyGST:        form.IsGstApplicable === 'Yes' ? form.CompanyGST : null,
            Statecheck:        form.IsGstApplicable === 'Yes' ? form.Statecheck  : false,
            Cgstsdca:          form.Cgstsdca   || null,
            Cgstsdcaamt:       parseFloat(form.Cgstsdcaamt) || 0,
            Sgstsdca:          form.Sgstsdca   || null,
            Sgstsdcaamt:       parseFloat(form.Sgstsdcaamt) || 0,
            Igstsdca:          form.Igstsdca   || null,
            Igstsdcaamt:       parseFloat(form.Igstsdcaamt) || 0,
            IsGstApplicable:   form.IsGstApplicable || null,
            IsTCSApplicable:   form.IsTCSApplicable || null,
            TCSDCA:            form.IsTCSApplicable === 'Yes' ? form.TCSDCA  : null,
            TCSSDCA:           form.IsTCSApplicable === 'Yes' ? form.TCSSDCA : null,
            TCSAmount:         form.IsTCSApplicable === 'Yes' ? (parseFloat(form.TCSAmount) || 0) : 0,
        }));
    };

    // ── Derived option lists ──────────────────────────────────────────────────
    const ccOptions = costCenters.map(c => ({ value: c.CC_Code, label: c.CC_Name }));

    const clientOptions = clients.map(c => ({
        value: c.ClientCode,
        label: c.ClientName,
    }));

    const subClientOptions = subClients.map(c => ({
        value: c.SubClientCode?.split(',')[0]?.trim() || c.SubClientCode,
        label: c.SubClientCode,
    }));

    const poOptions = poNumbers.map(p => ({ value: p.PONumber, label: p.PONumber }));

    const clientGSTOptions = clientGSTNos.map(g => ({
        value:  g.TaxNoName,
        label:  g.TaxNoName,
        taxId:  g.TaxNoID,
    }));

    const companyGSTOptions = companyGSTNos.map(g => ({
        value: g.GSTNo || g.TaxNoName,
        label: g.TaxNoName,
    }));

    const total       = calcTotal(form);
    const isBusy      = saveLoading;
    const gstDetected = form.ClientGST && form.CompanyGST;

    // ── Render ────────────────────────────────────────────────────────────────
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
                                <ReceiptText className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Client Invoice Creation'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Create and submit client invoices with GST details</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / Invoice</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Section 1: Invoice Setup ─────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={ReceiptText} title="Invoice Setup" subtitle="Select invoice type and cost center" action={
                        <button onClick={handleReset} disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    } />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Invoice Type */}
                            <div>
                                <Label required>Invoice Type</Label>
                                <div className="relative">
                                    <select
                                        value={form.InvoiceType}
                                        onChange={e => handleInvoiceTypeChange(e.target.value)}
                                        disabled={isBusy}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">— Select Type —</option>
                                        {INVOICE_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={false} />
                                </div>
                            </div>

                            {/* Cost Center */}
                            <div>
                                <Label required>Cost Center</Label>
                                <div className="relative">
                                    <select
                                        value={form.CCCode}
                                        onChange={e => handleCCChange(e.target.value)}
                                        disabled={!form.InvoiceType || ccLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">
                                            {!form.InvoiceType ? 'Select type first' : ccLoading ? 'Loading…' : '— Select CC —'}
                                        </option>
                                        {ccOptions.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={ccLoading} />
                                </div>
                            </div>

                            {/* RANO */}
                            <div>
                                <Label>RANO</Label>
                                <input
                                    type="text"
                                    placeholder="Enter RANO reference…"
                                    value={form.RANO}
                                    onChange={e => setForm(p => ({ ...p, RANO: e.target.value }))}
                                    disabled={isBusy}
                                    className={inputCls}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── Section 2: Client & PO ───────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Users} title="Client & PO Selection" subtitle="Select client, sub-client and purchase order" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Client */}
                            <div>
                                <Label required>Client</Label>
                                <div className="relative">
                                    <select
                                        value={form.Clientcode}
                                        onChange={e => {
                                            const opt = clientOptions.find(c => c.value === e.target.value);
                                            handleClientChange(e.target.value, opt?.label || '');
                                        }}
                                        disabled={!form.CCCode || clientsLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">
                                            {!form.CCCode ? 'Select CC first' : clientsLoading ? 'Loading…' : '— Select Client —'}
                                        </option>
                                        {clientOptions.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={clientsLoading} />
                                </div>
                            </div>

                            {/* Sub Client */}
                            <div>
                                <Label required>Sub Client</Label>
                                <div className="relative">
                                    <select
                                        value={form.SubClientcode}
                                        onChange={e => {
                                            const opt = subClientOptions.find(c => c.value === e.target.value);
                                            handleSubClientChange(e.target.value, opt?.label || '');
                                        }}
                                        disabled={!form.Clientcode || subCliLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">
                                            {!form.Clientcode ? 'Select client first' : subCliLoading ? 'Loading…' : '— Select Sub Client —'}
                                        </option>
                                        {subClientOptions.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={subCliLoading} />
                                </div>
                            </div>

                            {/* PO Number */}
                            <div>
                                <Label required>PO Number</Label>
                                <div className="relative">
                                    <select
                                        value={form.PONumber}
                                        onChange={e => setForm(p => ({ ...p, PONumber: e.target.value }))}
                                        disabled={!form.SubClientcode || poLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">
                                            {!form.SubClientcode ? 'Select sub client first' : poLoading ? 'Loading…' : '— Select PO —'}
                                        </option>
                                        {poOptions.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={poLoading} />
                                </div>
                            </div>

                            {/* Client Invoice No */}
                            <div>
                                <Label required>Client Invoice Number</Label>
                                <input
                                    type="text"
                                    placeholder="Enter invoice number…"
                                    value={form.ClientInvoiceNo}
                                    onChange={e => setForm(p => ({ ...p, ClientInvoiceNo: e.target.value }))}
                                    disabled={isBusy}
                                    className={inputCls}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── Section 3: Invoice Details ───────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={IndianRupee} title="Invoice Details" subtitle="Dates, basic value and remarks" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Invoice Date */}
                            <div>
                                <Label required>Invoice Date</Label>
                                <CustomDatePicker
                                    value={form.InvoiceDate}
                                    onChange={val => setForm(p => ({ ...p, InvoiceDate: serializeDate(val) }))}
                                    format="DD-MMM-YYYY"
                                    disabled={isBusy}
                                />
                            </div>

                            {/* Invoice Making Date */}
                            <div>
                                <Label required>Invoice Making Date</Label>
                                <CustomDatePicker
                                    value={form.InvoiceMakingDate}
                                    onChange={val => setForm(p => ({ ...p, InvoiceMakingDate: serializeDate(val) }))}
                                    format="DD-MMM-YYYY"
                                    disabled={isBusy}
                                />
                            </div>

                            {/* Basic Value */}
                            <div>
                                <Label required>Basic Value (₹)</Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={form.BasicValue}
                                        onChange={e => setForm(p => ({ ...p, BasicValue: e.target.value }))}
                                        disabled={isBusy}
                                        className={`${inputCls} pl-9`}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── Section 4: GST Configuration ─────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={ShieldCheck} title="GST Configuration" subtitle="Select GST applicability and enter tax details" />
                    <div className="p-6 md:p-8">
                        {/* GST Applicable toggle */}
                        <div className="mb-6">
                            <Label>Is GST Applicable?</Label>
                            <YesNoToggle
                                value={form.IsGstApplicable}
                                onChange={val => setForm(p => ({ ...p, IsGstApplicable: val, ClientGST: '', CompanyGST: '', TaxId: 0, Statecheck: false }))}
                            />
                        </div>

                        {form.IsGstApplicable === 'Yes' && (
                            <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-700">

                                {/* GST number selectors */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label required>Client GST Number</Label>
                                        <div className="relative">
                                            <select
                                                value={form.ClientGST}
                                                onChange={e => {
                                                    const opt = clientGSTOptions.find(g => g.value === e.target.value);
                                                    setForm(p => ({ ...p, ClientGST: e.target.value, TaxId: opt?.taxId || 0 }));
                                                }}
                                                disabled={gstLoading || isBusy}
                                                className={`${inputCls} appearance-none pr-10`}
                                            >
                                                <option value="">{gstLoading ? 'Loading…' : '— Select Client GST —'}</option>
                                                {clientGSTOptions.map(g => (
                                                    <option key={g.taxId} value={g.value}>{g.label}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={gstLoading} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label required>Company GST Number</Label>
                                        <div className="relative">
                                            <select
                                                value={form.CompanyGST}
                                                onChange={e => setForm(p => ({ ...p, CompanyGST: e.target.value }))}
                                                disabled={gstLoading || isBusy}
                                                className={`${inputCls} appearance-none pr-10`}
                                            >
                                                <option value="">{gstLoading ? 'Loading…' : '— Select Company GST —'}</option>
                                                {companyGSTOptions.map((g, i) => (
                                                    <option key={i} value={g.value}>{g.label}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={gstLoading} />
                                        </div>
                                    </div>
                                </div>

                                {/* State detection badge */}
                                {gstDetected && (
                                    <div className={`flex items-center gap-3 p-4 rounded-xl border-2 text-sm font-semibold ${
                                        form.Statecheck
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
                                    }`}>
                                        <MapPin className="w-5 h-5 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold">{form.Statecheck ? 'Same State Transaction' : 'Inter-State Transaction'}</p>
                                            <p className="text-xs font-normal mt-0.5 opacity-80">
                                                {form.Statecheck ? 'CGST + SGST applicable' : 'IGST applicable'}
                                                {' '}— State code: client <strong>{form.ClientGST.substring(0,2)}</strong> / company <strong>{form.CompanyGST.replace(/\s.*/,'').substring(0,2)}</strong>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* CGST + SGST (same state) */}
                                {gstDetected && form.Statecheck && (
                                    <div className="rounded-2xl border-2 border-blue-100 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-900/10 overflow-hidden">
                                        <div className="px-5 py-3 bg-blue-100/60 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800">
                                            <p className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">CGST + SGST Breakdown</p>
                                        </div>
                                        <div className="p-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>CGST Amount (₹)</Label>
                                                    <div className="relative">
                                                        <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                                        <input type="number" placeholder="0.00" value={form.Cgstsdcaamt} onChange={e => setForm(p => ({ ...p, Cgstsdcaamt: e.target.value }))} className={`${inputCls} pl-9`} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>SGST Amount (₹)</Label>
                                                    <div className="relative">
                                                        <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                                        <input type="number" placeholder="0.00" value={form.Sgstsdcaamt} onChange={e => setForm(p => ({ ...p, Sgstsdcaamt: e.target.value }))} className={`${inputCls} pl-9`} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* IGST (different state) */}
                                {gstDetected && !form.Statecheck && (
                                    <div className="rounded-2xl border-2 border-orange-100 dark:border-orange-800 bg-orange-50/40 dark:bg-orange-900/10 overflow-hidden">
                                        <div className="px-5 py-3 bg-orange-100/60 dark:bg-orange-900/30 border-b border-orange-100 dark:border-orange-800">
                                            <p className="text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">IGST Breakdown</p>
                                        </div>
                                        <div className="p-5">
                                            <div className="max-w-xs">
                                                <Label>IGST Amount (₹)</Label>
                                                <div className="relative">
                                                    <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                                    <input type="number" placeholder="0.00" value={form.Igstsdcaamt} onChange={e => setForm(p => ({ ...p, Igstsdcaamt: e.target.value }))} className={`${inputCls} pl-9`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section 5: TCS Configuration ─────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Percent} title="TCS Configuration" subtitle="Tax Collected at Source applicability and details" />
                    <div className="p-6 md:p-8">
                        <div className="mb-6">
                            <Label>Is TCS Applicable?</Label>
                            <YesNoToggle
                                value={form.IsTCSApplicable}
                                onChange={val => setForm(p => ({ ...p, IsTCSApplicable: val }))}
                            />
                        </div>

                        {form.IsTCSApplicable === 'Yes' && (
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <Label>TCS DCA</Label>
                                        <input type="text" placeholder="DCA-TCS…" value={form.TCSDCA} onChange={e => setForm(p => ({ ...p, TCSDCA: e.target.value }))} disabled={isBusy} className={inputCls} />
                                    </div>
                                    <div>
                                        <Label>TCS SDCA</Label>
                                        <input type="text" placeholder="DCA-TCS.2…" value={form.TCSSDCA} onChange={e => setForm(p => ({ ...p, TCSSDCA: e.target.value }))} disabled={isBusy} className={inputCls} />
                                    </div>
                                    <div>
                                        <Label>TCS Amount (₹)</Label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <input type="number" placeholder="0.00" value={form.TCSAmount} onChange={e => setForm(p => ({ ...p, TCSAmount: e.target.value }))} disabled={isBusy} className={`${inputCls} pl-9`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Remarks ─────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 md:p-8">
                        <Label>Invoice Remarks</Label>
                        <textarea
                            rows={3}
                            placeholder="Add remarks or description (optional)…"
                            value={form.InvoiceRemarks}
                            onChange={e => setForm(p => ({ ...p, InvoiceRemarks: e.target.value }))}
                            disabled={isBusy}
                            className={`${inputCls} resize-none`}
                        />
                    </div>
                </div>

                {/* ── Summary card (visible when key fields filled) ─────────── */}
                {form.InvoiceType && form.CCCode && form.Clientcode && parseFloat(form.BasicValue) > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={CheckCircle} title="Invoice Summary" subtitle="Review before submitting" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                                {[
                                    { label: 'Invoice Type',   value: form.InvoiceType },
                                    { label: 'Cost Center',    value: form.CCCode },
                                    { label: 'Client',         value: form.ClientName || form.Clientcode },
                                    { label: 'PO Number',      value: form.PONumber || '—' },
                                    { label: 'Invoice No.',    value: form.ClientInvoiceNo || '—' },
                                    { label: 'Invoice Date',   value: formatDateForAPI(form.InvoiceDate) || '—' },
                                    { label: 'Basic Value',    value: `₹${fmt(form.BasicValue)}` },
                                    { label: 'GST',            value: form.IsGstApplicable || '—' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Total highlight */}
                            <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white">
                                <div>
                                    <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider">Total Invoice Amount</p>
                                    <p className="text-3xl font-black mt-1">₹ {fmt(total)}</p>
                                    <p className="text-indigo-200 text-xs mt-0.5">Basic value + GST + TCS</p>
                                </div>
                                <IndianRupee className="w-14 h-14 opacity-20" />
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
                        disabled={isBusy}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {saveLoading
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                            : <><Send className="h-4 w-4" /> Submit Invoice</>
                        }
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ClientInvoiceCreation;
