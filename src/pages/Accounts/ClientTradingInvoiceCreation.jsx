import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchTradingCostCenters,
    fetchTradingItems,
    fetchTradingItemTempDetails,
    fetchTradingItemsGrid,
    addTempTradingItems,
    removeTradingStockItem,
    fetchTradingClients,
    fetchTradingSubClients,
    fetchTradingSubClientPO,
    fetchTradingClientGSTNos,
    fetchTradingCompanyGSTNos,
    fetchTradingTCSDCASDCAS,
    submitTradingInvoice,
    clearTradingSaveResult,
    clearTradingTempDetails,
    clearTradingItemsGrid,
    clearTradingSubClients,
    resetTradingInvoice,
    selectTradingCostCenters,
    selectTradingItems,
    selectTradingTempDetails,
    selectTradingItemsGrid,
    selectTradingClients,
    selectTradingSubClients,
    selectTradingPONumbers,
    selectTradingClientGSTNos,
    selectTradingCompanyGSTNos,
    selectTradingTCSDCASDCAS,
    selectTradingSaveResult,
    selectTradingCCLoading,
    selectTradingItemsLoading,
    selectTradingTempLoading,
    selectTradingGridLoading,
    selectTradingClientsLoading,
    selectTradingSubCliLoading,
    selectTradingPOLoading,
    selectTradingGSTLoading,
    selectTradingSaveLoading,
    selectTradingTempSaveLoading,
    selectTradingDeleteLoading,
    selectTradingSaveError,
} from '../../slices/accountsSlice/clientTradingInvoiceSlice';

