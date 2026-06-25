import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    ShoppingCart, Package, Building2, ChevronDown, Loader2,
    Plus, Trash2, FileText, CheckCircle, AlertTriangle,
    Upload, IndianRupee, Phone, MapPin, BookOpen, X,
    RefreshCw, Send, Search,
} from 'lucide-react';

import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchSupplierIndents,
    checkPartIndentExist,
    fetchPOGridData,
    fetchSupplierVendors,
    checkPOBudget,
    submitSupplierPO,
    fetchTermHeads,
    fetchTermRemarks,
    clearPartIndentCheck,
    clearGridData,
    clearTermRemarks,
    clearBudgetResult,
    clearSaveResult,
    resetCreation,
    selectIndentList,
    selectPartIndentList,
    selectPartIndentCheck,
    selectPOGridData,
    selectVendors,
    selectTermHeads,
    selectTermRemarks,
    selectBudgetResult,
    selectSaveResult,
    selectPOCreationLoading,
    selectPOCreationErrors,
} from '../../slices/supplierPOSlice/supplierPOCreationSlice';

// ── Shared UI primitives ──────────────────────────────────────────────────────

const inputCls =
    'w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-800 ' +
    'text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed transition-colors';

const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
        {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
);

const SectionCard = ({ icon: Icon, title, subtitle, children, accent = 'indigo' }) => {
    const colors = {
        indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300',
        green:  'from-green-50  to-green-100  dark:from-green-900/20  dark:to-green-800/20  border-green-200  dark:border-green-700  text-green-800  dark:text-green-300',
        purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300',
        amber:  'from-amber-50  to-amber-100  dark:from-amber-900/20  dark:to-amber-800/20  border-amber-200  dark:border-amber-700  text-amber-800  dark:text-amber-300',
        teal:   'from-teal-50   to-teal-100   dark:from-teal-900/20   dark:to-teal-800/20   border-teal-200   dark:border-teal-700   text-teal-800   dark:text-teal-300',
        rose:   'from-rose-50   to-rose-100   dark:from-rose-900/20   dark:to-rose-800/20   border-rose-200   dark:border-rose-700   text-rose-800   dark:text-rose-300',
    };
    const cls = colors[accent] || colors.indigo;
    return (
        <div className={`bg-gradient-to-br ${cls} rounded-xl border p-5 space-y-4`}>
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <h3 className="font-semibold text-sm">{title}</h3>
                {subtitle && <span className="text-xs opacity-70 ml-1">{subtitle}</span>}
            </div>
            {children}
        </div>
    );
};

const SpinnerIcon = () => <Loader2 className="w-4 h-4 animate-spin" />;

// Extract CCType from the menu path string
const parseCCType = (menuData) => {
    const path = menuData?.path || '';
    const m = path.match(/[?&]CCType=([^&]+)/i);
    if (m) return m[1].toUpperCase();
    if (path.toLowerCase().includes('npcc')) return 'NPCC';
    return 'PCC';
};

// ── Main Component ────────────────────────────────────────────────────────────

