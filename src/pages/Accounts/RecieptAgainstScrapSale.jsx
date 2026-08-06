import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Receipt, Landmark, ShieldCheck, Percent,
    CheckCircle, Loader2, ChevronDown, RotateCcw, Send, Navigation, FileSearch,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchScrapSaleRefnos,
    fetchScrapSaleReceiptDetails,
    submitScrapSaleReceipt,
    clearScrapSaleReceiptDetails,
    clearScrapSaleReceiptSaveResult,
    resetScrapSaleReceipt,
    selectScrapSaleRefnos,
    selectScrapSaleDetails,
    selectScrapSaleSaveResult,
    selectScrapSaleRefnosLoading,
    selectScrapSaleDetailsLoading,
    selectScrapSaleSaveLoading,
    selectScrapSaleSaveError,
} from '../../slices/accountsSlice/scrapSaleReceiptSlice';

import {
    fetchBankDetailsWithAvailableBalance,
    resetBankDetailsData,
    selectBankDetailsArray,
    selectBankDetailsLoading,
} from '../../slices/CommonSlice/bankDetailsSlice';

// ── Constants ──────────────────────────────────────────────────────────────────
const MODE_OPTIONS = ['RTGS/E-Trans', 'NEFT', 'IMPS', 'UPI', 'Cheque', 'Cash'];

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

// e.g. "SC091 , MEDHAWANI STEEL CORPORATION" -> "SC091 — MEDHAWANI STEEL CORPORATION"
const splitCoded = (val) => {
    if (!val) return { code: '', name: '' };
    const [code, ...rest] = String(val).split(',');
    return { code: code.trim(), name: rest.join(',').trim() };
};

// ── Shared UI primitives (matches ClientScrapSaleInvoiceCreation / GeneralPayment) ──
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

const DetailField = ({ label, value, highlight }) => value || value === 0 ? (
    <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-bold ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>{value}</p>
    </div>
) : null;