import {
    ReceiptText, Users, IndianRupee,
    ShieldCheck, Percent, CheckCircle,
    Loader2, ChevronDown, RotateCcw, Send, Navigation,
    ShoppingCart, Plus, Trash2, Package,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const INVOICE_TYPES = [
    { value: 'Invoice Service', label: 'Invoice Service' },
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

const fmt = (v) => {
    const n = parseFloat(v);
    if ((!v && v !== 0) || isNaN(n)) return '0.00';
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Per-row computed values
const rowAmount  = (r) => (parseFloat(r.qty) || 0) * (parseFloat(r.rate) || 0);
const rowCgstAmt = (r) => rowAmount(r) * (parseFloat(r.cgstPer) || 0) / 100;
const rowSgstAmt = (r) => rowAmount(r) * (parseFloat(r.sgstPer) || 0) / 100;
const rowIgstAmt = (r) => rowAmount(r) * (parseFloat(r.igstPer) || 0) / 100;

const buildTaxStrings = (form) => {
    if (form.IsGstApplicable !== 'Yes') return { Taxtypes: null, Taxdcas: null, Taxamounts: null };
    if (form.Statecheck) {
        const cgstTotal = parseFloat(form.Cgstsdcaamt) || 0;
        const sgstTotal = parseFloat(form.Sgstsdcaamt) || 0;
        return {
            Taxtypes:   'CGST,SGST',
            Taxdcas:    `${form.CgstDca},${form.SgstDca}`,
            Taxamounts: `${cgstTotal},${sgstTotal}`,
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

const cellInput = (extraCls = '') =>
    `w-full px-2 py-1 text-right rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-indigo-400 ${extraCls}`;

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
            <button key={opt} type="button" onClick={() => onChange(opt)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    value === opt
                        ? opt === 'Yes' ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                        : 'bg-rose-500 border-rose-500 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                }`}>{opt}</button>
        ))}
    </div>
);

// ── Initial state ──────────────────────────────────────────────────────────────
const INITIAL_FORM = {
    InvoiceType:       '',
    CCCode:            '',
    RANO:              '',
    Clientcode:        '',
    SubClientcode:     '',
    PONumber:          '',
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
    SgstDca:           '',
    Sgstsdca:          '',
    IgstDca:           '',
    Igstsdca:          '',
    IsTCSApplicable:   '',
    TCSDCA:            '',
    TCSSDCA:           '',
    TCSAmount:         '',
};

// ── Component ─────────────────────────────────────────────────────────────────
const ClientTradingInvoiceCreation = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const roleId = userData?.roleId  || userData?.RID  || 0;
    const userId = userData?.userId  || userData?.UID  || userData?.employeeId || '';

    // Redux state
    const costCenters   = useSelector(selectTradingCostCenters);
    const tradeItems    = useSelector(selectTradingItems);
    const tempDetails   = useSelector(selectTradingTempDetails);
    const itemsGrid     = useSelector(selectTradingItemsGrid);
    const clients       = useSelector(selectTradingClients);
    const subClients    = useSelector(selectTradingSubClients);
    const poNumbers     = useSelector(selectTradingPONumbers);
    const clientGSTNos  = useSelector(selectTradingClientGSTNos);
    const companyGSTNos = useSelector(selectTradingCompanyGSTNos);
    const tcsDCASDCAS   = useSelector(selectTradingTCSDCASDCAS);
    const saveResult    = useSelector(selectTradingSaveResult);

    const ccLoading       = useSelector(selectTradingCCLoading);
    const itemsLoading    = useSelector(selectTradingItemsLoading);
    const tempLoading     = useSelector(selectTradingTempLoading);
    const gridLoading     = useSelector(selectTradingGridLoading);
    const clientsLoading  = useSelector(selectTradingClientsLoading);
    const subCliLoading   = useSelector(selectTradingSubCliLoading);
    const poLoading       = useSelector(selectTradingPOLoading);
    const gstLoading      = useSelector(selectTradingGSTLoading);
    const saveLoading     = useSelector(selectTradingSaveLoading);
    const tempSaveLoading = useSelector(selectTradingTempSaveLoading);
    const deleteLoading   = useSelector(selectTradingDeleteLoading);
    const saveError       = useSelector(selectTradingSaveError);

    // Local state
    const [form, setForm]         = useState(INITIAL_FORM);
    const [tradeRows, setTradeRows] = useState([]); // items added to invoice — { id, itemCode, itemName, spec, unit, qty, rate, hsn, cgstPer, sgstPer, igstPer }
    const [selItem, setSelItem]   = useState('');
    const [tempQtys, setTempQtys] = useState({});

    // Derived totals from items
    const basicValue  = tradeRows.reduce((s, r) => s + rowAmount(r), 0);
    const totalCgst   = tradeRows.reduce((s, r) => s + rowCgstAmt(r), 0);
    const totalSgst   = tradeRows.reduce((s, r) => s + rowSgstAmt(r), 0);
    const totalIgst   = tradeRows.reduce((s, r) => s + rowIgstAmt(r), 0);
    const invoiceTotal = basicValue
        + (form.IsGstApplicable === 'Yes' ? (form.Statecheck ? totalCgst + totalSgst : totalIgst) : 0)
        + (form.IsTCSApplicable === 'Yes' ? (parseFloat(form.TCSAmount) || 0) : 0);

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchTradingCompanyGSTNos('GST'));
        dispatch(fetchTradingTCSDCASDCAS());
        return () => { dispatch(resetTradingInvoice()); };
    }, [dispatch]);

    useEffect(() => {
        if (tcsDCASDCAS) {
            setForm(p => ({
                ...p,
                TCSDCA:  p.TCSDCA  || tcsDCASDCAS.TCSDCA  || '',
                TCSSDCA: p.TCSSDCA || tcsDCASDCAS.TCSSDCA || '',
            }));
        }
    }, [tcsDCASDCAS]);

    // Auto-detect GST state from GST number prefixes
    useEffect(() => {
        if (form.ClientGST && form.CompanyGST) {
            const cState = form.ClientGST.replace(/\s.*/, '').substring(0, 2);
            const coState = form.CompanyGST.replace(/\s.*/, '').substring(0, 2);
            setForm(p => ({ ...p, Statecheck: cState === coState }));
        }
    }, [form.ClientGST, form.CompanyGST]);

    // Fetch grid whenever CC is set (loads previously added items)
    useEffect(() => {
        if (form.CCCode) dispatch(fetchTradingItemsGrid(form.CCCode));
    }, [form.CCCode]);

    // When itemsGrid loads, enrich existing tradeRows with server data (name, spec, HSN, GST%)
    // and add any rows from grid not already in local state (for CC-change restore)
    useEffect(() => {
        if (!Array.isArray(itemsGrid) || itemsGrid.length === 0) return;
        setTradeRows(prev => {
            // Build a map of existing local rows by itemCode
            const localMap = {};
            prev.forEach(r => { localMap[r.itemCode] = r; });

            // Build enriched rows from grid data
            const gridMap = {};
            const gridRows = itemsGrid.map(r => {
                const local = localMap[r.OItemcode];
                gridMap[r.OItemcode] = true;
                return {
                    id:       local?.id ?? (Date.now() + Math.random()),
                    itemCode: r.OItemcode || '',
                    itemName: r.OItemname || local?.itemName || '',
                    spec:     r.OItemspecification || local?.spec || '',
                    unit:     r.OUnits || local?.unit || '',
                    qty:      local?.qty ?? parseFloat(r.OItemqty || 0),
                    rate:     local?.rate    ?? parseFloat(r.OSellingBasicprice || 0),
                    hsn:      local?.hsn     ?? (r.OHSN     || ''),
                    cgstPer:  local?.cgstPer ?? (r.Ocgstper || ''),
                    sgstPer:  local?.sgstPer ?? (r.Osgstper || ''),
                    igstPer:  local?.igstPer ?? (r.OIgstper || ''),
                };
            });

            // Keep local rows not yet returned by grid (newly added, pending server)
            const localOnly = prev.filter(r => !gridMap[r.itemCode]);
            return [...gridRows, ...localOnly];
        });
    }, [itemsGrid]);

    // Handle save result
    useEffect(() => {
        if (!saveResult) return;
        const msg = typeof saveResult === 'string' ? saveResult : saveResult?.Message || '';
        if (msg === 'Submited' || msg.toLowerCase().includes('success')) {
            toast.success('Trading invoice submitted successfully!');
            handleReset();
        } else if (msg) {
            toast.error(msg);
        }
        dispatch(clearTradingSaveResult());
    }, [saveResult]);

    useEffect(() => {
        if (saveError) toast.error(saveError);
    }, [saveError]);

    // ── Cascade Handlers ──────────────────────────────────────────────────────
    const handleInvoiceTypeChange = (val) => {
        setForm(p => ({ ...INITIAL_FORM, InvoiceType: val, TCSDCA: p.TCSDCA, TCSSDCA: p.TCSSDCA }));
        setTradeRows([]);
        setSelItem('');
        setTempQtys({});
        dispatch(clearTradingItemsGrid());
        if (val) dispatch(fetchTradingCostCenters(val));
    };

    const handleCCChange = (ccCode) => {
        setForm(p => ({ ...INITIAL_FORM, InvoiceType: p.InvoiceType, CCCode: ccCode, TCSDCA: p.TCSDCA, TCSSDCA: p.TCSSDCA }));
        setTradeRows([]);
        setSelItem('');
        setTempQtys({});
        dispatch(clearTradingTempDetails());
        dispatch(clearTradingSubClients());
        if (ccCode) {
            dispatch(fetchTradingItems(ccCode));
            dispatch(fetchTradingClients(ccCode));
        }
    };

    const handleClientChange = (clientcode) => {
        setForm(p => ({ ...p, Clientcode: clientcode, SubClientcode: '', PONumber: '' }));
        dispatch(clearTradingSubClients());
        if (clientcode && form.CCCode) {
            dispatch(fetchTradingSubClients({ ccCode: form.CCCode, clientcode }));
        }
    };

    const handleSubClientChange = (subClientcode) => {
        setForm(p => ({ ...p, SubClientcode: subClientcode, PONumber: '' }));
        if (subClientcode && form.CCCode && form.Clientcode) {
            dispatch(fetchTradingSubClientPO({ subClient: subClientcode, ccCode: form.CCCode, clientcode: form.Clientcode }));
            dispatch(fetchTradingClientGSTNos({ taxtype: 'SubClient', taxfor: subClientcode }));
        }
    };

    // ── Item Handlers ─────────────────────────────────────────────────────────
    const handleItemSelect = (itemcode) => {
        setSelItem(itemcode);
        setTempQtys({});
        dispatch(clearTradingTempDetails());
        if (itemcode && form.CCCode) {
            dispatch(fetchTradingItemTempDetails({ itemcode, ccCode: form.CCCode }));
        }
    };

    const handleAddToInvoice = () => {
        if (!selItem) { toast.warn('Select a trade item'); return; }
        if (!tempDetails.length) { toast.warn('No temp details available for this item'); return; }

        const rowsWithQty = tempDetails.filter(r => parseFloat(tempQtys[r.TempId] || 0) > 0);
        if (!rowsWithQty.length) { toast.warn('Enter issue quantity for at least one row'); return; }

        const rowids   = tempDetails.map(r => r.TempId || '').join(',');
        const codes    = tempDetails.map(r => r.TempItemcode || selItem).join(',');
        const qtys     = tempDetails.map(r => tempQtys[r.TempId] || '0').join(',');
        const tblnames = tempDetails.map(r => r.Tblname || '').join(',');

        dispatch(addTempTradingItems({
            Trowids:         rowids,
            TItemCodes:      codes,
            TNewQtys:        qtys,
            Ttblnames:       tblnames,
            TCCCode:         form.CCCode,
            TSingleItemcode: selItem,
        }))
            .unwrap()
            .then(() => {
                // Add row immediately to state so it shows without waiting for grid re-fetch
                const itemMeta = tradeItems.find(i => (i.ItemCode || i.Itemcode) === selItem);
                const totalQty = rowsWithQty.reduce((s, r) => s + parseFloat(tempQtys[r.TempId] || 0), 0);
                setTradeRows(prev => {
                    const exists = prev.findIndex(r => r.itemCode === selItem);
                    if (exists >= 0) {
                        // Merge qty if item already in table
                        return prev.map((r, i) => i === exists ? { ...r, qty: r.qty + totalQty } : r);
                    }
                    return [...prev, {
                        id:       Date.now() + Math.random(),
                        itemCode: selItem,
                        itemName: itemMeta?.ItemName || itemMeta?.Itemname || selItem,
                        spec:     itemMeta?.Specification || itemMeta?.specification || '',
                        unit:     itemMeta?.Unit || itemMeta?.unit || '',
                        qty:      totalQty,
                        rate:     0,
                        hsn:      '',
                        cgstPer:  '',
                        sgstPer:  '',
                        igstPer:  '',
                    }];
                });
                setSelItem('');
                setTempQtys({});
                dispatch(clearTradingTempDetails());
                // Also re-fetch grid to enrich rows with server data (spec, HSN, GST %)
                dispatch(fetchTradingItemsGrid(form.CCCode));
            })
            .catch(err => toast.error(err || 'Failed to add item'));
    };

    const updateRow = (id, field, value) => {
        setTradeRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleRemoveRow = (row) => {
        dispatch(removeTradingStockItem({ DItemcode: row.itemCode, DCCCode: form.CCCode }))
            .unwrap()
            .then(() => setTradeRows(prev => prev.filter(r => r.id !== row.id)))
            .catch(err => toast.error(err || 'Failed to remove item'));
    };

    // ── Reset ─────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setForm(p => ({ ...INITIAL_FORM, TCSDCA: tcsDCASDCAS?.TCSDCA || '', TCSSDCA: tcsDCASDCAS?.TCSSDCA || '' }));
        setTradeRows([]);
        setSelItem('');
        setTempQtys({});
        dispatch(clearTradingTempDetails());
        dispatch(clearTradingItemsGrid());
        dispatch(fetchTradingCompanyGSTNos('GST'));
        dispatch(fetchTradingTCSDCASDCAS());
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!form.InvoiceType)      { toast.warn('Select an Invoice Type');        return; }
        if (!form.CCCode)           { toast.warn('Select a Cost Center');          return; }
        if (tradeRows.length === 0) { toast.warn('Add at least one item');         return; }
        if (!form.Clientcode)       { toast.warn('Select a Client');               return; }
        if (!form.SubClientcode)    { toast.warn('Select a Sub-Client');           return; }
        if (!form.PONumber)         { toast.warn('Select a PO Number');            return; }
        if (!form.ClientInvoiceNo)  { toast.warn('Enter Client Invoice Number');   return; }
        if (!form.InvoiceDate)      { toast.warn('Select Invoice Date');           return; }
        if (!form.InvoiceMakingDate){ toast.warn('Select Invoice Making Date');    return; }
        if (!form.IsGstApplicable)  { toast.warn('Specify if GST is applicable');  return; }
        if (form.IsGstApplicable === 'Yes') {
            if (!form.ClientGST)  { toast.warn('Select Client GST Number');  return; }
            if (!form.CompanyGST) { toast.warn('Select Company GST Number'); return; }
        }
        if (!form.IsTCSApplicable)  { toast.warn('Specify if TCS is applicable'); return; }

        const taxStrings = buildTaxStrings(form);

        dispatch(submitTradingInvoice({
            PONumber:          form.PONumber,
            RANO:              form.RANO || null,
            CCCode:            form.CCCode,
            ClientInvoiceNo:   form.ClientInvoiceNo,
            InvoiceDate:       formatDateForAPI(form.InvoiceDate),
            InvoiceMakingDate: formatDateForAPI(form.InvoiceMakingDate),
            BasicValue:        basicValue,
            Total:             invoiceTotal,
            InvoiceRemarks:    form.InvoiceRemarks || null,
            InvoiceType:       form.InvoiceType,
            Clientcode:        form.Clientcode,
            SubClientcode:     form.SubClientcode,
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
            Cgstsdcaamt:       form.IsGstApplicable === 'Yes' && form.Statecheck ? totalCgst : 0,
            Sgstsdca:          form.Sgstsdca   || null,
            Sgstsdcaamt:       form.IsGstApplicable === 'Yes' && form.Statecheck ? totalSgst : 0,
            Igstsdca:          form.Igstsdca   || null,
            Igstsdcaamt:       form.IsGstApplicable === 'Yes' && !form.Statecheck ? totalIgst : 0,
            IsGstApplicable:   form.IsGstApplicable || null,
            IsTCSApplicable:   form.IsTCSApplicable || null,
            TCSDCA:            form.IsTCSApplicable === 'Yes' ? form.TCSDCA  : null,
            TCSSDCA:           form.IsTCSApplicable === 'Yes' ? form.TCSSDCA : null,
            TCSAmount:         form.IsTCSApplicable === 'Yes' ? (parseFloat(form.TCSAmount) || 0) : 0,
            // Per-item arrays as comma-separated strings
            ItemCodes:      tradeRows.map(r => r.itemCode).join(','),
            Quantitys:      tradeRows.map(r => r.qty).join(','),
            BasicSellings:  tradeRows.map(r => parseFloat(r.rate) || 0).join(','),
            SellingAmounts: tradeRows.map(r => rowAmount(r)).join(','),
            cgstper:        tradeRows.map(r => parseFloat(r.cgstPer) || 0).join(','),
            cgstamt:        tradeRows.map(r => rowCgstAmt(r)).join(','),
            sgstper:        tradeRows.map(r => parseFloat(r.sgstPer) || 0).join(','),
            sgstamt:        tradeRows.map(r => rowSgstAmt(r)).join(','),
            Igstper:        tradeRows.map(r => parseFloat(r.igstPer) || 0).join(','),
            Igstamt:        tradeRows.map(r => rowIgstAmt(r)).join(','),
            HSN:            tradeRows.map(r => r.hsn || '').join(','),
        }));
    };

    // ── Derived option lists ──────────────────────────────────────────────────
    const ccOptions         = costCenters.map(c => ({ value: c.CC_Code || c.CCCode, label: c.CC_Name || c.CCName }));
    const itemOptions       = tradeItems.map(i => ({ value: i.ItemCode || i.Itemcode, label: `${i.ItemCode || i.Itemcode} - ${i.ItemName || i.Itemname || ''}` }));
    const clientOptions     = clients.map(c => ({ value: c.ClientCode || c.Clientcode, label: c.ClientName || c.Clientname }));
    const subClientOptions  = subClients.map(c => ({
        value: c.SubClientCode?.split(',')[0]?.trim() || c.SubClientcode || c.SubClientCode,
        label: c.SubClientCode || c.SubClientcode,
    }));
    const poOptions         = poNumbers.map(p => ({ value: p.PONumber, label: p.PONumber }));
    const clientGSTOptions  = clientGSTNos.map(g => ({ value: g.TaxNoName, label: g.TaxNoName, taxId: g.TaxNoID }));
    const companyGSTOptions = companyGSTNos.map(g => ({ value: g.GSTNo || g.TaxNoName, label: g.TaxNoName }));

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
                                <ShoppingCart className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Client Trading Invoice'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Create trading invoice with per-item GST and HSN</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / Trading</p>
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
                            <div>
                                <Label required>Invoice Type</Label>
                                <div className="relative">
                                    <select value={form.InvoiceType} onChange={e => handleInvoiceTypeChange(e.target.value)}
                                        disabled={isBusy} className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">— Select Type —</option>
                                        {INVOICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                    <SelectIcon loading={false} />
                                </div>
                            </div>
                            <div>
                                <Label required>Cost Center</Label>
                                <div className="relative">
                                    <select value={form.CCCode} onChange={e => handleCCChange(e.target.value)}
                                        disabled={!form.InvoiceType || ccLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">{!form.InvoiceType ? 'Select type first' : ccLoading ? 'Loading…' : '— Select CC —'}</option>
                                        {ccOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    <SelectIcon loading={ccLoading} />
                                </div>
                            </div>
                            <div>
                                <Label>RANO</Label>
                                <input type="text" placeholder="Enter RANO reference…" value={form.RANO}
                                    onChange={e => setForm(p => ({ ...p, RANO: e.target.value }))}
                                    disabled={isBusy} className={inputCls} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Trading Items ─────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Package} title="Trading Items" subtitle="Select items and enter issue quantities, rate, HSN and GST percentages" />
                    <div className="p-6 md:p-8 space-y-6">

                        {/* Item selector + Add button */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
                            <div className="md:col-span-2">
                                <Label>Trade Item</Label>
                                <div className="relative">
                                    <select value={selItem} onChange={e => handleItemSelect(e.target.value)}
                                        disabled={!form.CCCode || itemsLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">{!form.CCCode ? 'Select CC first' : itemsLoading ? 'Loading…' : '— Select Item —'}</option>
                                        {itemOptions.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                                    </select>
                                    <SelectIcon loading={itemsLoading} />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <button type="button" onClick={handleAddToInvoice}
                                    disabled={!selItem || !tempDetails.length || tempSaveLoading || isBusy}
                                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors">
                                    {tempSaveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Add to Invoice
                                </button>
                            </div>
                        </div>

                        {/* Temp details table */}
                        {tempLoading && (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-5 w-5 text-indigo-500 animate-spin mr-2" />
                                <span className="text-sm text-gray-500">Loading temp issue details…</span>
                            </div>
                        )}

                        {!tempLoading && tempDetails.length > 0 && (
                            <div className="overflow-x-auto rounded-xl border border-indigo-200 dark:border-indigo-800 mb-2">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-indigo-50 dark:bg-indigo-900/30">
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item Code</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">MRR No</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">PO No</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Avail Qty</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Issue Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-indigo-100 dark:divide-indigo-800">
                                        {tempDetails.map((row, idx) => {
                                            const rowId = row.TempId ?? idx;
                                            return (
                                                <tr key={rowId} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                                                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.Tempdate || ''}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{row.TempItemcode || ''}</td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.Tempmrr || ''}</td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.Temppono || ''}</td>
                                                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{fmt(row.TempQuantity || 0)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <input type="number" min="0" max={parseFloat(row.TempQuantity || 0)} placeholder="0"
                                                            value={tempQtys[rowId] || ''}
                                                            onChange={e => setTempQtys(p => ({ ...p, [rowId]: e.target.value }))}
                                                            className="w-24 px-2 py-1 text-right rounded-lg border-2 border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-indigo-400" />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Invoice items grid — editable rate, HSN, GST% */}
                        {gridLoading && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                                <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" /> Loading items…
                            </div>
                        )}

                        {tradeRows.length > 0 && (
                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-sm min-w-[1200px]">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900/40">
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item Code</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item Name</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase">Specification</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase">Unit</th>
                                            <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase">Qty</th>
                                            <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase">Rate</th>
                                            <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase">Amount</th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase">HSN</th>
                                            <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase">CGST%</th>
                                            <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase">SGST%</th>
                                            <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase">IGST%</th>
                                            <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {tradeRows.map((row, idx) => (
                                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                                                <td className="px-3 py-3 text-gray-500">{idx + 1}</td>
                                                <td className="px-3 py-3 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">{row.itemCode}</td>
                                                <td className="px-3 py-3 text-gray-700 dark:text-gray-300">{row.itemName}</td>
                                                <td className="px-3 py-3 text-gray-500 dark:text-gray-400 text-xs">{row.spec || '—'}</td>
                                                <td className="px-3 py-3 text-gray-500">{row.unit}</td>
                                                <td className="px-3 py-3 text-right font-medium text-gray-700 dark:text-gray-200">
                                                    {row.qty}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <input type="number" min="0" step="0.01" placeholder="0.00" value={row.rate}
                                                        onChange={e => updateRow(row.id, 'rate', e.target.value)}
                                                        className={cellInput('w-24')} />
                                                </td>
                                                <td className="px-3 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                                                    {fmt(rowAmount(row))}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input type="text" placeholder="HSN…" value={row.hsn}
                                                        onChange={e => updateRow(row.id, 'hsn', e.target.value)}
                                                        className="w-20 px-2 py-1 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-indigo-400" />
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <input type="number" min="0" max="100" placeholder="0" value={row.cgstPer}
                                                        onChange={e => updateRow(row.id, 'cgstPer', e.target.value)}
                                                        className={cellInput('w-16')} />
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <input type="number" min="0" max="100" placeholder="0" value={row.sgstPer}
                                                        onChange={e => updateRow(row.id, 'sgstPer', e.target.value)}
                                                        className={cellInput('w-16')} />
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <input type="number" min="0" max="100" placeholder="0" value={row.igstPer}
                                                        onChange={e => updateRow(row.id, 'igstPer', e.target.value)}
                                                        className={cellInput('w-16')} />
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <button type="button" onClick={() => handleRemoveRow(row)} disabled={deleteLoading}
                                                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50">
                                                        {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-indigo-50/60 dark:bg-indigo-900/20">
                                            <td colSpan={7} className="px-3 py-3 text-right text-xs font-bold text-gray-600 uppercase">Basic Value Total</td>
                                            <td className="px-3 py-3 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400">{fmt(basicValue)}</td>
                                            <td colSpan={5} />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section 3: Client Details ────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Users} title="Client Details" subtitle="Client, sub-client and PO number" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <Label required>Client</Label>
                                <div className="relative">
                                    <select value={form.Clientcode} onChange={e => handleClientChange(e.target.value)}
                                        disabled={!form.CCCode || clientsLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">{!form.CCCode ? 'Select CC first' : clientsLoading ? 'Loading…' : '— Select Client —'}</option>
                                        {clientOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    <SelectIcon loading={clientsLoading} />
                                </div>
                            </div>
                            <div>
                                <Label required>Sub Client</Label>
                                <div className="relative">
                                    <select value={form.SubClientcode} onChange={e => handleSubClientChange(e.target.value)}
                                        disabled={!form.Clientcode || subCliLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">{!form.Clientcode ? 'Select client first' : subCliLoading ? 'Loading…' : '— Select Sub Client —'}</option>
                                        {subClientOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    <SelectIcon loading={subCliLoading} />
                                </div>
                            </div>
                            <div>
                                <Label required>PO Number</Label>
                                <div className="relative">
                                    <select value={form.PONumber} onChange={e => setForm(p => ({ ...p, PONumber: e.target.value }))}
                                        disabled={!form.SubClientcode || poLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                        <option value="">{!form.SubClientcode ? 'Select sub-client first' : poLoading ? 'Loading…' : '— Select PO —'}</option>
                                        {poOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                    <SelectIcon loading={poLoading} />
                                </div>
                            </div>
                            <div>
                                <Label required>Client Invoice Number</Label>
                                <input type="text" placeholder="Enter invoice number…" value={form.ClientInvoiceNo}
                                    onChange={e => setForm(p => ({ ...p, ClientInvoiceNo: e.target.value }))}
                                    disabled={isBusy} className={inputCls} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 4: Invoice Dates ─────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={IndianRupee} title="Invoice Dates" subtitle="Invoice date and making date" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label required>Invoice Date</Label>
                                <CustomDatePicker value={form.InvoiceDate} onChange={val => setForm(p => ({ ...p, InvoiceDate: val }))}
                                    placeholder="Select invoice date" disabled={isBusy} />
                            </div>
                            <div>
                                <Label required>Invoice Making Date</Label>
                                <CustomDatePicker value={form.InvoiceMakingDate} onChange={val => setForm(p => ({ ...p, InvoiceMakingDate: val }))}
                                    placeholder="Select making date" disabled={isBusy} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 5: GST Configuration ────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={ShieldCheck} title="GST Configuration" subtitle="GST applicability and DCA codes — amounts auto-computed from item GST percentages" />
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
                                            <select value={form.ClientGST}
                                                onChange={e => {
                                                    const opt = clientGSTOptions.find(g => g.value === e.target.value);
                                                    setForm(p => ({ ...p, ClientGST: e.target.value, TaxId: opt?.taxId || 0 }));
                                                }}
                                                disabled={gstLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                                <option value="">{gstLoading ? 'Loading…' : '— Select Client GST —'}</option>
                                                {clientGSTOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                            </select>
                                            <SelectIcon loading={gstLoading} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label required>Company GST Number</Label>
                                        <div className="relative">
                                            <select value={form.CompanyGST}
                                                onChange={e => setForm(p => ({ ...p, CompanyGST: e.target.value }))}
                                                disabled={gstLoading || isBusy} className={`${inputCls} appearance-none pr-10`}>
                                                <option value="">{gstLoading ? 'Loading…' : '— Select Company GST —'}</option>
                                                {companyGSTOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
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

                                {/* DCA codes */}
                                {form.Statecheck && gstDetected && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label>CGST DCA Code</Label>
                                            <input type="text" placeholder="CGST DCA…" value={form.CgstDca}
                                                onChange={e => setForm(p => ({ ...p, CgstDca: e.target.value }))}
                                                disabled={isBusy} className={inputCls} />
                                            <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                                Total CGST (from items): ₹ {fmt(totalCgst)}
                                            </p>
                                        </div>
                                        <div>
                                            <Label>SGST DCA Code</Label>
                                            <input type="text" placeholder="SGST DCA…" value={form.SgstDca}
                                                onChange={e => setForm(p => ({ ...p, SgstDca: e.target.value }))}
                                                disabled={isBusy} className={inputCls} />
                                            <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                                Total SGST (from items): ₹ {fmt(totalSgst)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {!form.Statecheck && gstDetected && (
                                    <div className="max-w-sm">
                                        <Label>IGST DCA Code</Label>
                                        <input type="text" placeholder="IGST DCA…" value={form.IgstDca}
                                            onChange={e => setForm(p => ({ ...p, IgstDca: e.target.value }))}
                                            disabled={isBusy} className={inputCls} />
                                        <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                            Total IGST (from items): ₹ {fmt(totalIgst)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section 6: TCS Configuration ────────────────────────── */}
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

                {/* ── Section 7: Remarks ───────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={ReceiptText} title="Remarks" subtitle="Additional notes for this invoice" />
                    <div className="p-6 md:p-8">
                        <textarea rows={3} placeholder="Enter remarks or additional notes…"
                            value={form.InvoiceRemarks}
                            onChange={e => setForm(p => ({ ...p, InvoiceRemarks: e.target.value }))}
                            disabled={isBusy} className={`${inputCls} resize-none`} />
                    </div>
                </div>

                {/* ── Section 8: Summary ───────────────────────────────────── */}
                {tradeRows.length > 0 && form.CCCode && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={CheckCircle} title="Invoice Summary" subtitle="Review before submission" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Invoice Type</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{form.InvoiceType || '—'}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Items</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{tradeRows.length}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Basic Value</p>
                                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">₹ {fmt(basicValue)}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">GST / TCS</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                        {form.IsGstApplicable === 'Yes' ? (form.Statecheck ? 'CGST+SGST' : 'IGST') : 'Nil'}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 max-w-sm ml-auto">
                                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    <span>Basic Value</span><span className="font-semibold">₹ {fmt(basicValue)}</span>
                                </div>
                                {form.IsGstApplicable === 'Yes' && form.Statecheck && (
                                    <>
                                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            <span>CGST</span><span>₹ {fmt(totalCgst)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            <span>SGST</span><span>₹ {fmt(totalSgst)}</span>
                                        </div>
                                    </>
                                )}
                                {form.IsGstApplicable === 'Yes' && !form.Statecheck && (
                                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        <span>IGST</span><span>₹ {fmt(totalIgst)}</span>
                                    </div>
                                )}
                                {form.IsTCSApplicable === 'Yes' && (
                                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        <span>TCS</span><span>₹ {fmt(form.TCSAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
                                    <span className="text-base font-bold text-gray-800 dark:text-gray-100">Total Invoice Value</span>
                                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹ {fmt(invoiceTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Action Buttons ───────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pb-8">
                    <button type="button" onClick={handleReset} disabled={isBusy}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
                        <RotateCcw className="h-4 w-4" /> Reset
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={isBusy}
                        className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:via-purple-700 hover:to-violet-700 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        {saveLoading
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                            : <><Send className="h-4 w-4" /> Submit Invoice</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ClientTradingInvoiceCreation;