const SupplierPOCreation = ({ menuData }) => {
    const dispatch   = useDispatch();
    const { userData } = useSelector((s) => s.auth);

    const roleId = userData?.roleId || userData?.RID || '';
    const userId = userData?.UID   || userData?.uid  || '';
    const ccType = parseCCType(menuData);

    // Redux state
    const indentList      = useSelector(selectIndentList);
    const partIndentList  = useSelector(selectPartIndentList);
    const partIndentCheck = useSelector(selectPartIndentCheck);
    const gridData        = useSelector(selectPOGridData);
    const vendors         = useSelector(selectVendors);
    const termHeads       = useSelector(selectTermHeads);
    const termRemarks     = useSelector(selectTermRemarks);
    const budgetResult    = useSelector(selectBudgetResult);
    const saveResult      = useSelector(selectSaveResult);
    const loading         = useSelector(selectPOCreationLoading);
    const errors          = useSelector(selectPOCreationErrors);

    // ── Local state ───────────────────────────────────────────────────────────

    const [activeTab, setActiveTab]                   = useState('new'); // 'new' | 'part'
    const [selectedIndentNo, setSelectedIndentNo]     = useState('');
    const [loadedIndentNo, setLoadedIndentNo]         = useState('');
    const [showPartWarning, setShowPartWarning]       = useState(false);
    const [pendingIndentNo, setPendingIndentNo]       = useState('');

    // Editable grid rows keyed by IndentListId
    const [rowEdits, setRowEdits] = useState({});

    // Header form
    const [header, setHeader] = useState({
        vendorId: '', vendorName: '',
        poDate: '', poExpiryDate: '',
        paymentType: 'Direct',
        ref: '',
        lcApplicable: 'No',
    });

    // Address & GST
    const [addr, setAddr] = useState({
        invoiceAddress: '', deliveryAddress: '',
        companyGstNo: '', vendorGstNo: '', contactPersonNo: '',
    });

    // Terms & Conditions lines
    const [termsLines, setTermsLines] = useState([{ id: Date.now(), text: '' }]);

    // Predefined T&C modal
    const [showPredefinedConfirm, setShowPredefinedConfirm] = useState(false);
    const [showPredefinedModal, setShowPredefinedModal]     = useState(false);
    const [selectedHeadId, setSelectedHeadId]               = useState('');
    const [selectedHeadName, setSelectedHeadName]           = useState('');

    // QC upload
    const [qcFile, setQcFile] = useState(null);

    // Budget checked gate
    const [budgetPassed, setBudgetPassed] = useState(false);

    // ── Init ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (roleId && userId) {
            dispatch(fetchSupplierIndents({ roleId, userId, ccType }));
            dispatch(fetchSupplierVendors());
        }
        return () => dispatch(resetCreation());
    }, [roleId, userId, ccType, dispatch]);

    // Sync grid rows when API data arrives
    useEffect(() => {
        if (gridData.length > 0) {
            const initial = {};
            gridData.forEach((item) => {
                initial[item.IndentListId] = {
                    quotedPrice:    item.QuotedPrice   || 0,
                    poQty:          item.Requestedqty  || item.quantity || 0,
                    purchasePrice:  item.NewBasicprice || 0,
                    remarks:        item.ItemRemarks   || item.ItemRemark || '',
                };
            });
            setRowEdits(initial);
            setBudgetPassed(false);
        }
    }, [gridData]);

    // React to part-indent check result
    useEffect(() => {
        if (partIndentCheck !== null) {
            if (partIndentCheck.POExist) {
                setShowPartWarning(true);
            } else {
                doLoadGrid(pendingIndentNo);
            }
        }
    }, [partIndentCheck]);

    // React to save result
    useEffect(() => {
        if (saveResult) {
            const msg = typeof saveResult === 'string' ? saveResult : 'Supplier PO saved successfully!';
            toast.success(msg);
            handleReset();
        }
    }, [saveResult]);

    // ── Computed values ───────────────────────────────────────────────────────

    const baseValue = useMemo(() => {
        return gridData.reduce((sum, item) => {
            const e = rowEdits[item.IndentListId];
            if (!e) return sum;
            return sum + (parseFloat(e.purchasePrice) || 0) * (parseFloat(e.poQty) || 0);
        }, 0);
    }, [gridData, rowEdits]);

    const qcRequired = baseValue > 50000;

    const indentListIds = useMemo(() =>
        gridData.map((r) => r.IndentListId).join(',') + (gridData.length > 0 ? ',' : ''),
    [gridData]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleIndentSelect = useCallback((indentNo, type) => {
        setSelectedIndentNo(indentNo);
        dispatch(clearPartIndentCheck());
        dispatch(clearGridData());
        setBudgetPassed(false);
        setLoadedIndentNo('');

        if (type === 'new' && indentNo) {
            setPendingIndentNo(indentNo);
            dispatch(checkPartIndentExist(indentNo));
        }
    }, [dispatch]);

    const doLoadGrid = useCallback((indentNo) => {
        if (!indentNo) return;
        setLoadedIndentNo(indentNo);
        dispatch(fetchPOGridData(indentNo));
        setPendingIndentNo('');
        setShowPartWarning(false);
    }, [dispatch]);

    const handleLoadAnyway = () => {
        setShowPartWarning(false);
        doLoadGrid(pendingIndentNo);
    };

    const handlePartIndentSelect = useCallback((indentNo) => {
        setSelectedIndentNo(indentNo);
        dispatch(clearPartIndentCheck());
        dispatch(clearGridData());
        setBudgetPassed(false);
        setLoadedIndentNo('');
        if (indentNo) doLoadGrid(indentNo);
    }, [dispatch, doLoadGrid]);

    const handleRowEdit = (id, field, value) => {
        setBudgetPassed(false);
        setRowEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const handleHeaderChange = (field, value) => {
        setHeader((prev) => ({ ...prev, [field]: value }));
        if (field === 'vendorId') {
            const v = vendors.find((x) => String(x.VendorId || x.vendorId) === String(value));
            setHeader((prev) => ({ ...prev, vendorId: value, vendorName: v?.VendorName || v?.vendorName || '' }));
        }
    };

    const handleAddrChange = (field, value) => setAddr((prev) => ({ ...prev, [field]: value }));

    // T&C line management
    const addTermLine = () =>
        setTermsLines((prev) => [...prev, { id: Date.now(), text: '' }]);

    const updateTermLine = (id, text) =>
        setTermsLines((prev) => prev.map((l) => (l.id === id ? { ...l, text } : l)));

    const removeTermLine = (id) =>
        setTermsLines((prev) => prev.filter((l) => l.id !== id));

    // Predefined T&C flow
    const handleOpenPredefined = () => {
        dispatch(fetchTermHeads());
        setShowPredefinedConfirm(true);
    };

    const handlePredefinedYes = () => {
        setShowPredefinedConfirm(false);
        setShowPredefinedModal(true);
    };

    const handleLoadTermHead = () => {
        if (!selectedHeadId || !selectedHeadName) { toast.warning('Please select a T&C head'); return; }
        dispatch(fetchTermRemarks({ headName: selectedHeadName, headId: selectedHeadId }));
    };

    const handleApplyPredefined = () => {
        if (!termRemarks.length) { toast.warning('No terms loaded for this head'); return; }
        const lines = termRemarks.map((r) => ({
            id: Date.now() + Math.random(),
            text: r.TermRemark || r.Remark || r.Description || String(r),
        }));
        setTermsLines((prev) => {
            const existing = prev.filter((l) => l.text.trim() !== '');
            return [...existing, ...lines];
        });
        setShowPredefinedModal(false);
        dispatch(clearTermRemarks());
        toast.success('Predefined terms added');
    };

    // Budget check
    const handleBudgetCheck = async () => {
        if (!loadedIndentNo) { toast.warning('Load an indent first'); return; }
        if (!gridData.length) { toast.warning('No items in grid'); return; }

        const result = await dispatch(checkPOBudget({
            IndentListids: indentListIds,
            ExtraPOAmt:    0,
            IndentNo:      loadedIndentNo,
        }));

        if (checkPOBudget.fulfilled.match(result)) {
            const msg = result.payload;
            if (typeof msg === 'string' && msg.toLowerCase().includes('ok')) {
                toast.success('Budget check passed');
                setBudgetPassed(true);
            } else {
                toast.error(typeof msg === 'string' ? msg : 'Budget check failed. Please review amounts.');
                setBudgetPassed(false);
            }
        }
    };

    // Validate and submit
    const handleSubmit = async () => {
        if (!loadedIndentNo)    { toast.error('Please load an indent first'); return; }
        if (!header.vendorId)   { toast.error('Please select a supplier'); return; }
        if (!header.poDate)     { toast.error('Please enter PO Date'); return; }
        if (!header.poExpiryDate) { toast.error('Please enter PO Expiry Date'); return; }
        if (!budgetPassed)      { toast.error('Please run Budget Check before saving'); return; }
        if (qcRequired && !qcFile) { toast.error('PO value exceeds ₹50,000 — please upload QC document'); return; }

        const itemsHavePrice = gridData.every((item) => {
            const e = rowEdits[item.IndentListId];
            return e && parseFloat(e.purchasePrice) > 0 && parseFloat(e.poQty) > 0;
        });
        if (!itemsHavePrice) { toast.error('All items must have PO Qty and Purchase Price > 0'); return; }

        const items = gridData.map((item) => {
            const e = rowEdits[item.IndentListId] || {};
            return {
                IndentListId:  item.IndentListId,
                Itemcode:      item.itemcode,
                QuotedPrice:   parseFloat(e.quotedPrice)   || 0,
                POQty:         parseFloat(e.poQty)         || 0,
                PurchasePrice: parseFloat(e.purchasePrice) || 0,
                Amount:        (parseFloat(e.purchasePrice) || 0) * (parseFloat(e.poQty) || 0),
                ItemRemarks:   e.remarks || '',
                HSNCode:       item.HSNCode || '',
                CGSTPercent:   item.CGSTPercent || 0,
                SGSTPercent:   item.SGSTPercent || 0,
                IGSTPercent:   item.IGSTPercent || 0,
            };
        });

        const termsText = termsLines
            .map((l) => l.text.trim())
            .filter(Boolean)
            .join('||');

        // QC file as base64
        let qcBase64 = '';
        if (qcFile) {
            qcBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result.split(',')[1] || '');
                reader.readAsDataURL(qcFile);
            });
        }

        const payload = {
            IndentNo:          loadedIndentNo,
            IndentListids:     indentListIds,
            CCType:            ccType,
            VendorId:          header.vendorId,
            VendorName:        header.vendorName,
            PODate:            header.poDate,
            POExpiryDate:      header.poExpiryDate,
            PaymentType:       header.paymentType,
            Ref:               header.ref,
            LCApplicable:      header.lcApplicable,
            InvoiceAddress:    addr.invoiceAddress,
            DeliveryAddress:   addr.deliveryAddress,
            CompanyGSTNo:      addr.companyGstNo,
            VendorGSTNo:       addr.vendorGstNo,
            ContactPersonNo:   addr.contactPersonNo,
            TermsAndConditions:termsText,
            BaseValue:         baseValue,
            Items:             items,
            QCDocument:        qcBase64,
            QCFileName:        qcFile?.name || '',
            RoleId:            parseInt(roleId) || 0,
            CreatedBy:         String(userId),
        };

        dispatch(submitSupplierPO(payload));
    };

    const handleReset = () => {
        setSelectedIndentNo('');
        setLoadedIndentNo('');
        setRowEdits({});
        setHeader({ vendorId: '', vendorName: '', poDate: '', poExpiryDate: '', paymentType: 'Direct', ref: '', lcApplicable: 'No' });
        setAddr({ invoiceAddress: '', deliveryAddress: '', companyGstNo: '', vendorGstNo: '', contactPersonNo: '' });
        setTermsLines([{ id: Date.now(), text: '' }]);
        setQcFile(null);
        setBudgetPassed(false);
        dispatch(clearGridData());
        dispatch(clearPartIndentCheck());
        dispatch(clearBudgetResult());
        dispatch(clearSaveResult());
        if (roleId && userId) dispatch(fetchSupplierIndents({ roleId, userId, ccType }));
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const gridHasData = gridData.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 space-y-5">

            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
                        <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                            Supplier PO Creation
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            CC Type: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{ccType}</span>
                        </p>
                    </div>
                </div>
                <button onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
            </div>

            {/* ── 1. Indent Selection ──────────────────────────────────────── */}
            <SectionCard icon={Search} title="Indent Selection" accent="indigo">
                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg w-fit border border-gray-200 dark:border-gray-700">
                    {['new', 'part'].map((tab) => (
                        <button key={tab}
                            onClick={() => { setActiveTab(tab); setSelectedIndentNo(''); dispatch(clearPartIndentCheck()); dispatch(clearGridData()); setBudgetPassed(false); setLoadedIndentNo(''); }}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                                activeTab === tab
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}>
                            {tab === 'new' ? 'New Indents' : 'Part Indents'}
                        </button>
                    ))}
                </div>

                {loading.indents ? (
                    <div className="flex items-center gap-2 text-indigo-600 text-sm"><SpinnerIcon /> Loading indents…</div>
                ) : (
                    <div className="flex items-end gap-3 flex-wrap">
                        <div className="flex-1 min-w-[260px]">
                            <Label required>
                                {activeTab === 'new' ? 'Select New Indent' : 'Select Part Indent'}
                            </Label>
                            <div className="relative">
                                <select
                                    className={inputCls}
                                    value={selectedIndentNo}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedIndentNo(val);
                                        if (activeTab === 'new') handleIndentSelect(val, 'new');
                                        else handlePartIndentSelect(val);
                                    }}>
                                    <option value="">-- Select Indent --</option>
                                    {(activeTab === 'new' ? indentList : partIndentList).map((i) => (
                                        <option key={i.IndentId} value={i.IndentNo}>{i.IndentNo}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Load Items button for new indents (part indents auto-load) */}
                        {activeTab === 'new' && selectedIndentNo && !showPartWarning && (
                            <button
                                onClick={() => {
                                    dispatch(clearPartIndentCheck());
                                    setPendingIndentNo(selectedIndentNo);
                                    dispatch(checkPartIndentExist(selectedIndentNo));
                                }}
                                disabled={loading.partIndentCheck || loading.gridData}
                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                                {(loading.partIndentCheck || loading.gridData) ? <SpinnerIcon /> : <Package className="w-4 h-4" />}
                                Load Items
                            </button>
                        )}

                        {loading.gridData && (
                            <div className="flex items-center gap-2 text-sm text-indigo-600"><SpinnerIcon /> Loading items…</div>
                        )}

                        {loadedIndentNo && (
                            <div className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" /> Loaded: {loadedIndentNo}
                            </div>
                        )}
                    </div>
                )}

                {/* Part indent warning */}
                {showPartWarning && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Part Indent Exists</p>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                                    A part indent against this cost center already exists — there are pending requirements from a previous PO
                                    for this cost center. Do you still want to create a new PO from this new request?
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={handleLoadAnyway}
                                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold">
                                        Yes, Proceed
                                    </button>
                                    <button onClick={() => { setShowPartWarning(false); setSelectedIndentNo(''); dispatch(clearPartIndentCheck()); }}
                                        className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-semibold">
                                        No, Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Part indent list reference */}
                {activeTab === 'new' && partIndentList.length > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-3">
                        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                            Part Indents pending for this CC:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {partIndentList.map((p) => (
                                <span key={p.IndentId}
                                    className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded text-xs font-mono">
                                    {p.IndentNo}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </SectionCard>

            {/* ── 2. PO Header ─────────────────────────────────────────────── */}
            {gridHasData && (
                <SectionCard icon={Building2} title="PO Header" accent="green">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Supplier */}
                        <div>
                            <Label required>Supplier / Vendor</Label>
                            <div className="relative">
                                <select className={inputCls} value={header.vendorId}
                                    onChange={(e) => handleHeaderChange('vendorId', e.target.value)}>
                                    <option value="">-- Select Supplier --</option>
                                    {vendors.map((v) => {
                                        const id   = v.VendorId   || v.vendorId   || v.VID;
                                        const name = v.VendorName || v.vendorName || v.Name;
                                        return <option key={id} value={id}>{name}</option>;
                                    })}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                    {loading.vendors ? <SpinnerIcon /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                </div>
                            </div>
                        </div>

                        {/* PO Date */}
                        <div>
                            <Label required>PO Date</Label>
                            <CustomDatePicker
                                value={header.poDate}
                                onChange={(d) => handleHeaderChange('poDate', d)}
                                format="DD-MMM-YYYY"
                                placeholder="Select PO Date"
                            />
                        </div>

                        {/* PO Expiry Date */}
                        <div>
                            <Label required>PO Expiry Date</Label>
                            <CustomDatePicker
                                value={header.poExpiryDate}
                                onChange={(d) => handleHeaderChange('poExpiryDate', d)}
                                format="DD-MMM-YYYY"
                                placeholder="Select Expiry Date"
                                minDate={header.poDate || undefined}
                            />
                        </div>

                        {/* Payment Type */}
                        <div>
                            <Label required>Payment Type</Label>
                            <div className="relative">
                                <select className={inputCls} value={header.paymentType}
                                    onChange={(e) => handleHeaderChange('paymentType', e.target.value)}>
                                    <option value="Direct">Direct</option>
                                    <option value="Third Party">Third Party</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Reference */}
                        <div>
                            <Label>Reference / Quotation No.</Label>
                            <input className={inputCls} placeholder="Enter reference…"
                                value={header.ref} onChange={(e) => handleHeaderChange('ref', e.target.value)} />
                        </div>

                        {/* LC Applicable */}
                        <div>
                            <Label>LC Applicable</Label>
                            <div className="flex gap-3 mt-2">
                                {['Yes', 'No'].map((opt) => (
                                    <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" name="lcApplicable" value={opt}
                                            checked={header.lcApplicable === opt}
                                            onChange={() => handleHeaderChange('lcApplicable', opt)}
                                            className="text-indigo-600" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </SectionCard>
            )}

            {/* ── 3. Items Grid ─────────────────────────────────────────────── */}
            {gridHasData && (
                <SectionCard icon={Package}
                    title="Item Details"
                    subtitle={`${gridData.length} item${gridData.length !== 1 ? 's' : ''}`}
                    accent="purple">

                    <div className="overflow-x-auto rounded-lg border border-purple-200 dark:border-purple-700">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                    {['#', 'Item Code', 'Item Name', 'Specification', 'DCA', 'Unit',
                                      'Indent Qty', 'Quoted Price*', 'PO Qty*', 'Purchase Price*', 'Amount', 'Remarks*'].map((h) => (
                                        <th key={h} className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {gridData.map((item, idx) => {
                                    const e   = rowEdits[item.IndentListId] || {};
                                    const amt = (parseFloat(e.purchasePrice) || 0) * (parseFloat(e.poQty) || 0);
                                    const row = idx % 2 === 0
                                        ? 'bg-white dark:bg-gray-800'
                                        : 'bg-purple-50/40 dark:bg-purple-900/10';
                                    return (
                                        <tr key={item.IndentListId} className={`${row} border-b border-purple-100 dark:border-purple-800 last:border-0`}>
                                            <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                                            <td className="px-3 py-2 font-mono text-gray-800 dark:text-gray-200 whitespace-nowrap">{item.itemcode?.trim()}</td>
                                            <td className="px-3 py-2 text-gray-800 dark:text-gray-200 max-w-[180px]">
                                                <p className="font-medium">{item.itemname}</p>
                                                <p className="text-gray-500 dark:text-gray-400 text-[10px]">{item.subdcacode}</p>
                                            </td>
                                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400 max-w-[160px] text-[10px]">{item.specification}</td>
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{item.dcacode}</td>
                                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.units}</td>
                                            <td className="px-3 py-2 text-right font-semibold text-gray-800 dark:text-gray-200">{item.Requestedqty ?? item.quantity}</td>

                                            {/* Quoted Price */}
                                            <td className="px-2 py-1.5">
                                                <input type="number" min="0" step="0.01"
                                                    className={`${inputCls} w-24 text-right`}
                                                    value={e.quotedPrice ?? ''}
                                                    onChange={(ev) => handleRowEdit(item.IndentListId, 'quotedPrice', ev.target.value)} />
                                            </td>

                                            {/* PO Qty */}
                                            <td className="px-2 py-1.5">
                                                <input type="number" min="0" step="0.01"
                                                    className={`${inputCls} w-20 text-right`}
                                                    value={e.poQty ?? ''}
                                                    onChange={(ev) => handleRowEdit(item.IndentListId, 'poQty', ev.target.value)} />
                                            </td>

                                            {/* Purchase Price */}
                                            <td className="px-2 py-1.5">
                                                <input type="number" min="0" step="0.01"
                                                    className={`${inputCls} w-24 text-right`}
                                                    value={e.purchasePrice ?? ''}
                                                    onChange={(ev) => handleRowEdit(item.IndentListId, 'purchasePrice', ev.target.value)} />
                                            </td>

                                            {/* Amount (computed) */}
                                            <td className="px-3 py-2 text-right font-semibold text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
                                                ₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>

                                            {/* Remarks */}
                                            <td className="px-2 py-1.5">
                                                <input type="text" placeholder="Notes…"
                                                    className={`${inputCls} w-36`}
                                                    value={e.remarks ?? ''}
                                                    onChange={(ev) => handleRowEdit(item.IndentListId, 'remarks', ev.target.value)} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
                                    <td colSpan={10} className="px-3 py-2.5 text-right font-bold text-gray-700 dark:text-gray-300 text-xs">
                                        Base Value (excl. tax):
                                    </td>
                                    <td className="px-3 py-2.5 text-right font-bold text-lg text-indigo-700 dark:text-indigo-400">
                                        ₹{baseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {qcRequired && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            PO base value exceeds ₹50,000 — QC document upload is mandatory (see section below).
                        </div>
                    )}
                </SectionCard>
            )}

            {/* ── 4. Address, GST & Contact ─────────────────────────────────── */}
            {gridHasData && (
                <SectionCard icon={MapPin} title="Address, GST & Contact" accent="teal">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label required>Invoice Address</Label>
                            <textarea rows={3} className={inputCls} placeholder="Enter invoice address…"
                                value={addr.invoiceAddress}
                                onChange={(e) => handleAddrChange('invoiceAddress', e.target.value)} />
                        </div>
                        <div>
                            <Label required>Delivery Address</Label>
                            <textarea rows={3} className={inputCls} placeholder="Enter delivery address…"
                                value={addr.deliveryAddress}
                                onChange={(e) => handleAddrChange('deliveryAddress', e.target.value)} />
                        </div>
                        <div>
                            <Label>Company GST No.</Label>
                            <input className={inputCls} placeholder="Enter company GST number…"
                                value={addr.companyGstNo}
                                onChange={(e) => handleAddrChange('companyGstNo', e.target.value)} />
                        </div>
                        <div>
                            <Label>Vendor GST No.</Label>
                            <input className={inputCls} placeholder="Enter vendor GST number…"
                                value={addr.vendorGstNo}
                                onChange={(e) => handleAddrChange('vendorGstNo', e.target.value)} />
                        </div>
                        <div>
                            <Label>Contact Person No.</Label>
                            <input className={`${inputCls} font-mono`} placeholder="Enter contact number…"
                                value={addr.contactPersonNo}
                                onChange={(e) => handleAddrChange('contactPersonNo', e.target.value)} />
                        </div>
                    </div>
                </SectionCard>
            )}

            {/* ── 5. Terms & Conditions ────────────────────────────────────── */}
            {gridHasData && (
                <SectionCard icon={BookOpen} title="Terms & Conditions" accent="amber">
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={addTermLine}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold">
                            <Plus className="w-3.5 h-3.5" /> Add Line
                        </button>
                        <button onClick={handleOpenPredefined}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                            <FileText className="w-3.5 h-3.5" /> Use Predefined T&amp;C
                        </button>
                    </div>

                    <div className="space-y-2">
                        {termsLines.map((line, idx) => (
                            <div key={line.id} className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 dark:text-gray-500 w-5 text-right shrink-0">{idx + 1}.</span>
                                <input type="text" placeholder={`Term / Condition ${idx + 1}…`}
                                    className={`${inputCls} flex-1`}
                                    value={line.text}
                                    onChange={(e) => updateTermLine(line.id, e.target.value)} />
                                {termsLines.length > 1 && (
                                    <button onClick={() => removeTermLine(line.id)}
                                        className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* ── 6. QC Upload (conditional) ────────────────────────────────── */}
            {gridHasData && qcRequired && (
                <SectionCard icon={Upload} title="QC Document Upload" subtitle="Required — PO value > ₹50,000" accent="rose">
                    <div className="flex items-center gap-4 flex-wrap">
                        <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium cursor-pointer">
                            <Upload className="w-4 h-4" />
                            {qcFile ? 'Change File' : 'Choose File'}
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                                onChange={(e) => setQcFile(e.target.files[0] || null)} />
                        </label>
                        {qcFile ? (
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700 dark:text-gray-300">{qcFile.name}</span>
                                <span className="text-xs text-gray-400">({(qcFile.size / 1024).toFixed(1)} KB)</span>
                                <button onClick={() => setQcFile(null)}
                                    className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <span className="text-xs text-rose-600 dark:text-rose-400">No file chosen — PDF / JPG / PNG accepted</span>
                        )}
                    </div>
                </SectionCard>
            )}

            {/* ── 7. Budget Check & Submit ──────────────────────────────────── */}
            {gridHasData && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 flex-wrap">
                            {/* Budget status badge */}
                            {budgetPassed && (
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 px-3 py-1.5 rounded-full">
                                    <CheckCircle className="w-3.5 h-3.5" /> Budget OK
                                </span>
                            )}
                            {errors.budget && (
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 px-3 py-1.5 rounded-full">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Budget Failed
                                </span>
                            )}
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Base Value: <span className="font-bold text-indigo-700 dark:text-indigo-400">
                                    ₹{baseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <button onClick={handleBudgetCheck}
                                disabled={loading.budget || !gridHasData}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
                                {loading.budget ? <SpinnerIcon /> : <IndianRupee className="w-4 h-4" />}
                                Check Budget
                            </button>

                            <button onClick={handleSubmit}
                                disabled={loading.save || !budgetPassed}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
                                {loading.save ? <SpinnerIcon /> : <Send className="w-4 h-4" />}
                                {loading.save ? 'Saving…' : 'Save Supplier PO'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Predefined T&C: Confirm Modal ────────────────────────────── */}
            {showPredefinedConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="w-6 h-6 text-amber-600" />
                            <h3 className="font-bold text-gray-900 dark:text-white">Predefined T&amp;C</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Do you want to load predefined Terms &amp; Conditions?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowPredefinedConfirm(false)}
                                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                                No
                            </button>
                            <button onClick={handlePredefinedYes}
                                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold">
                                Yes, Load
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Predefined T&C: Select Head Modal ───────────────────────── */}
            {showPredefinedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-amber-600" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Select T&amp;C Head</h3>
                            </div>
                            <button onClick={() => { setShowPredefinedModal(false); dispatch(clearTermRemarks()); }}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>T&amp;C Head Name</Label>
                                <div className="relative">
                                    <select className={inputCls}
                                        value={selectedHeadId}
                                        onChange={(e) => {
                                            const opt = e.target.options[e.target.selectedIndex];
                                            setSelectedHeadId(e.target.value);
                                            setSelectedHeadName(opt.dataset.name || '');
                                            dispatch(clearTermRemarks());
                                        }}>
                                        <option value="">-- Select Head --</option>
                                        {termHeads.map((h) => {
                                            const id   = h.HeadId   || h.headId   || h.ID;
                                            const name = h.HeadName || h.headName || h.Name;
                                            return (
                                                <option key={id} value={id} data-name={name}>{name}</option>
                                            );
                                        })}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                        {loading.termHeads ? <SpinnerIcon /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleLoadTermHead}
                                disabled={loading.termRemarks || !selectedHeadId}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold disabled:opacity-50">
                                {loading.termRemarks ? <SpinnerIcon /> : <Search className="w-4 h-4" />}
                                Load Terms
                            </button>

                            {termRemarks.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                        {termRemarks.length} term(s) found:
                                    </p>
                                    <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                        {termRemarks.map((r, i) => (
                                            <p key={i} className="text-xs text-gray-700 dark:text-gray-300">
                                                {i + 1}. {r.TermRemark || r.Remark || r.Description || String(r)}
                                            </p>
                                        ))}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => { setShowPredefinedModal(false); dispatch(clearTermRemarks()); }}
                                            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
                                            Cancel
                                        </button>
                                        <button onClick={handleApplyPredefined}
                                            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold">
                                            Apply to PO
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierPOCreation;