// ── Component ─────────────────────────────────────────────────────────────────
const RecieptAgainstScrapSale = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userName = userData?.userName || userData?.UserName || 'system';

    const refnos        = useSelector(selectScrapSaleRefnos);
    const details        = useSelector(selectScrapSaleDetails);
    const saveResult     = useSelector(selectScrapSaleSaveResult);
    const refnosLoading  = useSelector(selectScrapSaleRefnosLoading);
    const detailsLoading = useSelector(selectScrapSaleDetailsLoading);
    const saveLoading    = useSelector(selectScrapSaleSaveLoading);
    const saveError      = useSelector(selectScrapSaleSaveError);

    const bankList    = useSelector(selectBankDetailsArray);
    const bankLoading = useSelector(selectBankDetailsLoading);

    // Local state
    const [selectedRefnoId, setSelectedRefnoId]   = useState('');
    const [receiveAmount,   setReceiveAmount]     = useState('');
    const [selectedBank,    setSelectedBank]      = useState('');
    const [modeOfPay,       setModeOfPay]         = useState('');
    const [refNumber,       setRefNumber]         = useState('');
    const [paymentDate,     setPaymentDate]       = useState(null);
    const [remarks,         setRemarks]           = useState('');

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchScrapSaleRefnos());
        dispatch(fetchBankDetailsWithAvailableBalance());
        return () => {
            dispatch(resetScrapSaleReceipt());
            dispatch(resetBankDetailsData());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // Pre-fill amount to receive when details load, but keep it editable
    useEffect(() => {
        if (details?.BalanceAmount !== undefined && details?.BalanceAmount !== null) {
            setReceiveAmount(String(details.BalanceAmount));
        }
    }, [details]);

    // Handle save result
    useEffect(() => {
        if (!saveResult) return;
        const msg = typeof saveResult === 'string' ? saveResult : saveResult?.Message || '';
        if (msg === 'Successfull' || msg.toLowerCase().includes('success')) {
            toast.success('Receipt against scrap sale submitted successfully!');
            handleReset();
        } else if (msg) {
            toast.error(msg);
        }
        dispatch(clearScrapSaleReceiptSaveResult());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveResult]);

    useEffect(() => {
        if (saveError) toast.error(saveError);
    }, [saveError]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleRefnoChange = (id) => {
        setSelectedRefnoId(id);
        setReceiveAmount('');
        dispatch(clearScrapSaleReceiptDetails());
        if (id) dispatch(fetchScrapSaleReceiptDetails(id));
    };

    const handleReset = () => {
        setSelectedRefnoId('');
        setReceiveAmount('');
        setSelectedBank('');
        setModeOfPay('');
        setRefNumber('');
        setPaymentDate(null);
        setRemarks('');
        dispatch(clearScrapSaleReceiptDetails());
        dispatch(fetchScrapSaleRefnos());
        dispatch(fetchBankDetailsWithAvailableBalance());
    };

    const handleSubmit = () => {
        if (!selectedRefnoId)   { toast.warn('Select a scrap sale reference number.'); return; }
        if (!details)           { toast.warn('Reference details are still loading.');  return; }
        if (!selectedBank)      { toast.warn('Select a bank.');                        return; }
        if (!modeOfPay)         { toast.warn('Select a mode of payment.');             return; }
        if (!refNumber.trim())  { toast.warn('Enter a reference / transaction number.'); return; }
        if (!paymentDate)       { toast.warn('Select a payment date.');                return; }
        if (!(parseFloat(receiveAmount) > 0)) { toast.warn('Enter a valid amount to receive.'); return; }
        if (!remarks.trim())    { toast.warn('Enter remarks.');                        return; }

        dispatch(submitScrapSaleReceipt({
            Bank:                     parseInt(selectedBank, 10) || 0,
            No:                       refNumber,
            ModeofPay:                modeOfPay,
            ScrapSaleClientInvoiceno: selectedRefnoLabel,
            ScrapSaleInvoiceId:       selectedRefnoId,
            Date:                     formatDateForAPI(paymentDate),
            Remarks:                  remarks,
            BalanceAmount:            parseFloat(receiveAmount) || 0,
            RoleID:                   parseInt(roleId, 10),
            Createdby:                userName,
        }));
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const selectedRefnoLabel = refnos.find(r => String(r.Refnoid) === String(selectedRefnoId))?.RefnoVal || '';
    const cc     = splitCoded(details?.ClientCode);
    const sub    = splitCoded(details?.SubClientCode);
    const isBusy = saveLoading;
    const canSubmit = selectedRefnoId && details && selectedBank && modeOfPay && refNumber.trim() && paymentDate && parseFloat(receiveAmount) > 0;

    const gstRows = [];
    if (details?.GstApplicable === 'Yes') {
        if (details?.DCA1) gstRows.push({ cc: details.CCCode1, dca: details.DCA1, sdca: details.SDCA1, amt: details.Taxvalue1 });
        if (details?.DCA2) gstRows.push({ cc: details.CCCode2, dca: details.DCA2, sdca: details.SDCA2, amt: details.Taxvalue2 });
    }

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
                                <Receipt className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Receipt Against Scrap Sale'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Record a client receipt against a scrap sale reference</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / Scrap Sale Receipt</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Section 1: Reference Selection ───────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={FileSearch} title="Scrap Sale Reference" subtitle="Select the reference number to receive payment against" action={
                        <button onClick={handleReset} disabled={isBusy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50">
                            <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </button>
                    } />
                    <div className="p-6 md:p-8">
                        <div className="max-w-md">
                            <Label required>Reference Number</Label>
                            <div className="relative">
                                <select
                                    value={selectedRefnoId}
                                    onChange={e => handleRefnoChange(e.target.value)}
                                    disabled={refnosLoading || isBusy}
                                    className={`${inputCls} appearance-none pr-10`}
                                >
                                    <option value="">{refnosLoading ? 'Loading…' : '— Select Reference Number —'}</option>
                                    {refnos.map(r => (
                                        <option key={r.Refnoid} value={r.Refnoid}>{r.RefnoVal}</option>
                                    ))}
                                </select>
                                <SelectIcon loading={refnosLoading} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Invoice & Client Details (auto-filled) ────── */}
                {selectedRefnoId && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={Receipt} title="Invoice & Client Details" subtitle="Auto-filled from the selected reference" />
                        <div className="p-6 md:p-8">
                            {detailsLoading ? (
                                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                    <span className="text-sm text-blue-700 dark:text-blue-400">Loading reference details…</span>
                                </div>
                            ) : details ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <DetailField label="Cost Center" value={details.CostCenterName ? `${details.CostCenter} — ${details.CostCenterName}` : details.CostCenter} />
                                        <DetailField label="Client" value={cc.name || cc.code} />
                                        <DetailField label="Sub-Client" value={sub.name || sub.code} />
                                        <DetailField label="Invoice Date" value={details.InvoiceDate} />
                                        <DetailField label="Basic Amount" value={`₹ ${fmt(details.BasicAmount)}`} />
                                        <DetailField label="Total Amount" value={`₹ ${fmt(details.TotalAmount)}`} />
                                        <DetailField label="Paid Amount" value={`₹ ${fmt(details.PaidAmount)}`} />
                                        <DetailField label="Balance Amount" value={`₹ ${fmt(details.BalanceAmount)}`} highlight />
                                    </div>

                                    {gstRows.length > 0 && (
                                        <div className="rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-900/10 p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide mb-3 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                                <ShieldCheck className="w-3.5 h-3.5" /> GST Breakup
                                            </p>
                                            <div className="overflow-x-auto rounded-lg border border-indigo-200 dark:border-indigo-800">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="bg-indigo-100/60 dark:bg-indigo-900/20">
                                                            <th className="px-3 py-2 text-left font-bold text-indigo-700 dark:text-indigo-300 uppercase">CC</th>
                                                            <th className="px-3 py-2 text-left font-bold text-indigo-700 dark:text-indigo-300 uppercase">Account Head</th>
                                                            <th className="px-3 py-2 text-left font-bold text-indigo-700 dark:text-indigo-300 uppercase">Sub Account Head</th>
                                                            <th className="px-3 py-2 text-right font-bold text-indigo-700 dark:text-indigo-300 uppercase">Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {gstRows.map((row, i) => (
                                                            <tr key={i} className="border-t border-indigo-100 dark:border-indigo-900/30">
                                                                <td className="px-3 py-2">{row.cc}</td>
                                                                <td className="px-3 py-2">{row.dca}</td>
                                                                <td className="px-3 py-2">{row.sdca}</td>
                                                                <td className="px-3 py-2 text-right font-semibold">₹ {fmt(row.amt)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {details?.TCSApplicable === 'Yes' && details?.TcsDCA && (
                                        <div className="rounded-xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/10 p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide mb-3 text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                                <Percent className="w-3.5 h-3.5" /> TCS Breakup
                                            </p>
                                            <div className="overflow-x-auto rounded-lg border border-rose-200 dark:border-rose-800">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="bg-rose-100/60 dark:bg-rose-900/20">
                                                            <th className="px-3 py-2 text-left font-bold text-rose-700 dark:text-rose-300 uppercase">CC</th>
                                                            <th className="px-3 py-2 text-left font-bold text-rose-700 dark:text-rose-300 uppercase">Account Head</th>
                                                            <th className="px-3 py-2 text-left font-bold text-rose-700 dark:text-rose-300 uppercase">Sub Account Head</th>
                                                            <th className="px-3 py-2 text-right font-bold text-rose-700 dark:text-rose-300 uppercase">Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="border-t border-rose-100 dark:border-rose-900/30">
                                                            <td className="px-3 py-2">{details.TcsCCCode}</td>
                                                            <td className="px-3 py-2">{details.TcsDCA}</td>
                                                            <td className="px-3 py-2">{details.TcsSDCA}</td>
                                                            <td className="px-3 py-2 text-right font-semibold">₹ {fmt(details.TcsValue)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">No details found for this reference.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Section 3: Payment Details ───────────────────────────── */}
                {selectedRefnoId && details && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={Landmark} title="Payment Details" subtitle="Bank, mode of payment and receipt amount" />
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label required>Bank</Label>
                                    <div className="relative">
                                        <select
                                            value={selectedBank}
                                            onChange={e => setSelectedBank(e.target.value)}
                                            disabled={bankLoading || isBusy}
                                            className={`${inputCls} appearance-none pr-10`}
                                        >
                                            <option value="">{bankLoading ? 'Loading…' : '— Select Bank —'}</option>
                                            {bankList.map(b => (
                                                <option key={b.BankId} value={b.BankId}>{b.BankName}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={bankLoading} />
                                    </div>
                                </div>
                                <div>
                                    <Label required>Mode of Payment</Label>
                                    <div className="relative">
                                        <select
                                            value={modeOfPay}
                                            onChange={e => setModeOfPay(e.target.value)}
                                            disabled={isBusy}
                                            className={`${inputCls} appearance-none pr-10`}
                                        >
                                            <option value="">— Select Mode —</option>
                                            {MODE_OPTIONS.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                        <SelectIcon loading={false} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <Label required>Reference / Transaction No.</Label>
                                    <input
                                        type="text"
                                        placeholder="Enter reference number…"
                                        value={refNumber}
                                        onChange={e => setRefNumber(e.target.value)}
                                        disabled={isBusy}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <Label required>Payment Date</Label>
                                    <CustomDatePicker
                                        value={paymentDate}
                                        onChange={val => setPaymentDate(val)}
                                        placeholder="Select payment date"
                                        disabled={isBusy}
                                    />
                                </div>
                                <div>
                                    <Label required>Amount to Receive</Label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={receiveAmount}
                                        onChange={e => setReceiveAmount(e.target.value)}
                                        disabled={isBusy}
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label required>Remarks</Label>
                                <textarea
                                    rows={3}
                                    placeholder="Enter remarks…"
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                    disabled={isBusy}
                                    className={`${inputCls} resize-none`}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Section 4: Summary ───────────────────────────────────── */}
                {canSubmit && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={CheckCircle} title="Receipt Summary" subtitle="Review before submission" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Reference No.</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{selectedRefnoLabel || '—'}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mode of Pay</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{modeOfPay || '—'}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Date</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{formatDateForAPI(paymentDate) || '—'}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount to Receive</p>
                                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">₹ {fmt(receiveAmount)}</p>
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
                            : <><Send className="h-4 w-4" /> Submit Receipt</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RecieptAgainstScrapSale;
