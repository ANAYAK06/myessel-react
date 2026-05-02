import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    BookOpen, Plus, Trash2, Loader2, ChevronDown, Send, RotateCcw,
    CheckCircle, TrendingUp, TrendingDown, Scale, Navigation,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchJVLedgers,
    fetchJVInvoices,
    submitJournalVoucher,
    clearInvoicesForRow,
    clearSaveResult,
    resetJournalVoucher,
    selectJVSaveStatus,
    selectJVSaveLoading,
    selectJVSaveError,
} from '../../slices/accountsSlice/journalVoucherSlice';

// ── Constants ──────────────────────────────────────────────────────────────────

const LEDGER_TYPES  = ['Client', 'Vendor', 'Other'];
const TRAN_TYPES    = ['Credit', 'Debit'];
const PAYMENT_TYPES = ['Invoice Balance', 'Retention', 'Hold'];

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Business Logic ─────────────────────────────────────────────────────────────
//
//  Client + Credit → Invoice fields ACTIVE   (reducing receivable)
//  Client + Debit  → Invoice fields INACTIVE
//  Vendor + Debit  → Invoice fields ACTIVE   (reducing payable)
//  Vendor + Credit → Invoice fields INACTIVE
//  Other  + Any    → Invoice fields INACTIVE

const isInvoiceFieldsActive = (ledgerType, tranType) => {
    if (!ledgerType || !tranType) return false;
    if (ledgerType === 'Client' && tranType === 'Credit') return true;
    if (ledgerType === 'Vendor' && tranType === 'Debit')  return true;
    return false;
};

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
    return `${String(d.getDate()).padStart(2, '0')}-${MONTH_ABBR[d.getMonth()]}-${d.getFullYear()}`;
};

const fmt = (n) =>
    n != null && n !== '' && !isNaN(parseFloat(n))
        ? `₹ ${parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : '₹ 0.00';

let rowCounter = 1;
const makeRow = (id) => ({
    id,
    ledgerType: '',
    ledgerId:   '',
    ledgerName: '',
    tranType:   '',
    payType:    '',
    invoiceNo:  '',
    amount:     '',
});

// ── Shared UI (matches ClientInvoiceCreation exactly) ─────────────────────────

const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 hover:border-gray-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed';

const inactiveCls =
    'w-full px-3.5 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm bg-gray-50 dark:bg-gray-900/30 text-gray-300 dark:text-gray-600 cursor-not-allowed select-none';

const Label = ({ children, required, inactive }) => (
    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${inactive ? 'text-gray-300 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}`}>
        {children}{required && !inactive && <span className="text-rose-500 ml-0.5">*</span>}
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

// ── Main Component ─────────────────────────────────────────────────────────────

