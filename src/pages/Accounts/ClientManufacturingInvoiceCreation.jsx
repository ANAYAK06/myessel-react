import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomDatePicker from '../../components/CustomDatePicker';

import {
    fetchManfCostCenters,
    fetchManufacturingItems,
    addManufactureItemcode,
    fetchTradeItemTempDetails,
    addTempManItemsIssue,
    removeTempManItem,
    fetchTradeItems,
    fetchManClients,
    fetchManSubClients,
    fetchManSubClientPO,
    addManufactureItems,
    fetchManClientGSTNos,
    fetchManCompanyGSTNos,
    fetchManTCSDCASDCAS,
    submitManfInvoice,
    clearManfSaveResult,
    clearManfNewItemResult,
    clearManfTempDetails,
    resetManfInvoice,
    selectManfCostCenters,
    selectManfItems,
    selectTradeItems,
    selectTradeItemTempDetails,
    selectManfClients,
    selectManfSubClients,
    selectManfPONumbers,
    selectManfClientGSTNos,
    selectManfCompanyGSTNos,
    selectManfTCSDCASDCAS,
    selectManfSaveResult,
    selectManfNewItemResult,
    selectManfTempItemResult,
    selectManfCostCentersLoading,
    selectManfItemsLoading,
    selectTradeItemsLoading,
    selectTradeTempLoading,
    selectManfClientsLoading,
    selectManfSubClientsLoading,
    selectManfPONumbersLoading,
    selectManfGSTLoading,
    selectManfSaveLoading,
    selectManfNewItemLoading,
    selectManfAddItemLoading,
    selectManfTempItemLoading,
    selectManfDeleteItemLoading,
    selectManfSaveError,
    selectManfNewItemError,
    selectManfTempItemError,
} from '../../slices/accountsSlice/clientManufacturingInvoiceSlice';

