import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchScrapCostCenters,
    fetchScrapClients,
    fetchScrapSubClients,
    fetchScrapRequestNumbers,
    fetchScrapRequestDetails,
    fetchScrapClientGSTNos,
    fetchScrapCompanyGSTNos,
    fetchScrapTCSDCASDCAS,
    submitScrapInvoice,
    clearScrapSaveResult,
    clearScrapSubClients,
    clearScrapRequestNumbers,
    clearScrapRequestDetails,
    resetScrapInvoice,
    selectScrapCostCenters,
    selectScrapClients,
    selectScrapSubClients,
    selectScrapRequestNumbers,
    selectScrapRequestDetails,
    selectScrapClientGSTNos,
    selectScrapCompanyGSTNos,
    selectScrapTCSDCASDCAS,
    selectScrapSaveResult,
    selectScrapCCLoading,
    selectScrapClientsLoading,
    selectScrapSubCliLoading,
    selectScrapReqNosLoading,
    selectScrapReqDetailsLoading,
    selectScrapGSTLoading,
    selectScrapSaveLoading,
    selectScrapSaveError,
} from '../../slices/accountsSlice/clientScrapSaleInvoiceSlice';

import {
    ReceiptText, Users, IndianRupee,
    ShieldCheck, Percent, CheckCircle,
    Loader2, ChevronDown, RotateCcw, Send, Navigation,
    Recycle, FileSearch,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const INVOICE_TYPES = [
    { value: 'Service',       label: 'Invoice Service'  },
    { value: 'Manufacturing', label: 'Manufacturing'    },
];

const INV_TYPE = 'Scrap';

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

const fmt = (v) => {
    const n = parseFloat(v);
    if ((!v && v !== 0) || isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const calcTotal = (basicValue, form) => {
    let total = parseFloat(basicValue) || 0;
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

// ── Shared UI primitives ──────────────────────────────────────────────────────
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

// ── Initial state ──────────────────────────────────────────────────────────────
const INITIAL_FORM = {
    InvoiceSubType:    '',
    CCCode:            '',
    RANO:              '',
    Clientcode:        '',
    SubClientcode:     '',
    RequestNumber:     '',
    RequestId:         '',
    ClientInvoiceNo:   '',
    InvoiceDate:       '',
    InvoiceMakingDate: '',
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
const ClientScrapSaleInvoiceCreation = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const roleId = userData?.roleId  || userData?.RID  || 0;
    const userId = userData?.userId  || userData?.UID  || userData?.employeeId || '';

    // Redux state
    const costCenters     = useSelector(selectScrapCostCenters);
    const clients         = useSelector(selectScrapClients);
    const subClients      = useSelector(selectScrapSubClients);
    const requestNumbers  = useSelector(selectScrapRequestNumbers);
    const requestDetails  = useSelector(selectScrapRequestDetails);
    const clientGSTNos    = useSelector(selectScrapClientGSTNos);
    const companyGSTNos   = useSelector(selectScrapCompanyGSTNos);
    const tcsDCASDCAS     = useSelector(selectScrapTCSDCASDCAS);
    const saveResult      = useSelector(selectScrapSaveResult);

    const ccLoading         = useSelector(selectScrapCCLoading);
    const clientsLoading    = useSelector(selectScrapClientsLoading);
    const subCliLoading     = useSelector(selectScrapSubCliLoading);
    const reqNosLoading     = useSelector(selectScrapReqNosLoading);
    const reqDetailsLoading = useSelector(selectScrapReqDetailsLoading);
    const gstLoading        = useSelector(selectScrapGSTLoading);
    const saveLoading       = useSelector(selectScrapSaveLoading);
    const saveError         = useSelector(selectScrapSaveError);

    // Local state
    const [form, setForm] = useState(INITIAL_FORM);
    const [basicValue, setBasicValue] = useState('');

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchScrapCompanyGSTNos('GST'));
        dispatch(fetchScrapTCSDCASDCAS());
    }, [dispatch]);

    // Pre-fill BasicValue when request details load, but keep it editable
    useEffect(() => {
        if (requestDetails?.BasicValue !== undefined && requestDetails?.BasicValue !== null) {
            setBasicValue(String(requestDetails.BasicValue));
        }
    }, [requestDetails]);

    // Pre-fill TCS DCA/SDCA once loaded
    useEffect(() => {
        if (tcsDCASDCAS) {
            setForm(p => ({
                ...p,
                TCSDCA:  tcsDCASDCAS.TCSDCA  || '',
                TCSSDCA: tcsDCASDCAS.TCSSDCA || '',
            }));
        }
    }, [tcsDCASDCAS]);

    // Detect intra/inter state from GST numbers
    useEffect(() => {
        if (form.ClientGST && form.CompanyGST) {
            const clientState  = form.ClientGST.substring(0, 2);
            const companyState = form.CompanyGST.substring(0, 2);
            setForm(p => ({ ...p, Statecheck: clientState === companyState }));
        }
    }, [form.ClientGST, form.CompanyGST]);

    // Handle save result
    useEffect(() => {
        if (!saveResult) return;
        const msg = typeof saveResult === 'string' ? saveResult : saveResult?.Message || '';
        if (msg === 'Submited' || msg.toLowerCase().includes('success')) {
            toast.success('Scrap sale invoice submitted successfully!');
            handleReset();
        } else if (msg) {
            toast.error(msg);
        }
        dispatch(clearScrapSaveResult());
    }, [saveResult]);

    useEffect(() => {
        if (saveError) toast.error(saveError);
    }, [saveError]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleInvoiceTypeChange = (subType) => {
        setForm(p => ({
            ...INITIAL_FORM,
            InvoiceSubType: subType,
            TCSDCA:  p.TCSDCA,
            TCSSDCA: p.TCSSDCA,
        }));
        dispatch(clearScrapSubClients());
        dispatch(clearScrapRequestDetails());
        if (subType) {
            dispatch(fetchScrapCostCenters(subType));
        }
    };

    const handleCCChange = (ccCode) => {
        setForm(p => ({
            ...INITIAL_FORM,
            InvoiceSubType: p.InvoiceSubType,
            CCCode:  ccCode,
            TCSDCA:  p.TCSDCA,
            TCSSDCA: p.TCSSDCA,
        }));
        dispatch(clearScrapSubClients());
        dispatch(clearScrapRequestDetails());
        if (ccCode) {
            dispatch(fetchScrapClients({ invType: INV_TYPE, ccCode }));
        }
    };

    const handleClientChange = (clientcode) => {
        setForm(p => ({ ...p, Clientcode: clientcode, SubClientcode: '', RequestNumber: '', RequestId: '' }));
        dispatch(clearScrapSubClients());
        if (clientcode && form.CCCode) {
            dispatch(fetchScrapSubClients({ invType: INV_TYPE, ccCode: form.CCCode, clientcode }));
        }
    };

    const handleSubClientChange = (subClientCode) => {
        setForm(p => ({ ...p, SubClientcode: subClientCode, RequestNumber: '', RequestId: '' }));
        setBasicValue('');
        dispatch(clearScrapRequestNumbers());
        dispatch(clearScrapRequestDetails());
        if (subClientCode && form.CCCode && form.Clientcode) {
            dispatch(fetchScrapRequestNumbers({
                subClient:  subClientCode,
                ccCode:     form.CCCode,
                clientcode: form.Clientcode,
            }));
            dispatch(fetchScrapClientGSTNos({ taxtype: 'SubClient', taxfor: subClientCode }));
        }
    };

    const handleRequestChange = (reqId) => {
        const selected = requestNumbers.find(r => String(r.RequestId) === String(reqId));
        setForm(p => ({
            ...p,
            RequestId:     reqId,
            RequestNumber: selected?.RequestNumber || '',
        }));
        dispatch(clearScrapRequestDetails());
        if (reqId) {
            dispatch(fetchScrapRequestDetails(reqId));
        }
    };

    const handleReset = () => {
        setForm(prev => ({
            ...INITIAL_FORM,
            TCSDCA:  tcsDCASDCAS?.TCSDCA  || '',
            TCSSDCA: tcsDCASDCAS?.TCSSDCA || '',
        }));
        setBasicValue('');
        dispatch(clearScrapRequestDetails());
        dispatch(fetchScrapCompanyGSTNos('GST'));
        dispatch(fetchScrapTCSDCASDCAS());
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!form.InvoiceSubType)    { toast.warn('Select an Invoice Type');          return; }
        if (!form.CCCode)            { toast.warn('Select a Cost Center');            return; }
        if (!form.Clientcode)        { toast.warn('Select a Client');                 return; }
        if (!form.SubClientcode)     { toast.warn('Select a Sub-Client');             return; }
        if (!form.RequestId)         { toast.warn('Select a Request Number');         return; }
        if (!(parseFloat(basicValue) > 0)) { toast.warn('Enter a valid Basic Value');  return; }
        if (!form.ClientInvoiceNo)   { toast.warn('Enter Client Invoice Number');     return; }
        if (!form.InvoiceDate)       { toast.warn('Select Invoice Date');             return; }
        if (!form.InvoiceMakingDate) { toast.warn('Select Invoice Making Date');      return; }
        if (!form.IsGstApplicable)   { toast.warn('Specify if GST is applicable');    return; }
        if (form.IsGstApplicable === 'Yes') {
            if (!form.ClientGST)  { toast.warn('Select Client GST Number');  return; }
            if (!form.CompanyGST) { toast.warn('Select Company GST Number'); return; }
        }
        if (!form.IsTCSApplicable)   { toast.warn('Specify if TCS is applicable');   return; }

        const bv         = parseFloat(basicValue) || 0;
        const taxStrings = buildTaxStrings(form);
        const total      = calcTotal(bv, form);

        dispatch(submitScrapInvoice({
            RequestNumber:     form.RequestNumber,
            RANO:              form.RANO || null,
            CCCode:            form.CCCode,
            ClientInvoiceNo:   form.ClientInvoiceNo,
            InvoiceDate:       formatDateForAPI(form.InvoiceDate),
            InvoiceMakingDate: formatDateForAPI(form.InvoiceMakingDate),
            BasicValue:        bv,
            Total:             total,
            InvoiceRemarks:    form.InvoiceRemarks || null,
            InvoiceType:       INV_TYPE,
            Clientcode:        form.Clientcode,
            SubClientcode:     form.SubClientcode,
            InvoiceSubType:    form.InvoiceSubType,
            CreatedBy:         String(userId),
            Roleid:            roleId,
            Taxtypes:          taxStrings.Taxtypes,
            Taxdcas:           taxStrings.Taxdcas,
            Taxamounts:        taxStrings.Taxamounts,
            TaxId:             form.TaxId || 0,
            ClientGST:         form.IsGstApplicable === 'Yes' ? form.ClientGST  : null,
            CompanyGST:        form.IsGstApplicable === 'Yes' ? form.CompanyGST : null,
            Statecheck:        form.IsGstApplicable === 'Yes' ? form.Statecheck  : false,
            Cgstsdca:          form.Cgstsdca   || null,
            Cgstsdcaamt:       parseFloat(form.Cgstsdcaamt)  || 0,
            Sgstsdca:          form.Sgstsdca   || null,
            Sgstsdcaamt:       parseFloat(form.Sgstsdcaamt)  || 0,
            Igstsdca:          form.Igstsdca   || null,
            Igstsdcaamt:       parseFloat(form.Igstsdcaamt)  || 0,
            IsGstApplicable:   form.IsGstApplicable || null,
            IsTCSApplicable:   form.IsTCSApplicable || null,
            TCSDCA:            form.IsTCSApplicable === 'Yes' ? form.TCSDCA   : null,
            TCSSDCA:           form.IsTCSApplicable === 'Yes' ? form.TCSSDCA  : null,
            TCSAmount:         form.IsTCSApplicable === 'Yes' ? (parseFloat(form.TCSAmount) || 0) : 0,
        }));
    };

    // ── Derived option lists ──────────────────────────────────────────────────
    const ccOptions         = costCenters.map(c => ({ value: c.CC_Code || c.CCCode, label: c.CC_Name || c.CCName }));
    const clientOptions     = clients.map(c => ({ value: c.ClientCode || c.Clientcode, label: c.ClientName || c.Clientname }));
    const subClientOptions  = subClients.map(c => ({
        value: c.SubClientCode?.split(',')[0]?.trim() || c.SubClientcode || c.SubClientCode,
        label: c.SubClientCode || c.SubClientcode,
    }));
    const requestOptions    = requestNumbers.map(r => ({ value: r.RequestId, label: r.RequestNumber }));
    const clientGSTOptions  = clientGSTNos.map(g => ({ value: g.TaxNoName, label: g.TaxNoName, taxId: g.TaxNoID }));
    const companyGSTOptions = companyGSTNos.map(g => ({ value: g.GSTNo || g.TaxNoName, label: g.TaxNoName }));

    const bvNum       = parseFloat(basicValue) || 0;
    const total       = calcTotal(bvNum, form);
    const isBusy      = saveLoading;
    const gstDetected = form.ClientGST && form.CompanyGST;
    const canSubmit   = form.CCCode && form.Clientcode && form.SubClientcode && form.RequestId && bvNum > 0;

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
                                <Recycle className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Client Scrap Sale Invoice'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Create scrap sale invoice with GST and TCS details</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / Scrap Sale</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Section 1: Invoice Setup ─────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={ReceiptText} title="Invoice Setup" subtitle="Select invoice type, cost center and RANO" action={
                        <button onClick={handleReset} disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    } />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label required>Invoice Type</Label>
                                <div className="relative">
                                    <select
                                        value={form.InvoiceSubType}
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
                            <div>
                                <Label required>Cost Center</Label>
                                <div className="relative">
                                    <select
                                        value={form.CCCode}
                                        onChange={e => handleCCChange(e.target.value)}
                                        disabled={!form.InvoiceSubType || ccLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">
                                            {!form.InvoiceSubType ? 'Select type first' : ccLoading ? 'Loading…' : '— Select CC —'}
                                        </option>
                                        {ccOptions.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={ccLoading} />
                                </div>
                            </div>
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

                {/* ── Section 2: Client & Request ──────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Users} title="Client & Request Details" subtitle="Select client, sub-client and scrap sale request" />
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label required>Client</Label>
                                <div className="relative">
                                    <select
                                        value={form.Clientcode}
                                        onChange={e => handleClientChange(e.target.value)}
                                        disabled={!form.CCCode || clientsLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">{!form.CCCode ? 'Select CC first' : clientsLoading ? 'Loading…' : '— Select Client —'}</option>
                                        {clientOptions.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={clientsLoading} />
                                </div>
                            </div>
                            <div>
                                <Label required>Sub Client</Label>
                                <div className="relative">
                                    <select
                                        value={form.SubClientcode}
                                        onChange={e => handleSubClientChange(e.target.value)}
                                        disabled={!form.Clientcode || subCliLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">{!form.Clientcode ? 'Select client first' : subCliLoading ? 'Loading…' : '— Select Sub Client —'}</option>
                                        {subClientOptions.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={subCliLoading} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label required>Request Number</Label>
                                <div className="relative">
                                    <select
                                        value={form.RequestId}
                                        onChange={e => handleRequestChange(e.target.value)}
                                        disabled={!form.SubClientcode || reqNosLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">{!form.SubClientcode ? 'Select sub-client first' : reqNosLoading ? 'Loading…' : '— Select Request —'}</option>
                                        {requestOptions.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={reqNosLoading} />
                                </div>
                            </div>

                            {/* Basic Value — pre-filled from request, editable */}
                            <div>
                                <Label required>Basic Value</Label>
                                <div className="relative">
                                    {reqDetailsLoading ? (
                                        <div className={`${inputCls} flex items-center gap-2 text-gray-400`}>
                                            <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                                            <span>Loading…</span>
                                        </div>
                                    ) : (
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={basicValue}
                                            onChange={e => setBasicValue(e.target.value)}
                                            disabled={isBusy}
                                            className={inputCls}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 3: Invoice Details ───────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={FileSearch} title="Invoice Details" subtitle="Invoice number and dates" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <div>
                                <Label required>Invoice Date</Label>
                                <CustomDatePicker
                                    value={form.InvoiceDate}
                                    onChange={val => setForm(p => ({ ...p, InvoiceDate: val }))}
                                    placeholder="Select invoice date"
                                    disabled={isBusy}
                                />
                            </div>
                            <div>
                                <Label required>Invoice Making Date</Label>
                                <CustomDatePicker
                                    value={form.InvoiceMakingDate}
                                    onChange={val => setForm(p => ({ ...p, InvoiceMakingDate: val }))}
                                    placeholder="Select making date"
                                    disabled={isBusy}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 4: GST Configuration ────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={ShieldCheck} title="GST Configuration" subtitle="GST applicability and tax numbers" />
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="max-w-xs">
                            <Label required>GST Applicable?</Label>
                            <YesNoToggle value={form.IsGstApplicable} onChange={v => setForm(p => ({ ...p, IsGstApplicable: v }))} />
                        </div>

                        {form.IsGstApplicable === 'Yes' && (
                            <div className="space-y-6">
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
                                                    <option key={g.value} value={g.value}>{g.label}</option>
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
                                                {companyGSTOptions.map(g => (
                                                    <option key={g.value} value={g.value}>{g.label}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={gstLoading} />
                                        </div>
                                    </div>
                                </div>

                                {gstDetected && (
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                        form.Statecheck
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                    }`}>
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        {form.Statecheck ? 'Same State — CGST + SGST applicable' : 'Inter-State — IGST applicable'}
                                    </div>
                                )}

                                {form.Statecheck && gstDetected && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label>CGST Amount</Label>
                                            <input type="number" min="0" placeholder="0.00"
                                                value={form.Cgstsdcaamt}
                                                onChange={e => setForm(p => ({ ...p, Cgstsdcaamt: e.target.value }))}
                                                disabled={isBusy} className={inputCls} />
                                        </div>
                                        <div>
                                            <Label>SGST Amount</Label>
                                            <input type="number" min="0" placeholder="0.00"
                                                value={form.Sgstsdcaamt}
                                                onChange={e => setForm(p => ({ ...p, Sgstsdcaamt: e.target.value }))}
                                                disabled={isBusy} className={inputCls} />
                                        </div>
                                    </div>
                                )}

                                {!form.Statecheck && gstDetected && (
                                    <div className="max-w-sm">
                                        <Label>IGST Amount</Label>
                                        <input type="number" min="0" placeholder="0.00"
                                            value={form.Igstsdcaamt}
                                            onChange={e => setForm(p => ({ ...p, Igstsdcaamt: e.target.value }))}
                                            disabled={isBusy} className={inputCls} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section 5: TCS Configuration ────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Percent} title="TCS Configuration" subtitle="TCS applicability and amount" />
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="max-w-xs">
                            <Label required>TCS Applicable?</Label>
                            <YesNoToggle value={form.IsTCSApplicable} onChange={v => setForm(p => ({ ...p, IsTCSApplicable: v }))} />
                        </div>

                        {form.IsTCSApplicable === 'Yes' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <Label>TCS DCA</Label>
                                    <input type="text" value={form.TCSDCA}
                                        onChange={e => setForm(p => ({ ...p, TCSDCA: e.target.value }))}
                                        disabled={isBusy} className={inputCls} />
                                </div>
                                <div>
                                    <Label>TCS SDCA</Label>
                                    <input type="text" value={form.TCSSDCA}
                                        onChange={e => setForm(p => ({ ...p, TCSSDCA: e.target.value }))}
                                        disabled={isBusy} className={inputCls} />
                                </div>
                                <div>
                                    <Label>TCS Amount</Label>
                                    <input type="number" min="0" placeholder="0.00" value={form.TCSAmount}
                                        onChange={e => setForm(p => ({ ...p, TCSAmount: e.target.value }))}
                                        disabled={isBusy} className={inputCls} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section 6: Remarks ───────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={ReceiptText} title="Remarks" subtitle="Additional notes for this invoice" />
                    <div className="p-6 md:p-8">
                        <textarea
                            rows={3}
                            placeholder="Enter remarks or additional notes…"
                            value={form.InvoiceRemarks}
                            onChange={e => setForm(p => ({ ...p, InvoiceRemarks: e.target.value }))}
                            disabled={isBusy}
                            className={`${inputCls} resize-none`}
                        />
                    </div>
                </div>

                {/* ── Section 7: Summary ───────────────────────────────────── */}
                {canSubmit && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={CheckCircle} title="Invoice Summary" subtitle="Review before submission" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Invoice Type</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{form.InvoiceSubType || '—'}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Request No.</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{form.RequestNumber || '—'}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Basic Value</p>
                                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">₹ {fmt(bvNum)}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">GST / TCS</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                        {form.IsGstApplicable === 'Yes'
                                            ? form.Statecheck ? 'CGST+SGST' : 'IGST'
                                            : 'Nil'}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 max-w-sm ml-auto">
                                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    <span>Basic Value</span>
                                    <span className="font-semibold">₹ {fmt(bvNum)}</span>
                                </div>
                                {form.IsGstApplicable === 'Yes' && form.Statecheck && (
                                    <>
                                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            <span>CGST</span><span>₹ {fmt(form.Cgstsdcaamt)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            <span>SGST</span><span>₹ {fmt(form.Sgstsdcaamt)}</span>
                                        </div>
                                    </>
                                )}
                                {form.IsGstApplicable === 'Yes' && !form.Statecheck && (
                                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        <span>IGST</span><span>₹ {fmt(form.Igstsdcaamt)}</span>
                                    </div>
                                )}
                                {form.IsTCSApplicable === 'Yes' && (
                                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        <span>TCS</span><span>₹ {fmt(form.TCSAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
                                    <span className="text-base font-bold text-gray-800 dark:text-gray-100">Total Invoice Value</span>
                                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹ {fmt(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Action Buttons ───────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pb-8">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isBusy}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <RotateCcw className="h-4 w-4" /> Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isBusy}
                        className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:via-purple-700 hover:to-violet-700 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saveLoading
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                            : <><Send className="h-4 w-4" /> Submit Invoice</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ClientScrapSaleInvoiceCreation;