const JournalVoucherCreation = ({ menuData }) => {
    const dispatch     = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const saveStatus  = useSelector(selectJVSaveStatus);
    const saveLoading = useSelector(selectJVSaveLoading);
    const saveError   = useSelector(selectJVSaveError);

    const [jvDate,  setJvDate]  = useState('');
    const [remarks, setRemarks] = useState('');
    const [rows,    setRows]    = useState([makeRow(rowCounter++)]);

    const [ledgerOpts,     setLedgerOpts]     = useState({});
    const [ledgerLoading,  setLedgerLoading]  = useState({});
    const [invoiceOpts,    setInvoiceOpts]    = useState({});
    const [invoiceLoading, setInvoiceLoading] = useState({});

    const [submitted, setSubmitted] = useState(false);

    // ── Save result ────────────────────────────────────────────────────────────

    useEffect(() => {
        if (saveStatus === 'success') {
            setSubmitted(true);
            toast.success('Journal voucher created successfully!');
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError || 'Failed to save journal voucher');
            dispatch(clearSaveResult());
        }
    }, [saveStatus, saveError, dispatch]);

    useEffect(() => () => { dispatch(resetJournalVoucher()); }, [dispatch]);

    // ── Totals ─────────────────────────────────────────────────────────────────

    const creditTotal = rows
        .filter((r) => r.tranType === 'Credit')
        .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

    const debitTotal = rows
        .filter((r) => r.tranType === 'Debit')
        .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

    const isBalanced = rows.length >= 2 && Math.abs(creditTotal - debitTotal) < 0.01 && creditTotal > 0;

    // ── Row helpers ────────────────────────────────────────────────────────────

    const updateRow = useCallback((id, field, value) => {
        setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
    }, []);

    const resetInvoiceFields = useCallback((id) => {
        setInvoiceOpts((p) => ({ ...p, [id]: [] }));
        dispatch(clearInvoicesForRow(String(id)));
    }, [dispatch]);

    const handleLedgerTypeChange = useCallback(async (id, ledType) => {
        setRows((prev) => prev.map((r) =>
            r.id === id
                ? { ...r, ledgerType: ledType, ledgerId: '', ledgerName: '', tranType: '', payType: '', invoiceNo: '' }
                : r
        ));
        setLedgerOpts((p) => ({ ...p, [id]: [] }));
        resetInvoiceFields(id);

        if (!ledType) return;
        setLedgerLoading((p) => ({ ...p, [id]: true }));
        try {
            const res  = await dispatch(fetchJVLedgers({ LedType: ledType })).unwrap();
            const opts = (res?.data?.Data || []).map((l) => ({ value: String(l.LedgerId), label: l.LedgerName }));
            setLedgerOpts((p) => ({ ...p, [id]: opts }));
        } catch {
            toast.error('Failed to load ledgers');
        } finally {
            setLedgerLoading((p) => ({ ...p, [id]: false }));
        }
    }, [dispatch, resetInvoiceFields]);

    const fetchInvoices = useCallback(async (row) => {
        const { id, ledgerType, ledgerId, payType, tranType } = row;
        if (!isInvoiceFieldsActive(ledgerType, tranType) || !ledgerId || !payType) return;

        setInvoiceLoading((p) => ({ ...p, [id]: true }));
        setInvoiceOpts((p)    => ({ ...p, [id]: [] }));
        try {
            const res  = await dispatch(fetchJVInvoices({
                rowKey: String(id), LedType: ledgerType,
                ventypeval: ledgerId, paytypeval: payType, trantypeval: tranType,
            })).unwrap();
            const opts = (res?.data?.Data || []).map((inv) => ({ value: inv.Invoiceno, label: inv.InvDetails }));
            setInvoiceOpts((p) => ({ ...p, [id]: opts }));
        } catch {
            toast.error('Failed to load invoices');
        } finally {
            setInvoiceLoading((p) => ({ ...p, [id]: false }));
        }
    }, [dispatch]);

    const handleLedgerChange = useCallback((id, ledgerId, ledgerName) => {
        setRows((prev) => prev.map((r) =>
            r.id === id ? { ...r, ledgerId, ledgerName, invoiceNo: '' } : r
        ));
        resetInvoiceFields(id);
    }, [resetInvoiceFields]);

    const handleTranTypeChange = useCallback((id, tranType) => {
        setRows((prev) => prev.map((r) =>
            r.id === id ? { ...r, tranType, payType: '', invoiceNo: '' } : r
        ));
        resetInvoiceFields(id);
    }, [resetInvoiceFields]);

    const handlePayTypeChange = useCallback((id, payType) => {
        setRows((prev) => {
            const updated = prev.map((r) =>
                r.id === id ? { ...r, payType, invoiceNo: '' } : r
            );
            const row = updated.find((r) => r.id === id);
            if (row) fetchInvoices(row);
            return updated;
        });
    }, [fetchInvoices]);

    const addRow = () => setRows((prev) => [...prev, makeRow(rowCounter++)]);

    const removeRow = (id) => {
        if (rows.length === 1) return;
        setRows((prev) => prev.filter((r) => r.id !== id));
        setLedgerOpts((p)     => { const c = { ...p }; delete c[id]; return c; });
        setLedgerLoading((p)  => { const c = { ...p }; delete c[id]; return c; });
        setInvoiceOpts((p)    => { const c = { ...p }; delete c[id]; return c; });
        setInvoiceLoading((p) => { const c = { ...p }; delete c[id]; return c; });
        dispatch(clearInvoicesForRow(String(id)));
    };

    // ── Validation ─────────────────────────────────────────────────────────────

    const validate = () => {
        if (!jvDate)         { toast.error('JV Date is required');            return false; }
        if (!remarks.trim()) { toast.error('Description / Remarks required'); return false; }
        if (rows.length < 2) { toast.error('Add at least 2 ledger entries');  return false; }

        for (const [i, row] of rows.entries()) {
            const n = i + 1;
            if (!row.ledgerType) { toast.error(`Row ${n}: Select Ledger Type`);       return false; }
            if (!row.ledgerId)   { toast.error(`Row ${n}: Select Ledger`);            return false; }
            if (!row.tranType)   { toast.error(`Row ${n}: Select Transaction Type`);  return false; }
            if (isInvoiceFieldsActive(row.ledgerType, row.tranType) && !row.payType) {
                toast.error(`Row ${n}: Select Payment Type`); return false;
            }
            if (!row.amount || isNaN(parseFloat(row.amount)) || parseFloat(row.amount) <= 0) {
                toast.error(`Row ${n}: Enter a valid Amount`); return false;
            }
        }

        if (!isBalanced) {
            toast.error(`Voucher not balanced — Credit ${fmt(creditTotal)} ≠ Debit ${fmt(debitTotal)}`);
            return false;
        }
        return true;
    };

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = () => {
        if (!validate()) return;
        const userId = userData?.userId || userData?.UID || userData?.employeeId || '';
        const roleId = userData?.roleId || userData?.RID || 0;

        dispatch(submitJournalVoucher({
            JVCreationDate: jvDate,
            JVRemarks:      remarks.trim(),
            Amount:         String(creditTotal),
            CreatedBy:      String(userId),
            LedgerFors:     rows.map((r) => r.ledgerType).join(','),
            Ledgers:        rows.map((r) => r.ledgerId).join(','),
            Trantypes:      rows.map((r) => r.tranType).join(','),
            Paytypes:       rows.map((r) => r.payType   || '').join(','),
            Invnos:         rows.map((r) => r.invoiceNo || '').join(','),
            Ledgeramounts:  rows.map((r) => r.amount).join(','),
            Roleid:         Number(roleId),
        }));
    };

    const handleReset = () => {
        rowCounter = 1;
        setJvDate(''); setRemarks('');
        setRows([makeRow(rowCounter++)]);
        setLedgerOpts({}); setLedgerLoading({});
        setInvoiceOpts({}); setInvoiceLoading({});
        setSubmitted(false);
        dispatch(resetJournalVoucher());
    };

    // ── Success ────────────────────────────────────────────────────────────────

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 max-w-sm w-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Voucher Submitted</h2>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Journal voucher has been sent for approval.</p>
                    <div className="text-left space-y-2.5 mb-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Date</span><span className="font-semibold text-gray-800 dark:text-gray-200">{fmtDate(jvDate)}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Credit Total</span><span className="font-semibold text-emerald-600">{fmt(creditTotal)}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Debit Total</span><span className="font-semibold text-red-500">{fmt(debitTotal)}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Entries</span><span className="font-semibold text-gray-800 dark:text-gray-200">{rows.length} rows</span></div>
                    </div>
                    <button onClick={handleReset}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md">
                        Create Another Voucher
                    </button>
                </div>
            </div>
        );
    }

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
                                <BookOpen className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Journal Voucher Entry'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Create and submit journal voucher entries</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / Journal</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Section 1: Voucher Header ─────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader
                        icon={BookOpen}
                        title="Voucher Header"
                        subtitle="Enter the JV date and description"
                        action={
                            <button onClick={handleReset} disabled={saveLoading}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                                <RotateCcw className="h-3.5 w-3.5" /> Reset
                            </button>
                        }
                    />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label required>JV Date</Label>
                                <CustomDatePicker
                                    value={jvDate}
                                    onChange={setJvDate}
                                    format="DD-MMM-YYYY"
                                    placeholder="Select date"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label required>Description / Remarks</Label>
                                <input
                                    type="text"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter journal voucher description…"
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Ledger Entries ─────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader
                        icon={Scale}
                        title="Ledger Entries"
                        subtitle="Add debit and credit lines — total credit must equal total debit"
                        action={
                            <button onClick={addRow}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-200 dark:border-indigo-700">
                                <Plus className="h-3.5 w-3.5" /> Add Row
                            </button>
                        }
                    />

                    {/* Desktop column headers */}
                    <div className="hidden lg:grid grid-cols-[1.6fr_2.2fr_1.4fr_1.6fr_2fr_1.4fr_44px] gap-4 px-6 md:px-8 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-900/20">
                        {['Ledger Type', 'Ledger', 'Tran Type', 'Payment Type', 'Invoice', 'Amount (₹)', ''].map((h) => (
                            <span key={h} className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{h}</span>
                        ))}
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700/60 px-6 md:px-8 py-2">
                        {rows.map((row, idx) => (
                            <LedgerRow
                                key={row.id}
                                row={row}
                                index={idx}
                                ledgerOptions={ledgerOpts[row.id]     || []}
                                ledgerLoad={!!ledgerLoading[row.id]}
                                invoiceOptions={invoiceOpts[row.id]   || []}
                                invoiceLoad={!!invoiceLoading[row.id]}
                                canRemove={rows.length > 1}
                                onLedgerTypeChange={handleLedgerTypeChange}
                                onLedgerChange={handleLedgerChange}
                                onTranTypeChange={handleTranTypeChange}
                                onPayTypeChange={handlePayTypeChange}
                                onFieldChange={updateRow}
                                onRemove={removeRow}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Section 3: Balance Summary + Submit ───────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">

                        {/* Totals */}
                        <div className="flex items-center gap-6 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Credit</p>
                                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{fmt(creditTotal)}</p>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-gray-100 dark:bg-gray-700" />

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                                    <TrendingDown className="h-5 w-5 text-red-500 dark:text-red-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Debit</p>
                                    <p className="text-base font-bold text-red-500 dark:text-red-400">{fmt(debitTotal)}</p>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-gray-100 dark:bg-gray-700" />

                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isBalanced ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-gray-50 dark:bg-gray-900/30'}`}>
                                    <Scale className={`h-5 w-5 ${isBalanced ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Difference</p>
                                    <p className={`text-base font-bold ${isBalanced ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500 dark:text-rose-400'}`}>
                                        {isBalanced ? 'Balanced ✓' : fmt(Math.abs(creditTotal - debitTotal))}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={saveLoading}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white text-sm font-bold hover:from-indigo-600 hover:via-purple-600 hover:to-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 whitespace-nowrap"
                        >
                            {saveLoading
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                : <><Send className="h-4 w-4" /> Submit Voucher</>}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// ── Ledger Row Component ───────────────────────────────────────────────────────

const LedgerRow = ({
    row, index,
    ledgerOptions, ledgerLoad, invoiceOptions, invoiceLoad, canRemove,
    onLedgerTypeChange, onLedgerChange, onTranTypeChange, onPayTypeChange,
    onFieldChange, onRemove,
}) => {
    const active = isInvoiceFieldsActive(row.ledgerType, row.tranType);

    const handleLedgerSelect = (e) => {
        const id   = e.target.value;
        const name = ledgerOptions.find((o) => o.value === id)?.label || '';
        onLedgerChange(row.id, id, name);
    };

    return (
        <div className="py-4">
            {/* Mobile row label */}
            <p className="lg:hidden text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-3">
                Entry #{index + 1}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_2.2fr_1.4fr_1.6fr_2fr_1.4fr_44px] gap-4 items-end">

                {/* Ledger Type */}
                <div>
                    <Label required>Ledger Type</Label>
                    <div className="relative">
                        <select value={row.ledgerType}
                            onChange={(e) => onLedgerTypeChange(row.id, e.target.value)}
                            className={`${inputCls} appearance-none pr-10`}>
                            <option value="">— Select —</option>
                            {LEDGER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <SelectIcon />
                    </div>
                </div>

                {/* Ledger */}
                <div>
                    <Label required>Ledger</Label>
                    <div className="relative">
                        <select value={row.ledgerId}
                            onChange={handleLedgerSelect}
                            disabled={!row.ledgerType || ledgerLoad}
                            className={`${inputCls} appearance-none pr-10`}>
                            <option value="">
                                {!row.ledgerType ? 'Select type first' : ledgerLoad ? 'Loading…' : '— Select Ledger —'}
                            </option>
                            {ledgerOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <SelectIcon loading={ledgerLoad} />
                    </div>
                </div>

                {/* Transaction Type */}
                <div>
                    <Label required>Tran Type</Label>
                    <div className="relative">
                        <select value={row.tranType}
                            onChange={(e) => onTranTypeChange(row.id, e.target.value)}
                            disabled={!row.ledgerId}
                            className={`${inputCls} appearance-none pr-10`}>
                            <option value="">— Select —</option>
                            {TRAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <SelectIcon />
                    </div>
                </div>

                {/* Payment Type — active only for Client+Credit or Vendor+Debit */}
                <div>
                    <Label required={active} inactive={!active}>Payment Type</Label>
                    {active ? (
                        <div className="relative">
                            <select value={row.payType}
                                onChange={(e) => onPayTypeChange(row.id, e.target.value)}
                                className={`${inputCls} appearance-none pr-10`}>
                                <option value="">— Select —</option>
                                {PAYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <SelectIcon />
                        </div>
                    ) : (
                        <div className={inactiveCls}>N / A</div>
                    )}
                </div>

                {/* Invoice — active only when payment type is chosen */}
                <div>
                    <Label inactive={!active || !row.payType}>Invoice</Label>
                    {active && row.payType ? (
                        <div className="relative">
                            <select value={row.invoiceNo}
                                onChange={(e) => onFieldChange(row.id, 'invoiceNo', e.target.value)}
                                disabled={invoiceLoad}
                                className={`${inputCls} appearance-none pr-10`}>
                                <option value="">
                                    {invoiceLoad ? 'Loading…' : invoiceOptions.length === 0 ? 'No invoices found' : '— Select Invoice —'}
                                </option>
                                {invoiceOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <SelectIcon loading={invoiceLoad} />
                        </div>
                    ) : (
                        <div className={inactiveCls}>N / A</div>
                    )}
                </div>

                {/* Amount */}
                <div>
                    <Label required>Amount (₹)</Label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.amount}
                        onChange={(e) => onFieldChange(row.id, 'amount', e.target.value)}
                        placeholder="0.00"
                        className={inputCls}
                    />
                </div>

                {/* Remove button */}
                <div className="flex items-end pb-0.5">
                    <button onClick={() => onRemove(row.id)} disabled={!canRemove}
                        className="w-11 h-11 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 text-gray-300 dark:text-gray-600 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Inline hint */}
            {row.ledgerType && row.tranType && (
                <p className={`mt-2 text-[11px] font-medium ${active ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-300 dark:text-gray-600'}`}>
                    {active
                        ? `● Payment & Invoice fields are active for ${row.ledgerType} — ${row.tranType}`
                        : `○ Payment & Invoice fields are not required for ${row.ledgerType} — ${row.tranType}`}
                </p>
            )}
        </div>
    );
};

export default JournalVoucherCreation;