import {
    ReceiptText, Users, IndianRupee,
    ShieldCheck, Percent, CheckCircle,
    Loader2, ChevronDown, RotateCcw, Send, Navigation,
    Package, Boxes, Plus, Trash2, X, Factory,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const INVOICE_TYPES = [
    { value: 'Service', label: 'Service Invoice' },
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

// ── Initial states ─────────────────────────────────────────────────────────────
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

const INITIAL_NEW_ITEM = {
    NewItemcode:  '',
    NewItemname:  '',
    NewItemunit:  '',
    NewItemspecs: '',
};

// ── Component ─────────────────────────────────────────────────────────────────
const ClientManufacturingInvoiceCreation = ({ menuData }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(s => s.auth);
    const roleId = userData?.roleId  || userData?.RID  || 0;
    const userId = userData?.userId  || userData?.UID  || userData?.employeeId || '';

    // Redux state
    const costCenters         = useSelector(selectManfCostCenters);
    const manfItems           = useSelector(selectManfItems);
    const tradeItems          = useSelector(selectTradeItems);
    const tradeItemTempDetails= useSelector(selectTradeItemTempDetails);
    const clients             = useSelector(selectManfClients);
    const subClients          = useSelector(selectManfSubClients);
    const poNumbers           = useSelector(selectManfPONumbers);
    const clientGSTNos        = useSelector(selectManfClientGSTNos);
    const companyGSTNos       = useSelector(selectManfCompanyGSTNos);
    const tcsDCASDCAS         = useSelector(selectManfTCSDCASDCAS);
    const saveResult          = useSelector(selectManfSaveResult);
    const newItemResult       = useSelector(selectManfNewItemResult);
    const tempItemResult      = useSelector(selectManfTempItemResult);

    const ccLoading        = useSelector(selectManfCostCentersLoading);
    const manfItemsLoading = useSelector(selectManfItemsLoading);
    const tradeItemsLoading= useSelector(selectTradeItemsLoading);
    const tradeTempLoading = useSelector(selectTradeTempLoading);
    const clientsLoading   = useSelector(selectManfClientsLoading);
    const subCliLoading    = useSelector(selectManfSubClientsLoading);
    const poLoading        = useSelector(selectManfPONumbersLoading);
    const gstLoading       = useSelector(selectManfGSTLoading);
    const saveLoading      = useSelector(selectManfSaveLoading);
    const newItemLoading   = useSelector(selectManfNewItemLoading);
    const addItemLoading   = useSelector(selectManfAddItemLoading);
    const tempItemLoading  = useSelector(selectManfTempItemLoading);
    const deleteItemLoading= useSelector(selectManfDeleteItemLoading);

    const saveError     = useSelector(selectManfSaveError);
    const newItemError  = useSelector(selectManfNewItemError);
    const tempItemError = useSelector(selectManfTempItemError);

    // Local state
    const [form, setForm]           = useState(INITIAL_FORM);
    const [manfRows, setManfRows]   = useState([]); // { id, itemCode, itemName, unit, qty, rate }
    const [tradeRows, setTradeRows] = useState([]); // { id, itemCode, qty, fromTable } — sub-items, no monetary value
    const [showNewItemModal, setShowNewItemModal] = useState(false);
    const [newItemForm, setNewItemForm]           = useState(INITIAL_NEW_ITEM);

    // Manufacturing item add form
    const [selManfItem, setSelManfItem]   = useState('');
    const [manfQty, setManfQty]           = useState('');
    const [manfRate, setManfRate]         = useState('');

    // Trade item temp form
    const [selTradeItem, setSelTradeItem] = useState('');
    const [tempQtys, setTempQtys]         = useState({}); // { rowId: qty }

    // Derived BasicValue = sum of manfRows qty × rate
    const basicValue = manfRows.reduce((sum, r) => sum + ((parseFloat(r.qty) || 0) * (parseFloat(r.rate) || 0)), 0);

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchManTCSDCASDCAS());
        dispatch(fetchManCompanyGSTNos('GST'));
        return () => { dispatch(resetManfInvoice()); };
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
                toast.success('Manufacturing invoice submitted successfully!');
                dispatch(clearManfSaveResult());
                handleReset();
            } else {
                toast.error(msg || 'Save failed');
                dispatch(clearManfSaveResult());
            }
        }
    }, [saveResult, dispatch]);

    useEffect(() => { if (saveError) toast.error(saveError); }, [saveError]);

    // New item result
    useEffect(() => {
        if (newItemResult) {
            const msg = typeof newItemResult === 'string' ? newItemResult : newItemResult?.Message || '';
            toast.success(msg || 'New item saved successfully!');
            dispatch(clearManfNewItemResult());
            setShowNewItemModal(false);
            setNewItemForm(INITIAL_NEW_ITEM);
            if (form.CCCode) dispatch(fetchManufacturingItems(form.CCCode));
        }
    }, [newItemResult, dispatch]);

    useEffect(() => { if (newItemError) toast.error(newItemError); }, [newItemError]);

    // Temp item result — after adding temp trade item, reset trade item selector
    useEffect(() => {
        if (tempItemResult) {
            const msg = typeof tempItemResult === 'string' ? tempItemResult : tempItemResult?.Message || '';
            if (msg && (msg.toLowerCase().includes('success') || msg.toLowerCase().includes('saved') || msg === 'Submited')) {
                // The item rows were already added via handleAddTradeItem; clear temp state
            }
        }
    }, [tempItemResult]);

    useEffect(() => { if (tempItemError) toast.error(tempItemError); }, [tempItemError]);

    // ── Cascade handlers ──────────────────────────────────────────────────────
    const handleInvoiceTypeChange = (val) => {
        setForm(prev => ({ ...prev, InvoiceType: val, CCCode: '', Clientcode: '', ClientName: '', SubClientcode: '', SubClientName: '', PONumber: '' }));
        setManfRows([]);
        setTradeRows([]);
        setSelManfItem('');
        setSelTradeItem('');
        if (val) dispatch(fetchManfCostCenters(val));
    };

    const handleCCChange = (ccCode) => {
        setForm(prev => ({ ...prev, CCCode: ccCode, Clientcode: '', ClientName: '', SubClientcode: '', SubClientName: '', PONumber: '' }));
        setManfRows([]);
        setTradeRows([]);
        setSelManfItem('');
        setSelTradeItem('');
        if (ccCode) {
            dispatch(fetchManufacturingItems(ccCode));
            dispatch(fetchTradeItems(ccCode));
            dispatch(fetchManClients(ccCode));
        }
    };

    const handleClientChange = (clientcode, clientName) => {
        setForm(prev => ({ ...prev, Clientcode: clientcode, ClientName: clientName, SubClientcode: '', SubClientName: '', PONumber: '' }));
        if (clientcode && form.CCCode) {
            dispatch(fetchManSubClients({ ccCode: form.CCCode, clientcode }));
        }
    };

    const handleSubClientChange = (subClientcode, subClientName) => {
        setForm(prev => ({ ...prev, SubClientcode: subClientcode, SubClientName: subClientName, PONumber: '' }));
        if (subClientcode && form.CCCode && form.Clientcode) {
            dispatch(fetchManSubClientPO({ subClient: subClientcode, ccCode: form.CCCode, clientcode: form.Clientcode }));
            dispatch(fetchManClientGSTNos({ taxtype: 'SubClient', taxfor: subClientcode }));
        }
    };

    // ── Item handlers ─────────────────────────────────────────────────────────
    const handleAddManfItem = () => {
        if (!selManfItem) { toast.warn('Select a manufacturing item'); return; }
        if (!manfQty || parseFloat(manfQty) <= 0) { toast.warn('Enter a valid quantity'); return; }
        if (!manfRate || parseFloat(manfRate) <= 0) { toast.warn('Enter a valid rate'); return; }

        const itemObj = manfItems.find(i => (i.ItemCode || i.Itemcode) === selManfItem);
        const itemName = itemObj?.ItemName || itemObj?.Itemname || selManfItem;
        const unit     = itemObj?.Unit || itemObj?.ItemUnit || '';

        const newRow = {
            id:       Date.now(),
            itemCode: selManfItem,
            itemName,
            unit,
            qty:      parseFloat(manfQty),
            rate:     parseFloat(manfRate),
        };

        dispatch(addManufactureItems({ ItemCode: selManfItem, CCCode: form.CCCode, Createdby: String(userId) }))
            .unwrap()
            .then(() => {
                setManfRows(prev => [...prev, newRow]);
                setSelManfItem('');
                setManfQty('');
                setManfRate('');
            })
            .catch(err => toast.error(err || 'Failed to add item'));
    };

    const handleRemoveManfRow = (id) => {
        setManfRows(prev => prev.filter(r => r.id !== id));
    };

    const handleTradeItemSelect = (itemcode) => {
        setSelTradeItem(itemcode);
        setTempQtys({});
        if (itemcode && form.CCCode) {
            dispatch(fetchTradeItemTempDetails({ itemcode, ccCode: form.CCCode }));
        } else {
            dispatch(clearManfTempDetails());
        }
    };

    const handleAddTradeItem = () => {
        if (!selTradeItem) { toast.warn('Select a trade item'); return; }
        if (!tradeItemTempDetails.length) { toast.warn('No temp details available for this item'); return; }

        const rowsWithQty = tradeItemTempDetails.filter(r => parseFloat(tempQtys[r.TempId] || 0) > 0);
        if (!rowsWithQty.length) { toast.warn('Enter issue quantity for at least one row'); return; }

        const rowids     = tradeItemTempDetails.map(r => r.TempId || '').join(',');
        const itemCodes  = tradeItemTempDetails.map(r => r.TempItemcode || selTradeItem).join(',');
        const qtys       = tradeItemTempDetails.map(r => tempQtys[r.TempId] || '0').join(',');
        const tblnames   = tradeItemTempDetails.map(r => r.Tblname || '').join(',');

        dispatch(addTempManItemsIssue({
            Trowids:       rowids,
            TItemCodes:    itemCodes,
            TNewQtys:      qtys,
            Ttblnames:     tblnames,
            TCCCode:       form.CCCode,
            TSingleItemcode: selTradeItem,
        }))
            .unwrap()
            .then(() => {
                // Add only rows where user entered a qty
                const newRows = rowsWithQty.map(r => {
                    const qty = parseFloat(tempQtys[r.TempId] || 0);
                    return {
                        id:       Date.now() + Math.random(),
                        itemCode: r.TempItemcode || selTradeItem,
                        qty,
                        fromTable: r.Tblname || '',
                    };
                });
                setTradeRows(prev => [...prev, ...newRows]);
                setSelTradeItem('');
                setTempQtys({});
                dispatch(clearManfTempDetails());
            })
            .catch(err => toast.error(err || 'Failed to add trade item'));
    };

    const handleRemoveTradeRow = (row) => {
        dispatch(removeTempManItem({
            ItemCode:   row.itemCode,
            CCCode:     form.CCCode,
            Ofromtable: row.fromTable,
        }))
            .unwrap()
            .then(() => setTradeRows(prev => prev.filter(r => r.id !== row.id)))
            .catch(err => toast.error(err || 'Failed to remove item'));
    };

    // ── New Item Modal ─────────────────────────────────────────────────────────
    const handleSaveNewItem = () => {
        if (!newItemForm.NewItemcode) { toast.warn('Enter item code'); return; }
        if (!newItemForm.NewItemname) { toast.warn('Enter item name'); return; }
        dispatch(addManufactureItemcode({
            ...newItemForm,
            Createdby: String(userId),
        }));
    };

    // ── Reset ─────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setForm(prev => ({
            ...INITIAL_FORM,
            TCSDCA:  tcsDCASDCAS?.TCSDCA  || '',
            TCSSDCA: tcsDCASDCAS?.TCSSDCA || '',
        }));
        setManfRows([]);
        setTradeRows([]);
        setSelManfItem('');
        setSelTradeItem('');
        setManfQty('');
        setManfRate('');
        setTempQtys({});
        dispatch(fetchManTCSDCASDCAS());
        dispatch(fetchManCompanyGSTNos('GST'));
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!form.InvoiceType)      { toast.warn('Select an Invoice Type');       return; }
        if (!form.CCCode)           { toast.warn('Select a Cost Center');         return; }
        if (manfRows.length === 0 && tradeRows.length === 0) { toast.warn('Add at least one item'); return; }
        if (!form.Clientcode)       { toast.warn('Select a Client');              return; }
        if (!form.SubClientcode)    { toast.warn('Select a Sub-Client');          return; }
        if (!form.PONumber)         { toast.warn('Select a PO Number');           return; }
        if (!form.ClientInvoiceNo)  { toast.warn('Enter Client Invoice Number');  return; }
        if (!form.InvoiceDate)      { toast.warn('Select Invoice Date');          return; }
        if (!form.InvoiceMakingDate){ toast.warn('Select Invoice Making Date');   return; }
        if (!form.IsGstApplicable)  { toast.warn('Specify if GST is applicable'); return; }
        if (form.IsGstApplicable === 'Yes') {
            if (!form.ClientGST)    { toast.warn('Select Client GST Number');     return; }
            if (!form.CompanyGST)   { toast.warn('Select Company GST Number');    return; }
        }
        if (!form.IsTCSApplicable)  { toast.warn('Specify if TCS is applicable'); return; }

        const allRows = [
            ...manfRows.map(r => ({
                ItemCode:     r.itemCode,
                Qty:          r.qty,
                BasicSelling: r.rate,
                SellingAmt:   (parseFloat(r.qty) || 0) * (parseFloat(r.rate) || 0),
            })),
            ...tradeRows.map(r => ({
                ItemCode:     r.itemCode,
                Qty:          r.qty,
                BasicSelling: 0,
                SellingAmt:   0,
            })),
        ];

        const ItemCodes     = allRows.map(r => r.ItemCode).join(',');
        const Quantitys     = allRows.map(r => r.Qty).join(',');
        const BasicSellings = allRows.map(r => r.BasicSelling).join(',');
        const SellingAmounts= allRows.map(r => r.SellingAmt).join(',');

        const taxStrings = buildTaxStrings(form);
        const total      = calcTotal(basicValue, form);

        dispatch(submitManfInvoice({
            PONumber:          form.PONumber,
            RANO:              form.RANO || null,
            CCCode:            form.CCCode,
            ClientInvoiceNo:   form.ClientInvoiceNo,
            InvoiceDate:       formatDateForAPI(form.InvoiceDate),
            InvoiceMakingDate: formatDateForAPI(form.InvoiceMakingDate),
            BasicValue:        basicValue,
            Total:             total,
            InvoiceRemarks:    form.InvoiceRemarks || null,
            InvoiceType:       form.InvoiceType,
            Clientcode:        form.Clientcode,
            SubClientcode:     form.SubClientcode,
            CreatedByM:        String(userId),
            Roleid:            roleId,
            ItemCodes,
            Quantitys,
            BasicSellings,
            SellingAmounts,
            Taxtypes:          taxStrings.Taxtypes,
            Taxdcas:           taxStrings.Taxdcas,
            Taxamounts:        taxStrings.Taxamounts,
            TaxId:             form.TaxId || 0,
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
    const ccOptions      = costCenters.map(c => ({ value: c.CC_Code || c.CCCode, label: c.CC_Name || c.CCName }));
    const manfItemOpts   = manfItems.map(i => ({ value: i.ItemCode || i.Itemcode, label: `${i.ItemCode || i.Itemcode} - ${i.ItemName || i.Itemname || ''}` }));
    const tradeItemOpts  = tradeItems.map(i => ({ value: i.ItemCode || i.Itemcode, label: `${i.ItemCode || i.Itemcode} - ${i.ItemName || i.Itemname || ''}` }));
    const clientOptions  = clients.map(c => ({ value: c.ClientCode || c.Clientcode, label: c.ClientName || c.Clientname }));
    const subClientOptions = subClients.map(c => ({
        value: c.SubClientCode?.split(',')[0]?.trim() || c.SubClientcode || c.SubClientCode,
        label: c.SubClientCode || c.SubClientcode,
    }));
    const poOptions        = poNumbers.map(p => ({ value: p.PONumber, label: p.PONumber }));
    const clientGSTOptions = clientGSTNos.map(g => ({ value: g.TaxNoName, label: g.TaxNoName, taxId: g.TaxNoID }));
    const companyGSTOptions= companyGSTNos.map(g => ({ value: g.GSTNo || g.TaxNoName, label: g.TaxNoName }));

    const total   = calcTotal(basicValue, form);
    const isBusy  = saveLoading;
    const gstDetected = form.ClientGST && form.CompanyGST;
    const totalItems  = manfRows.length + tradeRows.length;

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
                                <Factory className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">Accounts Module</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    {menuData?.name || 'Client Manufacturing Invoice'}
                                </h1>
                                <p className="text-indigo-200 text-sm mt-0.5">Create manufacturing invoice with item details and GST</p>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-indigo-200">
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider">Module</p>
                                <p className="text-sm font-bold text-white">Accounts / Manufacturing</p>
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

                {/* ── Section 2: Items ─────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Boxes} title="Invoice Items" subtitle="Add manufactured and trading/stock items" />
                    <div className="p-6 md:p-8 space-y-8">

                        {/* ── Manufacturing Items ── */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Factory className="h-4 w-4 text-indigo-500" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Manufacturing Items</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowNewItemModal(true)}
                                    disabled={!form.CCCode || isBusy}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    <Plus className="h-3.5 w-3.5" /> New Item Master
                                </button>
                            </div>

                            {/* Add manufacturing item row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                <div className="md:col-span-2">
                                    <Label>Item</Label>
                                    <div className="relative">
                                        <select
                                            value={selManfItem}
                                            onChange={e => setSelManfItem(e.target.value)}
                                            disabled={!form.CCCode || manfItemsLoading || isBusy}
                                            className={`${inputCls} appearance-none pr-10`}
                                        >
                                            <option value="">{!form.CCCode ? 'Select CC first' : manfItemsLoading ? 'Loading…' : '— Select Item —'}</option>
                                            {manfItemOpts.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                                        </select>
                                        <SelectIcon loading={manfItemsLoading} />
                                    </div>
                                </div>
                                <div>
                                    <Label>Qty</Label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={manfQty}
                                        onChange={e => setManfQty(e.target.value)}
                                        disabled={!selManfItem || isBusy}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <Label>Rate</Label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0.00"
                                            value={manfRate}
                                            onChange={e => setManfRate(e.target.value)}
                                            disabled={!selManfItem || isBusy}
                                            className={inputCls}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddManfItem}
                                            disabled={!selManfItem || addItemLoading || isBusy}
                                            className="flex-shrink-0 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-1 disabled:opacity-50 transition-colors"
                                        >
                                            {addItemLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Manufacturing items table */}
                            {manfRows.length > 0 && (
                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/40">
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Item Code</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Item Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Unit</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Rate</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {manfRows.map((row, idx) => (
                                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{row.itemCode}</td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.itemName}</td>
                                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.unit}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={row.qty}
                                                            onChange={e => setManfRows(prev => prev.map(r => r.id === row.id ? { ...r, qty: parseFloat(e.target.value) || 0 } : r))}
                                                            className="w-20 px-2 py-1 text-right rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-indigo-400"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={row.rate}
                                                            onChange={e => setManfRows(prev => prev.map(r => r.id === row.id ? { ...r, rate: parseFloat(e.target.value) || 0 } : r))}
                                                            className="w-24 px-2 py-1 text-right rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-indigo-400"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                                                        {fmt((parseFloat(row.qty) || 0) * (parseFloat(row.rate) || 0))}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveManfRow(row.id)}
                                                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-indigo-50/60 dark:bg-indigo-900/20">
                                                <td colSpan={6} className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Manufacturing Total</td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400">{fmt(basicValue)}</td>
                                                <td />
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* ── Trading / Stock Items ── */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Trading / Stock Items</span>
                            </div>

                            {/* Trade item selector */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800">
                                <div className="md:col-span-2">
                                    <Label>Trade Item</Label>
                                    <div className="relative">
                                        <select
                                            value={selTradeItem}
                                            onChange={e => handleTradeItemSelect(e.target.value)}
                                            disabled={!form.CCCode || tradeItemsLoading || isBusy}
                                            className={`${inputCls} appearance-none pr-10`}
                                        >
                                            <option value="">{!form.CCCode ? 'Select CC first' : tradeItemsLoading ? 'Loading…' : '— Select Trade Item —'}</option>
                                            {tradeItemOpts.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                                        </select>
                                        <SelectIcon loading={tradeItemsLoading} />
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={handleAddTradeItem}
                                        disabled={!selTradeItem || !tradeItemTempDetails.length || tempItemLoading || isBusy}
                                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
                                    >
                                        {tempItemLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                        Add to Invoice
                                    </button>
                                </div>
                            </div>

                            {/* Temp details table */}
                            {tradeTempLoading && (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="h-5 w-5 text-purple-500 animate-spin mr-2" />
                                    <span className="text-sm text-gray-500">Loading temp issue details…</span>
                                </div>
                            )}

                            {!tradeTempLoading && tradeItemTempDetails.length > 0 && (
                                <div className="overflow-x-auto rounded-xl border border-purple-200 dark:border-purple-800 mb-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-purple-50 dark:bg-purple-900/30">
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Item Code</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">MRR No</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">PO No</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Avail Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Issue Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-100 dark:divide-purple-800">
                                            {tradeItemTempDetails.map((row, idx) => {
                                                const rowId = row.TempId ?? idx;
                                                return (
                                                    <tr key={rowId} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
                                                        <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.Tempdate || ''}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{row.TempItemcode || ''}</td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.Tempmrr || ''}</td>
                                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{row.Temppono || ''}</td>
                                                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{fmt(row.TempQuantity || 0)}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={parseFloat(row.TempQuantity || 0)}
                                                                placeholder="0"
                                                                value={tempQtys[rowId] || ''}
                                                                onChange={e => setTempQtys(prev => ({ ...prev, [rowId]: e.target.value }))}
                                                                className="w-24 px-2 py-1 text-right rounded-lg border-2 border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-purple-400"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Stock items issued (sub-items of the manufactured item above) */}
                            {tradeRows.length > 0 && (
                                <div className="overflow-x-auto rounded-xl border border-purple-200 dark:border-purple-800">
                                    <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 border-b border-purple-200 dark:border-purple-800">
                                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Materials Issued for Manufacturing</span>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-purple-50/60 dark:bg-purple-900/20">
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Item Code</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Issued Qty</th>
                                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-100 dark:divide-purple-800">
                                            {tradeRows.map((row, idx) => (
                                                <tr key={row.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-900/10 transition-colors">
                                                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{row.itemCode}</td>
                                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200 font-semibold">{fmt(row.qty)}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTradeRow(row)}
                                                            disabled={deleteItemLoading}
                                                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-50"
                                                        >
                                                            {deleteItemLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* ── Basic Value summary ── */}
                        {(manfRows.length > 0 || tradeRows.length > 0) && (
                            <div className="flex justify-end">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-6 py-3 border border-indigo-200 dark:border-indigo-800">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Basic Value (Manufacturing Total) </span>
                                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 ml-3">₹ {fmt(basicValue)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section 3: Client & PO ───────────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={Users} title="Client & PO Selection" subtitle="Select client, sub-client and purchase order" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <option value="">{!form.CCCode ? 'Select CC first' : clientsLoading ? 'Loading…' : '— Select Client —'}</option>
                                        {clientOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    <SelectIcon loading={clientsLoading} />
                                </div>
                            </div>
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
                                        <option value="">{!form.Clientcode ? 'Select client first' : subCliLoading ? 'Loading…' : '— Select Sub Client —'}</option>
                                        {subClientOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    <SelectIcon loading={subCliLoading} />
                                </div>
                            </div>
                            <div>
                                <Label required>PO Number</Label>
                                <div className="relative">
                                    <select
                                        value={form.PONumber}
                                        onChange={e => setForm(p => ({ ...p, PONumber: e.target.value }))}
                                        disabled={!form.SubClientcode || poLoading || isBusy}
                                        className={`${inputCls} appearance-none pr-10`}
                                    >
                                        <option value="">{!form.SubClientcode ? 'Select sub client first' : poLoading ? 'Loading…' : '— Select PO —'}</option>
                                        {poOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                    <SelectIcon loading={poLoading} />
                                </div>
                            </div>
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

                {/* ── Section 4: Invoice Details ───────────────────────────── */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader icon={IndianRupee} title="Invoice Details" subtitle="Invoice dates" />
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* ── Section 5: GST Configuration ────────────────────────── */}
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
                                                {clientGSTOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
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

                                {form.Statecheck && gstDetected && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label>CGST Amount</Label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="0.00"
                                                value={form.Cgstsdcaamt}
                                                onChange={e => setForm(p => ({ ...p, Cgstsdcaamt: e.target.value }))}
                                                disabled={isBusy}
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <Label>SGST Amount</Label>
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="0.00"
                                                value={form.Sgstsdcaamt}
                                                onChange={e => setForm(p => ({ ...p, Sgstsdcaamt: e.target.value }))}
                                                disabled={isBusy}
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!form.Statecheck && gstDetected && (
                                    <div className="max-w-sm">
                                        <Label>IGST Amount</Label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="0.00"
                                            value={form.Igstsdcaamt}
                                            onChange={e => setForm(p => ({ ...p, Igstsdcaamt: e.target.value }))}
                                            disabled={isBusy}
                                            className={inputCls}
                                        />
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
                                    <input
                                        type="text"
                                        value={form.TCSDCA}
                                        onChange={e => setForm(p => ({ ...p, TCSDCA: e.target.value }))}
                                        disabled={isBusy}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <Label>TCS SDCA</Label>
                                    <input
                                        type="text"
                                        value={form.TCSSDCA}
                                        onChange={e => setForm(p => ({ ...p, TCSSDCA: e.target.value }))}
                                        disabled={isBusy}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <Label>TCS Amount</Label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0.00"
                                        value={form.TCSAmount}
                                        onChange={e => setForm(p => ({ ...p, TCSAmount: e.target.value }))}
                                        disabled={isBusy}
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Section 7: Remarks ───────────────────────────────────── */}
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

                {/* ── Section 8: Summary ───────────────────────────────────── */}
                {form.CCCode && form.Clientcode && totalItems > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <CardHeader icon={CheckCircle} title="Invoice Summary" subtitle="Review before submission" />
                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Invoice Type</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{form.InvoiceType || '—'}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Items</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{totalItems}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Basic Value</p>
                                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">₹ {fmt(basicValue)}</p>
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

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    <span>Basic Value</span>
                                    <span className="font-semibold">₹ {fmt(basicValue)}</span>
                                </div>
                                {form.IsGstApplicable === 'Yes' && form.Statecheck && (
                                    <>
                                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            <span>CGST</span>
                                            <span>₹ {fmt(form.Cgstsdcaamt)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            <span>SGST</span>
                                            <span>₹ {fmt(form.Sgstsdcaamt)}</span>
                                        </div>
                                    </>
                                )}
                                {form.IsGstApplicable === 'Yes' && !form.Statecheck && (
                                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        <span>IGST</span>
                                        <span>₹ {fmt(form.Igstsdcaamt)}</span>
                                    </div>
                                )}
                                {form.IsTCSApplicable === 'Yes' && (
                                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        <span>TCS</span>
                                        <span>₹ {fmt(form.TCSAmount)}</span>
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

            {/* ── New Item Modal ────────────────────────────────────────────── */}
            {showNewItemModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Factory className="h-4 w-4 text-indigo-500" />
                                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">New Manufacturing Item</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setShowNewItemModal(false); setNewItemForm(INITIAL_NEW_ITEM); }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <Label required>Item Code</Label>
                                <input
                                    type="text"
                                    placeholder="Enter item code…"
                                    value={newItemForm.NewItemcode}
                                    onChange={e => setNewItemForm(p => ({ ...p, NewItemcode: e.target.value }))}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <Label required>Item Name</Label>
                                <input
                                    type="text"
                                    placeholder="Enter item name…"
                                    value={newItemForm.NewItemname}
                                    onChange={e => setNewItemForm(p => ({ ...p, NewItemname: e.target.value }))}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <Label>Unit</Label>
                                <input
                                    type="text"
                                    placeholder="e.g. Nos, Kg, Mtr…"
                                    value={newItemForm.NewItemunit}
                                    onChange={e => setNewItemForm(p => ({ ...p, NewItemunit: e.target.value }))}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <Label>Specifications</Label>
                                <textarea
                                    rows={2}
                                    placeholder="Item specifications…"
                                    value={newItemForm.NewItemspecs}
                                    onChange={e => setNewItemForm(p => ({ ...p, NewItemspecs: e.target.value }))}
                                    className={`${inputCls} resize-none`}
                                />
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => { setShowNewItemModal(false); setNewItemForm(INITIAL_NEW_ITEM); }}
                                className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveNewItem}
                                disabled={newItemLoading}
                                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                            >
                                {newItemLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Save Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientManufacturingInvoiceCreation;
