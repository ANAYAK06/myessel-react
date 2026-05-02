import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    FileText, Users, Building2, Receipt, ChevronDown, Loader2,
    RotateCcw, Send, CheckCircle, Navigation, Info, IndianRupee,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchNoteClients, fetchNoteVendors, fetchNoteVendorCC, fetchNoteSubClients,
    fetchNoteClientInvoices, fetchNoteVendorInvoices,
    fetchNoteClientInvoiceDetails, fetchNoteVendorInvoiceDetails,
    fetchReasons, fetchClientReasonDCA, fetchVendorReasonDCA,
    fetchClientReasonSDCA, fetchVendorReasonSDCA, submitCreditDebitNote,
    clearVendorCC, clearSubClients, clearClientInvoices, clearVendorInvoices,
    clearInvDetails, clearReasons, clearClientSDCAs, clearVendorSDCAs,
    clearSaveResult, resetCreditDebitNote,
    selectNoteClients, selectNoteClientsLoading,
    selectNoteVendors, selectNoteVendorsLoading,
    selectNoteVendorCCs, selectNoteVendorCCsLoading,
    selectNoteSubClients, selectNoteSubClientsLoading,
    selectNoteClientInvoices, selectNoteClientInvoicesLoading,
    selectNoteVendorInvoices, selectNoteVendorInvoicesLoading,
    selectClientInvDetails, selectClientInvDetailsLoading,
    selectVendorInvDetails, selectVendorInvDetailsLoading,
    selectNoteReasons, selectNoteReasonsLoading,
    selectClientDCAs, selectClientDCAsLoading,
    selectVendorDCAs, selectVendorDCAsLoading,
    selectClientSDCAs, selectClientSDCAsLoading,
    selectVendorSDCAs, selectVendorSDCAsLoading,
    selectNoteSaveStatus, selectNoteSaveLoading,
    selectNoteSaveError, selectNoteSaveRefNo,
} from '../../slices/purchaseSlice/creditDebitNoteSlice';

// ── Constants ──────────────────────────────────────────────────────────────────

const NOTE_TYPES    = ['Credit Note', 'Debit Note'];
const NOTE_FORS     = ['Client', 'Vendor'];
const PAYMENT_TYPES = ['Basic Invoice', 'Retention', 'Hold'];

// ── Reason section visibility logic ───────────────────────────────────────────
//
//  Credit Note + Client  → Show reason. Reason=3 → DCA+SDCA. Reason=4 → PaymentFor only.
//  Debit  Note + Client  → No reason section at all.
//  Credit Note + Vendor  → Show reason. Reason=1 → DCA+SDCA. Reason=2 → nothing extra.
//  Debit  Note + Vendor  → Show reason. Reason=5 → DCA+SDCA+PaymentFor. Reason=6 → PaymentFor only.

const needsReasonSection = (noteType, noteFor) =>
    !(noteType === 'Debit Note' && noteFor === 'Client');

const needsDCA = (noteType, noteFor, reasonId) => {
    if (noteType === 'Credit Note' && noteFor === 'Client' && reasonId === '3') return true;
    if (noteType === 'Credit Note' && noteFor === 'Vendor' && reasonId === '1') return true;
    if (noteType === 'Debit Note'  && noteFor === 'Vendor' && reasonId === '5') return true;
    return false;
};

const needsPaymentFor = (noteType, noteFor, reasonId) => {
    if (noteType === 'Credit Note' && noteFor === 'Client' && reasonId === '4') return true;
    if (noteType === 'Debit Note'  && noteFor === 'Vendor' && (reasonId === '5' || reasonId === '6')) return true;
    return false;
};

// ── Shared UI (matches ClientInvoiceCreation) ─────────────────────────────────

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

const ChipGroup = ({ options, value, onChange, colorActive = 'indigo' }) => {
    const colors = {
        indigo: 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30',
        violet: 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900/30',
    };
    return (
        <div className="flex gap-3">
            {options.map((opt) => (
                <button key={opt} type="button" onClick={() => onChange(opt)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        value === opt
                            ? colors[colorActive]
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}>
                    {opt}
                </button>
            ))}
        </div>
    );
};

const InvoiceDetailCard = ({ data, isClient }) => {
    if (!data) return null;
    const items = isClient
        ? [
            { l: 'PO Number',    v: data.CPONO },
            { l: 'CC Code',      v: data.CCCCode },
            { l: 'RA Number',    v: data.CRANo },
            { l: 'Invoice Date', v: data.CInvDate },
            { l: 'Making Date',  v: data.CInvMakingDate },
            { l: 'Basic Value',  v: data.CBasic   ? `₹ ${parseFloat(data.CBasic).toLocaleString('en-IN',   { minimumFractionDigits: 2 })}` : null },
            { l: 'GST Value',    v: data.GSTValue  ? `₹ ${parseFloat(data.GSTValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : null },
            { l: 'Total Value',  v: data.CTotal    ? `₹ ${parseFloat(data.CTotal).toLocaleString('en-IN',   { minimumFractionDigits: 2 })}` : null },
        ]
        : [
            { l: 'PO Number',    v: data.VPONO },
            { l: 'DCA',          v: data.VDCA },
            { l: 'Sub DCA',      v: data.Vsubdca },
            { l: 'Item Code',    v: data.VItCode },
            { l: 'Invoice Date', v: data.VInvDate },
            { l: 'Making Date',  v: data.VInvMakingDate },
            { l: 'Basic Value',  v: data.VBasic    ? `₹ ${parseFloat(data.VBasic).toLocaleString('en-IN',    { minimumFractionDigits: 2 })}` : null },
            { l: 'GST Value',    v: data.VGstValue  ? `₹ ${parseFloat(data.VGstValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : null },
            { l: 'Total Value',  v: data.VTotal     ? `₹ ${parseFloat(data.VTotal).toLocaleString('en-IN',    { minimumFractionDigits: 2 })}` : null },
        ];

    return (
        <div className="mt-5 bg-indigo-50/60 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <Info className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Original Invoice Details</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {items.filter((i) => i.v).map(({ l, v }) => (
                    <div key={l}>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{l}</p>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{v}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const INIT = {
    noteType: '', noteFor: '',
    // Client
    client: '', clientName: '', subClient: '', subClientName: '',
    clientInvId: '', clientInvNo: '',
    clientReason: '', clientReasonId: '',
    clientReasonDCA: '', clientReasonSDCA: '', clientPaymentFor: '',
    cAmount: '', cCGST: '', cSGST: '', cIGST: '', clientTotal: '',
    // Vendor
    vendor: '', vendorName: '', ccCode: '', ccName: '',
    vendorInvId: '', vendorInvNo: '',
    vendorReason: '', vendorReasonId: '',
    vendorReasonDCA: '', vendorReasonSDCA: '', vendorPaymentFor: '',
    vAmount: '', vCGST: '', vSGST: '', vIGST: '', vendorTotal: '',
    // Common
    date: '', remarks: '',
};

const CreditDebitNote = ({ menuData }) => {
    const dispatch     = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const clients             = useSelector(selectNoteClients);
    const clientsLoading      = useSelector(selectNoteClientsLoading);
    const vendors             = useSelector(selectNoteVendors);
    const vendorsLoading      = useSelector(selectNoteVendorsLoading);
    const vendorCCs           = useSelector(selectNoteVendorCCs);
    const vendorCCsLoading    = useSelector(selectNoteVendorCCsLoading);
    const subClients          = useSelector(selectNoteSubClients);
    const subClientsLoading   = useSelector(selectNoteSubClientsLoading);
    const clientInvoices      = useSelector(selectNoteClientInvoices);
    const clientInvLoading    = useSelector(selectNoteClientInvoicesLoading);
    const vendorInvoices      = useSelector(selectNoteVendorInvoices);
    const vendorInvLoading    = useSelector(selectNoteVendorInvoicesLoading);
    const clientInvDetails    = useSelector(selectClientInvDetails);
    const clientInvDetLoading = useSelector(selectClientInvDetailsLoading);
    const vendorInvDetails    = useSelector(selectVendorInvDetails);
    const vendorInvDetLoading = useSelector(selectVendorInvDetailsLoading);
    const reasons             = useSelector(selectNoteReasons);
    const reasonsLoading      = useSelector(selectNoteReasonsLoading);
    const clientDCAs          = useSelector(selectClientDCAs);
    const clientDCAsLoading   = useSelector(selectClientDCAsLoading);
    const vendorDCAs          = useSelector(selectVendorDCAs);
    const vendorDCAsLoading   = useSelector(selectVendorDCAsLoading);
    const clientSDCAs         = useSelector(selectClientSDCAs);
    const clientSDCAsLoading  = useSelector(selectClientSDCAsLoading);
    const vendorSDCAs         = useSelector(selectVendorSDCAs);
    const vendorSDCAsLoading  = useSelector(selectVendorSDCAsLoading);
    const saveStatus          = useSelector(selectNoteSaveStatus);
    const saveLoading         = useSelector(selectNoteSaveLoading);
    const saveError           = useSelector(selectNoteSaveError);
    const saveRefNo           = useSelector(selectNoteSaveRefNo);

    const [form, setForm] = useState(INIT);
    const [submitted, setSubmitted] = useState(false);

    const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchClientReasonDCA());
        dispatch(fetchVendorReasonDCA());
        return () => { dispatch(resetCreditDebitNote()); };
    }, [dispatch]);

    // ── Auto-fetch reasons whenever noteType + noteFor both set ────────────────
    // Using useEffect instead of calling inside handlers avoids stale-closure
    // problems when the user selects Note For before Note Type (or vice versa).
    useEffect(() => {
        if (form.noteType && form.noteFor && needsReasonSection(form.noteType, form.noteFor)) {
            dispatch(clearReasons());
            dispatch(clearClientSDCAs());
            dispatch(clearVendorSDCAs());
            // API expects "Credit" / "Debit" — not "Credit Note" / "Debit Note"
            const apiNoteType = form.noteType.replace(' Note', '');
            dispatch(fetchReasons({ NoteType: apiNoteType, NoteFor: form.noteFor }));
        }
    }, [form.noteType, form.noteFor, dispatch]);

    // ── Save result ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            setSubmitted(true);
            toast.success('Note submitted successfully!');
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError || 'Failed to save note');
            dispatch(clearSaveResult());
        }
    }, [saveStatus, saveError, dispatch]);

    // ── Auto-compute totals ────────────────────────────────────────────────────
    useEffect(() => {
        const t = (parseFloat(form.cAmount) || 0) + (parseFloat(form.cCGST) || 0)
                + (parseFloat(form.cSGST) || 0)   + (parseFloat(form.cIGST) || 0);
        setForm((p) => ({ ...p, clientTotal: t > 0 ? t.toFixed(2) : '' }));
    }, [form.cAmount, form.cCGST, form.cSGST, form.cIGST]);

    useEffect(() => {
        const t = (parseFloat(form.vAmount) || 0) + (parseFloat(form.vCGST) || 0)
                + (parseFloat(form.vSGST) || 0)   + (parseFloat(form.vIGST) || 0);
        setForm((p) => ({ ...p, vendorTotal: t > 0 ? t.toFixed(2) : '' }));
    }, [form.vAmount, form.vCGST, form.vSGST, form.vIGST]);

    // ── Cascade handlers ───────────────────────────────────────────────────────

    const handleNoteTypeChange = (val) => {
        // Clear downstream reason fields; useEffect will re-fetch reasons
        setForm((p) => ({ ...INIT, noteFor: p.noteFor, noteType: val }));
    };

    const handleNoteForChange = (val) => {
        // Reset all downstream state; useEffect will re-fetch reasons + party list
        setForm((p) => ({ ...INIT, noteType: p.noteType, noteFor: val }));
        dispatch(clearSubClients()); dispatch(clearVendorCC());
        dispatch(clearClientInvoices()); dispatch(clearVendorInvoices());
        dispatch(clearInvDetails());

        if (val === 'Client') dispatch(fetchNoteClients());
        if (val === 'Vendor') dispatch(fetchNoteVendors());
    };

    // Client cascade
    const handleClientChange = (clientId, clientName) => {
        setForm((p) => ({ ...p, client: clientId, clientName, subClient: '', subClientName: '',
            clientInvId: '', clientInvNo: '', cAmount: '', cCGST: '', cSGST: '', cIGST: '', clientTotal: '' }));
        dispatch(clearSubClients()); dispatch(clearClientInvoices()); dispatch(clearInvDetails());
        if (clientId) dispatch(fetchNoteSubClients({ Clientcode: clientId }));
    };

    const handleSubClientChange = (subId, subName) => {
        setForm((p) => ({ ...p, subClient: subId, subClientName: subName,
            clientInvId: '', clientInvNo: '', cAmount: '', cCGST: '', cSGST: '', cIGST: '', clientTotal: '' }));
        dispatch(clearClientInvoices()); dispatch(clearInvDetails());
        if (form.client && subId) dispatch(fetchNoteClientInvoices({ Clientcode: form.client, SubClientcode: subId }));
    };

    const handleClientInvoiceChange = (invId, invNo) => {
        setForm((p) => ({ ...p, clientInvId: invId, clientInvNo: invNo }));
        dispatch(clearInvDetails());
        if (invId) dispatch(fetchNoteClientInvoiceDetails({ Invid: invId }));
    };

    // Vendor cascade
    const handleVendorChange = (vendorId, vendorName) => {
        setForm((p) => ({ ...p, vendor: vendorId, vendorName, ccCode: '', ccName: '',
            vendorInvId: '', vendorInvNo: '', vAmount: '', vCGST: '', vSGST: '', vIGST: '', vendorTotal: '' }));
        dispatch(clearVendorCC()); dispatch(clearVendorInvoices()); dispatch(clearInvDetails());
        if (vendorId) dispatch(fetchNoteVendorCC({ VendorCode: vendorId }));
    };

    const handleCCChange = (ccId, ccName) => {
        setForm((p) => ({ ...p, ccCode: ccId, ccName,
            vendorInvId: '', vendorInvNo: '', vAmount: '', vCGST: '', vSGST: '', vIGST: '', vendorTotal: '' }));
        dispatch(clearVendorInvoices()); dispatch(clearInvDetails());
        if (form.vendor && ccId) dispatch(fetchNoteVendorInvoices({ Vendorcode: form.vendor, CCcode: ccId }));
    };

    const handleVendorInvoiceChange = (invId, invNo) => {
        setForm((p) => ({ ...p, vendorInvId: invId, vendorInvNo: invNo }));
        dispatch(clearInvDetails());
        if (invId) dispatch(fetchNoteVendorInvoiceDetails({ Invid: invId }));
    };

    // Reason selection — resets downstream DCA/SDCA/PaymentFor when reason changes
    const handleClientReasonChange = (reasonId, reasonName) => {
        setForm((p) => ({ ...p,
            clientReasonId: reasonId, clientReason: reasonId,
            clientReasonDCA: '', clientReasonSDCA: '', clientPaymentFor: '',
        }));
        dispatch(clearClientSDCAs());
    };

    const handleVendorReasonChange = (reasonId, reasonName) => {
        setForm((p) => ({ ...p,
            vendorReasonId: reasonId, vendorReason: reasonId,
            vendorReasonDCA: '', vendorReasonSDCA: '', vendorPaymentFor: '',
        }));
        dispatch(clearVendorSDCAs());
    };

    // DCA → SDCA cascade
    const handleClientDCAChange = (dca) => {
        setForm((p) => ({ ...p, clientReasonDCA: dca, clientReasonSDCA: '' }));
        dispatch(clearClientSDCAs());
        if (dca) dispatch(fetchClientReasonSDCA({ ClientReasonDCA: dca }));
    };

    const handleVendorDCAChange = (dca) => {
        setForm((p) => ({ ...p, vendorReasonDCA: dca, vendorReasonSDCA: '' }));
        dispatch(clearVendorSDCAs());
        if (dca) dispatch(fetchVendorReasonSDCA({ VendorReasonDCA: dca }));
    };

    // ── Derived visibility flags ───────────────────────────────────────────────

    const showReasonSection = needsReasonSection(form.noteType, form.noteFor);
    const showClientDCA     = needsDCA(form.noteType, form.noteFor, form.clientReasonId);
    const showVendorDCA     = needsDCA(form.noteType, form.noteFor, form.vendorReasonId);
    const showClientPayFor  = needsPaymentFor(form.noteType, form.noteFor, form.clientReasonId);
    const showVendorPayFor  = needsPaymentFor(form.noteType, form.noteFor, form.vendorReasonId);

    const isClient = form.noteFor === 'Client';
    const isVendor = form.noteFor === 'Vendor';
    const showReasonFields = (isClient || isVendor) && showReasonSection;

    // GST type from original invoice
    const clientGSTCount  = parseInt(clientInvDetails?.GSTCount  || '0', 10);
    const vendorGSTCount  = parseInt(vendorInvDetails?.VGSTCount || '0', 10);
    const showClientCSGST = clientGSTCount !== 1;   // show CGST/SGST if not pure IGST
    const showClientIGST  = clientGSTCount !== 2;   // show IGST if not pure CGST/SGST
    const showVendorCSGST = vendorGSTCount !== 1;
    const showVendorIGST  = vendorGSTCount !== 2;

    // ── Validation ─────────────────────────────────────────────────────────────

    const validate = () => {
        if (!form.noteType) { toast.error('Select Note Type');  return false; }
        if (!form.noteFor)  { toast.error('Select Note For');   return false; }
        if (!form.date)     { toast.error('Select Note Date');  return false; }
        if (!form.remarks.trim()) { toast.error('Remarks required'); return false; }

        if (isClient) {
            if (!form.client)      { toast.error('Select Client');         return false; }
            if (!form.subClient)   { toast.error('Select Sub-Client');     return false; }
            if (!form.clientInvId) { toast.error('Select Client Invoice'); return false; }
            if (showReasonSection && !form.clientReasonId) { toast.error('Select Reason'); return false; }
            if (showClientDCA && !form.clientReasonDCA)    { toast.error('Select Reason DCA'); return false; }
            if (showClientPayFor && !form.clientPaymentFor){ toast.error('Select Payment For'); return false; }
            if (!form.cAmount || parseFloat(form.cAmount) <= 0) { toast.error('Enter valid Basic Amount'); return false; }
        }

        if (isVendor) {
            if (!form.vendor)      { toast.error('Select Vendor');         return false; }
            if (!form.ccCode)      { toast.error('Select Cost Center');    return false; }
            if (!form.vendorInvId) { toast.error('Select Vendor Invoice'); return false; }
            if (showReasonSection && !form.vendorReasonId) { toast.error('Select Reason'); return false; }
            if (showVendorDCA && !form.vendorReasonDCA)    { toast.error('Select Reason DCA'); return false; }
            if (showVendorPayFor && !form.vendorPaymentFor){ toast.error('Select Payment For'); return false; }
            if (!form.vAmount || parseFloat(form.vAmount) <= 0) { toast.error('Enter valid Basic Amount'); return false; }
        }
        return true;
    };

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = () => {
        if (!validate()) return;
        const userId = userData?.userId || userData?.UID || userData?.employeeId || '';
        const roleId = userData?.roleId || userData?.RID || 0;

        dispatch(submitCreditDebitNote({
            NoteType:         form.noteType,
            NoteFor:          form.noteFor,
            Client:           form.client           || null,
            SubClient:        form.subClient         || null,
            ClientInv:        form.clientInvId       || null,
            ClientReason:     showReasonSection && isClient ? (form.clientReasonId || null) : null,
            ClientReasonDCA:  showClientDCA          ? (form.clientReasonDCA  || null) : null,
            ClientReasonSDCA: showClientDCA          ? (form.clientReasonSDCA || null) : null,
            Clientpaymentfor: showClientPayFor       ? (form.clientPaymentFor || null) : null,
            CAmount:          form.cAmount           || null,
            CGSTAmt:          form.cCGST             || null,
            SGSTAmt:          form.cSGST             || null,
            IGSTAmt:          form.cIGST             || null,
            ClientTotal:      form.clientTotal        || null,
            Vendor:           form.vendor             || null,
            CCCode:           form.ccCode             || null,
            VendorInv:        form.vendorInvId        || null,
            VendorReason:     showReasonSection && isVendor ? (form.vendorReasonId || null) : null,
            VendorReasonDCA:  showVendorDCA           ? (form.vendorReasonDCA  || null) : null,
            VendorReasonSDCA: showVendorDCA           ? (form.vendorReasonSDCA || null) : null,
            Vendorpaymentfor: showVendorPayFor        ? (form.vendorPaymentFor || null) : null,
            VAmount:          form.vAmount            || null,
            VCGSTAmt:         form.vCGST              || null,
            VSGSTAmt:         form.vSGST              || null,
            VIGSTAmt:         form.vIGST              || null,
            VendorTotal:      form.vendorTotal         || null,
            Date:             form.date,
            Remarks:          form.remarks.trim(),
            Createdby:        String(userId),
            RoleID:           String(roleId),
        }));
    };

    const handleReset = () => {
        setForm(INIT);
        setSubmitted(false);
        dispatch(resetCreditDebitNote());
        dispatch(fetchClientReasonDCA());
        dispatch(fetchVendorReasonDCA());
    };

    // ── Success ────────────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-sm w-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Note Submitted</h2>
                    {saveRefNo && <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Ref No: {saveRefNo}</p>}
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Your {form.noteType} has been submitted for approval.</p>
                    <div className="text-left space-y-2.5 mb-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Note Type</span><span className="font-semibold text-gray-800 dark:text-gray-200">{form.noteType}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Note For</span><span className="font-semibold text-gray-800 dark:text-gray-200">{form.noteFor}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Date</span><span className="font-semibold text-gray-800 dark:text-gray-200">{form.date}</span></div>
                    </div>
                    <button onClick={handleReset}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md">
                        Create Another Note
                    </button>
                </div>
            </div>
        );
    }

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
                                <FileText className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Purchase Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Credit / Debit Note'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Create credit or debit notes for clients and vendors</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Purchase / Notes</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Section 1: Note Setup ──────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={FileText} title="Note Setup" subtitle="Select the note type and party"
                        action={
                            <button onClick={handleReset} disabled={saveLoading}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                        }
                    />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label required>Note Type</Label>
                                <ChipGroup options={NOTE_TYPES} value={form.noteType} onChange={handleNoteTypeChange} colorActive="indigo" />
                            </div>
                            <div>
                                <Label required>Note For</Label>
                                <ChipGroup options={NOTE_FORS} value={form.noteFor} onChange={handleNoteForChange} colorActive="violet" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 2a: Client Selection ──────────────────────────── */}
                {isClient && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={Users} title="Client Selection" subtitle="Select client, sub-client and invoice" />
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                <div>
                                    <Label required>Client</Label>
                                    <div className="relative">
                                        <select value={form.client} disabled={clientsLoading}
                                            onChange={(e) => {
                                                const opt = clients.find((c) => c.ClientID === e.target.value);
                                                handleClientChange(e.target.value, opt?.ClientName || '');
                                            }}
                                            className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{clientsLoading ? 'Loading…' : '— Select Client —'}</option>
                                            {clients.map((c) => <option key={c.ClientID} value={c.ClientID}>{c.ClientName}</option>)}
                                        </select>
                                        <SelectIcon loading={clientsLoading} />
                                    </div>
                                </div>

                                <div>
                                    <Label required>Sub Client</Label>
                                    <div className="relative">
                                        <select value={form.subClient} disabled={!form.client || subClientsLoading}
                                            onChange={(e) => {
                                                const opt = subClients.find((s) => s.SubclientID === e.target.value);
                                                handleSubClientChange(e.target.value, opt?.SubclientName || '');
                                            }}
                                            className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{!form.client ? 'Select client first' : subClientsLoading ? 'Loading…' : '— Select Sub Client —'}</option>
                                            {subClients.map((s) => <option key={s.SubclientID} value={s.SubclientID}>{s.SubclientName}</option>)}
                                        </select>
                                        <SelectIcon loading={subClientsLoading} />
                                    </div>
                                </div>

                                <div>
                                    <Label required>Invoice</Label>
                                    <div className="relative">
                                        <select value={form.clientInvId} disabled={!form.subClient || clientInvLoading}
                                            onChange={(e) => {
                                                const opt = clientInvoices.find((i) => i.InvID === e.target.value);
                                                handleClientInvoiceChange(e.target.value, opt?.InvNo || '');
                                            }}
                                            className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{!form.subClient ? 'Select sub-client first' : clientInvLoading ? 'Loading…' : '— Select Invoice —'}</option>
                                            {clientInvoices.map((i) => <option key={i.InvID} value={i.InvID}>{i.InvNo}</option>)}
                                        </select>
                                        <SelectIcon loading={clientInvLoading} />
                                    </div>
                                </div>
                            </div>

                            {clientInvDetLoading && (
                                <div className="flex items-center gap-2 text-xs text-indigo-500">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading invoice details…
                                </div>
                            )}
                            <InvoiceDetailCard data={clientInvDetails} isClient />
                        </div>
                    </div>
                )}

                {/* ── Section 2b: Vendor Selection ──────────────────────────── */}
                {isVendor && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={Building2} title="Vendor Selection" subtitle="Select vendor, cost center and invoice" />
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                <div>
                                    <Label required>Vendor</Label>
                                    <div className="relative">
                                        <select value={form.vendor} disabled={vendorsLoading}
                                            onChange={(e) => {
                                                const opt = vendors.find((v) => v.VendorID === e.target.value);
                                                handleVendorChange(e.target.value, opt?.VendorName || '');
                                            }}
                                            className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{vendorsLoading ? 'Loading…' : '— Select Vendor —'}</option>
                                            {vendors.map((v) => <option key={v.VendorID} value={v.VendorID}>{v.VendorName}</option>)}
                                        </select>
                                        <SelectIcon loading={vendorsLoading} />
                                    </div>
                                </div>

                                <div>
                                    <Label required>Cost Center</Label>
                                    <div className="relative">
                                        <select value={form.ccCode} disabled={!form.vendor || vendorCCsLoading}
                                            onChange={(e) => {
                                                const opt = vendorCCs.find((c) => c.CCID === e.target.value);
                                                handleCCChange(e.target.value, opt?.CCName || '');
                                            }}
                                            className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{!form.vendor ? 'Select vendor first' : vendorCCsLoading ? 'Loading…' : '— Select CC —'}</option>
                                            {vendorCCs.map((c) => <option key={c.CCID} value={c.CCID}>{c.CCName}</option>)}
                                        </select>
                                        <SelectIcon loading={vendorCCsLoading} />
                                    </div>
                                </div>

                                <div>
                                    <Label required>Invoice</Label>
                                    <div className="relative">
                                        <select value={form.vendorInvId} disabled={!form.ccCode || vendorInvLoading}
                                            onChange={(e) => {
                                                const opt = vendorInvoices.find((i) => i.InvID === e.target.value);
                                                handleVendorInvoiceChange(e.target.value, opt?.InvNo || '');
                                            }}
                                            className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{!form.ccCode ? 'Select CC first' : vendorInvLoading ? 'Loading…' : '— Select Invoice —'}</option>
                                            {vendorInvoices.map((i) => <option key={i.InvID} value={i.InvID}>{i.InvNo}</option>)}
                                        </select>
                                        <SelectIcon loading={vendorInvLoading} />
                                    </div>
                                </div>
                            </div>

                            {vendorInvDetLoading && (
                                <div className="flex items-center gap-2 text-xs text-indigo-500">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading invoice details…
                                </div>
                            )}
                            <InvoiceDetailCard data={vendorInvDetails} isClient={false} />
                        </div>
                    </div>
                )}

                {/* ── Section 3: Note Amounts ───────────────────────────────── */}
                {(isClient || isVendor) && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={IndianRupee} title="Note Amounts" subtitle="Enter the note value and applicable GST" />
                        <div className="p-6 md:p-8">
                            {isClient && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                    <div>
                                        <Label required>Basic Amount (₹)</Label>
                                        <input type="number" min="0" step="0.01" value={form.cAmount}
                                            onChange={(e) => set('cAmount', e.target.value)}
                                            placeholder="0.00" className={inputCls} />
                                    </div>
                                    {showClientCSGST && (
                                        <>
                                            <div>
                                                <Label>CGST Amount (₹)</Label>
                                                <input type="number" min="0" step="0.01" value={form.cCGST}
                                                    onChange={(e) => set('cCGST', e.target.value)}
                                                    placeholder="0.00" className={inputCls} />
                                            </div>
                                            <div>
                                                <Label>SGST Amount (₹)</Label>
                                                <input type="number" min="0" step="0.01" value={form.cSGST}
                                                    onChange={(e) => set('cSGST', e.target.value)}
                                                    placeholder="0.00" className={inputCls} />
                                            </div>
                                        </>
                                    )}
                                    {showClientIGST && (
                                        <div>
                                            <Label>IGST Amount (₹)</Label>
                                            <input type="number" min="0" step="0.01" value={form.cIGST}
                                                onChange={(e) => set('cIGST', e.target.value)}
                                                placeholder="0.00" className={inputCls} />
                                        </div>
                                    )}
                                    <div>
                                        <Label>Total (₹)</Label>
                                        <input type="text" readOnly value={form.clientTotal} placeholder="Auto-computed"
                                            className={`${inputCls} bg-gray-50 dark:bg-gray-900/40 cursor-default font-semibold text-indigo-700 dark:text-indigo-400`} />
                                    </div>
                                </div>
                            )}
                            {isVendor && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                    <div>
                                        <Label required>Basic Amount (₹)</Label>
                                        <input type="number" min="0" step="0.01" value={form.vAmount}
                                            onChange={(e) => set('vAmount', e.target.value)}
                                            placeholder="0.00" className={inputCls} />
                                    </div>
                                    {showVendorCSGST && (
                                        <>
                                            <div>
                                                <Label>CGST Amount (₹)</Label>
                                                <input type="number" min="0" step="0.01" value={form.vCGST}
                                                    onChange={(e) => set('vCGST', e.target.value)}
                                                    placeholder="0.00" className={inputCls} />
                                            </div>
                                            <div>
                                                <Label>SGST Amount (₹)</Label>
                                                <input type="number" min="0" step="0.01" value={form.vSGST}
                                                    onChange={(e) => set('vSGST', e.target.value)}
                                                    placeholder="0.00" className={inputCls} />
                                            </div>
                                        </>
                                    )}
                                    {showVendorIGST && (
                                        <div>
                                            <Label>IGST Amount (₹)</Label>
                                            <input type="number" min="0" step="0.01" value={form.vIGST}
                                                onChange={(e) => set('vIGST', e.target.value)}
                                                placeholder="0.00" className={inputCls} />
                                        </div>
                                    )}
                                    <div>
                                        <Label>Total (₹)</Label>
                                        <input type="text" readOnly value={form.vendorTotal} placeholder="Auto-computed"
                                            className={`${inputCls} bg-gray-50 dark:bg-gray-900/40 cursor-default font-semibold text-indigo-700 dark:text-indigo-400`} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Section 4: Reason Details (conditional) ───────────────── */}
                {showReasonFields && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={Receipt} title="Reason Details"
                            subtitle={
                                form.noteType === 'Debit Note' && form.noteFor === 'Client'
                                    ? undefined
                                    : 'Select the reason for this note — additional fields depend on reason selected'
                            }
                        />
                        <div className="p-6 md:p-8">

                            {/* Reason dropdown */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <Label required>Reason</Label>
                                    <div className="relative">
                                        <select
                                            value={isClient ? form.clientReasonId : form.vendorReasonId}
                                            disabled={reasonsLoading}
                                            onChange={(e) => {
                                                const opt = reasons.find((r) => r.ReasonId === e.target.value);
                                                isClient
                                                    ? handleClientReasonChange(e.target.value, opt?.ReasonName || '')
                                                    : handleVendorReasonChange(e.target.value, opt?.ReasonName || '');
                                            }}
                                            className={`${inputCls} appearance-none pr-10`}>
                                            <option value="">{reasonsLoading ? 'Loading…' : '— Select Reason —'}</option>
                                            {reasons.map((r) => <option key={r.ReasonId} value={r.ReasonId}>{r.ReasonName}</option>)}
                                        </select>
                                        <SelectIcon loading={reasonsLoading} />
                                    </div>
                                </div>

                                {/* DCA — shown only for specific reason combinations */}
                                {(isClient ? showClientDCA : showVendorDCA) && (
                                    <div>
                                        <Label required>Reason DCA</Label>
                                        <div className="relative">
                                            {isClient ? (
                                                <select value={form.clientReasonDCA} disabled={clientDCAsLoading}
                                                    onChange={(e) => handleClientDCAChange(e.target.value)}
                                                    className={`${inputCls} appearance-none pr-10`}>
                                                    <option value="">{clientDCAsLoading ? 'Loading…' : '— Select DCA —'}</option>
                                                    {clientDCAs.map((d) => <option key={d.DCAId} value={d.DCAId}>{d.DCAName}</option>)}
                                                </select>
                                            ) : (
                                                <select value={form.vendorReasonDCA} disabled={vendorDCAsLoading}
                                                    onChange={(e) => handleVendorDCAChange(e.target.value)}
                                                    className={`${inputCls} appearance-none pr-10`}>
                                                    <option value="">{vendorDCAsLoading ? 'Loading…' : '— Select DCA —'}</option>
                                                    {vendorDCAs.map((d) => <option key={d.DCAId} value={d.DCAId}>{d.DCAName}</option>)}
                                                </select>
                                            )}
                                            <SelectIcon loading={isClient ? clientDCAsLoading : vendorDCAsLoading} />
                                        </div>
                                    </div>
                                )}

                                {/* Sub-DCA */}
                                {(isClient ? showClientDCA : showVendorDCA) && (
                                    <div>
                                        <Label>Sub-DCA</Label>
                                        <div className="relative">
                                            {isClient ? (
                                                <select value={form.clientReasonSDCA}
                                                    disabled={!form.clientReasonDCA || clientSDCAsLoading}
                                                    onChange={(e) => set('clientReasonSDCA', e.target.value)}
                                                    className={`${inputCls} appearance-none pr-10`}>
                                                    <option value="">{!form.clientReasonDCA ? 'Select DCA first' : clientSDCAsLoading ? 'Loading…' : '— Select Sub-DCA —'}</option>
                                                    {clientSDCAs.map((s) => <option key={s.SDCAId} value={s.SDCAId}>{s.SDCAName}</option>)}
                                                </select>
                                            ) : (
                                                <select value={form.vendorReasonSDCA}
                                                    disabled={!form.vendorReasonDCA || vendorSDCAsLoading}
                                                    onChange={(e) => set('vendorReasonSDCA', e.target.value)}
                                                    className={`${inputCls} appearance-none pr-10`}>
                                                    <option value="">{!form.vendorReasonDCA ? 'Select DCA first' : vendorSDCAsLoading ? 'Loading…' : '— Select Sub-DCA —'}</option>
                                                    {vendorSDCAs.map((s) => <option key={s.SDCAId} value={s.SDCAId}>{s.SDCAName}</option>)}
                                                </select>
                                            )}
                                            <SelectIcon loading={isClient ? clientSDCAsLoading : vendorSDCAsLoading} />
                                        </div>
                                    </div>
                                )}

                                {/* Payment For — dropdown, shown only for specific reason combinations */}
                                {(isClient ? showClientPayFor : showVendorPayFor) && (
                                    <div>
                                        <Label required>Payment For</Label>
                                        <div className="relative">
                                            <select
                                                value={isClient ? form.clientPaymentFor : form.vendorPaymentFor}
                                                onChange={(e) => isClient ? set('clientPaymentFor', e.target.value) : set('vendorPaymentFor', e.target.value)}
                                                className={`${inputCls} appearance-none pr-10`}>
                                                <option value="">— Select —</option>
                                                {PAYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            <SelectIcon />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Contextual hint */}
                            {(isClient ? form.clientReasonId : form.vendorReasonId) && (
                                <div className="mt-4 flex items-start gap-2 bg-indigo-50/60 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/40 rounded-xl px-4 py-3">
                                    <Info className="h-3.5 w-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                        {isClient && showClientDCA   && 'DCA and Sub-DCA selection required for this reason.'}
                                        {isClient && showClientPayFor && 'Payment For type selection required for this reason.'}
                                        {isVendor && showVendorDCA   && showVendorPayFor && 'DCA, Sub-DCA and Payment For selection required for this reason.'}
                                        {isVendor && showVendorDCA   && !showVendorPayFor && 'DCA and Sub-DCA selection required for this reason.'}
                                        {isVendor && !showVendorDCA  && showVendorPayFor && 'Payment For type selection required for this reason.'}
                                        {isVendor && !showVendorDCA  && !showVendorPayFor && form.vendorReasonId && 'No additional fields required for this reason.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Section 5: Note Date & Remarks + Submit ────────────────── */}
                {(isClient || isVendor) && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={Receipt} title="Note Details" subtitle="Date, remarks and submission" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                <div>
                                    <Label required>Note Date</Label>
                                    <CustomDatePicker
                                        value={form.date}
                                        onChange={(v) => set('date', v)}
                                        format="DD-MMM-YYYY"
                                        placeholder="Select date"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label required>Remarks</Label>
                                    <input type="text" value={form.remarks}
                                        onChange={(e) => set('remarks', e.target.value)}
                                        placeholder="Enter remarks…"
                                        className={inputCls} />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button onClick={handleSubmit} disabled={saveLoading}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white text-sm font-bold hover:from-indigo-600 hover:via-purple-600 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/30">
                                    {saveLoading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                        : <><Send className="h-4 w-4" /> Submit Note</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CreditDebitNote;
