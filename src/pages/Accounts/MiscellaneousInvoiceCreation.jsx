import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchMiscCostCenters, fetchMiscClients, fetchMiscSubClients,
    fetchMiscDCA, fetchMiscSubDCA,
    fetchMiscDedCC, fetchMiscDedDCA, fetchMiscDedSubDCA,
    submitMiscInvoice,
    clearMiscSubClients, clearMiscDCA, clearMiscSubDCA,
    clearMiscDedCC, clearMiscDedDCA, clearMiscDedSubDCA,
    clearMiscSaveResult, resetMiscInvoice,
    selectMiscCostCenters, selectMiscClients, selectMiscSubClients,
    selectMiscMainDCA, selectMiscSubDCA,
    selectMiscDedCostCenters, selectMiscDedDCA, selectMiscDedSubDCA,
    selectMiscSaveResult,
    selectMiscCCLoading, selectMiscClientsLoading, selectMiscSubClientsLoading,
    selectMiscDCALoading, selectMiscSubDCALoading,
    selectMiscDedCCLoading, selectMiscDedDCALoading, selectMiscDedSubDCALoading,
    selectMiscSaveLoading, selectMiscSaveError,
} from '../../slices/accountsSlice/miscInvoiceCreationSlice';

import {
    FileText, Building2, Users, CreditCard, Minus,
    RotateCcw, Send, Loader2, ChevronDown, Navigation, Percent,
} from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────
const INTEREST_TYPES = {
    CLIENT: 'Intrest From Clients',
    OTHERS: 'Interest From Others',
};

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

// Backend field-shape for these 3 endpoints (GetAllCostCenters / GetAllMiscClients /
// GetMiscSubclient) wasn't specified with a sample response, so pick() tries the
// common key spellings used elsewhere in this codebase before falling back.
const pick = (obj, keys, fallback = '') => {
    for (const k of keys) {
        const v = obj?.[k];
        if (v !== undefined && v !== null && v !== '') return v;
    }
    return fallback;
};

// ── UI Primitives ─────────────────────────────────────────────────────────────
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

const CardHeader = ({ icon: Icon, title, subtitle, right }) => (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-gray-900/40 rounded-t-2xl">
        <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-indigo-500" />
            <div>
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
            </div>
        </div>
        {right}
    </div>
);

// ── Initial state ─────────────────────────────────────────────────────────────
const INITIAL_FORM = {
    Date:         '',
    InterestType: '',
    ClientId:     '',
    ClientName:   '',
    SubClientId:  '',
    SubClientName:'',
    CostCenter:   '',
    DCACode:      '',
    SubDCACode:   '',
    Amount:       '',
    DedEnabled:   false,
    DedCC:        '',
    DedDCA:       '',
    DedSubDCA:    '',
    DedAmount:    '',
    Name:         '',
    Remarks:      '',
};

// ── Component ─────────────────────────────────────────────────────────────────
const MiscellaneousInvoiceCreation = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userName = userData?.userName || userData?.UserName || 'system';

    // Redux state
    const costCenters   = useSelector(selectMiscCostCenters);
    const clients        = useSelector(selectMiscClients);
    const subClients      = useSelector(selectMiscSubClients);
    const mainDCA         = useSelector(selectMiscMainDCA);
    const subDCA           = useSelector(selectMiscSubDCA);
    const dedCostCenters  = useSelector(selectMiscDedCostCenters);
    const dedDCA           = useSelector(selectMiscDedDCA);
    const dedSubDCA        = useSelector(selectMiscDedSubDCA);
    const saveResult      = useSelector(selectMiscSaveResult);

    const ccLoading        = useSelector(selectMiscCCLoading);
    const clientsLoading   = useSelector(selectMiscClientsLoading);
    const subClientsLoading= useSelector(selectMiscSubClientsLoading);
    const dcaLoading       = useSelector(selectMiscDCALoading);
    const subDcaLoading    = useSelector(selectMiscSubDCALoading);
    const dedCCLoading     = useSelector(selectMiscDedCCLoading);
    const dedDcaLoading    = useSelector(selectMiscDedDCALoading);
    const dedSubDcaLoading = useSelector(selectMiscDedSubDCALoading);
    const saveLoading      = useSelector(selectMiscSaveLoading);
    const saveError        = useSelector(selectMiscSaveError);

    // Local state
    const [form, setForm] = useState(INITIAL_FORM);

    // Computed
    const isClientFlow = form.InterestType === INTEREST_TYPES.CLIENT;
    const interestAmt  = parseFloat(form.Amount) || 0;
    const dedAmt        = parseFloat(form.DedAmount) || 0;
    const finalAmt      = Math.max(0, interestAmt - (form.DedEnabled ? dedAmt : 0));
    const isBusy         = saveLoading;

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchMiscCostCenters());
        return () => { dispatch(resetMiscInvoice()); };
    }, [dispatch]);

    // Fetch DCA when CC + date both set
    useEffect(() => {
        if (form.CostCenter && form.Date) {
            dispatch(fetchMiscDCA({ ccCode: form.CostCenter, invdate: formatDateForAPI(form.Date) }));
        }
    }, [form.CostCenter, form.Date]);

    // Fetch SubDCA when DCA selected
    useEffect(() => {
        if (form.DCACode) {
            dispatch(fetchMiscSubDCA(form.DCACode));
        } else {
            dispatch(clearMiscSubDCA());
        }
    }, [form.DCACode]);

    // Fetch deduction DCA when Ded CC + date set
    useEffect(() => {
        if (form.DedEnabled && form.DedCC && form.Date) {
            dispatch(fetchMiscDedDCA({ ccCode: form.DedCC, invdate: formatDateForAPI(form.Date) }));
        } else {
            dispatch(clearMiscDedDCA());
        }
    }, [form.DedEnabled, form.DedCC, form.Date]);

    // Fetch Ded SubDCA when Ded DCA selected
    useEffect(() => {
        if (form.DedDCA) {
            dispatch(fetchMiscDedSubDCA(form.DedDCA));
        } else {
            dispatch(clearMiscDedSubDCA());
        }
    }, [form.DedDCA]);

    // Handle save result
    useEffect(() => {
        if (!saveResult) return;
        const raw = typeof saveResult === 'string' ? saveResult : (saveResult?.Message || '');
        const msg = raw.split('$')[0];
        if (msg && msg.toLowerCase().includes('success')) {
            toast.success('Miscellaneous invoice submitted successfully!');
            handleReset();
        } else if (msg) {
            toast.error(msg);
        }
        dispatch(clearMiscSaveResult());
    }, [saveResult]);

    useEffect(() => {
        if (saveError) toast.error(saveError);
    }, [saveError]);

    // ── Cascade Handlers ──────────────────────────────────────────────────────
    const handleInterestTypeChange = (val) => {
        setForm(p => ({
            ...INITIAL_FORM,
            Date: p.Date,
            CostCenter: p.CostCenter,
            InterestType: val,
        }));
        dispatch(clearMiscSubClients());
        dispatch(clearMiscDedCC());
        if (val === INTEREST_TYPES.CLIENT && clients.length === 0) {
            dispatch(fetchMiscClients());
        }
    };

    const handleClientChange = (clientId, clientName) => {
        setForm(p => ({
            ...p, ClientId: clientId, ClientName: clientName,
            SubClientId: '', SubClientName: '',
            Name: clientName || p.Name,
        }));
        dispatch(clearMiscSubClients());
        if (clientId) dispatch(fetchMiscSubClients(clientId));
    };

    const handleSubClientChange = (subClientId, subClientName) => {
        setForm(p => ({ ...p, SubClientId: subClientId, SubClientName: subClientName }));
    };

    const handleCCChange = (val) => {
        setForm(p => ({ ...p, CostCenter: val, DCACode: '', SubDCACode: '' }));
        dispatch(clearMiscDCA());
    };

    const handleDCAChange = (val) => {
        setForm(p => ({ ...p, DCACode: val, SubDCACode: '' }));
    };

    const toggleDeduction = () => {
        setForm(p => {
            const enabled = !p.DedEnabled;
            return {
                ...p, DedEnabled: enabled,
                DedCC: '', DedDCA: '', DedSubDCA: '', DedAmount: '',
            };
        });
        dispatch(clearMiscDedCC());
        if (!form.DedEnabled && form.InterestType) {
            dispatch(fetchMiscDedCC(form.InterestType));
        }
    };

    const handleDedCCChange = (val) => {
        setForm(p => ({ ...p, DedCC: val, DedDCA: '', DedSubDCA: '' }));
    };

    const handleDedDCAChange = (val) => {
        setForm(p => ({ ...p, DedDCA: val, DedSubDCA: '' }));
    };

    // ── Reset ─────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setForm(INITIAL_FORM);
        dispatch(clearMiscDCA());
        dispatch(clearMiscSubClients());
        dispatch(clearMiscDedCC());
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!form.Date)          { toast.warn('Select Date');                      return; }
        if (!form.InterestType)  { toast.warn('Select Interest Type');             return; }
        if (isClientFlow && !form.ClientId)    { toast.warn('Select Client');       return; }
        if (isClientFlow && !form.SubClientId) { toast.warn('Select Sub Client');   return; }
        if (!form.CostCenter)    { toast.warn('Select Cost Center');               return; }
        if (!form.DCACode)       { toast.warn('Select DCA');                       return; }
        if (!form.SubDCACode)    { toast.warn('Select Sub DCA');                   return; }
        if (!form.Amount || interestAmt <= 0) { toast.warn('Enter a valid Amount'); return; }
        if (form.DedEnabled) {
            if (!form.DedCC)      { toast.warn('Select Deduction Cost Center'); return; }
            if (!form.DedDCA)     { toast.warn('Select Deduction DCA');         return; }
            if (!form.DedSubDCA)  { toast.warn('Select Deduction Sub DCA');     return; }
            if (!form.DedAmount)  { toast.warn('Enter Deduction Amount');       return; }
        }
        if (!form.Name.trim())   { toast.warn('Enter Name');                       return; }

        dispatch(submitMiscInvoice({
            Date:                 formatDateForAPI(form.Date),
            Intrest_type:         form.InterestType,
            clientid:             isClientFlow ? form.ClientId : null,
            Subclient:            isClientFlow ? form.SubClientId : null,
            Misc_CC_Code:         form.CostCenter,
            Misc_DCA_Code:        form.DCACode,
            Misc_Sub_DCA_Code:    form.SubDCACode,
            MiscAmount:           interestAmt,
            MiscDed_CC_Code:      form.DedEnabled ? form.DedCC : null,
            MiscDed_DCA_Code:     form.DedEnabled ? form.DedDCA : null,
            MiscDed_Sub_DCA_Code: form.DedEnabled ? form.DedSubDCA : null,
            MiscDedAmount:        form.DedEnabled ? dedAmt : 0,
            Misc_Name:            form.Name.trim(),
            Remarks:              form.Remarks || null,
            CreatedBy:            userName,
            Misc_final_Amount:    finalAmt,
            RoleID:               roleId,
        }));
    };

    // ── Options ───────────────────────────────────────────────────────────────
    const ccOptions = costCenters.map(c => ({
        value: pick(c, ['CC_Code', 'CcCode', 'CCCode']),
        label: pick(c, ['CC_Name', 'CcName', 'CCName'], pick(c, ['CC_Code', 'CcCode', 'CCCode'])),
    }));
    const clientOptions = clients.map(c => ({
        value: pick(c, ['ClientCode', 'ClientId', 'Clientid']),
        label: pick(c, ['ClientName', 'Name'], pick(c, ['ClientCode', 'ClientId', 'Clientid'])),
    }));
    const subClientOptions = subClients.map(c => ({
        value: pick(c, ['SubClientCode', 'SubClientId', 'Subclientid']),
        label: pick(c, ['SubClientName', 'Name'], pick(c, ['SubClientCode', 'SubClientId', 'Subclientid'])),
    }));
    const dcaOptions       = mainDCA.map(d => ({ value: d.DCACode, label: d.DCAIDSTR }));
    const subDcaOptions     = subDCA.map(d => ({ value: d.SubDCACode, label: d.SubDCAIDSTR }));
    const dedCCOptions     = dedCostCenters.map(c => ({ value: c.CC_Id, label: c.CC_Code }));
    const dedDcaOptions     = dedDCA.map(d => ({ value: d.DCACode, label: d.DCAIDSTR }));
    const dedSubDcaOptions  = dedSubDCA.map(d => ({ value: d.SubDCACode, label: d.SubDCAIDSTR }));

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* Page Header */}
            <div className="max-w-5xl mx-auto mb-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 shadow-xl shadow-indigo-500/20 p-7 text-white">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/4 opacity-20 blur-3xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-lg border border-white/20">
                                <Percent className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Miscellaneous Taxable Invoice'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Record interest income from clients or other parties</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / Miscellaneous</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">

                {/* ── Section 1: Date & Interest Type ───────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={FileText} title="Invoice Setup" subtitle="Date and interest type"
                        right={
                            <button onClick={handleReset} disabled={isBusy}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                        }
                    />
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date */}
                            <div>
                                <Label required>Date</Label>
                                <CustomDatePicker
                                    value={form.Date}
                                    onChange={val => setForm(p => ({ ...p, Date: val }))}
                                    disabled={isBusy}
                                    placeholder="Select date"
                                />
                            </div>
                        </div>

                        {/* Interest Type */}
                        <div>
                            <Label required>Interest Type</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                                {[
                                    { value: INTEREST_TYPES.CLIENT, label: 'Interest from Client' },
                                    { value: INTEREST_TYPES.OTHERS, label: 'Interest from Others' },
                                ].map(opt => (
                                    <button key={opt.value} type="button" disabled={isBusy}
                                        onClick={() => handleInterestTypeChange(opt.value)}
                                        className={`py-3 px-4 rounded-xl text-sm font-semibold border-2 text-left transition-all disabled:opacity-50 ${
                                            form.InterestType === opt.value
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-indigo-300'
                                        }`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Client / Sub Client (Client flow only) ─────── */}
                {isClientFlow && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={Users} title="Client Details" subtitle="Client and sub-client selection" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Client */}
                                <div>
                                    <Label required>Client</Label>
                                    <div className="relative">
                                        <select value={form.ClientId}
                                            onChange={e => {
                                                const opt = clientOptions.find(c => c.value === e.target.value);
                                                handleClientChange(e.target.value, opt?.label || '');
                                            }}
                                            disabled={clientsLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{clientsLoading ? 'Loading…' : '— Select Client —'}</option>
                                            {clientOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                        <SelectIcon loading={clientsLoading} />
                                    </div>
                                </div>

                                {/* Sub Client */}
                                <div>
                                    <Label required>Sub Client</Label>
                                    <div className="relative">
                                        <select value={form.SubClientId}
                                            onChange={e => {
                                                const opt = subClientOptions.find(c => c.value === e.target.value);
                                                handleSubClientChange(e.target.value, opt?.label || '');
                                            }}
                                            disabled={!form.ClientId || subClientsLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">
                                                {!form.ClientId ? 'Select client first' : subClientsLoading ? 'Loading…' : '— Select Sub Client —'}
                                            </option>
                                            {subClientOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                        <SelectIcon loading={subClientsLoading} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Section 3: Cost Center / DCA / Amount ─────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Building2} title="Account Head" subtitle="Cost center, DCA account heads and interest amount" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                            {/* Cost Center */}
                            <div>
                                <Label required>Cost Center</Label>
                                <div className="relative">
                                    <select value={form.CostCenter} onChange={e => handleCCChange(e.target.value)}
                                        disabled={ccLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">{ccLoading ? 'Loading…' : '— Select CC —'}</option>
                                        {ccOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    <SelectIcon loading={ccLoading} />
                                </div>
                            </div>

                            {/* DCA */}
                            <div>
                                <Label required>DCA</Label>
                                <div className="relative">
                                    <select value={form.DCACode} onChange={e => handleDCAChange(e.target.value)}
                                        disabled={!form.CostCenter || !form.Date || dcaLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">
                                            {!form.CostCenter || !form.Date ? 'Select CC & date first'
                                            : dcaLoading ? 'Loading…' : '— Select DCA —'}
                                        </option>
                                        {dcaOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                    </select>
                                    <SelectIcon loading={dcaLoading} />
                                </div>
                            </div>

                            {/* Sub DCA */}
                            <div>
                                <Label required>Sub DCA</Label>
                                <div className="relative">
                                    <select value={form.SubDCACode} onChange={e => setForm(p => ({ ...p, SubDCACode: e.target.value }))}
                                        disabled={!form.DCACode || subDcaLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">
                                            {!form.DCACode ? 'Select DCA first' : subDcaLoading ? 'Loading…' : '— Select Sub DCA —'}
                                        </option>
                                        {subDcaOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                    </select>
                                    <SelectIcon loading={subDcaLoading} />
                                </div>
                            </div>

                            {/* Interest Amount */}
                            <div>
                                <Label required>Amount (₹)</Label>
                                <input type="number" min="0" step="0.01" placeholder="0.00"
                                    value={form.Amount}
                                    onChange={e => setForm(p => ({ ...p, Amount: e.target.value }))}
                                    disabled={isBusy} className={inputCls} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 4: Add Deduction (optional) ───────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Minus} title="Deduction" subtitle="Optional deduction against this interest entry"
                        right={
                            <button type="button" onClick={toggleDeduction} disabled={!form.InterestType || isBusy}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                                    form.DedEnabled
                                        ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700 text-rose-600 dark:text-rose-400'
                                        : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                                }`}>
                                {form.DedEnabled ? '− Remove Deduction' : '+ Add Deduction'}
                            </button>
                        }
                    />
                    {form.DedEnabled && (
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                                {/* Ded CC */}
                                <div>
                                    <Label>Deduction Cost Center</Label>
                                    <div className="relative">
                                        <select value={form.DedCC} onChange={e => handleDedCCChange(e.target.value)}
                                            disabled={dedCCLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{dedCCLoading ? 'Loading…' : '— Select CC —'}</option>
                                            {dedCCOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                        <SelectIcon loading={dedCCLoading} />
                                    </div>
                                </div>

                                {/* Ded DCA */}
                                <div>
                                    <Label>Deduction DCA</Label>
                                    <div className="relative">
                                        <select value={form.DedDCA} onChange={e => handleDedDCAChange(e.target.value)}
                                            disabled={!form.DedCC || dedDcaLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{!form.DedCC ? 'Select CC first' : dedDcaLoading ? 'Loading…' : '— Select DCA —'}</option>
                                            {dedDcaOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                        </select>
                                        <SelectIcon loading={dedDcaLoading} />
                                    </div>
                                </div>

                                {/* Ded Sub DCA */}
                                <div>
                                    <Label>Deduction Sub DCA</Label>
                                    <div className="relative">
                                        <select value={form.DedSubDCA} onChange={e => setForm(p => ({ ...p, DedSubDCA: e.target.value }))}
                                            disabled={!form.DedDCA || dedSubDcaLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{!form.DedDCA ? 'Select DCA first' : dedSubDcaLoading ? 'Loading…' : '— Select Sub DCA —'}</option>
                                            {dedSubDcaOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                        </select>
                                        <SelectIcon loading={dedSubDcaLoading} />
                                    </div>
                                </div>

                                {/* Ded Amount */}
                                <div>
                                    <Label>Deduction Amount (₹)</Label>
                                    <input type="number" min="0" step="0.01" placeholder="0.00"
                                        value={form.DedAmount}
                                        onChange={e => setForm(p => ({ ...p, DedAmount: e.target.value }))}
                                        disabled={isBusy} className={inputCls} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Section 5: Summary & Submit ───────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={CreditCard} title="Summary" subtitle="Name, final amount and remarks" />
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label required>Name</Label>
                                <input type="text" placeholder={isClientFlow ? 'Auto-filled from client, editable…' : 'Enter name…'}
                                    value={form.Name}
                                    onChange={e => setForm(p => ({ ...p, Name: e.target.value }))}
                                    disabled={isBusy} className={inputCls} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">Amount (After Deduction)</p>
                                <div className="px-3.5 py-2.5 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
                                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹ {fmt(finalAmt)}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>Remarks</Label>
                            <textarea rows={3} placeholder="Enter remarks…"
                                value={form.Remarks}
                                onChange={e => setForm(p => ({ ...p, Remarks: e.target.value }))}
                                disabled={isBusy}
                                className={`${inputCls} resize-none`} />
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={handleSubmit} disabled={isBusy}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/30 disabled:opacity-60 transition-all">
                                {isBusy
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                    : <><Send className="h-4 w-4" /> Submit Invoice</>}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MiscellaneousInvoiceCreation;
