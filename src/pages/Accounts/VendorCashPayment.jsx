import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Receipt, Building2, FileText, Loader2,
    AlertCircle, RotateCcw, Send, ChevronDown,
    IndianRupee, Navigation, CreditCard,
    StickyNote, Users, ShoppingCart, ListChecks,
    CalendarDays, Layers,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

// Vendor Cash Payment slice
import {
    fetchSppoPaymentTypes,
    fetchSppoVendors,
    fetchSppoPOs,
    fetchSppoInvoices,
    saveVendorCashPayment,
    clearVendors,
    clearPOs,
    clearInvoices,
    clearSaveResult,
    resetVendorCash,
    selectPaymentTypes,
    selectVcpVendors,
    selectVcpPOList,
    selectVcpInvoiceList,
    selectVcpSaveStatus,
    selectVcpSaveError,
    selectPaymentTypesLoading,
    selectVcpVendorsLoading,
    selectVcpPOLoading,
    selectVcpInvoiceLoading,
    selectVcpSaveLoading,
    selectVcpVendorsError,
    selectVcpPOError,
    selectVcpInvoiceError,
} from '../../slices/accountsSlice/vendorCashPaymentSlice';

// Reuse CC lists from cashVoucherSlice (fetches the same data)
import {
    fetchSelfCCList,
    fetchOtherCCList,
    resetCashVoucher,
    selectSelfCCList,
    selectOtherCCList,
    selectSelfCCLoading,
    selectOtherCCLoading,
} from '../../slices/accountsSlice/cashVoucherSlice';

// ─── Shared Helper Components (same as CashVoucherCreation) ───────────────────

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
const VendorCashPayment = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId   = userData?.roleId   || userData?.RID  || 0;
    const userId   = userData?.userId   || userData?.UID  || userData?.employeeId || '';
    const userName = userData?.userName || userData?.UserName || 'User';

    // ── Selectors: vendorCashPaymentSlice ─────────────────────────────────────
    const paymentTypes       = useSelector(selectPaymentTypes);
    const vendors            = useSelector(selectVcpVendors);
    const poList             = useSelector(selectVcpPOList);
    const invoiceList        = useSelector(selectVcpInvoiceList);
    const saveStatus         = useSelector(selectVcpSaveStatus);
    const saveError          = useSelector(selectVcpSaveError);
    const paymentTypesLoading = useSelector(selectPaymentTypesLoading);
    const vendorsLoading     = useSelector(selectVcpVendorsLoading);
    const poLoading          = useSelector(selectVcpPOLoading);
    const invoiceLoading     = useSelector(selectVcpInvoiceLoading);
    const saveLoading        = useSelector(selectVcpSaveLoading);
    const vendorsError       = useSelector(selectVcpVendorsError);
    const poError            = useSelector(selectVcpPOError);
    const invoiceError       = useSelector(selectVcpInvoiceError);

    // ── Selectors: cashVoucherSlice (CC lists) ────────────────────────────────
    const selfCCList    = useSelector(selectSelfCCList);
    const otherCCList   = useSelector(selectOtherCCList);
    const selfCCLoading = useSelector(selectSelfCCLoading);
    const otherCCLoading = useSelector(selectOtherCCLoading);

    // ── Local State ───────────────────────────────────────────────────────────
    const [vendorType,      setVendorType]      = useState('');          // 'Supplier' | 'Service Provider'
    const [paymentType,     setPaymentType]     = useState('');          // from dropdown
    const [txnMode,         setTxnMode]         = useState('');          // 'Self Debit' | 'Debit from Other CC'
    const [selfCC,          setSelfCC]          = useState('');          // CC_Code value
    const [otherCC,         setOtherCC]         = useState('');          // CC_Code value
    const [vendorCode,      setVendorCode]      = useState('');
    const [selectedPOs,     setSelectedPOs]     = useState([]);          // array of PO number strings
    const [paymentDate,     setPaymentDate]     = useState(null);
    const [remarks,         setRemarks]         = useState('');
    const [advanceAmount,   setAdvanceAmount]   = useState('');          // used only for Vendor Advance

    // Invoice selections: { [InvoiceNo]: { selected: bool, payAmount: string } }
    const [invoiceSelections, setInvoiceSelections] = useState({});

    // ── Derived Values ────────────────────────────────────────────────────────
    const isAdvance = paymentType === 'Vendor Advance';

    // effectiveCCCode: the CC that gets passed to vendor/PO/invoice APIs
    const effectiveCCCode = txnMode === 'Debit from Other CC' ? otherCC : selfCC;

    // Selected invoice objects with their pay amounts
    const selectedInvoiceData = invoiceList.filter(
        (inv) => invoiceSelections[inv.InvoiceNo]?.selected
    ).map((inv) => ({
        ...inv,
        payAmount: parseFloat(invoiceSelections[inv.InvoiceNo]?.payAmount) || 0,
    }));

    // Total amount: sum of payAmounts for non-advance, or advanceAmount for advance
    const totalAmount = isAdvance
        ? parseFloat(advanceAmount) || 0
        : selectedInvoiceData.reduce((sum, inv) => sum + inv.payAmount, 0);

    // Max invoice date from selected invoices
    const maxInvoiceDate = selectedInvoiceData.length > 0
        ? selectedInvoiceData.reduce((max, inv) => {
            const d = inv.SPPOInvoiceDate || '';
            return d > max ? d : max;
        }, '')
        : '';

    // ── On mount: fetch self CC list ──────────────────────────────────────────
    useEffect(() => {
        if (userId && roleId) dispatch(fetchSelfCCList({ uid: userId, rid: roleId }));
        return () => {
            dispatch(resetVendorCash());
            dispatch(resetCashVoucher());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, userId, roleId]);

    // ── Fetch other CC list when mode switches ────────────────────────────────
    useEffect(() => {
        if (txnMode === 'Debit from Other CC' && otherCCList.length === 0) {
            dispatch(fetchOtherCCList({ id: userId, type: '' }));
        }
    }, [txnMode, dispatch, userId, otherCCList.length]);

    // ── Fetch payment types when vendor type is selected ─────────────────────
    useEffect(() => {
        if (vendorType) {
            dispatch(fetchSppoPaymentTypes(vendorType));
            setPaymentType('');
            dispatch(clearVendors());
            dispatch(clearPOs());
            dispatch(clearInvoices());
            setVendorCode('');
            setSelectedPOs([]);
            setInvoiceSelections({});
        }
    }, [vendorType, dispatch]);

    // ── Fetch vendors when CC is ready (after vendor type + payment type + CC) ─
    useEffect(() => {
        if (vendorType && paymentType && effectiveCCCode) {
            dispatch(fetchSppoVendors({ vendorType, ccCode: effectiveCCCode, paymentType }));
            setVendorCode('');
            dispatch(clearPOs());
            dispatch(clearInvoices());
            setSelectedPOs([]);
            setInvoiceSelections({});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vendorType, paymentType, effectiveCCCode, dispatch]);

    // ── Handle save result ────────────────────────────────────────────────────
    useEffect(() => {
        if (saveStatus === 'success') {
            toast.success('Vendor cash payment saved successfully!');
            dispatch(clearSaveResult());
            handleReset();
        } else if (saveStatus === 'failed' && saveError) {
            toast.error(saveError);
            dispatch(clearSaveResult());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveStatus, saveError, dispatch]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleVendorTypeChange = (val) => {
        setVendorType(val);
        setPaymentType('');
        setTxnMode('');
        setSelfCC('');
        setOtherCC('');
        setVendorCode('');
        setSelectedPOs([]);
        setInvoiceSelections({});
        setPaymentDate(null);
        setRemarks('');
        setAdvanceAmount('');
        dispatch(clearVendors());
        dispatch(clearPOs());
        dispatch(clearInvoices());
    };

    const handlePaymentTypeChange = (val) => {
        setPaymentType(val);
        setVendorCode('');
        setSelectedPOs([]);
        setInvoiceSelections({});
        dispatch(clearVendors());
        dispatch(clearPOs());
        dispatch(clearInvoices());
    };

    const handleTxnModeChange = (val) => {
        setTxnMode(val);
        setSelfCC('');
        setOtherCC('');
        setVendorCode('');
        setSelectedPOs([]);
        setInvoiceSelections({});
        dispatch(clearVendors());
        dispatch(clearPOs());
        dispatch(clearInvoices());
    };

    const handleSelfCCChange = useCallback((val) => {
        setSelfCC(val);
        setVendorCode('');
        setSelectedPOs([]);
        setInvoiceSelections({});
        dispatch(clearPOs());
        dispatch(clearInvoices());
    }, [dispatch]);

    const handleOtherCCChange = useCallback((val) => {
        setOtherCC(val);
        setVendorCode('');
        setSelectedPOs([]);
        setInvoiceSelections({});
        dispatch(clearPOs());
        dispatch(clearInvoices());
    }, [dispatch]);

    const handleVendorChange = useCallback((val) => {
        setVendorCode(val);
        setSelectedPOs([]);
        setInvoiceSelections({});
        dispatch(clearPOs());
        dispatch(clearInvoices());
        if (val && vendorType && effectiveCCCode && paymentType) {
            dispatch(fetchSppoPOs({ vendorCode: val, vendorType, ccCode: effectiveCCCode, paymentType }));
        }
    }, [dispatch, vendorType, effectiveCCCode, paymentType]);

    // Toggle a PO checkbox; fetch invoices when selection changes (non-advance)
    const handlePOToggle = useCallback((poNo) => {
        setSelectedPOs((prev) => {
            const next = prev.includes(poNo)
                ? prev.filter((p) => p !== poNo)
                : [...prev, poNo];

            // Fetch invoices for non-advance types
            if (!isAdvance && next.length > 0 && vendorCode) {
                const poNos = next.join(',') + ',';
                dispatch(fetchSppoInvoices({ vendorCode, poNos, payType: paymentType }));
            } else if (next.length === 0) {
                dispatch(clearInvoices());
                setInvoiceSelections({});
            }
            return next;
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, isAdvance, vendorCode, paymentType]);

    // Reset invoice selections when invoiceList changes (new fetch)
    useEffect(() => {
        setInvoiceSelections({});
    }, [invoiceList]);

    // Toggle an invoice row checkbox
    const handleInvoiceToggle = (invoiceNo, balance) => {
        setInvoiceSelections((prev) => {
            const existing = prev[invoiceNo];
            if (existing?.selected) {
                // Deselect
                return { ...prev, [invoiceNo]: { selected: false, payAmount: existing.payAmount } };
            }
            return {
                ...prev,
                [invoiceNo]: {
                    selected: true,
                    payAmount: existing?.payAmount || String(balance || ''),
                },
            };
        });
    };

    // Update pay amount for a specific invoice (capped at balance)
    const handlePayAmountChange = (invoiceNo, value, balance) => {
        const num = parseFloat(value);
        const cap = parseFloat(balance) || 0;
        const clamped = !isNaN(num) && num > cap ? String(cap) : value;
        setInvoiceSelections((prev) => ({
            ...prev,
            [invoiceNo]: { ...prev[invoiceNo], payAmount: clamped },
        }));
    };

    const handleReset = () => {
        setVendorType('');
        setPaymentType('');
        setTxnMode('');
        setSelfCC('');
        setOtherCC('');
        setVendorCode('');
        setSelectedPOs([]);
        setInvoiceSelections({});
        setPaymentDate(null);
        setRemarks('');
        setAdvanceAmount('');
        dispatch(clearVendors());
        dispatch(clearPOs());
        dispatch(clearInvoices());
    };

    const handleSubmit = () => {
        // Validation
        if (!vendorType)    { toast.warn('Please select Vendor Type.');     return; }
        if (!paymentType)   { toast.warn('Please select Payment Type.');    return; }
        if (!txnMode)       { toast.warn('Please select Transaction Mode.'); return; }
        if (!selfCC)        { toast.warn('Please select Self Cost Center.'); return; }
        if (txnMode === 'Debit from Other CC' && !otherCC) {
            toast.warn('Please select Other Cost Center.'); return;
        }
        if (!vendorCode)    { toast.warn('Please select a Vendor.');        return; }
        if (!paymentDate)   { toast.warn('Please select Payment Date.');    return; }

        if (!isAdvance) {
            if (selectedPOs.length === 0) {
                toast.warn('Please select at least one PO.'); return;
            }
            if (selectedInvoiceData.length === 0) {
                toast.warn('Please select at least one invoice.'); return;
            }
            const hasAmount = selectedInvoiceData.some((inv) => inv.payAmount > 0);
            if (!hasAmount) {
                toast.warn('Please enter pay amount for selected invoices.'); return;
            }
        } else {
            if (!advanceAmount || parseFloat(advanceAmount) <= 0) {
                toast.warn('Please enter a valid Advance Amount.'); return;
            }
        }

        // Format payment date as DD-Mon-YYYY (e.g. 20-Mar-2026) to match API expectation
        const txnDate = paymentDate
            ? new Date(paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
            : '';

        // Build common payload
        const payload = {
            PONumber:          selectedPOs.length > 0 ? selectedPOs.join(',') + ',' : '',
            VendorCode:        vendorCode,
            TransactionDate:   txnDate,
            BankName:          '',
            ModeofPay:         '',
            BankId:            '',
            TransactionAmount: totalAmount,
            Remarks:           remarks.trim(),
            Number:            '',
            Paytype:           paymentType,
            Createdby:         userName,
            Roleid:            roleId,
            BankorCash:        'Cash',
            VendorType:        vendorType,
            CCCode:            selfCC,
            PaidToCC:          selfCC,
            PaidAganstCC:      txnMode === 'Debit from Other CC' ? otherCC : '',
            OtherCCCode:       txnMode === 'Debit from Other CC' ? otherCC : '',
            CashTransMode:     txnMode === 'Debit from Other CC' ? 2 : 1,
            Action:            'Save',
        };

        // Add invoice-specific fields for non-advance types
        if (!isAdvance && selectedInvoiceData.length > 0) {
            payload.InvoiceNos     = selectedInvoiceData.map((inv) => inv.InvoiceNo).join(',') + ',';
            payload.MaxInvoiceDate = maxInvoiceDate ? maxInvoiceDate + ',' : '';
        }

        dispatch(saveVendorCashPayment({ paymentType, payload }));
    };

    const isBusy = saveLoading;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6">

            {/* ── Page Header ───────────────────────────────────────────────── */}
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
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Purchase / Cash</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Vendor Cash Payment</h1>
                                <p className="text-indigo-200 text-sm mt-0.5">SPPO vendor payment via cash</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Purchase / Cash</p>
                            </div>
                            <Navigation className="h-5 w-5 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">

                {/* ── Reset Button ──────────────────────────────────────────── */}
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

                {/* ── Section 1: Vendor & Payment Type ─────────────────────── */}
                <SectionCard icon={CreditCard} title="Vendor & Payment Type" subtitle="Select vendor category and payment method">
                    <div className="space-y-5">
                        {/* Vendor Type */}
                        <div>
                            <Label required>Vendor Type</Label>
                            <RadioGroup
                                options={[
                                    { value: 'Supplier',         label: 'Supplier' },
                                    { value: 'Service Provider', label: 'Service Provider' },
                                ]}
                                value={vendorType}
                                onChange={handleVendorTypeChange}
                                disabled={isBusy}
                            />
                        </div>

                        {/* Payment Type — shown after vendor type selected */}
                        {vendorType && (
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <Label required>Payment Type</Label>
                                <div className="relative max-w-sm">
                                    <select
                                        value={paymentType}
                                        onChange={(e) => handlePaymentTypeChange(e.target.value)}
                                        disabled={paymentTypesLoading || isBusy}
                                        className={selectCls}
                                    >
                                        <option value="">{paymentTypesLoading ? 'Loading...' : '— Select Payment Type —'}</option>
                                        {paymentTypes.map((pt, idx) => (
                                            <option key={pt.PaymentType || pt.Type || idx} value={pt.PaymentType || pt.Type}>
                                                {pt.TypeDesc || pt.PaymentType || pt.Type}
                                            </option>
                                        ))}
                                    </select>
                                    <SelectIcon loading={paymentTypesLoading} />
                                </div>
                            </div>
                        )}
                    </div>
                </SectionCard>

                {/* ── Section 2: Mode of Transaction — shown after payment type ─ */}
                {vendorType && paymentType && (
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Self CC */}
                                    <div>
                                        <Label required>Self Cost Center</Label>
                                        <div className="relative">
                                            <select
                                                value={selfCC}
                                                onChange={(e) => handleSelfCCChange(e.target.value)}
                                                disabled={selfCCLoading || isBusy}
                                                className={selectCls}
                                            >
                                                <option value="">{selfCCLoading ? 'Loading...' : '— Select Self CC —'}</option>
                                                {selfCCList.map((cc) => (
                                                    <option key={cc.CC_Id} value={cc.CC_Code.split(',')[0].trim()}>{cc.CC_Code}</option>
                                                ))}
                                            </select>
                                            <SelectIcon loading={selfCCLoading} />
                                        </div>
                                    </div>

                                    {/* Other CC — only if Debit from Other CC */}
                                    {txnMode === 'Debit from Other CC' && (
                                        <div>
                                            <Label required>Other Cost Center</Label>
                                            <div className="relative">
                                                <select
                                                    value={otherCC}
                                                    onChange={(e) => handleOtherCCChange(e.target.value)}
                                                    disabled={otherCCLoading || isBusy}
                                                    className={selectCls}
                                                >
                                                    <option value="">{otherCCLoading ? 'Loading...' : '— Select Other CC —'}</option>
                                                    {otherCCList.map((cc) => (
                                                        <option key={cc.CC_Id} value={cc.CC_Code.split(',')[0].trim()}>{cc.CC_Code}</option>
                                                    ))}
                                                </select>
                                                <SelectIcon loading={otherCCLoading} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </SectionCard>
                )}

                {/* ── Section 3: Vendor — shown after CC selected ───────────── */}
                {effectiveCCCode && vendorType && paymentType && (
                    <SectionCard icon={Users} title="Vendor Selection" subtitle="Select the vendor to pay">
                        {vendorsError && (
                            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {vendorsError}
                            </div>
                        )}
                        <div className="max-w-sm">
                            <Label required>Vendor</Label>
                            <div className="relative">
                                <select
                                    value={vendorCode}
                                    onChange={(e) => handleVendorChange(e.target.value)}
                                    disabled={vendorsLoading || isBusy}
                                    className={selectCls}
                                >
                                    <option value="">{vendorsLoading ? 'Loading vendors...' : vendors.length === 0 ? 'No vendors available' : '— Select Vendor —'}</option>
                                    {vendors.map((v, idx) => (
                                        <option key={v.VendorCode || idx} value={v.VendorCode}>
                                            {v.VendorName || v.VendorCode}
                                        </option>
                                    ))}
                                </select>
                                <SelectIcon loading={vendorsLoading} />
                            </div>
                        </div>
                    </SectionCard>
                )}

                {/* ── Section 4: PO Selection — shown after vendor selected ──── */}
                {vendorCode && (
                    <SectionCard icon={ShoppingCart} title="PO Selection" subtitle="Select one or more Purchase Orders">
                        {poError && (
                            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {poError}
                            </div>
                        )}

                        {poLoading ? (
                            <div className="flex items-center gap-2 py-4 text-indigo-500">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Loading POs...</span>
                            </div>
                        ) : poList.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500 py-2">No POs found for this vendor.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {poList.map((po, idx) => {
                                    const poNo = po.SPPONo || po.PONo || po.PONumber || String(idx);
                                    const isChecked = selectedPOs.includes(poNo);
                                    return (
                                        <label
                                            key={poNo}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold
                                                ${isChecked
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300 bg-white dark:bg-gray-800'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handlePOToggle(poNo)}
                                                disabled={isBusy}
                                                className="accent-indigo-500 w-4 h-4 flex-shrink-0"
                                            />
                                            <span className="truncate">{poNo}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        {/* For Advance: show amount input here directly */}
                        {isAdvance && selectedPOs.length > 0 && (
                            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 max-w-xs">
                                <Label required>Advance Amount (₹)</Label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={advanceAmount}
                                    onChange={(e) => setAdvanceAmount(e.target.value)}
                                    disabled={isBusy}
                                    className={inputCls}
                                />
                            </div>
                        )}
                    </SectionCard>
                )}

                {/* ── Section 5: Invoice Grid — non-advance types ───────────── */}
                {!isAdvance && selectedPOs.length > 0 && (
                    <SectionCard icon={ListChecks} title="Invoice Selection" subtitle="Select invoices and enter pay amounts">
                        {invoiceError && (
                            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {invoiceError}
                            </div>
                        )}

                        {invoiceLoading ? (
                            <div className="flex items-center gap-2 py-4 text-indigo-500">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Loading invoices...</span>
                            </div>
                        ) : invoiceList.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500 py-2">No invoices found for selected POs.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-indigo-50 dark:bg-indigo-900/20">
                                            <th className="px-3 py-3 text-left text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider w-10">Select</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Invoice No</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">PO No</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">CC</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Invoice Date</th>
                                            <th className="px-3 py-3 text-right text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Net Amount</th>
                                            <th className="px-3 py-3 text-right text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Balance</th>
                                            <th className="px-3 py-3 text-right text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider w-36">Pay Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {invoiceList.map((inv, idx) => {
                                            const invNo = inv.InvoiceNo;
                                            const sel   = invoiceSelections[invNo];
                                            const isSelected = sel?.selected || false;
                                            const payAmt     = sel?.payAmount ?? String(inv.Balance || '');

                                            return (
                                                <tr
                                                    key={invNo || idx}
                                                    className={`transition-colors ${isSelected ? 'bg-indigo-50/60 dark:bg-indigo-900/10' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
                                                >
                                                    <td className="px-3 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleInvoiceToggle(invNo, inv.Balance)}
                                                            disabled={isBusy}
                                                            className="accent-indigo-500 w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 font-semibold text-gray-800 dark:text-gray-200">{invNo}</td>
                                                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{inv.SPPONo || inv.PONo || inv.PONumber || '—'}</td>
                                                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{inv.CCCode || inv.CC || '—'}</td>
                                                    <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{inv.SPPOInvoiceDate || inv.InvoiceDate || '—'}</td>
                                                    <td className="px-3 py-3 text-right font-semibold text-gray-800 dark:text-gray-200">₹{fmt(inv.NetAmount)}</td>
                                                    <td className="px-3 py-3 text-right font-semibold text-indigo-600 dark:text-indigo-400">₹{fmt(inv.Balance)}</td>
                                                    <td className="px-3 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            max={inv.Balance}
                                                            value={payAmt}
                                                            onChange={(e) => handlePayAmountChange(invNo, e.target.value, inv.Balance)}
                                                            disabled={!isSelected || isBusy}
                                                            className={`w-full px-2.5 py-1.5 rounded-lg border-2 text-sm text-right font-semibold
                                                                ${isSelected
                                                                    ? 'border-indigo-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30'
                                                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-400 cursor-not-allowed'
                                                                }`}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Invoice selection summary */}
                        {selectedInvoiceData.length > 0 && (
                            <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                    {selectedInvoiceData.length} invoice{selectedInvoiceData.length > 1 ? 's' : ''} selected
                                </span>
                                <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                                    Total: ₹{fmt(totalAmount)}
                                </span>
                            </div>
                        )}
                    </SectionCard>
                )}

                {/* ── Section 6: Payment Details — shown after PO selected ──── */}
                {vendorCode && selectedPOs.length > 0 && (
                    <SectionCard icon={CalendarDays} title="Payment Details" subtitle="Date, amount and remarks for this payment">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Payment Date */}
                            <div>
                                <Label required>Payment Date</Label>
                                <CustomDatePicker
                                    value={paymentDate}
                                    onChange={setPaymentDate}
                                    placeholder="Select payment date"
                                    format="DD/MM/YYYY"
                                />
                            </div>

                            {/* Remarks */}
                            <div>
                                <Label>Remarks</Label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Optional remarks"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        disabled={isBusy}
                                        className={inputCls}
                                    />
                                    <StickyNote className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Total amount display */}
                        <div className="mt-5 flex items-center gap-4">
                            <div className="flex-1 p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                                <p className="text-xs font-bold text-indigo-200 uppercase tracking-wide flex items-center gap-1.5">
                                    <IndianRupee className="h-3.5 w-3.5" /> Total Payment Amount
                                </p>
                                <p className="text-3xl font-black mt-1">₹{fmt(totalAmount)}</p>
                                <p className="text-xs text-indigo-200 mt-0.5">
                                    {isAdvance ? 'Advance payment' : `${selectedInvoiceData.length} invoice(s)`}
                                </p>
                            </div>
                        </div>
                    </SectionCard>
                )}

                {/* ── Summary Card — shown after CC is selected ─────────────── */}
                {effectiveCCCode && vendorCode && selectedPOs.length > 0 && (() => {
                    const selfCCLabel  = selfCC  || '—';
                    const otherCCLabel = otherCC || '—';
                    const vendorLabel  = vendors.find(v => v.VendorCode === vendorCode)?.VendorName || vendorCode || '—';

                    const rows = [
                        { label: 'Vendor Type',       value: vendorType || '—' },
                        { label: 'Payment Type',      value: paymentType || '—' },
                        { label: 'Transaction Mode',  value: txnMode || '—' },
                        { label: 'Self CC',           value: selfCCLabel },
                        ...(txnMode === 'Debit from Other CC' ? [{ label: 'Other CC', value: otherCCLabel }] : []),
                        { label: 'Vendor',            value: vendorLabel },
                        { label: 'POs Selected',      value: selectedPOs.length > 0 ? `${selectedPOs.length} PO(s)` : '—' },
                        ...(!isAdvance ? [{ label: 'Invoices Selected', value: selectedInvoiceData.length > 0 ? `${selectedInvoiceData.length} invoice(s)` : '—' }] : []),
                        { label: 'Payment Date',      value: paymentDate ? new Date(paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                        { label: 'Remarks',           value: remarks.trim() || '—' },
                        { label: 'Total Amount',      value: `₹${fmt(totalAmount)}`, highlight: true },
                    ];

                    return (
                        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/10 overflow-hidden">
                            <div className="px-5 py-3 bg-indigo-100/80 dark:bg-indigo-900/30 border-b border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-500" />
                                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Selection Summary</p>
                                <span className="ml-auto text-xs text-indigo-500 dark:text-indigo-400">Review before submitting</span>
                            </div>
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

                {/* ── Submit Button ─────────────────────────────────────────── */}
                {vendorCode && selectedPOs.length > 0 && (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isBusy}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {saveLoading
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                                : <><Send className="h-4 w-4" /> Submit Payment</>
                            }
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VendorCashPayment;
